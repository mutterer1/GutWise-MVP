# AGENTS.md

## Project identity

This repository is for a Gut Intelligence Health application.

The product goal is to help users understand gut-health patterns, lifestyle correlations, nutrition/symptom context, and educational insights. The app must support wellness education and self-reflection. It must not diagnose, prescribe, treat, cure, or claim to prevent disease.

## Non-negotiable health-safety boundaries

- Do not create or approve backend logic that gives a diagnosis.
- Do not create logic that says a user "has", "likely has", or "probably has" a disease, disorder, infection, deficiency, or medical condition.
- Do not create treatment plans, supplement protocols, medication guidance, or dosing advice.
- When red-flag symptoms appear, route the user toward professional medical care or emergency guidance, not an app-generated conclusion.
- Any health claim shown to a user must be traceable to an evidence source or marked as unsupported.
- User-facing language must be educational, contextual, and non-diagnostic.

## Backend quality rules

- Validate all incoming request payloads.
- Keep business logic out of route handlers when possible.
- Prefer small, testable service functions.
- Do not log PII, PHI, symptoms, lab values, emails, tokens, or raw user health entries.
- Fail closed on auth and authorization.
- Add tests for critical logic, especially scoring, recommendations, user data access, and health-related text generation.
- If a dependency is added, explain why it is needed and whether a smaller or safer alternative exists.

## Review guidelines

Flag as P0:
- Any path that leaks user health data, tokens, credentials, or private records.
- Any backend logic that produces diagnostic or treatment claims.
- Any auth bypass or cross-user data access risk.
- Any production-breaking runtime bug in core flows.

Flag as P1:
- Missing validation on health-related inputs.
- Business logic that cannot be tested.
- Recommendation logic that lacks evidence mapping.
- Inconsistent database schema, stale migrations, or risky dependency drift.
- Ambiguous user-facing health language that could be interpreted as medical advice.

Flag as P2:
- Maintainability issues, duplicated logic, weak naming, missing docs, or missing non-critical tests.

## How to report findings

Every finding must include:
- Severity: P0, P1, P2, or P3
- Confidence: High, Medium, or Low
- Evidence: file path, function/component name, command output, or code reference
- Why it matters
- Recommended next action
- Whether it should block progress

Do not invent findings. If evidence is weak, label confidence as Low.
