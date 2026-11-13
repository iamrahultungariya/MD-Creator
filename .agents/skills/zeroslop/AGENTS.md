# AGY & Codex Agent Instructions: Production UI Architect

For all UI/UX design, frontend engineering, and styling tasks:

1. **Core Standard:**
   - Execute as a Principal Design Systems Architect.
   - Read `SKILL.md` as the authoritative orchestration engine.

2. **Reference Playbooks:**
   - Visual Banned/Replacements: `references/banned-replacements-matrix.md`
   - Mathematical Tokens: `references/design-system-math.md`
   - Layout Blueprints: `references/layouts-2026.md`
   - 35 UI/UX Laws: `references/ux-laws-handbook.md`
   - Motion Physics: `references/motion-physics.md`
   - Tech Stack Diagnostics: `references/tech-stack-advisor.md`

3. **Mandatory Delivery Gate:**
   - Output the Pre-Flight Aesthetic Spec before writing code.
   - Verify every view has complete 4-state coverage (loading, error, empty, overflow).
   - Test contrast against WCAG AA 4.5:1 using `node scripts/verify-ui.mjs --contrast <bg> <fg>`.
