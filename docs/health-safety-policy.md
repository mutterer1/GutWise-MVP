# GutWise Health Safety Policy

## Document Status

First draft. This document defines the health-safety policy for GutWise-MVP.

This policy operationalizes the product direction in `docs/product-vision.md`, the backend boundaries in `docs/backend-architecture.md`, and the non-negotiable project rules in `AGENTS.md`.

This document is not legal, medical, regulatory, or clinical advice. Before public launch, counsel and qualified health-domain reviewers should review this policy, the product claims, the privacy posture, the regulatory posture, and all user-facing health language.

## Purpose

GutWise is a gut-health intelligence and self-reflection application. It helps users organize personal logs, identify observed patterns, understand evidence strength, and prepare clearer conversations with qualified healthcare professionals.

Because GutWise handles health-adjacent data and generates health-related explanations, safety must be built into the product, backend, evidence model, language model workflow, reporting surfaces, and review process.

The purpose of this policy is to define:

- What GutWise may safely do.
- What GutWise must never do.
- How scientific and personal evidence may be used.
- How user-facing language must be constrained.
- How red-flag situations must be handled.
- How backend architecture must enforce safety.
- How federal compliance expectations should guide implementation.

## Safety Positioning

GutWise is intended to be a wellness education, personal tracking, pattern-awareness, and clinician-conversation preparation tool.

GutWise is not intended to be:

- A diagnostic system.
- A treatment-planning system.
- A medication or supplement advisor.
- A dosing assistant.
- An emergency triage tool.
- A clinical decision support system for providers.
- A disease-management device.
- A replacement for a physician, registered dietitian, gastroenterologist, therapist, or other licensed professional.

GutWise must remain aligned with a low-risk wellness and education posture. Any feature that would shift the product toward diagnosis, treatment, mitigation, cure, disease prevention, clinical decision support, or patient-specific treatment recommendations requires formal regulatory, legal, clinical, and product review before implementation.

## Federal Standards and Compliance Orientation

GutWise should be built with awareness of federal expectations for health-related software and consumer health products.

### FDA General Wellness and Device Software Boundary

The FDA's general wellness and device software guidance distinguishes low-risk wellness functions from software functions that diagnose, cure, mitigate, prevent, or treat disease.

GutWise should preserve a general wellness and self-reflection posture by:

- Avoiding disease diagnosis or prediction.
- Avoiding disease treatment or prevention claims.
- Avoiding patient-specific treatment recommendations.
- Avoiding claims that the app manages a disease or condition.
- Presenting personal patterns as observations, not clinical findings.
- Presenting scientific context as educational background, not individualized medical instruction.

Features that may create FDA risk include:

- Detecting or diagnosing a condition.
- Predicting that a user likely has a condition.
- Telling a user what treatment to start, stop, change, or discuss as the "right" treatment.
- Interpreting symptoms as evidence of a disease.
- Automatically escalating to clinical conclusions from log patterns.
- Using connected sensors, lab data, or medical records to produce clinical assessments.

### FTC Health Claims and Advertising Substantiation

The FTC expects health-related product claims to be truthful, not misleading, and supported by appropriate evidence. GutWise should apply that principle to marketing, onboarding, paywalls, reports, insight cards, emails, app-store copy, and AI-generated text.

GutWise must not make express or implied claims that exceed its evidence.

All objective health-related claims should be:

- Accurate.
- Clear.
- Qualified when evidence is limited.
- Supported by competent and reliable evidence.
- Not contradicted by other product language or visuals.
- Presented in a way a reasonable user can understand.

For GutWise, this means:

- "Evidence-aware pattern tracking" is acceptable when the system actually shows evidence strength.
- "Helps organize gut-health observations" is acceptable when the app does that.
- "Finds the cause of your symptoms" is not acceptable.
- "Prevents flare-ups" is not acceptable.
- "Tells you which foods are bad for your gut" is not acceptable.
- "Uses science-informed context to explain observed associations" may be acceptable if source-backed and qualified.

### HIPAA Posture

HIPAA applicability depends on the relationship between the app, users, covered entities, and business associates.

GutWise should not assume that it is outside HIPAA in every future configuration. If GutWise is offered directly to consumers for their own use, it may not be acting as a HIPAA covered entity or business associate. If GutWise is offered on behalf of a healthcare provider, health plan, employer health program, EHR vendor, clinic, or other covered entity or business associate, HIPAA obligations may apply.

Before adding provider portals, EHR integrations, clinician dashboards, insurer integrations, employer programs, referrals, or care-team workflows, GutWise must undergo HIPAA and business-associate analysis.

Regardless of formal HIPAA status, GutWise should treat user health data as sensitive and apply privacy and security practices appropriate for PHI-like data.

### FTC Health Breach Notification Rule

Health apps outside HIPAA may still be subject to the FTC Health Breach Notification Rule if they qualify as vendors of personal health records, PHR-related entities, or third-party service providers.

GutWise should assume that unauthorized access, acquisition, or disclosure of identifiable health information may create notification obligations and should maintain incident-response readiness.

At minimum, the product and backend should support:

- Accurate data inventory.
- Identification of health data categories.
- Access logging where appropriate.
- Breach investigation workflow.
- User notification readiness.
- Vendor and third-party service review.
- Avoidance of unauthorized health-data sharing.
- No health-data sharing for behavioral advertising.

## Non-Negotiable Health Safety Boundaries

GutWise must never:

- Diagnose a disease, disorder, infection, deficiency, or medical condition.
- Tell a user they "have," "likely have," "probably have," or "may have" a disease or condition based on app data.
- Generate treatment plans.
- Recommend medication starts, stops, substitutions, or dose changes.
- Recommend supplement protocols or dosing.
- Tell users to ignore, delay, or replace professional care.
- Claim to cure, treat, mitigate, or prevent disease.
- Present a personal correlation as medical causation.
- Use scientific literature to imply individualized clinical certainty.
- Present AI-generated language as clinician-reviewed unless it actually was.
- Infer confirmed diagnoses from symptoms, logs, or suspected-condition entries.
- Promote health anxiety through alarmist language.
- Minimize red-flag symptoms.

These boundaries apply to all code, prompts, edge functions, database outputs, reports, UI copy, notifications, and marketing language.

## Allowed Product Behavior

GutWise may:

- Help users log gut-health and lifestyle data.
- Summarize user-entered observations.
- Identify observed associations in user logs.
- Compare exposed days to baseline or contrast days.
- Surface evidence gaps and missing log types.
- Explain that a pattern is exploratory, emerging, reliable, or insufficient.
- Provide general educational context from reviewed sources.
- Encourage users to discuss concerning or persistent patterns with a qualified professional.
- Help users prepare clinician-ready summaries.
- Route red-flag symptoms toward professional care or emergency guidance.

Allowed language should use forms like:

- "Your logs show..."
- "This pattern appears in your recent entries..."
- "This may be associated with..."
- "The evidence is limited because..."
- "This is not enough information to determine a cause."
- "Consider discussing this pattern with a healthcare professional."
- "Seek urgent care or emergency services if symptoms are severe, sudden, or worsening."

## Disallowed Product Behavior

GutWise must not use forms like:

- "You have..."
- "You likely have..."
- "This means you have..."
- "This confirms..."
- "This diagnoses..."
- "This is caused by..."
- "You should treat this by..."
- "Start taking..."
- "Stop taking..."
- "Increase your dose..."
- "Avoid this food permanently..."
- "You do not need to see a doctor..."
- "This prevents..."
- "This cures..."

Disallowed language must be blocked in:

- Static UI copy.
- Insight labels.
- LLM prompts.
- LLM outputs.
- Reports.
- Push/email notifications.
- Marketing copy.
- App-store descriptions.
- Support macros.

## Evidence Safety Policy

GutWise uses two evidence streams:

1. Personal evidence from user logs.
2. Reference evidence from reviewed scientific, clinical, nutrition, medication, institutional, or internal sources.

These evidence streams must remain distinct.

### Personal Evidence

Personal evidence can support observed-association statements only.

Examples:

- "On lower-hydration days, hard stool entries appeared more often in your recent logs."
- "Your symptom burden was higher on days after shorter sleep entries."
- "This pattern has limited contrast data."

Personal evidence must not support:

- Diagnosis.
- Treatment.
- Disease prediction.
- Clinical risk scoring.
- Medication guidance.
- Supplement guidance.
- Causal certainty.

### Reference Evidence

Reference evidence can provide general context.

Examples:

- "Hydration is commonly discussed as one factor related to stool consistency."
- "Stress and sleep may interact with digestive symptoms through gut-brain pathways."
- "Some medication classes are known to have gastrointestinal side effects."

Reference evidence must be:

- Traceable to a source.
- Versioned where possible.
- Reviewed before user-facing use.
- Qualified when evidence is emerging, indirect, or uncertain.
- Linked to app entities through the reference evidence model.

Reference evidence must not be used to tell a user that a general scientific finding applies clinically to them.

### Evidence Labels

GutWise should label pattern strength using conservative terms:

- `insufficient`: not enough evidence to show as a pattern, but may inform evidence gaps.
- `exploratory`: weak or early signal; must include uncertainty.
- `emerging`: repeated signal with some support and contrast.
- `reliable`: stronger repeated signal with adequate support, contrast, and lower contradiction.

Even "reliable" must not mean clinically proven, causal, diagnostic, or treatment-ready.

## Backend Safety Policy

The backend architecture must enforce safety at each layer described in `docs/backend-architecture.md`.

### Raw Log Layer

Raw log storage must:

- Preserve user entries without converting them into conclusions.
- Validate required fields and reasonable ranges.
- Keep records account-scoped.
- Avoid logging raw symptoms, notes, medication details, document text, or other sensitive health data.
- Distinguish user-reported context from confirmed or document-backed context.

### Canonical Event Layer

Canonical event normalization must:

- Preserve event source and payload meaning.
- Avoid adding diagnostic interpretations.
- Avoid converting symptoms into suspected diseases.
- Preserve uncertainty and missingness.
- Keep derived fields factual and explainable.

### Daily Feature Layer

Daily features must:

- Aggregate observations, not conclusions.
- Preserve data coverage and completeness.
- Track absence confirmations separately from missing data.
- Keep exposure and outcome fields distinct.
- Avoid using population assumptions where user-specific baselines are required.

### Baseline Layer

Baselines must:

- Return null or insufficient status when there is not enough data.
- Avoid fabricating thresholds.
- Avoid implying that a value outside a personal baseline is clinically abnormal.
- Distinguish personal pattern deviation from medical abnormality.

### Candidate Analyzer Layer

Candidate analyzers must:

- Be deterministic and testable.
- Return structured candidates, not user-facing medical claims.
- Compute evidence, contrast, contradiction, sufficiency, and gaps.
- Attach reviewed reference claim keys only when appropriate.
- Never produce diagnosis, treatment, medication, supplement, dosing, or disease-prevention claims.
- Never let reference plausibility override weak personal evidence.

### Prioritization Layer

Prioritization must:

- Downgrade weak, stale, narrow, contradictory, or insufficient patterns.
- Preserve ranking reasons.
- Avoid prioritizing fear-inducing patterns solely because they sound medically important.
- Keep red-flag routing separate from ranked lifestyle insights.

### Medical Context Layer

Medical context must:

- Distinguish `user_reported`, `confirmed`, `candidate`, and document-backed facts.
- Never infer a confirmed diagnosis from symptoms or logs.
- Never promote suspected conditions into active diagnoses without user review or appropriate provenance.
- Use medical context for caution and framing, not diagnosis.
- Route red-flag history to safer language, not stronger conclusions.

### LLM Explanation Layer

LLM explanations must:

- Explain only structured findings supplied in the bundle.
- Use association language.
- Include uncertainty when evidence is limited.
- Include reference context only when supplied by reviewed claims.
- Avoid generic wellness filler.
- Avoid diagnosis, treatment, medication guidance, supplement guidance, dosing, and unsupported causation.
- Return structured output that can be validated.

The LLM is a communication layer, not an evidence source.

### Output Validation Layer

Output validation should reject or flag generated text that:

- Introduces findings not present in the input.
- Adds a diagnosis or disease prediction.
- Claims causation beyond evidence.
- Recommends treatment, medication, supplement, or dosing changes.
- Omits uncertainty for limited evidence.
- Includes unsupported health claims.
- Uses alarmist phrasing.
- Uses language that could reasonably be interpreted as medical advice.

Validation failures should prevent display until the output is corrected, regenerated, or replaced with deterministic fallback copy.

## Red-Flag Symptom Policy

GutWise is not an emergency tool. It must not triage emergencies or decide whether a user does or does not need urgent care.

When red-flag symptoms or serious concerns appear, GutWise should route the user toward professional care rather than generating an app conclusion.

Red-flag contexts may include, but are not limited to:

- Blood in stool.
- Black or tarry stool.
- Severe or worsening abdominal pain.
- Persistent vomiting.
- Signs of dehydration.
- Fainting or severe weakness.
- Fever with severe gastrointestinal symptoms.
- Unexplained weight loss.
- Persistent diarrhea or constipation.
- New symptoms after starting a medication.
- Severe allergic reaction symptoms.
- Symptoms during pregnancy or in medically vulnerable contexts.

Safe routing language should say:

- "GutWise cannot evaluate urgent symptoms."
- "If this is severe, sudden, worsening, or concerning, seek medical care promptly."
- "If you think this may be an emergency, contact emergency services."
- "Consider contacting a qualified healthcare professional about this symptom."

Unsafe routing language includes:

- "This is probably normal."
- "This is not serious."
- "This does not require care."
- "This is caused by..."
- "You can treat this at home by..."

## Scientific Literature Policy

GutWise may use scientific literature and reference facts to inform analyzers, assemblers, report payloads, and LLM explanations only through a reviewed evidence pipeline.

Scientific claims should be:

- Stored as small, discrete claims.
- Assigned to a domain.
- Assigned a claim type.
- Assigned an evidence grade.
- Linked to a source and source version.
- Reviewed before use.
- Linked to relevant app entities.
- Qualified when uncertain.

The backend should not pass raw literature excerpts directly into LLM prompts as user-facing authority. Instead, it should pass reviewed claim summaries or claim keys.

Each logging domain should eventually have reviewed science coverage:

- Bowel movement and stool science.
- Symptom science.
- Food, ingredient, and nutrition science.
- Hydration science.
- Sleep and circadian science.
- Stress and gut-brain axis context.
- Exercise and movement science.
- Medication and supplement gut-effect context.
- Menstrual cycle and digestive-pattern context.
- Medical context and red-flag safety guidance.

## User-Facing Language Standards

User-facing language must be:

- Educational.
- Contextual.
- Non-diagnostic.
- Non-alarmist.
- Evidence-bound.
- Clear about uncertainty.
- Clear about the role of professional care.

Preferred language:

- "Observed pattern"
- "Association"
- "May be related"
- "Could be influenced by"
- "Evidence is limited"
- "This does not establish cause"
- "Worth tracking"
- "Worth discussing with a professional"

Avoid language:

- "Diagnosis"
- "Disease detected"
- "Likely condition"
- "Cause confirmed"
- "Treatment"
- "Prescription"
- "Protocol"
- "Cure"
- "Prevent"
- "Guaranteed"

## Privacy and Data Safety Policy

GutWise must treat all user health logs and medical context as sensitive.

The product and backend must avoid:

- Logging PHI-like data.
- Sharing health data for advertising.
- Sending raw sensitive entries to unnecessary third parties.
- Including raw health data in error reports.
- Exposing cross-user records.
- Storing medical documents without account-scoped access controls.
- Using health data for research, analytics, or model training without explicit consent and appropriate governance.

The backend should favor:

- Row-level security.
- Account-scoped queries.
- Least-privilege service access.
- Clear storage buckets and access policies.
- Minimal retention of generated artifacts.
- Auditability for sensitive operations.
- Incident-response readiness.

## Review and Approval Policy

The following changes require health-safety review before implementation or release:

- New insight candidate analyzers.
- New LLM prompt templates.
- New report sections.
- New scientific claim domains.
- New source-ingestion pipelines.
- New medication, supplement, or food-effect logic.
- New red-flag routing logic.
- New medical document extraction features.
- New integrations with providers, EHRs, insurers, employers, or wearable devices.
- Any copy that makes health, nutrition, symptom, medication, supplement, or disease-related claims.

Review should check:

- Does this create or imply a diagnosis?
- Does this create or imply treatment advice?
- Does this claim causation?
- Is the evidence source traceable?
- Is the evidence strength represented honestly?
- Is uncertainty visible?
- Could a reasonable user misread this as medical advice?
- Does this increase privacy, breach, HIPAA, FDA, or FTC risk?

## Testing Requirements

Health safety must be tested, not assumed.

Critical tests should cover:

- Candidate analyzers do not emit diagnostic or treatment language.
- LLM input contracts include disallowed behavior constraints.
- LLM output validation rejects unsafe content.
- Evidence gaps appear when data is insufficient.
- Red-flag routing does not generate conclusions.
- Medical context modifiers do not create diagnoses.
- Reference claims are filtered to reviewed, ready-for-use claims.
- User data access remains account-scoped.
- Sensitive payloads are not logged.

No health-related intelligence feature should be considered production-ready without safety-focused tests.

## Incident and Escalation Policy

Any of the following should be treated as a high-severity safety issue:

- The app tells a user they have or likely have a condition.
- The app recommends treatment, medication, supplements, or dosing.
- The app tells a user to ignore or delay care.
- The app exposes another user's data.
- The app leaks health data, medication data, document data, tokens, or credentials.
- The app generates unreviewed health claims as authoritative.
- The app shares identifiable health data with an unauthorized third party.

Immediate actions should include:

- Disable or hide the unsafe output path where possible.
- Preserve technical evidence without exposing sensitive data.
- Stop further generation or display of the unsafe class of output.
- Review affected code, prompts, data, and logs.
- Determine whether user, FTC, state, HIPAA, vendor, or other notification obligations apply.
- Document root cause and remediation.

## Federal Reference Sources

This policy is informed by the following official federal sources:

- FDA, General Wellness: Policy for Low Risk Devices: https://www.fda.gov/regulatory-information/search-fda-guidance-documents/general-wellness-policy-low-risk-devices
- FDA, Device Software Functions Including Mobile Medical Applications: https://www.fda.gov/medical-devices/digital-health-center-excellence/device-software-functions-including-mobile-medical-applications
- FDA, Policy for Device Software Functions and Mobile Medical Applications: https://www.fda.gov/regulatory-information/search-fda-guidance-documents/policy-device-software-functions-and-mobile-medical-applications
- FTC, Health Products Compliance Guidance: https://www.ftc.gov/business-guidance/resources/health-products-compliance-guidance
- FTC, Complying with the Health Breach Notification Rule: https://www.ftc.gov/business-guidance/resources/complying-ftcs-health-breach-notification-rule-0
- HHS OCR, Resources for Mobile Health Apps Developers: https://www.hhs.gov/hipaa/for-professionals/special-topics/health-apps/index.html
- HHS OCR, HIPAA business associate guidance: https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html

These sources should be rechecked before launch and after any major product change.

## Operating Rule

When there is tension between usefulness, engagement, scientific complexity, personalization, and user safety, GutWise must choose safety and clarity.

The product should be useful because it is careful.
