# EPA Presentation Script — SkillScout

> **Duration:** 3 hours | **Format:** Word-for-word script with demo instructions
> **Project:** SkillScout — AI-Powered Interview Question Bank
> **Structure:** 8 KSB sections following the end-to-end project flow

---

## TIMING OVERVIEW

| Section | Topic | Duration | KSBs Covered |
|---------|-------|----------|--------------|
| 1 | Introduction & Project Overview | 15 min | — |
| 2 | Meeting User Needs | 20 min | K4, K10, K21, S3 |
| 3 | Code Quality | 35 min | K2, K5, K7, K14, S9, S11, S14, S17, S18, S20, S22 |
| 4 | The CI/CD Pipeline + LIVE DEMO | 30 min | K1, K15, S15 |
| — | BREAK | 10 min | — |
| 5 | Refreshing & Patching | 15 min | K8, S5 |
| 6 | Data Persistence | 15 min | K12, S7 |
| 7 | Operability | 25 min | K11, S6, S19, B3 |
| 8 | Automation | 15 min | K13, K17, S12 |
| 9 | Data Security | 15 min | K16, S10 |
| 10 | Summary & Q&A Buffer | 15 min | — |

---

## SECTION 1: INTRODUCTION & PROJECT OVERVIEW (15 minutes)

### Opening (2 minutes)

Good morning/afternoon, and thank you for taking the time to assess my End Point Assessment. My name is Aadil, and today I will be presenting SkillScout — a full-stack, serverless interview preparation platform that I have designed, built, and deployed end-to-end.

Over the next three hours, I am going to walk you through the entire project lifecycle. I will start with how I gathered and translated user needs into deliverable work, then move through the codebase itself — covering both the general purpose code and the infrastructure-as-code. I will demonstrate the CI/CD pipeline live, including making a real code change and pushing it all the way through to production. I will then cover how I approached monitoring, data persistence, automation, and security throughout the project.

Everything I am about to show you is my own work. I built it, I deployed it, I monitor it, and I maintain it — which I believe reflects the "you build it, you run it" philosophy that underpins good DevOps practice.

### Project Overview (5 minutes)

So, what is SkillScout? At its core, it is an AI-powered interview question bank. Let me explain the business problem it solves.

Currently, people preparing for technical interviews lack a structured, centralised way to practise. What that means in practice is that candidates are relying on scattered blog posts, outdated question lists, personal notes, and tribal knowledge passed around informally. There is no single source of truth, and there is no way to get meaningful feedback on your answers without finding someone willing to mock-interview you.

This causes four specific problems. First, there is **no structured practice environment** — candidates are reading questions and mentally rehearsing answers, but never actually practising under realistic conditions with feedback. Second, there is **inconsistent question quality** — the questions people find online vary wildly in relevance, difficulty, and accuracy, with no central owner ensuring they are up to date. Third, candidates are **wasting time searching for good questions** — instead of actually practising, they are spending time sifting through resources trying to find questions that are relevant to the role they are preparing for. And fourth, there is **no feedback loop** — without someone to evaluate your answer, you have no way of knowing whether your response was strong, weak, or missing the point entirely.

SkillScout addresses all four of these problems. It provides a centralised, searchable repository of curated interview questions, categorised by topic and difficulty, so candidates can find relevant practice material quickly. Admins control the content, which means questions can be reviewed, updated, and retired to maintain quality. And the AI evaluation feature — powered by an evaluator I call Marcus — closes the feedback loop entirely. You type your answer, submit it, and Marcus gives you a score out of 100, your strengths, areas for improvement, and specific suggestions for how to improve. That is structured, on-demand feedback without needing another person.

So to summarise the business case: SkillScout takes something that was fragmented and unstructured — interview preparation — and makes it centralised, searchable, and feedback-driven. That is the problem I set out to solve, and everything I am about to show you is in service of that goal.

Let me show you the application now.

> **[DEMO: Open the live application in browser]**

Here is the landing page. You can see the clean, modern interface. Let me log in with my credentials.

> **[DEMO: Log in to the application]**

Once authenticated, I am taken to the Question Bank. You can see the search bar at the top, the category and difficulty filters, and the question cards below. Each card shows the question text, difficulty level, and category. If I click "Practice Answer" on any question, a modal opens where I can type my answer and submit it to Marcus for AI evaluation.

> **[DEMO: Click Practice Answer, type a brief answer, submit for AI evaluation]**

As you can see, Marcus returns a score out of 100, tells me whether my approach was correct, lists my strengths, areas for improvement, suggestions, and gives a personal comment. All of this is powered by AWS Bedrock running the Claude 3.7 Sonnet model.

Now, if I navigate to the Admin Dashboard — and I can only see this link because my account is in the Admin Cognito group — I have full CRUD capabilities. I can create questions, edit them, delete them, and filter the question bank. The admin authorisation is enforced both on the frontend, where the link is conditionally rendered, and on the backend, where every write operation checks the JWT token for Admin group membership.

> **[DEMO: Show Admin Dashboard briefly]**

### Architecture Overview (8 minutes)

Let me now walk you through the architecture.

> **[SCREEN: Show ARCHITECTURE.md or architecture diagram]**

SkillScout follows a serverless microservice architecture on AWS. Let me go through each layer.

**The Frontend** is a React 19 application built with TypeScript and Vite. It is hosted on an S3 bucket with CloudFront sitting in front of it as a CDN. CloudFront provides HTTPS encryption in transit, global edge caching, and it restricts direct access to the S3 bucket through an Origin Access Identity. Users never hit S3 directly — they always go through CloudFront.

**Authentication** is handled by Amazon Cognito. Users sign up, receive a temporary password via email, and are forced to change it on first login. Cognito issues JWT tokens which the frontend stores and attaches to every API request. The API Gateway validates these tokens using a Cognito Authorizer before any Lambda function is invoked.

**The API Layer** is Amazon API Gateway. It exposes three main resource paths: `/questions` for CRUD operations, `/answers` for AI evaluation, and `/signup` for user registration. Every endpoint except signup requires a valid Cognito JWT token.

**The Compute Layer** consists of three AWS Lambda functions, all written in Python 3.11:
- The Questions Handler manages all CRUD operations against DynamoDB
- The Evaluate Answer function sends the user's answer to AWS Bedrock and returns the AI feedback
- The Signup Handler uses the Cognito AdminCreateUser API to register new users

**The Data Layer** is Amazon DynamoDB — a fully managed NoSQL database. I chose DynamoDB for several reasons which I will explain in detail in the Data Persistence section, but in short: it scales automatically, has single-digit millisecond latency, and integrates natively with Lambda.

**Monitoring** is implemented through CloudWatch and CloudTrail. I have custom metrics, alarms, dashboards, and audit logging — all of which I will cover in the Operability section.

**The entire infrastructure** is defined as code using AWS CDK in TypeScript, and it is deployed through automated GitHub Actions pipelines to both an Alpha testing environment and a Production environment.

That is the high-level picture. Now let me dive into each section in detail, starting with how I gathered and translated user needs.

---

## SECTION 2: MEETING USER NEEDS (20 minutes)

> **KSBs: K4, K10, K21, S3**

### User Stories — S3 (8 minutes)

The first thing I did before writing any code was to understand who would use this application and what they needed. This is critical because, as K10 states, the user experience sits at the heart of modern development practices.

> **[SCREEN: Open docs/USER_STORIES.md]**

I created detailed user stories for four distinct user personas: End Users, Developers, Admin Users, and Platform Administrators. Let me walk through a few examples.

For the End User persona, one of my user stories reads: "As an end user, I want to search and filter questions by category and difficulty so that I can focus on specific areas I need to practice." The acceptance criteria for this story include: the search bar filters questions in real-time, the category dropdown lists all available categories, the difficulty dropdown offers Easy, Medium, and Hard options, and the results count updates dynamically.

What I want to highlight here is that these user stories are written in plain language that anyone can understand — a product manager, a designer, a fellow developer, or a stakeholder. They follow the standard "As a [persona], I want [feature], so that [benefit]" format, and each one has clearly defined acceptance criteria that can be objectively verified.

I also want to point out how these user stories directly translated into my Kanban board. Each story became one or more tasks with clear deliverables. For example, the search and filter story became three tasks: implement the search input component, implement the filter dropdowns, and wire up the real-time filtering logic. This is exactly what S3 requires — translating user needs into deliverable tasks with clear, concise, and unambiguous user stories.

The user stories also distinguish between "must have" and "should have" requirements. The must-haves include core functionality like authentication, question browsing, and AI evaluation. The should-haves include features like the admin dashboard category dropdown that I recently implemented — which meets the distinction criteria of producing code that meets the "should have" identified needs.

### Business Value of DevOps — K4 (5 minutes)

Now let me address the business value of DevOps in terms of Time, Cost, and Quality — which is K4.

**Time:** By implementing automated CI/CD pipelines, every code change I make goes from commit to production in approximately 14 minutes for the backend, and 6 minutes for the frontend, plus approval time. Without this automation, a manual deployment process — packaging code, uploading to S3, running CloudFormation commands, running tests manually — would take me at least an hour, possibly more. That is a massive time saving that compounds with every deployment.

**Cost:** I chose a serverless architecture specifically for cost optimisation. Lambda charges per invocation and per millisecond of execution time, meaning when nobody is using the application, I pay effectively nothing. DynamoDB is configured with on-demand billing, so I only pay for the read and write capacity I actually use. Compare this to running an EC2 instance or an ECS cluster 24/7 — the cost difference for a low-to-medium traffic application like this is significant.

**Quality:** This is where the DevOps approach really shines. I have built quality into every stage of the pipeline. Linting catches code style issues. Unit tests catch functional regressions. Vulnerability scanning catches security issues. Integration tests verify the deployed application works end-to-end. And monitoring catches any issues that make it to production. Quality is not something I bolt on at the end — it is baked into every single commit.

### Architecture Principles — K21 (4 minutes)

K21 asks about architecture principles, common patterns, and translating user needs into infrastructure and application code.

The key architectural pattern I followed is the serverless microservice pattern. Each Lambda function has a single responsibility — questions handling, answer evaluation, and user signup. This separation means I can deploy, test, and scale each function independently. If the AI evaluation function starts receiving heavy traffic, Lambda scales it automatically without affecting the questions handler.

I also followed the API Gateway pattern, which provides a single entry point for all client requests. This simplifies the frontend code — it only needs to know one base URL — and it gives me a central point for authentication, rate limiting, and request routing.

The frontend follows a single-page application pattern with React Router handling client-side routing. This means faster page transitions, better user experience, and reduced server load because the browser handles navigation.

Another important pattern is the event-driven architecture. When a user submits an answer, the frontend sends a request to API Gateway, which triggers the Lambda function, which calls Bedrock, and the result flows back. Each component is loosely coupled and communicates through well-defined interfaces — API contracts. This makes the system resilient and easy to modify.

### User Experience — K10 (3 minutes)

Finally, K10 emphasises how user experience drives modern development. Let me give you a concrete example.

When I first deployed the application, I collected feedback from test users. One piece of feedback was that the login page inputs were invisible — users could not see what they were typing. I investigated and found it was a CSS specificity issue where the Admin page styles were overriding the Login page styles. I fixed this by scoping the CSS selectors to their respective page containers.

Another example: users on the Admin page told me that typing category names manually was error-prone and tedious. They wanted a dropdown list of existing categories. So I implemented a category select dropdown that pulls from existing categories, with the option to add a new custom category. This is a direct example of user feedback driving a feature improvement.

The key point is that user experience is not static. It is iterative. You build, you gather feedback, you improve, and you repeat. That cycle is at the heart of how I have developed SkillScout.

---

## SECTION 3: CODE QUALITY (35 minutes)

> **KSBs: K2, K5, K7, K14, S9, S11, S14, S17, S18, S20, S22**

### Source Control — K2, S20 (7 minutes)

Let me start with how I manage source control, which covers K2 and S20.

> **[SCREEN: Open GitHub repository]**

I use Git as my distributed version control system, hosted on GitHub. The principles of distributed source control are fundamental to how I work. Let me explain how I exploit the features of Git in this project.

First, **branching**. I use feature branches to isolate development work. When I need to implement a new feature or fix a bug, I create a branch off main, make my changes there, and then merge back to main. This means the main branch always represents a stable, deployable state. If something goes wrong on a feature branch, it does not affect anyone else or the deployed application.

> **[SCREEN: Show git log with recent commits]**

If you look at my commit history, you can see I follow conventional commit message formatting — `feat` for features, `fix` for bug fixes, `docs` for documentation. Each commit message clearly describes what was changed and why. For example, `fix(ui): scope Login input styles to prevent Admin.css override` — you can immediately understand what this commit does without reading the code.

I also practice **small, frequent commits**, which is what S20 requires. Each commit represents a single, logical change. I do not bundle unrelated changes into one commit. This makes merging easier because if a merge conflict does arise, it is contained to a small, understandable change rather than a massive multi-file refactor.

For code quality enforcement, I use **Flake8** as my Python linter, configured in the `.flake8` file with a max line length of 88 characters to match Black formatter conventions. On the frontend, I use **ESLint** with TypeScript-aware rules. Both linters run automatically in the CI pipeline, so any code that does not meet the style standards will fail the build.

> **[SCREEN: Show .flake8 file and eslint.config.js]**

This approach means that merging is straightforward. Because everyone — in this case, me as the sole developer, but the principle applies to teams — follows the same formatting rules, diffs are clean and meaningful. You never get commits that are just formatting changes mixed in with logic changes.

### General Purpose Programming — K7, S17 (5 minutes)

K7 and S17 cover general purpose programming and infrastructure-as-code. In this project, I use two general purpose programming languages.

**Python 3.11** is my backend language. Let me show you the questions handler.

> **[SCREEN: Open backend/src/questions_handler.py]**

This is the main Lambda function — approximately 400 lines of Python. It handles all CRUD operations for the question bank. I want to draw your attention to several things.

First, the code structure. I have a main `lambda_handler` function that acts as a router, directing requests based on the HTTP method and path. Each operation — get all, get one, create, update, delete — has its own dedicated function. This follows the single responsibility principle at the function level.

Second, error handling. Every operation is wrapped in try-except blocks. If something goes wrong, the function returns a structured error response with an appropriate HTTP status code — 400 for bad requests, 404 for not found, 500 for internal errors. It never crashes silently.

Third, the admin authorisation. The `require_admin` function extracts the `cognito:groups` claim from the JWT token and checks for Admin group membership. If the user is not an admin, it returns a 403 Forbidden response immediately. This is enforced on every write operation.

**TypeScript** is my frontend and infrastructure language.

> **[SCREEN: Open frontend/src/services/api.ts]**

This is my API service layer. Notice how I define TypeScript interfaces for `Question` and `EvaluationResponse` — this gives me compile-time type safety. If I try to access a property that does not exist on a question object, TypeScript will catch it before the code ever runs. This is a significant quality advantage over plain JavaScript.

### Infrastructure as Code — S18 (5 minutes)

S18 requires me to specify cloud infrastructure in an infrastructure-as-code domain-specific language. I use AWS CDK with TypeScript.

> **[SCREEN: Open infrastructure/lib/stacks/service.ts]**

This is my main infrastructure stack — around 738 lines of TypeScript CDK code. Every single AWS resource in my project is defined here. There is no clicking around in the AWS console. If I need to change a resource, I change the code, commit it, and the pipeline deploys it.

Let me walk through the key constructs.

Here is my DynamoDB table definition. You can see I have specified the table name, the partition key — `id` of type STRING — the billing mode as PAY_PER_REQUEST for cost optimisation, point-in-time recovery enabled for data protection, and encryption using AWS-managed keys.

Here is my Lambda function definition. I specify the runtime as Python 3.11, the handler function path, the memory allocation, the timeout, and the environment variables it needs — like the DynamoDB table name and Cognito User Pool ID.

Here are my CloudWatch alarms. I define the metric, the threshold, the evaluation period, and the comparison operator — all in code. This means my monitoring is version-controlled, reviewable, and reproducible.

The power of infrastructure-as-code is that I can destroy this entire stack and recreate it identically in minutes. There is no configuration drift. There are no manual steps. What you see in this file is exactly what is deployed in AWS. This is also directly relevant to immutable infrastructure, which I will cover later.

### Test Driven Development — K14, S14 (8 minutes)

K14 and S14 are about Test Driven Development, the test pyramid, unit testing, and appropriate use of test doubles and mocking strategies.

> **[SCREEN: Open backend/tests/test_admin_authorization.py]**

Let me show you my most comprehensive test file — the admin authorisation tests. This file contains 21 tests that verify the admin authorisation logic.

The test pyramid tells us to have the most unit tests at the base, fewer integration tests in the middle, and the fewest end-to-end tests at the top. My project follows this principle. I have 40 backend unit tests, 13 CDK infrastructure tests, and 7 integration tests. The heavy lifting is done by unit tests, which are fast, reliable, and isolated.

Now, let me talk about **test doubles and mocking**. In unit testing, you do not want to actually call AWS services — that would be slow, expensive, and unreliable. Instead, I use mocks.

> **[SCREEN: Show the mock setup in the test file]**

Here you can see I use Python's `unittest.mock.patch` decorator to mock the `boto3.resource` call. This replaces the real DynamoDB connection with a mock object that I can control. When the code under test calls `table.scan()`, it does not hit DynamoDB — it returns whatever I have configured the mock to return.

Let me walk through a specific test:

```python
def test_post_question_admin_user(self):
```

This test verifies that an admin user can create a question. I set up the mock JWT token to include the Admin group in `cognito:groups`. Then I call the handler with a POST request containing the question data. Finally, I assert that the response has a 201 status code and the DynamoDB `put_item` method was called with the correct data.

The corresponding negative test is:

```python
def test_post_question_non_admin_user(self):
```

This verifies that a non-admin user receives a 403 Forbidden response when trying to create a question, and — critically — that `put_item` was never called. The mock allows me to verify not just what was returned, but what was not called.

I also test edge cases like missing required fields, questions that do not exist, and malformed requests. This comprehensive test coverage means I can refactor the code with confidence — if I break something, the tests will catch it.

> **[SCREEN: Show infrastructure/test/service-stack.test.ts]**

For infrastructure, I have 13 CDK assertion tests using Jest. These verify that my CDK code synthesises the correct CloudFormation template. For example, I test that the DynamoDB table has point-in-time recovery enabled, that S3 has public access blocked, that Lambda functions use the correct runtime, and that the signup endpoint is public. This is testing my infrastructure-as-code in the same way I test my application code.

### Security Tools and Techniques — K5, S9 (5 minutes)

K5 and S9 are about security tools and techniques. Let me walk you through my threat model, which I believe is one of the most thorough pieces of work in this project.

> **[SCREEN: Open docs/THREAT_MODEL.md]**

This is something I created before I started building the security controls, and I updated it as the application evolved. The purpose of a threat model is to systematically identify what could go wrong, how likely it is, how bad it would be, and what I am going to do about it. It is not about eliminating every possible risk — that would be impossible — it is about making informed, proportionate decisions.

> **[Scroll to: Security Tenets]**

Before I identified any specific threats, I established seven security tenets. These are the guiding principles that shaped every security decision in the project. The most important ones are Least Privilege — every component only has the permissions it absolutely needs — Defence in Depth — security controls at multiple layers so that no single failure compromises the system — and Risk-Based Decision Making — I prioritise controls based on likelihood times impact rather than trying to fix everything equally.

The framework I used to identify threats is called STRIDE. It was developed by Microsoft and it gives you six categories to think through systematically. Each letter represents a different type of attack.

> **[Scroll to: Threats table]**

**S is for Spoofing** — can someone pretend to be someone else? In my case, the main spoofing risk is forged or stolen JWT tokens. I mitigate this with Cognito token validation at the API Gateway level. Every request is checked for a valid signature, expiry, and issuer.

**T is for Tampering** — can someone modify data they should not be able to? The risk here is unauthorised modification of interview questions. I mitigate this with admin-only write access enforced in the Lambda function, plus DynamoDB access restricted to Lambda through least-privilege IAM roles.

**R is for Repudiation** — can someone do something and then deny it? If an admin deletes a question and claims they did not, I need evidence. That is why I log every admin action with the user identity, group membership, and timestamp in CloudWatch. CloudTrail also captures all AWS API activity for infrastructure-level accountability.

**I is for Information Disclosure** — can data leak to the wrong people? The risk is interview questions being exposed without authentication. I mitigate this by requiring a valid Cognito JWT on every API endpoint, and the database is never directly accessible from the frontend — everything goes through the controlled path of API Gateway to Lambda to DynamoDB.

**D is for Denial of Service** — can someone make the system unavailable? Excessive API requests could overwhelm the application. API Gateway has built-in throttling, Lambda has concurrency limits, and CloudFront provides DDoS protection at the edge.

**E is for Elevation of Privilege** — can someone gain access they should not have? The main risk is a regular user accessing admin functions. I mitigate this at multiple levels: the frontend conditionally hides the admin link, the Lambda function checks the cognito groups claim on every write operation, and even if someone bypasses the UI and calls the API directly, the backend blocks them with a 403.

> **[Scroll to: Threat Actors]**

I identified five threat actors, ranging from an external unauthenticated attacker with no access, all the way up to someone with CI/CD pipeline access who could introduce malicious code. The reason I define these actors is so that I assess threats from multiple perspectives — not just the obvious external attacker, but also the insider, the compromised admin, and the supply chain risk.

> **[Scroll to: Threats table]**

In total I identified 17 threats — 7 rated High priority and 10 rated Medium. Each one has a STRIDE classification, the affected assets, and specific mitigations. Every single mitigation has a status of Implemented — none of these are theoretical or planned. They are all built and deployed.

> **[Scroll to: Security Tests]**

Finally, and I think this is what ties the whole model together — I did not just document mitigations on paper. I created 20 security tests to verify that the controls actually work. Six of these are automated unit tests that run in the pipeline on every commit. Two are automated through the CI/CD pipeline itself — Trivy scanning and Dependabot. And twelve are manual or review-based tests that I performed and documented.

For example, Security Test 2 verifies that a non-admin user cannot create a question — the test authenticates as a regular user, attempts a POST request, and confirms it gets a 403 Forbidden response. Security Test 16 verifies XSS protection — I created a question containing script tags and confirmed the script does not execute when rendered.

Now beyond the threat model itself, I also have automated security tooling integrated into the pipeline.

For **vulnerability scanning**, I have integrated Trivy into both CI/CD pipelines. Trivy scans the codebase for known vulnerabilities in dependencies. If it finds anything rated HIGH or CRITICAL severity, the pipeline fails and the code cannot be deployed. This runs on every single commit — it is not a manual, occasional check. It is automated and mandatory.

For **dependency checking**, I have configured Dependabot to scan my npm and pip dependencies weekly. If a vulnerable dependency is found, Dependabot automatically creates a pull request to update it. This ensures my dependencies stay current without me having to manually check every week.

### Problem Solving — S11 (3 minutes)

S11 requires a systematic approach to solving problems. I follow the PDAC methodology: Problem, Diagnosis, Action, Confirm.

Let me give you a real example from this project. Recently, users reported that the login page inputs were invisible — they could not see the email and password fields.

**Problem:** Login inputs are not visible on the page.

**Diagnosis:** I used browser developer tools to inspect the input elements. I could see that the computed styles showed `background: rgba(255, 255, 255, 0.05)` and `color: white` — both of which would make the inputs invisible on a white card. I then searched the CSS files and found that `Admin.css` had a `.form-group input` rule with these transparent styles, intended for the Admin page's dark theme. Because both Admin.css and Login.css used the same selector with equal specificity, and Admin.css loaded after Login.css in the import order, Admin's styles were winning.

**Action:** I scoped the Login CSS selectors to `.login-card .form-group input`, giving them higher specificity. I later applied the same scoping pattern to Admin.css to prevent it from leaking styles to other pages.

**Confirm:** I verified the fix by loading the login page and confirming the inputs were visible with dark text on a white background. I also checked the Admin page to ensure its own inputs still worked correctly within the modal.

This is a systematic, logical approach. I did not just guess or try random changes. I identified the root cause through investigation, applied a targeted fix, and verified it worked without side effects.

### Incremental Refactoring — S22 (2 minutes)

S22 is about incremental refactoring — applying small behaviour-preserving code changes to evolve the architecture.

A clear example of this is the CSS scoping work I just described. I did not rewrite all the CSS at once. I made five separate commits, each one addressing a specific issue:

1. First, I scoped the Login input styles
2. Then I changed the question card borders
3. Then I scoped the Admin question card styles
4. Then I made the Admin cards white
5. Finally, I fixed the Admin search bar visibility

Each commit was small, focused, and independently verifiable. If any one of them had caused a problem, I could revert just that commit without affecting the others. This is exactly what incremental refactoring looks like in practice — small, safe steps that collectively evolve the codebase.

---

## SECTION 4: THE CI/CD PIPELINE + LIVE DEMO (30 minutes)

> **KSBs: K1, K15, S15**

### Pipeline Overview — K1, K15 (10 minutes)

Now let me walk you through the CI/CD pipeline, which I believe is one of the strongest parts of this project.

> **[SCREEN: Open docs/PIPELINE.md]**

First, let me define the three terms that K15 asks about: Continuous Integration, Continuous Delivery, and Continuous Deployment.

**Continuous Integration** is the practice of frequently merging code changes into a shared repository, with each merge triggering an automated build and test process. The key benefit is that integration problems are detected early. If I merge code twice a day instead of once a month, any conflicts or failures are small and easy to fix. My project implements this through GitHub Actions — every push to main triggers the pipeline, which builds the code and runs all tests.

**Continuous Delivery** extends this by ensuring that the code is always in a deployable state. After the build and tests pass, the code is automatically deployed to a staging environment — in my case, the Alpha environment. At this point, the code could go to production at any time, but it requires a manual approval step. This is what my pipeline implements.

**Continuous Deployment** goes one step further and automatically deploys to production without manual approval. My pipeline does not fully implement this — I have chosen to keep a manual approval gate before production deployments because this is a real application and I want a human checkpoint. However, the infrastructure to support full continuous deployment is in place; I would simply need to remove the approval step.

Now let me show you the actual pipelines.

> **[SCREEN: Open .github/workflows/infa-and-backend.yml]**

I have two pipelines. This first one handles the backend and infrastructure. It is triggered whenever there are changes to the `backend/`, `infrastructure/`, or `.github/workflows/` directories. Let me walk through each stage.

**Stage 1: Backend Tests.** This installs Python dependencies, runs Black to check code formatting, runs Flake8 for linting, runs the full pytest suite, and then runs Trivy to scan for vulnerabilities. If any of these fail, the pipeline stops immediately.

**Stage 2: CDK Check.** This installs the infrastructure dependencies, runs the Jest CDK tests, runs a TypeScript type check, and runs `cdk synth` to verify the CloudFormation template can be generated. Again, any failure stops the pipeline.

**Stage 3: Deploy to Alpha.** This deploys the CDK stack to the Alpha AWS account in eu-west-1. This is my testing environment.

**Stage 4: Integration Tests.** After Alpha deployment, the pipeline runs integration tests against the live Alpha environment. These tests verify that the API Gateway endpoints are accessible, CORS headers are correct, and the application responds with expected status codes. This is a crucial step — it tests the real deployed infrastructure, not just mocks.

**Stage 5: Manual Approval.** The pipeline pauses here and waits for me to manually approve the production deployment. I can review the Alpha deployment, run manual checks, and only approve when I am satisfied.

**Stage 6: Deploy to Production.** Once approved, the same CDK stack is deployed to the Production AWS account.

> **[SCREEN: Open .github/workflows/frontend.yml]**

The frontend pipeline follows a similar pattern but is simpler: quality checks including ESLint, TypeScript type checking, and Trivy scanning, then deploy to Alpha S3 and invalidate CloudFront, then manual approval, then deploy to Production S3 and invalidate CloudFront.

### LIVE DEMO — S15 (20 minutes)

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

You can see the pipeline has started. Let me narrate what is happening at each stage.

The first job is **Quality Checks**. It is installing dependencies, running ESLint to check for code quality issues, running the TypeScript compiler to check for type errors, and running Trivy to scan for vulnerabilities. This is K1 in action — automated quality assurance on every commit.

> **[Wait for quality checks to pass, narrate as they progress]**

Quality checks have passed. The code is clean, type-safe, and free of known vulnerabilities. Now it is moving to the **Alpha Deployment** stage.

The pipeline is building the React application with the Alpha environment variables — the Alpha API URL and Cognito configuration. It is uploading the built files to the Alpha S3 bucket and invalidating the CloudFront cache to ensure the new version is served immediately.

> **[Wait for Alpha deploy to complete]**

Alpha deployment is complete. Let me open the Alpha URL to verify the change is live.

> **[DEMO: Open Alpha URL, show the updated footer]**

There it is — you can see the updated footer text on the Alpha environment. The change has gone from my local machine to a deployed environment in just a few minutes, with automated quality gates at every step.

Now the pipeline is waiting for my manual approval before deploying to production. In a real workflow, this is where I would perform any additional manual testing or review. For this demo, I am satisfied the change is correct, so I will approve it.

> **[DEMO: Click approve in GitHub Actions]**

The production deployment is now running. It is the same process — build with production environment variables, upload to S3, invalidate CloudFront.

> **[Wait for production deploy to complete]**

Production deployment is complete. Let me open the production URL.

> **[DEMO: Open production URL, show the updated footer]**

And there it is — the change is now live in production. What you have just witnessed is a code commit progressing seamlessly from a build artefact to the end user, which is exactly what the pass criteria require. The entire process was automated, with quality gates at every step, and the only manual intervention was the approval gate — which is a deliberate safety mechanism.

This is the power of CI/CD. This is what K1, K15, and S15 look like in practice.

---

## — BREAK (10 minutes) —

Let us take a 10-minute break. When we come back, I will cover refreshing and patching, data persistence, operability, automation, and data security.

---

## SECTION 5: REFRESHING AND PATCHING (15 minutes)

> **KSBs: K8, S5**

### Immutable Infrastructure — K8, S5 (15 minutes)

Welcome back. Let me now talk about immutable infrastructure, which covers K8 and S5.

The concept of immutable infrastructure is straightforward: instead of modifying existing resources in place — which can lead to configuration drift, inconsistencies, and hard-to-reproduce bugs — you replace them entirely. When you need to update something, you do not SSH into a server and change a config file. You define the new desired state in code, and the infrastructure tooling destroys the old resources and creates new ones.

My project implements this through AWS CDK and CloudFormation. Every time I deploy a change through my CI/CD pipeline, CDK generates a CloudFormation template representing the desired state of my infrastructure. CloudFormation then compares this to the current state and creates a changeset. Resources that need to be updated are replaced — not modified in place.

Let me give you concrete examples.

**Lambda Functions:** When I change the code for a Lambda function, CDK packages the new code, uploads it to S3, and updates the Lambda function configuration to point to the new code. The old code is not modified — a completely new deployment package replaces it.

**CloudFront Distribution:** When I deploy a new frontend version, the S3 objects are replaced entirely and the CloudFront cache is invalidated. Every user gets the new version. There is no scenario where some users see the old version and others see the new version for an extended period.

**DynamoDB Table:** The table schema is defined in CDK. If I needed to change the partition key or add a global secondary index, CDK would handle the creation of a new table configuration.

Now, K8 specifically mentions operating system updates, container patching, and security patching. With a serverless architecture, a significant advantage is that AWS manages the underlying infrastructure. I do not manage any operating systems or containers. AWS patches the Lambda runtime, the API Gateway infrastructure, the DynamoDB servers, and the CloudFront edge locations. This is a deliberate architectural choice — by going serverless, I delegate the patching responsibility to AWS, which has dedicated teams and automated processes for keeping the underlying infrastructure up to date.

However, I am still responsible for patching my own dependencies. This is where **Dependabot** comes in. Dependabot scans my npm and pip dependencies weekly and creates pull requests for any outdated or vulnerable packages. When I merge a Dependabot PR, the pipeline automatically deploys the updated dependencies through the same CI/CD process I just demonstrated.

For the **distinction criteria** — fully automating the refreshing and patching process — my pipeline already handles this. When a Dependabot PR is merged, the pipeline runs all tests, deploys to Alpha, runs integration tests, and after manual approval, deploys to production. The only manual step is the approval gate. I could remove that gate for Dependabot PRs specifically, which would make it fully automated, but I have chosen to keep the human checkpoint for now.

The key insight is that immutable infrastructure, combined with CI/CD automation, means I can refresh my entire application stack confidently and repeatedly. If a deployment goes wrong, I can roll back by redeploying the previous version — there is no half-applied state to worry about.

---

## SECTION 6: DATA PERSISTENCE (15 minutes)

> **KSBs: K12, S7**

### Database Selection — K12 (8 minutes)

K12 is about understanding which database technologies are appropriate for different application needs. Let me explain why I chose DynamoDB for SkillScout.

> **[SCREEN: Show the DynamoDB table definition in service.ts]**

First, let me describe the data characteristics of my application. SkillScout stores interview questions. Each question has an ID, question text, category, difficulty, competency type, and an optional reference answer. The data model is simple — there are no complex relationships between entities, no need for joins, and no need for ACID transactions across multiple tables.

The access patterns are:
- **Read-heavy:** Most users browse and search questions. Reads vastly outnumber writes.
- **Simple queries:** Get all questions, get one question by ID. No complex aggregations.
- **Low write volume:** Only admins create, update, or delete questions.

Given these characteristics, DynamoDB was the right choice for several reasons:

1. **Performance:** DynamoDB provides single-digit millisecond read and write latency, which is ideal for a responsive user experience.
2. **Scalability:** It scales automatically. If my application suddenly gets thousands of users, DynamoDB handles the increased read traffic without any configuration changes.
3. **Cost:** With on-demand billing, I pay only for the reads and writes I actually perform. For a low-to-medium traffic application, this is significantly cheaper than provisioning a relational database instance.
4. **Managed service:** No database administration required. No patching, no backups to configure manually — although I did enable point-in-time recovery as an additional safety measure.
5. **Lambda integration:** DynamoDB integrates natively with Lambda through the AWS SDK. No connection pooling issues, no timeout management for persistent connections.

Now, let me also explain why I did **not** choose a relational database like RDS PostgreSQL. A relational database would have been overkill for this use case. I do not need joins, foreign keys, or complex queries. A relational database would have required me to manage an instance — even with Aurora Serverless, the cold start times and minimum costs are higher than DynamoDB. Additionally, managing database connections from Lambda functions introduces complexity around connection pooling that I did not need.

For **infrastructure state management**, my CDK state is managed by CloudFormation. The CloudFormation state file tracks every resource, its properties, and its dependencies. This state is stored and managed by AWS — I do not need to manage a separate state backend like you would with Terraform.

### Troubleshooting Distributed Systems — S7 (7 minutes)

S7 requires me to navigate and troubleshoot stateful distributed systems. Let me walk you through how I do this.

> **[SCREEN: Open AWS CloudWatch console]**

When an issue occurs in a distributed system, the challenge is that the request flows through multiple services — CloudFront, API Gateway, Lambda, DynamoDB — and the error could originate in any of them. CloudWatch Logs is my primary tool for navigating this.

Every Lambda function in my application uses structured JSON logging. Let me show you what this looks like.

> **[SCREEN: Show the logging in questions_handler.py]**

When a request comes in, the function logs the event with a request ID. If an error occurs, it logs the error with the same request ID. This means I can trace a single request from start to finish across log entries.

Let me give you a real troubleshooting scenario. Suppose a user reports that they are getting a 500 error when trying to view questions. Here is my systematic approach:

1. **API Gateway Logs:** I first check the API Gateway access logs to confirm the request reached the API and was routed correctly. I look for the 500 status code and the timestamp.

2. **Lambda Logs:** I then go to the CloudWatch Logs for the Questions Handler Lambda function. I filter by the timestamp from the API Gateway logs. The structured logs tell me exactly what went wrong — maybe DynamoDB threw a throttling exception, or perhaps there was a permissions issue.

3. **CloudWatch Metrics:** I check the Lambda error metrics and the DynamoDB throttling metrics to see if this was an isolated incident or part of a pattern.

4. **CloudTrail:** If I suspect a configuration change caused the issue, I check CloudTrail for recent API activity — perhaps someone modified an IAM policy or changed a DynamoDB table setting.

This layered approach — starting from the entry point and drilling down to the root cause — is how you effectively troubleshoot distributed systems. Each AWS service provides its own logging and metrics, and the skill is knowing where to look and how to correlate information across services.

---

## SECTION 7: OPERABILITY (25 minutes)

> **KSBs: K11, S6, S19, B3**

### Monitoring and Alerting — K11, S6 (10 minutes)

K11 and S6 are about monitoring and alerting. Let me show you what I have built.

> **[SCREEN: Open CloudWatch Dashboard]**

This is my SkillScout CloudWatch Dashboard. It contains 12 widgets that give me a comprehensive view of the application's health.

On the top row, I have the AWS standard metrics: Lambda invocations, Lambda errors, Lambda duration — both average and p99 — and Lambda throttles. These tell me how much the application is being used, whether there are errors, how fast it is responding, and whether it is hitting any scaling limits.

On the second row, I have API Gateway metrics: request counts and latency. This gives me visibility into the API layer independently from the Lambda layer.

Below that, I have my **custom business metrics**. This is where I believe I meet the distinction criteria. Let me explain each one.

**Questions Retrieved:** This tracks how many questions are fetched per API call. If this suddenly drops to zero, it could indicate a DynamoDB issue or a permissions problem.

**Question Views by Category:** This breaks down which categories are most popular. From a product perspective, this tells me where to invest in creating more content.

**Admin CRUD Operations:** This tracks create, update, and delete operations. A sudden spike in deletes might indicate an issue.

**Admin Authorisation — Authorised vs Unauthorised Attempts:** This is a security metric. If I see a spike in unauthorised access attempts, it could indicate someone is trying to exploit the API.

**API Latency by Operation:** This shows average and p99 latency broken down by operation type. If question creation suddenly becomes slow, I can see it here independently from read operations.

**404 Errors:** Questions not found. A spike could indicate broken links, deleted content, or an issue with the database.

> **[SCREEN: Show the custom metrics code in custom_metrics.py]**

These custom metrics are emitted by the `custom_metrics.py` module, which I wrote specifically for this project. The module uses the CloudWatch `put_metric_data` API via Boto3. It is designed with graceful degradation — if a metric fails to emit, it logs the error but does not crash the Lambda function. The business logic always takes priority over metrics collection.

### Alerting Configuration (5 minutes)

Now let me show you the alerting configuration.

> **[SCREEN: Show the alarm definitions in service.ts]**

I have 8 CloudWatch alarms configured — 4 for standard AWS metrics and 4 for my custom business metrics.

The standard alarms are:
- **Lambda Errors:** Fires if there are 5 or more errors in a 5-minute period
- **Lambda Throttles:** Fires if there is even 1 throttle event — this is aggressive because throttling means requests are being dropped
- **Lambda High Duration:** Fires if average duration exceeds 5 seconds — that indicates a performance problem
- **API Gateway 5xx Errors:** Fires if there are 5 or more server errors in 5 minutes

The custom metric alarms are:
- **High API Latency:** Fires if average latency exceeds 1 second
- **High 404 Rate:** Fires if there are more than 10 not-found errors in 5 minutes
- **Unauthorised Admin Access:** Fires if there are more than 5 unauthorised admin attempts in 5 minutes — this is a security alert
- **No Question Activity:** Fires if there are fewer than 1 question retrieval in 10 minutes during business hours — this could indicate the application is down

All alarms send email notifications through SNS, so I am alerted immediately when something goes wrong.

### Interpreting Metrics — S19 (5 minutes)

S19 asks me to interpret logs and metrics to identify issues and make informed decisions. Let me give you some examples.

If I look at the Lambda duration metrics and see that the p99 latency is significantly higher than the average, that tells me there are occasional slow requests. In a Lambda context, this often indicates cold starts. The first invocation after a period of inactivity takes longer because Lambda needs to initialise the function. I can address this by configuring provisioned concurrency if it becomes a problem.

If I see the 404 error rate increasing, I would investigate whether questions are being deleted without corresponding frontend updates, or whether there are stale links somewhere.

If the unauthorised access alarm fires, I would immediately check CloudWatch Logs to identify the source of the attempts, check if it is a legitimate user with a misconfigured role or a potential security incident, and take appropriate action.

The custom metrics I have built — like question views by category and API latency by operation — provide improvement areas beyond basic health monitoring. For example, if I see that the "AWS" category gets 80% of all views, I might recommend investing in more AWS questions. If I see that the evaluate answer operation has significantly higher latency than question retrieval, I might investigate whether the Bedrock API call can be optimised or whether I should implement caching for repeated evaluations.

These are the kinds of insights that distinguish basic monitoring from business-valuable observability. This is what the distinction criteria are looking for — custom metrics that provide additional improvement areas and a clear explanation of how they can be interpreted and acted upon.

### You Build It, You Run It — B3 (5 minutes)

B3 is the behaviour: "You build it, you run it." This is not just a slogan — it is a genuine commitment that has shaped how I approached this entire project.

I did not just write the code and hand it off to someone else to deploy and monitor. I built the application, I built the infrastructure, I built the CI/CD pipeline, I built the monitoring, and I am the one who gets the alerts when something goes wrong.

This ownership mindset influenced several design decisions:

**Structured logging:** Because I know I will be the one troubleshooting issues at 2am, I made sure the logs contain enough context to diagnose problems quickly. Every log entry includes the request ID, the operation being performed, and relevant context.

**Comprehensive alarms:** Because I will be the one responding to incidents, I configured alarms for the scenarios that actually matter, with appropriate thresholds that minimize false positives.

**Automated deployment:** Because I will be the one deploying changes, I invested time in making the pipeline reliable and fast. A 14-minute pipeline with automated tests is much better than a 2-hour manual deployment process when you are the one doing it every day.

**Infrastructure as code:** Because I will be the one debugging infrastructure issues, I made sure every resource is defined in code, version-controlled, and documented. When something goes wrong, I can look at the git history to see exactly what changed and when.

The key takeaway is that when you are accountable for the operational health of your application, you naturally build in the observability, reliability, and automation that make it operable. That is the essence of B3.

---

## SECTION 8: AUTOMATION (15 minutes)

> **KSBs: K13, K17, S12**

### Scripting and APIs — K13, K17 (8 minutes)

K13 covers automation techniques such as scripting and APIs, and K17 covers what an API is and how to use one.

An API — Application Programming Interface — is a defined contract that specifies how software components should interact. In the context of my project, I work with APIs at multiple levels.

**AWS SDK APIs (Boto3):** My Lambda functions use the Boto3 SDK to interact with AWS services. Let me show you a specific example.

> **[SCREEN: Open backend/src/questions_handler.py, show the DynamoDB interactions]**

Here, I use `boto3.resource('dynamodb')` to create a DynamoDB resource. Then I call `table.scan()` to retrieve all items, `table.get_item()` to retrieve a single item by ID, `table.put_item()` to create a new item, `table.update_item()` to modify an item, and `table.delete_item()` to remove an item. Each of these is a call to the DynamoDB API, abstracted through the Boto3 SDK.

To use these APIs, I referenced the AWS documentation — specifically the Boto3 DynamoDB documentation — which specifies the method signatures, required parameters, optional parameters, and return types. For example, the `scan()` method returns a dictionary with an `Items` key containing the results. I interpreted this documentation to build my data access layer.

**Bedrock API:** The evaluate answer function calls the Bedrock InvokeModel API.

> **[SCREEN: Open backend/src/evaluate_answer.py]**

Here you can see I construct a request body with the model ID, the prompt, and configuration parameters like max tokens and temperature. I then call `bedrock.invoke_model()` and parse the JSON response. Understanding the Bedrock API documentation was essential to getting this working correctly.

**REST API (API Gateway):** On the frontend, I call my own REST API.

> **[SCREEN: Open frontend/src/services/api.ts]**

The `api.ts` file defines functions like `getAllQuestions()`, `createQuestion()`, and `evaluateAnswer()`. Each function makes an HTTP request to my API Gateway endpoint using the Fetch API, with the JWT token in the Authorization header. The response is parsed as JSON and typed using TypeScript interfaces.

### Automation for Efficiency — S12 (7 minutes)

S12 asks me to automate tasks where it introduces improvements to efficiency. Let me describe the automation I have built.

**Infrastructure deployment automation:** The entire project can be set up from scratch automatically. Running `cdk deploy` provisions every AWS resource — DynamoDB tables, Lambda functions, API Gateway, Cognito, CloudFront, S3, CloudWatch alarms, CloudTrail — in approximately 10 minutes. Without this automation, manually creating and configuring all these resources through the AWS console would take hours and would be error-prone.

**CI/CD automation:** Every code push triggers automated testing and deployment. Before I built the pipeline, deploying a change required me to manually run tests, build the code, upload to S3, update Lambda code, and invalidate CloudFront. That process took at least 30-45 minutes and was prone to human error. Now it takes 6-14 minutes and is completely consistent.

**Code quality automation:** Linting, formatting, and vulnerability scanning run automatically on every commit. This eliminates the overhead of running these tools manually and ensures no commit bypasses the quality checks.

**Monitoring automation:** Alarms and notifications are configured in code and deployed automatically. If I add a new alarm, it is deployed through the pipeline without any manual CloudWatch console work.

For the **distinction criteria** — identifying an additional opportunity for automation — Dependabot is my example. I identified that manually checking for dependency updates was inefficient and easy to forget. By configuring Dependabot, I automated the entire process of identifying outdated dependencies, creating update PRs, and triggering the pipeline to test and deploy them. This reduces the effort of keeping the application secure and up to date from a regular manual task to a simple PR review and approval.

---

## SECTION 9: DATA SECURITY (15 minutes)

> **KSBs: K16, S10**

### Securing Data — K16 (8 minutes)

K16 is about how best to secure data, covering encryption in transit, encryption at rest, and access control.

**Encryption in Transit:** All data flowing between the user's browser and my application is encrypted using HTTPS. CloudFront enforces HTTPS — if someone tries to access the application over HTTP, they are redirected to HTTPS. The API Gateway endpoint also uses HTTPS. This means that no data — including JWT tokens, question content, or user answers — ever travels over the network in plaintext.

**Encryption at Rest:** Let me address this for each data store.

*DynamoDB:* My table is encrypted at rest using AWS-managed encryption keys. This is configured in the CDK code.

> **[SCREEN: Show the DynamoDB encryption configuration in service.ts]**

*S3 Buckets:* Both the frontend hosting bucket and the CloudTrail logs bucket use server-side encryption. The CloudTrail bucket uses AES-256 encryption.

The rationale for encrypting data at rest is defence in depth. Even if someone were to gain unauthorized access to the underlying storage — which is extremely unlikely in AWS — the data would be encrypted and unreadable without the encryption keys. For an application storing interview questions, the risk is relatively low, but encryption at rest is a best practice that costs nothing additional with AWS-managed keys, so there is no reason not to implement it.

**Access Control:** This is implemented at multiple levels.

*Cognito:* Users must authenticate to access any protected endpoint. Cognito handles password policies, account lockout, and token management.

*API Gateway:* The Cognito Authoriser validates JWT tokens before any Lambda function is invoked. Invalid or expired tokens are rejected at the API Gateway level — they never reach the Lambda function.

*Lambda:* The `require_admin` function checks for Admin group membership for all write operations. Even if someone were to bypass the frontend and call the API directly, they would still be blocked by this backend enforcement.

*IAM:* Lambda functions have least-privilege IAM roles. The Questions Handler can only perform specific DynamoDB operations on the questions table. It cannot access other tables, other AWS services, or perform administrative actions.

### Threat Assessment — S10 (7 minutes)

S10 requires me to assess identified and potential security threats and take appropriate action based on likelihood versus impact.

> **[SCREEN: Open docs/THREAT_MODEL.md]**

My threat model uses the STRIDE methodology to systematically identify threats. Let me walk through a few examples with their likelihood/impact assessments.

**Threat: JWT Token Theft**
- **Likelihood:** Medium — tokens are stored in browser localStorage, which is accessible to JavaScript
- **Impact:** High — a stolen token grants full access to the user's account
- **Mitigation:** Short-lived tokens (Cognito default is 1 hour), HTTPS prevents network interception, React's built-in XSS protection prevents most script injection attacks. For a production enterprise application, I would consider using HttpOnly cookies instead of localStorage, but for this application the risk is acceptable.

**Threat: SQL/NoSQL Injection**
- **Likelihood:** Low — DynamoDB does not use SQL, and the Boto3 SDK parameterises all inputs
- **Impact:** High — could lead to data exfiltration or deletion
- **Mitigation:** Using the DynamoDB SDK with typed parameters rather than constructing query strings. Input validation in the Lambda functions. Admin authorisation for write operations.

**Threat: Denial of Service**
- **Likelihood:** Medium — any public-facing application is a target
- **Impact:** Medium — application becomes unavailable but no data is lost
- **Mitigation:** API Gateway has built-in throttling. Lambda concurrency limits prevent runaway execution. CloudFront provides DDoS protection at the edge. CloudWatch alarms alert on unusual traffic patterns.

The key principle in threat assessment is that you cannot eliminate all risk — that would be infinitely expensive. Instead, you identify the threats, assess their likelihood and impact, and implement proportionate mitigations. A high-impact, high-likelihood threat gets significant investment. A low-impact, low-likelihood threat might be accepted with minimal mitigation. This risk-based approach ensures I am investing my security effort where it matters most.

---

## SECTION 10: SUMMARY AND Q&A BUFFER (15 minutes)

### Summary (5 minutes)

Let me now summarise what I have demonstrated today.

I have shown you a complete, production-ready, full-stack serverless application that I designed, built, deployed, and operate. Let me quickly recap how I have evidenced each KSB category.

**Code Quality:** I demonstrated distributed source control with Git, feature branching, conventional commits, and code quality tools. I showed my Python and TypeScript codebases, my CDK infrastructure-as-code, my comprehensive test suite with mocks and test doubles, my security scanning and threat modelling, and my systematic approach to problem-solving using the PDAC methodology.

**Meeting User Needs:** I showed how I translated user needs into user stories with clear acceptance criteria, how user feedback drove feature improvements, how DevOps practices deliver value in terms of time, cost, and quality, and how my architecture follows common patterns like serverless microservices and API Gateway.

**CI/CD Pipeline:** I demonstrated a fully functioning automated pipeline with all tests passing. You watched a code commit progress seamlessly from source to the end user through an automated pipeline with quality gates, testing, and deployment stages.

**Refreshing and Patching:** I explained how CDK and CloudFormation enable immutable infrastructure, how Lambda's serverless model delegates OS patching to AWS, and how Dependabot automates dependency updates.

**Data Persistence:** I justified my choice of DynamoDB based on the application's data characteristics and access patterns, and I explained my approach to troubleshooting distributed systems using CloudWatch Logs.

**Operability:** I showed my CloudWatch dashboard with 12 widgets, my 8 alarms including 4 custom business metric alarms, and I explained how I interpret these metrics to identify issues and drive improvements. I demonstrated my commitment to the "you build it, you run it" philosophy.

**Automation:** I showed how I use APIs throughout the application via Boto3, how the infrastructure and deployment process is fully automated, and how I identified and implemented additional automation opportunities like Dependabot.

**Data Security:** I demonstrated encryption in transit via HTTPS, encryption at rest for DynamoDB and S3, multi-layered access control through Cognito, API Gateway, Lambda, and IAM, and I walked through my threat model with likelihood and impact assessments.

### Closing (2 minutes)

Building SkillScout has been a genuinely rewarding experience. It has given me the opportunity to work with a wide range of AWS services, to understand the full lifecycle of a software product from user story to production deployment, and to appreciate the value of automation, monitoring, and security as first-class concerns rather than afterthoughts.

If I were to continue developing this project, my next priorities would be:
- Implementing a question history feature so users can track their improvement over time
- Adding more granular custom metrics around AI evaluation quality
- Implementing A/B testing capability to experiment with different UI layouts
- Adding automated canary deployments to reduce the risk of production releases

Thank you for your time today. I am happy to answer any questions you may have.

### Q&A Buffer (8 minutes)

> **[Reserve this time for assessor questions. Below are likely questions and suggested answers.]**

**Q: "Can you explain a time you had to troubleshoot a difficult issue?"**

A: Yes — the CSS specificity issue I described earlier is a good example. The login page inputs were invisible, and the root cause was not obvious. I used browser DevTools to inspect the computed styles, traced the conflicting CSS rules across multiple files, identified the cascade issue caused by import ordering, and applied a targeted fix using scoped selectors. I then applied the same pattern across the codebase to prevent similar issues.

**Q: "Why did you choose a manual approval gate before production?"**

A: It is a risk management decision. The automated tests give me high confidence, but for a real application, I want a human checkpoint before production. In a larger team, this would be where a senior engineer reviews the changes. The important thing is that the option to remove the gate and go to full continuous deployment exists — the pipeline supports it.

**Q: "How would you handle a production incident?"**

A: First, I would check my CloudWatch alarms to understand the scope and severity. Then I would check the Lambda logs for errors, using the structured JSON logging to trace the issue. If the issue was caused by a recent deployment, I would revert by redeploying the previous version through the pipeline. Throughout the incident, I would document what happened, what I did, and what I learned — this is the continuous improvement aspect of B3.

**Q: "What would you do differently if you started over?"**

A: I would implement more integration tests earlier in the project. I would also consider using CSS modules or a CSS-in-JS solution like styled-components to prevent the CSS specificity issues I encountered. And I would set up a proper staging environment that mirrors production exactly, rather than relying on the Alpha environment which has some configuration differences.

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
