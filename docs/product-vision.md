# GutWise Product Vision

## Document Purpose

This document defines the product vision for GutWise. It explains what the application is, who it serves, what value it should create, what evidence standards it should aspire to, and what boundaries must guide product, backend, AI, data, and business decisions.

GutWise handles sensitive health-adjacent data, including bowel movements, symptoms, nutrition, hydration, sleep, stress, exercise, medications, menstrual cycle context, and optional medical background. Because of this, the product vision must be tied directly to evidence quality, user safety, privacy, regulatory restraint, and responsible communication.

This document is an internal source of truth for building GutWise.

## Product Thesis

GutWise is a gut-health intelligence and self-reflection platform that helps users transform personal health and lifestyle logs into structured, evidence-aware pattern insights.

GutWise combines two forms of evidence:

1. Personal evidence: the user's own longitudinal logging data.
2. Reference evidence: reviewed scientific, clinical, nutrition, medication, and movement-related knowledge that helps contextualize observed patterns.

The application helps users observe relationships across bowel movements, symptoms, food, hydration, sleep, stress, exercise, medications, menstrual cycle context, and optional medical background. GutWise should make personal patterns easier to notice, organize, understand, and discuss with a qualified healthcare professional.

GutWise does not diagnose, treat, prescribe, cure, or claim to prevent disease. It is not a medical device, clinician replacement, emergency tool, or treatment-planning system.

## North Star

GutWise should help a user answer:

> "What patterns are emerging in my gut-health data, how strong is the evidence, what scientific context may help me understand them, what should I keep tracking, and what should I discuss with a healthcare professional?"

The product succeeds when users feel more organized, informed, and prepared without being pushed toward unsupported medical conclusions.

## Mission

GutWise exists to help people better understand their digestive patterns through careful tracking, structured analysis, evidence-aware interpretation, and responsible health education.

GutWise should make gut-health reflection more systematic, less overwhelming, and more useful for everyday self-awareness and clinical conversations.

## Social Impact Mission

GutWise also has a social mission.

The company intends to donate 10% of net proceeds quarterly toward nutrition supplementation support for underprivileged communities, with a particular focus on foster care communities.

This mission should be handled with transparency, accountability, and legal/financial care. Public statements about donations must clearly define "net proceeds," identify donation recipients or recipient criteria when possible, and avoid implying that purchasing GutWise directly provides medical care or guaranteed nutritional outcomes to any specific individual.

This social impact mission is part of the company's values, but it must remain separate from product health claims. GutWise should not use charitable giving language to increase medical trust in the app's insights.

## Target Users

GutWise is designed for adults who want to better understand digestive patterns over time.

Primary users include:

- People tracking recurring digestive symptoms.
- People trying to identify lifestyle, nutrition, stress, sleep, medication, hydration, exercise, or cycle-related patterns.
- People preparing clearer summaries for clinician visits.
- People managing complex gut-health context who need a structured record of observations.
- People who want evidence-aware insight rather than generic wellness advice.
- People who want to understand how gut-health patterns may relate to broader lifestyle and physiology.

GutWise is not designed for children, emergency medical situations, acute symptom triage, diagnosis, disease management without clinician involvement, or treatment decision-making.

## Core User Problems

Users often struggle to understand gut-health patterns because relevant data is scattered, subjective, inconsistent, and hard to compare over time.

GutWise should address these problems:

1. Fragmented tracking
   Users may log food, bowel movements, symptoms, stress, sleep, hydration, medications, menstrual cycle context, and movement in separate places or not at all.

2. Poor memory over time
   Digestive patterns often emerge across days or weeks, not in a single moment. Users need cumulative context.

3. Unclear relationships
   Users may suspect that certain foods, hydration patterns, stress levels, sleep changes, medications, exercise habits, or cycle phases affect symptoms, but need structured comparison before drawing conclusions.

4. Lack of scientific context
   Users may not know what current literature or trusted references suggest about hydration, stool consistency, sleep, stress, movement, menstrual cycle changes, medications, food components, or symptom patterns.

5. Overconfident health apps
   Many tools imply causation or provide generic recommendations without showing evidence quality. GutWise should be more careful.

6. Difficult clinician communication
   Users often struggle to summarize their experience clearly. GutWise should help organize observations into clinician-ready reports without pretending to be a clinician.

## Product Promise

GutWise promises to be:

- Personalized: Insights should be based on the user's own logs and context.
- Cumulative: The product should become more useful as the user logs over time.
- Evidence-aware: Insights should show data sufficiency, uncertainty, contradictions, and evidence gaps.
- Science-informed: Educational context should come from reviewed scientific, clinical, nutrition, medication, and lifestyle evidence.
- Non-diagnostic: GutWise should never tell a user they have, likely have, or probably have a disease or condition.
- Contextual: Medical context may influence interpretation, but only as user-provided or document-backed background.
- Transparent: Users should understand why an insight appeared and what data supports it.
- Private by design: Health data should be treated as sensitive by default.
- Clinician-compatible: Outputs should help users communicate with professionals, not replace them.
- Mission-aligned: Business success should support both product sustainability and the company's nutrition-access donation mission.

## Core Product Capabilities

GutWise should evolve around six core capabilities.

### 1. Structured Health Logging

GutWise should make it easy to capture consistent, useful data across:

- Bowel movements
- Symptoms
- Meals and food items
- Hydration
- Sleep
- Stress
- Exercise and movement
- Medications and supplements
- Menstrual cycle context
- Daily absence confirmations
- Optional medical context
- Optional document-backed medical facts

Logging should balance structure and usability. The product should prefer structured fields where they improve analysis, while avoiding forms that are too burdensome for daily use.

### 2. Normalized Personal Data

GutWise should gradually transform raw entries into structured data that can be compared across time.

This includes:

- Canonical event formats
- Daily feature aggregation
- Food and ingredient normalization
- Medication normalization
- Baseline calculation
- Evidence-backed reference data
- User-specific medical context
- Document-backed fact review

Raw user entries should remain available, but intelligence should rely on normalized, auditable data wherever possible.

### 3. Scientific Knowledge Backbone

GutWise should maintain a backend knowledge layer that organizes scientific and clinical reference facts by domain.

The knowledge backbone should support:

- Bowel movement and stool science
- Hydration science
- Food, ingredient, and nutrition science
- Medication and supplement gut-effect context
- Symptom science
- Sleep and circadian science
- Stress and gut-brain axis context
- Menstrual cycle and digestive-pattern context
- Exercise and movement science
- Medical context and red-flag safety guidance

This reference layer should not directly diagnose users. Instead, it should help analyzers, assemblers, reports, and explanations understand what kinds of relationships are biologically plausible, evidence-supported, uncertain, or safety-sensitive.

### 4. Pattern Intelligence

GutWise should identify patterns across logs using deterministic, testable logic before any AI-generated explanation is shown.

Pattern intelligence should include:

- Exposure and outcome comparison
- Baseline versus exposed-day analysis
- Support counts
- Contradiction counts
- Recency weighting
- Data sufficiency
- Evidence quality
- Missing-data detection
- Multifactor pattern detection
- User-specific context modifiers
- Relevant scientific context from the knowledge backbone

The system should identify observed associations, not medical conclusions.

### 5. Evidence-Bound Explanations

GutWise may use language models to explain structured findings, but the model must not invent insights.

AI-generated explanations must be constrained to:

- Explain only pre-ranked structured findings.
- Use association language.
- Mention uncertainty when evidence is limited.
- Include scientific context only when linked to reviewed reference claims.
- Avoid diagnosis, treatment, prescriptions, dosing, or unsupported causal claims.
- Avoid generic filler.
- Preserve the evidence boundaries of the underlying data.

The deterministic intelligence layer and reviewed evidence backbone are the sources of truth. The language model is only an explanation layer.

### 6. Clinician-Ready Reporting

GutWise should help users summarize their patterns for professional discussion.

Reports should emphasize:

- Observed patterns
- Analysis windows
- Supporting data
- Contradictions
- Data gaps
- User-entered medical context
- Document-backed facts where available
- Relevant scientific context
- Clear disclaimers that reports are not clinical diagnoses

Reports should help users communicate better, not self-diagnose.

## Evidence Philosophy

GutWise should be built around layered evidence.

### Personal Evidence

Personal evidence comes from the user's own logs. It can support statements like:

- "Your logs show..."
- "On days when X was logged, Y appeared more often..."
- "This pattern is emerging but limited..."
- "There is not enough contrast data yet..."

Personal evidence should never be treated as proof of disease, causation, or treatment need.

### Reference Evidence

Reference evidence comes from reviewed scientific literature, clinical references, nutrition databases, medication references, institutional guidance, and other trusted sources.

Reference evidence can support statements like:

- "Hydration status is commonly discussed in relation to stool consistency."
- "Some medication classes are known to have gastrointestinal side effects."
- "Sleep and stress may influence digestive symptoms through gut-brain pathways."

Reference evidence should be versioned, reviewed, and traceable.

### Explanation Evidence

AI-generated text is not evidence. It is a communication layer.

The LLM should only explain:

- Structured user-specific findings.
- Reviewed reference facts.
- Evidence limitations.
- Uncertainty.
- Suggested tracking focus.
- When to discuss concerns with a professional.

## Backend Knowledge Vision

GutWise should eventually organize backend intelligence around domain-specific science modules.

Each logging domain should have:

- A structured data model.
- A canonical event representation.
- Daily feature outputs.
- Baseline logic.
- Candidate analyzers.
- Evidence thresholds.
- Relevant science claims.
- Safety rules.
- Explanation constraints.
- Report language standards.

The intended domains are:

- `bowel_movement`
- `symptom`
- `food_nutrition`
- `hydration`
- `sleep`
- `stress`
- `exercise_movement`
- `medication`
- `menstrual_cycle`
- `medical_context`

Each domain should be able to answer:

- What was logged?
- What features can be derived?
- What patterns can be analyzed?
- What scientific claims are relevant?
- What safety boundaries apply?
- What language may be shown to users?
- What evidence is missing?

This backend design should allow GutWise to scale from simple logging to evidence-backed intelligence without becoming medically unsafe.

## Intelligence Philosophy

GutWise intelligence should be conservative, transparent, cumulative, and evidence-bound.

The product should prefer saying:

> "Your logs show an association between lower hydration days and harder stool entries over the following day. This is based on your recent entries and should be interpreted cautiously because food, medication, and symptom data may also affect the pattern."

Instead of:

> "You are constipated because you are dehydrated."

GutWise should never convert a correlation into a diagnosis or treatment recommendation.

The intelligence system should answer:

- What was observed?
- How often did it occur?
- Compared to what baseline?
- How strong is the personal evidence?
- What scientific context is relevant?
- What contradicts the pattern?
- What data is missing?
- What should the user keep tracking?
- When should the user seek professional care?

## Safety Positioning

GutWise is a wellness education, tracking, and pattern-awareness product.

GutWise must not:

- Diagnose disease or medical conditions.
- Predict that a user likely has a condition.
- Recommend treatment plans.
- Recommend medication, supplement, or dosing changes.
- Tell users to start, stop, or change prescribed care.
- Replace a clinician.
- Handle emergencies.
- Minimize red-flag symptoms.
- Use scientific literature to imply personalized clinical certainty.

When user data includes red-flag symptoms or serious concerns, GutWise should direct the user toward appropriate professional care or emergency guidance rather than generating an app-based conclusion.

## Marketplace Positioning

GutWise should occupy a distinct position between simple symptom trackers and unsafe AI health advisors.

GutWise is not:

- A generic food diary.
- A calorie-counting app.
- A diagnosis chatbot.
- A treatment protocol generator.
- A disease-management system.
- A replacement for gastroenterology care.
- A literature-search tool without personalization.
- A wellness app making unsupported claims.

GutWise is:

- A personal gut-health intelligence workspace.
- A structured logging and pattern-awareness platform.
- An evidence-aware insight system.
- A science-informed education layer.
- A clinician-conversation preparation tool.
- A privacy-conscious health reflection product.
- A mission-driven company supporting nutrition access.

## Product Principles

Every product decision should follow these principles.

### 1. Evidence Before Explanation

Do not generate user-facing health insight text unless there is structured evidence or the output is clearly marked as exploratory or insufficient.

### 2. Science Supports Context, Not Diagnosis

Scientific literature should help frame possible relationships and educational context. It should not be used to diagnose the user or overstate certainty.

### 3. Association Before Causation

Use association language unless a claim is general educational content backed by reviewed evidence. User-specific observations should not claim causation.

### 4. Safety Before Engagement

Do not make the product more persuasive by making it more medically assertive. User trust depends on restraint.

### 5. Context Without Diagnosis

Medical context can change how insights are prioritized or framed, but it must not turn GutWise into a diagnostic engine.

### 6. Transparency Over Mystery

Users should be able to understand why an insight appeared, what data contributed, what reference evidence informed it, and what data is missing.

### 7. Privacy by Default

Gut-health data, symptoms, medications, documents, and medical context are sensitive. The product should avoid unnecessary collection, exposure, logging, or sharing.

### 8. Sustainable Complexity

New features should strengthen the core intelligence system rather than create disconnected tracking surfaces.

### 9. Mission With Accountability

The donation mission should be specific, trackable, and transparently reported. It should not be vague marketing language.

## Non-Goals

GutWise should not pursue these product directions unless the company intentionally changes its regulatory, clinical, and operational posture:

- Automated diagnosis
- Condition-risk scoring
- Medication recommendations
- Supplement protocols
- Personalized treatment plans
- Lab interpretation for diagnosis
- Emergency triage
- Clinician decision support
- Provider-facing treatment recommendations
- Claims that the product prevents, cures, mitigates, or treats disease
- Claims that charitable donations create direct health outcomes for app users or donation recipients

These non-goals protect the product, the user, the mission, and the business.

## Trust Standard

A GutWise insight should be considered product-ready only if it can answer:

- What user data supports this?
- What time window was analyzed?
- What comparison or baseline was used?
- How much evidence exists?
- What contradicts the pattern?
- What uncertainty should be shown?
- What scientific or reference context is being used?
- Is the reference context traceable to a reviewed source?
- Is the language non-diagnostic?
- Could a reasonable user misread this as medical advice?
- Does the insight suggest tracking, reflection, or professional discussion rather than treatment?

If the answer is unclear, the insight should be revised, downgraded, hidden, or marked as insufficient.

## Social Impact Standard

GutWise's donation mission should be considered product-ready only if it can answer:

- What percentage is being donated?
- What does "net proceeds" mean?
- How often are donations made?
- Which organization or category of organizations receives funds?
- How are foster care communities prioritized?
- How will donation activity be reported?
- Are public claims truthful, specific, and verifiable?
- Has legal and tax guidance been reviewed before public launch?

The donation program should be transparent enough to build trust without turning the mission into vague cause-marketing.

## Long-Term Vision

The long-term vision for GutWise is to become a trusted personal gut-health intelligence layer.

Over time, GutWise should help users build a structured, longitudinal picture of their gut-health patterns by combining:

- Daily self-tracking
- Food and ingredient context
- Hydration context
- Medication and supplement context
- Sleep context
- Stress context
- Movement and exercise context
- Menstrual cycle context
- Symptom context
- Medical history context
- Document-backed evidence
- Scientific reference claims
- Personalized baselines
- Evidence-ranked insights
- Clinician-ready summaries

The product should become more valuable as the user's personal data history and the reference evidence backbone become richer, while remaining careful about uncertainty, safety, and medical boundaries.

GutWise should help users notice patterns earlier, ask better questions, and communicate more clearly with healthcare professionals.

GutWise should not attempt to become the healthcare professional.

## Business Vision

GutWise should be sustainable as a business because it provides trustworthy, careful, useful intelligence in a category where users need both personalization and restraint.

The business should grow through:

- Trustworthy product design.
- Evidence-aware insights.
- Strong privacy posture.
- Responsible AI use.
- Clear medical boundaries.
- Useful clinician-ready reporting.
- Transparent social impact.

GutWise should not grow by exploiting health anxiety, overstating certainty, or presenting unsupported claims as personalized medical truth.

## Success Criteria

GutWise is succeeding if:

- Users can consistently log meaningful gut-health data without excessive friction.
- Insights become more personalized and useful over time.
- Scientific context improves insight quality without creating diagnostic claims.
- Users understand the evidence strength and uncertainty behind each insight.
- User-facing language remains educational and non-diagnostic.
- The product helps users prepare better clinician conversations.
- Sensitive data remains private and account-scoped.
- Health claims are traceable to evidence or clearly marked as exploratory.
- The system avoids unsupported recommendations.
- The backend can support additional evidence and intelligence layers without becoming unsafe or untestable.
- The donation program is transparent, verifiable, and aligned with the company's stated mission.

## Operating Rule

When there is tension between product engagement, user reassurance, medical certainty, scientific complexity, business growth, and safety, GutWise should choose safety and clarity.

The product should be useful because it is careful.
