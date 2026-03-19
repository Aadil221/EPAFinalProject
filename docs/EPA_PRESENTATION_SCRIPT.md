# EPA Presentation Script — SkillScout

> **Duration:** ~2 hours | **Format:** Word-for-word script with demo instructions
> **Project:** SkillScout — AI-Powered Interview Question Bank

---

## TIMING OVERVIEW

| Section | Topic | Duration | KSBs Covered |
|---------|-------|----------|--------------|
| 1 | Introduction & Project Overview | 10 min | — |
| 2 | Meeting User Needs | 12 min | K4, K10, K21, S3 |
| 3 | The Codebase | 12 min | K2, K7, K13, K17, S11, S17, S18, S20 |
| 4 | CI/CD Pipeline + LIVE DEMO | 25 min | K1, K8, K15, S5, S12, S15 |
| — | BREAK | 10 min | — |
| 5 | Security | 12 min | K5, K16, S9, S10 |
| 6 | Testing | 10 min | K14, S14 |
| 7 | Observability | 18 min | K11, K12, S6, S7, S19, B3 |
| 8 | Next Steps & Summary | 10 min | — |

---

## SECTION 1: INTRODUCTION & PROJECT OVERVIEW (10 minutes)

### Opening (1 minute)

> **[SLIDE 1: Title]**

Good morning/afternoon, and thank you for taking the time to assess my End Point Assessment. My name is Aadil, and today I will be presenting SkillScout — a full-stack, serverless interview preparation platform that I have designed, built, and deployed end-to-end.

Over the next two hours, I am going to walk you through the entire project lifecycle — from user needs through the codebase, a live CI/CD pipeline demo, and then security, testing, and observability.

Everything I am about to show you is my own work. I built it, I deployed it, I monitor it, and I maintain it — which I believe reflects the "you build it, you run it" philosophy that underpins good DevOps practice.

> **[SLIDE 2: Agenda]**

So, what is SkillScout? At its core, it is an AI-powered interview question bank. Let me explain the business problem it solves.

Currently, people preparing for interviews rely on scattered blog posts, outdated question lists, and have no way to get feedback without finding someone to mock-interview them. SkillScout solves this with a centralised, searchable question bank where admins control quality, and an AI evaluator called Marcus gives instant feedback — a score out of 100, strengths, improvements, and suggestions. That is the problem I set out to solve.

Let me show you the application now.

> **[SLIDE 3: What is SkillScout? — leave on screen during live app demo]**

> **[DEMO: Open the live application in browser]**

Here is the landing page. You can see the clean, modern interface. Let me log in with my credentials.

> **[DEMO: Log in to the application]**

Once authenticated, I am taken to the Question Bank. You can see the search bar at the top, the category and difficulty filters, and the question cards below. Each card shows the question text, difficulty level, and category. If I click "Practice Answer" on any question, a modal opens where I can type my answer and submit it to Marcus for AI evaluation.

> **[DEMO: Click Practice Answer, type a brief answer, submit for AI evaluation]**

As you can see, Marcus returns a score out of 100, tells me whether my approach was correct, lists my strengths, areas for improvement, suggestions, and gives a personal comment. All of this is powered by AWS Bedrock running the Claude 3.7 Sonnet model.

Now, if I navigate to the Admin Dashboard — and I can only see this link because my account is in the Admin Cognito group — I have full CRUD capabilities. I can create questions, edit them, delete them, and filter the question bank. The admin authorisation is enforced both on the frontend, where the link is conditionally rendered, and on the backend, where every write operation checks the JWT token for Admin group membership.

> **[DEMO: Show Admin Dashboard briefly]**

### Architecture Overview (5 minutes)

> **[SLIDE 4: Architecture — keep on screen during the full architecture walkthrough]**

> **[SCREEN: Show ARCHITECTURE.md or architecture diagram]**

SkillScout is a serverless application running entirely on AWS — I do not manage any servers. Let me walk you through the flow.

When a user opens SkillScout, their browser loads the React frontend from **CloudFront** (AWS's content delivery network) backed by an **S3 bucket**. CloudFront enforces HTTPS and serves files from the nearest data centre. Nobody can access the S3 bucket directly — an Origin Access Identity restricts access to CloudFront only.

To log in, the user authenticates through **Amazon Cognito**, which handles accounts, passwords, and login. Cognito issues a **JWT token** — a small piece of encrypted text proving who the user is and what groups they belong to. The frontend attaches this token to every backend request, like a wristband at a venue.

The frontend sends requests to **API Gateway**, the single entry point for all backend operations. API Gateway checks every JWT token with a Cognito Authoriser — invalid tokens are rejected with 401 before reaching my code. Valid requests are forwarded to one of three **Lambda functions**: the Questions Handler (CRUD operations on the question bank), the Evaluate Answer function (sends answers to **AWS Bedrock** running Claude 3.7 Sonnet for AI evaluation), and the Signup Handler (creates new user accounts).

For admin operations like create, update, and delete, the Lambda function performs a **second** authorisation check — reading the `cognito:groups` claim from the JWT and returning 403 Forbidden if the user is not in the Admin group. This is defence in depth — two layers of access control. Data is stored in **DynamoDB**, a managed NoSQL database. Every function sends logs and custom metrics to **CloudWatch** for monitoring, and **CloudTrail** records all infrastructure changes. The **entire infrastructure** is defined as code using AWS CDK in TypeScript — deployed through GitHub Actions to two AWS accounts: Alpha for testing and Production for real users.

That is the full picture. Now let me dive into each area in detail, starting with how I gathered and translated user needs.

---

## SECTION 2: MEETING USER NEEDS (12 minutes)

> **KSBs: K4, K10, K21, S3**

### User Stories — S3 (5 minutes)

> **[SCREEN: Open docs/USER_STORIES.md]**

I created user stories for four personas, each following "As a [persona], I want [feature], so that [benefit]" with testable acceptance criteria. The **End User** has three stories covering account creation, search and filtering, and AI evaluation — you saw all of these working in the demo. The **Developer** has five stories covering secure authentication, AI integration, the data layer, infrastructure as code, and custom metrics — with specific criteria like "unauthenticated requests return 401" and "Lambda functions use least-privilege IAM roles." The **Admin User** has stories covering full CRUD operations with security criteria — non-admin users must receive 403 Forbidden. And the **Platform Administrator** has stories for CI/CD quality gates, vulnerability scanning, and monitoring with specific alarm thresholds. Every criterion is objectively testable.

Let me show you how these translated into work.

> **[SCREEN: Open GitHub Projects Kanban board]**

Each user story became tasks on this Kanban board with To Do, In Progress, and Done columns. For example, the search and filter story became three tasks: the search component, the filter dropdowns, and the filtering logic. Breaking stories down like this meant each task was small enough to build, test, and ship individually.

I prioritised using the **MoSCoW method**. **Must Have** — 8 stories: account login, search/filter, AI evaluation, secure API, data layer, and CI/CD pipeline. Without any of these, the application either does not work, is insecure, or cannot be deployed. **Should Have** — 5 stories: Infrastructure as Code, custom metrics, monitoring, and security. These make the application production-ready rather than just functional. **Could Have** — 1 story: delegating admin responsibilities, which is not critical for a solo developer.

> **[SLIDE 5: User Personas + MoSCoW]**

MoSCoW shaped the build order — Must Haves first for a working product, then Should Haves for production quality. Every Must Have and Should Have story has been fully implemented and tested, which links directly to the distinction criteria.

### Business Value & Architecture — K4, K21 (4 minutes)

> **[SLIDE 6: Business Value of DevOps]**

**Time:** Automated CI/CD takes code from commit to production in 6-14 minutes. Manual deployment would take over an hour. **Cost:** Serverless means I pay per invocation — when nobody is using the application, I pay effectively nothing. **Quality:** Linting, tests, vulnerability scanning, and monitoring are baked into every commit — quality is not bolted on at the end.

For architecture, I followed the **serverless microservice pattern** — each Lambda has a single responsibility, so I can deploy, test, and scale each independently. **API Gateway** provides a single entry point for authentication, rate limiting, and routing. The frontend is a **single-page application** with React Router for fast navigation. And the system is **event-driven** with loosely coupled components communicating through well-defined API contracts.

### User Experience — K10 (3 minutes)

K10 emphasises how user experience drives development. A concrete example: users told me that typing category names manually on the Admin page was error-prone. So I implemented a category dropdown that pulls from existing categories, with the option to add a new custom one. User experience is iterative — you build, gather feedback, improve, and repeat.

Now that you understand what I built and why, let me show you the actual code.

---

## SECTION 3: THE CODEBASE (12 minutes)

> **KSBs: K2, K7, K13, K17, S11, S17, S18, S20**

### Source Control — K2, S20 (3 minutes)

> **[SLIDE 7: Languages, Testing & Tools — then switch to live screen for code walkthroughs]**

> **[SCREEN: Open GitHub repository]**

I use Git with GitHub. I work on **feature branches** to isolate changes, keeping main always deployable. Looking at my commit history, I follow **conventional commit** formatting — `feat` for features, `fix` for bug fixes, `docs` for documentation — so each commit clearly describes what changed and why.

I practise **small, frequent commits** — each one a single logical change. This makes merging straightforward because conflicts are contained to small changes. For code quality, I use **Flake8** for Python linting and **ESLint** with TypeScript rules on the frontend, both running automatically in CI.

### Programming & APIs — K7, K13, K17, S17 (5 minutes)

> **[SCREEN: Open backend/src/questions_handler.py]**

**Python 3.11** is my backend language. This is the Questions Handler — approximately 400 lines. As you can see, the `handler` function works as a router: it reads the URL path and HTTP method, then directs each request to the right code block. GET lists questions, POST creates, PUT updates, DELETE removes. The whole function is wrapped in a try-except safety net — if anything unexpected happens, it returns a clean 500 error instead of crashing silently.

Notice the `require_admin(event)` calls on every write operation. This function checks the JWT token for Admin group membership. If the user is not an admin, it records a custom metric and returns 403 Forbidden — the request never reaches the database.

Throughout the backend, I work with APIs at multiple levels. My Lambda functions call the **AWS SDK (Boto3)** to interact with DynamoDB — `table.scan()` to read, `table.put_item()` to write — and with Bedrock — `bedrock.invoke_model()` to call Claude for AI evaluations. I handle pagination for DynamoDB, which limits results to 1MB per call, by looping with `LastEvaluatedKey` until all data is retrieved.

**TypeScript** is my frontend and infrastructure language.

> **[SCREEN: Open frontend/src/services/api.ts]**

I define TypeScript **interfaces** for every data structure — `Question`, `EvaluationResponse`. An interface specifies the exact shape of an object. If I accidentally write `question.categorry` with a typo, TypeScript catches it immediately in my editor, not in production. The frontend **REST API** calls follow a consistent pattern — attach the JWT token as an Authorization header, call `fetch`, check `response.ok`, parse JSON, and throw typed errors on failure.

### Infrastructure as Code — S18 (2 minutes)

> **[SCREEN: Open infrastructure/lib/stacks/service.ts]**

This is `service.ts` — 739 lines of TypeScript defining my entire AWS infrastructure. Every resource — DynamoDB, Lambda, API Gateway, Cognito, S3, CloudFront, alarms, dashboard — is defined here. You can see the DynamoDB table with its partition key, billing mode, and encryption. The Lambda functions with runtime, memory, and environment variables. The CloudWatch alarms with thresholds and evaluation periods. All in code, stored in Git, reproducible with a single `cdk deploy`.

### Problem Solving — S11 (2 minutes)

Let me give you a concrete example of how I approach problems. I follow a methodology called **PDAC: Problem, Diagnosis, Action, Confirm**.

Users reported that login page inputs were invisible. **Problem:** inputs not visible. **Diagnosis:** using browser DevTools, I found `Admin.css` had a `.form-group input` rule with transparent styles leaking into the Login page due to equal CSS specificity. **Action:** I scoped the Login selectors to `.login-card .form-group input` for higher specificity. **Confirm:** inputs visible on Login, Admin page still working. Systematic, not guesswork.

Now you have seen the code — let me show you how it gets from my laptop to the end user.

---

## SECTION 4: CI/CD PIPELINE + LIVE DEMO (25 minutes)

> **KSBs: K1, K8, K15, S5, S12, S15**

### Pipeline Overview — K1, K15 (5 minutes)

> **[SLIDE 8: CI/CD Pipelines]**

**Continuous Integration** means frequently merging code with automated builds and tests — problems are detected early. **Continuous Delivery** extends this so code is always deployable — my pipeline deploys to Alpha automatically. **Continuous Deployment** would remove the manual approval gate entirely — my pipeline supports this but I keep the human checkpoint deliberately.

> **[SCREEN: Open .github/workflows/infa-and-backend.yml]**

I have two pipelines. The **backend/infrastructure pipeline** has six stages: Backend Tests (Black, Flake8, pytest, Trivy) → CDK Check (Jest, TypeScript, cdk synth) → Deploy to Alpha → Integration Tests against live Alpha → Manual Approval → Deploy to Production. Any failure at any stage stops the pipeline.

> **[SCREEN: Open .github/workflows/frontend.yml]**

The **frontend pipeline** is similar but simpler: ESLint, TypeScript, Trivy → Deploy to Alpha S3 + invalidate CloudFront → Manual Approval → Deploy to Production.

### LIVE DEMO — S15 (15 minutes)

> **[SLIDE 9: Live Demo]**

Now I am going to do something that I think really demonstrates the pipeline in action. I am going to make a live code change, push it, and we will watch it flow through the entire CI/CD pipeline to the end user.

> **[DEMO: Open terminal and code editor]**

Let me make a small, visible change to the frontend. I am going to update the footer text to include today's date, so we can verify the change has actually reached the live application.

> **[DEMO: Make a small visible change — e.g., update the footer text in App.tsx]**

```tsx
<footer className="footer">
  <p>&copy; 2026 SkillScout. Master your interviews with AI-powered practice. | Last deployed: [TODAY'S DATE]</p>
</footer>
```

Now let me commit this change.

> **[DEMO: Run git commands]**

```bash
git add frontend/src/App.tsx
git commit -m "feat(ui): add deployment date to footer for EPA demo"
git push origin main
```

The push has triggered the frontend pipeline. Let me open GitHub Actions so we can watch it in real time.

> **[SCREEN: Open GitHub Actions tab, show the running workflow]**

You can see the pipeline running — quality checks first (ESLint, TypeScript, Trivy), then Alpha deployment. The pipeline is building the React application with the Alpha environment variables, uploading the built files to the Alpha S3 bucket, and invalidating the CloudFront cache.

> **[Wait for Alpha deploy to complete]**

Alpha deployment is complete. Let me open the Alpha URL to verify the change is live.

> **[DEMO: Open Alpha URL, show the updated footer]**

There it is — the updated footer on the Alpha environment. The change has gone from my local machine to a deployed environment in just a few minutes, with automated quality gates at every step. Now the pipeline is waiting for manual approval. I am satisfied the change is correct, so I will approve.

> **[DEMO: Click approve in GitHub Actions]**

> **[Wait for production deploy]**

> **[DEMO: Open production URL, show the updated footer]**

The change is live in production. A code commit has progressed seamlessly from source to end user — automated quality gates at every step, with only the deliberate approval gate as manual intervention.

### Refreshing, Patching & Automation — K8, S5, S12 (5 minutes)

> **[SLIDE 11: Refreshing & Patching]**

What you just saw is also how I handle **refreshing and patching**. The pipeline implements **immutable infrastructure** — instead of modifying resources in place, CDK and CloudFormation replace them entirely. When I change Lambda code, a new deployment package replaces the old one. When I deploy a new frontend, S3 objects are replaced and CloudFront cache is invalidated. No drift, no "works on my machine."

For OS patching — with serverless, AWS patches the underlying infrastructure. I do not manage any operating systems. But I am responsible for **my own dependencies**, which is where Dependabot comes in.

> **[SCREEN: Open .github/dependabot.yml]**

I have three Dependabot schedules: **npm** (frontend + CDK, weekly), **pip** (Python backend, weekly), and **GitHub Actions** (monthly). Updates are grouped so I get one manageable PR per ecosystem instead of dozens. When a PR is opened, it triggers the full CI/CD pipeline — if tests pass, I review and merge, and the update deploys all the way through to production.

Every piece of automation saves real time. `cdk deploy` provisions every AWS resource in ~10 minutes — manually it would take hours. Every push triggers automated testing and deployment in 6-14 minutes. Linting, formatting, and Trivy scanning run on every commit. For the **distinction criteria** — Dependabot is my example of identifying an additional automation opportunity. I identified that manually checking for dependency updates was inefficient and easy to forget. By configuring Dependabot, I automated the entire detection-to-deployment process, reducing it from a regular manual task to a simple PR review.

Let us take a break. When we come back, I will cover how I secured the application, my testing strategy, and how I monitor everything in production.

---

## — BREAK (10 minutes) —

> **[SLIDE 10: Break]**

---

## SECTION 5: SECURITY (12 minutes)

> **KSBs: K5, K16, S9, S10**

Welcome back. You have seen the code and watched it deploy through the pipeline. Now let me talk about something that underpins all of it — security. I did not bolt security on at the end. I started with a threat model before building the security controls.

> **[SCREEN: Open docs/THREAT_MODEL.md]**

My threat model starts with seven **security tenets**. The three most important: **Least Privilege** — every component gets only the minimum permissions needed. **Defence in Depth** — security at every layer, from frontend through to the database. **Risk-Based Decision Making** — proportionate controls based on likelihood and impact.

> **[Scroll to: Assumptions, Assets, and Threat Actors]**

I documented eleven assumptions — things I took as given when writing the model. For example, all traffic uses HTTPS, and the frontend never talks directly to the database. If any assumption changes, you know exactly which threats need reassessing. I identified nine assets worth protecting — from the obvious ones like question data, to less obvious ones like audit logs and IAM roles. And I defined five threat actors — not just the external hacker, but also an authenticated user trying to access admin features, a compromised admin account, someone with direct AWS access, and someone with CI/CD pipeline access who could inject malicious code. The most dangerous threats often come from insiders or compromised trusted accounts, so considering all five gives much better coverage.

> **[Scroll to: Threats table]**

I used the **STRIDE** framework — six categories of attack. Let me walk through the key ones:

**S — Spoofing:** Can someone pretend to be someone they are not? Mitigation: every endpoint requires a valid JWT token; API Gateway rejects invalid tokens before reaching my code.

**T — Tampering:** Can someone change data without authorisation? Mitigation: only Lambda functions talk to DynamoDB, only admin users trigger writes, IAM roles enforce least privilege.

**I — Information Disclosure:** Can data leak? Mitigation: authentication on every endpoint, S3 access blocked except through CloudFront. And critically — **encryption**. In transit, HTTPS is enforced by CloudFront. At rest, DynamoDB uses AWS-managed encryption keys and both S3 buckets use server-side encryption. This costs nothing but means even raw storage access would yield unreadable data.

> **[SCREEN: Show the DynamoDB encryption configuration in service.ts]**

> **[SLIDE 16: Data Security]**

You can see `encryption: TableEncryption.AWS_MANAGED` on DynamoDB and `encryption: BucketEncryption.S3_MANAGED` on S3 — set in code, tested in my CDK test suite, and deployed through the pipeline. Encryption can never be accidentally turned off.

**E — Elevation of Privilege:** Can someone gain access they should not have? The Lambda checks `cognito:groups` on every write. Even if someone bypasses the UI and calls the API directly, they get 403. And JWTs are cryptographically signed — modifying a token invalidates the signature.

In total, I identified **17 threats** — 7 High priority, 10 Medium — all with implemented mitigations. I also created **20 security tests** to verify the controls work, including 6 automated tests in the pipeline.

> **[Scroll to: Security Tests]**

For **vulnerability scanning**, Trivy runs in both pipelines — HIGH or CRITICAL findings fail the build. For **dependency checking**, Dependabot scans weekly and auto-creates update PRs. This is the iterative security approach K5 requires — no vulnerabilities, all dependencies present and current.

That covers how I designed the security. But security controls on paper are only useful if they are actually enforced and tested. Let me show you how I test this application.

---

## SECTION 6: TESTING (10 minutes)

> **KSBs: K14, S14**

### Testing Strategy — K14, S14

> **[SCREEN: Open backend/tests/test_admin_authorization.py]**

My testing strategy follows the **test pyramid** — 37 backend unit tests, 13 CDK infrastructure tests, and 8 integration tests. The heavy lifting is done by fast unit tests that run in seconds and give immediate feedback.

Since my code talks to real AWS services — DynamoDB, Cognito, CloudWatch — I use **mocking**. A mock is a fake object that stands in for a real service during testing. I control exactly what it returns, and afterwards I can check whether it was called at all. Let me show you how this works:

> **[SCREEN: Show the mock setup in the test file]**

```python
from unittest.mock import patch, MagicMock

mock_table = MagicMock()
mock_dynamodb = MagicMock()
mock_dynamodb.Table.return_value = mock_table

with patch.dict(os.environ, {"TABLE_NAME": "test-table", "LOG_LEVEL": "INFO"}):
    with patch("boto3.resource", return_value=mock_dynamodb):
        from questions_handler import handler
```

`MagicMock()` creates a fake object that accepts any method call and returns whatever I tell it to. The `patch("boto3.resource")` line intercepts the real AWS call and hands back my fake instead — so the code thinks it is talking to DynamoDB, but it is actually talking to a fake I control. No real AWS calls happen. The tests run entirely offline in milliseconds. Here is an actual test:

```python
def test_post_question_as_admin():
    mock_table.put_item.return_value = {}

    event = create_event(
        "POST", "/questions",
        body={"question_text": "What is AWS?", "category": "AWS", "difficulty": "Medium"},
        groups="Admin"
    )
    context = MagicMock()
    context.aws_request_id = "test-request-123"

    response = handler(event, context)

    assert response["statusCode"] == 201
    body = json.loads(response["body"])
    assert body["question_text"] == "What is AWS?"
```

I simulate a successful database write, create a fake admin event, call the handler, and verify I get 201 Created. I also write the opposite test — authenticating as a regular user and confirming the handler returns 403 Forbidden. The key advantage of mocking here is that I can prove the database was never even touched — the security check stopped the request before it reached any data. Beyond those, I cover missing fields, non-existent questions, and badly formatted requests — 21 tests total for this one handler.

> **[SCREEN: Show infrastructure/test/service-stack.test.ts]**

For infrastructure, I have 13 CDK tests using Jest. These check that my CDK code produces the correct AWS resource configuration — DynamoDB has point-in-time recovery, S3 has public access blocked, Lambda uses the correct Python version, and the signup endpoint allows unauthenticated access. If someone accidentally removes a security setting in the CDK code, these tests catch it before it reaches production.

So the code is tested, the security is verified, and the pipeline deploys it all automatically. The final piece is knowing what is happening once it is running in production. That is observability.

---

## SECTION 7: OBSERVABILITY (18 minutes)

> **KSBs: K11, K12, S6, S7, S19, B3**

### Database & Troubleshooting — K12, S7 (5 minutes)

Let me start with where the data lives and how I troubleshoot when things go wrong.

> **[SLIDE 12: Why DynamoDB?]**

> **[SCREEN: Show the DynamoDB table definition in service.ts]**

My data model is simple — questions with ID, text, category, difficulty. No complex relationships, no joins needed. Access patterns are read-heavy with simple queries. Given this, DynamoDB was the right choice: **single-digit millisecond latency**, **automatic scaling**, **on-demand billing** (pay only for what I use), **zero administration**, and **native Lambda integration** without connection pooling complexity. A relational database like RDS PostgreSQL would have been overkill.

When something goes wrong in a distributed system — where a single request touches CloudFront, API Gateway, Lambda, and DynamoDB — the error could be anywhere. My primary tool is CloudWatch Logs with **structured JSON logging**:

> **[SCREEN: Open AWS CloudWatch console]**

```python
class JsonFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
        }
        if hasattr(record, "request_id"):
            log_data["request_id"] = record.request_id
        if hasattr(record, "path"):
            log_data["path"] = record.path
        if hasattr(record, "question_count"):
            log_data["question_count"] = record.question_count
        return json.dumps(log_data)
```

Every log entry is a JSON object with a `request_id` field — a unique ID that Lambda generates for every request. When troubleshooting, I search CloudWatch Logs Insights with `filter request_id = "abc-123"` and instantly see every log entry for that request, in order. My systematic approach: check API Gateway logs for the request, then Lambda logs for the error, then CloudWatch metrics for patterns, then CloudTrail if I suspect a configuration change. This layered approach — starting from the entry point and drilling down — is how you troubleshoot distributed systems.

### Monitoring & Custom Metrics — K11, S6 (5 minutes)

Troubleshooting is reactive — something breaks and you investigate. But ideally, I want to know about problems before users report them. That is what monitoring is for.

> **[SCREEN: Open CloudWatch Dashboard]**

> **[SLIDE 13: CloudWatch Dashboard]**

This is my CloudWatch Dashboard with 12 widgets in six rows. The **top two rows** cover standard Lambda and API Gateway health — invocations, errors, duration (showing both average and p99 to catch outlier slowness from cold starts), and throttles.

The **bottom four rows** are my **custom business metrics** — this is where I believe I meet the distinction criteria:

> **[SCREEN: Show custom metrics rows on dashboard]**

- **Questions Retrieved** — early warning if the core feature stops working (drops to zero = DynamoDB down or permissions changed)
- **Question Views by Category** — product metric telling me where to invest in content
- **Admin CRUD Operations** — spots unusual patterns like a spike in deletes
- **Admin Authorisation** — security widget showing failed permission attempts in red
- **API Latency by Operation** — catches slowdowns affecting a small percentage of users
- **404 Errors** — tracks dead links from deleted questions

All 12 widgets are defined in `service.ts` — not set up by hand through the console. The entire dashboard lives in my code, is tracked in Git, and gets created automatically every time I deploy.

> **[SCREEN: Show custom_metrics.py]**

These metrics are sent by my `custom_metrics.py` module using `cloudwatch.put_metric_data()`. The key design decision: the metric call is wrapped in a safety net — if CloudWatch fails, I log a warning but do NOT crash the main request. Metrics are not worth breaking the user experience over. In the handler, emitting a metric is a single line: `questions_metrics.questions_retrieved(len(items))`.

### Alerting & Interpretation — S19 (5 minutes)

> **[SCREEN: Show alarm definitions in service.ts]**

> **[SLIDE 14: CloudWatch Alarms]**

I have 8 CloudWatch alarms — 4 for standard AWS metrics and 4 for my custom business metrics.

Standard: **Lambda Errors** (≥5 in 5 min), **Lambda Throttles** (≥1, because even one means a user was turned away), **Lambda High Duration** (>5s for two consecutive windows), **API Gateway 5xx** (≥5 in 5 min).

Custom: **High API Latency** (>1s for two windows), **High 404 Rate** (>10 in 5 min — catches deleted questions with stale links), **Unauthorised Admin Access** (>5 failed checks in 5 min — a security alarm), **No Question Activity** (0 retrievals in 10 min — my "is the whole thing dead?" alarm. This one uniquely treats missing data as a problem, unlike the others where no data means nobody is using the app).

How do I act on this data? If **p99 latency** is much higher than average, that usually indicates Lambda **cold starts** — most requests hit warm containers (fast) but some hit cold ones (1-3 seconds). I could fix this with provisioned concurrency at higher cost, but for my current traffic the behaviour is acceptable. If **Question Views by Category** shows 80% AWS questions, I know where to invest in content. If the **unauthorised access alarm** fires, I check CloudWatch Logs immediately to identify the source. These custom metrics go beyond basic health — they drive product and security decisions. That is the distinction criteria.

### Audit Trail & Ownership — B3 (3 minutes)

> **[SLIDE 15: CloudTrail]**

**CloudTrail** is like a security camera for my AWS account — it records every infrastructure action with who, when, what, and from where. I configured it in CDK with a dedicated encrypted S3 bucket (versioned, lifecycle rules, survives stack deletion), a CloudWatch Log Group for searchable access, and file validation to detect tampering. Between CloudWatch (what the application is doing) and CloudTrail (what people are doing to the infrastructure), I have full visibility.

All of this exists because I own this application end to end — **"you build it, you run it."** When you are the person who gets the alert at 2am, you naturally build in structured logs, tuned alarms, automated deployments, and infrastructure as code. Every design decision was shaped by the fact that I have to live with the consequences. That is B3 — and it is also why my Mean Time To Recovery is low. If something breaks, my structured logs tell me what went wrong, my alarms tell me where, and my CI/CD pipeline lets me deploy a fix in minutes.

---

## SECTION 8: NEXT STEPS & SUMMARY (10 minutes)

### Next Steps (4 minutes)

If I were to continue developing SkillScout, there are four areas I would focus on.

First, **question history and progress tracking**. Right now, users practise and get feedback, but there is no record of their past attempts. I would add a DynamoDB table to store evaluation history per user, so candidates can see their scores improving over time and identify which categories they are weakest in.

Second, **more granular AI evaluation metrics**. I would track not just "how many evaluations happened" but "what was the average score by category" and "how long did Bedrock take to respond." This would let me identify whether certain types of questions produce better AI feedback than others.

Third, **canary deployments**. Currently, my production deployment is all-or-nothing — the new version replaces the old one for every user simultaneously. With canary deployments, I would route a small percentage of traffic to the new version first, monitor the error rate and latency, and only roll out to everyone if the metrics look healthy. AWS supports this through Lambda aliases and weighted routing.

Fourth, **multi-region deployment**. SkillScout currently runs in eu-west-1 only. For global users, I would deploy the backend to additional regions and use Route 53 latency-based routing to direct each user to the nearest region. The frontend is already global through CloudFront.

### Summary (4 minutes)

> **[SLIDE 17: Summary]**

Let me summarise what I have demonstrated today.

**User Needs:** 14 user stories across four personas with MoSCoW prioritisation, Kanban tracking, and every Must Have and Should Have fully implemented.

**The Codebase:** Python and TypeScript, distributed source control with Git, conventional commits, infrastructure as code with CDK, and APIs at every level — Boto3, Bedrock, and REST.

**CI/CD:** A fully automated pipeline with quality gates at every stage. You watched a live code commit flow from my laptop to production with linting, testing, vulnerability scanning, and manual approval.

**Security:** A comprehensive STRIDE threat model with 17 threats, all mitigated. Encryption in transit via HTTPS and at rest using AWS-managed keys. Trivy and Dependabot for vulnerability scanning.

**Testing:** 58 tests following the test pyramid — unit tests with mocking, CDK infrastructure tests, and integration tests. All running automatically in the pipeline.

**Observability:** A 12-widget CloudWatch dashboard with 6 custom business metrics, 8 alarms, structured JSON logging, and CloudTrail audit trails.

### Closing (2 minutes)

> **[SLIDE 18: Thank You]**

Building SkillScout has been a genuinely rewarding experience. It has given me the opportunity to work with a wide range of AWS services and understand the full lifecycle of a software product — from user story to production deployment, monitoring, and maintenance.

The most important thing I have learned is that quality is not a phase — it is built into every step. Good tests catch bugs before they ship. Good monitoring catches problems before users report them. Good automation removes the chance of human error. And good security is designed in from the start, not added at the end.

Thank you for your time. I am happy to answer any questions.

---

## APPENDIX: KSB EVIDENCE QUICK REFERENCE

| KSB | Where I Evidence It | Key Files/Resources |
|-----|-------------------|-------------------|
| K1 | CI/CD section — frequent merging, automated builds | GitHub Actions workflows |
| K2 | Codebase section — Git branching, conventional commits | Git history, .flake8, eslint.config.js |
| K4 | Meeting User Needs — Time/Cost/Quality value | Serverless architecture, CI/CD pipeline |
| K5 | Security — Trivy, threat model, Dependabot | THREAT_MODEL.md, workflow files |
| K7 | Codebase — Python + TypeScript codebases | questions_handler.py, service.ts |
| K8 | CI/CD — CDK immutable infrastructure | service.ts, CloudFormation templates |
| K10 | Meeting User Needs — UX feedback driving features | USER_STORIES.md, CSS fix examples |
| K11 | Observability — CloudWatch dashboard, alarms | service.ts alarm definitions |
| K12 | Observability — DynamoDB selection rationale | service.ts DynamoDB definition |
| K13 | Codebase — scripting, Boto3 SDK usage | Lambda functions, CDK code |
| K14 | Testing — test pyramid, mocks | test_admin_authorization.py |
| K15 | CI/CD — CI vs CD vs CD definitions | Pipeline workflows |
| K16 | Security — HTTPS, encryption at rest, IAM | service.ts, THREAT_MODEL.md |
| K17 | Codebase — Boto3 API usage, REST API | evaluate_answer.py, api.ts |
| K21 | Meeting User Needs — serverless microservice pattern | ARCHITECTURE.md, service.ts |
| S3 | Meeting User Needs — user stories | USER_STORIES.md |
| S5 | CI/CD — CDK deployments, Dependabot | Pipeline + CDK code |
| S6 | Observability — CloudWatch setup via CDK | service.ts monitoring section |
| S7 | Observability — CloudWatch Logs troubleshooting | Log examples |
| S9 | Security — Trivy in pipeline, threat model | Workflow files, THREAT_MODEL.md |
| S10 | Security — likelihood/impact assessment | THREAT_MODEL.md |
| S11 | Codebase — PDAC methodology | CSS bug fix example |
| S12 | CI/CD — Dependabot, automation efficiency | dependabot.yml, workflows |
| S14 | Testing — pytest, Jest CDK tests | All test files |
| S15 | CI/CD — live demo | GitHub Actions |
| S17 | Codebase — Python + TypeScript | Lambda functions, frontend |
| S18 | Codebase — AWS CDK TypeScript | infrastructure/lib/stacks/service.ts |
| S19 | Observability — metric interpretation | Dashboard walkthrough |
| S20 | Codebase — small commits, linting | Git history, .flake8 |
| B3 | Observability — ownership, accountability, MTTR | Monitoring, alerting, logging |

---

## DISTINCTION CRITERIA CHECKLIST

| Category | Distinction Criteria | How I Meet It |
|----------|---------------------|--------------|
| Meeting User Needs | "Should have" user needs met | All 5 Should Have stories implemented and tested |
| Refreshing & Patching | Fully automates refreshing/patching | Dependabot + CI/CD pipeline for dependency updates |
| Operability | Custom metrics with improvement areas | 6 custom business metrics with dashboard visualisation |
| Automation | Additional automation reducing effort | Dependabot automated dependency scanning and PR creation |
