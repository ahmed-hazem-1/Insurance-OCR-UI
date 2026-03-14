# Contributing to Document OCR Parser

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Welcome diverse perspectives
- Focus on the code, not the person
- Help maintain a positive community

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Git

### Setup Development Environment

1. **Fork the repository**
   ```bash
   # On GitHub, click the "Fork" button
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/yourusername/Insurance-api.git
   cd Insurance-api/frontend
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/original/Insurance-api.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Linting & Type Checking

```bash
npm run lint
```

This runs TypeScript type checking with strict mode enabled.

### Building for Production

```bash
npm run build
```

Creates optimized build in the `dist/` directory.

## Code Style

- Follow the existing code style
- Use TypeScript for type safety (strict mode enabled)
- Use functional components with hooks
- Use Tailwind CSS for styling
- Keep components small and focused

### File Organization

```
src/
├── components/     # Reusable React components
├── types/          # TypeScript interfaces and types
├── utils/          # Utility functions
├── App.tsx         # Main app component
├── main.tsx        # Entry point
└── index.css       # Global styles
```

## Making Changes

### Before You Start

1. Check if there's an existing issue for your feature/bug
2. Comment on the issue to let others know you're working on it
3. Create a new issue if one doesn't exist

### Commit Guidelines

```bash
# Make small, focused commits
git commit -m "type(scope): brief description

Longer explanation of the changes if needed.

Fix #123"
```

**Commit types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code style (formatting, missing semicolons, etc.)
- `refactor:` Code refactoring
- `perf:` Performance improvement
- `test:` Adding or updating tests
- `chore:` Build, CI/CD, dependencies

### Testing

Before submitting:

```bash
# Run linter
npm run lint

# Build to check for errors
npm run build

# Test in development
npm run dev
```

## Submitting Changes

### Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### Create a Pull Request

1. Go to GitHub and create a Pull Request
2. Use a descriptive title
3. Fill in the PR template
4. Reference related issues

**PR Title Format:**
```
type(scope): brief description

Example:
feat(document-type): add support for pharmacy receipts
fix(ui): fix null reference in items table
```

### PR Checklist

- [ ] Branch is up to date with `develop`
- [ ] Code follows project style
- [ ] TypeScript has no errors (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Commits are clean and well-documented
- [ ] PR description explains the changes
- [ ] Related issues are referenced
- [ ] No sensitive data committed

## Review Process

1. **Automated checks**
   - GitHub Actions CI runs linting and build
   - All checks must pass

2. **Code review**
   - At least one maintainer reviews
   - Feedback may be requested
   - Discussion on approach/implementation

3. **Approval and merge**
   - Approved PRs are merged to `develop`
   - Periodic releases merge `develop` to `main`

## Reporting Bugs

### Bug Report Template

```markdown
**Describe the bug**
Clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to...
2. Click...
3. Error appears...

**Expected behavior**
What you expected to happen.

**Actual behavior**
What actually happened.

**Environment**
- OS: [e.g., Windows 10, macOS]
- Browser: [e.g., Chrome 120]
- Node version: [e.g., 20.x]

**Screenshots**
If applicable, add screenshots.

**Additional context**
Any other context about the problem.
```

## Requesting Features

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Describe the problem or use case.

**Describe the solution you'd like**
Clear description of what you want to happen.

**Describe alternatives you've considered**
Other solutions or features you've considered.

**Additional context**
Any other context or screenshots.
```

## Documentation

### Updating Documentation

1. Update relevant files in the project root
2. Use clear, concise language
3. Include code examples where helpful
4. Link to related documentation

### Key Documentation Files

- `README.md` - Project overview and quick start
- `DEPLOYMENT.md` - Deployment instructions
- `FRONTEND_UPDATES.md` - Frontend changes and features
- `.github/workflows/*.yml` - CI/CD configuration

## Project Structure

```
Insurance-api/frontend/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                 # Build & test workflow
│   │   └── deploy-pages.yml       # GitHub Pages deploy
│   └── dependabot.yml             # Dependency updates
├── src/
│   ├── App.tsx                    # Main app component
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Styles
├── Dockerfile                     # Docker image
├── docker-compose.yml             # Docker Compose config
├── vite.config.ts                 # Vite configuration
├── tsconfig.json                  # TypeScript config
├── package.json                   # Dependencies
├── README.md                       # Project README
├── DEPLOYMENT.md                  # Deployment guide
└── CONTRIBUTING.md                # This file
```

## Questions?

- Open a GitHub Discussion
- Check existing issues and PRs
- Reach out to maintainers

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to make Document OCR Parser better! 🚀
