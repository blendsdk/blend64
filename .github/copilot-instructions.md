# Blend65 Development Guide

Blend65 is a modern programming language that compiles to 6502 machine code, designed for C64 game development. **This is an early-stage project** - only lexer/parser work, no code generation yet.

## Project Architecture

**Monorepo Structure (Yarn Workspaces + Turbo):**
- `packages/lexer/` - Tokenizes Blend65 source (lexical analysis)
- `packages/parser/` - Builds AST from tokens (recursive descent parser)
- `packages/ast/` - AST node type definitions and factory functions
- `docs/` - Language spec, implementation plans, game analysis research
- `scripts/lockstep.ts` - Custom monorepo versioning/publishing tool

**Key architectural pattern:** All packages export clean public APIs through `index.ts`. Use `@blend65/lexer`, `@blend65/parser`, `@blend65/ast` imports.

**Dependency flow:** `lexer` (no deps) → `ast` (depends on lexer) → `parser` (depends on lexer + ast)

## Development Workflows

### Essential Commands
```bash
# Always use yarn (not npm)
yarn clean && yarn build && yarn test  # Full verification
yarn dev                               # Watch mode for all packages
yarn test:watch                        # Interactive test runner
yarn lockstep version --type patch     # Bump versions in lockstep
yarn lockstep publish --tag latest     # Publish to npm
```

### Build System (Turbo)
- Turbo caches builds based on `turbo.json` task definitions
- Tasks respect `dependsOn: ["^build"]` for dependency order
- Run `yarn clean` before commits to verify clean builds

### Testing (Vitest)
- Tests live in `__tests__/` directories alongside source
- Use `describe()` blocks to group related tests
- Test files: `*.test.ts` or `*.spec.ts`
- Coverage reports in `coverage/` (excluded from git)

## Evolution-Driven Development

**CRITICAL:** Before any task, consult evolution context:
- `docs/research/BLEND65_EVOLUTION_ROADMAP.md` - Strategic roadmap
- `docs/research/BLEND65_MISSING_FEATURES_MATRIX.md` - Feature tracking
- `docs/BLEND65_LANGUAGE_SPECIFICATION.md` - Language reference

**Version Targeting:**
- v0.1: Basic features (variables, functions, control flow, simple hardware APIs)
- v0.2: Enhanced control (break/continue, match/case, enums) - **current target**
- v0.3+: Advanced features (interrupts, inline assembly, hardware collision)

**Game-Driven Requirements:** All features must be justified by real C64 game analysis (see `docs/research/games/`). When adding features, document which games/patterns they enable.

## Language Conventions

**Blend65 Syntax (Pascal-like):**
```js
module game.sprite

import setSpritePosition from c64.sprites

var score: word = 0
zp var counter: byte  // Zero page storage class

function updateScore(points: byte): void
    score = score + points
end function

// v0.2 features (not yet implemented)
enum Direction
    UP = 0, DOWN = 1, LEFT = 2, RIGHT = 3
end enum
```

**Storage classes:** `zp`, `ram`, `data`, `const`, `io` (6502-specific memory placement)

**Type system:** `byte`, `word`, `boolean`, `void`, arrays (`byte[256]`), records

## Code Quality Standards

### File Naming
- Implementation: `kebab-case.ts` (e.g., `blend65-lexer.ts`)
- Tests: `*.test.ts` in `__tests__/` directories
- Types: `types.ts` for shared types, `index.ts` for exports

### Import/Export Pattern
```typescript
// External dependencies first
import { TokenType } from '@blend65/lexer'

// Internal imports second
import { BaseParser } from '../core/base-parser'
import { ASTNode } from './types'

// Export clean public APIs
export { SemanticAnalyzer } from './semantic-analyzer'
export type { SymbolTable, SemanticError } from './types'
```

### AST Node Pattern
All AST nodes extend `Blend65ASTNode` with `kind`, `loc`, and `metadata`:
```typescript
export interface VariableDeclaration extends Blend65ASTNode {
    kind: 'VariableDeclaration'
    storageClass?: StorageClass  // zp, ram, data, const, io
    identifier: Identifier
    typeAnnotation: TypeAnnotation
    initializer?: Expression
}
```

## Lockstep Versioning System

**What it does:** All packages maintain the same version (e.g., all at `0.1.0`)

**Version bump:**
```bash
yarn lockstep version --type patch|minor|major  # Manual
yarn lockstep version --type auto               # Auto-detect from commits
yarn lockstep version --type patch --ci         # Add [skip ci] to commit
```

**Publish (topological order):**
```bash
yarn lockstep publish --tag latest --git-push  # Publish + push tags
yarn lockstep publish --tag next --dry         # Dry run
```

**Conventional Commits:** `feat:` → minor, `fix:` → patch, `BREAKING CHANGE` → major

## Parser Implementation Details

**Recursive Descent Strategy:**
- Base class: `RecursiveDescentParser<T>` extends `BaseParser<T>`
- Main parser: `Blend65Parser` extends `RecursiveDescentParser<Program>`
- Token stream: `TokenStream` class wraps token array with lookahead

**Common parsing methods:**
- `current()` - Current token
- `peek(n)` - Look ahead n tokens
- `consume(type)` - Match token type or error
- `expectKeyword(keyword)` - Match specific keyword
- `parseExpression()` - Parse expressions with precedence climbing

## Integration with Game Analysis

When analyzing games with `gamecheck` command (from `.clinerules/evolution-check.md`):
1. Clone game repo to `temp/` directory
2. Analyze assembly patterns, memory layout, hardware usage
3. Document missing Blend65 features in `docs/research/games/`
4. Update `BLEND65_MISSING_FEATURES_MATRIX.md` with findings
5. Prioritize features based on real game requirements

## Common Pitfalls

❌ **Don't use npm** - Always use yarn (lockfile conflicts)
❌ **Don't assume v0.2 features exist** - Check language spec for current version
❌ **Don't skip evolution analysis** - Features must align with roadmap
❌ **Don't mix tabs/spaces** - Use 2-space indentation (prettier enforced)
❌ **Don't create backend code yet** - Frontend only (lexer/parser/AST)

## Key Documentation

- **Language Spec:** `docs/BLEND65_LANGUAGE_SPECIFICATION.md` (1608 lines, comprehensive grammar)
- **Implementation Plan:** `docs/implementation-plan/BLEND65_V02_IMPLEMENTATION_PLAN.md`
- **Evolution Roadmap:** `docs/research/BLEND65_EVOLUTION_ROADMAP.md` (Elite compatibility analysis)
- **Existing Rules:** `.clinerules/common.md` (412 lines, detailed standards)

## Quick Reference

**Parse Blend65 code:**
```typescript
import { tokenize } from '@blend65/lexer'
import { Blend65Parser } from '@blend65/parser'

const tokens = tokenize(source)
const parser = new Blend65Parser(tokens)
const ast = parser.parse()
```

**Run tests for specific package:**
```bash
cd packages/lexer && yarn test
cd packages/parser && yarn test:watch
```

**Check compilation without code generation:**
```bash
yarn build          # Build all packages
yarn type-check     # TypeScript validation only
```
