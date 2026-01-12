/**
 * Expression Parser for Blend65 Compiler
 *
 * Extends BaseParser to provide expression parsing capabilities:
 * - Primary expressions (literals, identifiers, parenthesized)
 * - Binary expressions with Pratt parser (precedence climbing)
 * - Number parsing (decimal, hex, binary formats)
 * - Expression utilities and precedence handling
 *
 * Future phases will add advanced expressions (calls, member access, assignments).
 */

import {
  BinaryExpression,
  Expression,
  IdentifierExpression,
  LiteralExpression,
  DiagnosticCode,
} from '../ast/index.js';
import { TokenType } from '../lexer/types.js';
import {
  getPrecedence,
  isBinaryOperator,
  isRightAssociative,
  OperatorPrecedence,
} from './precedence.js';
import { BaseParser } from './base.js';

/**
 * Expression parser class - extends BaseParser with expression parsing capabilities
 *
 * Handles all expression parsing using Pratt parser algorithm for proper
 * operator precedence and associativity. Provides the foundation that
 * statement and declaration parsers can build upon.
 *
 * Current expression support (Phase 0):
 * - Number literals: 42, $D000, 0xFF, 0b1010
 * - String literals: "hello", 'world'
 * - Boolean literals: true, false
 * - Identifiers: counter, myVar
 * - Parenthesized expressions: (2 + 3)
 * - Binary expressions: +, -, *, /, ==, !=, <, >, etc.
 *
 * Future expression support (Phase 3):
 * - Function calls: foo(x, y)
 * - Member access: obj.property
 * - Index access: array[index]
 * - Assignment: x = value
 * - Unary operators: -x, !flag
 */
export abstract class ExpressionParser extends BaseParser {
  // ============================================
  // PRIMARY EXPRESSION PARSING
  // ============================================

  /**
   * Parses a primary expression
   *
   * Primary expressions are the "atoms" of the language - the simplest
   * expressions that cannot be broken down further. These are the base
   * case for recursive expression parsing.
   *
   * Primary expressions supported:
   * - Number literals: 42, $D000, 0xFF, 0b1010
   * - String literals: "hello", 'world'
   * - Boolean literals: true, false
   * - Identifiers: counter, myVar
   * - Parenthesized expressions: (2 + 3)
   *
   * @returns Expression AST node representing a primary expression
   */
  protected parsePrimaryExpression(): Expression {
    // Number literals
    if (this.check(TokenType.NUMBER)) {
      const token = this.advance();
      const value = this.parseNumberValue(token.value);
      const location = this.createLocation(token, token);
      return new LiteralExpression(value, location);
    }

    // String literals
    if (this.check(TokenType.STRING_LITERAL)) {
      const token = this.advance();
      const location = this.createLocation(token, token);
      return new LiteralExpression(token.value, location);
    }

    // Boolean literals
    if (this.check(TokenType.BOOLEAN_LITERAL)) {
      const token = this.advance();
      const value = token.value === 'true';
      const location = this.createLocation(token, token);
      return new LiteralExpression(value, location);
    }

    // Identifiers
    if (this.check(TokenType.IDENTIFIER)) {
      const token = this.advance();
      const location = this.createLocation(token, token);
      return new IdentifierExpression(token.value, location);
    }

    // Parenthesized expressions
    if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.parseExpression();
      this.expect(TokenType.RIGHT_PAREN, "Expected ')' after expression");
      return expr;
    }

    // Error - unexpected token
    this.reportError(
      DiagnosticCode.UNEXPECTED_TOKEN,
      `Expected expression, found '${this.getCurrentToken().value}'`
    );

    // Return dummy literal for recovery
    return new LiteralExpression(0, this.currentLocation());
  }

  /**
   * Parses a number value from string
   *
   * Handles different number formats:
   * - Decimal: 42, 255
   * - Hex ($ prefix): $D000, $FF
   * - Hex (0x prefix): 0xD000, 0xFF
   * - Binary (0b prefix): 0b1010, 0b11110000
   *
   * @param value - String representation of number
   * @returns Numeric value
   */
  protected parseNumberValue(value: string): number {
    // Hex with $ prefix
    if (value.startsWith('$')) {
      return parseInt(value.substring(1), 16);
    }

    // Hex with 0x prefix
    if (value.startsWith('0x')) {
      return parseInt(value, 16);
    }

    // Binary with 0b prefix
    if (value.startsWith('0b')) {
      return parseInt(value.substring(2), 2);
    }

    // Decimal
    return parseInt(value, 10);
  }

  // ============================================
  // PRATT EXPRESSION PARSING INFRASTRUCTURE
  // ============================================

  /**
   * Parses an expression using Pratt parser with precedence climbing
   *
   * This is a universal expression parsing algorithm that works for any grammar.
   * It handles operator precedence and associativity by recursively parsing
   * operands and building binary expression trees.
   *
   * The algorithm:
   * 1. Parse left operand (primary expression)
   * 2. While current token is a binary operator with sufficient precedence:
   *    a. Save the operator and its precedence
   *    b. Consume the operator
   *    c. Calculate next minimum precedence (handles associativity)
   *    d. Recursively parse right operand
   *    e. Build binary expression node with merged locations
   *    f. Continue with result as new left operand
   * 3. Return final expression tree
   *
   * Examples of parsed expressions:
   * - Simple: 42 → LiteralExpression(42)
   * - Variable: counter → IdentifierExpression("counter")
   * - Binary: 2 + 3 → BinaryExpression(2, PLUS, 3)
   * - Precedence: x * y + z → BinaryExpression((x * y), PLUS, z)
   * - Associativity: a = b = c → BinaryExpression(a, ASSIGN, (b = c))
   *
   * @param minPrecedence - Minimum precedence for operators (default: NONE)
   *                        Used internally for precedence climbing
   * @returns Expression AST node representing the parsed expression
   */
  protected parseExpression(minPrecedence: number = OperatorPrecedence.NONE): Expression {
    // Parse left side (primary expression)
    let left = this.parsePrimaryExpression();

    // Parse binary operators with precedence climbing
    while (this.isBinaryOp() && this.getCurrentPrecedence() >= minPrecedence) {
      const operator = this.getCurrentToken().type;
      const precedence = this.getCurrentPrecedence();

      this.advance(); // Consume operator

      // For right-associative operators (like =), use same precedence
      // For left-associative operators, use precedence + 1 to force tighter binding on right
      const nextMinPrecedence = this.isRightAssoc(operator) ? precedence : precedence + 1;

      const right = this.parseExpression(nextMinPrecedence);

      // Merge locations from left and right operands
      const location = this.mergeLocations(left.getLocation(), right.getLocation());

      left = new BinaryExpression(left, operator, right, location);
    }

    return left;
  }

  /**
   * Gets the precedence of the current token
   *
   * Used by Pratt parser to decide how to group operators.
   *
   * @returns Precedence level (0 = not an operator)
   */
  protected getCurrentPrecedence(): number {
    return getPrecedence(this.getCurrentToken().type);
  }

  /**
   * Checks if current token is a binary operator
   *
   * @returns True if current token is a binary operator
   */
  protected isBinaryOp(): boolean {
    return isBinaryOperator(this.getCurrentToken().type);
  }

  /**
   * Checks if an operator is right-associative
   *
   * Right-associative: a = b = c → a = (b = c)
   * Left-associative: a + b + c → (a + b) + c
   *
   * @param tokenType - Operator to check
   * @returns True if right-associative
   */
  protected isRightAssoc(tokenType: TokenType): boolean {
    return isRightAssociative(tokenType);
  }

  // ============================================
  // FUTURE EXPRESSION METHODS (PHASE 3)
  // ============================================

  // The following methods will be implemented in Phase 3:
  //
  // protected parseCallExpression(callee: Expression): CallExpression
  // protected parseMemberExpression(): MemberExpression
  // protected parseIndexExpression(): IndexExpression
  // protected parseAssignmentExpression(): AssignmentExpression
  // protected parseUnaryExpression(): UnaryExpression
  //
  // These are placeholders to show the planned architecture.
}
