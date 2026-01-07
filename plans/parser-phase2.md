# Phase 2 Parser Implementation Plan

> **Objective:** Extend the Blend65 parser from Phase 1 scaffolding to fully parse top-level declarations (module, import, export, function, type alias, enum, variable) while enforcing ordering rules derived from `plans/ordering.md`, capturing decorator/storage metadata, and emitting meaningful diagnostics plus comprehensive tests.

## 1. Context & Goals
- Reuse Phase 1 infrastructure (`Parser` shell, AST enums, diagnostics helpers).
- Produce real AST nodes for every top-level declaration the lexer can describe.
- Enforce file-ordering constraints that reflect 6502 build expectations (single module, globals-only bodies, exported `main`).
- Preserve enough metadata (spans, decorators, export flags, callback indicators) for downstream analyzer/codegen.
- Keep implementation compliant with `.clinerules` (DRY, documented, JSDoc, tests for everything).

## 2. Ordering & Module Rules
1. **Single module per file.** First non-trivia token must be `module`. If absent, synthesize `module global` automatically.
2. **Implicit global module guard.** Once `module global` is synthesized, encountering any real `module` later raises a diagnostic (the implicit module is _not_ replaced).
3. **Globals-only body.** After the module header, allow only:
   - Storage-class-prefixed `let`/`const` variables (global scope only).
   - `function` declarations (optionally `export` and/or `callback`).
   - `export` wrappers around compatible declarations.
   Any other top-level token triggers a diagnostic and recovery.
4. **Exports.** Functions and variables can be explicitly exported via `export`. Type/enum exports are also supported for future use. AST should carry both wrapper nodes and boolean `isExported` flags where helpful.
5. **Main entry point.**
   - A function named `main` must be exported. If `export` keyword is missing, parser sets `isExported = true` and emits a warning encouraging explicit export.
   - Track exported `main` functions per parser instance; additional occurrences emit an error diagnostic.
6. **No duplicate modules.** A second `module` declaration (even matching name) triggers an error and synchronization.

## 3. Declaration Parsing Requirements
### 3.1 Module Declaration
- Syntax: `module Identifier ('.' Identifier)*` followed by newline(s).
- Capture qualified name as `IdentifierNode[]`.
- Record span covering full statement.

### 3.2 Import Declaration
- Syntax: `import ident (, ident)* from name.path`.
- Support newline separators and optional trailing commas.
- Emit diagnostics for missing `from`, empty import lists, or invalid identifiers.

### 3.3 Export Declaration
- Grammar: `export <declaration>` where declaration is function, variable, type alias, or enum.
- Parser wraps resulting node in `ExportDeclarationNode` and marks inner node as exported when applicable.

### 3.4 Function Declaration
- Supports optional `export` (handled as wrapper) and optional `callback` keyword (sets `isCallback = true`).
- Syntax: `function name (paramList?) : returnType?` followed by block terminated by `end function`.
- Parameters: `identifier ':' typeExpr`, comma separated.
- Return type optional; default `void` implied later by analyzer.
- Block body currently stored as empty list until Phase 4 adds statements; Phase 2 can accept blank bodies but must enforce `end function` terminator.

### 3.5 Type Alias Declaration
- Syntax: `type Name = typeExpr` (arrays allowed via `[]`).
- No body terminator; single-line statement.

### 3.6 Enum Declaration
- Syntax: `enum Name NEWLINE members newline* end enum`.
- Members optionally `= expression` (expression parsing stubbed until Phase 3; for now capture literal tokens or leave placeholder expressions?). At minimum, record identifier names and optional literal tokens for future evaluation.
- Require `end enum` terminator.

### 3.7 Variable Declaration
- Syntax: `[storageClass] (let|const) name [: typeExpr]? [= initializer]?`.
- Storage classes restricted to `@zp`, `@ram`, `@data`. Represent as decorator nodes tagged `DecoratorKind.StorageClass` and also set `storageClass` shortcut field on the variable node.
- `const` declarations **must** include initializer per ordering doc; parser will emit diagnostic if missing (analyzer may further enforce semantics later).

## 4. Decorators & Storage Classes
- Introduce `parseDecoratorList()` even if only storage classes exist today to future-proof.
- For now, treat storage keywords as decorator tokens that immediately precede declarations.
- Attach resulting decorator array via `withDecorators` helper so nodes share metadata path.

## 5. AST & Factory Updates
- Add factory helpers to `factory.ts` for:
  - `createModuleDeclaration(name: IdentifierNode[], options)`
  - `createImportDeclaration(symbols: IdentifierNode[], source: IdentifierNode[], options)`
  - `createExportDeclaration(declaration: DeclarationNode, options)`
  - `createFunctionDeclaration(details, options)` (with `isCallback`/`isExported`).
  - `createTypeAliasDeclaration(name, type, options)`
  - `createEnumDeclaration(name, members, options)` + `createEnumMember` helper.
  - `createVariableDeclaration(name, type?, initializer?, isConst, storageClass?, options)`
  - `createParameter(name, type, options)`
  - `createTypeReference(qualifiedName, arrayLength?, options)`
- Ensure every helper has JSDoc (per `.clinerules`), uses `createNode`, and stays DRY.

## 6. Parser Architecture Changes
1. **Program bootstrap**
   - `parseProgram` checks first non-trivia token for `module`; if missing, synthesize implicit module node (`global`) and push onto program body before continuing.
2. **Dispatcher**
   - `parseTopLevelItem` now:
     - Ensures module exists; if not yet parsed, only allows module declarations.
     - Gathers decorators/storage classes.
     - Routes to declaration-specific parsers based on upcoming tokens.
3. **Helpers**
   - `parseModuleDeclaration`, `parseImportDeclaration`, etc., each with dedicated recovery strategy.
   - `parseIdentifierPath(): IdentifierNode[]` for dotted names.
   - `expectKeyword(text)` utility to consume specific keyword tokens.
   - `expectTerminator(kind)` to validate `end <keyword>` sequences.
   - `parseParameterList`, `parseTypeReference`, `parseEnumMembers`.
   - `parseVariableDeclarator` to share logic between globals and future statements.
4. **State tracking**
   - Flags: `hasExplicitModule`, `hasImplicitModule`, `exportedMainCount`.
   - Possibly `sawMainFunction` to emit duplicate warnings.
5. **Recovery**
   - Each parser method defines sync tokens (e.g., newline, `end`, next declaration keyword) to avoid infinite loops.

## 7. Diagnostics Plan
Add/extend diagnostic codes as necessary (update `ParserDiagnosticCode`):
- `DuplicateModuleDeclaration`
- `MissingModuleDeclaration` (warning when implicit global inserted)
- `UnexpectedTopLevelToken`
- `MissingFromClause`
- `EmptyImportList`
- `MissingEndFunction`, `MissingEndEnum`
- `MissingConstInitializer`
- `DuplicateExportedMain`
- `ImplicitMainExport` (warning when `main` lacked `export`)

Diagnostics should explain ordering rationale and include spans covering offending tokens. Recovery should advance to next newline or declaration keyword.

## 8. Testing Strategy (per `.clinerules/testing.md`)
1. **Unit tests (parser-only)**
   - New fixtures in `__tests__/parser/` verifying each declaration kind (happy path + error cases).
   - Snapshot ASTs (Vitest inline snapshots are sufficient) to ensure node structure, spans, decorator metadata, export flags, callback flags, etc. JSON golden files are intentionally avoided to keep maintenance overhead low.
2. **Integration tests (lexer → parser)**
   - Multi-line source snippets covering module + imports + exports + functions + enums + variables.
   - Cases for implicit `module global`, duplicate modules, missing terminators, auto-exported `main`, wildcard namespace imports, and forbidden wildcard-path imports.
3. **Error coverage**
   - Missing identifiers, invalid import syntax, `const` without initializer, `main` duplicates, stray statements at top level, storage decorator misuse, re-exports, and wildcard path misuse.

## 9. Out-of-Scope / Delegated to Analyzer
- Enforcing import ordering or grouping by storage class.
- Detecting global expression statements beyond parser-level diagnostics.
- Validating that callback functions map to IRQ vectors.
- Ensuring constant expressions are valid or evaluating enum initializers.
- Cross-file checks ("only one exported main in entire compilation")—parser only enforces per file; analyzer handles global view.

## 10. Exit Criteria
- All declaration parsers implemented with comments + JSDoc.
- AST factory helpers updated and covered by tests.
- Diagnostics for every ordering rule and error case.
- Test suite expanded as described; `yarn clean && yarn build && yarn test` passes.
- Documentation updated (this plan + roadmap notes if necessary) to reflect Phase 2 readiness.
