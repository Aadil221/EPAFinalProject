# SkillScout System Architecture

## Architecture Diagram

```mermaid
graph TB
    subgraph CLIENT["CLIENT LAYER"]
        User["User/Browser"]
    end

    subgraph FRONTEND["FRONTEND"]
        CF["CloudFront"]
        S3["S3 Bucket"]
        React["React SPA"]
    end

    subgraph API["APPLICATION LAYER"]
        APIGW["API Gateway"]
        Cognito["Cognito User Pool"]
        L1["QuestionsHandler<br/>Lambda"]
        L2["EvaluateAnswerFunction<br/>Lambda"]
        L3["SignupHandler<br/>Lambda"]
    end

    subgraph DATA["DATA & INFRASTRUCTURE LAYER"]
        DDB["DynamoDB<br/>Table"]
        Bedrock["Bedrock<br/>(Claude)"]
        CW["CloudWatch"]
        Alarms["Alarms"]
        Trail["CloudTrail"]
    end

    User -->|HTTPS| CF
    CF --> S3
    S3 --> React
    React -->|API| APIGW
    React -->|auth| Cognito

    APIGW --> L1
    APIGW --> L2
    APIGW --> L3

    L1 -->|DynamoDB query| DDB
    L2 -->|Bedrock invoke| Bedrock
    L3 -->|User Signup| Cognito

    L1 & L2 & L3 -.->|Logs/Metrics| CW
    CW -.->|Alerts| Alarms
    L1 & L2 & L3 -.->|Audit Logs| Trail
```

## Components

### Client Layer
- **User/Browser** - End users and admins

### Frontend
- **CloudFront** - CDN for content delivery
- **S3 Bucket** - Static hosting for React app
- **React SPA** - TypeScript application (React 19 + Vite)

### Application Layer
- **API Gateway** - REST API with Cognito authorizer
- **Cognito User Pool** - Authentication + Admin groups
- **QuestionsHandler Lambda** - CRUD operations (Python 3.11)
- **EvaluateAnswerFunction Lambda** - AI evaluation (Python 3.11)
- **SignupHandler Lambda** - User registration (Python 3.11)

### Data & Infrastructure
- **DynamoDB Table** - InterviewQuestions storage
- **Bedrock (Claude)** - AI answer evaluation
- **CloudWatch** - Logs, metrics, dashboard
- **Alarms** - 8 total (4 AWS + 4 custom)
- **CloudTrail** - Audit logging

---

*Last Updated: 2026-02-23*
