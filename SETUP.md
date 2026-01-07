# Blaze Minimal Library - Setup & Installation Guide

A minimal, lightweight backend library providing core abstractions and types for building efficient web services with TypeScript.

## Table of Contents
- [Local Setup for Development](#local-setup-for-development)
- [Forking & Contributing](#forking--contributing)
- [Installation](#installation)
- [Local vs NPM Resolution](#local-vs-npm-resolution)

## Local Setup for Development

### Prerequisites
- Bun 1.0+ (recommended)
- Node.js 18+ (alternative)
- TypeScript 5.0+
- Git

### Initial Setup

1. **Clone the monorepo:**
   ```bash
   git clone <your-repo-url>
   cd diplomna-repo/main/project
   ```

2. **Install dependencies with Bun:**
   ```bash
   bun install
   ```

   Or with npm:
   ```bash
   npm install
   ```

3. **Navigate to the package:**
   ```bash
   cd apps/backend-framework/core/blaze-minimal-lib
   ```

4. **Build the library:**
   ```bash
   bun run build
   ```

### Development Workflow

- **Run tests:**
  ```bash
  bun test
  # or with watch mode
  bun test --watch
  ```

- **Type checking:**
  ```bash
  bun run tsc --noEmit
  ```

- **Linting & fixing:**
  ```bash
  bun run lint:fix
  ```

- **Watch mode for development:**
  ```bash
  bun run build --watch
  ```

### File Structure
```
blaze-minimal-lib/
├── src/                          # Source files
│   ├── types/                    # Core type definitions
│   ├── utils/                    # Utility functions
│   └── index.ts                  # Main entry point
├── examples/                     # Usage examples
├── tests/                        # Test files
├── index.ts                      # Entry point
├── package.json
├── tsconfig.json
└── README.md
```

## Forking & Contributing

### Fork the Repository

1. **Click "Fork" on GitHub** to create your own copy

2. **Clone your fork locally:**
   ```bash
   git clone https://github.com/YOUR-USERNAME/diplomna-repo.git
   cd diplomna-repo/main/project
   ```

3. **Add upstream remote:**
   ```bash
   git remote add upstream https://github.com/ORIGINAL-OWNER/diplomna-repo.git
   ```

4. **Keep your fork updated:**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

### Making Changes

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** in the `apps/backend-framework/core/blaze-minimal-lib/src/` directory

3. **Test your changes:**
   ```bash
   npm test
   ```

4. **Commit and push:**
   ```bash
   git add .
   git commit -m "feat: describe your changes"
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request** on GitHub

## Installation

### Option 1: From NPM (Production)

Install as a dependency in your project:

```bash
npm install @blazyts/blaze-minimal-lib
```

### Option 2: From Local Workspace (Development)

When working in the monorepo, the package is automatically available to other workspace packages using workspace protocol:

```json
{
  "devDependencies": {
    "@blazyts/backend-lib": "workspace:*"
  }
}
```

This is already configured in dependent packages within the monorepo.

### Option 3: From Git (Custom Branch)

Install directly from a Git branch:

```bash
npm install https://github.com/YOUR-USERNAME/diplomna-repo.git#main
```

Or with a specific branch:

```bash
npm install https://github.com/YOUR-USERNAME/diplomna-repo.git#feature/your-feature-name
```

## Local vs NPM Resolution

### When to Use Local Resolution

**Use workspace protocol (`workspace:*`)** when:
- 🔧 Developing the library locally
- 🔗 Testing changes across multiple packages
- 🚀 Building features within the monorepo
- ⚡ Using Bun for faster development iteration

**Configuration in dependent package's `package.json`:**
```json
{
  "devDependencies": {
    "@blazyts/backend-lib": "workspace:*"
  }
}
```

### When to Use NPM Resolution

**Use NPM package** when:
- 📦 Publishing to production
- 🌐 Using the library in external projects
- 🔒 Requiring a stable, published version
- 📍 Version pinning is important

**Installation:**
```bash
npm install @blazyts/blaze-minimal-lib@^1.0.0
```

### Configuration for Both

To support both local and NPM resolution:

1. **In the library's `package.json`:**
   - Ensure version is set: `"version": "1.0.0"`
   - Include build script

2. **Build for NPM before publishing:**
   ```bash
   cd apps/backend-framework/core/blaze-minimal-lib
   npm run build
   npm publish
   ```

3. **Use in other projects:**
   - **Local (monorepo):** `"@blazyts/backend-lib": "workspace:*"`
   - **External:** `"@blazyts/blaze-minimal-lib": "^1.0.0"`

## Core Concepts

This minimal library provides:
- Lightweight abstractions for common patterns
- Type-safe utilities for backend development
- Minimal dependencies for bundle size
- Essential building blocks for web services

## Troubleshooting

### Import errors in editor
- Make sure you've run `npm install` in the monorepo root
- Check that TypeScript language server has reloaded (reload VS Code window)

### Build fails
- Clear node_modules and reinstall: `rm -rf node_modules && bun install`
- Check Bun version: `bun --version` (should be 1.0+)

### Tests failing
```bash
# Clean and reinstall
npm ci
# Run tests with verbose output
npm test -- --reporter=verbose
```

### Dependency resolution issues
- Ensure workspace protocol is correctly specified in dependent packages
- Run `npm install` from the monorepo root directory
- Check for circular dependencies in imports

## Next Steps

- Read [README.md](./README.md) for features and usage
- Check [examples/](./examples/) directory for patterns
- Review test files in [tests/](./tests/) to understand behavior
- Explore [project-management.md](./project-management.md) for development roadmap
