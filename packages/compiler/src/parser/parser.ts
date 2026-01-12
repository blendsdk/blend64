/**
 * Parser Class for Blend65 Compiler
 *
 * Final concrete parser class that extends the full inheritance chain:
 * BaseParser → ExpressionParser → DeclarationParser → ModuleParser → Parser
 *
 * This class provides the main entry point and orchestration for parsing
 * Blend65 source code into Abstract Syntax Trees (AST).
 *
 * The inheritance chain gives this class access to all parsing capabilities:
 * - Token management and error handling (BaseParser)
 * - Expression parsing with Pratt parser (ExpressionParser)
 * - Variable and @map declaration parsing (DeclarationParser)
 * - Module system parsing (ModuleParser)
 *
 * This class focuses solely on high-level orchestration and provides
 * the public API that external code uses.
 */

import { Declaration, DiagnosticCode, Program } from '../ast/index.js';
import { TokenType } from '../lexer/types.js';
import { ModuleParser } from './modules.js';

/**
 * Complete Blend65 parser - final concrete implementation
 *
 * Inherits all parsing capabilities from the inheritance chain and provides
 * the main parse() entry point. This is the class that external code
 * should instantiate and use.
 *
 * Current parsing capabilities (Phase 0):
 * - Module declarations and implicit global modules
 * - Variable declarations with storage classes and export modifiers
 * - All @map declaration forms (simple, range, sequential, explicit)
 * - Expression parsing with proper operator precedence
 * - Comprehensive error handling and recovery
 *
 * Future capabilities (Phases 1-8):
 * - Statement parsing (if/while/for/return/break/continue)
 * - Advanced expressions (calls/member access/assignments)
 * - Function declarations with parameters and bodies
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
export class Parser extends ModuleParser {
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

    // Parse declarations (for now, variables and @map)
    const declarations: Declaration[] = [];

    while (!this.isAtEnd()) {
      if (this.isAtEnd()) break;

      // Validate module scope
      this.validateModuleScopeItem(this.getCurrentToken());

      // Parse @map declaration
      if (this.check(TokenType.MAP)) {
        declarations.push(this.parseMapDeclaration());
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
  // FUTURE ORCHESTRATION METHODS
  // ============================================

  // Future phases will add methods here to orchestrate new language features:
  //
  // Phase 1: Statement parsing orchestration
  // Phase 2: Control flow integration
  // Phase 3: Advanced expression integration
  // Phase 4: Function declaration integration
  // Phase 5: Module system integration
  // Phase 6: Type system integration
  //
  // The inheritance chain ensures all these capabilities will be
  // automatically available without modifying this class.
}
