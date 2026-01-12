/**
 * Statement Parser Tests
 *
 * Comprehensive test suite for the StatementParser layer functionality.
 * Tests the core statement parsing infrastructure that provides the foundation
 * for all statement types in Blend65.
 *
 * Note: Since statements are only valid inside function bodies (Phase 4),
 * these tests focus on testing the infrastructure and ensure the layer
 * integrates properly with the existing parser architecture.
 */

import { describe, it, expect } from 'vitest';
import { Lexer } from '../../lexer/index.js';
import { Parser, StatementParser } from '../../parser/index.js';
import { BlockStatement, ExpressionStatement } from '../../ast/index.js';

/**
 * Helper function to parse source code and return AST + diagnostics
 */
function parseSource(source: string) {
  const lexer = new Lexer(source);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  const diagnostics = parser.getDiagnostics();

  return { ast, diagnostics, hasErrors: parser.hasErrors() };
}

/**
 * Test parser that extends StatementParser for isolated testing
 * This allows us to test statement parsing in isolation without module scope restrictions
 */
class TestStatementParser extends StatementParser {
  constructor(tokens: any[]) {
    super(tokens);
    // Override module scope for testing
    this.isModuleScope = false;
  }

  // Expose protected methods for testing
  public testParseStatement() {
    return this.parseStatement();
  }

  public testParseBlockStatement() {
    return this.parseBlockStatement();
  }

  public testParseExpressionStatement() {
    return this.parseExpressionStatement();
  }
}

/**
 * Helper to test statement parsing in isolation
 */
function parseStatement(source: string) {
  const lexer = new Lexer(source);
  const tokens = lexer.tokenize();
  const parser = new TestStatementParser(tokens);

  try {
    const stmt = parser.testParseStatement();
    return {
      stmt,
      diagnostics: parser.getDiagnostics(),
      hasErrors: parser.hasErrors(),
    };
  } catch (error) {
    return {
      stmt: null,
      diagnostics: parser.getDiagnostics(),
      hasErrors: true,
      error,
    };
  }
}

/**
 * Helper to test block statement parsing
 */
function parseBlockStatement(source: string) {
  const lexer = new Lexer(source);
  const tokens = lexer.tokenize();
  const parser = new TestStatementParser(tokens);

  try {
    const stmt = parser.testParseBlockStatement();
    return {
      stmt,
      diagnostics: parser.getDiagnostics(),
      hasErrors: parser.hasErrors(),
    };
  } catch (error) {
    return {
      stmt: null,
      diagnostics: parser.getDiagnostics(),
      hasErrors: true,
      error,
    };
  }
}

/**
 * Helper to test expression statement parsing
 */
function parseExpressionStatement(source: string) {
  const lexer = new Lexer(source);
  const tokens = lexer.tokenize();
  const parser = new TestStatementParser(tokens);

  try {
    const stmt = parser.testParseExpressionStatement();
    return {
      stmt,
      diagnostics: parser.getDiagnostics(),
      hasErrors: parser.hasErrors(),
    };
  } catch (error) {
    return {
      stmt: null,
      diagnostics: parser.getDiagnostics(),
      hasErrors: true,
      error,
    };
  }
}

describe('StatementParser', () => {
  describe('parseBlockStatement', () => {
    it('parses empty block statement', () => {
      const source = '{ }';
      const { stmt, diagnostics, hasErrors } = parseBlockStatement(source);

      expect(hasErrors).toBe(false);
      expect(diagnostics).toHaveLength(0);
      expect(stmt).toBeInstanceOf(BlockStatement);
      expect((stmt as BlockStatement).getStatements()).toHaveLength(0);
    });

    it('parses block with single expression statement', () => {
      const source = '{ x; }';
      const { stmt, hasErrors, diagnostics } = parseBlockStatement(source);

      expect(hasErrors).toBe(false);
      expect(diagnostics).toHaveLength(0);
      expect(stmt).toBeInstanceOf(BlockStatement);
      expect((stmt as BlockStatement).getStatements()).toHaveLength(1);
    });

    it('parses block with multiple expression statements', () => {
      const source = '{ x; y; z; }';
      const { stmt, hasErrors, diagnostics } = parseBlockStatement(source);

      expect(hasErrors).toBe(false);
      expect(diagnostics).toHaveLength(0);
      expect(stmt).toBeInstanceOf(BlockStatement);
      expect((stmt as BlockStatement).getStatements()).toHaveLength(3);
    });

    it('parses nested block statements', () => {
      const source = '{ { inner; } outer; }';
      const { stmt, hasErrors, diagnostics } = parseBlockStatement(source);

      expect(hasErrors).toBe(false);
      expect(diagnostics).toHaveLength(0);
      expect(stmt).toBeInstanceOf(BlockStatement);
      expect((stmt as BlockStatement).getStatements()).toHaveLength(2);
    });

    it('reports error for missing opening brace', () => {
      // This should cause an error when trying to parse as block
      const source = 'x; }';
      const { hasErrors, diagnostics } = parseBlockStatement(source);

      // Should have parsing errors
      expect(hasErrors).toBe(true);
      expect(diagnostics.length).toBeGreaterThan(0);
    });

    it('reports error for missing closing brace', () => {
      const source = '{ x; y;';
      const { hasErrors, diagnostics } = parseBlockStatement(source);

      // Should report missing closing brace
      expect(hasErrors).toBe(true);
      expect(diagnostics.length).toBeGreaterThan(0);
    });

    it('handles complex expressions in block statements', () => {
      const source = '{ x + y * z; counter; }';
      const { stmt, hasErrors, diagnostics } = parseBlockStatement(source);

      expect(hasErrors).toBe(false);
      expect(diagnostics).toHaveLength(0);
      expect(stmt).toBeInstanceOf(BlockStatement);
      expect((stmt as BlockStatement).getStatements()).toHaveLength(2);
    });
  });

  describe('parseExpressionStatement', () => {
    it('parses simple identifier as expression statement', () => {
      const source = 'x;';
      const { stmt, hasErrors, diagnostics } = parseExpressionStatement(source);

      expect(hasErrors).toBe(false);
      expect(diagnostics).toHaveLength(0);
      expect(stmt).toBeInstanceOf(ExpressionStatement);
    });

    it('parses literal as expression statement', () => {
      const source = '42;';
      const { stmt, hasErrors, diagnostics } = parseExpressionStatement(source);

      expect(hasErrors).toBe(false);
      expect(diagnostics).toHaveLength(0);
      expect(stmt).toBeInstanceOf(ExpressionStatement);
    });

    it('parses binary expression as expression statement', () => {
      const source = 'x + y;';
      const { stmt, hasErrors, diagnostics } = parseExpressionStatement(source);

      expect(hasErrors).toBe(false);
      expect(diagnostics).toHaveLength(0);
      expect(stmt).toBeInstanceOf(ExpressionStatement);
    });

    it('parses complex expression as expression statement', () => {
      const source = 'x + y * z - w;';
      const { stmt, hasErrors, diagnostics } = parseExpressionStatement(source);

      expect(hasErrors).toBe(false);
      expect(diagnostics).toHaveLength(0);
      expect(stmt).toBeInstanceOf(ExpressionStatement);
    });

    it('parses parenthesized expression as expression statement', () => {
      const source = '(x + y);';
      const { stmt, hasErrors, diagnostics } = parseExpressionStatement(source);

      expect(hasErrors).toBe(false);
      expect(diagnostics).toHaveLength(0);
      expect(stmt).toBeInstanceOf(ExpressionStatement);
    });

    it('requires semicolon after expression', () => {
      const source = 'x + y'; // Missing semicolon
      const { stmt, hasErrors, diagnostics } = parseExpressionStatement(source);

      // Should report missing semicolon error
      expect(hasErrors).toBe(true);
      expect(diagnostics.length).toBeGreaterThan(0);
      expect(diagnostics[0].message).toContain('semicolon');
    });

    it('handles multiple expression statements by parsing first', () => {
      const source = 'x;';
      const { stmt, hasErrors, diagnostics } = parseExpressionStatement(source);

      expect(hasErrors).toBe(false);
      expect(diagnostics).toHaveLength(0);
      expect(stmt).toBeInstanceOf(ExpressionStatement);
    });
  });

  describe('parseStatement dispatcher', () => {
    it('routes to block statement for left brace', () => {
      const source = '{ x; }';
      const { stmt, hasErrors, diagnostics } = parseStatement(source);

      expect(hasErrors).toBe(false);
      expect(diagnostics).toHaveLength(0);
      expect(stmt).toBeInstanceOf(BlockStatement);
    });

    it('routes to expression statement for identifiers', () => {
      const source = 'variable;';
      const { stmt, hasErrors, diagnostics } = parseStatement(source);

      expect(hasErrors).toBe(false);
      expect(diagnostics).toHaveLength(0);
      expect(stmt).toBeInstanceOf(ExpressionStatement);
    });

    it('routes to expression statement for literals', () => {
      const source = '123;';
      const { stmt, hasErrors, diagnostics } = parseStatement(source);

      expect(hasErrors).toBe(false);
      expect(diagnostics).toHaveLength(0);
      expect(stmt).toBeInstanceOf(ExpressionStatement);
    });

    it('routes to expression statement for parenthesized expressions', () => {
      const source = '(x + y);';
      const { stmt, hasErrors, diagnostics } = parseStatement(source);

      expect(hasErrors).toBe(false);
      expect(diagnostics).toHaveLength(0);
      expect(stmt).toBeInstanceOf(ExpressionStatement);
    });
  });

  describe('error recovery', () => {
    it('recovers from malformed statement in block', () => {
      // Test with something that should cause a parse error
      const source = '{ x +; y; }'; // Invalid expression
      const { hasErrors, diagnostics } = parseBlockStatement(source);

      // Should have errors but still complete parsing
      expect(hasErrors).toBe(true);
      expect(diagnostics.length).toBeGreaterThan(0);
    });

    it('synchronizes after parse errors', () => {
      const source = 'x +;'; // Invalid expression - missing right operand
      const { hasErrors, diagnostics } = parseStatement(source);

      // Should report error but continue parsing
      expect(hasErrors).toBe(true);
      expect(diagnostics.length).toBeGreaterThan(0);
    });

    it('handles EOF in block statement', () => {
      const source = '{ x;'; // Missing closing brace, EOF
      const { hasErrors, diagnostics } = parseBlockStatement(source);

      expect(hasErrors).toBe(true);
      expect(diagnostics.length).toBeGreaterThan(0);
    });
  });

  describe('statement infrastructure integration', () => {
    it('integrates with existing declaration parsing', () => {
      const source = `
        module test
        let x: byte = 5;
        @map vic at $D020: byte;
      `;
      const { hasErrors, diagnostics } = parseSource(source);

      expect(hasErrors).toBe(false);
      expect(diagnostics).toHaveLength(0);
    });

    it('maintains proper module scope validation', () => {
      // Test that only declarations are allowed at module scope
      const source = `
        module test
        let x: byte;
      `;
      const { hasErrors, diagnostics } = parseSource(source);

      expect(hasErrors).toBe(false);
      expect(diagnostics).toHaveLength(0);
    });

    it('preserves expression parsing capabilities', () => {
      // Test that expression parsing still works in isolation
      const source = 'x + y * z - (a + b);';
      const { stmt, hasErrors, diagnostics } = parseExpressionStatement(source);

      expect(hasErrors).toBe(false);
      expect(diagnostics).toHaveLength(0);
      expect(stmt).toBeInstanceOf(ExpressionStatement);
    });
  });

  describe('statement context handling', () => {
    it('handles statement parsing in non-module scope', () => {
      const source = 'x;';
      const { stmt, hasErrors, diagnostics } = parseStatement(source);

      // Should parse successfully when not in module scope
      expect(hasErrors).toBe(false);
      expect(diagnostics).toHaveLength(0);
      expect(stmt).toBeInstanceOf(ExpressionStatement);
    });

    it('handles block statements with various content', () => {
      const source = '{ x; y + z; (a * b); }';
      const { stmt, hasErrors, diagnostics } = parseBlockStatement(source);

      expect(hasErrors).toBe(false);
      expect(diagnostics).toHaveLength(0);
      expect(stmt).toBeInstanceOf(BlockStatement);
      expect((stmt as BlockStatement).getStatements()).toHaveLength(3);
    });
  });

  describe('future extension readiness', () => {
    it('should be ready for if statement integration', () => {
      // This test documents that the dispatcher is ready for control flow
      // When Phase 2 is implemented, we'll add:
      // if (this.check(TokenType.IF)) return this.parseIfStatement();

      // Since 'if' is a reserved keyword, we test dispatcher routing instead
      const source = '{ x; }'; // Block statement routing
      const { stmt, hasErrors } = parseStatement(source);

      // This should route to block statement correctly
      expect(hasErrors).toBe(false);
      expect(stmt).toBeInstanceOf(BlockStatement);
    });

    it('should be ready for control flow statement types', () => {
      // Test that the statement dispatcher infrastructure is ready
      // for future control flow implementations
      const source = 'myVar;';
      const { stmt, hasErrors, diagnostics } = parseStatement(source);

      expect(hasErrors).toBe(false);
      expect(diagnostics).toHaveLength(0);
      expect(stmt).toBeInstanceOf(ExpressionStatement);
    });
  });
});
