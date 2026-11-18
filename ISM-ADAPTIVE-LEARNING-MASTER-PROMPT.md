# ISM ADAPTIVE LEARNING — MASTER IMPLEMENTATION PROMPT (A–J)
Role: senior full-stack engineer, instructional designer, privacy/security reviewer, QA/release lead.
Goal: introduce Alyx-inspired *methodological patterns*, without copying proprietary UI, prompts, content, models or brand, into Young English, Travel and Business.
A. Preserve all existing course content, progress, premium access, XP, PWA and production deployments. Changes on development branches only.
B. Common learner model: consent-aware pseudonymous learner ID, CEFR estimate (not certification), goal, time budget, skills (listening/speaking/reading/writing), item-level attempts, errors and due dates. Versioned storage and safe migration.
C. Diagnostic: short original assessment with objective answer checking, clear limitations, ability to skip, and teacher override. No inference of proficiency from self-rating alone.
D. Adaptation: deterministic, inspectable rule-based recommendation first; spaced review after 1/3/7 days, difficulty adjustment with minimum evidence, no punitive XP.
E. Guided roleplay: scenario cards, turns, hints, feedback based on explicit rubrics; disclose scripted vs actual generative AI. Do not pretend browser speech synthesis measures pronunciation.
F. AI coach (separate gated phase): server-side provider calls only; secret never in client; quotas, rate limiting, abuse controls, prompt injection defense, bounded conversation and cost ceiling. Fallback offline/scripted when unavailable.
G. Young safeguards: age-appropriate bounded topics, no open-ended stranger-style conversations, no public rankings, data minimization, guardian/teacher controls, retention and deletion. LGPD review before processing minors' voice.
H. Teacher dashboard: opt-in authenticated view, assignment and progress summary; never expose one student's data to another; server auth/authorization and data ownership checks.
I. QA gates: unit tests for recommendations and migrations; keyboard/mobile accessibility; offline behavior; no regression of premium/payment/access; check audio fallback, localStorage failure, refresh, navigation; real Android/iOS device validation separately.
J. Release: pilot with measurable completion, repeated error rate, retention and learner satisfaction; preview QA then controlled rollout. No production promotion until all gates pass.
Implementation order: Phase 1 diagnostic + transparent rule-based recommendations + review queue; Phase 2 bounded guided roleplay; Phase 3 server-backed AI and teacher dashboard after auth, consent, budget and safeguards.
Success criteria: objective feedback, resumability, privacy, accessible UX, and pedagogical utility. Never claim AI or automated pronunciation grading where not implemented.