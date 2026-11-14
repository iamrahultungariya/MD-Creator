# In-App Discovery Feedback Prompt & Modal Specification

## 1. Overview & Objectives

Provide a polite, non-intrusive feedback prompt directly inside MD Writer's editor workspace to capture critical product discovery insights from real writers (both guest visitors and signed-in members).

### Key Trigger Conditions:
1. **Document Check:** User has at least 1 document (active document or local database document count >= 1).
2. **Dwell Duration:** User has remained in the editor for at least 30 seconds (30,000ms).
3. **Submission State:** User has NOT previously submitted feedback (`localStorage.getItem('md_writer_feedback_submitted') !== 'true'`).
4. **Snooze State:** User is NOT currently snoozed (`Date.now() > Number(localStorage.getItem('md_writer_feedback_snooze_until') || 0)`).

---

## 2. Component Design & Layout

### A. Bottom-Left Prompt Toast (`FeedbackPromptToast.tsx`)
- **Positioning:** Fixed at bottom-left (`fixed bottom-6 left-6 z-40 max-w-sm w-full`).
  - Does NOT collide with `CloudSyncNudgeToast` (which lives on the bottom-right `bottom-6 right-6`).
  - On mobile: constrained via `max-w-[calc(100vw-2rem)]` and `left-4 bottom-4`.
- **Aesthetic:** Mimo drawer inspired:
  - Background: `bg-white dark:bg-neutral-900`.
  - Border: Hairline `border border-neutral-200/90 dark:border-neutral-800`.
  - Shadow: `shadow-xl`.
  - Radius: `rounded-2xl`.
- **Content:**
  - Mascot / Visual: Lightweight friendly character avatar (`/FeedBackCharater/Smiling Cartoon Boy Giving Thumbs-Up.png` or `/FeedBackCharater/Cheerful 3D Cartoon with Clipboard.png`, optimized size).
  - Header: "Enjoying MD Writer?"
  - Subtitle: "Quick 30-second feedback helps us shape features you need."
  - Actions:
    - Primary button: "Share Feedback" (opens modal, closes toast).
    - Dismiss button: "Later" and close icon (closes toast, initiates 15-day snooze).

### B. Product Discovery Modal (`FeedbackPromptModal.tsx`)
- **Container:** Accessible `ModalPortal` with backdrop blur, focus trap, and Escape key handling.
- **Surface:** `bg-white dark:bg-neutral-950 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto`.
- **Header:**
  - Title: "Share Feedback"
  - Subtitle: "Help us understand how you write and what we should build next."
  - Close button: "X" (triggers 15-day snooze if closed without submitting).
- **Form Fields:**
  1. **Email Field:**
     - *Logged-in user:* Read-only badge displaying "Signed in as: user@example.com" (auto-fetched from `useAuthStore` or Supabase session).
     - *Guest user:* Clean text input with placeholder `name@work.com` and email format validation.
  2. **Q1: Discovery Source ("Where did you hear about MD Writer?")**
     - Single-select interactive chips:
       - `Twitter / X`
       - `Google Search`
       - `Friend / Colleague`
       - `Reddit`
       - `Other`
  3. **Q2: Previous Tool ("Which tool did you use before?")**
     - Single-select interactive chips:
       - `Notion`
       - `Obsidian`
       - `Typora`
       - `VS Code`
       - `None / Other`
  4. **Q3: Missing Feature ("What do you miss or wish was improved?")**
     - Single-select interactive chips:
       - `Export options`
       - `Offline sync`
       - `Custom themes`
       - `Mobile experience`
       - `Nothing, it's great!`
  5. **Q4: Free-Write Feedback ("Anything else you want to share? (Optional)")**
     - Clean `textarea` with `rows={3}`, placeholder "Any specific features, bug reports, or ideas...".
  6. **Submit Button:**
     - "Send Feedback" with loading state spinner.
     - Saves record to Supabase `feedbacks` table.
     - On success: sets `md_writer_feedback_submitted = 'true'`, shows positive confirmation, and closes modal after 1.5s.

---

## 3. Data & Storage Model

### Local Storage Keys:
- `md_writer_feedback_submitted`: `'true'` when user completes and submits the modal.
- `md_writer_feedback_snooze_until`: Timestamp (epoch ms) representing when the prompt may show again if dismissed (`Date.now() + 15 * 24 * 60 * 60 * 1000`).

### Supabase `feedbacks` Table Record:
- `id`: `crypto.randomUUID()`
- `user_id`: `user?.id || null`
- `user_email`: verified email string
- `user_name`: `user?.displayName || null`
- `category`: `'feature'`
- `sentiment`: `'good'`
- `subject`: `'In-App Discovery Feedback'`
- `message`: Q4 textarea text (or structured summary if empty)
- `priority`: `'normal'`
- `status`: `'new'`
- `system_info`:
  ```json
  {
    "discovery_source": "Twitter / X",
    "previous_tool": "Obsidian",
    "missing_features": "Offline sync",
    "is_guest": true,
    "dwell_seconds": 30,
    "app_version": "2.3.0",
    "platform": "Win32"
  }
  ```

---

## 4. Copy & Anti-Slop Constraints
- Absolutely NO em dash characters in any label, tooltip, error text, or button.
- Clean, human typography: `font-sans` (`Geist Variable`), `font-mono tabular-nums`.
- Zero decorative icon bloat.
