# Blend65 Source File Size Management System

**Purpose:** File size management to ensure optimal AI processing efficiency while maintaining code quality and architectural coherence

---

## Critical File Size Requirements

### **🚨 MANDATORY FILE SIZE LIMITS**

#### Hard Limits by File Type

| File Type | Maximum Lines | Maximum Tokens | Rationale |
|-----------|---------------|----------------|-----------|
| **Core Parser Files** | 400 lines | 15,000 tokens | Complex parsing logic needs focus |
| **Analyzer Components** | 350 lines | 12,000 tokens | Semantic analysis requires clarity |
| **Pattern/Optimization** | 300 lines | 10,000 tokens | Complex algorithms need decomposition |
| **AST Node Files** | 250 lines | 8,000 tokens | Data structures should be simple |
| **Type System Files** | 300 lines | 10,000 tokens | Type logic needs focused modules |
| **Test Files** | 500 lines | 18,000 tokens | Tests can be longer but still manageable |
| **Utility/Helper Files** | 200 lines | 7,000 tokens | Utilities should be focused |
| **Index/Export Files** | 100 lines | 3,000 tokens | Simple re-export organization |

#### Emergency Limits (Never Exceed)

| File Type | Emergency Limit | Action Required |
|-----------|-----------------|-----------------|
| **Any Source File** | 600 lines | **IMMEDIATE SPLITTING REQUIRED** |
| **Any Source File** | 20,000 tokens | **IMMEDIATE SPLITTING REQUIRED** |
| **Parser Files** | 500 lines | **CRITICAL - SPLIT WITHIN 24 HOURS** |
| **Analyzer Files** | 450 lines | **CRITICAL - SPLIT WITHIN 24 HOURS** |

### **Quality Impact Thresholds**

| Lines | Impact Level | Required Action |
|-------|--------------|-----------------|
| **200+ lines** | ⚠️ **WARNING** | Consider splitting if logical boundaries exist |
| **300+ lines** | 🚨 **CRITICAL** | Plan splitting strategy within 48 hours |
| **400+ lines** | 💥 **EMERGENCY** | IMMEDIATE splitting required - stop other work |
| **500+ lines** | ⛔ **BLOCKED** | File cannot be processed efficiently - split NOW |

### **Static Import Requirement**

**ABSOLUTELY NO DYNAMIC IMPORTS**: All file splitting must use static imports at module level
- ✅ **Correct**: `import { Parser } from './parser.js'` (at top of file)
- ❌ **Forbidden**: `const Parser = await import('./parser.js')` (dynamic import)

---

## Smart Splitting Strategies

### **Strategy 1: Parser Decomposition Pattern**

**Current Problem:** Monolithic parser files (700+ lines)
**Solution:** Category-based decomposition

```typescript
// BEFORE: blend65-parser.ts (700+ lines)
export class Blend65Parser extends RecursiveDescentParser<Program> {
  // ALL parsing logic in one file
}

// AFTER: Decomposed structure
// packages/parser/src/blend65/
├── blend65-parser.ts           (< 200 lines) - Main coordinator
├── declaration-parser.ts       (< 300 lines) - Variable, function, enum declarations
├── statement-parser.ts         (< 300 lines) - If, while, for, match statements
├── expression-parser.ts        (< 300 lines) - All expression parsing
├── type-parser.ts              (< 200 lines) - Type annotation parsing
└── module-parser.ts            (< 200 lines) - Import/export parsing
```

**Implementation Pattern:**
```typescript
// Static imports at module level - NO dynamic imports
import { DeclarationParser } from './declaration-parser.js';
import { StatementParser } from './statement-parser.js';
import { ExpressionParser } from './expression-parser.js';

// Main parser becomes coordinator
export class Blend65Parser extends RecursiveDescentParser<Program> {
  private declarationParser: DeclarationParser;
  private statementParser: StatementParser;
  private expressionParser: ExpressionParser;

  constructor(tokens: Token[], options: ParserOptions = {}) {
    super(tokens, options);

    // Inject shared infrastructure
    this.declarationParser = new DeclarationParser(this.factory, this.getSharedContext());
    this.statementParser = new StatementParser(this.factory, this.getSharedContext());
    this.expressionParser = new ExpressionParser(this.factory, this.getSharedContext());
  }

  parse(): Program {
    // Delegate to specialized parsers
    const module = this.moduleParser.parseModuleDeclaration();
    const imports = this.moduleParser.parseImports();
    const exports = this.moduleParser.parseExports();
    const body = this.declarationParser.parseDeclarations();

    return this.factory.createProgram(module, imports, exports, body);
  }
}
```

### **Strategy 2: Analyzer Modularization Pattern**

**Current Problem:** Comprehensive analyzers (600+ lines)
**Solution:** Phase-based decomposition

```typescript
// BEFORE: semantic-analyzer.ts (650+ lines)
export class SemanticAnalyzer {
  // ALL semantic analysis in one file
}

// AFTER: Decomposed structure
// packages/semantic/src/
├── semantic-analyzer.ts        (< 200 lines) - Main coordinator
├── phases/
│   ├── symbol-resolution.ts   (< 250 lines) - Symbol table phase
│   ├── type-validation.ts     (< 250 lines) - Type checking phase
│   ├── dependency-analysis.ts (< 250 lines) - Module dependency phase
│   └── optimization-prep.ts   (< 250 lines) - Optimization metadata phase
└── shared/
    ├── analysis-context.ts     (< 150 lines) - Shared analysis state
    └── error-collector.ts      (< 150 lines) - Error aggregation
```

---

## Architecture Decomposition Patterns

### **Pattern A: Layered Decomposition**

**Use For:** Complex systems with clear architectural layers
**File Organization:**
```
├── core/              (< 200 lines each) - Core abstractions
├── interfaces/        (< 100 lines each) - Pure interfaces
├── implementations/   (< 250 lines each) - Concrete implementations
├── coordinators/      (< 200 lines each) - System coordination
└── utilities/         (< 150 lines each) - Shared utilities
```

### **Pattern B: Feature Decomposition**

**Use For:** Components with distinct feature sets
**File Organization:**
```
├── feature-coordinator.ts    (< 200 lines) - Main feature API
├── sub-features/
│   ├── feature-a.ts         (< 250 lines) - Complete feature A
│   ├── feature-b.ts         (< 250 lines) - Complete feature B
│   └── feature-c.ts         (< 250 lines) - Complete feature C
└── shared/
    ├── feature-types.ts     (< 150 lines) - Shared types
    └── feature-utils.ts     (< 150 lines) - Shared utilities
```

### **Pattern C: Phase Decomposition**

**Use For:** Pipeline-oriented systems with sequential phases
**File Organization:**
```
├── pipeline-coordinator.ts   (< 200 lines) - Pipeline execution
├── phases/
│   ├── phase-1-preparation.ts  (< 250 lines) - First phase
│   ├── phase-2-analysis.ts     (< 250 lines) - Second phase
│   ├── phase-3-transformation.ts (< 250 lines) - Third phase
│   └── phase-4-finalization.ts (< 250 lines) - Final phase
└── shared/
    ├── phase-types.ts       (< 150 lines) - Phase interfaces
    └── phase-utilities.ts   (< 150 lines) - Phase helpers
```

---

## Refactoring Protocols

### **Protocol 1: Safe Parser Splitting**

**When to Use:** Parser files > 350 lines
**Step-by-Step Process:**

1. **Analysis Phase (Day 1)**
   - Identify logical boundaries (declarations, statements, expressions)
   - Plan shared infrastructure (factory, context, error handling)
   - Design coordinator pattern

2. **Implementation Phase (Day 2-3)**
   - Create shared context
   - Extract first category (declarations)
   - Update main parser to delegate
   - Test extracted functionality

3. **Validation Phase (Day 4)**
   ```bash
   yarn test packages/parser
   yarn validate-file-sizes
   yarn test:integration
   ```

4. **Iteration Phase (Day 5+)**
   - Extract remaining categories (statements, expressions, etc.)
   - Repeat until all categories extracted
   - Final coordinator cleanup

### **Protocol 2: Safe Analyzer Splitting**

**When to Use:** Analyzer files > 300 lines
**Step-by-Step Process:**

1. **Dependency Analysis (Day 1)**
   - Map analyzer dependencies
   - Identify analysis phases (symbol resolution, type checking, optimization prep)
   - Design phase interfaces

2. **Pipeline Implementation (Day 2-3)**
   - Define phase interfaces
   - Extract first phase
   - Create pipeline coordinator
   - Update main analyzer

3. **Integration Testing (Day 4)**
   ```bash
   yarn test packages/semantic/src/phases
   yarn test packages/semantic/src/coordinators
   yarn test packages/semantic
   ```

### **Protocol 3: Emergency Splitting Procedure**

**When to Use:** Files > 500 lines (EMERGENCY)
**Immediate Actions Required:**

1. **STOP ALL OTHER WORK** - File size is blocking AI processing
2. **Immediate Assessment** (< 2 hours)
   ```bash
   find packages -name "*.ts" -exec wc -l {} + | sort -n | tail -10
   ```

3. **Quick & Dirty Splitting** (< 4 hours)
   - Identify 2-3 largest logical sections
   - Move to separate files with minimal refactoring
   - Ensure basic functionality works

4. **Emergency Validation** (< 1 hour)
   ```bash
   yarn build && yarn test --passWithNoTests
   ```

5. **Schedule Proper Refactoring** (Within 48 hours)
   - Plan proper architectural decomposition
   - Follow appropriate splitting protocol
   - Implement quality improvements

---

## Component-Specific Guidelines

### **Parser Component Guidelines**

**File Organization Rules:**
```
packages/parser/src/
├── blend65/                    (Main parser implementation)
│   ├── blend65-parser.ts       (< 200 lines) - Coordinator only
│   ├── declaration-parser.ts   (< 300 lines) - All declarations
│   ├── statement-parser.ts     (< 300 lines) - All statements
│   ├── expression-parser.ts    (< 300 lines) - All expressions
│   └── type-parser.ts          (< 200 lines) - Type annotations
├── core/                       (Shared infrastructure)
│   ├── base-parser.ts          (< 200 lines) - Abstract base
│   ├── error.ts                (< 150 lines) - Error handling
│   └── token-stream.ts         (< 200 lines) - Token management
└── shared/                     (Cross-parser utilities)
    ├── parser-context.ts       (< 150 lines) - Shared state
    └── validation-helpers.ts   (< 150 lines) - Common validations
```

**Splitting Triggers:**
- **250+ lines**: Consider splitting by language construct category
- **300+ lines**: Plan splitting within 48 hours
- **350+ lines**: IMMEDIATE splitting required

### **Semantic Analyzer Guidelines**

**File Organization Rules:**
```
packages/semantic/src/
├── semantic-analyzer.ts        (< 200 lines) - Main coordinator
├── phases/                     (Analysis phases)
│   ├── symbol-resolution.ts    (< 250 lines) - Symbol tables
│   ├── type-validation.ts      (< 250 lines) - Type checking
│   ├── dependency-analysis.ts  (< 250 lines) - Module deps
│   └── optimization-prep.ts    (< 250 lines) - Optimization metadata
├── analyzers/                  (Specialized analyzers)
│   ├── variable-analyzer.ts    (< 200 lines) - Variable analysis
│   ├── function-analyzer.ts    (< 200 lines) - Function analysis
│   ├── expression-analyzer.ts  (< 250 lines) - Expression analysis
│   └── module-analyzer.ts      (< 200 lines) - Module analysis
└── shared/                     (Shared utilities)
    ├── analysis-context.ts     (< 150 lines) - Shared state
    ├── error-collector.ts      (< 150 lines) - Error management
    └── optimization-types.ts   (< 200 lines) - Optimization interfaces
```

**Splitting Triggers:**
- **200+ lines**: Consider phase/concern separation
- **250+ lines**: Plan splitting within 48 hours
- **300+ lines**: IMMEDIATE splitting required

### **AST Component Guidelines**

**File Organization Rules:**
```
packages/ast/src/
├── ast-factory.ts              (< 200 lines) - Node creation
├── index.ts                    (< 100 lines) - Public exports
├── ast-types/                  (Type definitions)
│   ├── core.ts                 (< 250 lines) - Core interfaces
│   ├── expressions.ts          (< 200 lines) - Expression types
│   ├── statements.ts           (< 200 lines) - Statement types
│   ├── declarations.ts         (< 200 lines) - Declaration types
│   └── types.ts                (< 150 lines) - Type annotation types
└── utilities/                  (AST utilities)
    ├── ast-walker.ts           (< 200 lines) - Tree traversal
    ├── ast-visitor.ts          (< 200 lines) - Visitor pattern
    └── ast-helpers.ts          (< 150 lines) - Common operations
```

**Splitting Triggers:**
- **200+ lines**: Consider type category separation
- **250+ lines**: IMMEDIATE splitting required

---

## Automated Validation Guidelines

### **Pre-Commit Validation Script**

```typescript
// scripts/validate-file-sizes.ts
export interface FileSizeRule {
  pattern: string;
  maxLines: number;
  maxTokens: number;
  fileType: string;
}

const FILE_SIZE_RULES: FileSizeRule[] = [
  { pattern: '**/parser/**/*.ts', maxLines: 400, maxTokens: 15000, fileType: 'Parser' },
  { pattern: '**/semantic/**/*.ts', maxLines: 350, maxTokens: 12000, fileType: 'Analyzer' },
  { pattern: '**/optimization-patterns/**/*.ts', maxLines: 300, maxTokens: 10000, fileType: 'Pattern' },
  { pattern: '**/ast/**/*.ts', maxLines: 250, maxTokens: 8000, fileType: 'AST' },
  { pattern: '**/*.test.ts', maxLines: 500, maxTokens: 18000, fileType: 'Test' },
  { pattern: '**/*.ts', maxLines: 300, maxTokens: 10000, fileType: 'Default' }
];

export function validateFileSizes(): ValidationResult {
  const violations: FileSizeViolation[] = [];

  for (const rule of FILE_SIZE_RULES) {
    const files = glob.sync(rule.pattern);

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n').length;
      const tokens = estimateTokenCount(content);

      if (lines > rule.maxLines || tokens > rule.maxTokens) {
        violations.push({
          file,
          fileType: rule.fileType,
          currentLines: lines,
          maxLines: rule.maxLines,
          currentTokens: tokens,
          maxTokens: rule.maxTokens,
          severity: getSeverity(lines, tokens, rule)
        });
      }
    }
  }

  return { violations, success: violations.length === 0 };
}
```

### **Git Pre-Commit Hook Integration**

```bash
#!/bin/sh
# .git/hooks/pre-commit

echo "Validating file sizes..."
yarn validate-file-sizes

if [ $? -ne 0 ]; then
  echo "❌ File size validation failed!"
  echo "🚨 Files exceed size limits. Please split large files before committing."
  echo "📋 See .clinerules/source-files.md for splitting strategies."
  exit 1
fi

echo "✅ File size validation passed"
```

---

## Quality Assurance Integration

### **Build Process Integration**

```json
// package.json scripts
{
  "scripts": {
    "validate-sizes": "tsx scripts/validate-file-sizes.ts",
    "pre-commit": "yarn validate-sizes && yarn lint && yarn test",
    "build": "yarn validate-sizes && yarn clean && tsc",
    "analyze-large-files": "tsx scripts/analyze-large-files.ts"
  }
}
```

### **Code Review Checklist**

**For All Pull Requests:**
- [ ] No files exceed hard size limits
- [ ] Large files (>200 lines) have justification comments
- [ ] Proper decomposition patterns followed
- [ ] Shared infrastructure properly extracted
- [ ] Tests cover new file organization
- [ ] Documentation updated for organization changes

**For Refactoring Pull Requests:**
- [ ] Original functionality completely preserved
- [ ] New organization follows established patterns
- [ ] Performance impact measured and acceptable
- [ ] Error handling properly distributed
- [ ] Integration points properly tested

---

## Summary and Enforcement

### **Critical Success Metrics**

1. **File Size Compliance**: 100% of files under hard limits
2. **Architecture Quality**: Clear separation of concerns in all splits
3. **Maintainability**: New developers can understand file organization immediately
4. **Performance**: No degradation from file decomposition
5. **AI Compatibility**: All files processable by AI systems efficiently

### **Enforcement Mechanisms**

1. **Automated Validation**: Pre-commit hooks preventing oversized files
2. **CI/CD Gates**: Build failures on size violations
3. **Code Review Requirements**: Mandatory size validation in all reviews
4. **Architecture Review**: Regular assessment of decomposition patterns
5. **Documentation Currency**: All organizational changes documented

### **Escalation Procedures**

**File Size Violations:**
1. **Warning Level** (200+ lines): Review in next sprint planning
2. **Critical Level** (300+ lines): Plan splitting within 48 hours
3. **Emergency Level** (400+ lines): IMMEDIATE splitting required
4. **Blocked Level** (500+ lines): Stop all other work until resolved

**Quality Assurance:**
- Files approaching limits trigger automated warnings
- Regular architecture reviews assess decomposition quality
- New patterns added to guidelines based on real splits
- Success stories documented for pattern reuse

This comprehensive file size management system ensures that Blend65 development remains efficient for both human developers and AI processing while maintaining the highest standards of code quality and architectural coherence.

**Remember: File size management is not optional - it's critical infrastructure for successful compiler development. Every file matters, every line counts, and proper decomposition is an investment in long-term project success.**
