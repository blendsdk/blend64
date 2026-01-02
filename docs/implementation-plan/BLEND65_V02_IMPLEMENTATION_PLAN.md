# Blend65 v0.2 Implementation Plan

**Date:** 02/01/2026
**Purpose:** Detailed implementation roadmap for Blend65 v0.2 language features
**Status:** APPROVED - Ready for implementation
**Timeline:** 6-8 weeks (2-3 months with testing)

---

## Executive Summary

Blend65 v0.2 focuses on **3 high-impact language features** that can be implemented entirely within the existing lexer/parser/AST layer. This work runs **in parallel** with the longer-term backend development, providing immediate developer value while maintaining full v0.1 compatibility.

### **v0.2 Approved Features:**
1. **Break/Continue Statements** - Essential for complex game loops
2. **Complete Match Statement Implementation** - Clean pattern matching for game logic
3. **Enum Declarations** - Code organization for game states, colors, directions

### **Key Characteristics:**
- **No backend dependencies** - Pure lexer/parser/AST extensions
- **Full v0.1 compatibility** - Wild Boa Snake still compiles perfectly
- **AI-assisted implementation** - 3-4/10 complexity level, very manageable
- **Immediate developer value** - Requested by analyzed games
- **Foundation for v0.3+** - Sets up architecture for local variables

---

## Architecture Integration

### **Current Pipeline (v0.1)**
```
Blend65 Source → Lexer → Parser → AST ✅ COMPLETE
```

### **v0.2 Extension Strategy**
```
Blend65 Source → Enhanced Lexer → Enhanced Parser → Enhanced AST ✅ v0.2 TARGET
```

### **Backend Independence**
- **v0.2 work is orthogonal** to semantic analysis → IL → optimization → codegen
- **Semantic analyzer will handle v0.2 features** when backend is ready
- **Clean separation** allows parallel development streams

---

## Phase 1: Lexer Extensions (Week 1)

### **Goal:** Add new tokens for v0.2 language features
**Complexity:** 2/10 VERY EASY - AI can handle 100% of implementation

### Task 1.1: Add New Token Types
**File:** `packages/lexer/src/types.ts`
**Changes:**
```typescript
// Add to TokenType enum
BREAK = 'BREAK',
CONTINUE = 'CONTINUE',
ENUM = 'ENUM',
DEFAULT = 'DEFAULT',
```

**Update keyword sets:**
```typescript
export const KEYWORDS = new Set([
  // ... existing keywords
  'break',
  'continue',
  'enum',
  'default',
]);

export const CONTROL_FLOW_KEYWORDS = new Set([
  // ... existing keywords
  'break',
  'continue',
  'default',
]);
```

**Test Requirements:**
- Keyword recognition in lexer
- Token type assignment
- Case sensitivity validation
- Conflict resolution with identifiers

### Task 1.2: Update Lexer Implementation
**File:** `packages/lexer/src/blend65-lexer.ts`
**Changes:**
- Ensure new keywords are properly tokenized
- Update any keyword-specific lexing logic if needed
- Validate lexer handles new tokens in all contexts

**Test Requirements:**
- New keywords tokenized correctly
- Integration with existing lexer logic
- Edge cases (keywords as identifiers in strings, comments)

### Phase 1 Success Criteria:
- [ ] All new tokens properly recognized by lexer
- [ ] Existing lexer functionality unchanged
- [ ] Comprehensive test coverage for new tokens
- [ ] All existing tests still pass

---

## Phase 2: AST Extensions (Weeks 1-2)

### **Goal:** Extend AST types to represent new language features
**Complexity:** 3/10 EASY - AI can handle most implementation

### Task 2.1: Add Break/Continue AST Nodes
**File:** `packages/ast/src/ast-types/core.ts`
**Changes:**
```typescript
/**
 * Break statement: break
 * Exits the containing loop
 */
export interface BreakStatement extends Blend65ASTNode {
  type: 'BreakStatement';
  // No additional properties needed
}

/**
 * Continue statement: continue
 * Skips to next iteration of containing loop
 */
export interface ContinueStatement extends Blend65ASTNode {
  type: 'ContinueStatement';
  // No additional properties needed
}

// Update Statement union type
export type Statement =
  | ExpressionStatement
  | ReturnStatement
  | IfStatement
  | WhileStatement
  | ForStatement
  | MatchStatement
  | BlockStatement
  | BreakStatement      // NEW
  | ContinueStatement;  // NEW
```

### Task 2.2: Complete Match Statement AST
**File:** `packages/ast/src/ast-types/core.ts`
**Changes:**
```typescript
/**
 * Match statement: match expression case value: ... default: ... end match
 * Enhanced with default case support
 */
export interface MatchStatement extends Blend65ASTNode {
  type: 'MatchStatement';
  discriminant: Expression;
  cases: MatchCase[];
  defaultCase: MatchCase | null;  // Enhanced support
}

/**
 * Individual case in a match statement
 * Enhanced to distinguish default cases
 */
export interface MatchCase extends Blend65ASTNode {
  type: 'MatchCase';
  test: Expression | null;  // null for default case
  consequent: Statement[];
}
```

### Task 2.3: Add Enum Declaration AST
**File:** `packages/ast/src/ast-types/core.ts`
**Changes:**
```typescript
/**
 * Enum declaration: enum Name value1 = 1, value2, value3 = 5 end enum
 */
export interface EnumDeclaration extends Blend65ASTNode {
  type: 'EnumDeclaration';
  name: string;
  members: EnumMember[];
  exported: boolean;
}

/**
 * Individual enum member
 */
export interface EnumMember extends Blend65ASTNode {
  type: 'EnumMember';
  name: string;
  value: Expression | null;  // null for auto-increment
}

// Update Declaration union type
export type Declaration =
  | FunctionDeclaration
  | VariableDeclaration
  | TypeDeclaration
  | EnumDeclaration;  // NEW
```

### Task 2.4: Update AST Factory
**File:** `packages/ast/src/ast-factory.ts`
**Changes:**
```typescript
// Add factory methods for new AST nodes
createBreakStatement(metadata?: SourceMetadata): BreakStatement {
  return {
    type: 'BreakStatement',
    metadata
  };
}

createContinueStatement(metadata?: SourceMetadata): ContinueStatement {
  return {
    type: 'ContinueStatement',
    metadata
  };
}

createEnumDeclaration(
  name: string,
  members: EnumMember[],
  exported: boolean,
  metadata?: SourceMetadata
): EnumDeclaration {
  return {
    type: 'EnumDeclaration',
    name,
    members,
    exported,
    metadata
  };
}

createEnumMember(
  name: string,
  value: Expression | null,
  metadata?: SourceMetadata
): EnumMember {
  return {
    type: 'EnumMember',
    name,
    value,
    metadata
  };
}
```

### Phase 2 Success Criteria:
- [ ] All new AST node types properly defined
- [ ] AST factory methods implemented and tested
- [ ] Type safety maintained across all changes
- [ ] AST serialization/deserialization works
- [ ] Existing AST functionality unchanged

---

## Phase 3: Parser Implementation (Weeks 2-4)

### **Goal:** Implement parsing logic for all v0.2 language features
**Complexity:** 4/10 MODERATE - AI can help significantly but needs careful validation

### Task 3.1: Implement Break/Continue Parsing
**File:** `packages/parser/src/blend65/blend65-parser.ts`
**Changes:**
```typescript
/**
 * Parse statement - add break/continue cases
 */
private parseStatement(): Statement | null {
  // ... existing cases

  switch (current.value) {
    // ... existing cases
    case 'break':
      return this.parseBreakStatement();
    case 'continue':
      return this.parseContinueStatement();
    // ... other cases
  }
}

/**
 * Parse break statement: break
 */
private parseBreakStatement(): BreakStatement {
  const breakToken = this.consume(TokenType.BREAK, "Expected 'break'");
  this.consumeStatementTerminator();

  return this.factory.createBreakStatement({
    start: breakToken.start,
    end: this.previous().end
  });
}

/**
 * Parse continue statement: continue
 */
private parseContinueStatement(): ContinueStatement {
  const continueToken = this.consume(TokenType.CONTINUE, "Expected 'continue'");
  this.consumeStatementTerminator();

  return this.factory.createContinueStatement({
    start: continueToken.start,
    end: this.previous().end
  });
}
```

**Context Validation:**
```typescript
/**
 * Validate break/continue are only used inside loops
 */
private validateLoopContext(statementType: 'break' | 'continue'): void {
  if (!this.isInLoop()) {
    throw new Error(`${statementType} statement must be inside a loop`);
  }
}

// Track loop nesting for context validation
private loopDepth: number = 0;

private isInLoop(): boolean {
  return this.loopDepth > 0;
}
```

### Task 3.2: Complete Match Statement Parsing
**File:** `packages/parser/src/blend65/blend65-parser.ts`
**Changes:**
```typescript
/**
 * Enhanced match statement parsing with default case
 * match expression case value: ... case value2: ... default: ... end match
 */
private parseMatchStatement(): MatchStatement {
  const matchToken = this.consume(TokenType.MATCH, "Expected 'match'");
  const discriminant = this.parseExpression();
  this.consumeStatementTerminator();

  const cases: MatchCase[] = [];
  let defaultCase: MatchCase | null = null;

  while (!this.isAtEnd() && !this.check(TokenType.END)) {
    this.skipNewlines();

    if (this.checkLexeme('case')) {
      cases.push(this.parseMatchCase(false));
    } else if (this.checkLexeme('default')) {
      if (defaultCase !== null) {
        throw new Error("Multiple default cases not allowed");
      }
      defaultCase = this.parseMatchCase(true);
    } else {
      break;
    }
  }

  this.consume(TokenType.END, "Expected 'end'");
  this.consumeLexeme('match', "Expected 'match' after 'end'");
  this.consumeStatementTerminator();

  return this.factory.createMatchStatement(discriminant, cases, defaultCase, {
    start: matchToken.start,
    end: this.previous().end
  });
}

/**
 * Parse individual match case
 */
private parseMatchCase(isDefault: boolean): MatchCase {
  const startToken = this.peek();

  let test: Expression | null = null;
  if (isDefault) {
    this.advance(); // consume 'default'
  } else {
    this.advance(); // consume 'case'
    test = this.parseExpression();
  }

  this.consume(TokenType.COLON, "Expected ':'");
  this.consumeStatementTerminator();

  const consequent = this.parseStatementBlock('match');

  return this.factory.createMatchCase(test, consequent, {
    start: startToken.start,
    end: this.previous().end
  });
}
```

### Task 3.3: Implement Enum Declaration Parsing
**File:** `packages/parser/src/blend65/blend65-parser.ts`
**Changes:**
```typescript
/**
 * Parse declaration - add enum case
 */
private parseDeclaration(): Declaration | null {
  // ... existing cases

  switch (current.value) {
    // ... existing cases
    case 'enum':
      return this.parseEnumDeclaration();
    // ... other cases
  }
}

/**
 * Parse enum declaration: enum Name value1 = 1, value2, value3 = 5 end enum
 */
private parseEnumDeclaration(): EnumDeclaration {
  const enumToken = this.consume(TokenType.ENUM, "Expected 'enum'");
  const name = this.consume(TokenType.IDENTIFIER, "Expected enum name").value;
  this.consumeStatementTerminator();

  const members: EnumMember[] = [];
  let autoValue = 0;

  while (!this.isAtEnd() && !this.check(TokenType.END)) {
    this.skipNewlines();

    if (this.check(TokenType.END)) break;

    const memberName = this.consume(TokenType.IDENTIFIER, "Expected enum member name").value;
    let value: Expression | null = null;

    if (this.match(TokenType.ASSIGN)) {
      value = this.parseExpression();
      // Update auto-increment if this is a numeric constant
      if (value.type === 'Literal' && typeof value.value === 'number') {
        autoValue = value.value + 1;
      }
    } else {
      // Auto-increment value
      value = this.factory.createLiteral(autoValue, autoValue.toString());
      autoValue++;
    }

    members.push(this.factory.createEnumMember(memberName, value));

    if (!this.match(TokenType.COMMA)) {
      break;
    }
    this.skipNewlines();
  }

  this.consume(TokenType.END, "Expected 'end'");
  this.consumeLexeme('enum', "Expected 'enum' after 'end'");
  this.consumeStatementTerminator();

  return this.factory.createEnumDeclaration(name, members, false, {
    start: enumToken.start,
    end: this.previous().end
  });
}
```

### Task 3.4: Update Parser Infrastructure
**File:** `packages/parser/src/blend65/blend65-parser.ts`
**Changes:**
- Update loop context tracking for break/continue validation
- Add enum parsing to declaration handling
- Update match statement termination detection
- Enhance error recovery for new constructs

### Phase 3 Success Criteria:
- [ ] All new language features parse correctly
- [ ] Context validation works (break/continue only in loops)
- [ ] Error handling and recovery implemented
- [ ] Parser maintains existing functionality
- [ ] Complex nested cases handled properly

---

## Phase 4: Integration & Testing (Weeks 4-6)

### **Goal:** Comprehensive testing and integration validation
**Complexity:** 3/10 EASY - Mostly test writing with some debugging

### Task 4.1: Comprehensive Test Suite
**Files:** Various `__tests__/` directories
**Requirements:**

**Break/Continue Tests:**
```typescript
// Test break/continue in different loop types
describe('Break/Continue Statements', () => {
  it('should parse break in for loop', () => {
    const source = `
      for i = 0 to 10
        if i == 5 then
          break
        end if
      next i
    `;
    // Validate AST structure
  });

  it('should parse continue in while loop', () => {
    const source = `
      while condition
        if skip then
          continue
        end if
        process()
      end while
    `;
    // Validate AST structure
  });

  it('should error on break outside loop', () => {
    const source = `
      function test()
        break  // ERROR
      end function
    `;
    // Validate error handling
  });
});
```

**Match Statement Tests:**
```typescript
describe('Match Statements', () => {
  it('should parse match with default case', () => {
    const source = `
      match gameState
        case MENU:
          showMenu()
        case PLAYING:
          updateGame()
        default:
          handleError()
      end match
    `;
    // Validate AST structure
  });

  it('should handle multiple case values', () => {
    // Test various case patterns
  });

  it('should error on multiple default cases', () => {
    // Test error handling
  });
});
```

**Enum Tests:**
```typescript
describe('Enum Declarations', () => {
  it('should parse enum with explicit values', () => {
    const source = `
      enum Color
        RED = 1,
        GREEN = 2,
        BLUE = 3
      end enum
    `;
    // Validate AST structure
  });

  it('should parse enum with auto-increment', () => {
    const source = `
      enum Direction
        UP, DOWN, LEFT, RIGHT
      end enum
    `;
    // Validate auto-increment logic
  });
});
```

### Task 4.2: Wild Boa Snake Compatibility Validation
**Goal:** Ensure v0.1 programs still compile perfectly
**Files:** Test with actual Wild Boa Snake source patterns
**Requirements:**
- Parse existing v0.1 syntax without issues
- No regressions in existing functionality
- Performance maintained or improved
- All existing tests continue to pass

### Task 4.3: Integration Testing
**Goal:** Test interaction between new and existing features
**Requirements:**
- Break/continue in nested loops
- Match statements with function calls
- Enums used in expressions and comparisons
- Complex programs using multiple new features
- Error handling and edge cases

### Task 4.4: Documentation and Examples
**Files:** Update documentation with v0.2 examples
**Requirements:**
```js
// Example: Game state management with enums and match
enum GameState
  MENU = 0,
  PLAYING = 1,
  PAUSED = 2,
  GAME_OVER = 3
end enum

var currentState: GameState = GameState.MENU

function gameLoop(): void
  while true
    match currentState
      case GameState.MENU:
        handleMenu()
        if startPressed then
          currentState = GameState.PLAYING
        end if
      case GameState.PLAYING:
        for i = 0 to enemyCount - 1
          if enemies[i].health <= 0 then
            continue  // Skip dead enemies
          end if
          updateEnemy(i)
          if playerHealth <= 0 then
            currentState = GameState.GAME_OVER
            break     // Exit enemy loop
          end if
        next i
      case GameState.GAME_OVER:
        if restartPressed then
          currentState = GameState.MENU
        end if
      default:
        currentState = GameState.MENU  // Error recovery
    end match
  end while
end function
```

### Phase 4 Success Criteria:
- [ ] All new features fully tested with edge cases
- [ ] Wild Boa Snake compatibility maintained 100%
- [ ] Integration tests pass for complex scenarios
- [ ] Documentation updated with practical examples
- [ ] Performance benchmarks meet or exceed v0.1

---

## Technical Implementation Details

### **Lexer Changes Summary:**
- Add 4 new tokens: BREAK, CONTINUE, ENUM, DEFAULT
- Update keyword recognition sets
- Maintain existing tokenization behavior
- **Estimated effort:** 4-6 hours with AI assistance

### **AST Changes Summary:**
- Add 2 new statement types: BreakStatement, ContinueStatement
- Complete MatchStatement with default case support
- Add EnumDeclaration and EnumMember types
- Update factory methods and type unions
- **Estimated effort:** 8-12 hours with AI assistance

### **Parser Changes Summary:**
- Implement parsing for break/continue with context validation
- Complete match statement parsing with default cases
- Add enum declaration parsing with auto-increment
- Enhance error handling and recovery
- **Estimated effort:** 16-24 hours with significant AI assistance and debugging

### **Testing Summary:**
- Comprehensive unit tests for all new features
- Integration tests with existing functionality
- Wild Boa Snake compatibility validation
- Edge case and error condition testing
- **Estimated effort:** 12-16 hours with AI assistance for test generation

---

## Quality Assurance Strategy

### **Code Quality:**
- TypeScript strict mode maintained
- Existing code style and patterns followed
- Comprehensive type safety for all new constructs
- Clean interfaces between lexer/parser/AST

### **Testing Standards:**
- >95% test coverage for new code
- All existing tests must continue to pass
- Performance regression testing
- Memory usage validation for large programs

### **Validation Criteria:**
- Wild Boa Snake compiles identically to v0.1
- New features work in isolation and combination
- Error messages are clear and actionable
- Parse performance maintained or improved

---

## Risk Assessment and Mitigation

### **Technical Risks:**

**Risk:** Parser complexity increases significantly
**Mitigation:** Incremental implementation, extensive testing at each step

**Risk:** Break/continue context validation is complex
**Mitigation:** Simple loop depth counter, comprehensive test cases

**Risk:** Match statement parsing interactions with existing constructs
**Mitigation:** Careful parser state management, isolated testing

**Risk:** Enum auto-increment logic edge cases
**Mitigation:** Simple sequential numbering, explicit value override

### **Project Risks:**

**Risk:** Feature scope creep during implementation
**Mitigation:** Stick strictly to approved v0.2 specification

**Risk:** Integration issues with existing codebase
**Mitigation:** Wild Boa Snake compatibility as integration gate

**Risk:** Timeline slippage due to unforeseen complexity
**Mitigation:** Conservative estimates, AI assistance for routine tasks

---

## Success Metrics

### **Functional Success:**
- [ ] All 3 v0.2 features implemented and tested
- [ ] Wild Boa Snake compatibility maintained 100%
- [ ] No regressions in existing functionality
- [ ] Comprehensive documentation with examples

### **Quality Success:**
- [ ] >95% test coverage for new code
- [ ] All TypeScript compilation without warnings
- [ ] Performance within 5% of v0.1 baseline
- [ ] Memory usage stable or improved

### **Developer Experience:**
- [ ] Clear, actionable error messages for new features
- [ ] Intuitive syntax following Blend65 conventions
- [ ] Good integration with existing language constructs
- [ ] Practical examples demonstrating real-world usage

---

## Timeline and Milestones

### **Week 1: Foundation**
- [ ] Lexer extensions complete and tested
- [ ] AST type definitions implemented
- [ ] Basic factory methods working

### **Week 2: Core Implementation**
- [ ] Break/continue parsing implemented
- [ ] Match statement parsing complete
- [ ] Enum parsing functional

### **Week 3: Advanced Features**
- [ ] Context validation for break/continue
- [ ] Default case handling in match statements
- [ ] Auto-increment logic for enums

### **Week 4: Integration**
- [ ] All features working together
- [ ] Wild Boa Snake compatibility validated
- [ ] Error handling comprehensive

### **Week 5: Testing and Polish**
- [ ] Comprehensive test suite complete
- [ ] Performance validation done
- [ ] Edge cases handled

### **Week 6: Documentation and Release**
- [ ] Documentation updated
- [ ] Examples created and tested
- [ ] Release preparation complete

---

## Post-v0.2 Preparation

### **Foundation for v0.3+:**
- AST extensions provide foundation for semantic analysis
- New language constructs prepare for local variables architecture
- Enhanced parser infrastructure supports future features

### **Backend Integration:**
When semantic analysis is implemented, it will need to handle:
- Break/continue semantic validation (loop context)
- Match statement exhaustiveness checking
- Enum constant value resolution and type checking

### **Long-term Architecture:**
v0.2 language features integrate cleanly with:
- Local pool architecture (v0.3+)
- Advanced optimization passes
- Multi-target code generation
- Advanced debugging and IDE support

---

## Implementation Dependencies

### **Prerequisites:**
- Current lexer/parser/AST packages (✅ READY)
- Testing infrastructure in place
- AI assistance tools configured
- Development environment set up

### **No Dependencies:**
- No semantic analysis required
- No IL or code generation needed
- No backend compiler phases required
- Can proceed immediately with current codebase

### **Parallel Development:**
- Backend development can proceed in parallel
- No conflicts with semantic analysis → IL → codegen work
- Clean handoff when backend ready to handle v0.2 features

---

**Status:** APPROVED - Ready for immediate implementation
**Next Action:** Begin Task 1.1 (Add New Token Types)
**Expected Completion:** 6-8 weeks with comprehensive testing and documentation
