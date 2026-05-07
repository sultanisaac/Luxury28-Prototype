# GitHub Issues & Workflow Guide

This guide defines the discipline for tracking development progress in this repository. AI agents and developers must strictly follow these rules to ensure clarity, accountability, and traceability.

## 1. Issue Management Principles
- **Every Task Needs an Issue:** No code changes should be made without a corresponding issue.
- **Atomic Issues:** Each issue should represent a single, well-defined task or feature.
- **Live Updates:** Issues must be updated when work starts, hits a roadblock, or is completed.

## 2. Issue Lifecycle
1.  **Creation:** Before starting any work, create an issue.
2.  **Assignment:** Assign the issue to yourself (the AI agent).
3.  **Progression:** Add comments if there are significant technical decisions or changes in scope.
4.  **Completion:** Reference the issue in the PR or commit (e.g., `Closes #123`).

## 3. Standard Labels
Always apply at least one of these labels when creating or updating issues:

| Label | Usage |
| :--- | :--- |
| `enhancement` | New features, UI improvements, or capability additions. |
| `bug` | Errors, broken functionality, or regression fixes. |
| `documentation` | Changes to README, guides, or in-code comments/docstrings. |
| `refactor` | Code cleanup, optimization, or restructuring without changing logic. |
| `urgent` | Critical blocks, security fixes, or production-breaking issues. |

## 4. Issue Format
### Title
Keep it objective and action-oriented.
- *Bad:* "Fixing some things"
- *Good:* "Fix: Navigation bar responsiveness on mobile"
- *Good:* "Feat: Implement Stripe payment webhook"

### Body Template
```markdown
## Objective
[Clear description of what needs to be achieved]

## Scope
- [ ] Task 1
- [ ] Task 2

## Context
[Any relevant technical details, links to docs, or previous discussions]
```

## 5. Agent Workflow for Every Session
1.  **Read Issues:** At the start of a session, list open issues to understand the current state.
2.  **Create/Select Task:** Identify the issue being worked on. If it doesn't exist, create it.
3.  **Execute:** Write the code.
4.  **Document:** Comment on the issue with the outcome.
5.  **Close:** Ensure the issue is closed via PR or manual update once validated.
