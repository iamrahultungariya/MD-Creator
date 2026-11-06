# Gemini Models Architecture & Policy

> **Policy Directive**: All legacy Gemini 2.x models (`gemini-2.0-flash`, `gemini-2.5-flash`, etc.) have been completely deprecated and removed from MD Creator. The application exclusively supports the **Gemini 3.x** model family.

---

## 1. Supported Model Tier (Gemini 3.x Family)

| Model ID | Display Name | Purpose & Characteristics | Recommended For |
| :--- | :--- | :--- | :--- |
| `gemini-3.5-flash-lite` | Gemini 3.5 Flash-Lite | Ultra-fast latency, high RPM/TPM throughput, lowest quota consumption | Real-time pair writing, drafting, quick translations, grammar fixes |
| `gemini-3.5-flash` | Gemini 3.5 Flash | Balanced intelligence, high stability, medium latency | Section transformations, structural editing, synthesis |
| `gemini-3.8-flash` | Gemini 3.8 Flash | Maximum reasoning depth, deep architectural analysis | Multi-chapter document generation, complex research synthesis |

---

## 2. Multi-Tier Downward Cascade Architecture

In `src/features/mimo/services/mimoGeminiService.ts`, the model cascade is structured so requests **never escalate upwards** from lightweight to heavier reasoning models:

```
[User Selected Model]
       │
       ├── gemini-3.5-flash-lite ──► fallback: gemini-3.5-flash (NEVER escalates to 3.8 Flash)
       │
       ├── gemini-3.5-flash      ──► fallback: gemini-3.5-flash-lite
       │
       └── gemini-3.8-flash      ──► fallback: gemini-3.5-flash ──► gemini-3.5-flash-lite
```

### Why Upward Escalation Is Banned:
Previously, selecting `gemini-3.5-flash-lite` caused failures to cascade upwards to `gemini-3.8-flash`, which has the most restrictive free-tier rate limits (RPM/TPM). That caused immediate HTTP 429 exhaustion and generated paradoxical error messages.

---

## 3. Burst Protection & TPM Mitigation

Google AI Studio enforces two separate limits on free API keys:
1. **Daily Requests (RPD)**: 1,500 requests/day (often at 0% usage).
2. **Per-Minute Tokens (TPM)**: A 60-second burst window.

Sending large document contexts (ASTs, pinned notes, and past turns) can saturate the 60-second burst limit. MD Creator implements:
- **1,500ms Backoff Delay**: Inserts a non-blocking pause between cascade retry attempts to let Google's burst window recover.
- **Payload Slimming on Retry**: Automatically slices conversation history down to 2 recent turns on fallback attempts, reducing token payload by up to 80%.

---

## 4. Context-Aware Dynamic Error Feedback

Error responses dynamically inspect `selectedModel`:
- If the user is on `gemini-3.5-flash-lite` and encounters rate limiting, the UI advises waiting 20–30s or switching to `[Gemini 3.5 Flash](#switch-model-35)`—**it will never tell the user to switch to 3.5 Flash-Lite when they are already using it**.
- If on `gemini-3.8-flash`, the UI recommends switching to `[Gemini 3.5 Flash-Lite](#switch-lite)`.

---

## 5. Storage Migration & Sanitization

In `src/features/mimo/stores/useMimoStore.ts`:
- **`setSelectedModel`**: Enforces strict typing (`MimoModelChoice`), defaulting any unknown or invalid model to `'gemini-3.5-flash-lite'`.
- **`onRehydrateStorage`**: When the client app boots and rehydrates localStorage, any persisted model matching `gemini-2.*` is automatically migrated to `'gemini-3.5-flash-lite'`.
