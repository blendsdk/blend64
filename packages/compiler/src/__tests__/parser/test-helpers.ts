/**
 * Shared test utilities for parser specs. Centralizing helpers keeps parser
 * tests DRY and makes it easier for new contributors to craft scenarios without
 * re-creating boilerplate token/harness logic.
 */

import type { LexerOptions } from '../../lexer/lexer.js';
import { tokenize } from '../../lexer/utils.js';
import type { Token } from '../../lexer/types.js';
import { TokenType } from '../../lexer/types.js';
import {
  Parser,
  type ParserOptions,
  type ParserResult,
  type ParserState,
  parseTokens,
} from '../../parser/index.js';

/**
 * Default lexer configuration used across parser tests unless overridden.
 * Keeping a single source of truth helps future tweaks (like whitespace
 * handling) remain consistent across suites.
 */
export const DEFAULT_LEXER_OPTIONS: LexerOptions = {
  skipComments: false,
  skipWhitespace: true,
};

/**
 * Creates a token with zeroed span information for white-box parser tests.
 *
 * @param type - Token kind to synthesize.
 * @param value - Optional textual payload for the token.
 * @returns Token instance ready to be fed into the parser.
 */
export function createToken(type: TokenType, value = ''): Token {
  return {
    type,
    value,
    start: { line: 0, column: 0, offset: 0 },
    end: { line: 0, column: 0, offset: 0 },
  };
}

/**
 * Runs the real lexer over Blend65 source text so parser specs stay end-to-end.
 *
 * @param source - Raw code snippet to tokenize.
 * @param overrides - Partial lexer options applied on top of defaults.
 * @returns Token array emitted by the lexer.
 */
export function lexSource(source: string, overrides: Partial<LexerOptions> = {}): Token[] {
  return tokenize(source, { ...DEFAULT_LEXER_OPTIONS, ...overrides });
}

/**
 * Convenience helper that lexes and parses in a single call, mirroring the
 * public parser entry point for integration-style tests.
 *
 * @param source - Raw Blend65 code snippet under test.
 * @param options - Parser configuration switches forwarded to {@link parseTokens}.
 * @returns Parser result containing the program node and diagnostics.
 */
export function parseSource(source: string, options?: ParserOptions): ParserResult {
  return parseTokens(lexSource(source), options);
}

/**
 * Minimal parser subclass exposing internal state for white-box assertions.
 * Tests can extend this harness to reach protected helpers safely.
 */
export class ParserTestHarness extends Parser {
  /** Provides read-only access to the parser options passed to the constructor. */
  public exposeOptions(): ParserOptions {
    return this.options;
  }

  /** Surfaces the mutable parser state for direct inspection in specs. */
  public exposeState(): ParserState {
    return this.state;
  }
}

/**
 * Instantiates a parser harness with a provided token stream. Supplying the
 * helper keeps tests concise and guarantees an EOF token exists.
 *
 * @param tokens - Token array ending with EOF (synthesized when omitted).
 * @returns Parser harness instance ready for parsing or direct helper usage.
 */
export function createStatefulParser(tokens: Token[] = [createToken(TokenType.EOF)]): ParserTestHarness {
  return new ParserTestHarness(tokens, {});
}
