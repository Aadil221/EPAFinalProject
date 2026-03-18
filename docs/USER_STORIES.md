# EPA Project User Stories
**SkillScout - Interview Question Bank**

---

## Table of Contents
1. [End Users](#end-users)
2. [Developers](#developers)
3. [Admin Users](#admin-users)
4. [Platform Administrators](#platform-administrators)

---

## End Users
### _"As an end user..."_

#### Story 1: Create Account and Access Questions — `MUST HAVE`
**I want to** create an account and log in **so that** I can access the interview question bank and prepare for my interviews.

**Acceptance Criteria:**
- I can sign up using my email address
- I receive a temporary password via email that I must change on first login
- I can log in with my email and password
- I can change my password from my account settings if needed
- I cannot access questions without logging in (shown a login prompt)
- My session stays logged in until I log out or it expires

---

#### Story 2: Find Relevant Questions — `MUST HAVE`
**I want to** search and filter interview questions by category and difficulty **so that** I can practice topics relevant to my target role and skill level.

**Acceptance Criteria:**
- Questions display in browsable cards with text, category, and difficulty
- Search box filters questions by keyword (question text, category, competency)
- Filter dropdown for category (AWS, System Design, Security, etc.)
- Filter dropdown for difficulty (Easy, Medium, Hard)
- Multiple filters work together (AND logic)
- Results count shows "X of Y questions"
- Filters work in real-time without page reload

---

#### Story 3: Practice with AI Feedback — `MUST HAVE`
**I want to** submit my answers and receive instant AI-powered evaluation **so that** I can understand my strengths, improve weaknesses, and build confidence.

**Acceptance Criteria:**
- User can type/paste answer in multi-line text area
- "Get AI Feedback" button submits answer to Marcus (AWS Bedrock)
- Loading state shows "Marcus is evaluating..." while processing
- Evaluation returns within 10 seconds
- Feedback displays: score (0-100), correctness indicator, strengths list, improvements list, suggestions list, personal comment
- User can click "Try Again" to clear and resubmit a new answer
- Optional reference answer available (expandable, hidden by default)

---

## Developers
### _"As a developer..."_

#### Story 1: Secure Backend API — `MUST HAVE`
**I want to** implement secure authentication and authorization with AWS Cognito **so that** only authorized users can access protected resources and data.

**Acceptance Criteria:**
- Cognito user pool configured with password policies
- API Gateway validates JWT tokens on all requests
- Unauthenticated requests return 401
- Lambda functions use least-privilege IAM roles
- All traffic enforced over HTTPS
- Server-side input validation on all endpoints
- CORS configured properly for frontend domain

---

#### Story 2: AI-Powered Answer Evaluation — `MUST HAVE`
**I want to** integrate AWS Bedrock for answer evaluation **so that** candidates receive instant, intelligent feedback on their interview answers.

**Acceptance Criteria:**
- Lambda function invokes Bedrock Claude 3.7 Sonnet model
- Evaluation prompt tailored to competency type (LP, System Design, Technical)
- AI response parsed and validated as JSON
- Response includes: score, correctness, strengths, improvements, suggestions, comment
- Evaluation completes in <10 seconds
- Graceful error handling if AI service unavailable
- Evaluation metrics logged (latency, errors)

---

#### Story 3: Scalable Data Layer — `MUST HAVE`
**I want to** use DynamoDB for question storage **so that** the system scales efficiently and handles large question sets reliably.

**Acceptance Criteria:**
- Questions stored in DynamoDB with on-demand capacity
- Lambda functions retrieve questions via Scan operation
- Pagination handled for large datasets
- DynamoDB types converted properly (sets → arrays)
- GET /questions returns all questions
- GET /questions/{id} returns single question
- Structured JSON logging for all database operations

---

#### Story 4: Infrastructure as Code — `SHOULD HAVE`
**I want to** define infrastructure using AWS CDK **so that** environments are reproducible, version-controlled, and deployable via CI/CD.

**Acceptance Criteria:**
- All AWS resources defined in TypeScript CDK code
- GitHub Actions deploys infrastructure automatically
- Production deployments require manual approval
- CloudWatch alarms configured for Lambda errors and API 5xx errors
- Structured logging to CloudWatch with request IDs

---

#### Story 5: Custom Metrics and Monitoring — `SHOULD HAVE`
**I want to** implement custom CloudWatch metrics and alarms **so that** the team can monitor business metrics, performance, and security proactively.

**Acceptance Criteria:**
- Custom metrics module (custom_metrics.py) with 4 metric classes
- Metrics emitted for: question retrieval, views, CRUD operations, admin authorization, API latency, 404 errors
- 4 custom CloudWatch alarms for high latency, high 404 rate, unauthorized access, no activity
- 6 custom dashboard widgets displaying business metrics
- IAM permissions scoped to SkillScout namespace only
- Graceful degradation (metrics failures don't break Lambda)
- All metrics and alarms integrated into CloudWatch Dashboard

---

## Admin Users
### _"As an admin..."_

#### Story 1: Manage Question Bank — `MUST HAVE`
**I want to** manage interview questions with proper authorization **so that** the question bank remains high-quality and only authorized users can make changes.

**Acceptance Criteria:**
- Admin users assigned to Cognito "Admin" group
- Admin Dashboard UI accessible at `/admin` route (visible only to Admin group members)
- Create new questions with form validation (question_text, category, difficulty required; reference_answer optional)
- Edit existing questions in modal with pre-filled data
- Delete questions with confirmation
- Search and filter questions (same as regular question bank)
- Category is free-text input (users can type any category)
- Difficulty is dropdown (Easy, Medium, Hard)
- Non-admin users receive 403 Forbidden for POST/PUT/DELETE operations
- GET operations available to all authenticated users
- Admin actions logged to CloudWatch with user identity and timestamp
- Role checks enforced in Lambda before DynamoDB writes
- Admin nav link only visible to users in Admin Cognito group
- Backend endpoints:
  - POST /questions - Create question (admin only)
  - PUT /questions/{id} - Update question (admin only)
  - DELETE /questions/{id} - Delete question (admin only)
  - GET /questions - List questions (all users)
  - GET /questions/{id} - Get single question (all users)

---

#### Story 2: Delegate Admin Responsibilities — `COULD HAVE`
**I want to** assign users to admin groups **so that** question management responsibilities can be shared across the team.

**Acceptance Criteria:**
- Script exists to add users to Cognito Admin group (`admin_create_user.py`)
- Group membership reflected in JWT claims
- Admin permissions take effect immediately after group assignment

---

#### Story 3: Monitor Admin Activity — `SHOULD HAVE`
**I want to** track admin operations and unauthorized access attempts **so that** security violations are detected and team activity is visible.

**Acceptance Criteria:**
- AdminAuthCheck metric tracks all admin authorization checks
- UnauthorizedAdminAccess metric tracks failed admin access attempts
- CloudWatch alarm triggers on >5 unauthorized attempts in 5 minutes
- SNS email notifications sent when alarm triggers
- Admin CRUD operations tracked with QuestionCreated/Updated/Deleted metrics
- Dashboard widget displays admin activity (authorized + unauthorized)

---

## Platform Administrators
### _"As a platform administrator..."_

#### Story 1: Automated CI/CD Pipeline — `MUST HAVE`
**I want to** automate deployments with quality gates **so that** releases are consistent, tested, and secure before reaching production.

**Acceptance Criteria:**
- GitHub Actions triggers on push to main branch
- Parallel pipelines for frontend and backend
- Frontend pipeline: Quality checks → Trivy scan → Alpha → Manual approval → Production
- Backend pipeline: Unit tests → CDK check → Trivy scan → Alpha → Integration tests → Manual approval → Production
- Security scans fail build if high/critical vulnerabilities found
- Manual approval required before production deployment
- Deployment failures prevent promotion
- Dependabot automatically creates PRs for dependency updates (weekly npm/pip, monthly GitHub Actions)

---

#### Story 2: Monitoring and Observability — `SHOULD HAVE`
**I want to** monitor system health with alarms and centralized logging **so that** I can detect and resolve issues quickly.

**Acceptance Criteria:**
- CloudWatch Logs capture all Lambda function output
- Structured JSON logging with request IDs
- CloudWatch alarms configured for:
  - Lambda errors (>= 5 in 5min)
  - Lambda throttles (>= 1 in 5min)
  - Lambda duration (>= 5000ms average)
  - API Gateway 5xx errors (>= 5 in 5min)
  - **Custom: High API latency (> 1000ms)**
  - **Custom: High 404 rate (> 10 in 5min)**
  - **Custom: Unauthorized admin access (> 5 in 5min)**
  - **Custom: No question activity (< 1 in 10min)**
- Alarms send notifications via SNS (email)
- CloudTrail enabled for AWS API audit trail
- Logs retained for minimum 30 days
- Custom dashboard with 12 widgets (6 custom business metrics)

---

#### Story 3: Security and Cost Management — `SHOULD HAVE`
**I want to** enforce security best practices and optimize costs **so that** the application is secure and cost-efficient.

**Acceptance Criteria:**
- IAM roles follow least-privilege principle
- CloudWatch metrics permissions scoped to SkillScout namespace only
- HTTPS enforced on CloudFront (HTTP redirects)
- DynamoDB encryption at rest enabled
- S3 bucket encryption enabled
- Serverless architecture (Lambda, DynamoDB on-demand) scales with usage
- CloudFront caching reduces origin requests
- CloudTrail logs lifecycle: 30 days IA, 90 days delete

---

## Appendix

### MoSCoW Prioritisation Summary

| Priority | Stories | Count |
|----------|---------|-------|
| **Must Have** | EU1 (Account & Login), EU2 (Search & Filter), EU3 (AI Feedback), Dev1 (Secure API), Dev2 (AI Evaluation), Dev3 (Data Layer), Admin1 (Manage Questions), PA1 (CI/CD Pipeline) | 8 |
| **Should Have** | Dev4 (Infrastructure as Code), Dev5 (Custom Metrics), Admin3 (Monitor Admin Activity), PA2 (Monitoring & Observability), PA3 (Security & Cost) | 5 |
| **Could Have** | Admin2 (Delegate Admin Responsibilities) | 1 |

**Rationale:**
- **Must Have** stories represent the core product — without any one of them, the application either does not work, is insecure, or cannot be deployed. These were built first.
- **Should Have** stories improve production quality, observability, and cost efficiency. The application technically functions without them, but they are important for running it professionally. These were built after the must-haves were complete.
- **Could Have** stories are nice-to-have enhancements. Delegating admin responsibilities is useful for a team but not critical for a solo developer. This was implemented because it was straightforward, but it would have been the first to drop if time was tight.

---

### User Personas Summary
1. **End User (Candidate):** Prepares for interviews by practicing questions and receiving AI feedback.
2. **Developer:** Builds and maintains the application, ensuring security, reliability, and code quality.
3. **Admin User:** Manages interview questions, monitors admin activity and security violations.
4. **Platform Administrator:** Manages infrastructure, deployments, monitoring, and security.
