# GitHub Issues & Milestone Management Guide

This guide defines the mandatory discipline for tracking work within this repository. AI agents must strictly follow these protocols to ensure project traceability and alignment with our roadmap.

## 1. Core Principles
- **No Issue, No Work:** Every code change must be tied to a GitHub Issue.
- **Milestone Alignment:** Every issue must be assigned to its corresponding project milestone.
- **Objective Communication:** Use clear, action-oriented language in titles and descriptions.

## 2. Standard Labels
Always apply at least one of the following labels:

| Label | Description |
| :--- | :--- |
| `enhancement` | New features, UI improvements, or capability additions. |
| `bug` | Errors, broken functionality, or regression fixes. |
| `documentation` | Changes to README, guides, or in-code comments. |
| `refactor` | Code cleanup, optimization, or restructuring without changing logic. |
| `urgent` | Critical blocks or production-breaking issues. |

## 3. Issue Workflow
### A. Start of Task
1. **Check Existing:** Search open issues to see if the task is already tracked.
2. **Create if Missing:** Use the template below to create a new issue.
3. **Assign Milestone:** Assign the issue to the active project phase/milestone.

### B. During Development
1. **Comment on Progress:** If a task is complex or hits a roadblock, document the decision-making process in the issue comments.

### C. Completion
1. **Reference in Commit/PR:** Use "Closes #123" in your PR description or commit message.
2. **Verify & Close:** Ensure the issue is moved to 'Closed' only after the code is validated.

## 4. Issue Template
```markdown
## Objective
[Clear, one-sentence description of the goal]

## Scope
- [ ] Sub-task 1
- [ ] Sub-task 2

## Technical Context
[Any relevant files, patterns, or constraints to consider]
```

## 5. Milestone Management
- **Tracking:** Use milestones to group issues by feature set or sprint.
- **Updates:** Ensure milestone progress is reflected as issues are closed.
