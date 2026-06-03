# Git History Security Audit Report

This document reports on the audit performed on the complete Git history of the `Luxury28-Prototype` repository to identify potentially exposed secrets or sensitive data before public release.

## Executive Summary
A scan of the Git repository history reveals multiple commits where sensitive environment variables and credentials were track-committed directly to the `.env` file in the Git repository index. Although subsequent commits attempted to delete or change these values, **Git preserves all historical files and commits**. If this repository is made public on GitHub in its current state, all historical credentials will be visible to the public.

**Audit Status:** 🚨 **HIGH RISK - CRITICAL EXPOSURES FOUND**
**Remodeling Required:** Git history rewriting and complete credential rotation.

---

## 1. Identified Exposure Log
The following table summarizes sensitive credential exposures across historical commits in the repository:

| Commit Hash | Commit Message / Description | Exposed Secrets (Masked) | Severity / Risk |
| :--- | :--- | :--- | :--- |
| `d095c5e` | `chore: add environment variables...` | `SUPABASE_ACCESS_TOKEN=sbp_c532104c257e...` | 🔴 **CRITICAL** (Supabase Personal Access Token) |
| `ec1ead3` | `chore: update .gitignore to track .env...` | `VITE_SUPABASE_URL=https://wqihovirwfnmlpsophcp.supabase.co`<br>`VITE_SUPABASE_ANON_KEY=eyJhbGciOiJI...`<br>`SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...`<br>`SUPABASE_ACCESS_TOKEN=sbp_c532104c257e...` | 🔴 **CRITICAL** (Legacy Supabase Project Keys & Service Role Key bypassing RLS) |
| `d9286a9` | `chore: rename .env.local to .env...` | `NEXT_PUBLIC_SUPABASE_URL=https://iobwiajnzymniuxvxvdo.supabase.co`<br>`NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...`<br>`SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...r9B2YHNaWXPHpByj8LYHtzUgv-mYUyb0sbih-jHnU8g` | 🔴 **CRITICAL** (Active Supabase Project Keys & Service Role Key bypassing RLS) |
| `efb69d9` | `feat: implement payment and shipping...` | `XENDIT_SECRET_KEY=xnd_development_gfArVs9EYuGp...`<br>`XENDIT_PUBLIC_KEY=xnd_public_development_EQnZ...`<br>`XENDIT_CALLBACK_TOKEN=xkbKSap87uKF...`<br>`BITESHIP_API_KEY=biteship_test.eyJhbGciOiJI...` | 🔴 **CRITICAL** (Xendit Sandbox API & Callback Token, Biteship Sandbox API Key) |
| `HEAD` (Active) | Current workspace status | All keys listed above are currently tracked in `.env` inside Git HEAD. | 🔴 **CRITICAL** (Active keys committed in the main repository index) |

---

## 2. Risk Assessment

### Supabase Service Role Keys
* **Exposed in:** `ec1ead3` and `d9286a9` (active).
* **Risk:** Extremely High. The service role key bypasses Row-Level Security (RLS) policies completely. Anyone with this key can read, write, or delete any data in the database, including admin logs, orders, and user credentials.

### Supabase Personal Access Token
* **Exposed in:** `d095c5e` and `ec1ead3`.
* **Risk:** Extremely High. A personal access token allows programmatic access to the entire Supabase account (creating projects, deleting databases, changing billing details, etc.).

### Xendit & Biteship API Keys
* **Exposed in:** `efb69d9` and onwards.
* **Risk:** High (Sandbox). While these are sandbox/development keys, exposing them is bad practice and allows malicious actors to trigger test webhooks or exhaust API limits.

---

## 3. Recommended Remediation Actions

### Action A: Revoke and Rotate All Exposed Credentials (Immediate)
Before the repository is made public, **all** exposed keys must be treated as compromised. You must rotate them immediately:
1. **Supabase Personal Access Token:** Go to Supabase Dashboard -> Account Settings -> Access Tokens, and delete the token ending in `9382018344`. Generate a new one if needed, but do not commit it.
2. **Supabase Project Keys (for both projects `wqihovirwfnmlpsophcp` and `iobwiajnzymniuxvxvdo`):** Rotate both the `anon` public key and the `service_role` private key in the Supabase Dashboard -> Project Settings -> API.
3. **Xendit Keys:** Go to Xendit Dashboard -> Developers -> API Keys, revoke the current keys (`xnd_development_gfArVs9EYu...`), and generate new keys.
4. **Biteship Keys:** Go to Biteship Dashboard -> Integration -> API Key, click regenerate/rotate to invalidate the active test API key.

### Action B: Untrack the `.env` File from Git
Run the following command locally to remove `.env` from tracking without deleting the file from your local disk:
```bash
git rm --cached .env
git commit -m "chore: remove .env from git tracking"
```
Ensure that `.env` remains in `.gitignore` so it is not accidentally recommitted.

### Action C: Rewrite Git History (Highly Recommended)
To completely delete the secrets from the repository's git commit history before publishing it, use `git-filter-repo` (recommended tool) or `BFG Repo-Cleaner` to purge `.env` from all past commits:

**Option 1: Using `git-filter-repo` (Safest and fastest):**
1. Install `git-filter-repo` (requires Python).
2. Run the following command in the repository root:
   ```bash
   git filter-repo --path .env --invert-paths
   ```
3. This will completely remove `.env` from every commit in the history.

**Option 2: Using `git filter-branch` (Standard git fallback):**
```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

*Note: History rewriting is a destructive action that requires force-pushing (`git push origin --force --all`). Ensure all collaborators are notified.*
