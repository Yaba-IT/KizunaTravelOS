# Security Policy

## Supported Versions

| Version | Supported           |
|---------|---------------------|
| 0.x     | ✅ Always patched   |
| < 0.x   | ❌ End-of-life      |

_The project is pre-1.0; all released tags are actively maintained until 1.0._

---

## Reporting a Vulnerability

1. **Do not open public issues or pull requests.**  
   Instead, email **security@yaba-it.be** with:
   * A short description of the issue.  
   * Steps to reproduce or a PoC exploit.  
   * The affected paths or components (`apps/erp-api`, `infra/helmfile`, …).  
   * Your contact information for follow-up.

2. We will acknowledge receipt within **48 hours** and provide an initial assessment within **5 working days**.

3. Once confirmed, we aim to release a fix or mitigation within **14 days**.  
   If a coordinated disclosure date is needed, we will agree on it with you.

4. Credit is given in the release notes **unless you request anonymity**.

---

## Scope

*Any code inside this repository* is in scope, including:

* Node/Express (`apps/erp-api`)  
* Accounting service (`apps/accounting-svc`)  
* Strapi CMS (`apps/cms`)  
* React SPA (`apps/web`)  
* Terraform / Helm / Argo CD manifests (`infra/`)  

Third-party dependencies bundled via npm, Yarn, Poetry or Docker images are **out of scope**, but you’re welcome to report them if they impact bundled code.

---

## No Bug-Bounty Program (Yet)

We currently do **not** run a paid bug-bounty scheme.  
Your responsible disclosure is, however, greatly appreciated and will be publicly acknowledged.

---

Thank you for helping keep KizunaTravelOS and its users safe!  
