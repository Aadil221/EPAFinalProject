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
| 3 | Code Quality | 42 min | K2, K5, K7, K14, S9, S11, S14, S17, S18, S20, S22 |
| 4 | The CI/CD Pipeline + LIVE DEMO | 30 min | K1, K15, S15 |
| — | BREAK | 10 min | — |
| 5 | Refreshing & Patching | 15 min | K8, S5 |
| 6 | Data Persistence | 15 min | K12, S7 |
| 7 | Operability | 30 min | K11, S6, S19, B3 |
| 8 | Automation | 15 min | K13, K17, S12 |
| 9 | Data Security | 15 min | K16, S10 |
| 10 | Summary & Q&A Buffer | 15 min | — |

---

## SECTION 1: INTRODUCTION & PROJECT OVERVIEW (15 minutes)

### Opening (2 minutes)

> **[SLIDE 1: Title]**

Good morning/afternoon, and thank you for taking the time to assess my End Point Assessment. My name is Aadil, and today I will be presenting SkillScout — a full-stack, serverless interview preparation platform that I have designed, built, and deployed end-to-end.

Over the next three hours, I am going to walk you through the entire project lifecycle. I will start with how I gathered and translated user needs into deliverable work, then move through the codebase itself — covering both the general purpose code and the infrastructure-as-code. I will demonstrate the CI/CD pipeline live, including making a real code change and pushing it all the way through to production. I will then cover how I approached monitoring, data persistence, automation, and security throughout the project.

Everything I am about to show you is my own work. I built it, I deployed it, I monitor it, and I maintain it — which I believe reflects the "you build it, you run it" philosophy that underpins good DevOps practice.

### Project Overview (5 minutes)

> **[SLIDE 2: Agenda — show the section timing table]**

So, what is SkillScout? At its core, it is an AI-powered interview question bank. Let me explain the business problem it solves.

Currently, people preparing for technical interviews lack a structured, centralised way to practise. What that means in practice is that candidates are relying on scattered blog posts, outdated question lists, personal notes, and tribal knowledge passed around informally. There is no single source of truth, and there is no way to get meaningful feedback on your answers without finding someone willing to mock-interview you.

This causes four specific problems. First, there is **no structured practice environment** — candidates are reading questions and mentally rehearsing answers, but never actually practising under realistic conditions with feedback. Second, there is **inconsistent question quality** — the questions people find online vary wildly in relevance, difficulty, and accuracy, with no central owner ensuring they are up to date. Third, candidates are **wasting time searching for good questions** — instead of actually practising, they are spending time sifting through resources trying to find questions that are relevant to the role they are preparing for. And fourth, there is **no feedback loop** — without someone to evaluate your answer, you have no way of knowing whether your response was strong, weak, or missing the point entirely.

SkillScout addresses all four of these problems. It provides a centralised, searchable repository of curated interview questions, categorised by topic and difficulty, so candidates can find relevant practice material quickly. Admins control the content, which means questions can be reviewed, updated, and retired to maintain quality. And the AI evaluation feature — powered by an evaluator I call Marcus — closes the feedback loop entirely. You type your answer, submit it, and Marcus gives you a score out of 100, your strengths, areas for improvement, and specific suggestions for how to improve. That is structured, on-demand feedback without needing another person.

So to summarise the business case: SkillScout takes something that was fragmented and unstructured — interview preparation — and makes it centralised, searchable, and feedback-driven. That is the problem I set out to solve, and everything I am about to show you is in service of that goal.

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

### Architecture Overview (8 minutes)

Let me now walk you through the architecture.

> **[SLIDE 4: Architecture — keep on screen during the full architecture walkthrough]**

> **[SCREEN: Show ARCHITECTURE.md or architecture diagram]**

SkillScout is a serverless application running entirely on AWS. What that means is I do not manage any servers — AWS runs and maintains the underlying machines for me. I just deploy my code and configuration. Let me walk you through how everything fits together, starting from what the user sees and working backwards.

When a user opens SkillScout in their browser, the first thing that happens is their browser sends a request to **CloudFront**. CloudFront is AWS's content delivery network — it has data centres around the world, and it serves the website files from whichever one is closest to the user, which makes page loads faster. CloudFront also enforces HTTPS, so all traffic between the user's browser and my application is encrypted. Behind CloudFront sits an **S3 bucket**, which is simply a file storage service. My React frontend — the HTML, CSS, JavaScript, and images — is stored in that S3 bucket. CloudFront pulls the files from S3 and serves them to the user. I have configured it so that nobody can access the S3 bucket directly — you can only get the files through CloudFront. This is done using something called an Origin Access Identity, which is essentially a special permission that says "only CloudFront is allowed to read from this bucket."

So at this point, the user has the website loaded in their browser. Now they need to log in. This is where **Amazon Cognito** comes in. Cognito is a managed authentication service — it handles user accounts, passwords, and login for me. When a user signs up, Cognito creates their account and sends them a temporary password by email. On first login, they are forced to change it. Once they log in successfully, Cognito gives them a **JWT token** — which is just a small piece of encrypted text that proves who they are and what groups they belong to. The frontend stores this token and attaches it to every request it makes to the backend. Think of it like a wristband at a venue — once you have it, you show it at every door to prove you are allowed in.

Now the user wants to do something — browse questions, submit an answer, or manage content as an admin. The frontend sends an HTTP request to **API Gateway**. API Gateway is the single entry point for all backend operations. It exposes three URL paths: `/questions` for browsing, creating, updating, and deleting questions, `/answers` for submitting an answer to the AI evaluator, and `/signup` for new user registration. The first thing API Gateway does with every request is check the JWT token. It has a **Cognito Authoriser** configured, which means it sends the token to Cognito and asks "is this token valid? Has it expired? Was it actually issued by my user pool?" If the answer is no, the request is rejected immediately with a 401 Unauthorised response — it never reaches my code.

If the token is valid, API Gateway forwards the request to the right **Lambda function**. Lambda is AWS's serverless compute service — I upload my Python code, and AWS runs it on demand. I do not provision or manage any servers. When a request comes in, AWS spins up a small container, runs my code, returns the response, and then shuts it down. I have three separate Lambda functions:

- **The Questions Handler** handles all operations on the question bank — listing all questions, getting a single question, creating new ones, updating them, and deleting them. For admin operations like create, update, and delete, the Lambda function itself performs a second check: it reads the JWT token, looks at the `cognito:groups` claim, and checks whether the user is in the Admin group. If they are not, it returns a 403 Forbidden — even if API Gateway already let them through. This is defence in depth — two layers of access control, not just one.

- **The Evaluate Answer function** handles the AI evaluation. When a user submits their answer to a question, this function takes the question text and the user's answer, sends them to **AWS Bedrock** — which is AWS's managed AI service — and asks Claude 3.7 Sonnet to evaluate the answer. Bedrock returns a structured response with a score, strengths, areas for improvement, and suggestions. The Lambda function then passes that back to the user through API Gateway.

- **The Signup Handler** creates new user accounts by calling the Cognito AdminCreateUser API.

When the Questions Handler needs to read or write data, it talks to **DynamoDB**. DynamoDB is a managed NoSQL database — I do not install anything, I do not manage disk space or memory, and I do not patch it. I just define the table structure and AWS handles the rest. My Lambda function uses the Python SDK to make API calls to DynamoDB — things like "scan the table and give me all questions" or "put this new item into the table." The response comes back in under 10 milliseconds. I will explain why I chose DynamoDB over a relational database in the Data Persistence section.

Finally, there is the **monitoring layer**. Every Lambda function automatically sends logs to **CloudWatch**, which is AWS's monitoring service. I also send custom metrics — things like how many questions were viewed, which categories are popular, and whether any unauthorised access attempts are happening. I have a CloudWatch dashboard with 12 widgets showing me the health of the application at a glance, and 8 alarms that send me email notifications if something goes wrong. On top of that, **CloudTrail** records every AWS API call made in my account — so if someone changes an IAM policy or modifies a DynamoDB table, there is a full audit trail. I will cover all of this in detail in the Operability section.

**The entire infrastructure** — every single resource I just described — is defined as code using AWS CDK, written in TypeScript. That means I do not click through the AWS console to create things. I write code that says "create a DynamoDB table with these settings, create a Lambda function with this code, connect them together with these permissions." When I run `cdk deploy`, it generates a CloudFormation template and AWS creates or updates everything automatically. This is deployed through GitHub Actions pipelines to two separate AWS accounts — an Alpha environment for testing and a Production environment for real users.

So to summarise the full flow: the user's browser loads the website from CloudFront and S3, the user logs in through Cognito and gets a token, the frontend sends requests with that token to API Gateway, API Gateway checks the token and forwards valid requests to Lambda, Lambda runs my Python code which reads and writes data in DynamoDB or calls Bedrock for AI evaluation, and the response flows all the way back to the user's browser. Every step is logged, monitored, and alerting is configured.

That is the full picture. Now let me dive into each area in detail, starting with how I gathered and translated user needs.

---

## SECTION 2: MEETING USER NEEDS (20 minutes)

> **KSBs: K4, K10, K21, S3**

### User Stories — S3 (8 minutes)

The first thing I did before writing any code was to understand who would use this application and what they needed. This is critical because if users struggle to use your application, the technical implementation does not matter — you have built the wrong thing, or built it in the wrong way.

> **[SCREEN: Open docs/USER_STORIES.md]**

I created detailed user stories for four distinct user personas. Each story follows the same format: "As a [persona], I want [feature], so that [benefit]" — and every single one has acceptance criteria that can be objectively tested. Let me walk through each persona.

> **[SCREEN: Scroll to End Users section]**

The first persona is the **End User** — someone preparing for an interview. I wrote three stories for them.

**Story 1** is about account creation and access. The user wants to create an account and log in so they can access the question bank. The acceptance criteria include things like receiving a temporary password by email, being forced to change it on first login, and not being able to see any questions until they are logged in. Every one of these criteria maps directly to something I built in Cognito and the frontend.

**Story 2** is about finding relevant questions. The user wants to search and filter by category and difficulty so they can focus on what matters to them. The acceptance criteria are specific — search works in real-time without a page reload, multiple filters work together using AND logic, and the results count updates dynamically showing "X of Y questions." You saw all of this working in the demo.

**Story 3** is about practising with AI feedback. The user wants to submit an answer and get instant evaluation from Marcus so they can understand their strengths and weaknesses. The acceptance criteria specify that the evaluation must return within 10 seconds, it must include a score, strengths, improvements, and suggestions, and there must be a loading state so the user knows something is happening.

> **[SCREEN: Scroll to Developers section]**

The second persona is the **Developer** — which is me, building and maintaining the application. I wrote five stories here covering secure authentication, AI integration, the data layer, infrastructure as code, and custom metrics. For example, the secure backend API story has criteria like "unauthenticated requests return 401," "Lambda functions use least-privilege IAM roles," and "server-side input validation on all endpoints." These are not vague goals — they are testable requirements that I verified through unit tests and manual testing.

> **[SCREEN: Scroll to Admin Users section]**

The third persona is the **Admin User** — someone who manages the question bank. The main story here covers full CRUD operations: creating questions with form validation, editing questions in a modal with pre-filled data, deleting with a confirmation step, and searching and filtering the same way end users do. Crucially, the acceptance criteria also cover security — non-admin users must receive a 403 Forbidden for any write operation, admin actions must be logged with user identity, and the admin navigation link must only be visible to users in the Admin Cognito group. There is also a story about monitoring admin activity — tracking authorised and unauthorised access attempts with alarms that trigger if someone is repeatedly trying to access admin functions without permission.

> **[SCREEN: Scroll to Platform Administrators section]**

The fourth persona is the **Platform Administrator** — responsible for deployments, monitoring, and security. The CI/CD story specifies that the pipeline must have quality gates, security scans must fail the build on high or critical vulnerabilities, manual approval must be required before production, and Dependabot must automatically create pull requests for dependency updates. The monitoring story lists every alarm threshold — for example, Lambda errors greater than or equal to 5 in 5 minutes, or unauthorised admin access greater than 5 in 5 minutes.

Now, what I want to highlight is how these user stories translated into actual work. Each story became one or more tasks on my Kanban board with clear deliverables. For example, the End User search and filter story became three tasks: implement the search input component, implement the filter dropdowns, and wire up the real-time filtering logic. This is exactly what S3 requires — translating user needs into deliverable tasks with clear, unambiguous user stories.

I also prioritised every story using the **MoSCoW method** — Must Have, Should Have, and Could Have. You can see the priority label on each story in the document. Let me explain how I decided.

**Must Have** — 8 stories. These are the ones where, if any single one is missing, the application either does not work, is insecure, or cannot be deployed. For example, the three End User stories are all Must Have because without account login there is no access, without search and filter there is no way to find questions, and without AI evaluation there is no unique value — the application would just be a static list. On the developer side, the secure API and the data layer are Must Have because without security anyone could access the data, and without DynamoDB there is nowhere to store questions. The CI/CD pipeline is Must Have because without it I have no reliable way to get code into production. I built all 8 of these first.

**Should Have** — 5 stories. These are important for running the application professionally, but it technically works without them. For example, Infrastructure as Code is Should Have — I could deploy by clicking through the AWS console manually, but that would be slow, error-prone, and impossible to reproduce. Custom metrics and monitoring is Should Have — the application runs fine without it, but I would have no visibility into what is happening and no way to catch problems before users report them. The monitoring and security stories for the Platform Administrator are also Should Have — they make the application production-ready rather than just functional. I built these after the Must Haves were complete.

**Could Have** — 1 story. Delegating admin responsibilities — the ability to add other people to the Admin group — is a Could Have. For a solo developer it is not critical because I am the only admin. I built it because it was straightforward, but if I was running out of time, this would have been the first story I dropped.

> **[SLIDE 5: User Personas + MoSCoW]**

> **[SCREEN: Show the MoSCoW summary table in USER_STORIES.md]**

The key point here is that MoSCoW is not just about labelling stories — it shaped the order I built things in. I started with the Must Haves to get a working product as quickly as possible, then layered on the Should Haves to make it production-quality, and finally added the Could Have because I had time. If my deadline had been tighter, I would have delivered all 8 Must Haves and maybe 3 of the 5 Should Haves, and the application would still have been usable.

This also links directly to the distinction criteria — I have produced code that meets both the "must have" and the "should have" identified needs. Every Must Have and every Should Have story has been fully implemented and tested.

### Business Value of DevOps — K4 (5 minutes)

> **[SLIDE 6: Business Value of DevOps]**

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

> **[SLIDE 7: Languages, Testing & Tools — then switch to live screen for code walkthroughs]**

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

Now let me show you the actual code. I use two programming languages in this project, and I want to walk you through each one so you can see how they work.

**Python 3.11** is my backend language. Let me show you the questions handler.

> **[SCREEN: Open backend/src/questions_handler.py]**

This is the main Lambda function — approximately 400 lines of Python. It handles all the question bank operations. Let me show you the actual code structure:

```python
def handler(event, context):
    path = event["path"]
    method = event.get("httpMethod", "GET")
    request_id = context.aws_request_id if context else "local"
    start_time = time.time()

    try:
        if path == "/questions":
            if method == "GET":
                # ... list all questions ...
            elif method == "POST":
                admin_check = require_admin(event)
                if admin_check:
                    return admin_check
                # ... create question ...
        elif path.startswith("/questions/"):
            question_id = path.split("/")[-1]
            if method == "PUT":
                admin_check = require_admin(event)
                # ... update question ...
            elif method == "DELETE":
                admin_check = require_admin(event)
                # ... delete question ...
    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}
```

The function receives two arguments from Lambda. `event` contains the HTTP request — the URL path, the method (GET, POST, PUT, DELETE), headers, and body. `context` contains metadata like a unique request ID that I use for tracing through logs.

The function works as a router — it reads the path and method, then directs the request to the right block of code. GET `/questions` lists all questions. POST `/questions` creates a new one. PUT and DELETE on `/questions/{id}` update and remove individual questions. Each operation is self-contained — if I need to change how question creation works, I only touch the POST block. The GET logic is completely unaffected. This is what "single responsibility" means in practice — each block does one thing and one thing only.

The entire function is wrapped in a try-except block. If anything unexpected happens — maybe DynamoDB is temporarily unavailable, or the request body is malformed — the except block catches it and returns a clean 500 error with a message. It never crashes silently.

Now notice the `require_admin(event)` calls on POST, PUT, and DELETE. Let me show you that function:

```python
def require_admin(event):
    user_is_admin = is_admin(event)
    if admin_metrics:
        admin_metrics.admin_authorization_check(is_admin=user_is_admin)

    if not user_is_admin:
        if admin_metrics:
            admin_metrics.unauthorized_admin_access(user_sub="unknown", operation="admin_check")
        return {
            "statusCode": 403,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": "Forbidden: Admin access required"}),
        }
    return None
```

The `is_admin` function digs into the event to find `event['requestContext']['authorizer']['claims']['cognito:groups']` — that is the list of groups embedded in the user's JWT token by Cognito. If "Admin" is in that list, the user is an admin.

If they are NOT an admin, two things happen. First, I record a custom metric tracking this unauthorised attempt — so I can spot suspicious activity on my dashboard. Second, I return a 403 Forbidden response. When the calling code in the handler receives this response, it sends it straight back to the user — the question is never created, the database is never touched. If they ARE an admin, I return `None`, which in Python means "nothing." The handler checks `if admin_check:` — since `None` is treated as false, execution continues to the actual operation. This two-layer defence — API Gateway validates the token exists, then the Lambda checks the user is in the right group — means that even if someone bypasses the frontend and calls the API directly, they still cannot perform admin operations without being in the Admin group.

**TypeScript** is my frontend and infrastructure language.

> **[SCREEN: Open frontend/src/services/api.ts]**

This is my API service layer. Let me show you the TypeScript interfaces I define:

```typescript
export interface Question {
  id: string;
  category: string;
  difficulty: string;
  question_text: string;
  reference_answer: string;
}

export interface EvaluationResponse {
  is_correct: boolean;
  score: number;
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  marcus_comment: string;
}
```

An interface is TypeScript's way of defining the exact shape of an object — what properties it has and what type each property is. For example, the `Question` interface says "every Question object must have an `id` that is a string, a `category` that is a string, a `score` that is a number" and so on. Why does this matter? If I accidentally write `question.categorry` — with a typo — TypeScript immediately flags the error in my editor before I even save the file. It says "Property 'categorry' does not exist on type 'Question'. Did you mean 'category'?" In plain JavaScript, that same typo would compile fine, deploy fine, and only crash when a real user triggers that code path. TypeScript catches these mistakes during development, not in production. That is a significant quality advantage.

### Infrastructure as Code — S18 (5 minutes)

The second language I use is TypeScript, and one of the most important places I use it is for defining my infrastructure.

> **[SCREEN: Open infrastructure/lib/stacks/service.ts]**

This is `service.ts` — 739 lines of TypeScript that define my entire AWS infrastructure using CDK. Every single AWS resource I showed you in the architecture — the DynamoDB table, the Lambda functions, API Gateway, Cognito, S3, CloudFront, the alarms, the dashboard — all of it is defined right here in this one file.

Let me walk through the key constructs.

Here is my DynamoDB table definition. You can see I have specified the table name, the partition key — `id` of type STRING — the billing mode as PAY_PER_REQUEST for cost optimisation, point-in-time recovery enabled for data protection, and encryption using AWS-managed keys.

Here is my Lambda function definition. I specify the runtime as Python 3.11, the handler function path, the memory allocation, the timeout, and the environment variables it needs — like the DynamoDB table name and Cognito User Pool ID.

Here are my CloudWatch alarms. I define the metric, the threshold, the evaluation period, and the comparison operator — all in code. This means my monitoring is version-controlled, reviewable, and reproducible.

The key advantage is that my infrastructure is not something I set up by clicking through the AWS console. It is code, stored in Git, and I can see exactly what changed and when. If I needed to create a completely new environment — say for a new team member to test on — I could run `cdk deploy` with different parameters and have an identical copy of everything in minutes. Nothing is lost because the source of truth is always the code, not some manual configuration that only exists in the console. This also connects to immutable infrastructure, which I will cover after the break.

### Test Driven Development — K14, S14 (8 minutes)

Now, all of this code — the Python backend, the TypeScript infrastructure — needs to be tested. Let me show you how I approach that.

> **[SCREEN: Open backend/tests/test_admin_authorization.py]**

Let me show you my most comprehensive test file — the admin authorisation tests. This file contains 21 tests that verify the admin authorisation logic.

The test pyramid tells us to have the most unit tests at the base, fewer integration tests in the middle, and the fewest end-to-end tests at the top. My project follows this principle. I have 37 backend unit tests, 13 CDK infrastructure tests, and 8 integration tests. The heavy lifting is done by unit tests, which are fast, reliable, and isolated.

Now, let me talk about **test doubles and mocking**. In unit testing, you do not want to actually call real AWS services — that would be slow, expensive, and unreliable. Instead, I use mocks — fake objects that pretend to be real AWS services but are entirely under my control. Let me show you how this works:

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

Let me walk through this. `MagicMock()` creates a fake object that pretends to be anything — it will accept any method call and return whatever I tell it to. `mock_table` pretends to be a DynamoDB table. `mock_dynamodb` pretends to be the boto3 DynamoDB resource.

The `patch("boto3.resource")` line is the key trick. It intercepts any call to `boto3.resource()` inside my code and returns `mock_dynamodb` instead of making a real AWS connection. So when `questions_handler.py` runs `table = boto3.resource('dynamodb').Table(...)` during import, it gets my fake mock object. No real AWS calls happen at all.

Now let me walk through an actual test:

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

This test verifies that an admin user can create a question. I set up `mock_table.put_item` to return an empty dictionary — simulating a successful DynamoDB write. Then I create a fake API Gateway event with a POST method, the question data in the body, and `groups="Admin"` — which puts "Admin" into the JWT token's `cognito:groups` claim. I call the handler, and then I check: did I get back a 201 Created status? Does the response body contain the question I sent?

The corresponding negative test is just as important:

```python
def test_post_question_as_non_admin():
    event = create_event(
        "POST", "/questions",
        body={"question_text": "What is AWS?", "category": "AWS", "difficulty": "Easy"},
        groups="Users"
    )
    context = MagicMock()
    context.aws_request_id = "test-request-123"

    response = handler(event, context)

    assert response["statusCode"] == 403
    assert "Forbidden" in response["body"]
```

This is the same test but with `groups="Users"` instead of "Admin." The user is authenticated but not an admin. The handler hits the `require_admin` check, sees they are not in the Admin group, and returns 403 Forbidden. I verify the status code AND that the word "Forbidden" appears in the response body. Notice I did not need to set up `mock_table.put_item` at all — the code never gets far enough to call it. The authorisation check stops it first. This is one of the big advantages of mocking: I can verify not just what the code returned, but also that certain things were never called.

I also test edge cases like missing required fields, questions that do not exist, and malformed requests. This comprehensive test coverage means I can refactor the code with confidence — if I break something, the tests will catch it.

> **[SCREEN: Show infrastructure/test/service-stack.test.ts]**

For infrastructure, I have 13 CDK assertion tests using Jest. These verify that my CDK code synthesises the correct CloudFormation template. For example, I test that the DynamoDB table has point-in-time recovery enabled, that S3 has public access blocked, that Lambda functions use the correct runtime, and that the signup endpoint is public. This is testing my infrastructure-as-code in the same way I test my application code.

### Security Tools and Techniques — K5, S9 (12 minutes)

Security is not a separate phase — it is something I built into the project from the start. Let me walk you through my threat model, which I believe is one of the most thorough pieces of work in this project.

> **[SCREEN: Open docs/THREAT_MODEL.md]**

So what actually is a threat model? In the simplest terms, it is a structured document where you sit down and ask: what could go wrong with my application? Who might try to attack it? What are they after? And what am I going to do about it? The important word is *structured* — without a framework, you just guess, and you inevitably miss things. A threat model gives you a systematic way to think through every type of risk.

I created this before I started building the security controls, and I updated it as the application evolved. Let me walk you through each section of the document.

> **[Scroll to: Security Tenets]**

The model starts with seven **security tenets** — guiding principles that shaped every security decision. Let me explain the three most important ones.

**Least Privilege** means every component — every user account, every Lambda function, every IAM role — only gets the minimum permissions it needs to do its job. If something gets compromised, the damage is limited because it cannot do more than it was designed to do.

**Defence in Depth** means I never rely on a single layer of protection. I have security controls at the frontend, at the API Gateway, in the Lambda functions, and at the database level. If one layer fails, the next layer still protects the system. Think of it like a castle — you do not just have the outer wall, you also have the moat, the inner wall, and the guards inside.

**Risk-Based Decision Making** means I do not try to eliminate every possible risk — that would be impossible and infinitely expensive. Instead, I ask: how likely is this threat, and how bad would it be if it happened? High-likelihood, high-impact threats get the most attention. Low-likelihood, low-impact threats get simpler, proportionate controls.

> **[Scroll to: Assumptions]**

Next I documented eleven **assumptions**. These are things I took as given when writing the model. For example, Assumption A2 states that all traffic uses HTTPS — if that were ever turned off, the entire threat model would need revisiting. Assumption A5 says the frontend never talks directly to the database — everything goes through API Gateway, then Lambda, then DynamoDB. This single controlled path is much easier to secure than having multiple direct connections.

I document assumptions explicitly so that anyone reviewing the model can immediately see what it depends on. If any assumption changes, you know exactly which threats and mitigations need reassessing.

> **[Scroll to: Assets]**

I then identified nine **assets** — these are the things worth protecting. The most obvious one is A1, the interview question data itself — that is the core business data. But I also identified less obvious ones like A7, the audit logs — if an attacker could tamper with the logs, they could cover their tracks after an attack. And A9, the IAM roles and policies — if someone could change the permissions, they could give themselves access to everything.

> **[Scroll to: Threat Actors]**

I then defined five **threat actors**. I deliberately did not just think about the obvious external hacker. I also considered an authenticated regular user who tries to access admin features, an administrator whose account might be compromised, someone with direct AWS account access who could modify infrastructure, and someone with CI/CD pipeline access who could inject malicious code into a deployment. The most dangerous threats often come from insiders or compromised trusted accounts, not from external attackers — so considering all five perspectives gives much better coverage.

> **[Scroll to: Threats table]**

Now, the core of the model: the threats themselves, identified using the **STRIDE** framework.

STRIDE was created by Microsoft in the late 1990s and is one of the most widely used threat modelling frameworks in the industry. It gives you six categories of attack to think through for every part of your system. If you work through all six systematically, you are far less likely to miss something. Each letter stands for a different type of threat, and I will walk through each one with a real example from my application.

**S is for Spoofing** — can someone pretend to be someone they are not? Threat T1: an unauthenticated user tries to access the API to retrieve interview questions — someone who has not logged in tries to get the data. My mitigation: every API endpoint requires a valid JWT token from Cognito. API Gateway checks the token before the request ever reaches the Lambda function. No valid token means no access.

**T is for Tampering** — can someone change data they should not be able to change? Threat T3: interview question data is modified or deleted without authorisation. My mitigation: only Lambda functions can talk to DynamoDB, only admin users can trigger write operations, and DynamoDB is locked down with least-privilege IAM roles — nothing else in the system can write to the table.

**R is for Repudiation** — can someone do something and then deny they did it? Threat T4: an admin deletes a question and then says "it was not me." My mitigation: every admin action is logged with the user's identity, their group membership, and a timestamp in CloudWatch. CloudTrail also captures all AWS API activity. There is a complete audit trail showing exactly who did what and when.

**I is for Information Disclosure** — can data leak to someone who should not see it? Threat T5: interview questions exposed without proper authentication. My mitigation: every API endpoint requires authentication. The database is never directly accessible. The S3 bucket has public access completely blocked — it is only accessible through CloudFront using an Origin Access Identity.

**D is for Denial of Service** — can someone make the system unavailable? Threat T6: excessive or malicious API requests overwhelm the system. My mitigation: API Gateway has built-in throttling that limits requests per second. Lambda has concurrency limits. CloudFront provides protection at the edge. And my CloudWatch alarms alert me if traffic spikes unexpectedly.

**E is for Elevation of Privilege** — can someone gain access they should not have? Threat T2: a regular user tries to create, edit, or delete questions — actions that should be admin-only. My mitigation works at multiple levels. The frontend hides the admin link based on the user's group. But I do not rely on the frontend alone — the Lambda function checks the `cognito:groups` claim on every write request. Even if someone bypasses the UI entirely and calls the API directly, they get a 403 Forbidden response. And Threat T13 covers an even more advanced attack — someone modifying their JWT token to fake admin group membership. That does not work because JWTs are cryptographically signed by Cognito using RS256. If you change even one character in the token, the signature becomes invalid and API Gateway rejects it.

In total, I identified **17 threats** — 7 rated High priority and 10 rated Medium. Each one maps to a STRIDE category, lists the affected assets, and has specific mitigations.

> **[Scroll to: Mitigations table]**

Every single mitigation has a status of **Implemented**. None of these are theoretical or planned for the future. They are all built, deployed, and working in production right now.

> **[Scroll to: Security Tests]**

And this is what ties the whole model together — I did not just document mitigations on paper. I created **20 security tests** to verify that the controls actually work. Six are automated unit tests that run in the pipeline on every commit. Two are automated through the CI/CD pipeline itself — Trivy scanning and Dependabot. And twelve are manual or review-based tests that I performed and documented.

Let me give you two specific examples. Security Test 2 verifies that a non-admin user cannot create a question — the test authenticates as a regular user, attempts a POST request, and confirms it gets a 403 Forbidden response. This runs automatically in the pipeline — if anyone accidentally removes the admin check, the build fails. Security Test 16 verifies XSS protection — I created a question containing script tags and confirmed the script does not execute when rendered, because React escapes content automatically and the Content Security Policy headers block inline scripts as a second layer of defence.

Now, a threat model on paper is only useful if the controls are actually enforced. That is why I also have automated security tooling in the pipeline.

For **vulnerability scanning**, I have integrated Trivy into both CI/CD pipelines. Trivy scans the codebase for known vulnerabilities in dependencies. If it finds anything rated HIGH or CRITICAL severity, the pipeline fails and the code cannot be deployed. This runs on every single commit — it is not a manual, occasional check. It is automated and mandatory.

For **dependency checking**, I have configured Dependabot to scan my npm and pip dependencies weekly. If a vulnerable dependency is found, Dependabot automatically creates a pull request to update it. This ensures my dependencies stay current without me having to manually check every week.


### Problem Solving — S11 (3 minutes)

Let me step back from the technical detail for a moment and talk about how I approach problems when things go wrong — because things always go wrong. I follow a methodology called PDAC: Problem, Diagnosis, Action, Confirm.

Let me give you a real example from this project. Recently, users reported that the login page inputs were invisible — they could not see the email and password fields.

**Problem:** Login inputs are not visible on the page.

**Diagnosis:** I used browser developer tools to inspect the input elements. I could see that the computed styles showed `background: rgba(255, 255, 255, 0.05)` and `color: white` — both of which would make the inputs invisible on a white card. I then searched the CSS files and found that `Admin.css` had a `.form-group input` rule with these transparent styles, intended for the Admin page's dark theme. Because both Admin.css and Login.css used the same selector with equal specificity, and Admin.css loaded after Login.css in the import order, Admin's styles were winning.

**Action:** I scoped the Login CSS selectors to `.login-card .form-group input`, giving them higher specificity. I later applied the same scoping pattern to Admin.css to prevent it from leaking styles to other pages.

**Confirm:** I verified the fix by loading the login page and confirming the inputs were visible with dark text on a white background. I also checked the Admin page to ensure its own inputs still worked correctly within the modal.

This is a systematic, logical approach. I did not just guess or try random changes. I identified the root cause through investigation, applied a targeted fix, and verified it worked without side effects.

### Incremental Refactoring — S22 (2 minutes)

The CSS fixes I just described are also a good example of incremental refactoring — making small, safe changes that improve the codebase without changing what the application actually does.

I did not rewrite all the CSS at once. I made five separate commits, each one addressing a specific issue:

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

> **[SLIDE 8: CI/CD Pipelines]**

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

> **[SLIDE 10: Break]**

Let us take a 10-minute break. When we come back, I will cover refreshing and patching, data persistence, operability, automation, and data security.

---

## SECTION 5: REFRESHING AND PATCHING (15 minutes)

> **KSBs: K8, S5**

### Immutable Infrastructure — K8, S5 (15 minutes)

> **[SLIDE 11: Refreshing & Patching]**

Welcome back. Before the break, I showed you the CI/CD pipeline deploying a real change to production. What that pipeline does under the hood connects to a concept called immutable infrastructure — and that is what I want to talk about now.

The idea is simple: instead of modifying existing resources in place — which over time can lead to servers slowly becoming different from each other because they were changed at different times, making bugs impossible to reproduce — you replace them entirely. When you need to update something, you do not log into a server and change a config file. You define the new desired state in code, and the infrastructure tooling replaces the old resources with new ones.

My project implements this through AWS CDK and CloudFormation. Every time I deploy a change through my CI/CD pipeline, CDK generates a CloudFormation template representing the desired state of my infrastructure. CloudFormation then compares this to the current state and creates a changeset. Resources that need to be updated are replaced — not modified in place.

Let me give you concrete examples.

**Lambda Functions:** When I change the code for a Lambda function, CDK packages the new code, uploads it to S3, and updates the Lambda function configuration to point to the new code. The old code is not modified — a completely new deployment package replaces it.

**CloudFront Distribution:** When I deploy a new frontend version, the S3 objects are replaced entirely and the CloudFront cache is invalidated. Every user gets the new version. There is no scenario where some users see the old version and others see the new version for an extended period.

**DynamoDB Table:** The table schema is defined in CDK. If I needed to change the partition key or add a global secondary index, CDK would handle the creation of a new table configuration.

Now, K8 specifically mentions operating system updates, container patching, and security patching. With a serverless architecture, a significant advantage is that AWS manages the underlying infrastructure. I do not manage any operating systems or containers. AWS patches the Lambda runtime, the API Gateway infrastructure, the DynamoDB servers, and the CloudFront edge locations. This is a deliberate architectural choice — by going serverless, I delegate the patching responsibility to AWS, which has dedicated teams and automated processes for keeping the underlying infrastructure up to date.

However, I am still responsible for patching my own application dependencies — the npm packages in my frontend and infrastructure code, the Python packages in my backend, and even the GitHub Actions I use in my CI/CD pipeline. If any of these have a known vulnerability and I do not update them, my application is at risk even though the underlying AWS infrastructure is fully patched by Amazon.

This is where **Dependabot** comes in. Let me show you the configuration.

> **[SCREEN: Open .github/dependabot.yml]**

Dependabot is a tool built into GitHub that automatically monitors your project's dependencies for security vulnerabilities and outdated versions. Instead of me manually checking every package every week — which is tedious and easy to forget — Dependabot does it automatically and creates a pull request when something needs updating.

I have configured three separate monitoring schedules, one for each ecosystem in my project.

The first monitors my **npm packages** — that covers both the React frontend and the CDK infrastructure code. It checks every Monday at 9am, and I have configured it to group minor and patch updates together into a single pull request. Without that grouping, I would get a separate PR for every single package update, which creates unnecessary noise. By grouping them, I get one manageable PR that bundles multiple updates together.

The second monitors my **Python packages** in the backend directory — things like boto3, pytest, and the libraries my Lambda functions depend on. Same weekly Monday schedule, same grouping strategy.

The third monitors my **GitHub Actions** — the checkout, setup-python, setup-node, and configure-aws-credentials actions used in my pipeline. These check monthly because they change less frequently, but they still need to stay current. For example, there are currently PRs open to update several of my Actions to newer versions.

So what happens when Dependabot opens a pull request? It triggers the exact same CI/CD pipeline I demonstrated earlier. The pipeline runs all the tests — linting, unit tests, vulnerability scanning with Trivy. If everything passes, I review the PR, merge it, and the updated dependencies deploy through the same automated process all the way to production. If the tests fail — which actually happened recently with one of the dependency update PRs — the pipeline catches it and I know the update needs investigation before I merge it. That is the safety net working exactly as designed.

The important point is that this gives me fully automated detection and nearly fully automated patching. The only manual step is my review and approval of the PR, which I have kept deliberately because I want a human checkpoint before dependencies change in production.

For the **distinction criteria** — fully automating the refreshing and patching process — my pipeline already handles this. When a Dependabot PR is merged, the pipeline runs all tests, deploys to Alpha, runs integration tests, and after manual approval, deploys to production. The only manual step is the approval gate. I could remove that gate for Dependabot PRs specifically, which would make it fully automated, but I have chosen to keep the human checkpoint for now.

The key insight is that immutable infrastructure, combined with CI/CD automation, means I can refresh my entire application stack confidently and repeatedly. If a deployment goes wrong, I can roll back by redeploying the previous version — there is no risk of being left in a broken state where some changes applied and others did not.

---

## SECTION 6: DATA PERSISTENCE (15 minutes)

> **KSBs: K12, S7**

### Database Selection — K12 (8 minutes)

> **[SLIDE 12: Why DynamoDB?]**

This brings us to where the data actually lives. I chose DynamoDB for this project, and I want to explain why — because picking the right database matters a lot.

> **[SCREEN: Show the DynamoDB table definition in service.ts]**

First, let me describe the data characteristics of my application. SkillScout stores interview questions. Each question has an ID, question text, category, difficulty, competency type, and an optional reference answer. The data model is simple — there are no complex relationships between entities, no need for joins, and no need for ACID transactions across multiple tables.

The access patterns are:
- **Read-heavy:** Most users browse and search questions. Reads vastly outnumber writes.
- **Simple queries:** Get all questions, get one question by ID. No complex aggregations.
- **Low write volume:** Only admins create, update, or delete questions.

Given these characteristics, DynamoDB was the right choice for several reasons:

1. **Performance:** DynamoDB provides single-digit millisecond read and write latency, which is ideal for a responsive user experience.
2. **Scalability:** DynamoDB automatically adds more capacity behind the scenes as traffic increases. If my application suddenly gets thousands of users, it handles the load without me configuring anything.
3. **Cost:** With on-demand billing, I pay only for the reads and writes I actually perform. For a low-to-medium traffic application, this is significantly cheaper than provisioning a relational database instance.
4. **Managed service:** No database administration required. No patching, no backups to configure manually — although I did enable point-in-time recovery as an additional safety measure.
5. **Lambda integration:** DynamoDB works with Lambda through simple one-off API calls using the Python SDK. Unlike traditional databases where you need to manage a pool of reusable connections and handle what happens when connections time out, DynamoDB just works — you call it, it responds, done.

Now, let me also explain why I did **not** choose a relational database like RDS PostgreSQL. A relational database would have been overkill for this use case. I do not need joins, foreign keys, or complex queries. A relational database would have required me to manage an instance — even with Aurora Serverless, the startup times and minimum costs are higher. Additionally, traditional databases expect a persistent connection that stays open, but Lambda functions are short-lived — they spin up, handle a request, and shut down. Managing that mismatch adds complexity I did not need.

For **infrastructure state management**, my CDK state is managed by CloudFormation. The CloudFormation state file tracks every resource, its properties, and its dependencies. This state is stored and managed by AWS — I do not need to manage a separate state backend like you would with Terraform.

### Troubleshooting Distributed Systems — S7 (7 minutes)

When something goes wrong in a system like this, the tricky part is that a single request touches multiple services — CloudFront, API Gateway, Lambda, DynamoDB. The error could be in any of them. Let me show you how I track that down.

> **[SCREEN: Open AWS CloudWatch console]**

When an issue occurs in a distributed system, the challenge is that the request flows through multiple services — CloudFront, API Gateway, Lambda, DynamoDB — and the error could originate in any of them. CloudWatch Logs is my primary tool for navigating this.

Every Lambda function in my application uses structured JSON logging. Let me show you what this looks like.

> **[SCREEN: Show the logging in questions_handler.py]**

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

Let me explain what "structured JSON logging" means. Traditional logging produces plain text lines like `"2025-03-18 14:32:01 INFO Incoming request GET /questions"`. That is human-readable, but very hard to search and filter at scale. My `JsonFormatter` produces this instead:

```json
{
  "timestamp": "2025-03-18T14:32:01",
  "level": "INFO",
  "message": "Incoming request",
  "request_id": "abc-123-def-456",
  "path": "/questions",
  "method": "GET"
}
```

Every log entry is a JSON object with consistent field names. The key field is `request_id` — Lambda generates a unique ID for every request, and I attach it to every log entry. So when I need to troubleshoot, I can search CloudWatch Logs Insights with a query like `filter request_id = "abc-123-def-456"` and instantly see every log entry for that specific request, in order. Without structured logging, I would have to manually scan through thousands of unstructured text lines trying to correlate timestamps. With JSON logging, I can filter, sort, and query logs the same way I would query a database.

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

Now, troubleshooting is reactive — something breaks and you investigate. But ideally, I want to know about problems before users report them. That is what monitoring and alerting are for. Let me show you what I have built.

> **[SCREEN: Open CloudWatch Dashboard]**

> **[SCREEN: Show dashboard screenshot]**

> **[SLIDE 13: CloudWatch Dashboard]**

This is my SkillScout CloudWatch Dashboard. It contains 12 widgets arranged in six rows of two, and I want to walk you through exactly what each one shows and why I included it.

On the **top row**, I have **Lambda Invocations** on the left and **Lambda Errors** on the right. Invocations tells me how many times my Lambda function was called — which is essentially how many API requests my application handled. Errors shows me how many of those invocations failed. If I see invocations going up but errors staying at zero, the application is healthy. If errors start climbing, something is wrong and I need to investigate.

On the **second row**, I have **Lambda Duration** and **Lambda Throttles**. The duration widget shows two lines on the same graph — the average response time and the p99 response time, which I will explain properly in a moment. Having both on one graph lets me immediately see the gap between them. If the gap is wide, cold starts are happening frequently. This matters because slow responses drive users away — if someone clicks "get questions" and waits five seconds with nothing happening, they are going to close the tab. Throttles shows whether Lambda is rejecting requests because it has hit the maximum number of functions it is allowed to run at the same time — any value above zero here means real users are being turned away and getting error messages through no fault of their own.

The **third row** shows **API Gateway Requests** and **API Gateway Latency**. These let me see what is happening at the API layer separately from the Lambda layer. This is important because if something is slow, I need to know where to look. If API Gateway is slow but Lambda is fast, the problem is in the routing layer before my code even runs — that is an AWS infrastructure issue, not a code issue, and I would investigate it very differently.

Below that, I have my **custom business metrics**. This is where I believe I meet the distinction criteria. Let me explain each one.

> **[SCREEN: Show custom metrics screenshot]**

**Questions Retrieved** and **Question Views by Category** sit on the **fourth row**. Questions Retrieved tracks how many questions are returned per API call. If this suddenly drops to zero, it could mean DynamoDB is down, a permissions policy changed, or the table is empty — this is my early warning that the core feature of the application has stopped working. Question Views by Category breaks down which topics users are looking at most. This is not a health metric — it is a product metric. It tells me where to invest in creating more content. If 80% of users are looking at AWS questions and only 5% are looking at Python questions, I know where to focus my effort.

The **fifth row** has **Admin CRUD Operations** and **Admin Authorisation**. The CRUD widget — that stands for Create, Read, Update, Delete — shows three separate lines for Created, Updated, and Deleted on the same graph, so I can see the balance of admin activity at a glance. This helps me spot unusual behaviour — if I suddenly see a spike of 50 deletes with no creates, that could mean someone is wiping the question bank, either by accident or on purpose. The Admin Authorisation widget is a security widget: it shows successful permission checks in the default colour and failed attempts in red. If I see a spike in the red line, that is an immediate concern — it means someone is repeatedly trying to access admin functions they do not have permission for, and I need to find out who and why.

The **sixth row** has **API Latency by Operation** and **404 Errors**. The latency widget has two vertical axes — average response time on the left side and p99 response time on the right side. Using two axes lets me compare them on different scales without one squashing the other flat. This helps me catch slowdowns that only affect a small number of users — the average might look fine, but if the p99 is high, 1 in every 100 users is having a bad experience. The 404 widget tracks "question not found" errors in orange. A spike here tells me that users are trying to access questions that do not exist — which usually means an admin deleted questions without realising the website still links to them, leaving users hitting dead ends.

All 12 widgets are defined in `service.ts` — not set up by hand through the AWS console. That means the entire dashboard lives in my code, is tracked in Git, and gets created automatically every time I deploy. If I deleted the dashboard by accident, I would just redeploy and it comes back exactly as it was.


> **[SCREEN: Show the custom metrics code in custom_metrics.py]**

These custom metrics are sent to CloudWatch by the `custom_metrics.py` module, which I wrote specifically for this project. Let me show you the core function:

```python
def emit_metric(metric_name, value, unit="Count", dimensions=None):
    try:
        metric_data = {
            "MetricName": metric_name,
            "Value": value,
            "Unit": unit,
            "Timestamp": datetime.utcnow(),
        }
        if dimensions:
            metric_data["Dimensions"] = dimensions

        cloudwatch.put_metric_data(Namespace="SkillScout", MetricData=[metric_data])

    except Exception as e:
        logger.warning(f"Failed to emit metric {metric_name}: {str(e)}")
```

This function takes a metric name like "QuestionsRetrieved", a numeric value, a unit like "Count" or "Milliseconds", and optional dimensions. Dimensions are extra labels that let me slice a metric into smaller pieces — for example, tracking question views not just as a total, but broken down by category ("AWS", "Python") and difficulty ("Easy", "Hard"). The `Namespace` is "SkillScout" — this is just a folder name that groups all my custom metrics together so they do not get mixed up with AWS's own built-in metrics.

The most important design decision here is in the except block. The entire metric call is wrapped in try-except, and if CloudWatch is unavailable or the call fails for any reason, I log a warning but I do NOT pass the error upwards. This means the Lambda function carries on running normally — the user still gets their questions or their evaluation. Metrics are useful for monitoring, but they are not worth crashing the actual request over. The user's experience always comes first. This is what "failing safely" means — when something non-essential breaks, the rest of the system keeps working instead of falling over.

The Lambda code calls these metrics using simple helper classes:

```python
class QuestionsMetrics:
    @staticmethod
    def questions_retrieved(count):
        emit_metric("QuestionsRetrieved", count, "Count")

    @staticmethod
    def question_viewed(question_id, category=None, difficulty=None):
        dimensions = []
        if category:
            dimensions.append({"Name": "Category", "Value": category})
        if difficulty:
            dimensions.append({"Name": "Difficulty", "Value": difficulty})
        emit_metric("QuestionViewed", 1, "Count", dimensions)
```

So in the handler, after retrieving all questions, I just call `questions_metrics.questions_retrieved(len(items))` — one line. After someone views a specific question, I call `questions_metrics.question_viewed(question_id, category=item.get("category"))`. These simple calls feed data into CloudWatch, which then powers the dashboard widgets and alarm thresholds I showed you.

### Alerting Configuration (5 minutes)

Now let me show you the alerting configuration.

> **[SCREEN: Show the alarm definitions in service.ts]**

> **[SCREEN: Show alarm screenshot]**

> **[SLIDE 14: CloudWatch Alarms]**

I have 8 CloudWatch alarms configured — 4 for standard AWS metrics and 4 for my custom business metrics.

The standard alarms are:
- **Lambda Errors:** Goes off if there are 5 or more errors in a single 5-minute window. Just one bad window triggers it — I do not wait for it to happen twice because errors need immediate attention. This catches things like a bad deployment that broke the code, a permissions change that stopped Lambda from reading the database, or a bug that only appears under certain inputs. Without this alarm, users would be seeing error messages and I would not know until someone complained.
- **Lambda Throttles:** Goes off if there is even 1 throttle event — I set this threshold low on purpose because throttling means Lambda is actually turning users away. Their requests never even reach my code — AWS rejects them before they start. This catches sudden traffic spikes or a misconfigured concurrency limit. Even one throttle means a real user got an error, so I want to know immediately.
- **Lambda High Duration:** Goes off if the average response time exceeds 5 seconds for two 5-minute windows in a row. I require two windows here so that a single slow request does not set it off — I only want to be alerted if slowness is sustained. This catches things like DynamoDB slowing down, the Bedrock AI service taking longer than usual to respond, or cold starts happening too frequently. Slow responses frustrate users — they click a button and nothing seems to happen — so I want to catch this before people give up and leave.
- **API Gateway 5xx Errors:** Goes off if there are 5 or more server errors in a single 5-minute window. A 5xx error means something broke on the server side — the user sent a perfectly valid request but my application could not handle it. This catches problems like Lambda timing out, a misconfigured API route, or the Lambda function running out of memory. These are the worst kind of errors because the user did nothing wrong — the failure is entirely on my side.

The custom metric alarms are:
- **High API Latency:** Goes off if average response time exceeds 1 second for two windows in a row. Same logic — two windows filters out one-off spikes. This catches performance problems from the user's point of view. Even if Lambda itself is fast, maybe DynamoDB is slow or the Bedrock call is taking too long. A one-second response time means the user is sitting there waiting, and if it stays that slow, they will stop using the application.
- **High 404 Rate:** Goes off if there are more than 10 "question not found" errors in 5 minutes. This catches a real content management problem — for example, an admin deletes a batch of questions but the website still has links pointing to them, so users keep clicking and hitting dead ends. It also catches anyone systematically probing the API with random IDs to see what comes back, which could be the start of a data scraping attempt.
- **Unauthorised Admin Access:** Goes off if there are more than 5 failed admin permission checks in 5 minutes — this is a security alarm. It catches someone repeatedly trying to access admin functions — creating, editing, or deleting questions — without the right permissions. That could be a normal user who somehow found the admin URL and is testing it, a compromised account trying to escalate its access, or an attacker probing for weaknesses. Five attempts in five minutes is not someone making an honest mistake — it is a pattern, and I need to investigate it immediately.
- **No Question Activity:** Goes off if fewer than 1 question has been retrieved in 10 minutes — which is my "is the whole thing dead?" alarm. If nobody is retrieving questions for that long, something fundamental is broken — maybe the Lambda function is crashing on every request, maybe DynamoDB is unreachable, maybe the API Gateway configuration got corrupted. This alarm has a special setting that I want to highlight. I told CloudWatch: "if you receive no data at all, treat that as a problem." On all the other alarms, I told CloudWatch the opposite: "if you receive no data, assume everything is fine." The reason is simple — for most alarms, no data just means nobody is using the application right now, which is perfectly normal. But for the activity alarm, no data IS the problem. It means nothing is happening at all, and I need to investigate.

All of these alarms are defined in code in `service.ts`. Each one says which metric to watch, what the danger threshold is, and how many times it needs to cross that threshold before the alarm goes off. Because it is all in code, my alerting is tracked in Git and can be recreated from scratch — if someone asked me to set up the same monitoring on a new environment, I would just deploy the stack.

For notifications, all alarms are connected to an **SNS topic** — which is AWS's email notification service — that sends me an email when something goes wrong. I built this as an optional feature: the email setup only gets created if I provide a `notificationEmail` when I deploy. If I leave that out, the alarms still exist and still show up on the dashboard, but they do not send emails. This is useful because someone testing the application in a development environment does not want to be bombarded with alarm emails.

### Interpreting Metrics — S19 (5 minutes)

So I have all this data — but what do I actually do with it? Let me give you some examples of how I would interpret what I see on this dashboard and make decisions based on it.

If I look at the Lambda duration metrics and see that the **p99 latency** is significantly higher than the average, that tells me there are occasional slow requests. Let me explain what p99 means. If I sort all my request durations from fastest to slowest, the p99 is the point where 99% of requests were faster and 1% were slower. So if the average is 100 milliseconds but the p99 is 2,000 milliseconds, most requests are fast, but 1 in every 100 takes 2 full seconds. The average hides those outliers — p99 exposes them.

In a Lambda context, when p99 is much higher than average, this usually indicates **cold starts**. Lambda functions are not running all the time. When a request arrives and no container is running, AWS needs to download the code, start a new container, load the Python runtime, import all the libraries, and only then run my handler. That whole startup process takes 1 to 3 seconds. This is called a cold start — starting from nothing. However, after handling a request, Lambda keeps the container running for a few minutes. If another request comes in during that time, Lambda reuses the warm container and goes straight to executing the handler — that takes under 100 milliseconds. So what I see in the metrics is most requests hitting warm containers (fast) and a small percentage hitting cold containers (slow).

If this became a problem, I could configure **provisioned concurrency**, which tells Lambda "keep a certain number of containers running at all times, even when there are no requests." I would pay more because containers run continuously, but cold starts would disappear entirely. For my application, the current behaviour is acceptable so I have not enabled it, but the option exists if traffic increases.

If I see the 404 error rate increasing, I would investigate whether questions are being deleted without corresponding frontend updates, or whether there are stale links somewhere.

If the unauthorised access alarm fires, I would immediately check CloudWatch Logs to identify the source of the attempts, check if it is a legitimate user with a misconfigured role or a potential security incident, and take appropriate action.

The custom metrics I have built — like question views by category and API latency by operation — provide improvement areas beyond basic health monitoring. For example, if I see that the "AWS" category gets 80% of all views, I might recommend investing in more AWS questions. If I see that the evaluate answer operation has significantly higher latency than question retrieval, I might investigate whether the Bedrock API call can be optimised or whether I should implement caching for repeated evaluations.

These are the kinds of insights that go beyond basic health checks — they help me make actual product decisions, not just know whether the application is up or down. This is what the distinction criteria are looking for — custom metrics that provide improvement areas and a clear explanation of how they can be acted upon.

### Audit Trail — CloudTrail (5 minutes)

Now, everything I have shown you so far — the dashboard, the alarms, the custom metrics — monitors what the application is doing. But I also need to monitor what people are doing to the infrastructure itself. That is where **CloudTrail** comes in.

> **[SCREEN: Show CloudTrail configuration in service.ts]**

> **[SLIDE 15: CloudTrail]**

CloudTrail is like a security camera for my AWS account. It records every action that happens — when someone creates a new permission, changes a database table, updates a Lambda function, or modifies a firewall rule, CloudTrail writes it down. It captures who did it, when they did it, what they changed, and which IP address they were on. This gives me a complete history of everything that has happened to my infrastructure.

Let me walk through how I configured it in CDK.

First, I created a dedicated **S3 bucket** — which is just cloud storage — to hold all the log files. This bucket is locked down: the files are encrypted, versioning is turned on so old versions cannot be silently overwritten, and public access is completely blocked. I also set up rules to manage costs over time: after 30 days, logs are moved to cheaper storage because I rarely need to read old logs. After 90 days, they are deleted entirely. This keeps my bill under control while still keeping enough history for any investigation I might need.

Importantly, I set the bucket to survive even if I delete the entire stack. So if I ever tear down and rebuild my infrastructure, the log files are still there. This is a deliberate safety choice — audit logs should never be accidentally lost.

Second, I connected CloudTrail to a **CloudWatch Log Group** with a one-month retention. This means I can search through infrastructure changes using CloudWatch Logs Insights — the same search tool I use for application logs. So I have one place where I can look up both "what is the application doing" and "what has someone changed in the infrastructure."

Third, I configured the trail itself with a few important settings:

- **File validation** is turned on. This means CloudTrail creates a fingerprint of each log file. If someone tried to cover their tracks by editing a log file after the fact, the fingerprint would not match and I would know the file had been changed.
- **Global service events** are included. Some AWS services like IAM — the permissions service — and CloudFront do not live in any one region. By including global events, I make sure I capture permission changes and CDN changes, not just things happening in my main region.
- **Single region** trail. My application only runs in eu-west-1, so I do not need to pay for a trail that covers every AWS region. If I expanded to more regions later, I would turn on multi-region.
- **All management events** are tracked — both reads and writes. This means I capture not just changes like "someone created a new table" but also lookups like "someone listed all the permissions." Capturing reads is useful because if someone is poking around looking at what permissions exist, that could be the first step before they try something they should not.

Together, CloudWatch and CloudTrail give me two different views. CloudWatch tells me what the application is doing — how many requests it is handling, how many errors, how fast it is responding. CloudTrail tells me what people and services are doing to the infrastructure behind the scenes — who changed what and when. Between the two, I have full visibility over both the application and the platform it runs on.

### You Build It, You Run It — B3 (5 minutes)

Everything I have just shown you — the monitoring, the alarms, the metrics — exists because I own this application end to end. I did not build the code and hand it to someone else to run. I built it, I deployed it, and I am the one who gets the alert at 2am if something breaks. That mindset is called "you build it, you run it," and it has shaped how I approached every part of this project.

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

Throughout this project, I have been using APIs — which are simply defined contracts for how software components talk to each other. One piece of code says "give me this" in a specific format, and the other side responds in a specific format. In SkillScout, I work with APIs at multiple levels.

**AWS SDK APIs (Boto3):** My Lambda functions use the Boto3 SDK to interact with AWS services. Let me show you a specific example.

> **[SCREEN: Open backend/src/questions_handler.py, show the DynamoDB interactions]**

At the top of the file, you can see the setup:

```python
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["TABLE_NAME"])
```

This creates a connection to DynamoDB and gets a reference to my table. The table name comes from an environment variable — which CDK sets automatically when it deploys the Lambda function. Now let me show you the actual operations:

```python
# GET all questions
items = []
response = table.scan()
items.extend(response.get("Items", []))

while "LastEvaluatedKey" in response:
    response = table.scan(ExclusiveStartKey=response["LastEvaluatedKey"])
    items.extend(response.get("Items", []))
```

`table.scan()` reads every item from the table. The response is a dictionary, and I call `.get("Items", [])` which means "give me the Items list, or an empty list if nothing came back." Now here is something important — DynamoDB limits results to 1 megabyte of data. If my table has more data than that, DynamoDB sends back a partial result along with a `LastEvaluatedKey`, which is essentially a bookmark saying "continue from here." My while loop checks for that bookmark — if it exists, I call scan again, passing the bookmark so DynamoDB picks up where it left off. I keep looping until all the data has been read. This is called pagination — reading a large dataset in manageable chunks.

```python
# CREATE new question
table.put_item(Item={
    "id": str(uuid.uuid4()),
    "question_text": body["question_text"],
    "category": body["category"],
    "difficulty": body["difficulty"],
    "created_at": datetime.now(timezone.utc).isoformat(),
})
```

To create a question, I call `table.put_item()` and pass a dictionary with the data. I generate a unique ID using `uuid.uuid4()`, which creates a random string that is virtually guaranteed to be unique. I also record a timestamp showing when this question was created.

Each of these method calls — `scan`, `get_item`, `put_item`, `update_item`, `delete_item` — is a call to the DynamoDB API, wrapped by the Boto3 SDK so I do not have to construct raw HTTP requests myself. To use these, I referenced the Boto3 DynamoDB documentation, which specifies what parameters each method expects and what it returns.

**Bedrock API:** The evaluate answer function calls the Bedrock InvokeModel API.

> **[SCREEN: Open backend/src/evaluate_answer.py]**

```python
prompt = f"""You are Marcus, an AI interview coach for AWS.
You evaluate candidate answers for L4 Systems Engineer and
Systems Development Engineer roles.

Evaluate this candidate's answer:

Question: {question_text}
Candidate's Answer: {user_answer}
Competency: {competency_type}

Respond ONLY with valid JSON in this exact format:
{{
  "is_correct": true/false,
  "score": 0-100,
  "strengths": ["point1", "point2"],
  ...
}}"""

response = bedrock.invoke_model(
    modelId="anthropic.claude-3-7-sonnet-20250219-v1:0",
    body=json.dumps({
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 1000,
        "messages": [{"role": "user", "content": prompt}],
    }),
)
```

Let me walk through this. First, I construct the prompt — the instructions I send to Claude. I tell it who it is (Marcus, an AI interview coach), what to evaluate (the question and the user's answer), and what format to return (a JSON object with score, strengths, and suggestions). The quality of this prompt directly determines the quality of the AI response.

Then I call `bedrock.invoke_model()` with three key parameters. The `modelId` specifies which AI model to use — Claude 3.7 Sonnet, which is fast enough for real-time responses and smart enough to evaluate technical answers. The `max_tokens` is set to 1000 — tokens are chunks of text, roughly 4 characters each, so 1000 tokens means roughly 750 words. This caps the response length so the AI does not generate an excessively long response that wastes time and money. If I wanted to include a `temperature` parameter, that would control randomness — 0.0 means always pick the most predictable response, 1.0 means be more creative and random. For evaluation, I want consistency, so I keep it at the default which is low.

After getting the response, I parse the JSON that Claude returns and send it back to the user. If anything goes wrong — bad JSON, Bedrock failure, missing fields — I catch the error and return a clean 500 error response.

**REST API (API Gateway):** On the frontend, I call my own REST API.

> **[SCREEN: Open frontend/src/services/api.ts]**

```typescript
export async function getAllQuestions(authToken: string | null): Promise<Question[]> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };

  if (authToken) {
    headers['Authorization'] = authToken;
  }

  const response = await fetch(`${API_BASE_URL}questions`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch questions: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data;
}
```

Every API function follows this same pattern. First, I build a headers object and attach the JWT token if the user is logged in — this is the token that API Gateway will validate with Cognito. Then I call `fetch` with the API URL, method, and headers. After getting the response, I check `response.ok` — which is true for status codes 200 to 299. If it is false, I throw an error with the status code and message so the React component can show an error to the user. If it succeeds, I parse the JSON body and return the data. TypeScript knows the return type is `Promise<Question[]>` — an array of Question objects — so the calling code gets full type checking on the result.

### Automation for Efficiency — S12 (7 minutes)

So across this project, I have automated as much as I can — not for the sake of it, but because every piece of automation saves real time and removes the chance of human error. Let me walk through the key areas.

**Infrastructure deployment automation:** The entire project can be set up from scratch automatically. Running `cdk deploy` provisions every AWS resource — DynamoDB tables, Lambda functions, API Gateway, Cognito, CloudFront, S3, CloudWatch alarms, CloudTrail — in approximately 10 minutes. Without this automation, manually creating and configuring all these resources through the AWS console would take hours and would be error-prone.

**CI/CD automation:** Every code push triggers automated testing and deployment. Before I built the pipeline, deploying a change required me to manually run tests, build the code, upload to S3, update Lambda code, and invalidate CloudFront. That process took at least 30-45 minutes and was prone to human error. Now it takes 6-14 minutes and is completely consistent.

**Code quality automation:** Linting, formatting, and vulnerability scanning run automatically on every commit. This eliminates the overhead of running these tools manually and ensures no commit bypasses the quality checks.

**Monitoring automation:** Alarms and notifications are configured in code and deployed automatically. If I add a new alarm, it is deployed through the pipeline without any manual CloudWatch console work.

For the **distinction criteria** — identifying an additional opportunity for automation — Dependabot is my example. I identified that manually checking for dependency updates was inefficient and easy to forget. By configuring Dependabot, I automated the entire process of identifying outdated dependencies, creating update PRs, and triggering the pipeline to test and deploy them. This reduces the effort of keeping the application secure and up to date from a regular manual task to a simple PR review and approval.

---

## SECTION 9: DATA SECURITY (15 minutes)

> **KSBs: K16, S10**

### Securing Data — K16 (8 minutes)

> **[SLIDE 16: Data Security]**

The last area I want to cover is data security — specifically, how I protect data both when it is moving between services and when it is sitting in storage.

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

I covered the STRIDE framework and my full threat model earlier. What I want to focus on now is how I actually assess each threat — because not all threats are equal, and you have to prioritise.

Let me walk through a few specific examples with their likelihood and impact assessments.

**Threat: JWT Token Theft**
- **Likelihood:** Medium — tokens are stored in browser localStorage, which is accessible to JavaScript
- **Impact:** High — a stolen token grants full access to the user's account
- **Mitigation:** Short-lived tokens (Cognito default is 1 hour), HTTPS prevents network interception, React's built-in XSS protection prevents most script injection attacks. For a production enterprise application, I would consider using HttpOnly cookies instead of localStorage, but for this application the risk is acceptable.

**Threat: SQL/NoSQL Injection**
- **Likelihood:** Low — DynamoDB does not use SQL, and the Boto3 SDK treats all values as data, never as executable code. When I call `table.get_item(Key={"id": question_id})`, even if `question_id` contained something malicious, DynamoDB just treats it as a string to look up — it cannot be interpreted as a command. This is fundamentally different from traditional SQL databases where a malicious input like `'; DROP TABLE questions; --` could delete an entire table if the query is built by concatenating strings together. My code never builds queries by joining strings — I always pass values as separate parameters, so they are treated as data, not instructions.
- **Impact:** High — could lead to data exfiltration or deletion
- **Mitigation:** Using the DynamoDB SDK with typed parameters rather than constructing query strings. Input validation in the Lambda functions rejects any request with missing or unexpected fields. Admin authorisation for write operations means only authenticated admins can modify data in the first place.

**Threat: Denial of Service**
- **Likelihood:** Medium — any public-facing application is a target
- **Impact:** Medium — application becomes unavailable but no data is lost
- **Mitigation:** API Gateway has built-in throttling. Lambda concurrency limits prevent runaway execution. CloudFront provides DDoS protection at the edge. CloudWatch alarms alert on unusual traffic patterns.

The key principle is that you cannot eliminate all risk — that would be infinitely expensive. Instead, you identify the threats, assess their likelihood and impact, and put in proportionate mitigations. For example, token theft is high-impact and medium-likelihood, so I invested in multiple controls — short-lived tokens, HTTPS, and XSS prevention. DDoS on an internal tool is medium-impact and medium-likelihood, so I rely on the built-in protections that API Gateway and CloudFront already provide, rather than building custom defences.

---

## SECTION 10: SUMMARY AND Q&A BUFFER (15 minutes)

### Summary (5 minutes)

> **[SLIDE 17: Summary]**

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

> **[SLIDE 18: Thank You]**

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
