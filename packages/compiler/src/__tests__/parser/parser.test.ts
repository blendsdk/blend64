import { describe, expect, it } from 'vitest';
import type { LexerOptions } from '../../lexer/lexer.js';
import { tokenize } from '../../lexer/utils.js';
import type { Token } from '../../lexer/types.js';
import { TokenType } from '../../lexer/types.js';
import {
  AstNodeKind,
  Parser,
  ParserDiagnosticCode,
  createParserState,
  type ParserOptions,
  type ParserState,
  parseTokens,
} from '../../parser/index.js';

/**
 * Minimal parser subclass used to surface protected members for white-box tests.
 */
class TestHarnessParser extends Parser {
  /**
   * Exposes parser options so tests can ensure caller-provided objects remain intact.
   */
  public exposeOptions(): ParserOptions {
    return this.options;
  }

  /**
   * Exposes parser state so unit tests can perform white-box assertions.
   */
  public exposeState(): ParserState {
    return this.state;
  }
}

/**
 * Creates a token with zeroed span data for direct parser invocations.
 *
 * @param type - Token kind to synthesize.
 * @param value - Optional token text (defaults to empty string).
 * @returns Token instance ready for parseTokens.
 */
function createToken(type: TokenType, value = ''): Token {
  return {
    type,
    value,
    start: { line: 0, column: 0, offset: 0 },
    end: { line: 0, column: 0, offset: 0 },
  };
}

const LEXER_OPTIONS: LexerOptions = {
  skipComments: false,
  skipWhitespace: true,
};

/**
 * Runs the real lexer over raw source text so parser specs stay end-to-end.
 *
 * @param source - Raw Blend65 code snippet under test.
 * @param overrides - Optional lexer configuration overrides for individual specs.
 * @returns Token stream emitted by the lexer.
 */
function lexSource(source: string, overrides: Partial<LexerOptions> = {}): Token[] {
  return tokenize(source, { ...LEXER_OPTIONS, ...overrides });
}

/**
 * Convenience helper that feeds lexed tokens directly into the parser entry point.
 *
 * @param source - Raw source text to tokenize and parse.
 * @param options - Optional parser configuration switches propagated to Parser.
 * @returns Result emitted by parseTokens for the provided source.
 */
function parseSource(source: string, options?: ParserOptions) {
  return parseTokens(lexSource(source), options);
}

/**
 * Builds a parser that immediately exposes its internal state for assertions.
 * Keeping the helper local avoids scattering token boilerplate across specs.
 *
 * @param tokens - Token array fed straight into the parser constructor.
 */
function createStatefulParser(tokens: Token[] = [createToken(TokenType.EOF)]) {
  return new TestHarnessParser(tokens, {});
}

describe('Parser state bookkeeping', () => {
  it('initializes deterministic defaults via factory helper', () => {
    const state = createParserState();

    expect(state).toMatchObject({
      hasExplicitModule: false,
      hasImplicitModule: false,
      sawMainFunction: false,
      exportedMainCount: 0,
    });
    expect(state.firstExportedMainSpan).toBeUndefined();
  });

  it('returns isolated state objects on each invocation', () => {
    const first = createParserState();
    const second = createParserState();

    expect(first).not.toBe(second);
  });

  it('attaches a fresh parser state per parser instance', () => {
    const parserA = createStatefulParser();
    const parserB = createStatefulParser();

    parserA.exposeState().hasExplicitModule = true;

    expect(parserB.exposeState().hasExplicitModule).toBe(false);
  });

  it('marks explicit modules when declaration parsing is triggered', () => {
    const parser = createStatefulParser([
      createToken(TokenType.MODULE),
      createToken(TokenType.IDENTIFIER, 'demo'),
      createToken(TokenType.EOF),
    ]);

    parser.parseProgram();

    expect(parser.exposeState().hasExplicitModule).toBe(true);
  });
});

describe('Parser scaffolding (token level)', () => {
  it('returns an empty program when only EOF is provided', () => {
    const result = parseTokens([createToken(TokenType.EOF)]);

    expect(result.program.kind).toBe(AstNodeKind.Program);
    expect(result.program.body).toHaveLength(0);
    expect(result.diagnostics).toHaveLength(0);
  });

  it('emits diagnostics for unexpected tokens', () => {
    const result = parseTokens([
      createToken(TokenType.IDENTIFIER, 'foo'),
      createToken(TokenType.EOF),
    ]);

    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0].code).toBe(ParserDiagnosticCode.MissingDeclarationKeyword);
    expect(result.diagnostics[0].message).toContain('declaration keyword');
  });

  it('recovers after diagnostics and continues parsing', () => {
    const result = parseTokens([
      createToken(TokenType.IDENTIFIER, 'foo'),
      createToken(TokenType.NEWLINE),
      createToken(TokenType.IDENTIFIER, 'bar'),
      createToken(TokenType.EOF),
    ]);

    expect(result.diagnostics).toHaveLength(2);
    expect(result.program.body).toHaveLength(0);
  });

  it('synthesizes an implicit EOF token when none are provided', () => {
    const result = parseTokens([]);

    expect(result.program.body).toHaveLength(0);
    expect(result.diagnostics).toHaveLength(0);
  });

  it('emits missing identifier diagnostics when declaration keyword lacks a name', () => {
    const parser = new TestHarnessParser(
      [createToken(TokenType.MODULE), createToken(TokenType.NEWLINE), createToken(TokenType.EOF)],
      {}
    );
    parser.parseProgram();

    expect(parser.diagnostics).toHaveLength(1);
    expect(parser.diagnostics[0].code).toBe(ParserDiagnosticCode.MissingIdentifier);
  });

  it('emits unexpected EOF diagnostics when declarations miss names', () => {
    const parser = new TestHarnessParser(
      [createToken(TokenType.MODULE), createToken(TokenType.EOF)],
      {}
    );
    parser.parseProgram();

    expect(parser.diagnostics).toHaveLength(1);
    expect(parser.diagnostics[0].code).toBe(ParserDiagnosticCode.UnexpectedEOF);
  });
});

describe('Parser end-to-end behavior (source → lexer → parser)', () => {
  it('parses an empty source file into an empty program', () => {
    const result = parseSource('');

    expect(result.program.body).toHaveLength(0);
    expect(result.diagnostics).toHaveLength(0);
    expect(result.program.span.start.offset).toBe(0);
    expect(result.program.span.end.offset).toBe(0);
  });

  it('skips trivia tokens such as comments and blank lines', () => {
    const source = `// greeting\n/* block comment */\n\n`;
    const result = parseSource(source);

    expect(result.program.body).toHaveLength(0);
    expect(result.diagnostics).toHaveLength(0);
  });

  it('emits diagnostics for unexpected top-level identifiers from real lexer output', () => {
    const result = parseSource('foo');

    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0].code).toBe(ParserDiagnosticCode.MissingDeclarationKeyword);
    expect(result.diagnostics[0].message).toContain('declaration keyword');
  });

  it('recovers across newline boundaries without entering infinite loops', () => {
    const result = parseSource('foo\nbar');

    expect(result.diagnostics).toHaveLength(2);
    expect(result.diagnostics[0].code).toBe(ParserDiagnosticCode.MissingDeclarationKeyword);
    expect(result.diagnostics[1].code).toBe(ParserDiagnosticCode.MissingDeclarationKeyword);
    expect(result.program.body).toHaveLength(0);
  });

  it('synchronizes on declaration keywords such as module', () => {
    const result = parseSource('foo\nmodule\n');

    expect(result.diagnostics).toHaveLength(2);
    expect(result.diagnostics[0].code).toBe(ParserDiagnosticCode.MissingDeclarationKeyword);
    expect(result.diagnostics[1].code).toBe(ParserDiagnosticCode.MissingIdentifier);
    expect(result.program.body).toHaveLength(0);
  });

  it('computes a program span that covers the entire lexed input', () => {
    const source = 'foo\n';
    const result = parseSource(source);

    expect(result.program.span.start.line).toBe(1);
    expect(result.program.span.start.column).toBe(1);
    expect(result.program.span.end.line).toBe(2);
    expect(result.program.span.end.column).toBe(1);
  });

  it('passes parser options through without mutation', () => {
    const options: ParserOptions = { captureDocComments: true };
    const parser = new TestHarnessParser(lexSource(''), options);

    expect(parser.exposeOptions()).toEqual(options);
  });
});
