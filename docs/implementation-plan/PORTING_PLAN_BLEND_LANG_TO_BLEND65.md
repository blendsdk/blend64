# Detailed Porting Implementation Plan: Blend-Lang to Blend65

## Overview
This plan ports the lexer, parser, and AST from `/Users/gevik/workdir/blend-lang` to `/Users/gevik/workdir/blend64`, refactoring them for the Blend65 language specification. Each task is designed for AI context limitations (<30K tokens) and builds incrementally.

---

## PHASE 1: LEXER PORTING (7 tasks)

### Task 1.1: Create Base Lexer Structure
**File:** `packages/lexer/src/types.ts`
**Goal:** Update TokenType enum for Blend65 language
**Changes:**
- Remove OOP-related tokens (`class`, `interface`, `extends`, `implements`, `public`, `private`, `protected`)
- Add Blend65 keywords: `module`, `import`, `export`, `from`, `target`, `function`, `end`, `then`, `next`, `to`, `case`, `match`
- Add storage class tokens: `zp`, `ram`, `data`, `const`, `io`
- Remove increment/decrement operators (`++`, `--`) - not in Blend65
- Add `@` token for memory placement syntax
- Add `extends` token for record inheritance
**Test:** Verify all new tokens can be recognized
**Success:** TokenType enum matches Blend65 specification

### Task 1.2: Update Keyword Recognition
**File:** `packages/lexer/src/blend-lexer.ts` (new file)
**Goal:** Create Blend65-specific lexer with correct keywords
**Changes:**
- Create keyword set with Blend65 reserved words
- Update `lexIdentOrKeyword()` to recognize new keywords
- Remove `true`/`false` literals (use explicit boolean values)
- Change null literal from `nothing` to match Blend65 spec
**Test:** Parse Blend65 keywords correctly
**Success:** All Blend65 keywords recognized as KEYWORD tokens

### Task 1.3: Add Storage Class Syntax Support
**File:** `packages/lexer/src/lexer.ts`
**Goal:** Support storage prefix syntax and memory placement
**Changes:**
- Add `@` symbol lexing for memory placement (`@ $D000`)
- Update number lexing to handle hex addresses
- Ensure storage keywords (`zp`, `ram`, `data`, `const`, `io`) are tokenized
- Test with examples: `zp var counter: byte`, `io var VIC_REG: byte @ $D000`
**Test:** Parse storage declarations correctly
**Success:** Storage syntax tokens recognized properly

### Task 1.4: Remove Unsupported Features
**File:** `packages/lexer/src/lexer.ts`
**Goal:** Remove language features not in Blend65 v0.1
**Changes:**
- Remove template string lexing (no string interpolation in Blend65)
- Remove increment/decrement operator lexing (`++`, `--`)
- Remove null coalescing (`??`) and optional chaining
- Remove arrow function syntax (`=>`)
- Simplify to basic operators needed for Blend65
**Test:** Verify unsupported syntax throws appropriate errors
**Success:** Lexer rejects non-Blend65 syntax

### Task 1.5: Update Numeric Literal Support
**File:** `packages/lexer/src/lexer.ts`
**Goal:** Support Blend65 numeric formats
**Changes:**
- Ensure hex literals work for memory addresses (`$D000` or `0xD000`)
- Support binary literals for bit manipulation (`0b1010`)
- Add decimal byte/word validation (0-255 for byte, 0-65535 for word)
- Remove float support (no floating point in Blend65)
**Test:** Parse various Blend65 number formats
**Success:** All Blend65 numeric formats supported

### Task 1.6: Add Target Import Syntax
**File:** `packages/lexer/src/lexer.ts`
**Goal:** Support target-specific import syntax
**Changes:**
- Ensure colon (`:`) is tokenized for `target:module` syntax
- Support qualified identifiers with dots (`Game.Main`)
- Handle machine identifiers (`c64:sprites`, `x16:vera`)
**Test:** Parse import statements correctly
**Success:** Target import syntax tokenized properly

### Task 1.7: Lexer Integration and Testing
**File:** `packages/lexer/src/index.ts`
**Goal:** Create complete Blend65 lexer API
**Changes:**
- Export Blend65-specific lexer class
- Create helper function for keyword set creation
- Add comprehensive test suite for all Blend65 syntax
- Validate against Blend65 specification examples
**Test:** Full lexer test suite passes
**Success:** Complete, working Blend65 lexer

---

## PHASE 2: AST PORTING (6 tasks)

### Task 2.1: Remove OOP AST Nodes
**File:** `packages/ast/src/ast-types/core.ts`
**Goal:** Remove object-oriented language constructs
**Changes:**
- Remove `NewExpr`, `ThisExpr` from Expression union
- Remove class-related nodes from AST
- Remove interface-related functionality
- Keep only functional programming constructs
- Update Expression and Statement unions accordingly
**Test:** AST builds without OOP references
**Success:** Clean functional AST without OOP nodes

### Task 2.2: Add Blend65 Type System Nodes
**File:** `packages/ast/src/ast-types/types.ts`
**Goal:** Create Blend65-specific type annotations
**Changes:**
- Add `ByteType`, `WordType`, `BooleanType` nodes
- Add `ArrayType` with fixed-size constraints
- Add `RecordType` for struct definitions
- Remove complex type features (generics, unions, etc.)
- Add storage class annotations (`zp`, `ram`, `data`, `const`, `io`)
**Test:** Type nodes represent Blend65 type system
**Success:** Complete Blend65 type system in AST

### Task 2.3: Add Storage Declaration Nodes
**File:** `packages/ast/src/ast-types/core.ts`
**Goal:** Support variable declarations with storage classes
**Changes:**
- Update `VariableDeclaration` to include storage class
- Add `MemoryPlacement` node for `@ address` syntax
- Support storage prefixes: `zp var`, `ram var`, `data var`, etc.
- Add `StorageClass` enum: `zp`, `ram`, `data`, `const`, `io`
**Test:** Storage declarations represented correctly
**Success:** All storage syntax in AST

### Task 2.4: Add Module System Nodes
**File:** `packages/ast/src/ast-types/modules.ts`
**Goal:** Support Blend65 module and import system
**Changes:**
- Add `ModuleDeclaration` node
- Add `ImportDeclaration` with target resolution support
- Add `ExportDeclaration` node
- Support `target:module` and `machine:module` syntax
- Add qualified name support (`Game.Main`)
**Test:** Module system nodes work correctly
**Success:** Complete module system in AST

### Task 2.5: Update Control Flow Nodes
**File:** `packages/ast/src/ast-types/core.ts`
**Goal:** Match Blend65 control flow syntax
**Changes:**
- Update `IfStatement` to support `if...then...end if` syntax
- Update `WhileStatement` for `while...end while`
- Add `ForToStatement` for `for i = 0 to 255...next`
- Add `MatchStatement` for `match...case...end match`
- Remove unsupported statements (try/catch, throw)
**Test:** Control flow nodes match specification
**Success:** Blend65 control flow in AST

### Task 2.6: AST Integration and Cleanup
**File:** `packages/ast/src/index.ts`
**Goal:** Complete, clean Blend65 AST
**Changes:**
- Remove all OOP exports
- Export only Blend65-compatible nodes
- Update main AST union types
- Create comprehensive type exports
- Add AST node creation helpers
**Test:** AST API is clean and complete
**Success:** Production-ready Blend65 AST

---

## PHASE 3: PARSER PORTING (8 tasks)

### Task 3.1: Create Base Blend65 Parser Structure
**File:** `packages/parser/src/blend65-parser.ts` (new file)
**Goal:** Set up recursive descent parser for Blend65
**Changes:**
- Extend `RecursiveDescentParser` with Blend65-specific methods
- Set up operator precedence for Blend65 operators only
- Remove assignment operators not in Blend65
- Configure parser for Blend65 keyword set
**Test:** Basic parser structure compiles
**Success:** Foundation for Blend65 parsing

### Task 3.2: Implement Module and Import Parsing
**File:** `packages/parser/src/blend65-parser.ts`
**Goal:** Parse module declarations and imports
**Changes:**
- Add `parseModuleDeclaration()` method
- Add `parseImportDeclaration()` with target resolution
- Add `parseExportDeclaration()` method
- Support qualified names and target syntax
- Parse: `module Game.Main`, `import func from target:sprites`
**Test:** Module syntax parses correctly
**Success:** Complete module system parsing

### Task 3.3: Implement Storage Declaration Parsing
**File:** `packages/parser/src/blend65-parser.ts`
**Goal:** Parse variable declarations with storage classes
**Changes:**
- Add `parseStorageDeclaration()` method
- Support all storage prefixes: `zp`, `ram`, `data`, `const`, `io`
- Parse memory placement syntax: `@ $D000`
- Handle type annotations: `: byte`, `: word`, `: boolean`
- Parse arrays: `byte[8]`, `word[256]`
**Test:** Storage declarations parse correctly
**Success:** Complete storage syntax parsing

### Task 3.4: Implement Function Declaration Parsing
**File:** `packages/parser/src/blend65-parser.ts`
**Goal:** Parse Blend65 function syntax
**Changes:**
- Add `parseFunctionDeclaration()` method
- Support `function name(params): returnType` syntax
- Parse parameter lists with type annotations
- Support `end function` terminator
- Handle export functions
**Test:** Function declarations parse correctly
**Success:** Complete function parsing

### Task 3.5: Implement Control Flow Parsing
**File:** `packages/parser/src/blend65-parser.ts`
**Goal:** Parse Blend65 control flow statements
**Changes:**
- Add `parseIfStatement()` for `if...then...end if`
- Add `parseWhileStatement()` for `while...end while`
- Add `parseForToStatement()` for `for i = 0 to 255...next`
- Add `parseMatchStatement()` for `match...case...end match`
- Support block parsing with proper terminators
**Test:** All control flow parses correctly
**Success:** Complete control flow parsing

### Task 3.6: Implement Type and Record Parsing
**File:** `packages/parser/src/blend65-parser.ts`
**Goal:** Parse Blend65 type system
**Changes:**
- Add `parseTypeDeclaration()` for record types
- Support `type Name extends Other` syntax
- Parse field declarations with types
- Add `end type` terminator parsing
- Support primitive types: `byte`, `word`, `boolean`
**Test:** Type declarations parse correctly
**Success:** Complete type system parsing

### Task 3.7: Implement Expression Parsing
**File:** `packages/parser/src/blend65-parser.ts`
**Goal:** Parse Blend65 expressions correctly
**Changes:**
- Override `parsePrimaryExpression()` for Blend65 literals
- Remove unsupported expressions (new, this, template strings)
- Support function calls and member access
- Parse array indexing and member access
- Handle boolean operators: `and`, `or`, `not`
**Test:** Expressions parse correctly
**Success:** Complete expression parsing

### Task 3.8: Parser Integration and Testing
**File:** `packages/parser/src/index.ts`
**Goal:** Complete, tested Blend65 parser
**Changes:**
- Export Blend65Parser class
- Create parsing utility functions
- Add comprehensive test suite
- Validate against Blend65 specification examples
- Integration testing with lexer and AST
**Test:** Full parser test suite passes
**Success:** Production-ready Blend65 parser

---

## Success Criteria

### Overall Goals:
1. **Lexer**: Recognizes all Blend65 syntax, rejects non-Blend65 features
2. **AST**: Represents complete Blend65 language without OOP features
3. **Parser**: Parses all Blend65 constructs according to specification
4. **Integration**: All components work together seamlessly
5. **Testing**: Comprehensive test coverage for all functionality

### Validation Tests:
- Parse complete Blend65 programs successfully
- Generate correct AST for multi-target code
- Handle storage declarations and memory placement
- Support target-specific imports properly
- Reject unsupported syntax with clear errors

---

## Implementation Notes

### Key Differences from Blend-Lang:
1. **No OOP**: Remove classes, interfaces, inheritance
2. **Storage Classes**: Add zp, ram, data, const, io prefixes
3. **Control Flow**: Different syntax (end if, end while, end function)
4. **Type System**: byte/word instead of number types
5. **Module System**: Target-aware imports (target:module syntax)
6. **No Advanced Features**: No templates, generics, exceptions

### Architecture Decisions:
- Maintain recursive descent parsing strategy
- Reuse precedence climbing for expressions
- Keep AST visitor pattern for future phases
- Preserve source location metadata for debugging
- Design for multi-target compilation from day one

### Testing Strategy:
- Unit tests for each component
- Integration tests between lexer/parser/AST
- Specification compliance tests
- Error handling and edge case tests

The plan provides **21 total tasks** across **3 phases**, each designed to fit within AI context limitations while building a complete, working Blend65 compiler frontend.

---

## Getting Started

To begin implementation:
1. Start with **Task 1.1** (Create Base Lexer Structure)
2. Work through tasks sequentially within each phase
3. Validate each task before proceeding to the next
4. Run integration tests at phase boundaries

Each task includes specific file paths, required changes, test criteria, and success metrics to ensure systematic progress toward a complete Blend65 compiler frontend.
