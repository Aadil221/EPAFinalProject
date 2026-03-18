# EPA Presentation Slides — SkillScout

> **18 slides total.** Most of the presentation is live screen walkthroughs of code, docs, and the AWS console.
> Slides provide visual anchors between live sections. `---` separates each slide.

---

## Slide 1 — Title

# SkillScout
### AI-Powered Interview Question Bank

**EPA Professional Discussion & Presentation**

Aadil

---

## Slide 2 — Agenda

| # | Section | Time | What You Will See |
|---|---------|------|-------------------|
| 1 | Introduction & Project Overview | 15 min | Live app demo |
| 2 | Meeting User Needs | 20 min | User stories walkthrough |
| 3 | Code Quality | 35 min | Live code + threat model |
| 4 | CI/CD Pipeline + Live Demo | 30 min | Pipeline trigger + deployment |
| — | **Break** | **10 min** | |
| 5 | Refreshing & Patching | 15 min | Dependabot + immutable infra |
| 6 | Data Persistence | 15 min | DynamoDB code + troubleshooting |
| 7 | Operability | 30 min | Dashboard + alarms + CloudTrail |
| 8 | Automation | 15 min | Boto3, Bedrock, API code |
| 9 | Data Security | 15 min | Encryption + STRIDE |
| 10 | Summary & Q&A | 15 min | KSB coverage review |

**KSBs covered:** K1, K2, K4, K5, K7, K8, K10, K11, K12, K13, K14, K15, K16, K17, K21 · S3, S5, S6, S7, S9, S10, S11, S12, S14, S15, S17, S18, S19, S20, S22 · B3

---

## Slide 3 — What is SkillScout?

**The Problem:**
People preparing for interviews need structured practice with meaningful feedback — not just a list of questions.

**The Solution:**
SkillScout is a web application where candidates can browse interview questions, filter by topic and difficulty, and submit answers to an AI evaluator called Marcus (powered by AWS Bedrock Claude 3.7 Sonnet) that gives detailed feedback with scores, strengths, and improvement suggestions.

**Key Features:**
- Question bank with real-time search and filtering
- AI-powered answer evaluation with personalised feedback
- Admin dashboard for managing questions (create, edit, delete)
- Role-based access control (End Users vs Admins)
- Fully serverless on AWS — zero infrastructure to manage
- Automated CI/CD from commit to production in under 15 minutes

---

## Slide 4 — Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                           │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    HTTPS request
                           │
                           ▼
              ┌────────────────────────┐
              │      CloudFront        │  ← Global CDN, HTTPS only
              │   (Content Delivery)   │
              └──────────┬─────────────┘
                         │
            ┌────────────┴────────────┐
            │                         │
            ▼                         ▼
   ┌─────────────┐          ┌──────────────────┐
   │  S3 Bucket  │          │   API Gateway    │
   │  (Frontend) │          │   (REST API)     │
   │  React App  │          └────────┬─────────┘
   └─────────────┘                   │
                              JWT validation
                              (Cognito check)
                                     │
                                     ▼
                            ┌─────────────────┐
                            │     Lambda       │
                            │  (Python 3.13)   │
                            └───────┬─────────┘
                                    │
                     ┌──────────────┼──────────────┐
                     │              │              │
                     ▼              ▼              ▼
            ┌──────────────┐ ┌──────────┐ ┌──────────────┐
            │   DynamoDB   │ │ Bedrock  │ │  CloudWatch  │
            │  (Questions) │ │ (Claude) │ │  (Metrics)   │
            └──────────────┘ └──────────┘ └──────────────┘
```

**Two AWS Accounts:** Alpha (969831126809) for testing → Production (315833389186) for live users
**Region:** eu-west-1 (Ireland) — both accounts
**All infrastructure defined in CDK** (`service.ts` — 739 lines of TypeScript)

---

## Slide 5 — User Personas + MoSCoW

**4 Personas — each with user stories, acceptance criteria, and priority:**

| Persona | Who They Are | Stories |
|---------|-------------|---------|
| **End User** | Candidate preparing for interviews | Account login, search & filter, AI feedback |
| **Developer** | Builds and maintains the application | Secure API, AI integration, data layer, IaC, metrics |
| **Admin** | Manages the question bank | CRUD operations, delegate access, monitor activity |
| **Platform Admin** | Manages deployments & monitoring | CI/CD pipeline, observability, security & cost |

**MoSCoW Prioritisation:**

| Priority | Count | What It Covers |
|----------|-------|----------------|
| **Must Have** | 8 | Login, search, AI feedback, secure API, AI evaluation, data layer, question management, CI/CD pipeline |
| **Should Have** | 5 | Infrastructure as Code, custom metrics, admin monitoring, observability, security & cost management |
| **Could Have** | 1 | Delegate admin responsibilities |

Must Haves built first → Should Haves layered on → Could Have added last

---

## Slide 6 — Business Value of DevOps

| Dimension | Without DevOps | With DevOps (SkillScout) |
|-----------|---------------|--------------------------|
| **Time** | 1+ hour manual deployment (package code, upload, run CloudFormation, test manually) | 6–14 minutes automated pipeline (commit to production) |
| **Cost** | EC2/ECS running 24/7 = paying even when nobody uses it | Serverless (Lambda + DynamoDB on-demand) = pay only for actual usage |
| **Quality** | Manual testing — easy to skip steps, miss issues | Automated at every stage: lint → test → scan → deploy → integration test → approve |

**Quality gates in the pipeline:**
- Code formatting (Black / ESLint)
- Unit tests (37 pytest + 13 Jest = 50)
- Vulnerability scanning (Trivy — fails on HIGH/CRITICAL)
- Integration tests (8 tests against live Alpha)
- Manual human approval before production

---

## Slide 7 — Languages, Testing & Tools

**Languages:**

| Language | Where | Key Files |
|----------|-------|-----------|
| **Python 3.13** | Backend Lambda functions | `questions_handler.py` (401 lines), `evaluate_answer.py`, `custom_metrics.py` |
| **TypeScript** | Frontend (React) + Infrastructure (CDK) | `App.tsx`, `api.ts`, `service.ts` (739 lines) |

**Testing — 58 tests across 3 levels:**

| Level | Count | Framework | What It Tests |
|-------|-------|-----------|---------------|
| Unit Tests | 37 | pytest + unittest.mock | Lambda logic with mocked AWS services |
| CDK Tests | 13 | Jest | Infrastructure assertions (resources exist, configured correctly) |
| Integration Tests | 8 | pytest | Live HTTP requests against deployed Alpha API |

**Code Quality Tools:**
- Python: Black (formatter) + Flake8 (linter)
- TypeScript: ESLint + strict compiler
- Security: Trivy (vulnerability scanner) + Dependabot (dependency updates)

---

## Slide 8 — CI/CD Pipelines

**Backend Pipeline** (`infa-and-backend.yml`) — ~14 min + approval

```
Push to main
    → Unit Tests (pytest — 37 tests)
    → CDK Synth Check (Jest — 13 tests)
    → Trivy Security Scan (fail on HIGH/CRITICAL)
    → Deploy to Alpha (cdk deploy)
    → Integration Tests (8 tests against live Alpha API)
    → Manual Approval ✋
    → Deploy to Production (cdk deploy)
```

**Frontend Pipeline** (`frontend.yml`) — ~6 min + approval

```
Push to main
    → ESLint + TypeScript Check
    → Trivy Security Scan (fail on HIGH/CRITICAL)
    → Build + Deploy to Alpha (S3 + CloudFront invalidation)
    → Manual Approval ✋
    → Build + Deploy to Production (S3 + CloudFront invalidation)
```

**Two separate pipelines** — frontend changes do not trigger backend deployment and vice versa.
**Continuous Delivery** — code is always deployable; I choose to keep the manual approval gate.

---

## Slide 9 — Live Demo

# 🔴 Live Pipeline Demo

**What you will see:**
1. I make a small visible change to a frontend page
2. I commit and push to main
3. The frontend pipeline triggers automatically in GitHub Actions
4. Each stage runs: lint → scan → Alpha deploy → await approval
5. I approve the production deployment
6. The change appears on the live production URL

**This demonstrates S15:** a code commit progressing seamlessly through the pipeline from source to the end user.

**Duration:** ~6 minutes for the pipeline + narration

---

## Slide 10 — Break

# ☕ 10-Minute Break

---

## Slide 11 — Refreshing & Patching

**Immutable Infrastructure — nothing is modified in place:**

| Resource | How It Updates |
|----------|---------------|
| **Lambda** | Entire deployment package replaced — old code is gone, new code takes over |
| **Frontend** | All S3 files replaced entirely — CloudFront cache invalidated |
| **Infrastructure** | CDK generates a CloudFormation changeset — resources recreated, not patched |

**OS & Runtime Patching:**
- Serverless = AWS manages the underlying servers, operating systems, and runtimes
- Lambda, API Gateway, DynamoDB, CloudFront — all patched by AWS automatically
- I am responsible for **my own dependencies** (npm packages, pip packages)

**Automated Dependency Patching (Distinction Criteria):**
- **Dependabot** scans weekly for outdated npm and pip packages
- Automatically creates a Pull Request with the update
- PR triggers the full CI/CD pipeline (tests → scan → Alpha → integration tests)
- I review and approve → production deployment
- Configured in `.github/dependabot.yml`

---

## Slide 12 — Why DynamoDB?

**My data is simple:** questions with text, category, difficulty, and an optional reference answer. No relationships between records. No joins needed. Read-heavy (users browse), write-light (only admins create/edit).

| Requirement | DynamoDB | RDS (PostgreSQL) |
|-------------|----------|-------------------|
| Read latency | Single-digit milliseconds ✅ | ~10ms |
| Scaling | Automatic, no config ✅ | Manual or Aurora Serverless |
| Cost (low traffic) | Pay per request ✅ | Instance running 24/7 💰 |
| Maintenance | Zero — no patches, backups, connections ✅ | Patches, backups, connection pooling |
| Lambda integration | Native Boto3 SDK ✅ | Needs connection pooling (RDS Proxy) |

**Configuration:** On-demand billing, Point-in-Time Recovery enabled, AWS-managed encryption at rest

---

## Slide 13 — CloudWatch Dashboard

> **[Insert dashboard screenshot here]**

**12 widgets arranged in 6 rows — all defined in CDK code:**

| Row | Left Widget | Right Widget |
|-----|-------------|--------------|
| 1 | Lambda Invocations | Lambda Errors |
| 2 | Lambda Duration (average + p99) | Lambda Throttles |
| 3 | API Gateway Requests | API Gateway Latency |
| 4 | Questions Retrieved | Question Views by Category |
| 5 | Admin CRUD Operations (create/update/delete) | Admin Authorisation (green = ok, **red = unauthorised**) |
| 6 | API Latency (dual axis — avg left, p99 right) | 404 Errors (**orange**) |

**Rows 1–3:** Standard AWS metrics — is the infrastructure healthy?
**Rows 4–6:** Custom business metrics (SkillScout namespace) — what are users actually doing?

Custom metrics sent by `custom_metrics.py` — uses try/except so metric failures never crash the Lambda function.

---

## Slide 14 — CloudWatch Alarms

> **[Insert alarms screenshot here]**

**8 alarms — 4 standard + 4 custom:**

| Alarm | Threshold | What It Catches |
|-------|-----------|-----------------|
| Lambda Errors | ≥ 5 in 5 min (1 window) | Bad deployments, broken code, permission changes |
| Lambda Throttles | ≥ 1 (1 window) | Users being rejected — traffic spike or concurrency misconfiguration |
| Lambda Duration | > 5s for 2 windows | Sustained slowness — DynamoDB, Bedrock, or cold start issues |
| API 5xx Errors | ≥ 5 in 5 min (1 window) | Server-side failures — Lambda timeout, out of memory, bad config |
| **High API Latency** | > 1s for 2 windows | Slow user experience from any cause |
| **High 404 Rate** | > 10 in 5 min | Broken links, deleted content users still try to access |
| **Unauthorised Admin** | > 5 in 5 min | Security — repeated attempts to access admin functions without permission |
| **No Activity** | < 1 in 10 min | "Is the whole thing dead?" — treats missing data as the alarm state |

All alarms → **SNS topic** → email notification (conditional — only if `notificationEmail` provided during deploy)

---

## Slide 15 — CloudTrail

**CloudTrail = security camera for the AWS account**

Records every action: who did it, when, what they changed, from which IP address.

**Configuration (all in CDK):**

| Setting | Value | Why |
|---------|-------|-----|
| **S3 Bucket** | Encrypted, versioned, public access blocked | Tamper-proof log storage |
| **Lifecycle** | → Cheaper storage after 30 days → Delete after 90 days | Cost management |
| **Removal Policy** | RETAIN — survives stack deletion | Audit logs must never be accidentally lost |
| **CloudWatch Log Group** | 1-month retention | Searchable via CloudWatch Logs Insights |
| **File Validation** | Enabled — fingerprint on each log file | Detects tampering |
| **Global Events** | Included — captures IAM + CloudFront changes | Full visibility across all services |
| **Management Events** | All reads + writes | Catches both changes and reconnaissance |

**CloudWatch** tells me what the application is doing.
**CloudTrail** tells me what people are doing to the infrastructure.

---

## Slide 16 — Data Security

**Encryption in Transit:**
- CloudFront enforces HTTPS — HTTP requests redirected automatically
- API Gateway uses HTTPS endpoint
- All data (JWT tokens, questions, answers, AI responses) encrypted on the wire

**Encryption at Rest:**
- DynamoDB: AWS-managed encryption keys (enabled by default)
- S3 buckets: Server-side encryption (AES-256)
- CloudTrail logs: S3 bucket encryption + versioning

**Access Control — 4 layers:**

```
Cognito (authentication — who are you?)
    → API Gateway Authoriser (valid JWT token?)
        → Lambda require_admin() (in the Admin group?)
            → IAM Least-Privilege (Lambda can only access its own table)
```

**STRIDE Threat Model:** 17 threats identified across 6 categories with mitigations documented in `THREAT_MODEL.md`

---

## Slide 17 — Summary

**What I Built:**
- Full-stack serverless application on AWS (CloudFront, S3, Cognito, API Gateway, Lambda, DynamoDB, Bedrock)
- 2 automated CI/CD pipelines with quality gates and manual approval
- 12-widget CloudWatch dashboard + 8 alarms + CloudTrail audit trail
- 58 automated tests (37 unit + 8 integration + 13 CDK)
- Custom metrics module with graceful failure handling
- STRIDE threat model with 17 identified threats and mitigations

**KSBs Covered:**

| Category | KSBs |
|----------|------|
| Knowledge | K1, K2, K4, K5, K7, K8, K10, K11, K12, K13, K14, K15, K16, K17, K21 |
| Skills | S3, S5, S6, S7, S9, S10, S11, S12, S14, S15, S17, S18, S19, S20, S22 |
| Behaviours | B3 |

**Distinction Criteria Met:**
- ✅ Custom metrics with actionable improvement areas (question views by category → content investment decisions)
- ✅ Must Have AND Should Have requirements fully delivered and tested
- ✅ Mayfly/immutable deployment strategy (Lambda + S3 replaced, not patched)
- ✅ Automated patching with Dependabot + CI/CD pipeline

---

## Slide 18 — Thank You

# Thank You

**SkillScout** — designed, built, deployed, monitored, and operated end-to-end.

Questions?
