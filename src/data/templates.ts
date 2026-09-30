export type TemplateCategory = 'Engineering' | 'Product';

export interface MarkdownTemplate {
  id: string;
  title: string;
  category: TemplateCategory;
  desc: string;
  badge?: string;
  content: string;
}

export const MARKDOWN_TEMPLATES: MarkdownTemplate[] = [
  // ── 1. ENGINEERING RFC & ARCHITECTURE DESIGN ──────────────────────
  {
    id: 'engineering-rfc',
    title: 'Engineering RFC & Architecture Design.md',
    category: 'Engineering',
    desc: 'Gold-standard technical proposal (RFC) for systems architecture, API contracts, data schemas, and reliability SLAs.',
    badge: 'Engineering Standard',
    content: `# RFC-[000]: [Systems Architecture / Initiative Title]

> [!IMPORTANT]
> **Author**: [Lead Engineer / Systems Architect]  
> **Status**: In Review (Draft / In Review / Approved / Implemented)  
> **Target Release**: Q4 2026 • **Reviewers**: @infra-lead, @security-team, @staff-eng  
> **Last Updated**: ${new Date().toISOString().split('T')[0]}

---

## 1. Executive Summary & Problem Context
Provide a concise 2-3 paragraph overview of the technical challenge. What bottleneck or scalability limit necessitates this design, and what is the impact of not solving it?

- **Core Problem**: Our document synchronization queue experiences lock contention under high concurrency (>10,000 req/s).
- **Proposed Solution**: Introduce a write-ahead log with client-side conflict-free replicated data types (CRDT) backed by IndexedDB and edge workers.
- **Estimated Effort**: 3 sprints (1 Staff Engineer, 2 Fullstack Engineers).

---

## 2. Goals & Non-Goals

### Goals
- Achieve sub-10ms keystroke-to-disk local persistence latency.
- Provide automatic multi-master conflict resolution with zero data loss.
- Maintain backward compatibility with current Markdown AST serialization schemas.

### Non-Goals
- Real-time video/voice streaming over WebRTC (deferred to Phase 3).
- Legacy browser support for engines lacking Web Workers and IndexedDB v3.

---

## 3. High-Level System Architecture

\`\`\`mermaid
flowchart TD
    Client["Client Browser (IndexedDB Local Vault)"] -->|"Delta Sync (gRPC/WS)"| Gateway["Edge API Gateway (Cloudflare / Envoy)"]
    Gateway -->|"Batch Writes"| SyncService["Sync & Resolution Engine"]
    SyncService -->|"Fast Cache"| Redis[("Redis Cluster")]
    SyncService -->|"Durable Store"| Postgres[("PostgreSQL 16 Primary")]
\`\`\`

### Architectural Components
1. **Client Persistence Engine**: Local-first IndexedDB storage guaranteeing 100% offline functionality.
2. **Edge Ingestion Layer**: Authenticates requests via JWT, validates payload schemas, and rates limits clients.
3. **Conflict Resolution Worker**: Applies state-based LWW (Last-Write-Wins) or CRDT operations in monotonic sequence.

---

## 4. API & Interface Specifications

### Endpoint: \`POST /api/v2/documents/sync\`
Submits a batch of client mutations to the cloud synchronization engine.

#### Request Headers
\`\`\`http
Authorization: Bearer <user_token>
Content-Type: application/json
X-Client-Version: 0.9.2
\`\`\`

#### Request Payload
\`\`\`json
{
  "documentId": "doc_9832_vault",
  "clientTimestamp": "2026-09-30T10:00:00Z",
  "baseRevision": 42,
  "operations": [
    {
      "op": "insert",
      "position": 128,
      "text": "## Architecture Specifications\n"
    }
  ]
}
\`\`\`

#### Response: \`200 OK\`
\`\`\`json
{
  "status": "synchronized",
  "serverRevision": 43,
  "checksum": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
\`\`\`

---

## 5. Data Storage & Schema Migrations

| Table Name | Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| \`documents\` | \`id\` | UUID | PRIMARY KEY | Unique document identifier |
| \`documents\` | \`user_id\` | UUID | REFERENCES auth.users | Document owner ID |
| \`documents\` | \`content\` | TEXT | NOT NULL | Raw GFM Markdown payload |
| \`documents\` | \`version\` | BIGINT | DEFAULT 1 | Monotonic revision vector |
| \`documents\` | \`updated_at\`| TIMESTAMPTZ | NOT NULL | Last modification timestamp |

---

## 6. Performance SLAs & Reliability
- **p95 Read Latency**: < 15ms (Edge cached).
- **p99 Write Latency**: < 60ms (Durable PostgreSQL commit).
- **Availability Target**: 99.95% uptime with multi-region failover replicas.
- **Data Loss Tolerance (RPO)**: 0 seconds for local IndexedDB; < 5 seconds for cloud sync.

---

## 7. Security, Privacy & Access Control
- All payloads encrypted at rest via AES-256-GCM.
- Transport strictly requires TLS 1.3 with HSTS preloading.
- Supabase Row-Level Security (RLS) policies prevent unauthorized cross-tenant read/write access.

---

## 8. Phased Rollout & Rollback Plan

\`\`\`
[Stage 1: Internal Dogfooding (10% Traffic)] ➔ [Stage 2: Beta Testers (25%)] ➔ [Stage 3: 100% Production]
\`\`\`

- **Rollback Trigger**: If error rate exceeds 0.05% or sync latency p99 exceeds 150ms over a 5-minute window.
- **Rollback Procedure**: Revert feature flag \`ENABLE_V2_SYNC\` in edge config; clients automatically fall back to v1 REST polling without client reload.

---

## 9. Open Questions & Alternatives Considered
1. *Considered OT vs CRDT*: Chose state-based CRDTs due to offline-first requirements without continuous server connection.
2. *Open Question*: Should binary asset attachments be deduplicated on client or in edge bucket storage?
`
  },

  // ── 2. PRODUCT REQUIREMENTS DOCUMENT (PRD) ──────────────────────
  {
    id: 'product-spec-prd',
    title: 'Product Requirements Document (PRD).md',
    category: 'Product',
    desc: 'Modern executive PRD aligning product vision, user problem statements, personas, functional scope matrix, and OKR metrics.',
    badge: 'Product Standard',
    content: `# PRD: [Feature / Product Initiative Name]

> [!IMPORTANT]
> **Product Lead**: [PM Name] • **Engineering Lead**: [Tech Lead Name]  
> **Target Release**: v1.0 Launch (Q4 2026) • **Status**: Ready for Engineering  
> **Executive Sponsor**: [Executive Name] • **Design Lead**: [Designer Name]

---

## 1. Executive Summary & The "Why Now"
Provide a high-impact overview of this product initiative. Why is this feature essential for user growth, retention, or workflow velocity right now?

- **Vision**: Empower knowledge workers, engineers, and technical creators to draft publication-ready Markdown documents with zero friction and uncompromised local privacy.
- **Market Opportunity**: Modern writing tools have become sluggish and bloated with unsolicited AI popups and complex databases. Users want a clean, lightning-fast typing sanctuary.

---

## 2. Target Personas & Core User Journeys

| Persona | Role & Context | Core Pain Point | How This Initiative Solves It |
| :--- | :--- | :--- | :--- |
| **Alex (The Staff Engineer)** | Writes RFCs, API specs, and system designs daily | Slow browser editors freeze during long markdown files | 0ms keystroke latency with local IndexedDB persistence |
| **Elena (The Technical Writer)** | Crafts user guides and SDK documentation | Exporting to clean vector PDF destroys formatting | Sandboxed PDF studio with running headers and custom TOC |
| **Jordan (The Privacy Purist)** | Works in strict offline or regulated environments | Proprietary cloud apps store data on unknown servers | 100% local-first data ownership; files remain pure standard \`.md\` |

---

## 3. Success Metrics & Key Results (OKRs)

| Objective | Key Metric (KPI) | Baseline | Target Goal | Measurement Method |
| :--- | :--- | :--- | :--- | :--- |
| **Typing Responsiveness** | Input Keystroke Latency | 28ms | < 2ms (Zero lag) | Browser Performance API |
| **Document Retention** | 30-Day Active Writer Rate | 42% | > 65% | Client-side telemetry opt-in |
| **Export Satisfaction** | PDF / Word Export Success Rate | 88% | > 99.5% | Client export error reporting |
| **Feature Adoption** | Slash Command (/) Usage | 15% of sessions | > 60% of sessions | Interaction frequency audit |

---

## 4. Functional Requirements & Scope Matrix

### Phase 1: Must-Have (P0 - Critical for Launch)
- [x] **FR-1.1**: Centered paper writing canvas with dimmed line numbers and generous horizontal margin.
- [x] **FR-1.2**: Floating formatting dock anchored above text cursor with 2-second auto-dismiss on typing.
- [x] **FR-1.3**: Raycast/Linear style mouse-following border glow on document library cards.
- [ ] **FR-1.4**: Instant one-click publication link generation with optional password protection.

### Phase 2: Should-Have (P1 - High Priority)
- [ ] **FR-2.1**: Revision history timeline with visual inline diff comparison and 1-click restore.
- [ ] **FR-2.2**: Client-side WebP image optimizer automatically compressing drag-and-drop images.
- [ ] **FR-2.3**: Word count focus sprints with pomodoro timer telemetry.

### Phase 3: Nice-to-Have (P2 - Post-v1.0 Polish)
- [ ] **FR-3.1**: Custom community theme marketplace with user-defined CSS palettes.
- [ ] **FR-3.2**: Multi-user real-time collaborative peer-to-peer editing via WebRTC.

---

## 5. Non-Functional Requirements (NFRs)
- **Zero-Flicker Navigation**: All page route transitions must maintain previous screen content during chunk loads without flashing blank loaders.
- **High-Contrast Dark Mode**: Text selection in writing and preview modes must pass WCAG AAA contrast ratio standards (minimum 7:1 against background).
- **Offline Resilience**: The application must function 100% offline as a Progressive Web App (PWA) with cached service workers.

---

## 6. Edge Cases & Mitigations
1. **Network Interruption during Cloud Sync**: Client queues unsynced operations in an IndexedDB outbox and retries with exponential backoff once \`navigator.onLine\` triggers.
2. **Extreme Document Size (>100,000 words)**: CodeMirror 6 viewport virtualization ensures only visible DOM lines are rendered, preventing memory exhaustion.
3. **Accidental Tab Closure**: Unsaved buffer changes trigger \`beforeunload\` alert; auto-save writes to disk every 400ms.

---

## 7. Milestones & Launch Checklist
- [x] **Milestone 1**: Core Markdown Engine & KaTeX Formula integration completed.
- [x] **Milestone 2**: Raycast/Linear card redesign and dark mode contrast fix deployed.
- [ ] **Milestone 3**: End-to-end user testing with 50 beta engineering leads.
- [ ] **Milestone 4**: v1.0 Public Production Release.
`
  }
];
