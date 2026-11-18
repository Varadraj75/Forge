# Contributing to Forge

Thank you for your interest in contributing to **Forge**! This project is participating in **IEEE IGDTUW Open Source Week 10.0 (Nov 13–19, 2026)**.

---

## ‼️ Important Contributor Guidelines

> **Please start working on an issue only after it has been officially assigned to you by the respective mentor.**
> This helps avoid duplicate efforts, prevents merge conflicts, and ensures fair opportunities for everyone in the program.

---

## 🛠️ Local Development Setup

### Prerequisites
- Node.js `18.17+` or `20.x`
- npm `9+`

### Setup Instructions
1. Fork the repository and clone your fork:
   ```bash
   git clone https://github.com/<your-username>/Forge.git
   cd Forge
   ```
2. Set up the upstream remote:
   ```bash
   git remote add upstream https://github.com/Varadraj75/Forge.git
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the local development server:
   ```bash
   npm run dev
   # Open http://localhost:3000
   ```

---

## 🧪 Testing & Quality Gates

Every pull request must pass the automated quality gates before it can be merged:

```bash
# 1. Typecheck
npx tsc --noEmit

# 2. Linting (ESLint)
npm run lint

# 3. Automated Unit & Integration Tests (Vitest)
npm test

# 4. Production Next.js Build
npm run build
```

---

## 🌿 Branch & Commit Conventions

- Create a feature branch with a descriptive name:
  ```bash
  git checkout -b feat/your-feature-name
  # or fix/your-bugfix-name
  ```
- Follow [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat(...)`: New features or enhancements
  - `fix(...)`: Bug fixes
  - `test(...)`: Adding or updating tests
  - `docs(...)`: Documentation changes
  - `refactor(...)`: Code refactoring without behavior change

---

## 📬 Pull Request Submission Checklist

When opening a Pull Request:
- [ ] Link the officially assigned issue number (e.g., `Fixes #123`).
- [ ] Ensure all 4 quality checks (`tsc`, `lint`, `test`, `build`) pass locally with zero warnings and zero errors.
- [ ] Provide clear before/after context or reproduction steps in the PR description.
- [ ] Be respectful and collaborative in code reviews.
