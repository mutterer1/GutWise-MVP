# GutWise Evidence Standards

## Document Status

First draft. This document defines the evidence standards for GutWise-MVP.

This document should be read with:

- `docs/product-vision.md`
- `docs/backend-architecture.md`
- `docs/health-safety-policy.md`
- `AGENTS.md`

The purpose of this document is to define what counts as evidence in GutWise, how evidence should be graded and used, how scientific literature should enter the backend, and how evidence must constrain insights, reports, and LLM-generated explanations.

This document is not legal, medical, regulatory, or clinical advice. Before public launch, qualified legal, clinical, regulatory, and scientific reviewers should review GutWise's claims, evidence model, source policy, and user-facing language.

## Core Evidence Principle

GutWise should be useful because it is careful.

Every health-related statement shown to a user must be supported by one of the following:

- The user's own logged data.
- A reviewed reference claim.
- A user-entered or document-backed medical context fact.
- A clearly marked lack of evidence, uncertainty, or evidence gap.

GutWise must never use evidence to create diagnosis, treatment, medication guidance, supplement protocols, dosing advice, disease-prevention claims, or individualized clinical certainty.

## Evidence Goals

GutWise evidence standards exist to:

- Keep personal pattern insights grounded in user data.
- Keep scientific context traceable to reviewed sources.
- Prevent LLMs from inventing findings or overstating certainty.
- Make uncertainty visible.
- Separate user observations from general scientific claims.
- Help users prepare better clinician conversations without replacing clinicians.
- Support federal truth-in-advertising expectations for health-related claims.
- Keep the backend architecture testable and auditable.

## Evidence Streams

GutWise recognizes six evidence streams.

### 1. Personal Log Evidence

Personal log evidence comes from user-entered logs and derived daily features.

Examples:

- Bowel movement entries.
- Symptom entries.
- Food and ingredient entries.
- Hydration entries.
- Sleep entries.
- Stress entries.
- Exercise and movement entries.
- Medication and supplement entries.
- Menstrual cycle entries.
- Daily absence confirmations.

Permitted use:

- Observed associations.
- Personal baselines.
- Trend summaries.
- Evidence gaps.
- Clinician-ready summaries.

Not permitted:

- Diagnosis.
- Disease prediction.
- Treatment recommendations.
- Medication or supplement guidance.
- Causal certainty.
- Clinical abnormality claims.

### 2. Derived Personal Evidence

Derived personal evidence comes from deterministic backend processing of logs.

Examples:

- Canonical events.
- Daily features.
- User baselines.
- Exposure counts.
- Support counts.
- Contrast counts.
- Contradiction counts.
- Data sufficiency.
- Recency weighting.
- Evidence quality.
- Candidate ranking.

Permitted use:

- Ranking observed patterns.
- Explaining why a pattern appeared.
- Explaining why a pattern is not ready.
- Showing missing log types or insufficient contrast data.

Not permitted:

- Presenting derived metrics as clinical measurements.
- Treating personal baselines as medical reference ranges.
- Using a high-ranked pattern as proof of cause.
- Escalating a ranked pattern into diagnosis or treatment.

### 3. Reviewed Reference Evidence

Reviewed reference evidence comes from external sources that have been reviewed and entered into GutWise's evidence backbone.

Examples:

- Peer-reviewed literature.
- Government or institutional guidance.
- Nutrition databases.
- Food ingredient databases.
- Medication vocabularies.
- Drug label databases.
- Clinically reviewed internal seed facts.

Permitted use:

- General educational context.
- Plausibility context for analyzers.
- Caution language.
- Report context.
- LLM explanation context when supplied through approved claims.

Not permitted:

- Direct user-specific diagnosis.
- Direct treatment instruction.
- Unqualified claims of causation.
- Applying a population finding as a clinical conclusion about one user.
- Passing raw literature into the LLM as unrestricted authority.

### 4. Document-Backed Medical Context

Document-backed medical context comes from uploaded or reviewed documents, accepted candidate facts, and evidence segments.

Examples:

- A user-accepted medication list extracted from a document.
- A user-confirmed diagnosis statement from a document.
- A cited procedure history.
- A clinician-shared diet instruction.

Permitted use:

- Contextualizing user logs.
- Adding caution annotations.
- Distinguishing confirmed, user-reported, candidate, and document-backed facts.
- Preparing clinician-ready summaries.

Not permitted:

- Inferring a new diagnosis from the document.
- Treating extracted candidates as active facts before review.
- Generating treatment recommendations.
- Displaying raw document text unnecessarily.

### 5. Safety Evidence

Safety evidence includes red-flag markers, contraindication-like cautions, medication side-effect context, and other cautionary signals.

Permitted use:

- Routing users toward professional care.
- Downgrading confidence.
- Adding caution language.
- Preventing unsafe output.

Not permitted:

- Emergency triage conclusions.
- Statements that symptoms are or are not serious.
- Reassurance that professional care is unnecessary.
- Automated clinical risk stratification.

### 6. LLM Output

LLM output is not evidence.

LLM output is a communication layer that may explain structured evidence supplied by GutWise. It must not create new evidence, invent patterns, introduce new health claims, or expand beyond approved inputs.

## Evidence Model in the Backend

GutWise should use the backend evidence backbone described in `docs/backend-architecture.md`.

Current evidence-related types and tables include:

- `ReferenceSourceType`
- `ReferenceAccessModel`
- `ScienceClaimDomain`
- `ScienceClaimType`
- `EvidenceGrade`
- `ScienceClaimReviewStatus`
- `ReferenceClaimEntityKind`
- `ReferenceClaimRelationship`
- `SourceRecordReviewStatus`
- `reference_sources`
- `reference_source_versions`
- `science_claims`
- `reference_claim_links`
- `food_source_records`
- `medication_source_records`

This model should support reviewable, source-backed claims rather than ad hoc text embedded in analyzers, prompts, or UI copy.

## Source Standards

Every source used for user-facing scientific or health context should be recorded with:

- Provider name.
- Provider key.
- Source type.
- Source URL when available.
- Access model.
- Version or retrieval date.
- Last checked date.
- Active/inactive state.
- Notes about scope and limitations.

Source records should be versioned when a source changes over time.

## Accepted Source Types

GutWise may use these source categories, matching the current `ReferenceSourceType` model.

### Peer-Reviewed Literature

Use for:

- Mechanisms.
- Associations.
- Evidence summaries.
- Domain-specific scientific context.

Requirements:

- Prefer systematic reviews, meta-analyses, clinical guidelines, and well-designed human studies.
- Assess relevance to the exact claim.
- Record limitations.
- Avoid relying on single studies for strong claims unless the claim is narrow and carefully qualified.

### Institutional Guidance

Use for:

- General definitions.
- red-flag context.
- public health or clinical education.
- safety framing.

Examples may include federal agencies, professional societies, or established clinical institutions.

Requirements:

- Prefer current official guidance.
- Record publication or review date when available.
- Avoid converting general guidance into user-specific medical instruction.

### Nutrition Databases

Use for:

- Nutrient estimates.
- Food item reference data.
- Serving metadata.
- Ingredient or nutrition context.

Requirements:

- Record provider, version, retrieval date, and confidence.
- Treat estimates as estimates.
- Preserve coverage and missingness indicators.

### Food Ingredient Databases

Use for:

- Ingredient composition.
- Ingredient aliases.
- Ingredient signal mapping.
- Food category context.

Requirements:

- Record source confidence.
- Distinguish structured ingredient data from heuristic inference.
- Avoid labeling a food as universally harmful or safe.

### Medication Vocabularies and Drug Label Databases

Use for:

- Medication names.
- Brand/generic mapping.
- Route.
- Class/family.
- Label sections.
- known gastrointestinal adverse-reaction context.

Requirements:

- Prefer official vocabularies or label sources where possible.
- Distinguish label-backed effects from user-specific medication effects.
- Never recommend medication changes.

### Internal Seed Evidence

Use for:

- Early structured defaults.
- Product taxonomy.
- Domain labels.
- Review workflow bootstrapping.

Requirements:

- Mark as internal.
- Keep evidence grade conservative.
- Replace with reviewed external evidence when possible.
- Do not present internal seed facts as external scientific authority.

## Source Quality Tiers

GutWise should evaluate sources using conservative tiers.

### Tier A: Authoritative Reviewed Evidence

Examples:

- Federal agency guidance.
- Professional society guidance.
- Systematic reviews.
- Meta-analyses.
- Official drug labels.
- Official nutrition databases.

Allowed use:

- Stronger general educational context.
- Definitions.
- Safety flags.
- Reference-backed caution language.

Still prohibited:

- Diagnosis.
- Treatment recommendations.
- User-specific clinical conclusions.

### Tier B: Peer-Reviewed Primary Evidence

Examples:

- Human clinical studies.
- Cohort studies.
- Case-control studies.
- Mechanistic human research.

Allowed use:

- Carefully qualified educational context.
- Association or mechanism claims.
- Support for candidate plausibility.

Limitations:

- Single studies should rarely support strong claims.
- Observational evidence should not be treated as causal proof.
- Study population and context must match the intended claim.

### Tier C: Structured Reference Data

Examples:

- Food composition records.
- Medication vocabulary records.
- Ingredient records.
- Source caches from external providers.

Allowed use:

- Normalization.
- Matching.
- Feature enrichment.
- Coverage indicators.

Limitations:

- Reference data describes entities; it does not prove user-specific effects.

### Tier D: Internal or Heuristic Evidence

Examples:

- Internal seed facts.
- Name-based food matching.
- Tag-derived ingredient signals.
- LLM inference awaiting review.

Allowed use:

- Exploratory features.
- Candidate queues.
- Low-confidence context.
- Review tooling.

Limitations:

- Must not be presented as authoritative.
- Must be marked as heuristic or unreviewed where user-facing.

### Tier E: Not Acceptable as Evidence

Examples:

- LLM-generated claims.
- Marketing copy.
- Testimonials.
- Anecdotes.
- Unreviewed blog posts.
- Social media content.
- Raw user notes from other users.
- Unsupported internal assumptions.

Allowed use:

- None for health claims.

## Evidence Grades

GutWise currently supports these evidence grades:

- `high`
- `moderate`
- `low`
- `emerging`
- `institutional`
- `ungraded`

### High

Use when:

- Evidence comes from strong, consistent, reviewed sources.
- The claim is specific and well-supported.
- Limitations are understood.

Allowed language:

- "Evidence supports..."
- "Reviewed sources describe..."
- "This is a well-established general context..."

Not allowed:

- "This proves your symptom is caused by..."
- "You should treat this by..."

### Moderate

Use when:

- Evidence is generally supportive but not definitive.
- There may be limits in population, study design, or consistency.
- The claim is suitable for educational context with qualification.

Allowed language:

- "May be associated with..."
- "Is commonly discussed in relation to..."
- "Research suggests..."

### Low

Use when:

- Evidence is limited, indirect, inconsistent, or narrow.
- The claim can only support cautious exploratory context.

Allowed language:

- "Limited evidence suggests..."
- "This may be worth tracking..."

### Emerging

Use when:

- Evidence is early and not settled.
- The claim is hypothesis-generating.

Allowed language:

- "Emerging research is exploring..."
- "This should be interpreted cautiously..."

### Institutional

Use when:

- A claim comes from official or institutional guidance rather than a scored study review.
- The claim is educational, definitional, or safety-oriented.

Allowed language:

- "Guidance describes..."
- "This is commonly used as a reference definition..."

### Ungraded

Use when:

- A source or claim has not yet been reviewed.
- A claim is internal seed material.
- Evidence quality is unknown.

Allowed use:

- Internal development.
- Review queues.
- Non-authoritative exploratory context.

User-facing use:

- Avoid unless clearly marked as unreviewed or unsupported.

## Claim Types

GutWise currently supports these claim types:

- `association`
- `mechanism`
- `definition`
- `safety_flag`
- `reference_range`
- `clinical_context`

### Association Claims

Association claims describe relationships between factors.

Allowed:

- "Lower hydration may be associated with harder stool consistency in some contexts."

Not allowed:

- "Low hydration caused your constipation."

### Mechanism Claims

Mechanism claims describe possible biological or physiological pathways.

Allowed:

- "Stress may influence digestive symptoms through gut-brain pathways."

Not allowed:

- "Your stress caused this symptom."

### Definition Claims

Definition claims explain terms, scales, or categories.

Allowed:

- "The Bristol Stool Form Scale describes stool form categories."

Not allowed:

- "Your Bristol value means you have a disease."

### Safety Flag Claims

Safety flag claims identify situations where professional care may be appropriate.

Allowed:

- "Blood in stool can be a reason to seek medical evaluation."

Not allowed:

- "Blood in stool means you have a specific condition."

### Reference Range Claims

Reference range claims require special caution.

Allowed:

- Use only when the range is source-backed and clearly contextual.
- Prefer "reference context" over "normal/abnormal" language.

Not allowed:

- Use app data to diagnose an abnormal medical state.

### Clinical Context Claims

Clinical context claims explain why a topic may matter clinically.

Allowed:

- "Some medication classes list gastrointestinal effects in drug labeling."

Not allowed:

- "Your medication is causing your symptoms."

## Science Claim Review Status

GutWise currently supports these review states:

- `draft`
- `ready_for_use`
- `needs_review`
- `deprecated`

### Draft

Draft claims may be incomplete or unreviewed.

Use:

- Internal authoring only.

User-facing use:

- Not allowed.

### Ready for Use

Ready-for-use claims have been reviewed and can be used in analyzers, reports, and explanations within their scope.

Use:

- Backend analyzers.
- Explanation bundles.
- Reports.
- Educational copy.

Restrictions:

- Must stay within reviewed claim scope.
- Must preserve evidence grade and limitations.

### Needs Review

Needs-review claims require further validation.

Use:

- Internal review workflows.

User-facing use:

- Not allowed.

### Deprecated

Deprecated claims should not be used.

Use:

- Historical trace only.

User-facing use:

- Not allowed.

## Personal Pattern Evidence Standards

Personal pattern insights should be built from deterministic candidate analyzers.

At minimum, a candidate should track:

- Exposure count.
- Support count.
- Contradiction count.
- Baseline or contrast count where applicable.
- Eligible day count.
- Exposed day count.
- Baseline day count.
- Exposed rate.
- Baseline rate.
- Lift where applicable.
- Data sufficiency.
- Evidence quality.
- Recency weighting.
- Supporting log types.
- Missing log types.
- Evidence gaps.
- Analysis window.

Personal pattern evidence must be conservative.

If a pattern lacks exposure days, contrast days, support days, recency, or logging coverage, the output should show an evidence gap instead of a strong claim.

## Candidate Status Standards

GutWise currently uses these candidate statuses:

- `insufficient`
- `exploratory`
- `emerging`
- `reliable`

### Insufficient

Meaning:

- The app does not have enough data to support the pattern.

User-facing language:

- "There is not enough evidence yet."
- "Keep logging to compare this pattern."

Not allowed:

- Displaying as a meaningful health insight.

### Exploratory

Meaning:

- A weak or early pattern may exist, but evidence is limited.

User-facing language:

- "This is an early signal."
- "This may be worth tracking."

Required:

- Clear uncertainty.
- Evidence gaps.

### Emerging

Meaning:

- Repeated observations support a possible association, but the pattern remains non-diagnostic and non-causal.

User-facing language:

- "This pattern has appeared more than once."
- "This may be associated with..."

Required:

- Support count.
- Contrast context.
- Uncertainty.

### Reliable

Meaning:

- The personal pattern has stronger support, better contrast, and lower contradiction than weaker candidates.

User-facing language:

- "This is one of your stronger observed patterns."

Not allowed:

- "Clinically reliable."
- "Causally proven."
- "Diagnostic."
- "Treatment-ready."

## Data Sufficiency Standards

GutWise currently uses these sufficiency states:

- `insufficient`
- `partial`
- `adequate`
- `strong`

Data sufficiency should be computed from user-specific data volume, overlap, contrast, support, and missingness.

It must not be inflated by general scientific plausibility.

Example:

- A hydration-stool relationship may be biologically plausible and source-backed.
- If the user has only two hydration entries and no stool contrast days, the personal evidence remains insufficient.

## Evidence Quality Standards

GutWise currently uses these evidence quality states:

- `very_low`
- `low`
- `moderate`
- `high`

Evidence quality should consider:

- Number of eligible days.
- Exposure count.
- Support count.
- Contrast count.
- Contradiction rate.
- Recency.
- Logging completeness.
- Breadth of supporting log types.
- Structured coverage confidence.
- Missing data.

Evidence quality must not imply clinical certainty.

## Domain Evidence Standards

Each domain should have its own evidence pack.

### Bowel Movement and Stool Science

Evidence should cover:

- Stool form.
- Stool frequency.
- Urgency.
- Incomplete evacuation.
- Blood or mucus flags.
- Bristol context.
- Red-flag routing.

Allowed:

- Observed stool pattern summaries.
- Educational definitions.
- Red-flag care-routing language.

Not allowed:

- Diagnosing constipation, diarrhea, IBS, IBD, infection, bleeding source, malabsorption, or any condition.

### Symptom Science

Evidence should cover:

- Symptom burden.
- Severity.
- Persistence.
- recurrence.
- symptom clusters.
- red flags.

The current backend should eventually add an explicit `symptom_science` domain so symptoms have a first-class evidence home.

Allowed:

- Tracking symptom patterns.
- Showing persistence or recurrence.
- Encouraging professional discussion.

Not allowed:

- Inferring disease from symptoms.

### Food, Ingredient, and Nutrition Science

Evidence should cover:

- Ingredients.
- nutrition estimates.
- fiber.
- fat.
- sugar.
- caffeine.
- alcohol.
- FODMAP-like signals where appropriately sourced.
- food-source coverage.
- ingredient confidence.

Allowed:

- Observed associations between logged foods or ingredient signals and symptoms.
- Educational context about food components.

Not allowed:

- Labeling foods as universally harmful.
- Prescribing diets.
- Creating elimination protocols.
- Telling users to permanently avoid foods.

### Hydration Science

Evidence should cover:

- Hydration totals.
- Water goal context.
- Caffeine and alcohol beverage context.
- Stool consistency context.
- Dehydration red flags.

Allowed:

- Observed associations between lower hydration days and stool or symptom patterns.
- General educational context.

Not allowed:

- Diagnosing dehydration.
- Prescribing fluid intake.
- Treating symptoms through hydration instructions.

### Sleep Science

Evidence should cover:

- Sleep duration.
- Sleep quality.
- Circadian context.
- symptom burden associations.
- gut-brain interaction context.

Allowed:

- Observed associations between shorter or lower-quality sleep entries and symptoms.

Not allowed:

- Diagnosing sleep disorders.
- Treating digestive symptoms through sleep prescriptions.

### Stress Science

Evidence should cover:

- Stress burden.
- Peak stress.
- gut-brain axis context.
- urgency and symptom burden associations.

Allowed:

- Observed associations between stress entries and digestive patterns.

Not allowed:

- Diagnosing anxiety, depression, trauma, or stress-related conditions.
- Claiming stress caused a symptom.

### Exercise and Movement Science

Evidence should cover:

- Movement minutes.
- sedentary or low movement days.
- moderate/vigorous minutes.
- bowel regularity context.
- symptom burden associations.

Allowed:

- Observed associations between movement patterns and bowel or symptom patterns.

Not allowed:

- Prescribing exercise plans.
- Treating constipation or symptoms with specific exercise instructions.

### Medication and Supplement Evidence

Evidence should cover:

- Medication names.
- Generic and brand mappings.
- Medication class.
- Route.
- timing context.
- dose fields as logged context.
- label-backed GI effects.
- interaction flags where sourced.

Allowed:

- Showing that certain logged medications have label-backed GI effects.
- Observing personal associations between medication days and bowel or symptom patterns.
- Encouraging professional discussion.

Not allowed:

- Telling users to start, stop, change, substitute, or dose medications or supplements.
- Claiming a medication caused a symptom.
- Interpreting adverse reactions as a diagnosis.

### Menstrual Cycle Evidence

Evidence should cover:

- Cycle day.
- Cycle phase.
- Bowel movement shifts.
- symptom burden shifts.
- relevant digestive context.

Allowed:

- Observed associations between cycle phase and logged digestive patterns.

Not allowed:

- Diagnosing hormonal disorders, pregnancy status, fertility conditions, or gynecologic disease.

### Medical Context Evidence

Evidence should cover:

- User-reported facts.
- confirmed facts.
- candidate facts.
- document-backed facts.
- provenance.
- active/inactive state.

Allowed:

- Caution modifiers.
- Contextual framing.
- Report background.

Not allowed:

- Inferring new medical facts.
- Treating suspected conditions as confirmed.
- Producing clinical management advice.

## Claim Language Standards

The strength of language must match the strength of evidence.

### Stronger General Context Language

Allowed only for high, institutional, or well-supported moderate claims:

- "Reviewed sources describe..."
- "Official guidance identifies..."
- "Drug labeling lists..."
- "This scale is used to describe..."

### Cautious Context Language

Use for moderate, low, or emerging evidence:

- "May be associated with..."
- "Is commonly discussed in relation to..."
- "Research has explored..."
- "This is a possible context, not a conclusion."

### Personal Pattern Language

Use for user-specific findings:

- "Your logs show..."
- "In your recent entries..."
- "This appeared more often when..."
- "This pattern has limited contrast data..."

### Required Uncertainty Language

Use when evidence is limited:

- "This does not establish cause."
- "Other factors may explain this pattern."
- "The evidence is limited by missing logs."
- "This should be interpreted cautiously."

### Prohibited Language

Do not use:

- "Proves"
- "Confirms"
- "Diagnoses"
- "Caused by" for user-specific patterns
- "Treats"
- "Cures"
- "Prevents"
- "You should take"
- "You should stop"
- "Guaranteed"
- "Clinically proven" unless reviewed by counsel and substantiated for the exact claim

## LLM Evidence Standards

The LLM may only receive:

- Structured candidate findings.
- Evidence summaries.
- Ranking reasons.
- Caution signals.
- Medical context annotations.
- Reviewed reference claim summaries or claim keys.
- Explicit safety constraints.

The LLM must not receive:

- Raw literature dumps as authority.
- Unreviewed claims as if they are ready for use.
- Broad permission to infer causes.
- Broad permission to generate wellness advice.
- Raw sensitive documents unless specifically required and governed by a separate approved workflow.

LLM output must be validated before display.

Validation should check:

- No unexpected insight keys.
- No missing required items.
- No added findings.
- No diagnostic language.
- No treatment language.
- No medication or supplement guidance.
- No unsupported causation.
- Required uncertainty where evidence is limited.

## Evidence Review Workflow

New reference claims should follow this workflow:

1. Identify a narrow claim.
2. Identify source or source set.
3. Record source metadata.
4. Record source version or retrieval date.
5. Assign domain.
6. Assign claim type.
7. Assign evidence grade.
8. Link claim to app entities.
9. Record limitations.
10. Review for safety and user-facing language.
11. Mark as `ready_for_use` only after review.
12. Re-review when source guidance changes or the claim is challenged.

Claims should be narrow enough that they can be audited.

Bad claim:

- "Hydration improves gut health."

Better claim:

- "Hydration status is commonly discussed as one factor that may influence stool consistency, while stool patterns can also be affected by diet, medications, illness, and other factors."

## Evidence Rejection Criteria

Do not use a source or claim for user-facing health context when:

- The source cannot be identified.
- The claim is broader than the evidence.
- The evidence is only anecdotal.
- The source is marketing content.
- The claim implies diagnosis or treatment.
- The source is outdated and contradicted by newer guidance.
- The study population is not relevant and the mismatch cannot be qualified.
- The claim would likely mislead a reasonable user.
- The claim cannot be explained without unsafe medical advice.

## Evidence Maintenance

Evidence should be maintained over time.

Required maintenance practices:

- Track source retrieval dates.
- Track source versions where available.
- Mark deprecated claims.
- Re-review claims after major source updates.
- Keep review notes.
- Preserve claim keys for auditability.
- Avoid deleting claims used in historical outputs unless there is a data-retention reason.
- Prefer deprecation over silent mutation of claim meaning.

## User-Facing Evidence Display

Insight and report payloads should expose enough evidence for users to understand why a finding appeared.

Where appropriate, display:

- Analysis window.
- Support count.
- Exposure count.
- Contrast count.
- Missing log types.
- Evidence quality.
- Candidate status.
- Uncertainty statement.
- Relevant reviewed science context.
- A clear distinction between personal evidence and reference evidence.

Do not overload the user with technical statistics unless the interface provides readable explanations.

## Privacy Standards for Evidence

Evidence standards must respect privacy.

GutWise must not:

- Use one user's logs as evidence for another user's insights.
- Display raw document text unless necessary and authorized.
- Send raw sensitive entries to unnecessary vendors.
- Store raw LLM prompts containing sensitive data unless retention is explicitly justified.
- Use health data for external research or model training without explicit consent and governance.

Evidence should be scoped to the user and minimized where possible.

## Audit Standards

GutWise should be able to answer these questions for any displayed insight:

- What user data supported this?
- What time window was analyzed?
- What baseline or contrast was used?
- What evidence quality was assigned?
- What data was missing?
- What contradictions were found?
- What reference claims were used?
- What source supports each reference claim?
- What review status applied at the time?
- What language constraints were applied?
- Was generated text validated?

If these questions cannot be answered, the insight should not be considered production-ready.

## Testing Standards

Tests should cover:

- Evidence-grade formatting.
- Reference claim filtering.
- Source retrieval and active/inactive filtering.
- Candidate evidence calculations.
- Evidence gaps.
- Data sufficiency.
- Contradiction handling.
- LLM input construction.
- LLM output validation.
- Unsafe language rejection.
- Deprecated claim exclusion.
- Cross-user data isolation.

Evidence standards should be enforced in tests before expanding the analyzer catalog.

## Federal Reference Sources

This policy is informed by:

- FTC, Health Products Compliance Guidance: https://www.ftc.gov/business-guidance/resources/health-products-compliance-guidance
- FDA, Evidence-Based Review System for the Scientific Evaluation of Health Claims: https://www.fda.gov/regulatory-information/search-fda-guidance-documents/guidance-industry-evidence-based-review-system-scientific-evaluation-health-claims
- FDA, Authorized Health Claims That Meet the Significant Scientific Agreement Standard: https://www.fda.gov/food/nutrition-food-labeling-and-critical-foods/authorized-health-claims-meet-significant-scientific-agreement-ssa-standard
- FDA, Qualified Health Claims: https://www.fda.gov/food/nutrition-food-labeling-and-critical-foods/qualified-health-claims
- NIH National Library of Medicine: https://www.nih.gov/about-nih/nih-almanac/national-library-medicine-nlm

These sources should be rechecked before launch and after any major product or claim change.

## Operating Rule

Evidence should make GutWise more useful, not more aggressive.

When evidence is weak, say it is weak. When evidence is missing, say it is missing. When evidence is general, do not make it personal. When evidence is personal, do not make it diagnostic.
