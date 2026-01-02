# Blend65 Development Guidelines

**Purpose:** Comprehensive development standards for the Blend65 multi-target 6502 compiler project

---

## Table of Contents

1. [Core Development Practices](#core-development-practices)
2. [Evolution-Driven Development](#evolution-driven-development)
3. [Package Management](#package-management)
4. [Code Quality Standards](#code-quality-standards)
5. [Testing Requirements](#testing-requirements)
6. [Architecture Principles](#architecture-principles)
7. [Communication Standards](#communication-standards)
8. [Automatic Documentation Updates](#automatic-documentation-updates)
9. [Git Workflow Automation](#git-workflow-automation)

---

## Core Development Practices

### Building and Testing
1. **Always use `yarn` instead of `npm`** for consistency with workspace setup
2. **Build verification before commits:** `yarn clean && yarn build && yarn test` from project root
3. **Incremental development:** Complete each task fully before moving to the next
4. **Real-world validation:** Test with realistic Blend65 programs, not just unit tests

### File and Folder Conventions
- **Package naming:** `@blend65/package-name` (kebab-case)
- **File naming:** `kebab-case.ts` for implementation files
- **Test files:** `*.test.ts` alongside source files in `__tests__/` directories
- **Type definitions:** `types.ts` for shared types, `index.ts` for package exports
- **Internal organization:** Group related functionality in subdirectories (e.g., `analyzers/`, `optimizers/`)

### Import/Export Patterns
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

---

## Evolution-Driven Development

### Mandatory Evolution Context Analysis

**Before starting ANY task**, always analyze the current state of Blend65 evolution:

1. **Consult Evolution Documents:**
   - `docs/research/BLEND65_EVOLUTION_ROADMAP.md` - Strategic development roadmap
   - `docs/research/BLEND65_MISSING_FEATURES_MATRIX.md` - Consolidated missing feature tracking

2. **Version Targeting:**
   - Identify which Blend65 version this task targets (v0.1, v0.2, v0.3, etc.)
   - Understand feature availability for target version
   - Consider forward compatibility with planned versions

3. **Missing Features Assessment:**
   - Identify if task reveals new missing features
   - Assess impact on existing game compatibility analysis
   - Document any newly discovered compatibility requirements

### Evolution Context Integration

**During Analysis and Planning:**
- Reference roadmap priorities when making design decisions
- Consider how implementation affects game compatibility percentages
- Align architectural choices with target version capabilities
- Identify opportunities to enable higher-version features

**During Implementation:**
- Design for evolution - avoid blocking future enhancements
- Consider performance implications for target 6502 platforms
- Document evolution impact in code comments and commit messages
- Test against real-world game requirements from analyzed repositories

**Key Evolution Principles:**
- **v0.1 Foundation:** Maintain stability of basic features for simple arcade games
- **Hardware API Evolution:** Prioritize hardware features that enable real C64 games
- **Language Feature Progression:** Add complexity only when proven necessary by game analysis
- **Game-Driven Requirements:** All new features must be justified by actual game needs

### Compatibility Impact Assessment

For every task, document:
- **Target Games Enabled:** Which analyzed games become portable
- **Version Milestone Progress:** How this contributes to version completion
- **Priority Validation:** Whether real games confirm feature importance
- **Evolution Alignment:** How this supports the strategic roadmap

---

## Package Management

### Package Creation Workflow
**Template:** Use `packages/parser/package.json` as the foundation for all new packages

**Essential Steps:**
1. **Create package skeleton** with proper `package.json`
2. **Follow scoped naming**: `@blend65/package-name`
3. **Use wildcard dependencies**: `"@blend65/dependency": "*"`
4. **Run `yarn install`** from project root after each package creation
5. **Verify build setup** before proceeding with implementation

### Required package.json Fields
```json
{
  "name": "@blend65/package-name",
  "version": "0.1.0",
  "description": "Clear description of package purpose",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsc",
    "clean": "rm -rf dist",
    "dev": "tsc --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@blend65/dependency": "*"
  }
}
```

**Critical:** Always run `yarn install` from project root after adding package skeletons to ensure proper workspace linking and dependency resolution.

---

## Code Quality Standards

### TypeScript Configuration
- **Strict mode required:** `"strict": true` in all tsconfig.json files
- **No implicit any:** Explicit type annotations for all public APIs
- **Comprehensive type exports:** Export all types that other packages might need

### Code Organization
- **Single responsibility:** Each class/function has one clear purpose
- **Descriptive naming:**
  - `parseVariableDeclaration()` not `parseVar()`
  - `SymbolTable` not `ST`
  - `SemanticError` not `SemErr`
- **JSDoc for public APIs:**
```typescript
/**
 * Analyzes AST for semantic correctness and builds symbol tables
 * @param ast The parsed AST to analyze
 * @param options Analysis configuration options
 * @returns Analysis result with errors and symbol information
 */
export class SemanticAnalyzer {
```

### Compiler-Specific Patterns
- **Visitor pattern for AST traversal**
- **Builder pattern for IL construction**
- **Strategy pattern for optimization passes**
- **Factory pattern for AST node creation**
- **Result types for operations that can fail:**
```typescript
type AnalysisResult<T> =
  | { success: true; data: T }
  | { success: false; errors: SemanticError[] }
```

---

## Testing Requirements

### Test Coverage Standards
- **Minimum 90% test coverage** for all new packages
- **100% coverage for critical paths** (error handling, type checking)
- **Test file organization:** Mirror source structure in `__tests__/` directories

### Test Categories
1. **Unit Tests** - Individual functions/classes in isolation
   ```typescript
   describe('SymbolTable', () => {
     it('should resolve variable in current scope', () => {
       // Test implementation
     })
   })
   ```

2. **Integration Tests** - Package boundaries and interactions
   ```typescript
   describe('Lexer → Parser Integration', () => {
     it('should parse valid Blend65 syntax', () => {
       // Test complete pipeline
     })
   })
   ```

3. **End-to-End Tests** - Complete compilation pipeline
   ```typescript
   describe('Full Compilation', () => {
     it('should compile Snake game to valid C64 assembly', () => {
       // Test realistic program
     })
   })
   ```

4. **Edge Case Tests** - Error conditions and boundary cases
   ```typescript
   describe('Error Handling', () => {
     it('should report clear error for undefined variable', () => {
       // Test error scenarios
     })
   })
   ```

### Test Quality Requirements
- **Descriptive test names:** Explain the scenario being tested
- **Arrange-Act-Assert pattern:** Clear test structure
- **No test interdependencies:** Each test runs independently
- **Realistic test data:** Use actual Blend65 code patterns

---

## Architecture Principles

### Separation of Concerns
- **Lexer:** Token recognition only, no semantic knowledge
- **Parser:** Syntax validation and AST construction
- **Semantic Analyzer:** Type checking, symbol resolution, validation
- **IL:** Optimization-friendly intermediate representation
- **Codegen:** Target-specific 6502 assembly generation

### Error Handling Philosophy
- **Fail fast with context:** Include source location information
- **User-friendly messages:** Clear, actionable error descriptions
- **Error recovery:** Continue analysis after non-fatal errors
- **Error chaining:** Preserve error context through compilation phases
- **Never fail silently:** Always report errors appropriately

### Performance Considerations
- **Memory consciousness:** Design for large source files
- **Compilation speed:** Profile and optimize critical paths
- **6502 awareness:** Consider target constraints in design decisions
- **Lazy evaluation:** Compute expensive analyses only when needed

### Compiler Design Patterns
- **Incremental compilation:** Support for partial recompilation
- **Cached analysis results:** Avoid redundant computation
- **Modular optimization passes:** Composable and configurable
- **Clean interfaces:** Well-defined boundaries between phases

---

## Communication Standards

### Plan Mode Requirements
When in PLAN MODE, **always end responses with these 4 questions:**

```
1. Do you understand?
2. Do you have any questions, if so place your questions with numbers so I can answer then easily?
3. Answer any questions in my answers to you first
4. What are your thoughts and recommendations
```

### Documentation Requirements
- **Architecture Decision Records (ADRs):** Document significant design choices
- **API documentation:** Examples for all public functions
- **Implementation notes:** Explain complex algorithms and compiler logic
- **README updates:** Keep package documentation current
- **Change logs:** Document breaking changes and major features

### Code Review Standards
- **Implementation follows task specification exactly**
- **All tests pass and coverage requirements met**
- **No TypeScript compilation errors or warnings**
- **Performance benchmarks within acceptable ranges**
- **Documentation updated for any API changes**

---

## Automatic Documentation Updates

### Evolution Document Maintenance

**At the end of each task**, always update the evolution documents:

1. **Missing Features Matrix Updates:**
   - Add any newly discovered missing features to `docs/research/BLEND65_MISSING_FEATURES_MATRIX.md`
   - Update status of any features that were implemented or changed
   - Recalculate priorities based on new game analysis or implementation insights
   - Update the "Requesting Games" column if new games require existing missing features

2. **Evolution Roadmap Updates:**
   - Append task results to `docs/research/BLEND65_EVOLUTION_ROADMAP.md`
   - Document any changes to version targeting or feature priorities
   - Record new game compatibility findings or implementation milestones
   - Update percentage estimates for version capabilities

3. **Game Compatibility Impact:**
   - Document which games become portable due to implemented features
   - Update compatibility matrices with new implementation status
   - Record performance implications for target platforms
   - Note any architectural decisions that affect future evolution

### Documentation Update Process

**For Feature Implementation Tasks:**
```markdown
## [Task Name] Evolution Impact

**Target Version:** v[X.Y]
**Games Enabled:** [List specific games that become portable]
**Missing Features Addressed:** [List features implemented or identified]
**Priority Changes:** [Document any priority adjustments]
**Next Steps:** [Identify follow-up requirements for evolution]
```

**For Analysis Tasks:**
```markdown
## [Game/Repository Name] Compatibility Analysis Update

**Portability Status:** [PORTABLE/PARTIAL/NOT_PORTABLE]
**Missing Features Discovered:** [List new gaps identified]
**Priority Adjustments:** [Document priority changes based on analysis]
**Version Requirements:** [Update version targeting based on findings]
```

### Evolution Document Synchronization

- **Keep matrices current** - Update within 24 hours of task completion
- **Maintain consistency** - Ensure roadmap and matrix align on priorities and timelines
- **Cross-reference validation** - Verify game references exist in both documents
- **Progress tracking** - Document incremental progress toward version milestones

---

## Git Workflow Automation

### Cline Commands
When the user provides these keywords, Cline should perform the following actions:

#### `gitcm` - Git Commit with Message
1. Stage all changes (`git add .`)
2. Create a detailed, descriptive commit message following format:
   ```
   feat(package): implement feature description

   - Specific change 1
   - Specific change 2
   - Tests added/updated
   ```
3. Commit the changes (`git commit -m "detailed message"`)

#### `gitcmp` - Git Commit, Rebase, and Push
1. Perform `gitcm` workflow (stage all changes and create detailed commit)
2. Pull and rebase if needed (`git pull --rebase`)
3. If there are no conflicts, push to remote (`git push`)
4. Report any conflicts for manual resolution

### Commit Message Standards
- **Type prefixes:** `feat:`, `fix:`, `docs:`, `test:`, `refactor:`
- **Package scope:** `feat(semantic): add symbol table implementation`
- **Descriptive summaries:** Explain what and why, not just what
- **Breaking changes:** Mark with `BREAKING CHANGE:` in commit body

---

## Development Workflow

### Task Execution
1. **Read task specification completely** before starting
2. **Consult evolution documents** - Review roadmap and missing features matrix
3. **Analyze version targeting** - Determine which Blend65 version this task affects
4. **Understand requirements and success criteria** with evolution context
5. **Implement core functionality as specified** while considering roadmap alignment
6. **Write comprehensive tests covering all scenarios**
7. **Validate against success criteria before proceeding**
8. **Document any architectural decisions** including evolution impact
9. **Update evolution documents** as required by Automatic Documentation Updates

### Quality Gates
- **All tests passing** before moving to next task
- **TypeScript compilation without errors**
- **Integration tests validating phase boundaries**
- **Performance benchmarks within acceptable range**
- **Code review checklist completed**

### Debugging Guidelines
- **Use TypeScript's strict type checking** to catch errors early
- **Add comprehensive logging** for compilation phases
- **Create minimal reproduction cases** for bugs
- **Use IL serialization** for optimization debugging
- **Profile compilation performance** regularly

---

**Note:** These guidelines evolve with the project. Update this file when new patterns emerge or requirements change.
