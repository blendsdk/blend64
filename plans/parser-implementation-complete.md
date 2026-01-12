# Complete Parser Implementation Plan

> **Target**: Implement a complete Blend65 Parser by extending the existing base infrastructure
> **Strategy**: Maximum granularity for AI context window limitations
> **Architecture**: Rename base.ts → parser.ts, delete SimpleExampleParser, consolidate all functionality

## **Executive Summary**

This document provides a comprehensive, granular implementation plan for creating a complete Blend65 Parser. The plan is designed for AI context window limitations where each task must be completable within 50,000 tokens and be self-contained.

### **Current State Analysis**

**✅ Existing Infrastructure (Strong Foundation)**
- `Parser` abstract base class in `base.ts` with excellent Pratt expression parsing
- Complete AST node definitions in `nodes.ts` for all language constructs
- `SimpleExampleParser` with basic functionality (variables, @map, simple expressions)
- Sophisticated error handling with diagnostic collection
- Token stream management and synchronization
- Module scope validation

**❌ Missing for Complete Parser**
- Function declarations and statement parsing
- Control flow statements (if, while, for, match)
- Import/export statement parsing
- Type/enum declaration parsing
- Advanced expressions (calls, member access, indexing, assignments)
- Statement infrastructure (return, break, continue, blocks, expression statements)

### **Implementation Strategy**

**Error Handling Approach**: Following mainstream compiler patterns (TypeScript, Rust, Swift)
- ✅ Collect all errors during parsing (don't stop at first error)
- ✅ Use error recovery and synchronization points
- ✅ Return partial AST + diagnostic collection
- ✅ Enable language service capabilities (IntelliSense, error highlighting)

**Architecture Decision**:
- **Rename**: `base.ts` → `parser.ts`
- **Delete**: `SimpleExampleParser`
- **Consolidate**: All functionality into concrete `Parser` class

## **Granular Task Breakdown**

### **Phase 0: Setup & Refactoring (Foundation)**
*Prepare the codebase for full parser implementation*

| Task | Description | Files Changed | Time Est. | Dependencies | Status |
|------|-------------|---------------|-----------|--------------|---------|
| 0.1 | Rename `base.ts` to `parser.ts`, remove `abstract` from `Parser` class | parser.ts | 1 hour | None | [ ] |
| 0.2 | Delete `SimpleExampleParser`, integrate its functionality into `Parser` | parser.ts | 2 hours | 0.1 | [ ] |
| 0.3 | Update imports and exports throughout codebase | index.ts, tests | 1 hour | 0.1, 0.2 | [ ] |
| 0.4 | Create basic parse() method integrating existing functionality | parser.ts | 2 hours | 0.2 | [ ] |

### **Phase 1: Statement Infrastructure (Foundation Layer)**
*Build the statement parsing foundation that all other constructs depend on*

| Task | Description | Files Changed | Time Est. | Dependencies | Status |
|------|-------------|---------------|-----------|--------------|---------|
| 1.1 | Add parseStatement() method dispatcher | parser.ts | 2 hours | Phase 0 | [ ] |
| 1.2 | Implement parseBlockStatement() for statement sequences | parser.ts | 2 hours | 1.1 | [ ] |
| 1.3 | Implement parseExpressionStatement() for expressions used as statements | parser.ts | 1 hour | 1.1 | [ ] |
| 1.4 | Add comprehensive statement infrastructure tests | test files | 3 hours | 1.1-1.3 | [ ] |

**Code Example for Task 1.1:**
```typescript
protected parseStatement(): Statement {
  // Handle different statement types
  if (this.check(TokenType.IF)) return this.parseIfStatement();
  if (this.check(TokenType.WHILE)) return this.parseWhileStatement();
  if (this.check(TokenType.FOR)) return this.parseForStatement();
  if (this.check(TokenType.RETURN)) return this.parseReturnStatement();
  if (this.check(TokenType.BREAK)) return this.parseBreakStatement();
  if (this.check(TokenType.CONTINUE)) return this.parseContinueStatement();

  // Default: expression statement
  return this.parseExpressionStatement();
}
```

### **Phase 2: Control Flow Statements**
*Implement structured control flow parsing*

| Task | Description | Files Changed | Time Est. | Dependencies | Status |
|------|-------------|---------------|-----------|--------------|---------|
| 2.1 | Implement parseIfStatement() with then/else/end if | parser.ts | 3 hours | Phase 1 | [ ] |
| 2.2 | Implement parseWhileStatement() with end while | parser.ts | 2 hours | Phase 1 | [ ] |
| 2.3 | Implement parseForStatement() with for/to/next pattern | parser.ts | 3 hours | Phase 1 | [ ] |
| 2.4 | Implement parseMatchStatement() with case/default/end match | parser.ts | 4 hours | Phase 1 | [ ] |
| 2.5 | Implement parseReturnStatement(), parseBreakStatement(), parseContinueStatement() | parser.ts | 2 hours | Phase 1 | [ ] |
| 2.6 | Add comprehensive control flow tests with nested structures | test files | 4 hours | 2.1-2.5 | [ ] |

**Code Example for Task 2.1:**
```typescript
protected parseIfStatement(): IfStatement {
  const startToken = this.expect(TokenType.IF, "Expected 'if'");
  const condition = this.parseExpression();
  this.expect(TokenType.THEN, "Expected 'then' after if condition");

  const thenBranch = this.parseStatementBlock();

  let elseBranch: Statement[] | null = null;
  if (this.match(TokenType.ELSE)) {
    elseBranch = this.parseStatementBlock();
  }

  this.expect(TokenType.END, "Expected 'end'");
  this.expect(TokenType.IF, "Expected 'if' after 'end'");

  const location = this.createLocation(startToken, this.getCurrentToken());
  return new IfStatement(condition, thenBranch, elseBranch, location);
}
```

### **Phase 3: Advanced Expression Parsing**
*Extend expression parsing beyond binary/unary/literal support*

| Task | Description | Files Changed | Time Est. | Dependencies | Status |
|------|-------------|---------------|-----------|--------------|---------|
| 3.1 | Implement parseCallExpression() for function calls with arguments | parser.ts | 3 hours | Phase 1 | [ ] |
| 3.2 | Implement parseMemberExpression() for dot notation access | parser.ts | 2 hours | Phase 1 | [ ] |
| 3.3 | Implement parseIndexExpression() for array/memory access | parser.ts | 2 hours | Phase 1 | [ ] |
| 3.4 | Implement parseAssignmentExpression() with all assignment operators | parser.ts | 3 hours | Phase 1 | [ ] |
| 3.5 | Implement parseUnaryExpression() for prefix operators | parser.ts | 2 hours | Phase 1 | [ ] |
| 3.6 | Update parsePrimaryExpression() to handle postfix expressions | parser.ts | 3 hours | 3.1-3.5 | [ ] |
| 3.7 | Add comprehensive expression parsing tests with precedence | test files | 4 hours | 3.1-3.6 | [ ] |

**Code Example for Task 3.1:**
```typescript
protected parseCallExpression(callee: Expression): CallExpression {
  const startToken = this.expect(TokenType.LEFT_PAREN, "Expected '('");

  const args: Expression[] = [];
  if (!this.check(TokenType.RIGHT_PAREN)) {
    do {
      args.push(this.parseExpression());
    } while (this.match(TokenType.COMMA));
  }

  this.expect(TokenType.RIGHT_PAREN, "Expected ')' after arguments");

  const location = this.mergeLocations(callee.getLocation(), this.currentLocation());
  return new CallExpression(callee, args, location);
}
```

### **Phase 4: Function Declaration Parsing**
*Add complete function parsing with parameters and bodies*

| Task | Description | Files Changed | Time Est. | Dependencies | Status |
|------|-------------|---------------|-----------|--------------|---------|
| 4.1 | Implement parseFunctionDecl() with export/callback modifiers | parser.ts | 3 hours | Phase 2 | [ ] |
| 4.2 | Implement parseParameterList() with typed parameters | parser.ts | 2 hours | 4.1 | [ ] |
| 4.3 | Implement function body parsing with proper scope management | parser.ts | 3 hours | 4.1, 4.2 | [ ] |
| 4.4 | Add comprehensive function declaration tests | test files | 3 hours | 4.1-4.3 | [ ] |

**Code Example for Task 4.1:**
```typescript
protected parseFunctionDecl(): FunctionDecl {
  const startToken = this.getCurrentToken();

  // Parse optional export modifier
  const isExported = this.parseExportModifier();

  // Parse optional callback modifier
  const isCallback = this.match(TokenType.CALLBACK);

  this.expect(TokenType.FUNCTION, "Expected 'function'");
  const nameToken = this.expect(TokenType.IDENTIFIER, "Expected function name");

  // Parse parameters
  this.expect(TokenType.LEFT_PAREN, "Expected '(' after function name");
  const parameters = this.parseParameterList();
  this.expect(TokenType.RIGHT_PAREN, "Expected ')' after parameters");

  // Parse return type
  let returnType: string | null = null;
  if (this.match(TokenType.COLON)) {
    returnType = this.expect(TokenType.IDENTIFIER, "Expected return type").value;
  }

  // Parse body
  this.enterFunctionScope();
  const body = this.parseStatementBlock();
  this.exitFunctionScope();

  this.expect(TokenType.END, "Expected 'end'");
  this.expect(TokenType.FUNCTION, "Expected 'function' after 'end'");

  const location = this.createLocation(startToken, this.getCurrentToken());
  return new FunctionDecl(nameToken.value, parameters, returnType, body, location, isExported, isCallback);
}
```

### **Phase 5: Import/Export Declaration Parsing**
*Add module system support*

| Task | Description | Files Changed | Time Est. | Dependencies | Status |
|------|-------------|---------------|-----------|--------------|---------|
| 5.1 | Implement parseImportDecl() with identifier list parsing | parser.ts | 3 hours | Phase 1 | [ ] |
| 5.2 | Implement parseExportDecl() wrapping other declarations | parser.ts | 2 hours | Phase 1 | [ ] |
| 5.3 | Add module system parsing tests | test files | 3 hours | 5.1, 5.2 | [ ] |

### **Phase 6: Type System Declaration Parsing**
*Add type alias and enum parsing*

| Task | Description | Files Changed | Time Est. | Dependencies | Status |
|------|-------------|---------------|-----------|--------------|---------|
| 6.1 | Implement parseTypeDecl() for type aliases | parser.ts | 2 hours | Phase 1 | [ ] |
| 6.2 | Implement parseEnumDecl() with member parsing | parser.ts | 3 hours | Phase 1 | [ ] |
| 6.3 | Add type system parsing tests | test files | 3 hours | 6.1, 6.2 | [ ] |

### **Phase 7: Parser Integration & Main Entry Point**
*Create the main parse() method integrating all functionality*

| Task | Description | Files Changed | Time Est. | Dependencies | Status |
|------|-------------|---------------|-----------|--------------|---------|
| 7.1 | Implement complete parse() method dispatching all constructs | parser.ts | 3 hours | Phases 1-6 | [ ] |
| 7.2 | Add top-level declaration parsing with proper ordering | parser.ts | 2 hours | 7.1 | [ ] |
| 7.3 | Integrate all existing @map parsing functionality | parser.ts | 2 hours | 7.1 | [ ] |
| 7.4 | Update parsePrimaryExpression() for complete expression support | parser.ts | 2 hours | 7.1-7.3 | [ ] |

### **Phase 8: Comprehensive Testing & Documentation**
*Complete testing suite and integration*

| Task | Description | Files Changed | Time Est. | Dependencies | Status |
|------|-------------|---------------|-----------|--------------|---------|
| 8.1 | Create end-to-end parser tests with real Blend65 programs | e2e test files | 4 hours | Phase 7 | [ ] |
| 8.2 | Add parser performance benchmarks | benchmark files | 2 hours | Phase 7 | [ ] |
| 8.3 | Update index.ts exports and integration points | index.ts | 1 hour | Phase 7 | [ ] |
| 8.4 | Create parser usage documentation with examples | docs | 2 hours | Phase 7 | [ ] |

## **Implementation Details**

### **Error Handling Strategy**

Following mainstream compiler approaches for optimal user experience:

```typescript
// Error Recovery Pattern
protected parseWithRecovery<T>(parseMethod: () => T, recoveryToken: TokenType, errorMessage: string): T | null {
  try {
    return parseMethod();
  } catch (error) {
    this.reportError(DiagnosticCode.PARSE_ERROR, errorMessage);
    this.synchronizeTo(recoveryToken);
    return null;
  }
}

// Synchronization Points
protected synchronizeTo(targetToken: TokenType): void {
  while (!this.isAtEnd() && !this.check(targetToken)) {
    this.advance();
  }
}
```

### **Testing Strategy**

Each task includes multiple test categories:

1. **Unit Tests**: Test individual parsing methods
2. **Integration Tests**: Test combined functionality
3. **Edge Case Tests**: Error conditions, malformed input
4. **End-to-End Tests**: Complete programs
5. **Performance Tests**: Large input handling

**Example Test Structure:**
```typescript
describe('parseIfStatement', () => {
  it('parses simple if statement', () => { /* ... */ });
  it('parses if-else statement', () => { /* ... */ });
  it('parses nested if statements', () => { /* ... */ });
  it('handles missing then keyword', () => { /* ... */ });
  it('handles missing end if', () => { /* ... */ });
});
```

### **File Structure After Implementation**

```
packages/compiler/src/parser/
├── parser.ts          # Main Parser class (renamed from base.ts)
├── config.ts          # Parser configuration
├── precedence.ts      # Operator precedence
├── index.ts          # Exports
└── __tests__/
    ├── statements/
    │   ├── if-statement.test.ts
    │   ├── while-statement.test.ts
    │   ├── for-statement.test.ts
    │   └── match-statement.test.ts
    ├── expressions/
    │   ├── binary-expression.test.ts
    │   ├── call-expression.test.ts
    │   ├── member-expression.test.ts
    │   └── assignment-expression.test.ts
    ├── declarations/
    │   ├── function-declaration.test.ts
    │   ├── type-declaration.test.ts
    │   └── enum-declaration.test.ts
    ├── integration/
    │   ├── complete-programs.test.ts
    │   └── error-recovery.test.ts
    └── e2e/
        ├── real-programs.test.ts
        └── performance.test.ts
```

### **Integration Points**

1. **Lexer Integration**: Parser continues to accept token array from Lexer
2. **AST Integration**: Uses existing AST node classes from `nodes.ts`
3. **Diagnostic Integration**: Leverages existing diagnostic collection
4. **Export Integration**: Updates `index.ts` to export new Parser class
5. **CLI Integration**: Prepared for future CLI configuration passing

### **Performance Considerations**

- **Memory Management**: Reuse token objects, minimize AST node creation
- **Error Handling**: Fast synchronization without excessive backtracking
- **Large Files**: Stream-friendly parsing for large source files
- **Caching**: Prepare for future caching of parse results

## **Success Criteria**

### **Phase Completion Criteria**

Each phase is complete when:
- ✅ All tasks pass unit tests
- ✅ Integration tests pass with previous phases
- ✅ Error recovery works correctly
- ✅ No breaking changes to existing API
- ✅ Code follows existing patterns and conventions

### **Final Success Criteria**

Parser implementation is complete when:
- ✅ Parses all constructs in Blend65 grammar specification
- ✅ Generates correct AST nodes for valid input
- ✅ Provides meaningful error messages for invalid input
- ✅ Maintains partial AST for error recovery
- ✅ Passes comprehensive test suite (>95% coverage)
- ✅ Performance acceptable for typical source files
- ✅ Ready for integration with semantic analyzer/type checker

## **Risk Mitigation**

### **Context Window Limitations**
- Each task is scoped to 2-4 hours maximum
- Self-contained implementations with clear interfaces
- Comprehensive code examples provided
- Can pause/resume at any task boundary

### **Technical Risks**
- **Expression Precedence**: Leverage existing Pratt parser infrastructure
- **Error Recovery**: Use proven synchronization point strategy
- **AST Complexity**: Follow existing node patterns precisely
- **Integration**: Maintain backward compatibility with existing tests

### **Quality Assurance**
- Granular testing at each step
- Code reviews between phases
- Performance monitoring
- Integration validation

## **Next Steps**

1. **Review Plan**: Confirm approach and granularity level
2. **Begin Phase 0**: Start with setup and refactoring tasks
3. **Iterative Implementation**: Complete each phase sequentially
4. **Testing**: Run comprehensive tests after each phase
5. **Integration**: Validate with existing codebase components

This plan provides a complete roadmap for implementing a production-quality Blend65 parser while respecting AI context window constraints. Each task is designed to be implementable in isolation while building toward a cohesive, complete parser implementation.
