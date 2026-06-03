# Public-Safe Repository Cleanup Audit

This report categorizes all files found in the `Luxury28-Prototype` repository to identify items that are safe to make public, require client/team review, or must be removed entirely before publishing the repository.

---

## 1. Remove Before Publishing (Critical Security / Cleanliness)
These files contain active secrets, temporary build artifacts, or scratch scripts that should not be visible in a public repository.

| File Path | Description | Reason for Removal | Recommended Action |
| :--- | :--- | :--- | :--- |
| `.env` | Active environment configurations. | **Severe security risk:** contains live Supabase, Xendit, and Biteship credentials. | Run `git rm --cached .env` to stop tracking it. Ensure it remains ignored locally. |
| `scratch/test-biteship.js` | Biteship integration test script. | Internal scratch/debug file; imports keys from `.env`. | Remove from repository or add to `.gitignore` so it is not published. |
| `tsconfig.tsbuildinfo` | TypeScript compiler build cache. | Temporary build file. | Add `tsconfig.tsbuildinfo` to `.gitignore` and delete it from Git index. |

---

## 2. Review Before Publishing (Internal Notes & Specifications)
These files contain internal implementation plans, architectural drafts, or test profiles. While they do not contain raw passwords or API keys, they reveal details about internal systems and developer guidelines that the client or project owner might want to keep private.

| File Path | Description | Category | Decision Required |
| :--- | :--- | :--- | :--- |
| `Implementation/IMPLEMENTATION_PLAN.md` | Comprehensive database schema, RLS, and dashboard plan. | Architecture / Spec | **Review:** Safe to expose if open-sourcing the design, but should be deleted if the project is proprietary. |
| `Implementation/XENDIT_BITESHIP.md` | Details of Xendit and Biteship payment/shipping integrations. | Architecture / Spec | **Review:** Contains webhook path setup. Safe for public reference, but details of regional providers (Indonesia-first) can be kept private if desired. |
| `Implementation/ADMIN_PROFILE.md` | Feature breakdown for administrator portal. | Profile Spec | **Review:** Internal planning document. |
| `Implementation/STAFF_PROFILE.md` | Feature breakdown for staff/operator portal. | Profile Spec | **Review:** Internal planning document. |
| `Implementation/CUSTOMER_PROFILE.md` | Feature breakdown for customer portal. | Profile Spec | **Review:** Internal planning document. |
| `Implementation/supabase_migration.sql` | SQL schema, enums, trigger setups. | Database Setup | **Review:** Generally safe to include so others can set up the DB, but ensure no user data or custom configuration keys are hardcoded. |
| `GITHUB_ISSUES_GUIDE.md` | Workflow guidelines for contributors/agents. | Workflow Doc | **Review:** Generally safe, but very project-specific. |

---

## 3. Safe to Publish (Public Core Codebase)
These files represent the core codebase, configuration layouts, and visual elements that are standard for public release.

* **Storefront Code:** All files under `/app` (auth routes, checkout, catalog pages, customer views) and `/components` (UI elements, theme provider, overlay) are clean of hardcoded secrets and represent the application logic.
* **Layouts and Themes:** Global CSS styles (`styles/globals.css`, `app/globals.css`), Tailwind styling configurations (`postcss.config.mjs`, `components.json`), and TypeScript settings (`tsconfig.json`).
* **Visual Assets:** Images in `/public` (`Luxury28.png`, `fallback-luxury.png`, product PNGs, payment SVGs) are safe (they do not contain licensing or metadata violations).
* **Package Definitions:** `package.json` and `package-lock.json` are safe to publish.
* **Ignored Configs:** `.gitignore` (ensure it ignores `.env` and `tsconfig.tsbuildinfo` correctly).
* **Environment Example:** `.env.example` (contains no real keys, only placeholders).
