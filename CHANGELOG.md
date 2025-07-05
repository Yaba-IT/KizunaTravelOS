# Changelog

All notable changes to **KizunaTravelOS** are documented here.  
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) + [Conventional Commits](https://www.conventionalcommits.org/).

---

## [Unreleased]

### Added
- _(Placeholder)_ Add upcoming features here.

### Changed
- _(Placeholder)_ List behaviour changes here.

### Fixed
- _(Placeholder)_ List bug fixes here.

---

## [0.1.0] — 2025-07-05

### Added
- **Monorepo skeleton**
  - `apps/erp-api` – Express + Mongo core API with Jest/Mocha tests and Helm chart.
  - `apps/accounting-svc` – Node + TypeORM + PostgreSQL micro-service, isolated migrations, Helm chart.
  - `apps/cms` – Strapi project with Dockerfile and Helm chart.
  - `apps/web` – React 18 + Vite SPA, Netlify config, optional in-cluster Dockerfile.
- **Shared packages**
  - `packages/common-utils`, `packages/auth-sdk`, `packages/ui-kit` with Storybook.
- **Infrastructure-as-Code**
  - `infra/terraform` (base + variables).
  - `infra/k8s-bases` (base namespace & overlays).
  - `infra/helmfile.yaml` and Argo CD app manifests.
- **Tooling & scripts**
  - Helper CLI scripts: `scripts/dev-up.sh`, `seed-db.js`, `backup.sh`.
  - Root `docker-compose.yml` for local stack.
  - Language-pin file `.tool-versions`.
- **Docs**
  - `docs/architecture.md`, ADR folder, runbooks (`deploy.md`, `on-call.md`).
- **CI/CD automation**
  - GitHub workflows: backend, frontend, and Argo CD deploy.
  - Issue templates for bugs and feature requests.
  - Code of Conduct, Security policy, Contributors guide.
  - MIT `LICENSE` file, `.gitignore`, and initial `CHANGELOG.md`.

### Changed
- _Initial release—no break-changes._

### Fixed
- _Nothing fixed; first release._

---

[Unreleased]: https://github.com/Yaba-IT/KizunaTravelOS/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Yaba-IT/KizunaTravelOS/releases/tag/v0.1.0
