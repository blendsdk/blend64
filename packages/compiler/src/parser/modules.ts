/**
 * Module Parser for Blend65 Compiler
 *
 * Extends DeclarationParser to provide module system parsing capabilities:
 * - Module declarations (explicit and implicit)
 * - Import declarations (future)
 * - Export declarations (future)
 * - Module scope validation
 *
 * Current module support includes basic module declarations.
 * Future phases will add complete import/export system.
 */

import { ModuleDecl } from '../ast/index.js';
import { TokenType } from '../lexer/types.js';
import { DeclarationParser } from './declarations.js';

/**
 * Module parser class - extends DeclarationParser with module system parsing
 *
 * Handles module system parsing including module declarations and provides
 * foundation for future import/export functionality.
 *
 * Current module support (Phase 0):
 * - Module declarations: module Game.Main
 * - Implicit global module when no module declared
 * - Module scope validation
 *
 * Future module support (Phase 5):
 * - Import declarations: import { Function } from "module"
 * - Export declarations: export function name() ... end function
 * - Module resolution and dependencies
 */
export abstract class ModuleParser extends DeclarationParser {
  // ============================================
  // MODULE DECLARATION PARSING
  // ============================================

  /**
   * Parses a module declaration
   *
   * Grammar: module Identifier [ . Identifier ]*
   *
   * Examples:
   * - module Game
   * - module Game.Main
   * - module Graphics.Sprites.Player
   *
   * @returns ModuleDecl AST node
   */
  protected parseModuleDecl(): ModuleDecl {
    this.validateModuleDeclaration(); // Check for duplicate

    const startToken = this.expect(TokenType.MODULE, "Expected 'module' keyword");

    // Parse module name path (e.g., Game.Main)
    const namePath: string[] = [];
    namePath.push(this.expect(TokenType.IDENTIFIER, 'Expected module name').value);

    while (this.match(TokenType.DOT)) {
      namePath.push(this.expect(TokenType.IDENTIFIER, 'Expected identifier after dot').value);
    }

    // Module declarations are self-terminating (no semicolon needed)
    const location = this.createLocation(startToken, this.getCurrentToken());

    return new ModuleDecl(namePath, location, false);
  }

  /**
   * Creates implicit "module global" when no module declared
   *
   * When a file doesn't start with an explicit module declaration,
   * we create an implicit global module to represent the file's scope.
   *
   * @returns ModuleDecl for implicit global module
   */
  protected createImplicitGlobalModule(): ModuleDecl {
    const location = this.createLocation(this.tokens[0], this.tokens[0]);
    return new ModuleDecl(['global'], location, true);
  }

  // ============================================
  // FUTURE MODULE SYSTEM METHODS (PHASE 5)
  // ============================================

  // The following methods will be implemented in Phase 5:
  //
  // Import Declarations:
  // protected parseImportDecl(): ImportDecl
  // protected parseImportSpecifierList(): ImportSpecifier[]
  // protected parseImportSpecifier(): ImportSpecifier
  //
  // Export Declarations:
  // protected parseExportDecl(): ExportDecl
  // protected parseExportModifier(): boolean (already exists in base)
  //
  // Module Resolution:
  // protected resolveModulePath(path: string): string
  // protected validateModuleDependencies(): void
  //
  // These are placeholders to show the planned architecture.
}
