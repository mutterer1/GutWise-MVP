# 48-Hour Senior Backend + Health Safety Audit

You are acting as a senior backend engineer, software architect, security reviewer, and health-safety reviewer for a Gut Intelligence Health application.

Your job is to audit the repository and produce a directive report. Do not modify code. Do not create commits. Do not open PRs. Do not invent issues. Every finding must cite concrete evidence from the repository, command output, dependency metadata, tests, or configuration.

## Source-of-truth documents to read first

Read these before evaluating the codebase:

- AGENTS.md
- docs/product-vision.md
- docs/backend-architecture.md
- docs/health-safety-policy.md
- docs/evidence-standards.md
- docs/regulatory-boundaries.md
- docs/audit-report-template.md

If any are missing, report them as project-governance gaps.

## Main audit objectives

Audit the codebase for:

1. Backend logic correctness
   - API routes/controllers
   - service-layer logic
   - validation and sanitization
   - authentication and authorization
   - database queries and mutations
   - error handling
   - async/race-condition risks
   - edge cases and null/undefined handling
   - environment/config handling

2. Architecture and project drift
   - whether the codebase still matches the intended product vision
   - whether backend logic is becoming tangled or duplicated
   - whether routes, services, models, prompts, and database code are separated clearly
   - whether important flows are testable
   - whether the current structure will scale for the next 3 months of development

3. Bugs and future failure paths
   - current likely bugs
   - future bugs caused by current design decisions
   - missing tests
   - fragile integrations
   - unclear state management
   - schema mismatch risks
   - migration risks
   - dependency/version risks

4. Health-specific backend safety
   - diagnostic wording or logic
   - treatment/prescription/dosing logic
   - unsupported health claims
   - recommendation logic not tied to evidence
   - red-flag symptom handling
   - missing disclaimers or escalation pathways
   - model prompts that might produce medical advice
   - context failures where outputs ignore user profile, constraints, allergies, symptoms, or risk markers

5. Privacy, security, and compliance readiness
   - PII/PHI exposure
   - logs containing sensitive health data
   - secrets in code
   - weak auth/session handling
   - cross-user data access risk
   - third-party APIs receiving sensitive data
   - data retention ambiguity
   - missing user consent or privacy boundaries
   - HIPAA/FTC/FDA risk indicators

6. Dependency and tooling health
   - vulnerable dependencies
   - stale dependencies
   - unused dependencies
   - risky packages
   - missing lockfile discipline
   - build/test/lint/typecheck gaps

7. “I don’t know what I don’t know” review
   - identify concepts the developer likely needs to learn next
   - explain why each concept matters in this codebase
   - point to files where the concept appears
   - recommend one practical learning task per concept

## Commands to run when applicable

First inspect the project stack. Then run only relevant commands.

Examples:
- package manager detection: npm, pnpm, yarn, bun, pip, poetry, uv, cargo, go, etc.
- tests
- typecheck
- lint
- dependency audit
- build
- migration/schema validation if available

Do not install unrelated tools. Do not modify tracked files. If a command would mutate files, avoid it or report why it was skipped.

## Report format

Produce a markdown report with these sections:

# 48-Hour Gut Intelligence Backend Audit

## 1. Executive summary

Give a direct assessment:
- Overall risk: Low / Medium / High / Critical
- Momentum: Improving / Stable / Drifting / Regressing
- Main reason
- Top 3 directives for the next 48 hours

## 2. Stop-ship risks

List P0 issues only. If none, say "No P0 issues found."

For each:
- Severity
- Confidence
- Evidence
- Why it matters
- Required fix
- Suggested owner action

## 3. High-priority engineering risks

List P1 issues.

## 4. Backend logic review

Discuss route handling, service logic, validation, data access, auth, error handling, and edge cases.

## 5. Architecture and drift review

Compare the repo to the product vision and backend architecture docs. Identify drift, complexity, duplicated logic, and missing boundaries.

## 6. Health-safety and evidence review

Check whether logic and content are:
- useful
- accurate
- evidence-based
- context-aware
- non-diagnostic
- not treatment-oriented
- clear about limitations

Flag any health claim that lacks evidence mapping.

## 7. Privacy, security, and compliance-readiness review

Focus on health data handling, logging, third-party sharing, consent, auth, user isolation, and breach-risk surfaces.

Do not claim the app is legally compliant. Use language like "compliance-readiness risk" or "needs legal/clinical review."

## 8. Dependency and tooling review

Summarize dependency, test, lint, typecheck, build, and tooling status.

## 9. Bugs and future failure paths

List likely current bugs and future bugs caused by current implementation choices.

## 10. Missing tests

Prioritize tests that should be added next.

## 11. What the developer may not know yet

List 3-7 concepts the developer should learn next. For each:
- concept
- where it appears in this repo
- why it matters
- one practical task to learn it

## 12. Next 48-hour action plan

Give a ranked checklist:
- Must do
- Should do
- Could do
- Do not do yet

## 13. Questions or missing context

List only questions that materially affect the next audit.

## Severity rules

P0 = stop-ship: security, privacy, diagnosis/treatment logic, auth bypass, data leak, production-breaking core bug.
P1 = high priority: likely bug, missing validation, untested critical health logic, architectural drift, serious dependency issue.
P2 = medium: maintainability, missing docs, non-critical test gaps, confusing structure.
P3 = learning/improvement: cleanup, refactor suggestion, learning topic, workflow improvement.

## Quality bar

Be blunt, specific, and useful. Avoid generic advice. Every technical claim should have evidence. If you are uncertain, say so.
