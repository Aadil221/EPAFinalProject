# EPAMainProject Workspace Summary

## Project Overview

**Project Name:** EPAMainProject (Interview Question Bank)
**Type:** Monorepo using NPM Workspaces
**Purpose:** Web application for managing interview questions with authentication
**AWS Region:** eu-west-1
**Deployment:** GitHub Actions CI/CD pipeline

## Architecture

This is a full-stack serverless application consisting of three main workspaces:

1. **Frontend** - React Single Page Application
2. **Backend** - AWS Lambda functions (Python)
3. **Infrastructure** - AWS CDK for Infrastructure as Code

### Deployed AWS Resources

- **Amazon Cognito** - User authentication and authorization
- **AWS Lambda** - Python 3.11 runtime for backend logic
- **Amazon DynamoDB** - NoSQL database with encryption at rest
- **Amazon S3** - Static website hosting
- **Amazon CloudFront** - CDN for frontend distribution
- **Amazon API Gateway** - REST API with Cognito authorizer

## Programming Languages & Versions

| Language | Version | Usage |
|----------|---------|-------|
| **TypeScript** | 5.9.3 | Frontend & Infrastructure |
| **Python** | >=3.11 | Backend Lambda functions |
| **Node.js** | 20 | Build runtime (CI/CD) |

## Workspace Structure

```
EPAMainProject/
├── frontend/              # React application
│   ├── src/
│   │   ├── assets/       # Static assets (images, icons)
│   │   ├── contexts/     # React contexts (AuthContext)
│   │   └── pages/        # Page components
│   ├── public/           # Public assets
│   └── vite.config.ts    # Vite build configuration
├── backend/              # Python Lambda handler
│   ├── src/
│   │   └── handler.py    # Lambda entry point
│   ├── tests/
│   │   └── test_handler.py
│   ├── pyproject.toml    # Python project configuration
│   └── requirements.txt  # Python dependencies
├── infrastructure/       # AWS CDK
│   ├── lib/
│   │   ├── app.ts        # CDK app entry point
│   │   └── stacks/       # Stack definitions
│   ├── test/             # CDK unit tests
│   └── cdk.json          # CDK configuration
└── .github/workflows/    # CI/CD pipelines
    ├── frontend.yml
    └── infa-and-backend.yml
```

## Frontend (React + TypeScript)

### Key Technologies

- **React**: 19.2.0
- **React Router DOM**: 7.10.1 (multi-page routing)
- **AWS Amplify**: 6.15.9 (authentication SDK)
- **@aws-amplify/ui-react**: 6.13.1 (pre-built UI components)
- **Vite**: 7.2.4 (build tool and dev server)
- **TypeScript**: 5.9.3

### Pages

- **Home** - Landing page
- **Login** - User authentication
- **Signup** - New user registration
- **VerifyEmail** - Email verification flow
- **Questions** - Main questions management interface

### Build System

**Tool:** Vite 7.2.4 with `@vitejs/plugin-react`

**Commands:**
```bash
cd frontend
npm run dev        # Start development server
npm run build      # Production build (TypeScript check + Vite build)
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

### Code Style - Frontend

**ESLint Configuration** (`frontend/eslint.config.js`):
- Modern flat config format (ESLint 9+)
- Extends ESLint recommended + TypeScript ESLint recommended rules
- React Hooks rules (recommended)
- React Refresh rules for Vite HMR
- Target: ES2020, browser environment
- Ignores: `dist/` directory

**TypeScript Configuration** (`frontend/tsconfig.app.json`):
- Target: ES2022
- Strict mode enabled
- Unused locals/parameters detection enabled
- No fallthrough cases in switch statements
- JSX mode: react-jsx

**Formatting:**
- No Prettier or automatic formatter configured
- Likely follows 2-space indentation (React/Vite convention)
- No explicit line length limits

### Testing - Frontend

**Status:** ⚠️ No testing framework currently configured

**Recommended Setup (for future):**
- Vitest (native Vite integration) or Jest
- @testing-library/react for component testing
- @testing-library/jest-dom for assertions
- @testing-library/user-event for user interaction testing

### Logging - Frontend

**Framework:** Browser `console` API

**Current Usage:**
- `console.error()` for error logging
- Errors logged in: App.tsx, AuthContext.tsx, Login.tsx
- Pattern: Log to console + display error message to user

**Example:**
```typescript
try {
  // operation
} catch (error) {
  console.error('Descriptive error message:', error);
  setError('User-friendly message');
}
```

## Backend (Python Lambda)

### Key Technologies

- **Python**: >=3.11
- **AWS Lambda**: Python 3.11 runtime
- **pytest**: Testing framework

### Dependencies

Minimal dependencies:
- `pytest` (development/testing only)
- AWS SDK (boto3) provided by Lambda runtime - not in requirements.txt

### Build System

- No explicit build step required
- Python source code directly deployable
- Testing via pytest with `pythonpath = ["src"]` configuration

**Commands:**
```bash
cd backend
pytest              # Run all tests
pytest -v           # Verbose output
pytest tests/test_handler.py  # Run specific test file
```

### Code Style - Backend

**Configuration:** Minimal tooling configured

**Recommendations for Code Generation:**
- Follow PEP 8 conventions
- 4-space indentation (Python standard)
- Max line length: 88 characters (Black default)
- Use type hints where appropriate (Python 3.11+ syntax)

### Testing - Backend

**Framework:** pytest

**Configuration** (`backend/pyproject.toml`):
```toml
[tool.pytest.ini_options]
pythonpath = ["src"]
```

**Test Patterns:**
- File naming: `test_*.py`
- Function naming: `test_<description>()`
- Assertion style: Native Python `assert` statements
- Structure: Arrange-Act-Assert pattern
- Import pattern: Direct imports from source modules

**Example:**
```python
from handler import handler

def test_handler_returns_hello():
    response = handler({}, {})
    assert response["statusCode"] == 200
    assert response["body"] == "Hello from Lambda!"
```

**Current Limitations:**
- No fixtures in use
- No mocking configured (consider `pytest-mock` for AWS services)
- No parametrized tests

### Logging - Backend

**Status:** ⚠️ No logging currently implemented

**Recommended Implementation:**
```python
import logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Usage in Lambda handler:
def handler(event, context):
    logger.info("Processing request")
    logger.error("Error occurred", exc_info=True)
```

**Alternative (AWS Best Practice):**
```python
from aws_lambda_powertools import Logger
logger = Logger(service="interview-questions")

def handler(event, context):
    logger.info("Processing request")
```

### Metrics - Backend

**Status:** No custom metrics emission configured

**How to Add (Future):**
```python
import boto3
cloudwatch = boto3.client('cloudwatch')

cloudwatch.put_metric_data(
    Namespace='InterviewQuestionBank',
    MetricData=[{
        'MetricName': 'QuestionsCreated',
        'Value': 1,
        'Unit': 'Count'
    }]
)
```

## Infrastructure (AWS CDK)

### Key Technologies

- **AWS CDK**: 2.215.0
- **CDK Library (aws-cdk-lib)**: 2.215.0
- **Constructs**: ^10.0.0
- **TypeScript**: 5.9.3
- **Jest**: 29.7.0 (testing)
- **ts-jest**: 29.2.5

### CDK Configuration

**Entry Point:** `lib/app.ts` (via `npx ts-node --prefer-ts-exts`)

**Notable CDK Context Flags:**
- `@aws-cdk/aws-s3:publicAccessBlockedByDefault`: true
- `@aws-cdk/aws-lambda:useCdkManagedLogGroup`: true
- `@aws-cdk/aws-lambda-nodejs:useLatestRuntimeVersion`: true
- 100+ feature flags enabled for best practices

### Build System

**Commands:**
```bash
cd infrastructure
npm run build        # Compile TypeScript
npm test             # Run Jest unit tests
npm run cdk synth    # Synthesize CloudFormation templates
npm run cdk deploy   # Deploy to AWS
npm run watch        # Watch mode compilation
```

### Code Style - Infrastructure

**TypeScript Configuration** (`infrastructure/tsconfig.json`):
- Target: ES2022
- Module: NodeNext
- Strict mode enabled with comprehensive rules:
  - `noImplicitAny`: true
  - `strictNullChecks`: true
  - `noImplicitThis`: true
  - `alwaysStrict`: true
  - `noImplicitReturns`: true
- Relaxed rules:
  - `noUnusedLocals`: false
  - `noUnusedParameters`: false
  - `strictPropertyInitialization`: false
- Experimental decorators enabled
- Generates declaration files and source maps

**Note:** No ESLint configured for infrastructure code

### Testing - Infrastructure

**Framework:** Jest 29.7.0 with ts-jest

**Configuration** (`infrastructure/jest.config.js`):
```javascript
{
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  transform: { '^.+\\.tsx?$': 'ts-jest' }
}
```

**Test Patterns:**
- Uses AWS CDK assertions library (`aws-cdk-lib/assertions`)
- Test organization: `describe()` blocks for grouping
- Test naming: `test('Description', () => {})`
- Helper functions for stack synthesis and template generation

**Example Pattern:**
```typescript
import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { ServiceStack } from '../lib/stacks/service';

function synthTemplate() {
  const app = new cdk.App();
  const stack = new ServiceStack(app, 'TestServiceStack');
  return Template.fromStack(stack);
}

describe('ServiceStack CDK tests', () => {
  test('Creates DynamoDB table with encryption', () => {
    const template = synthTemplate();

    template.resourceCountIs('AWS::DynamoDB::Table', 1);
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      SSESpecification: {
        SSEEnabled: true
      }
    });
  });
});
```

**Testing Approach:**
- Infrastructure-as-code testing (validates CloudFormation synthesis)
- Tests resource counts, properties, and configurations
- Validates security settings (encryption, public access blocking)
- Verifies resource relationships (e.g., Cognito authorizer with API Gateway)

**Key Assertions:**
- `template.resourceCountIs()` - Verify resource counts
- `template.hasResourceProperties()` - Verify resource properties
- `Match.anyValue()` - Flexible matching for dynamic values

### Observability

**Current State:** Minimal configuration

**AWS Service Logs (Automatic):**
- Lambda: CloudWatch Logs at `/aws/lambda/<function-name>`
- API Gateway: Default CloudWatch metrics
- DynamoDB: Default metrics (read/write capacity, throttles)
- CloudFront: Default metrics

**Missing Features:**
- No CloudWatch Alarms
- No X-Ray distributed tracing
- No API Gateway access logs
- No CloudFront access logs to S3
- No Lambda Insights
- No custom metrics emission

**Available AWS Metrics:**
- Lambda: Invocations, Duration, Errors, Throttles, Concurrent Executions
- API Gateway: Count, Latency, 4XXError, 5XXError
- DynamoDB: ConsumedReadCapacityUnits, UserErrors
- CloudFront: Requests, BytesDownloaded, 4xxErrorRate, 5xxErrorRate

## CI/CD Pipeline

### GitHub Actions Workflows

**1. Frontend Deploy** (`.github/workflows/frontend.yml`)
- **Trigger:** Push to `main` branch with changes to `frontend/**`
- **Steps:**
  1. Build frontend application
  2. Get CloudFormation outputs (S3 bucket name)
  3. Upload built files to S3

**2. Infrastructure & Backend Deploy** (`.github/workflows/infa-and-backend.yml`)
- **Trigger:** Push/PR to `main` branch with changes to `infrastructure/**` or `backend/**`
- **Jobs:**
  1. `backend-tests` - Run pytest on backend code
  2. `cdk-check` - Run CDK unit tests
  3. `deploy` - Deploy infrastructure with CDK (only on push to main)
- **Sequential execution** with job dependencies

## Dependency Management

### NPM Workspaces

**Root `package.json`** defines three workspaces:
```json
{
  "workspaces": [
    "frontend",
    "backend",
    "infrastructure"
  ]
}
```

**Benefits:**
- Centralized dependency management
- Shared node_modules across workspaces
- Run commands across all workspaces

**Not Using Amazon Internal Tools:**
- ❌ No Brazil (Config file)
- ❌ No Peru (brazil.ion file)
- Standard open-source npm/pypi dependencies

## Development Workflow

### Initial Setup

```bash
# Install all dependencies
npm install

# Frontend development
cd frontend
npm run dev        # Start dev server at http://localhost:5173

# Backend testing
cd backend
pytest

# Infrastructure testing
cd infrastructure
npm test

# Infrastructure deployment
cd infrastructure
npm run cdk synth    # Preview CloudFormation
npm run cdk deploy   # Deploy to AWS
```

### Code Quality Checks

```bash
# Frontend linting
cd frontend
npm run lint

# Backend tests
cd backend
pytest -v

# Infrastructure tests
cd infrastructure
npm test
```

### Build for Production

```bash
# Frontend production build
cd frontend
npm run build        # Output to frontend/dist/

# Infrastructure synthesis
cd infrastructure
npm run cdk synth    # Output to infrastructure/cdk.out/
```

## Key Files & Configurations

### Frontend
- `vite.config.ts` - Vite build configuration
- `eslint.config.js` - ESLint rules (flat config)
- `tsconfig.app.json` - TypeScript compiler settings
- `aws-config.ts` - AWS Amplify configuration
- `AuthContext.tsx` - Authentication context provider

### Backend
- `src/handler.py` - Lambda function entry point
- `pyproject.toml` - Python project metadata and pytest config
- `requirements.txt` - Python dependencies

### Infrastructure
- `lib/app.ts` - CDK app entry point
- `lib/stacks/service.ts` - Main service stack definition
- `lib/stacks/stacks.ts` - Stack export/composition
- `cdk.json` - CDK configuration and feature flags
- `jest.config.js` - Jest test configuration

### CI/CD
- `.github/workflows/frontend.yml` - Frontend deployment pipeline
- `.github/workflows/infa-and-backend.yml` - Backend/infrastructure pipeline

## Git Information

**Current Branch:** `test/cdk-service-stack`
**Remote Tracking:** `origin/test/cdk-service-stack`

**Recent Commits:**
- d92b9c3 (2 weeks ago): test: add CDK unit tests for ServiceStack
- 700d1ce (2 weeks ago): Merge pull request #13 - apaps/feature
- c5e42e7 (2 weeks ago): removed cognito region output
- bc3d806 (6 weeks ago): Merge pull request #11 - apaps/feature
- c1c818d (6 weeks ago): changed README

## Custom Tools

**Status:** No custom Wasabi tools are present in this workspace.

**Assessment:** Custom tools are not required for this workspace. All build, test, and deployment operations can be performed using standard shell commands that Wasabi can already execute:

- Building: `npm run build`, `tsc`, `vite build`
- Testing: `pytest`, `jest`, `npm test`
- Linting: `eslint .`
- Deployment: `npx cdk deploy`

Wasabi's built-in shell command execution capabilities are sufficient for this workspace.

## Important Notes for Code Generation

### TypeScript (Frontend & Infrastructure)
- Always use strict typing
- Avoid unused variables and parameters (enforced in frontend)
- Use ES2020+ syntax
- Import React hooks properly to satisfy ESLint rules
- Follow React Refresh constraints (no anonymous default exports)

### Python (Backend)
- Use Python 3.11+ features and syntax
- Follow PEP 8: 4-space indentation, 88-character line limit
- Add type hints for function signatures
- Import logging and configure for production code
- Use pytest for new tests with clear test function names

### CDK Infrastructure
- Use AWS CDK v2 constructs (`aws-cdk-lib`)
- Enable security best practices (encryption, no public access)
- Write Jest tests for new CDK constructs
- Use Template.fromStack() for assertions
- Test resource counts and critical properties

### Testing Best Practices
- Backend: Use `def test_<description>():` with native `assert`
- Infrastructure: Use `describe()` and `test()` with CDK assertions
- Create helper functions for common test setup
- Test security configurations explicitly

### Authentication
- AWS Amplify handles authentication flow
- Cognito User Pool provides user management
- API Gateway uses Cognito authorizer
- AuthContext provides React authentication state

## Summary

EPAMainProject is a well-structured serverless application using modern AWS services and development practices. The monorepo structure with NPM workspaces provides good separation of concerns while maintaining centralized dependency management. The project uses TypeScript for frontend and infrastructure, Python for backend, and follows AWS best practices with CDK for infrastructure as code.

**Strengths:**
- Clear separation of frontend, backend, and infrastructure
- Comprehensive CDK unit tests
- GitHub Actions CI/CD with proper job sequencing
- AWS security best practices (encryption, Cognito auth)
- Modern tooling (Vite, React 19, CDK v2)

**Areas for Enhancement:**
- Add logging to backend Lambda functions
- Implement frontend testing (Vitest + React Testing Library)
- Configure CloudWatch Alarms for production monitoring
- Add X-Ray tracing for distributed observability
- Configure API Gateway and CloudFront access logs
- Add Python linting/formatting tools (ruff, black)
