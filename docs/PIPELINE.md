# SkillScout CI/CD Pipeline
Visual guide to our deployment pipelines.

---

## Quick Overview
We have **2 independent pipelines** that run in parallel:

```mermaid
graph LR
    A[Push to Main] --> B{What Changed?}
    B -->|frontend/**| C[Frontend Pipeline]
    B -->|backend/** or infra/**| D[Backend Pipeline]
    B -->|Both| E[Both Pipelines]

    C --> F[Deploy to Production]
    D --> G[Deploy to Production]
    E --> F
    E --> G
```

---

## Frontend Pipeline
**2-step process:**

```mermaid
graph LR
    A[1. Build] -->|Pass| B[2. Deploy to S3]
    A -->|Fail| X[Stop]
```

### Stage Details
| Stage | What Happens | Duration |
|-------|-------------|----------|
| **1. Build** | npm install<br>npm run build (TypeScript + Vite) | ~2 min |
| **2. Deploy** | Get S3 bucket from CloudFormation<br>Upload to S3 | ~1 min |

**Total Time:** ~3 minutes

---

## Backend & Infrastructure Pipeline
**3-step process:**

```mermaid
graph LR
    A[1. Backend Tests] -->|Pass| B[2. CDK Check]
    B -->|Pass| C[3. Deploy]
    A -->|Fail| X[Stop]
    B -->|Fail| X
```

### Stage Details
| Stage | What Happens | Duration |
|-------|-------------|----------|
| **1. Backend Tests** | make build (black formatter)<br>make lint (flake8)<br>pytest -v (40 unit tests) | ~3 min |
| **2. CDK Check** | npm run build (TypeScript)<br>npm test (Jest 13 CDK tests) | ~2 min |
| **3. Deploy** | npm run cdk deploy<br>Update Lambda, API Gateway, DynamoDB,<br>CloudWatch Alarms, Dashboard | ~4 min |

**Total Time:** ~9 minutes

---

## Environment
| Environment | AWS Account | Region |
|-------------|-------------|--------|
| **Production** | 315833389186 | eu-west-1 |

---

## Security & Quality Gates

### What Blocks Deployment?

```mermaid
graph TD
    A[Code Push] --> B{Backend Tests Pass?}
    B -->|No| X1[Blocked]
    B -->|Yes| C{CDK Tests Pass?}
    C -->|No| X2[Blocked]
    C -->|Yes| F[Deploy to Production]
```

### Security Checks (Every Build)
- **Code Quality** - black formatter, flake8, ESLint, TypeScript
- **Unit Tests** - Backend pytest suite (40 tests)
- **Infrastructure Tests** - CDK Jest tests (13 tests)

---

## Pipeline Triggers
| Files Changed | Pipeline Triggered |
|---------------|-------------------|
| `frontend/**` | Frontend only |
| `backend/**` | Backend only |
| `infrastructure/**` | Backend only |
| `package.json` | Both |
| `.github/workflows/**` | Both |

---

## Related Documentation
- [README](../README.md) - Project overview
- [User Stories](USER_STORIES.md) - Feature requirements
- [Architecture Diagram](ARCHITECTURE.md) - System architecture
- [GitHub Actions Workflows](../.github/workflows/) - Pipeline source code

---

*Last Updated: 2026-02-23*
