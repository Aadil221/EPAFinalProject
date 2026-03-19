# EPA Presentation Script — SkillScout

> **Duration:** ~2.5 hours | **Format:** Word-for-word script with demo instructions
> **Project:** SkillScout — AI-Powered Interview Question Bank
> **Structure:** 8 KSB sections following the end-to-end project flow

---

## TIMING OVERVIEW

| Section | Topic | Duration | KSBs Covered |
|---------|-------|----------|--------------|
| 1 | Introduction & Project Overview | 10 min | — |
| 2 | Meeting User Needs | 12 min | K4, K10, K21, S3 |
| 3 | Code Quality | 25 min | K2, K5, K7, K14, K16, S9, S10, S11, S14, S17, S18, S20 |
| 4 | The CI/CD Pipeline + LIVE DEMO | 22 min | K1, K15, S15 |
| — | BREAK | 10 min | — |
| 5 | Refreshing & Patching | 10 min | K8, S5 |
| 6 | Data Persistence | 10 min | K12, S7 |
| 7 | Operability | 18 min | K11, S6, S19, B3 |
| 8 | Automation | 8 min | K13, K17, S12 |
| 9 | Summary & Q&A | 10 min | — |

---

## SECTION 1: INTRODUCTION & PROJECT OVERVIEW (10 minutes)

### Opening (1 minute)

> **[SLIDE 1: Title]**

Good morning/afternoon, and thank you for taking the time to assess my End Point Assessment. My name is Aadil, and today I will be presenting SkillScout — a full-stack, serverless interview preparation platform that I have designed, built, and deployed end-to-end.

Over the next two and a half hours, I am going to walk you through the entire project lifecycle — from user needs through the codebase, a live CI/CD pipeline demo, and then monitoring, data persistence, automation, and security.

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

---

## SECTION 3: CODE QUALITY (25 minutes)

> **KSBs: K2, K5, K7, K14, K16, S9, S10, S11, S14, S17, S18, S20**

### Source Control — K2, S20 (3 minutes)

> **[SLIDE 7: Languages, Testing & Tools — then switch to live screen for code walkthroughs]**

> **[SCREEN: Open GitHub repository]**

I use Git with GitHub. I work on **feature branches** to isolate changes, keeping main always deployable. Looking at my commit history, I follow **conventional commit** formatting — `feat` for features, `fix` for bug fixes, `docs` for documentation — so each commit clearly describes what changed and why.

I practise **small, frequent commits** — each one a single logical change. This makes merging straightforward because conflicts are contained to small changes. For code quality, I use **Flake8** for Python linting and **ESLint** with TypeScript rules on the frontend, both running automatically in CI.

### General Purpose Programming — K7, S17 (3 minutes)

> **[SCREEN: Open backend/src/questions_handler.py]**

**Python 3.11** is my backend language. This is the Questions Handler — approximately 400 lines. As you can see, the `handler` function works as a router: it reads the URL path and HTTP method, then directs each request to the right code block. GET lists questions, POST creates, PUT updates, DELETE removes. The whole function is wrapped in a try-except safety net — if anything unexpected happens, it returns a clean 500 error instead of crashing silently.

Notice the `require_admin(event)` calls on every write operation. This function checks the JWT token for Admin group membership. If the user is not an admin, it records a custom metric and returns 403 Forbidden — the request never reaches the database.

**TypeScript** is my frontend and infrastructure language. Let me show you the API service.

> **[SCREEN: Open frontend/src/services/api.ts]**

I define TypeScript **interfaces** for every data structure — `Question`, `EvaluationResponse`. An interface specifies the exact shape of an object. If I accidentally write `question.categorry` with a typo, TypeScript catches it immediately in my editor, not in production.

### Infrastructure as Code — S18 (2 minutes)

> **[SCREEN: Open infrastructure/lib/stacks/service.ts]**

This is `service.ts` — 739 lines of TypeScript defining my entire AWS infrastructure. Every resource — DynamoDB, Lambda, API Gateway, Cognito, S3, CloudFront, alarms, dashboard — is defined here. You can see the DynamoDB table with its partition key, billing mode, and encryption. The Lambda functions with runtime, memory, and environment variables. The CloudWatch alarms with thresholds and evaluation periods. All in code, stored in Git, reproducible with a single `cdk deploy`.

### Test Driven Development — K14, S14 (5 minutes)

> **[SCREEN: Open backend/tests/test_admin_authorization.py]**

My testing strategy follows the **test pyramid** — 37 backend unit tests, 13 CDK infrastructure tests, and 8 integration tests. The heavy lifting is done by fast unit tests. Since my code talks to real AWS services, I use **mocking** — fake objects that stand in for DynamoDB, Cognito, and CloudWatch during testing. Let me show you:

```python
from unittest.mock import patch, MagicMock

mock_table = MagicMock()
mock_dynamodb = MagicMock()
mock_dynamodb.Table.return_value = mock_table

with patch.dict(os.environ, {"TABLE_NAME": "test-table", "LOG_LEVEL": "INFO"}):
    with patch("boto3.resource", return_value=mock_dynamodb):
        from questions_handler import handler
```

The `patch("boto3.resource")` line intercepts the real AWS call and hands back my fake instead. The tests run entirely offline in milliseconds. Here is an actual test:

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

I simulate a successful database write, create a fake admin event, call the handler, and verify I get 201 Created. I also test the opposite — a regular user gets 403 Forbidden, and I can prove the database was never touched. Beyond those, I cover missing fields, non-existent questions, and badly formatted requests — 21 tests total.

For infrastructure, I have 13 CDK tests using Jest — checking that DynamoDB has point-in-time recovery, S3 has public access blocked, Lambda uses the correct Python version. If someone accidentally removes a security setting, these tests catch it.

### Security — K5, S9, S10 (7 minutes)

> **[SCREEN: Open docs/THREAT_MODEL.md]**

My threat model starts with seven **security tenets**. The three most important: **Least Privilege** — every component gets only the minimum permissions needed. **Defence in Depth** — security at every layer, frontend through database. **Risk-Based Decision Making** — proportionate controls based on likelihood and impact.

> **[Scroll to: Assumptions, Assets, and Threat Actors]**

I documented eleven assumptions, nine assets, and five threat actors — including insiders and compromised accounts, not just external hackers.

> **[Scroll to: Threats table]**

I used the **STRIDE** framework — six categories of attack. Let me highlight the key ones:

**S — Spoofing:** Can someone pretend to be someone they are not? Mitigation: every endpoint requires a valid JWT token; API Gateway rejects invalid tokens before reaching my code.

**T — Tampering:** Can someone change data without authorisation? Mitigation: only Lambda functions talk to DynamoDB, only admin users trigger writes, IAM roles enforce least privilege.

**I — Information Disclosure:** Can data leak? Mitigation: authentication on every endpoint, S3 access blocked except through CloudFront. And critically — **encryption**. In transit, HTTPS is enforced by CloudFront. At rest, DynamoDB uses AWS-managed encryption keys and both S3 buckets use server-side encryption. This costs nothing but means even raw storage access would yield unreadable data.

> **[SCREEN: Show the DynamoDB encryption configuration in service.ts]**

> **[SLIDE 16: Data Security]**

You can see `encryption: TableEncryption.AWS_MANAGED` on DynamoDB and `encryption: BucketEncryption.S3_MANAGED` on S3 — set in code, tested in CDK tests, deployed through the pipeline.

**E — Elevation of Privilege:** Can someone gain access they should not have? The Lambda checks `cognito:groups` on every write. Even if someone bypasses the UI and calls the API directly, they get 403. And JWTs are cryptographically signed — modifying a token invalidates the signature.

In total, I identified **17 threats** — 7 High, 10 Medium — all with implemented mitigations. I also created **20 security tests** to verify the controls work, including 6 automated tests in the pipeline.

> **[Scroll to: Security Tests]**

For **vulnerability scanning**, Trivy runs in both pipelines — HIGH or CRITICAL findings fail the build. For **dependency checking**, Dependabot scans weekly and auto-creates update PRs. This is the iterative security approach K5 requires — no vulnerabilities, all dependencies present and current.

### Problem Solving — S11 (2 minutes)

Let me step back from the technical detail for a moment and talk about how I approach problems when things go wrong — because things always go wrong. I follow a methodology called PDAC: Problem, Diagnosis, Action, Confirm.

A real example: users reported that login page inputs were invisible. **Problem:** inputs not visible. **Diagnosis:** using browser DevTools, I found `Admin.css` had a `.form-group input` rule with transparent styles leaking into the Login page due to equal CSS specificity. **Action:** I scoped the Login selectors to `.login-card .form-group input` for higher specificity. **Confirm:** inputs visible on Login, Admin page still working. Systematic, not guesswork.


---

## SECTION 4: THE CI/CD PIPELINE + LIVE DEMO (22 minutes)

> **KSBs: K1, K15, S15**

### Pipeline Overview — K1, K15 (7 minutes)

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

You can see the pipeline running — quality checks first (ESLint, TypeScript, Trivy), then Alpha deployment.

The pipeline is building the React application with the Alpha environment variables — the Alpha API URL and Cognito configuration. It is uploading the built files to the Alpha S3 bucket and invalidating the CloudFront cache to ensure the new version is served immediately.

> **[Wait for Alpha deploy to complete]**

Alpha deployment is complete. Let me open the Alpha URL to verify the change is live.

> **[DEMO: Open Alpha URL, show the updated footer]**

There it is — you can see the updated footer text on the Alpha environment. The change has gone from my local machine to a deployed environment in just a few minutes, with automated quality gates at every step.

Now the pipeline is waiting for manual approval. I am satisfied the change is correct, so I will approve.

> **[DEMO: Click approve in GitHub Actions]**

> **[Wait for production deploy]**

> **[DEMO: Open production URL, show the updated footer]**

The change is live in production. A code commit has progressed seamlessly from source to end user — automated quality gates at every step, with only the deliberate approval gate as manual intervention.

---

## — BREAK (10 minutes) —

> **[SLIDE 10: Break]**

Let us take a 10-minute break. When we come back, I will cover refreshing and patching, data persistence, operability, automation, and data security.

---

## SECTION 5: REFRESHING AND PATCHING (10 minutes)

> **KSBs: K8, S5**

> **[SLIDE 11: Refreshing & Patching]**

Welcome back. The pipeline I showed you implements **immutable infrastructure** — instead of modifying resources in place, CDK and CloudFormation replace them entirely. When I change Lambda code, a new deployment package replaces the old one. When I deploy a new frontend, S3 objects are replaced and CloudFront cache is invalidated. No drift, no "works on my machine."

For K8's mention of OS patching — with serverless, AWS patches the underlying infrastructure. I do not manage any operating systems. But I am responsible for **my own dependencies**, which is where Dependabot comes in.

> **[SCREEN: Open .github/dependabot.yml]**

I have three Dependabot schedules: **npm** (frontend + CDK, weekly), **pip** (Python backend, weekly), and **GitHub Actions** (monthly). Updates are grouped so I get one manageable PR per ecosystem instead of dozens. When a PR is opened, it triggers the full CI/CD pipeline — if tests pass, I review and merge.

For the **distinction criteria** — fully automating refreshing and patching — Dependabot detects, the pipeline tests, and after my approval it deploys all the way to production. The only manual step is the approval gate, which I keep deliberately.

---

## SECTION 6: DATA PERSISTENCE (10 minutes)

> **KSBs: K12, S7**

### Database Selection — K12 (4 minutes)

> **[SLIDE 12: Why DynamoDB?]**

> **[SCREEN: Show the DynamoDB table definition in service.ts]**

My data model is simple — questions with ID, text, category, difficulty. No complex relationships, no joins needed. Access patterns are read-heavy with simple queries. Given this, DynamoDB was the right choice: **single-digit millisecond latency**, **automatic scaling**, **on-demand billing** (pay only for what I use), **zero administration**, and **native Lambda integration** without connection pooling complexity.

A relational database like RDS PostgreSQL would have been overkill — no joins needed, higher costs, and the connection management mismatch with short-lived Lambda functions adds unnecessary complexity.

### Troubleshooting Distributed Systems — S7 (6 minutes)

> **[SCREEN: Open AWS CloudWatch console]**

When a request touches CloudFront, API Gateway, Lambda, and DynamoDB, the error could be anywhere. My primary tool is CloudWatch Logs with **structured JSON logging**:

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

Every log entry is a JSON object with a `request_id` field. When troubleshooting, I search CloudWatch Logs Insights with `filter request_id = "abc-123"` and instantly see every log entry for that request. My systematic approach: check API Gateway logs for the request, then Lambda logs for the error, then CloudWatch metrics for patterns, then CloudTrail if I suspect a configuration change.

This layered approach — starting from the entry point and drilling down — is how you troubleshoot distributed systems. The skill is knowing where to look.

---

## SECTION 7: OPERABILITY (18 minutes)

> **KSBs: K11, S6, S19, B3**

### Monitoring and Alerting — K11, S6 (7 minutes)

Now, troubleshooting is reactive — something breaks and you investigate. But ideally, I want to know about problems before users report them. That is what monitoring and alerting are for. Let me show you what I have built.

> **[SCREEN: Open CloudWatch Dashboard]**

> **[SCREEN: Show dashboard screenshot]**

> **[SLIDE 13: CloudWatch Dashboard]**

This is my CloudWatch Dashboard with 12 widgets in six rows. The **top two rows** cover standard Lambda and API Gateway health — invocations, errors, duration (showing both average and p99 to catch outlier slowness from cold starts), and throttles.

The **bottom four rows** are my **custom business metrics** — this is where I believe I meet the distinction criteria:

> **[SCREEN: Show custom metrics screenshot]**

- **Questions Retrieved** — early warning if the core feature stops working (drops to zero = DynamoDB down or permissions changed)
- **Question Views by Category** — product metric telling me where to invest in content
- **Admin CRUD Operations** — spots unusual patterns like a spike in deletes
- **Admin Authorisation** — security widget showing failed permission attempts in red
- **API Latency by Operation** — catches slowdowns affecting a small percentage of users
- **404 Errors** — tracks dead links from deleted questions

All 12 widgets are defined in `service.ts` — not set up by hand through the AWS console. That means the entire dashboard lives in my code, is tracked in Git, and gets created automatically every time I deploy. If I deleted the dashboard by accident, I would just redeploy and it comes back exactly as it was.


> **[SCREEN: Show custom_metrics.py]**

These metrics are sent by my `custom_metrics.py` module using `cloudwatch.put_metric_data()`. The key design decision: the metric call is wrapped in a safety net — if CloudWatch fails, I log a warning but do NOT crash the main request. Metrics are not worth breaking the user experience over. In the handler, emitting a metric is a single line: `questions_metrics.questions_retrieved(len(items))`.

### Alerting Configuration (5 minutes)

Now let me show you the alerting configuration.

> **[SCREEN: Show the alarm definitions in service.ts]**

> **[SCREEN: Show alarm screenshot]**

> **[SLIDE 14: CloudWatch Alarms]**

I have 8 CloudWatch alarms configured — 4 for standard AWS metrics and 4 for my custom business metrics.

Standard: **Lambda Errors** (≥5 in 5 min), **Lambda Throttles** (≥1, because even one means a user was turned away), **Lambda High Duration** (>5s for two consecutive windows), **API Gateway 5xx** (≥5 in 5 min).

Custom: **High API Latency** (>1s for two windows), **High 404 Rate** (>10 in 5 min — catches deleted questions with stale links), **Unauthorised Admin Access** (>5 failed checks in 5 min — a security alarm), **No Question Activity** (0 retrievals in 10 min — my "is the whole thing dead?" alarm. This one uniquely treats missing data as a problem, unlike the others where no data means nobody is using the app).

All defined in code in `service.ts`, connected to an SNS topic for email notifications.

### Interpreting Metrics — S19 (3 minutes)

How do I act on this data? If **p99 latency** is much higher than average, that usually indicates Lambda **cold starts** — most requests hit warm containers (fast) but some hit cold ones (1-3 seconds). I could fix this with provisioned concurrency at higher cost, but for my current traffic the behaviour is acceptable.

If **Question Views by Category** shows 80% AWS questions, I know where to invest in content. If the **unauthorised access alarm** fires, I check CloudWatch Logs immediately to identify the source. These custom metrics go beyond basic health — they drive product and security decisions. That is the distinction criteria.

### Audit Trail & B3 (3 minutes)

> **[SLIDE 15: CloudTrail]**

**CloudTrail** is like a security camera for my AWS account — it records every infrastructure action with who, when, what, and from where. I configured it in CDK with a dedicated encrypted S3 bucket (versioned, lifecycle rules, survives stack deletion), a CloudWatch Log Group for searchable access, and file validation to detect tampering. Between CloudWatch (what the application is doing) and CloudTrail (what people are doing to the infrastructure), I have full visibility.

All of this exists because I own this application end to end — **"you build it, you run it."** When you are the person who gets the alert at 2am, you naturally build in structured logs, tuned alarms, automated deployments, and infrastructure as code. Every design decision was shaped by the fact that I have to live with the consequences. That is B3.


---

## SECTION 8: AUTOMATION (8 minutes)

> **KSBs: K13, K17, S12**

### Scripting and APIs — K13, K17 (4 minutes)

I work with APIs at three levels. **AWS SDK (Boto3):** my Lambda functions call DynamoDB (`table.scan()`, `table.put_item()`) and Bedrock (`bedrock.invoke_model()`). I handle pagination — DynamoDB limits results to 1MB, so my code loops with `LastEvaluatedKey` until all data is read.

**Bedrock API:** The evaluate answer function sends a structured prompt to Claude 3.7 Sonnet with the question, the user's answer, and the expected JSON response format. The response is parsed and returned to the user. If anything fails — bad JSON, Bedrock error — I return a clean 500.

**Frontend REST API:** The TypeScript `fetch` calls attach the JWT token as an Authorization header, check `response.ok`, parse JSON, and throw typed errors on failure — the same pattern for every endpoint.

### Automation for Efficiency — S12 (4 minutes)

Every piece of automation saves real time. **Infrastructure deployment:** `cdk deploy` provisions every AWS resource in ~10 minutes — manually it would take hours. **CI/CD:** every push triggers automated testing and deployment in 6-14 minutes. **Code quality:** linting, formatting, and Trivy scanning run on every commit. **Monitoring:** alarms defined in code, deployed automatically.

For the **distinction criteria** — Dependabot is my example of identifying an additional automation opportunity. I identified that manually checking for dependency updates was inefficient and easy to forget. By configuring Dependabot, I automated the entire detection-to-deployment process, reducing it from a regular manual task to a simple PR review.

---

## SECTION 9: SUMMARY AND Q&A (10 minutes)

### Summary (3 minutes)

> **[SLIDE 17: Summary]**

I have shown you a complete, production-ready application. **Code Quality:** Git, Python, TypeScript, CDK, 58 tests, STRIDE threat model, PDAC problem solving. **User Needs:** 14 user stories with MoSCoW, Kanban tracking, architecture patterns. **CI/CD:** live demo of a commit flowing to production with automated quality gates. **Refreshing:** immutable infrastructure, Dependabot. **Data:** DynamoDB selection rationale, structured JSON logging. **Operability:** 12-widget dashboard, 8 alarms, custom metrics driving decisions. **Automation:** Boto3, Bedrock, REST APIs, Dependabot as additional automation. **Security:** encryption in transit and at rest, multi-layered access control.

### Closing (1 minute)

> **[SLIDE 18: Thank You]**

Building SkillScout has given me the opportunity to work with a wide range of AWS services and understand the full lifecycle of a software product. Thank you for your time — I am happy to answer any questions.

---

## APPENDIX: KSB EVIDENCE QUICK REFERENCE

| KSB | Where I Evidence It | Key Files/Resources |
|-----|-------------------|-------------------|
| K1 | CI/CD section — frequent merging, automated builds | GitHub Actions workflows |
| K2 | Code Quality section — Git branching, conventional commits | Git history, .flake8, eslint.config.js |
| K4 | Meeting User Needs — Time/Cost/Quality value | Serverless architecture, CI/CD pipeline |
| K5 | Code Quality — Trivy, threat model, Dependabot | THREAT_MODEL.md, workflow files |
| K7 | Code Quality — Python + TypeScript codebases | questions_handler.py, service.ts |
| K8 | Refreshing — CDK immutable infrastructure | service.ts, CloudFormation templates |
| K10 | Meeting User Needs — UX feedback driving features | USER_STORIES.md, CSS fix examples |
| K11 | Operability — CloudWatch dashboard, alarms | service.ts alarm definitions |
| K12 | Data Persistence — DynamoDB selection rationale | service.ts DynamoDB definition |
| K13 | Automation — scripting, Boto3 SDK usage | Lambda functions, CDK code |
| K14 | Code Quality — test pyramid, mocks | test_admin_authorization.py |
| K15 | CI/CD — CI vs CD vs CD definitions | Pipeline workflows |
| K16 | Data Security — HTTPS, encryption at rest, IAM | service.ts, THREAT_MODEL.md |
| K17 | Automation — Boto3 API usage, documentation | evaluate_answer.py, api.ts |
| K21 | Meeting User Needs — serverless microservice pattern | ARCHITECTURE.md, service.ts |
| S3 | Meeting User Needs — user stories | USER_STORIES.md |
| S5 | Refreshing — CDK deployments | Pipeline + CDK code |
| S6 | Operability — CloudWatch setup via CDK | service.ts monitoring section |
| S7 | Data Persistence — CloudWatch Logs troubleshooting | Log examples |
| S9 | Code Quality — Trivy in pipeline, threat model | Workflow files, THREAT_MODEL.md |
| S10 | Data Security — likelihood/impact assessment | THREAT_MODEL.md |
| S11 | Code Quality — PDAC methodology | CSS bug fix example |
| S12 | Automation — Dependabot, CI/CD, IaC | dependabot.yml, workflows |
| S14 | Code Quality — pytest, Jest CDK tests | All test files |
| S15 | CI/CD — live demo | GitHub Actions |
| S17 | Code Quality — Python + TypeScript | Lambda functions, frontend |
| S18 | Code Quality — AWS CDK TypeScript | infrastructure/lib/stacks/service.ts |
| S19 | Operability — metric interpretation | Dashboard walkthrough |
| S20 | Code Quality — small commits, linting | Git history, .flake8 |
| S22 | Code Quality — incremental CSS refactoring | Recent commit history |
| B3 | Operability — ownership, accountability | Monitoring, alerting, logging |

---

## DISTINCTION CRITERIA CHECKLIST

| Category | Distinction Criteria | How I Meet It |
|----------|---------------------|--------------|
| Meeting User Needs | "Should have" user needs met | Admin category dropdown, CSS improvements from user feedback |
| Refreshing & Patching | Fully automates refreshing/patching | Dependabot + CI/CD pipeline for dependency updates |
| Operability | Custom metrics with improvement areas | 4 custom business metrics with dashboard visualisation |
| Automation | Additional automation reducing effort | Dependabot automated dependency scanning and PR creation |
