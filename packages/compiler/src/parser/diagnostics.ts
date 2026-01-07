/**
 * Diagnostic primitives shared by parser, analyzer, and future tooling.
 * Using enums keeps codes and severity names DRY per coding guidelines.
 */

import type { SourceSpan } from './source.js';

/**
 * Classification of diagnostic severity. Additional levels can be added later
 * (for example, `Suggestion`) without rewriting existing switch statements.
 */
export enum ParserDiagnosticSeverity {
  Error = 'Error',
  Warning = 'Warning',
  Info = 'Info',
}

/**
 * Unique identifiers for diagnostics. Prefixing with `PAR` leaves room for
 * analyzer (`ANA0001`), optimizer, or codegen codes later.
 */
export enum ParserDiagnosticCode {
  /**
   * Emitted when the parser encounters a token that does not match the expected
   * production (e.g., seeing `let` where a module keyword is required).
   */
  UnexpectedToken = 'PAR0001',
  /**
   * Signals that the token stream terminated before the current construct could
   * be fully parsed (e.g., missing `end function`).
   */
  UnexpectedEOF = 'PAR0002',
  /**
   * Raised when a required identifier is missing, such as `function` without a
   * name or `module` without an identifier.
   */
  MissingIdentifier = 'PAR0003',
  /**
   * Indicates that a declaration keyword is missing before a top-level
   * identifier, keeping ordering semantics explicit.
   */
  MissingDeclarationKeyword = 'PAR0004',
  /**
   * Generic guard for blocks that lack their terminating keyword when recovery
   * cannot determine the specific declaration kind.
   */
  UnterminatedBlock = 'PAR0005',
  /**
   * Reported when the same identifier is declared multiple times in a scope,
   * preserving single-responsibility naming.
   */
  DuplicateDeclaration = 'PAR0006',
  /**
   * Ensures decorators only appear where supported (e.g., globals/functions) so
   * ordering-sensitive metadata stays predictable.
   */
  InvalidDecoratorPlacement = 'PAR0007',
  /**
   * Guardrail keeping module declarations unique per file. Encountering a second
   * `module` after the implicit `global` triggers this diagnostic.
   */
  DuplicateModuleDeclaration = 'PAR0008',
  /**
   * Raised when a file omits an explicit module and implicit synthesis is
   * disabled or unavailable, reminding authors about `module global` behavior.
   */
  MissingModuleDeclaration = 'PAR0009',
  /**
   * Catch-all for stray tokens at the top level so recovery can continue toward
   * the next declaration boundary.
   */
  UnexpectedTopLevelToken = 'PAR0010',
  /**
   * Import declarations must include a `from` clause to document their source;
   * this diagnostic fires when it is omitted.
   */
  MissingFromClause = 'PAR0011',
  /**
   * Enforces that import lists are non-empty (e.g., `import from Foo` is
   * meaningless), anchoring ordering expectations early.
   */
  EmptyImportList = 'PAR0012',
  /**
   * Warns when a function block reaches EOF without `end function`, preventing
   * later declarations from drifting.
   */
  MissingEndFunction = 'PAR0013',
  /**
   * Parallel to {@link MissingEndFunction} but for enums, guaranteeing `end
   * enum` anchors parser recovery.
   */
  MissingEndEnum = 'PAR0014',
  /**
   * Future analyzer enforcement placeholder ensuring compile-time constants are
   * initialized; included here for completeness with ordering diagnostics.
   */
  MissingConstInitializer = 'PAR0015',
  /**
   * Only one exported `main` may exist across the program. Additional exported
   * mains trigger this error to protect entry-point determinism.
   */
  DuplicateExportedMain = 'PAR0016',
  /**
   * When `main` lacks an explicit `export`, the parser will auto-export it while
   * emitting this warning so the behavior remains visible to authors.
   */
  ImplicitMainExport = 'PAR0017',
  /**
   * Fallback for unexpected parser states so downstream tooling can flag bugs
   * without crashing the compilation pipeline.
   */
  InternalParserError = 'PAR9999',
}

/** Related location information for richer error messages. */
export interface RelatedInformation {
  /** Source span associated with the related note. */
  span: SourceSpan;
  /** Brief explanation presented alongside the note. */
  message: string;
}

/**
 * Canonical diagnostic payload.
 */
export interface ParserDiagnostic {
  /** Stable identifier that maps to documentation and tests. */
  code: ParserDiagnosticCode;
  /** Severity category consumers can filter on. */
  severity: ParserDiagnosticSeverity;
  /** Human-readable description of the problem. */
  message: string;
  /** Primary source span where the issue occurs. */
  span: SourceSpan;
  /** Optional supplemental notes (e.g., previous definition locations). */
  relatedInformation?: RelatedInformation[];
}

/**
 * Factory helper to keep diagnostic creation consistent.
 *
 * @param code - Identifier for the diagnostic template.
 * @param severity - Severity level of the diagnostic instance.
 * @param message - Human-readable description of the problem.
 * @param span - Primary source location tied to the diagnostic.
 * @param relatedInformation - Optional supplemental notes.
 */
export function createParserDiagnostic(
  code: ParserDiagnosticCode,
  severity: ParserDiagnosticSeverity,
  message: string,
  span: SourceSpan,
  relatedInformation?: RelatedInformation[]
): ParserDiagnostic {
  return {
    code,
    severity,
    message,
    span,
    relatedInformation,
  };
}
