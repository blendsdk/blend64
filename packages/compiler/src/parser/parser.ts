/**
 * Parser Class for Blend65 Compiler
 *
 * Final concrete parser class that extends the full inheritance chain:
 * BaseParser → ExpressionParser → DeclarationParser → ModuleParser → StatementParser → Parser
 *
 * This class provides the main entry point and orchestration for parsing
 * Blend65 source code into Abstract Syntax Trees (AST).
 *
 * The inheritance chain gives this class access to all parsing capabilities:
 * - Token management and error handling (BaseParser)
 * - Expression parsing with Pratt parser (ExpressionParser)
 * - Variable and @map declaration parsing (DeclarationParser)
 * - Module system parsing (ModuleParser)
 * - Statement parsing infrastructure (StatementParser)
 *
 * This class focuses solely on high-level orchestration and provides
 * the public API that external code uses.
 */

import {
  Declaration,
  DiagnosticCode,
  Program,
  FunctionDecl,
  Parameter,
  Statement,
} from '../ast/index.js';
import { TokenType } from '../lexer/types.js';
import { StatementParser } from './statements.js';

/**
 * Complete Blend65 parser - final concrete implementation
 *
 * Inherits all parsing capabilities from the inheritance chain and provides
 * the main parse() entry point. This is the class that external code
 * should instantiate and use.
 *
 * Current parsing capabilities (Phase 4):
 * - Module declarations and implicit global modules
 * - Variable declarations with storage classes and export modifiers
 * - All @map declaration forms (simple, range, sequential, explicit)
 * - Expression parsing with proper operator precedence
 * - Function declarations with parameters and bodies (Phase 4)
 * - Comprehensive error handling and recovery
 *
 * Future capabilities (Phases 5-8):
 * - Import/export system
 * - Type system declarations (type aliases, enums)
 * - Complete language support
 *
 * Usage:
 * ```typescript
 * const lexer = new Lexer(source);
 * const tokens = lexer.tokenize();
 * const parser = new Parser(tokens);
 * const ast = parser.parse();
 *
 * if (parser.hasErrors()) {
 *   console.error(parser.getDiagnostics());
 * } else {
 *   console.log('AST:', ast);
 * }
 * ```
 */
export class Parser extends StatementParser {
  // ============================================
  // MAIN ENTRY POINT
  // ============================================

  /**
   * Entry point - parses entire file into Program AST
   *
   * Implements grammar:
   * Program := [Module] Declaration*
   *
   * This method orchestrates the parsing process:
   * 1. Parse optional module declaration (or create implicit global)
   * 2. Parse sequence of declarations (variables, @map, functions, etc.)
   * 3. Handle errors and synchronization
   * 4. Return complete Program AST node
   *
   * @returns Program AST node representing the entire source file
   */
  public parse(): Program {
    // Check for explicit module declaration
    let moduleDecl;

    if (this.check(TokenType.MODULE)) {
      moduleDecl = this.parseModuleDecl();
    } else {
      // Create implicit "module global"
      moduleDecl = this.createImplicitGlobalModule();
    }

    // Parse declarations (variables, @map, functions, etc.)
    const declarations: Declaration[] = [];

    while (!this.isAtEnd()) {
      if (this.isAtEnd()) break;

      // Validate module scope
      this.validateModuleScopeItem(this.getCurrentToken());

      // Parse @map declaration
      if (this.check(TokenType.MAP)) {
        declarations.push(this.parseMapDeclaration());
      }
      // Parse function declaration (callback or regular) OR exported function declaration
      else if (
        this.check(TokenType.CALLBACK, TokenType.FUNCTION) ||
        (this.check(TokenType.EXPORT) && this.peek().type === TokenType.CALLBACK) ||
        (this.check(TokenType.EXPORT) && this.peek().type === TokenType.FUNCTION)
      ) {
        const functionDecl = this.parseFunctionDecl() as FunctionDecl;

        // Handle main function auto-export with warning (only for auto-exported main functions)
        if (
          functionDecl.getName() === 'main' &&
          functionDecl.isExportedFunction() &&
          !this.wasExplicitlyExported
        ) {
          this.reportWarning(
            DiagnosticCode.IMPLICIT_MAIN_EXPORT,
            "Main function should be explicitly exported. Automatically exporting 'main' function.",
            functionDecl.getLocation()
          );
        }

        declarations.push(functionDecl);
      }
      // Parse variable declaration (with optional export prefix)
      else if (this.isExportModifier() || this.isStorageClass() || this.isLetOrConst()) {
        declarations.push(this.parseVariableDecl());
      } else {
        // Unknown token - report error and synchronize
        this.reportError(
          DiagnosticCode.UNEXPECTED_TOKEN,
          `Unexpected token '${this.getCurrentToken().value}'`
        );
        this.synchronize();
      }
    }

    // Create program node
    const location = this.createLocation(this.tokens[0], this.getCurrentToken());

    return new Program(moduleDecl, declarations, location);
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Tracks if the last parsed declaration had an explicit export modifier
   */
  protected wasExplicitlyExported: boolean = false;

  /**
   * Checks if the last parsed item was explicitly exported
   */
  protected isExplicitlyExported(): boolean {
    return this.wasExplicitlyExported;
  }

  // ============================================
  // PHASE 4: FUNCTION DECLARATION PARSING
  // ============================================

  /**
   * Parse function declaration with optional export and callback modifiers
   *
   * Grammar:
   * FunctionDecl := [export] [callback] function identifier
   *                 ( [ParameterList] ) [: TypeName]
   *                 StatementList
   *                 end function
   *
   * Handles:
   * - Optional export modifier (makes function visible to other modules)
   * - Optional callback modifier (marks as interrupt handler/function pointer)
   * - Parameter list with type annotations
   * - Optional return type annotation
   * - Function body using existing statement parsing infrastructure
   * - Proper error recovery and diagnostics
   *
   * @returns FunctionDecl AST node
   */
  protected parseFunctionDecl(): Declaration {
    const startToken = this.getCurrentToken();

    // Parse optional export modifier (following same pattern as parseVariableDecl)
    const isExported = this.parseExportModifier();
    this.wasExplicitlyExported = isExported;

    // Parse optional callback modifier
    const isCallback = this.match(TokenType.CALLBACK);

    // Parse 'function' keyword
    this.expect(TokenType.FUNCTION, "Expected 'function'");

    // Parse function name
    const nameToken = this.expect(TokenType.IDENTIFIER, 'Expected function name');
    const functionName = nameToken.value;

    // Check for main function auto-export (per language specification)
    let shouldAutoExport = false;
    if (functionName === 'main' && !isExported) {
      shouldAutoExport = true;
    }

    // Parse parameter list
    this.expect(TokenType.LEFT_PAREN, "Expected '(' after function name");
    const parameters = this.parseParameterList();
    this.expect(TokenType.RIGHT_PAREN, "Expected ')' after parameters");

    // Parse optional return type
    let returnType: string | null = null;
    if (this.match(TokenType.COLON)) {
      // Return type can be a keyword (void, byte, word) or identifier (custom type)
      if (
        this.check(
          TokenType.VOID,
          TokenType.BYTE,
          TokenType.WORD,
          TokenType.BOOLEAN,
          TokenType.STRING,
          TokenType.IDENTIFIER
        )
      ) {
        returnType = this.advance().value;
      } else {
        this.reportError(DiagnosticCode.EXPECTED_TOKEN, 'Expected return type');
      }
    }

    // Parse function body statements
    const body = this.parseFunctionBody();

    // Parse 'end function'
    this.expect(TokenType.END, "Expected 'end' after function body");
    this.expect(TokenType.FUNCTION, "Expected 'function' after 'end'");

    // Create location spanning entire function declaration
    const location = this.createLocation(startToken, this.getCurrentToken());

    // Return function with proper export status
    return new FunctionDecl(
      functionName,
      parameters,
      returnType,
      body,
      location,
      isExported || shouldAutoExport, // Explicit export or auto-export main function
      isCallback
    );
  }

  /**
   * Parse function parameter list
   *
   * Grammar:
   * ParameterList := Parameter (, Parameter)*
   * Parameter := identifier : TypeName
   *
   * @returns Array of Parameter objects with name, type, and location
   */
  protected parseParameterList(): Parameter[] {
    const parameters: Parameter[] = [];

    // Empty parameter list
    if (this.check(TokenType.RIGHT_PAREN)) {
      return parameters;
    }

    do {
      // Parse parameter name
      const nameToken = this.expect(TokenType.IDENTIFIER, 'Expected parameter name');

      // Parse type annotation
      this.expect(TokenType.COLON, "Expected ':' after parameter name");

      // Parameter type can be a keyword (byte, word, void) or identifier (custom type)
      let typeToken: any;
      if (
        this.check(
          TokenType.BYTE,
          TokenType.WORD,
          TokenType.VOID,
          TokenType.BOOLEAN,
          TokenType.STRING,
          TokenType.IDENTIFIER
        )
      ) {
        typeToken = this.advance();
      } else {
        this.reportError(DiagnosticCode.EXPECTED_TOKEN, 'Expected parameter type');
        typeToken = this.getCurrentToken(); // For error recovery
      }

      // Create parameter object
      const paramLocation = this.createLocation(nameToken, typeToken);
      parameters.push({
        name: nameToken.value,
        typeAnnotation: typeToken.value,
        location: paramLocation,
      });
    } while (this.match(TokenType.COMMA));

    return parameters;
  }

  /**
   * Parse function body statements
   *
   * Uses existing statement parsing infrastructure from StatementParser.
   * Continues parsing statements until 'end' keyword is reached.
   * Statements are terminated by semicolons, not newlines.
   *
   * @returns Array of Statement AST nodes
   */
  protected parseFunctionBody(): Statement[] {
    const statements: Statement[] = [];

    // Parse statements until we hit 'end' - for now, we keep function bodies empty
    // as statement parsing will be implemented in future phases
    while (!this.check(TokenType.END) && !this.isAtEnd()) {
      // For Phase 4, we simply skip any tokens until 'end'
      // Future phases will implement proper statement parsing here
      this.advance();
    }

    return statements;
  }

  /**
   * Synchronize parser to next statement or end of function for error recovery
   */
  protected synchronizeToStatement(): void {
    while (
      !this.isAtEnd() &&
      !this.check(TokenType.END) &&
      !this.check(TokenType.IF) &&
      !this.check(TokenType.WHILE) &&
      !this.check(TokenType.FOR) &&
      !this.check(TokenType.RETURN) &&
      !this.check(TokenType.LET) &&
      !this.check(TokenType.CONST)
    ) {
      this.advance();
    }
  }

  // Future phases will add methods here to orchestrate new language features:
  //
  // Phase 5: Module system integration
  // Phase 6: Type system integration
  //
  // The inheritance chain ensures all these capabilities will be
  // automatically available without modifying this class.
}
