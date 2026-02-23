# SkillScout - Interview Question Bank
A full-stack interview preparation platform with AI-powered feedback, built with React, Python Lambda functions, and AWS CDK.

## 📋 Table of Contents
- [Features](#-features)
- [Architecture](#️-architecture)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Project Structure](#-project-structure)
- [Local Development](#-local-development)
- [Deployment](#-deployment)
- [Documentation](#-documentation)
- [Security](#-security)

## ✨ Features
- 🔐 **Secure Authentication** - AWS Cognito user management
- 📚 **Question Bank** - Searchable interview questions by category and difficulty
- 👨‍💼 **Admin Dashboard** - Role-based access control with Cognito groups for question management
- 🤖 **AI Interview Coach (Marcus)** - AWS Bedrock (Claude 3.7 Sonnet) powered answer evaluation
- 🎯 **Practice Mode** - Submit answers and receive instant AI feedback with scores (0-100)
- 💪 **Personalized Feedback** - Strengths, improvements, and actionable suggestions
- 📊 **Custom Monitoring** - CloudWatch custom metrics and alarms for business insights
- 🔔 **Proactive Alerting** - 4 custom alarms for latency, security, and availability
- 📈 **Observability Dashboard** - 12 CloudWatch widgets with custom business metrics
- 🔍 **Audit Trail** - CloudTrail logging for all AWS API activity
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## 🏗️ Architecture
- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Python 3.11 Lambda functions
- **Infrastructure**: AWS CDK (TypeScript)
- **Database**: DynamoDB
- **AI**: AWS Bedrock (Claude 3.7 Sonnet)
- **Authentication**: AWS Cognito
- **Authorization**: Cognito Groups (Admin role-based access)
- **Hosting**: S3 + CloudFront CDN
- **Monitoring**: CloudWatch (Custom Metrics + Alarms) + CloudTrail

## 🚀 CI/CD Pipeline
The project uses GitHub Actions for continuous deployment with parallel pipelines:

- **Frontend Pipeline**: Quality Checks → Deploy Alpha → Deploy Prod
- **Backend Pipeline**: Tests → CDK Check → Deploy Alpha → Integration Tests → Deploy Prod

**📊 [View Full Pipeline Diagram](docs/PIPELINE.md)**

### Environments
| Environment | AWS Account | Region |
|-------------|-------------|--------|
| **Alpha** | 969831126809 | eu-west-1 |
| **Production** | 315833389186 | eu-west-1 |

## 📁 Project Structure
```
EPAFinalProject/
├── frontend/           # React application
├── backend/            # Python Lambda functions
│   ├── src/           # Lambda handlers
│   │   ├── questions_handler.py   # CRUD operations
│   │   │   └── POST/PUT/DELETE (Admin only)
│   │   ├── evaluate_answer.py     # AI evaluation (Marcus)
│   │   ├── admin_create_user.py   # Admin management
│   │   └── custom_metrics.py      # Custom CloudWatch metrics
│   └── tests/         # Unit tests
│       ├── test_admin_authorization.py  # 21 admin access tests
│       └── test_questions_handler.py    # Handler tests
├── infrastructure/     # AWS CDK stacks
│   └── lib/           # CDK stack definitions
├── docs/              # Documentation
│   ├── PIPELINE.md        # CI/CD pipeline diagrams
│   ├── USER_STORIES.md    # User stories and requirements
│   └── ARCHITECTURE.md    # System architecture visualization
└── .github/workflows/ # GitHub Actions
```

### Admin Features
Users in the **Admin** Cognito group can access `/admin` to:
- ✏️ Create new interview questions
- 📝 Edit existing questions
- 🗑️ Delete questions

Admin endpoints (require `cognito:groups` claim containing "Admin"):
- `POST /questions` - Create question
- `PUT /questions/{id}` - Update question
- `DELETE /questions/{id}` - Delete question
- `GET /questions` - Available to all authenticated users

### Custom Monitoring Features
**4 Custom Metric Classes:**
- `QuestionsMetrics` - Question retrieval, views, 404s, API latency
- `AdminMetrics` - CRUD operations, authorization checks, security monitoring
- `EvaluationMetrics` - AI evaluation tracking (future)
- `SystemMetrics` - System health metrics (future)

**4 Custom CloudWatch Alarms:**
- `high-api-latency` - Alert when API >1000ms
- `high-not-found-rate` - Alert when >10 404s in 5 minutes
- `unauthorized-admin-access` - Alert when >5 unauthorized attempts in 5 minutes
- `no-question-activity` - Alert when <1 question retrieved in 10 minutes

## 💻 Local Development

### Prerequisites
- Node.js 20+
- Python 3.11+
- AWS CLI configured

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
pip install -r requirements.txt
pytest              # Run tests
```

### Infrastructure
```bash
cd infrastructure
npm install
npm test
npx cdk synth  # Generate CloudFormation
npx cdk deploy # Deploy to AWS
```

## 🚢 Deployment

### Automatic Deployment
Push to `main` branch triggers automatic deployment:
```bash
git push origin main
```
- Changes to `frontend/**` trigger Frontend Pipeline
- Changes to `backend/**` or `infrastructure/**` trigger Backend Pipeline

### Manual Deployment
```bash
# Deploy infrastructure
cd infrastructure
npx cdk deploy

# Deploy frontend
cd frontend
npm run build
aws s3 sync dist/ s3://<bucket-name>
```

## 📚 Documentation
### Project Documentation
- **[User Stories](docs/USER_STORIES.md)** - Feature requirements and acceptance criteria
- **[CI/CD Pipeline](docs/PIPELINE.md)** - Deployment workflows and diagrams
- **[Architecture Diagram](docs/ARCHITECTURE.md)** - System architecture visualization

### Technical Resources
- **API Endpoints**: Documented in Lambda function docstrings
- **Infrastructure**: See CDK stack definitions in `infrastructure/lib/`
- **Frontend Components**: React components in `frontend/src/`

## 🔐 Security
- **AWS IAM roles** with least privilege principle
- **Role-based access control** via Cognito groups for admin operations
- **HTTPS enforced** for all traffic
- **JWT token validation** on every API request
- **Group-based authorization** for destructive operations (POST/PUT/DELETE)
- **CloudTrail logging** for audit trail (90-day retention)
- **Security monitoring** with UnauthorizedAdminAccess alarm
- **Encryption** at rest (DynamoDB, S3) and in transit (HTTPS/TLS)

## 📝 License
Private project - All rights reserved

---

**Last Updated:** 2026-02-23
**Version:** 1.0
**Author:** Aadil
