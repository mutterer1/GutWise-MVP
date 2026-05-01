# GutWise Regulatory Boundaries

## Document Status

First draft. This document defines the regulatory boundaries for GutWise-MVP.

This document should be read with:

- `docs/product-vision.md`
- `docs/backend-architecture.md`
- `docs/health-safety-policy.md`
- `docs/evidence-standards.md`
- `AGENTS.md`

This document is not legal advice, medical advice, regulatory advice, or a final compliance determination. It is an internal operating boundary for product, engineering, AI, data, marketing, and business decisions. Before public launch, qualified counsel and appropriate clinical, privacy, security, and regulatory reviewers should evaluate GutWise's actual implementation, claims, data flows, vendors, and business model.

## Purpose

GutWise is intended to be a gut-health intelligence, personal tracking, wellness education, and clinician-conversation preparation tool.

The purpose of this document is to define boundaries that keep GutWise aligned with:

- A low-risk wellness and self-reflection posture.
- Non-diagnostic, non-treatment product behavior.
- Evidence-bound health communication.
- Privacy and data-security expectations for sensitive health-adjacent data.
- Federal consumer protection expectations for health claims.
- FDA device software and general wellness boundaries.
- HIPAA and health-app posture review triggers.
- Health breach notification readiness.
- Donation and cause-marketing transparency.

The regulatory boundary is not a one-time document. It is a change-control framework. Every major product, backend, AI, data, evidence, marketing, or business change should be evaluated against it.

## Regulatory North Star

GutWise should remain a consumer wellness and education product unless the company intentionally decides, with legal and regulatory review, to pursue a different regulated posture.

The default intended use is:

> GutWise helps adults log personal gut-health and lifestyle data, review evidence-aware observed associations, understand uncertainty, access general science-informed context, and prepare clearer conversations with qualified healthcare professionals.

The default intended use is not:

> GutWise diagnoses, treats, cures, mitigates, prevents, monitors, predicts, or manages disease, or gives patient-specific clinical, medication, supplement, dosing, or treatment recommendations.

## Intended Use Boundary

Regulatory risk is strongly affected by intended use. Intended use can be created by product behavior, marketing language, onboarding claims, app-store text, screenshots, emails, support materials, sales language, AI outputs, reports, and user workflows.

GutWise's allowed intended use includes:

- Personal tracking.
- Pattern awareness.
- Wellness education.
- Evidence-aware self-reflection.
- General science-informed context.
- Clinician-conversation preparation.
- Non-diagnostic report organization.

GutWise's prohibited intended use includes:

- Diagnosis.
- Disease prediction.
- Disease monitoring as a clinical function.
- Disease management.
- Treatment planning.
- Medication or supplement recommendation.
- Dosing guidance.
- Emergency triage.
- Clinical decision support.
- Claims to cure, mitigate, treat, or prevent disease.

Every product surface must support the allowed intended use and avoid implying the prohibited intended use.

## FDA Boundary

GutWise should be designed to remain within a low-risk general wellness and self-reflection posture.

FDA risk increases when software claims or performs functions related to diagnosis, cure, mitigation, prevention, treatment, clinical decision support, patient-specific risk prediction, medical-device data interpretation, or treatment decisions.

### Allowed FDA-Aligned Behavior

GutWise may:

- Track user-entered wellness and lifestyle data.
- Show personal trends and observed associations.
- Provide general educational context.
- Encourage users to discuss concerns with qualified healthcare professionals.
- Route red-flag situations toward professional care without diagnosing or triaging.
- Show evidence limitations and missing data.
- Produce clinician-ready summaries that organize observations.

### FDA Boundary Violations

GutWise must not:

- Tell users they have or likely have a condition.
- Interpret symptom patterns as disease evidence.
- Predict disease risk or flare risk as a clinical conclusion.
- Claim that the app treats, prevents, mitigates, or manages disease.
- Recommend specific treatment, medication, supplement, diet protocol, or dose changes.
- Convert lab results, sensor data, medical images, or clinical documents into diagnoses.
- Provide provider-facing clinical decision support without formal regulatory review.
- Claim that GutWise replaces a clinician or clinical evaluation.

### FDA Review Triggers

Formal regulatory review is required before adding:

- Lab interpretation.
- Wearable or sensor-based clinical interpretation.
- EHR integration that produces clinical conclusions.
- Clinician dashboard features.
- Condition-risk scoring.
- Automated disease or flare prediction.
- Automated triage.
- Treatment recommendation workflows.
- Medication or supplement decision support.
- Provider-facing recommendations.
- Disease-specific management programs.

## FTC Boundary

The FTC expects health-related claims to be truthful, not misleading, and supported by appropriate evidence.

GutWise must apply this to:

- Website copy.
- App-store copy.
- Onboarding.
- Subscription and paywall claims.
- Insight cards.
- Reports.
- Emails.
- Push notifications.
- Social media.
- Fundraising or donation-related claims.
- AI-generated text.
- Support responses.

### Allowed FTC-Aligned Claims

Claims may say:

- GutWise helps users organize gut-health logs.
- GutWise surfaces evidence-aware observed associations.
- GutWise helps users prepare clearer conversations with healthcare professionals.
- GutWise provides general science-informed context when claims are reviewed and source-backed.
- GutWise displays uncertainty and evidence gaps.

### Prohibited or High-Risk Claims

GutWise must not claim:

- It finds the cause of symptoms.
- It diagnoses digestive conditions.
- It prevents flares or disease.
- It cures, treats, mitigates, or manages disease.
- It tells users what to eat for a condition.
- It tells users which medication or supplement to take.
- It provides clinically proven personal outcomes unless that exact claim is substantiated and legally reviewed.
- Its donation program guarantees health outcomes for recipients or users.

### Substantiation Standard

Every objective health-related claim should have:

- A clear claim owner.
- A source or evidence basis.
- Appropriate qualification.
- Review status.
- User-facing language review.
- No conflict with the health-safety policy.
- No implication stronger than the evidence supports.

If the evidence does not support the claim, the claim should not be used.

## HIPAA Boundary

HIPAA applicability depends on the relationship between GutWise, users, covered entities, business associates, and data flows.

GutWise should not assume one permanent HIPAA status. HIPAA posture can change as the product changes.

### Consumer-Directed Posture

If GutWise is offered directly to consumers for their own personal tracking and self-reflection, GutWise may not be acting as a HIPAA covered entity or business associate.

Even in a consumer-directed posture, GutWise should treat health data as sensitive and use PHI-like safeguards.

### HIPAA Review Triggers

Formal HIPAA and business-associate review is required before adding:

- Provider portals.
- Clinician dashboards.
- EHR integrations.
- Clinic-sponsored accounts.
- Health-plan integrations.
- Employer health programs.
- Referrals from covered entities with data sharing.
- Care-team workflows.
- Provider-facing reports sent directly by GutWise.
- Any contract where GutWise performs services for a covered entity or business associate involving protected health information.

### HIPAA-Aligned Safeguards Even When HIPAA Does Not Apply

GutWise should still maintain:

- Account-scoped access.
- Row-level security.
- Least-privilege service access.
- Minimal collection.
- Minimal retention.
- Sensitive-data logging restrictions.
- Vendor review.
- Incident-response readiness.
- Clear privacy disclosures.

## FTC Health Breach Notification Boundary

Health apps outside HIPAA may still have obligations under the FTC Health Breach Notification Rule.

GutWise should assume that unauthorized access, acquisition, or disclosure of identifiable health information may create legal notification obligations.

GutWise must maintain readiness for:

- Incident detection.
- Incident investigation.
- Vendor coordination.
- Data-category identification.
- User notification analysis.
- FTC or other notification analysis.
- State breach law analysis.
- Remediation documentation.

### Breach Risk Triggers

Escalate immediately if:

- User health logs are exposed.
- Medical documents are exposed.
- Medications, symptoms, or diagnoses are exposed.
- Tokens or credentials are exposed.
- Cross-user access occurs.
- A vendor receives unauthorized health data.
- Health data is shared for advertising or tracking outside user expectations.
- Raw LLM prompts or outputs expose identifiable health data without appropriate controls.

## Privacy and Consumer Health Data Boundary

GutWise should treat all health-adjacent data as sensitive even if a specific statute does not classify it as PHI.

Sensitive data includes:

- Bowel movement logs.
- Symptom logs.
- Food and ingredient logs.
- Hydration logs.
- Sleep logs.
- Stress logs.
- Exercise logs.
- Medication and supplement logs.
- Menstrual cycle logs.
- Medical context.
- Uploaded documents.
- Evidence segments.
- AI-generated explanations about health data.
- Reports.
- Account identifiers tied to health data.

GutWise should not:

- Sell health data.
- Share health data for behavioral advertising.
- Use sensitive health logs for model training without explicit consent and governance.
- Send raw sensitive data to unnecessary vendors.
- Log raw health entries in application logs.
- Display one user's information to another user.
- Use donation or social-impact messaging to obscure data practices.

Before launch, GutWise should review applicable federal and state consumer health privacy laws based on where users live and how data is processed.

## AI and LLM Regulatory Boundary

GutWise may use LLMs only as constrained explanation tools.

The LLM must not be treated as:

- A clinician.
- A diagnostic engine.
- A treatment planner.
- An evidence source.
- A safety authority.
- A replacement for deterministic analysis.

Allowed LLM role:

- Explain pre-ranked structured findings.
- Restate evidence summaries in plain language.
- Include reviewed reference context supplied by the backend.
- Acknowledge uncertainty.
- Encourage professional discussion where appropriate.

Prohibited LLM role:

- Invent findings.
- Infer diagnoses.
- Recommend treatment.
- Recommend medications or supplements.
- Recommend dosing.
- Claim causation.
- Minimize red flags.
- Use unreviewed literature as authority.

LLM input and output must follow `docs/health-safety-policy.md` and `docs/evidence-standards.md`.

## Scientific Claims Boundary

Scientific literature can support general educational context, but it does not authorize user-specific clinical conclusions.

GutWise may use scientific claims only when they are:

- Stored as narrow claims.
- Linked to a source.
- Versioned or retrieval-dated.
- Assigned a claim type.
- Assigned an evidence grade.
- Reviewed before user-facing use.
- Linked to app entities.
- Written in non-diagnostic language.

GutWise must not:

- Use raw literature excerpts as unrestricted prompt material.
- Use LLM-generated scientific claims as evidence.
- Convert population findings into personal conclusions.
- Use weak evidence to make strong marketing claims.
- Use source-backed context to imply diagnosis, treatment, or disease prevention.

## Medical Context Boundary

Medical context may help GutWise frame patterns, but it must not become an automated clinical interpretation layer.

Allowed:

- Store user-reported medical context.
- Store document-backed facts after review.
- Distinguish user-reported, confirmed, candidate, and document-backed facts.
- Use medical context for caution annotations.
- Help users prepare clinician-ready summaries.

Prohibited:

- Infer a diagnosis from symptoms.
- Promote suspected conditions into confirmed conditions without review.
- Tell users what their medical context means clinically.
- Recommend changes to treatment.
- Interpret documents as new diagnoses without professional review.
- Turn medical context into disease-management advice.

## Red-Flag and Emergency Boundary

GutWise is not an emergency tool.

GutWise may:

- Identify that a logged symptom or context may warrant professional attention.
- Route users toward professional care or emergency services.
- Say GutWise cannot evaluate urgent symptoms.

GutWise must not:

- Decide whether a situation is or is not an emergency.
- Reassure users that red-flag symptoms are harmless.
- Provide home-treatment instructions for serious symptoms.
- Rank emergency severity.
- Delay care by asking users to continue logging first.

If red-flag data appears, the safest product behavior is care-routing, not app-generated conclusion.

## Reports and Clinician-Ready Output Boundary

Reports should organize observations for discussion. Reports must not become clinical documents that diagnose or prescribe.

Allowed report functions:

- Summarize logs.
- Show time windows.
- Show observed associations.
- Show evidence gaps.
- Show user-entered or document-backed context.
- Show reviewed general reference context.
- Encourage professional review.

Prohibited report functions:

- Diagnosis.
- Treatment plan.
- Medication recommendation.
- Supplement protocol.
- Clinical risk score.
- Disease progression assessment.
- Provider-facing instruction without regulatory review.

Reports should include clear non-diagnostic framing.

## Donation and Cause-Marketing Boundary

GutWise's product vision includes a social impact mission: donating 10% of net proceeds quarterly toward nutrition supplementation support for underprivileged communities, with a focus on foster care communities.

This mission creates transparency and compliance responsibilities.

Donation-related claims must:

- Define "net proceeds."
- State the donation percentage.
- State donation timing.
- Identify recipient organizations or recipient criteria when possible.
- Avoid implying guaranteed nutritional or medical outcomes.
- Avoid implying that buying GutWise directly provides care to a specific child or person.
- Be supported by records.
- Be reviewed for charitable solicitation, commercial co-venture, tax, accounting, and advertising compliance before public launch.

Donation-related claims must not:

- Increase trust in GutWise's health insights.
- Substitute for evidence.
- Imply clinical benefit.
- Obscure pricing, subscription, cancellation, or data practices.

Public donation claims require legal/accounting review before launch.

## Children and Age Boundary

GutWise is intended for adults.

The product should not knowingly collect data from children. Before allowing teen, child, parent-managed, school, foster-care agency, or pediatric use cases, GutWise must undergo legal, privacy, safeguarding, clinical, and product review.

Review is required before:

- Allowing users under 18.
- Parent-managed profiles.
- Foster-care agency integrations.
- School or youth-program partnerships.
- Pediatric symptom tracking.
- Pediatric reports.
- Any collection that may implicate children's privacy laws.

The social impact mission focused on foster care communities must not be confused with product eligibility for foster youth or minors.

## Marketing and Public Claims Boundary

Marketing claims must match the actual product.

Allowed positioning:

- Personal gut-health tracking.
- Evidence-aware pattern awareness.
- Science-informed educational context.
- Clinician-conversation preparation.
- Privacy-conscious health reflection.

Prohibited positioning:

- AI doctor.
- Diagnosis engine.
- Treatment planner.
- Disease prevention app.
- Medication or supplement advisor.
- Guaranteed symptom improvement.
- Clinically proven personal results without exact substantiation.

Marketing must not claim more than the backend, evidence model, and safety policy can support.

## Feature Classification Matrix

| Feature or Claim | Default Regulatory Posture | Required Action |
| --- | --- | --- |
| Personal logging | Allowed wellness tracking | Keep data account-scoped and private |
| Observed associations | Allowed if evidence-bound | Show uncertainty and no causation |
| General science context | Allowed if reviewed | Link to reviewed reference claims |
| LLM explanations | Allowed if constrained | Validate output before display |
| Clinician-ready reports | Allowed if observational | Avoid diagnosis and treatment |
| Red-flag routing | Allowed care-routing | Do not triage or reassure |
| Medication context | High caution | No start, stop, substitute, or dosing advice |
| Supplement context | High caution | No protocols or dosing |
| Lab interpretation | High regulatory risk | Legal/regulatory/clinical review required |
| Condition-risk score | High regulatory risk | Legal/regulatory/clinical review required |
| Disease-specific management | High regulatory risk | Legal/regulatory/clinical review required |
| Provider dashboard | HIPAA/FDA/CDS review trigger | Formal review required |
| EHR integration | HIPAA/FDA/privacy review trigger | Formal review required |
| Wearable clinical interpretation | FDA/privacy review trigger | Formal review required |
| Donation claims | Cause-marketing review trigger | Legal/accounting review required |

## Change-Control Review Triggers

Before implementation or release, regulatory review is required for:

- Any disease-specific claim.
- Any condition-risk scoring.
- Any treatment recommendation.
- Any medication or supplement guidance.
- Any new LLM prompt that can produce health language.
- Any new report section with health interpretation.
- Any medical document extraction that produces facts or summaries.
- Any new source-ingestion pipeline.
- Any public health claim.
- Any provider, clinic, insurer, employer, EHR, or agency integration.
- Any feature involving minors.
- Any wearable, lab, sensor, genetic, or device data.
- Any sale, sharing, or transfer of health data.
- Any donation or charitable-sales promotion claim.

If a feature creates ambiguity about regulatory posture, the default decision is to pause and review before implementation.

## Regulatory Review Checklist

For every major feature or public claim, answer:

- What is the intended use?
- Could a reasonable user understand this as diagnosis?
- Could a reasonable user understand this as treatment advice?
- Does this claim to cure, mitigate, treat, or prevent disease?
- Does this produce a patient-specific clinical conclusion?
- Does this rely on reviewed evidence?
- Is the evidence strength accurately represented?
- Does this use an LLM only as a constrained explanation layer?
- Does this involve PHI or HIPAA-covered workflows?
- Does this involve identifiable consumer health data?
- Does this involve vendors receiving sensitive health data?
- Could this trigger health breach notification obligations?
- Could this involve children or protected populations?
- Could this trigger charitable solicitation or cause-marketing requirements?
- Are privacy, terms, marketing, and product behavior aligned?

If any answer is uncertain, escalation is required.

## Cross-Document Alignment Rules

The foundation documents must stay aligned.

### Product Vision Alignment

`docs/product-vision.md` defines what GutWise is trying to become. Regulatory boundaries constrain that vision so it remains safe, credible, and viable.

If the Product Vision expands into diagnosis, treatment, disease management, or pediatric use, this document must be updated and reviewed before product work begins.

### Backend Architecture Alignment

`docs/backend-architecture.md` defines the backend layers that enforce safety. Regulatory boundaries require those layers to preserve account scope, evidence traceability, output validation, source review, and non-diagnostic behavior.

If backend architecture moves intelligence into uncontrolled prompts, unreviewed claims, or client-owned health rules, this document is being violated.

### Health Safety Policy Alignment

`docs/health-safety-policy.md` defines what GutWise may and may not say or do. Regulatory boundaries make those health-safety rules part of product posture and compliance risk management.

If a feature violates health safety, it likely also creates regulatory risk.

### Evidence Standards Alignment

`docs/evidence-standards.md` defines what counts as evidence. Regulatory boundaries require health, nutrition, medication, and donation claims to remain traceable, truthful, qualified, and not misleading.

If evidence is missing, weak, unreviewed, or contradicted, the product must not make a strong claim.

## Incident and Escalation Policy

Escalate immediately if GutWise:

- Produces diagnostic language.
- Produces treatment language.
- Produces medication or supplement guidance.
- Claims causation without evidence.
- Exposes user health data.
- Displays another user's data.
- Uses unreviewed claims as authoritative.
- Shares health data with an unauthorized third party.
- Makes public claims that exceed evidence.
- Makes donation claims that are not verifiable.
- Receives notice from a regulator, platform, partner, user, clinician, or vendor about safety, privacy, or claim concerns.

Escalation should include:

- Disable or hide the unsafe path where possible.
- Preserve technical evidence without exposing sensitive data.
- Identify affected users and data categories.
- Review legal, regulatory, privacy, and notification obligations.
- Document root cause.
- Update tests, prompts, copy, docs, or architecture to prevent recurrence.

## Federal Reference Sources

This document is informed by the following official federal sources:

- FDA, General Wellness: Policy for Low Risk Devices: https://www.fda.gov/regulatory-information/search-fda-guidance-documents/general-wellness-policy-low-risk-devices
- FDA, Device Software Functions Including Mobile Medical Applications: https://www.fda.gov/medical-devices/digital-health-center-excellence/device-software-functions-including-mobile-medical-applications
- FDA, Policy for Device Software Functions and Mobile Medical Applications: https://www.fda.gov/regulatory-information/search-fda-guidance-documents/policy-device-software-functions-and-mobile-medical-applications
- FDA, Clinical Decision Support Software guidance: https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software
- FTC, Health Products Compliance Guidance: https://www.ftc.gov/business-guidance/resources/health-products-compliance-guidance
- FTC, Advertising and Marketing Basics: https://www.ftc.gov/business-guidance/advertising-marketing/advertising-marketing-basics
- FTC, Complying with the Health Breach Notification Rule: https://www.ftc.gov/business-guidance/resources/complying-ftcs-health-breach-notification-rule-0
- HHS OCR, Resources for Mobile Health Apps Developers: https://www.hhs.gov/hipaa/for-professionals/special-topics/health-apps/index.html
- HHS OCR, Business Associates guidance: https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html
- FTC, Children's Privacy and COPPA: https://www.ftc.gov/business-guidance/privacy-security/childrens-privacy
- IRS, Publication 526 Charitable Contributions: https://www.irs.gov/publications/p526

These sources should be rechecked before launch and after any major product, claim, evidence, data-flow, donation, or business-model change.

## Operating Rule

GutWise should choose the least risky truthful claim that still helps the user.

When regulatory posture is unclear, pause and review. When evidence is limited, qualify the claim. When user safety is at stake, route to professional care. When a feature would make GutWise more medically powerful, assume it also makes GutWise more regulated until reviewed.
