import { describe, expect, it } from 'vitest';
import { ParserDiagnosticCode, ParserDiagnosticSeverity } from '../../parser/index.js';
import { createParserDiagnostic } from '../../parser/diagnostics.js';
import { UNKNOWN_SOURCE_SPAN } from '../../parser/source.js';

/**
 * Ensures diagnostic enums remain stable and pre-populated with required codes.
 */
describe('ParserDiagnosticCode catalog', () => {
  it('covers the expected ordering and structure scenarios', () => {
    expect(ParserDiagnosticCode.UnexpectedToken).toBe('PAR0001');
    expect(ParserDiagnosticCode.UnexpectedEOF).toBe('PAR0002');
    expect(ParserDiagnosticCode.MissingIdentifier).toBe('PAR0003');
    expect(ParserDiagnosticCode.DuplicateModuleDeclaration).toBe('PAR0008');
    expect(ParserDiagnosticCode.MissingFromClause).toBe('PAR0011');
    expect(ParserDiagnosticCode.EmptyImportList).toBe('PAR0012');
    expect(ParserDiagnosticCode.DuplicateExportedMain).toBe('PAR0016');
    expect(ParserDiagnosticCode.ImplicitMainExport).toBe('PAR0017');
    expect(ParserDiagnosticCode.InternalParserError).toBe('PAR9999');
  });
});

/**
 * Verifies that diagnostic payloads retain message/severity bindings.
 */
describe('createParserDiagnostic', () => {
  it('produces diagnostics with exact code/severity/message triples', () => {
    const diagnostic = createParserDiagnostic(
      ParserDiagnosticCode.MissingFromClause,
      ParserDiagnosticSeverity.Error,
      'Import statements must include a from clause.',
      UNKNOWN_SOURCE_SPAN
    );

    expect(diagnostic.code).toBe(ParserDiagnosticCode.MissingFromClause);
    expect(diagnostic.severity).toBe(ParserDiagnosticSeverity.Error);
    expect(diagnostic.message).toBe('Import statements must include a from clause.');
    expect(diagnostic.span).toBe(UNKNOWN_SOURCE_SPAN);
    expect(diagnostic.relatedInformation).toBeUndefined();
  });

  it('propagates related information notes when provided', () => {
    const diagnostic = createParserDiagnostic(
      ParserDiagnosticCode.DuplicateExportedMain,
      ParserDiagnosticSeverity.Error,
      'Only one exported main function is permitted.',
      UNKNOWN_SOURCE_SPAN,
      [
        {
          span: UNKNOWN_SOURCE_SPAN,
          message: 'First exported main is declared here.',
        },
      ]
    );

    expect(diagnostic.relatedInformation).toHaveLength(1);
    expect(diagnostic.relatedInformation?.[0].message).toBe('First exported main is declared here.');
  });
});
