# SkillScout — EPA Presentation Slides

> Copy each slide into PowerPoint or Google Slides.
> Slides are separated by `---`. Speaker notes are in *italics*.

---

## Slide 1 — Title Slide

# SkillScout
### AI-Powered Interview Question Bank
**End Point Assessment Presentation**

Aadil | 2026

*Good morning/afternoon, and thank you for taking the time to assess my End Point Assessment. My name is Aadil, and today I will be presenting SkillScout.*

---

## Slide 2 — Agenda

# Agenda

| # | Topic | KSBs |
|---|-------|------|
| 1 | Project Overview & Demo | — |
| 2 | Meeting User Needs | K4, K10, K21, S3 |
| 3 | Code Quality | K2, K5, K7, K14, S9, S11, S14, S17, S18, S20, S22 |
| 4 | CI/CD Pipeline + **Live Demo** | K1, K15, S15 |
| — | Break | — |
| 5 | Refreshing & Patching | K8, S5 |
| 6 | Data Persistence | K12, S7 |
| 7 | Operability | K11, S6, S19, B3 |
| 8 | Automation | K13, K17, S12 |
| 9 | Data Security | K16, S10 |

---

## Slide 3 — What is SkillScout?

# What is SkillScout?

- 🎯 AI-powered interview preparation platform
- 📚 Centralised question bank with search & filtering
- 🤖 "Marcus" — AI evaluator powered by AWS Bedrock (Claude 3.7 Sonnet)
- 🔐 Role-based access: End Users & Admins
- ☁️ Fully serverless on AWS
- 🚀 Automated CI/CD from commit to production

*The problem I was solving: people preparing for interviews need structured practice with meaningful feedback.*

---

## Slide 4 — Live Application Demo

# Live Demo — The Application

> **DEMO: Open the live app, log in, show:**
> - Question Bank with search/filter
> - Practice Answer → AI evaluation from Marcus
> - Admin Dashboard (CRUD, category dropdown)

*Walk through the full user journey. Show both End User and Admin experiences.*

---

## Slide 5 — Architecture Overview

# Architecture Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  CloudFront  │────▶│  S3 (React)  │     │   Cognito   │
│   (HTTPS)    │     │  Frontend    │     │  User Pool  │
└──────┬───────┘     └──────────────┘     └──────┬──────┘
       │                                         │ JWT
       ▼                                         ▼
┌──────────────┐     ┌──────────────┐     ┌─────────────┐
│ API Gateway  │────▶│   Lambda     │────▶│  DynamoDB   │
│ (REST API)   │     │  (Python)    │     │  (NoSQL)    │
└──────────────┘     └──────┬───────┘     └─────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  Bedrock AI  │
                     │ (Claude 3.7) │
                     └──────────────┘
```

*Walk through each layer: Frontend → Auth → API → Compute → Data → AI*

---

## Slide 6 — AWS Services Used

# AWS Services

| Layer | Service | Purpose |
|-------|---------|---------|
| Frontend | S3 + CloudFront | Static hosting + CDN + HTTPS |
| Auth | Cognito | User management + JWT tokens |
| API | API Gateway | REST API + Cognito authoriser |
| Compute | Lambda (Python 3.11) | 3 functions — Questions, Evaluate, Signup |
| Database | DynamoDB | On-demand NoSQL, encrypted, PITR |
| AI | Bedrock | Claude 3.7 Sonnet answer evaluation |
| Monitoring | CloudWatch + CloudTrail | Metrics, alarms, logs, audit trail |
| IaC | CDK (TypeScript) | All infrastructure defined as code |

---

## Slide 7 — Environments

# Deployment Environments

| | Alpha (Testing) | Production |
|---|---|---|
| **Account** | 969831126809 | 315833389186 |
| **Region** | eu-west-1 | eu-west-1 |
| **Purpose** | Testing + Integration tests | Live users |
| **Extra** | `/testing` endpoint | — |

- Pipeline deploys Alpha → runs integration tests → manual approval → Production

---

## Slide 8 — Section Header: Meeting User Needs

# Meeting User Needs
### K4 · K10 · K21 · S3

---

## Slide 9 — User Stories (S3)

# User Stories — S3

**4 personas identified:**
- 👤 End Users — browse, search, practice with AI
- 👨‍💻 Developers — secure auth, scalable infrastructure
- 🔑 Admin Users — manage question bank (CRUD)
- ⚙️ Platform Admins — CI/CD, monitoring, security

**Each user story includes:**
- "As a [persona], I want [feature], so that [benefit]"
- Acceptance criteria (testable, unambiguous)
- Must-have vs Should-have classification

> **SCREEN: Open docs/USER_STORIES.md**

---

## Slide 10 — User Story Example

# User Story Example

> **As an end user**, I want to search and filter questions by category and difficulty, **so that** I can focus on specific areas I need to practice.

**Acceptance Criteria:**
- ✅ Search bar filters questions in real-time
- ✅ Category dropdown lists all available categories
- ✅ Difficulty dropdown offers Easy, Medium, Hard
- ✅ Results count updates dynamically

**Translated to tasks:**
1. Implement search input component
2. Implement filter dropdowns
3. Wire up real-time filtering logic

*This is S3 in action — translating user needs into deliverable tasks.*

---

## Slide 11 — Business Value of DevOps (K4)

# Business Value of DevOps — K4

| Dimension | How SkillScout delivers |
|-----------|------------------------|
| ⏱️ **Time** | Commit → Production in ~14 min (backend) / ~6 min (frontend). Manual deployment would take 1+ hour |
| 💰 **Cost** | Serverless = pay per use. Zero traffic = near-zero cost. No idle EC2/ECS instances |
| ✅ **Quality** | Automated linting, testing, vulnerability scanning, monitoring on every commit. Quality is baked in, not bolted on |

---

## Slide 12 — Architecture Principles (K21)

# Architecture Principles — K21

- **Serverless Microservices** — Each Lambda has single responsibility; scales independently
- **API Gateway Pattern** — Single entry point for all client requests; centralised auth + routing
- **Single Page Application** — React Router for fast client-side navigation
- **Event-Driven** — Loosely coupled components communicating through API contracts
- **Infrastructure as Code** — Reproducible, version-controlled, no configuration drift

---

## Slide 13 — User Experience (K10)

# User Experience — K10

**Feedback-driven improvements:**

| User Feedback | Action Taken |
|---------------|-------------|
| "Login inputs are invisible" | Investigated CSS cascade, scoped selectors to fix |
| "Typing categories manually is tedious" | Built category dropdown with "Add new" option |
| "Question card borders blend in" | Updated to white borders with box shadow |

- UX is iterative: Build → Feedback → Improve → Repeat
- **Distinction:** "Should have" features implemented from user feedback

---

## Slide 14 — Section Header: Code Quality

# Code Quality
### K2 · K5 · K7 · K14 · S9 · S11 · S14 · S17 · S18 · S20 · S22

---

## Slide 15 — Source Control (K2, S20)

# Source Control — K2, S20

- **Git** with GitHub — distributed version control
- **Feature branches** for development isolation
- **Conventional commits:** `feat()`, `fix()`, `docs()`
- **Small, frequent commits** — each commit = one logical change

**Code quality tools (automated in pipeline):**
- 🐍 Python: **Black** (formatter) + **Flake8** (linter)
- 📘 TypeScript: **ESLint** + strict compiler checks

> **SCREEN: Show git log and .flake8 config**

*Small commits + consistent formatting = clean diffs and easy merging.*

---

## Slide 16 — General Purpose Programming (K7, S17)

# General Purpose Programming — K7, S17

| Language | Used For | Key Files |
|----------|----------|-----------|
| **Python 3.11** | Lambda functions (backend) | `questions_handler.py` (400 lines), `evaluate_answer.py`, `admin_create_user.py`, `custom_metrics.py` |
| **TypeScript** | React frontend + CDK infrastructure | `App.tsx`, `api.ts`, `service.ts` (739 lines) |

> **SCREEN: Walk through questions_handler.py**
> - Router pattern in `lambda_handler`
> - `require_admin()` authorisation check
> - Structured JSON logging
> - Error handling with HTTP status codes

---

## Slide 17 — Infrastructure as Code (S18)

# Infrastructure as Code — S18

**AWS CDK (TypeScript) — `service.ts` (739 lines)**

Every AWS resource defined in code:
- DynamoDB table (schema, billing, encryption, PITR)
- 3 Lambda functions (runtime, handlers, env vars)
- API Gateway (routes, Cognito authoriser, CORS)
- S3 + CloudFront (frontend hosting)
- Cognito User Pool (password policies, Admin group)
- CloudWatch (8 alarms, 12-widget dashboard)
- CloudTrail (audit logging)

> **Key point:** `cdk destroy` + `cdk deploy` = identical environment from scratch

---

## Slide 18 — Test Pyramid (K14, S14)

# Test Driven Development — K14, S14

```
        /‾‾‾‾‾‾‾‾‾‾‾\
       /  8 Integration \        ← Live Alpha API tests
      /    Tests (pytest) \
     /─────────────────────\
    /   13 CDK Tests (Jest)  \   ← Infrastructure assertions
   /─────────────────────────\
  /   37 Unit Tests (pytest)   \  ← Mocked AWS services
 /───────────────────────────────\
```

**Total: 58 automated tests across 3 levels**

---

## Slide 19 — Unit Testing & Mocking

# Unit Testing & Mocking

**test_admin_authorization.py — 21 tests**

```python
@patch('questions_handler.boto3')
def test_post_question_admin_user(self, mock_boto3):
    # Setup: JWT with Admin group
    event = build_event('POST', body={...},
                        groups=['Admin'])
    # Execute
    response = lambda_handler(event, {})
    # Assert
    assert response['statusCode'] == 201
    mock_table.put_item.assert_called_once()
```

**Mocking strategy:**
- `unittest.mock.patch` replaces real AWS calls
- Verify responses AND verify what was/wasn't called
- Test positive cases, negative cases, and edge cases

---

## Slide 20 — Security Tools (K5, S9)

# Security Tools — K5, S9

| Tool | What it does | Integrated in pipeline? |
|------|-------------|------------------------|
| **STRIDE Threat Model** | 17 threats identified with mitigations | Documented in THREAT_MODEL.md |
| **Trivy** | Vulnerability scanning — fails on HIGH/CRITICAL | ✅ Every commit |
| **Dependabot** | Weekly dependency scanning + auto PR creation | ✅ Automated weekly |
| **Flake8 / ESLint** | Code quality + security linting | ✅ Every commit |

> **SCREEN: Show THREAT_MODEL.md and Trivy step in pipeline**

*Security is not a phase — it is automated into every commit.*

---

## Slide 21 — Problem Solving (S11)

# Systematic Problem Solving — S11

**PDAC Methodology: Problem → Diagnosis → Action → Confirm**

**Example: Invisible Login Inputs**

| Step | What I did |
|------|-----------|
| **Problem** | Users report: "I can't see the login inputs" |
| **Diagnosis** | DevTools → computed styles show `background: rgba(255,255,255,0.05)`, `color: white` from Admin.css overriding Login.css due to CSS specificity + import order |
| **Action** | Scoped Login selectors to `.login-card .form-group input` for higher specificity |
| **Confirm** | Verified inputs visible on Login page; verified Admin modal inputs still work |

*Systematic, not guesswork. Identify root cause → targeted fix → verify.*

---

## Slide 22 — Incremental Refactoring (S22)

# Incremental Refactoring — S22

**5 small, behaviour-preserving commits:**

1. `fix(ui): scope Login input styles to prevent Admin.css override`
2. `fix(ui): use solid border on question cards for visibility`
3. `fix(ui): scope Admin question-card styles to prevent overriding Questions page`
4. `feat(admin): white question cards + category dropdown selector`
5. `fix(ui): make Admin search bar and filters visible with white background`

- Each commit is independently revertible
- Each commit addresses one specific issue
- Architecture evolves safely through small steps

---

## Slide 23 — Section Header: CI/CD Pipeline

# The CI/CD Pipeline
### K1 · K15 · S15

---

## Slide 24 — CI vs CD vs CD (K15)

# CI / CD / CD — K15

| Term | Definition | My Implementation |
|------|-----------|-------------------|
| **Continuous Integration** | Frequent merging + automated build/test | Every push triggers pipeline: lint → test → scan |
| **Continuous Delivery** | Code always deployable; manual approval to prod | Alpha auto-deploy → manual approval → Prod |
| **Continuous Deployment** | Auto-deploy to prod (no manual gate) | Infrastructure supports it; I choose to keep the gate |

---

## Slide 25 — Backend Pipeline

# Backend & Infrastructure Pipeline

```
Push to main
     │
     ▼
┌─────────────────┐
│ Backend Tests    │  Black + Flake8 + pytest (37 tests) + Trivy
└────────┬────────┘
         ▼
┌─────────────────┐
│ CDK Check        │  Jest (13 tests) + TypeScript check + cdk synth
└────────┬────────┘
         ▼
┌─────────────────┐
│ Deploy Alpha     │  cdk deploy → Alpha account
└────────┬────────┘
         ▼
┌─────────────────┐
│ Integration Tests│  pytest (8 tests) against live Alpha API
└────────┬────────┘
         ▼
┌─────────────────┐
│ Manual Approval  │  ⏸️ Human checkpoint
└────────┬────────┘
         ▼
┌─────────────────┐
│ Deploy Prod      │  cdk deploy → Production account
└─────────────────┘
```

**Duration:** ~14 min + approval time

---

## Slide 26 — Frontend Pipeline

# Frontend Pipeline

```
Push to main
     │
     ▼
┌──────────────────┐
│ Quality Checks    │  ESLint + TypeScript check + Trivy
└────────┬─────────┘
         ▼
┌──────────────────┐
│ Deploy Alpha      │  Build → S3 upload → CloudFront invalidate
└────────┬─────────┘
         ▼
┌──────────────────┐
│ Manual Approval   │  ⏸️ Human checkpoint
└────────┬─────────┘
         ▼
┌──────────────────┐
│ Deploy Prod       │  Build → S3 upload → CloudFront invalidate
└──────────────────┘
```

**Duration:** ~6 min + approval time

---

## Slide 27 — Quality Gates

# Automated Quality Gates

Every commit must pass ALL of these before reaching production:

- ✅ Code formatting (Black / ESLint)
- ✅ Linting (Flake8 / TypeScript strict)
- ✅ Unit tests (37 pytest + 13 Jest)
- ✅ Vulnerability scan (Trivy — fails on HIGH/CRITICAL)
- ✅ CDK synthesis (valid CloudFormation template)
- ✅ Alpha deployment succeeds
- ✅ Integration tests pass against live Alpha
- ✅ Manual human approval

*If any single gate fails, the code does not reach production.*

---

## Slide 28 — LIVE PIPELINE DEMO

# 🔴 LIVE DEMO — CI/CD Pipeline

**What I will do:**
1. Make a small visible code change
2. Commit and push to main
3. Watch the pipeline run in real-time
4. Verify the change reaches the live application

> **DEMO:**
> 1. Edit a file in `frontend/src/pages/`
> 2. `git add`, `git commit`, `git push`
> 3. Open GitHub Actions — narrate each stage
> 4. Approve production deployment
> 5. Verify change on live production URL

*This evidences S15: a code commit progressing seamlessly from source to end user.*

---

## Slide 29 — Section Header: Break

# ☕ Break — 10 minutes

---

## Slide 30 — Section Header: Refreshing & Patching

# Refreshing & Patching
### K8 · S5

---

## Slide 31 — Immutable Infrastructure (K8, S5)

# Immutable Infrastructure — K8, S5

**Principle:** Don't modify resources in place → replace them entirely

| Resource | How it's immutable |
|----------|-------------------|
| **Lambda** | New deployment package replaces old; no in-place code edits |
| **Frontend** | S3 objects replaced entirely; CloudFront cache invalidated |
| **Infrastructure** | CDK generates CloudFormation changeset; resources recreated |

**OS / Runtime Patching:**
- Serverless = AWS manages the underlying infrastructure
- Lambda runtime, API Gateway, DynamoDB, CloudFront all patched by AWS
- I am responsible for **my dependencies** → Dependabot handles this

---

## Slide 32 — Automated Patching (Distinction)

# Automated Patching — Distinction Criteria

**Dependabot + CI/CD = fully automated patching:**

```
Dependabot detects outdated dependency
        │
        ▼
Creates Pull Request automatically
        │
        ▼
Pipeline runs: tests → scan → Alpha deploy → integration tests
        │
        ▼
Manual approval → Production deploy
```

- Weekly scans for npm and pip dependencies
- Configured in `dependabot.yml`
- Only manual step: PR review + approval

---

## Slide 33 — Section Header: Data Persistence

# Data Persistence
### K12 · S7

---

## Slide 34 — Database Selection (K12)

# Why DynamoDB? — K12

**Application data characteristics:**
- Simple data model (no joins, no relationships)
- Read-heavy (users browse; only admins write)
- Simple queries (scan all, get by ID)

| Requirement | DynamoDB | RDS PostgreSQL |
|-------------|----------|---------------|
| Latency | Single-digit ms ✅ | ~10ms |
| Scaling | Automatic ✅ | Manual / Aurora Serverless |
| Cost (low traffic) | Pay per request ✅ | Instance running 24/7 💰 |
| Admin overhead | None ✅ | Patches, backups, connections |
| Lambda integration | Native SDK ✅ | Connection pooling needed |

**Configuration:** On-demand billing, Point-in-Time Recovery, AWS-managed encryption

---

## Slide 35 — Troubleshooting Distributed Systems (S7)

# Troubleshooting — S7

**Layered approach for a serverless distributed system:**

```
User reports 500 error
        │
        ▼
1. API Gateway Logs → Confirm request reached API, check status code
        │
        ▼
2. Lambda Logs → Structured JSON logs with request ID → find the error
        │
        ▼
3. CloudWatch Metrics → Isolated incident or pattern? Throttling?
        │
        ▼
4. CloudTrail → Was there a recent config/permission change?
        │
        ▼
Root cause identified → fix → deploy → verify
```

*Structured logging with request IDs enables tracing a single request end-to-end.*

---

## Slide 36 — Section Header: Operability

# Operability
### K11 · S6 · S19 · B3

---

## Slide 37 — CloudWatch Dashboard (K11, S6)

# Monitoring — K11, S6

**CloudWatch Dashboard: 12 Widgets**

| Row | Widgets |
|-----|---------|
| **Standard** | Lambda invocations · Lambda errors · Lambda duration (avg + p99) · Throttles |
| **API** | API Gateway requests · API Gateway latency |
| **Custom** | Questions retrieved · Views by category · Admin CRUD ops · Auth (authorised vs unauthorised) · API latency by operation · 404 errors |

> **SCREEN: Open CloudWatch Dashboard and walk through each widget**

---

## Slide 38 — Alerting (K11)

# Alerting — 8 CloudWatch Alarms

**Standard AWS Alarms (4):**
| Alarm | Threshold |
|-------|-----------|
| Lambda Errors | ≥ 5 in 5 min |
| Lambda Throttles | ≥ 1 in 5 min |
| Lambda High Duration | ≥ 5000ms avg |
| API Gateway 5xx | ≥ 5 in 5 min |

**Custom Business Metric Alarms (4):**
| Alarm | Threshold |
|-------|-----------|
| High API Latency | > 1000ms avg |
| High 404 Rate | > 10 in 5 min |
| Unauthorised Admin Access | > 5 in 5 min 🔒 |
| No Question Activity | < 1 in 10 min |

All alarms → SNS → Email notification

---

## Slide 39 — Custom Metrics (Distinction)

# Custom Metrics — Distinction Criteria

**custom_metrics.py — 4 metric classes:**

| Class | Metrics | Business Insight |
|-------|---------|-----------------|
| **QuestionsMetrics** | Retrieved, viewed (by category/difficulty), 404s, latency | Which topics are popular? Where are broken links? |
| **AdminMetrics** | CRUD operations, auth checks, unauthorised attempts | Is someone trying to exploit the API? |
| **EvaluationMetrics** | Evaluations count, scores, success/failure | How are users performing? Is AI reliable? |
| **SystemMetrics** | Cold starts, memory, errors, DB operations | Performance optimisation targets |

**Graceful degradation:** Metric failures never crash Lambda functions

*These go beyond basic health monitoring → actionable business insights.*

---

## Slide 40 — Interpreting Metrics (S19)

# Interpreting Metrics — S19

| Observation | Interpretation | Action |
|-------------|---------------|--------|
| p99 latency >> average | Cold starts causing occasional slow requests | Consider provisioned concurrency |
| 404 rate increasing | Questions deleted without frontend update, or stale links | Investigate data consistency |
| Unauthorised access spike | Potential security incident or misconfigured role | Check logs, identify source, escalate if needed |
| "AWS" category = 80% views | Users want more AWS content | Invest in creating more AWS questions |
| Evaluate latency > Questions latency | Bedrock API call is the bottleneck | Consider caching repeated evaluations |

*Custom metrics → specific insights → informed decisions → continuous improvement.*

---

## Slide 41 — You Build It, You Run It (B3)

# "You Build It, You Run It" — B3

**Ownership mindset influenced every design decision:**

| Decision | Why |
|----------|-----|
| **Structured logging** | Because I'm the one troubleshooting at 2am — logs must have context |
| **Comprehensive alarms** | Because I'm the one responding — thresholds must minimise false positives |
| **Automated deployment** | Because I'm deploying daily — 14 min pipeline > 1 hour manual process |
| **Infrastructure as code** | Because I'm debugging infra issues — git history shows exactly what changed |

*When you own the full lifecycle, you naturally build in observability, reliability, and automation.*

---

## Slide 42 — Section Header: Automation

# Automation
### K13 · K17 · S12

---

## Slide 43 — APIs (K13, K17)

# APIs — K13, K17

**An API = a defined contract for how software components interact**

| API | Used In | Purpose |
|-----|---------|---------|
| **Boto3 → DynamoDB** | questions_handler.py | `scan()`, `get_item()`, `put_item()`, `update_item()`, `delete_item()` |
| **Boto3 → Bedrock** | evaluate_answer.py | `invoke_model()` with Claude 3.7 Sonnet |
| **Boto3 → Cognito** | admin_create_user.py | `admin_create_user()` for signup |
| **Fetch → API Gateway** | api.ts (frontend) | Type-safe REST client with JWT auth |
| **CloudWatch API** | custom_metrics.py | `put_metric_data()` for custom metrics |

*Referenced AWS documentation (Boto3 docs) to understand method signatures, parameters, and return types.*

---

## Slide 44 — Automation for Efficiency (S12)

# Automation — S12

| What I Automated | Time Saved | Without Automation |
|-----------------|------------|-------------------|
| Infrastructure deployment (`cdk deploy`) | ~10 min | Hours of manual console work |
| CI/CD pipeline | 6-14 min per deploy | 30-45 min manual process |
| Code quality (lint + format + scan) | Seconds per commit | Manual tool runs, easy to skip |
| Monitoring setup (alarms + dashboard) | Deployed with code | Manual CloudWatch configuration |
| **Dependabot** (Distinction) | Automated weekly | Manual dependency checks, easy to forget |

*Every automation = reduced effort + increased consistency + fewer human errors.*

---

## Slide 45 — Section Header: Data Security

# Data Security
### K16 · S10

---

## Slide 46 — Encryption (K16)

# Securing Data — K16

**Encryption in Transit:**
- CloudFront enforces HTTPS (HTTP → HTTPS redirect)
- API Gateway endpoint uses HTTPS
- All data (JWT tokens, questions, answers) encrypted on the wire

**Encryption at Rest:**
- DynamoDB: AWS-managed encryption keys
- S3 buckets: Server-side encryption (AES-256)
- Rationale: Defence in depth. Near-zero cost with AWS-managed keys.

**Access Control (layered):**
```
Cognito → API Gateway Authoriser → Lambda require_admin() → IAM Least-Privilege
```

---

## Slide 47 — Threat Assessment (S10)

# Threat Assessment — S10 (STRIDE)

| Threat | Likelihood | Impact | Mitigation |
|--------|-----------|--------|------------|
| JWT Token Theft | Medium | High | Short-lived tokens, HTTPS, XSS protection |
| NoSQL Injection | Low | High | Boto3 parameterised inputs, input validation |
| Denial of Service | Medium | Medium | API Gateway throttling, Lambda concurrency limits, CloudFront DDoS protection |
| Elevation of Privilege | Low | Critical | Backend Admin group check on every write, IAM least-privilege |
| Spoofed Auth Tokens | Low | High | API Gateway validates JWT signature + expiry against Cognito |

**17 threats identified and mitigated in THREAT_MODEL.md**

*Risk-based approach: proportionate mitigations based on likelihood × impact.*

---

## Slide 48 — Section Header: Summary

# Summary

---

## Slide 49 — KSB Evidence Map

# KSB Evidence Map

| Category | KSBs | Key Evidence |
|----------|------|-------------|
| **Code Quality** | K2, K5, K7, K14, S9, S11, S14, S17, S18, S20, S22 | Git, Python/TS, CDK, 58 tests, Trivy, PDAC, refactoring |
| **User Needs** | K4, K10, K21, S3 | User stories, DevOps value, architecture patterns, UX feedback |
| **CI/CD** | K1, K15, S15 | 2 pipelines, live demo, quality gates |
| **Refreshing** | K8, S5 | CDK immutable infra, Dependabot |
| **Operability** | K11, S6, S19, B3 | Dashboard, 8 alarms, custom metrics, ownership |
| **Data** | K12, S7 | DynamoDB rationale, CloudWatch troubleshooting |
| **Automation** | K13, K17, S12 | Boto3 APIs, CI/CD, Dependabot |
| **Security** | K16, S10 | HTTPS, encryption, STRIDE threat model |

---

## Slide 50 — Distinction Criteria

# Distinction Criteria ✨

| Category | Criteria | Evidence |
|----------|---------|---------|
| **Meeting User Needs** | "Should have" needs met | Admin category dropdown, CSS improvements from user feedback |
| **Refreshing & Patching** | Fully automated patching | Dependabot + CI/CD pipeline |
| **Operability** | Custom metrics + improvement areas | 4 custom business metric classes, actionable dashboard insights |
| **Automation** | Additional automation reducing effort | Dependabot: automated dependency scanning + PR creation |

---

## Slide 51 — Closing

# Thank You

**SkillScout** — designed, built, deployed, and operated end-to-end.

**Next steps if I continued developing:**
- 📊 Question history — track user improvement over time
- 🧪 A/B testing capability for UI experiments
- 🐦 Canary deployments to reduce release risk
- 📈 More granular AI evaluation quality metrics

**Questions?**

---

## Slide 52 — Q&A Prep (hidden — for your reference only)

# Likely Assessor Questions

**"Can you explain troubleshooting a difficult issue?"**
→ CSS specificity bug: DevTools → traced cascade → scoped selectors → verified fix

**"Why manual approval before production?"**
→ Risk management. Automated tests give high confidence but human checkpoint for real app. Pipeline supports removing it.

**"How would you handle a production incident?"**
→ Check alarms → Lambda logs → identify scope → revert if deployment-caused → document and learn

**"What would you do differently?"**
→ More integration tests earlier. CSS modules to prevent specificity issues. Proper staging environment mirroring prod.
