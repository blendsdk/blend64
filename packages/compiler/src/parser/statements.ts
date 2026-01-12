/**
 * Statement Parser for Blend65 Compiler
 *
 * Extends ModuleParser to provide statement parsing capabilities:
 * - Statement dispatcher (parseStatement)
 * - Block statement parsing (sequences of statements)
 * - Expression statement parsing (expressions used as statements)
 * - Foundation for control flow statements (if, while, for, etc.)
 *
 * This layer provides the core statement parsing infrastructure that
 * control flow and function parsing will build upon.
 */

import { BlockStatement, DiagnosticCode, ExpressionStatement, Statement } from '../ast/index.js';
import { TokenType } from '../lexer/types.js';
import { ModuleParser } from './modules.js';

/**
 * Statement parser class - extends ModuleParser with statement parsing capabilities
 *
 * Provides the foundation for parsing all statement types in Blend65.
 * This layer focuses on the core statement infrastructure while leaving
 * specific statement implementations for future phases.
 *
 * Current statement support (Phase 1):
 * - Block statements: { stmt1; stmt2; }
 * - Expression statements: foo(); x = 5;
 * - Statement dispatcher routing (foundation for control flow)
 *
 * Future statement support (Phase 2+):
 * - If statements: if condition then ... end if
 * - While statements: while condition ... end while
 * - For statements: for i = 1 to 10 ... next i
 * - Match statements: match value case 1: ... end match
 * - Return/break/continue statements
 */
export abstract class StatementParser extends ModuleParser {
  // ============================================
  // STATEMENT DISPATCHER
  // ============================================

  /**
   * Parses any statement - main dispatcher method
   *
   * This method routes to the appropriate specific statement parser
   * based on the current token. It serves as the central hub for all
   * statement parsing in the language.
   *
   * Current routing (Phase 1):
   * - '{' → parseBlockStatement()
   * - Everything else → parseExpressionStatement()
   *
   * Future routing (Phase 2+):
   * - 'if' → parseIfStatement()
   * - 'while' → parseWhileStatement()
   * - 'for' → parseForStatement()
   * - 'match' → parseMatchStatement()
   * - 'return' → parseReturnStatement()
   * - 'break' → parseBreakStatement()
   * - 'continue' → parseContinueStatement()
   *
   * @returns Statement AST node representing the parsed statement
   */
  protected parseStatement(): Statement {
    // Block statements
    if (this.check(TokenType.LEFT_BRACE)) {
      return this.parseBlockStatement();
    }

    // Future control flow statements (Phase 2)
    // if (this.check(TokenType.IF)) return this.parseIfStatement();
    // if (this.check(TokenType.WHILE)) return this.parseWhileStatement();
    // if (this.check(TokenType.FOR)) return this.parseForStatement();
    // if (this.check(TokenType.MATCH)) return this.parseMatchStatement();
    // if (this.check(TokenType.RETURN)) return this.parseReturnStatement();
    // if (this.check(TokenType.BREAK)) return this.parseBreakStatement();
    // if (this.check(TokenType.CONTINUE)) return this.parseContinueStatement();

    // Default: expression statement
    return this.parseExpressionStatement();
  }

  // ============================================
  // BLOCK STATEMENT PARSING
  // ============================================

  /**
   * Parses a block statement (sequence of statements in braces)
   *
   * Grammar: '{' Statement* '}'
   *
   * Block statements are used in:
   * - Function bodies: function foo() { stmt1; stmt2; }
   * - If/else branches: if condition { stmt1; } else { stmt2; }
   * - Loop bodies: while condition { stmt1; stmt2; }
   * - Standalone blocks for scoping: { let temp: byte = x; ... }
   *
   * Examples:
   * - Empty block: { }
   * - Single statement: { x = 5; }
   * - Multiple statements: { x = 5; y = 10; foo(); }
   * - Nested blocks: { { inner(); } outer(); }
   *
   * Error Recovery:
   * - Missing opening brace: Error reported, attempts to continue
   * - Missing closing brace: Error reported, synchronizes to likely end
   * - Invalid statements inside: Individual errors, continues parsing
   *
   * @returns BlockStatement AST node containing all parsed statements
   */
  protected parseBlockStatement(): BlockStatement {
    const startToken = this.expect(TokenType.LEFT_BRACE, "Expected '{'");

    const statements: Statement[] = [];

    // Parse statements until we hit closing brace or EOF
    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      try {
        const stmt = this.parseStatement();
        statements.push(stmt);
      } catch (error) {
        // Error recovery: skip problematic token and try to continue
        this.reportError(
          DiagnosticCode.UNEXPECTED_TOKEN,
          `Error parsing statement: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
        this.synchronize();
      }
    }

    this.expect(TokenType.RIGHT_BRACE, "Expected '}' to close block");

    const location = this.createLocation(startToken, this.getCurrentToken());
    return new BlockStatement(statements, location);
  }

  // ============================================
  // EXPRESSION STATEMENT PARSING
  // ============================================

  /**
   * Parses an expression statement (expression used as a statement)
   *
   * Grammar: Expression ';'
   *
   * Expression statements allow expressions to be used where statements
   * are expected. This is essential for function calls, assignments,
   * and other side-effecting expressions.
   *
   * Examples:
   * - Function call: foo();
   * - Assignment: x = 5;
   * - Complex expression: array[i] = getValue() + 10;
   * - Method call: player.update();
   *
   * Note: Semicolons are strictly required in Blend65 for statement
   * termination. This eliminates ambiguity and parsing complexity.
   *
   * Error Recovery:
   * - Invalid expression: Error reported, attempts to recover with dummy
   * - Missing semicolon: Error reported, continues (may cause cascading errors)
   *
   * @returns ExpressionStatement AST node wrapping the expression
   */
  protected parseExpressionStatement(): ExpressionStatement {
    const expr = this.parseExpression();

    this.expectSemicolon('Expected semicolon after expression statement');

    return new ExpressionStatement(expr, expr.getLocation());
  }

  // ============================================
  // FUTURE STATEMENT PARSING METHODS (PHASE 2+)
  // ============================================

  // The following methods will be implemented in future phases.
  // They are documented here to show the planned architecture and
  // ensure the statement dispatcher can route to them when implemented.

  /**
   * Parses if statement (Phase 2)
   *
   * Grammar: 'if' Expression 'then' Statement* ['else' Statement*] 'end' 'if'
   *
   * Will handle:
   * - Simple if: if x > 0 then return; end if
   * - If-else: if flag then doThis(); else doThat(); end if
   * - Nested if statements
   * - Error recovery for missing keywords
   */
  // protected parseIfStatement(): IfStatement { }

  /**
   * Parses while statement (Phase 2)
   *
   * Grammar: 'while' Expression Statement* 'end' 'while'
   *
   * Will handle:
   * - Simple while: while running ... end while
   * - Nested while loops
   * - Error recovery for missing keywords
   */
  // protected parseWhileStatement(): WhileStatement { }

  /**
   * Parses for statement (Phase 2)
   *
   * Grammar: 'for' Identifier '=' Expression 'to' Expression Statement* 'next' Identifier
   *
   * Will handle:
   * - Counted loops: for i = 1 to 10 ... next i
   * - Variable scope management
   * - Error recovery for missing keywords
   */
  // protected parseForStatement(): ForStatement { }

  /**
   * Parses match statement (Phase 2)
   *
   * Grammar: 'match' Expression ('case' Expression ':' Statement*)* ['default' ':' Statement*] 'end' 'match'
   *
   * Will handle:
   * - Multi-case matching: match value case 1: ... case 2: ... end match
   * - Default cases: match value case 1: ... default: ... end match
   * - Error recovery for missing keywords
   */
  // protected parseMatchStatement(): MatchStatement { }

  /**
   * Parses return statement (Phase 2)
   *
   * Grammar: 'return' [Expression] ';'
   *
   * Will handle:
   * - Void return: return;
   * - Value return: return 42;
   * - Complex expressions: return getValue() + 10;
   */
  // protected parseReturnStatement(): ReturnStatement { }

  /**
   * Parses break statement (Phase 2)
   *
   * Grammar: 'break' ';'
   *
   * Will handle:
   * - Loop breaking: while condition ... break; ... end while
   * - Validation that break is inside a loop
   */
  // protected parseBreakStatement(): BreakStatement { }

  /**
   * Parses continue statement (Phase 2)
   *
   * Grammar: 'continue' ';'
   *
   * Will handle:
   * - Loop continuation: while condition ... continue; ... end while
   * - Validation that continue is inside a loop
   */
  // protected parseContinueStatement(): ContinueStatement { }
}
