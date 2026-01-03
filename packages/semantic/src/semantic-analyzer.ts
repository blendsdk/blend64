/**
 * Main Semantic Analyzer for Blend65
 * Task 1.5.6: Update SemanticAnalyzer for Multi-Program Analysis
 *
 * This is the main orchestrator for semantic analysis that processes
 * multiple Program[] simultaneously to enable cross-file module resolution.
 *
 * Industry-Standard Multi-Program Analysis:
 * - Follows TypeScript's createProgram(fileNames) pattern
 * - Enables cross-file import/export validation
 * - Single unified symbol table across all programs
 * - Consistent API regardless of file count
 *
 * Educational Focus:
 * - How modern compilers handle multi-file projects
 * - Cross-file symbol resolution patterns
 * - Module system implementation strategies
 * - Unified error reporting across files
 */

import { Program } from '@blend65/ast';
import {
  SemanticResult,
  SemanticError,
  Scope,
  createScope
} from './types.js';
import { SymbolTable, createSymbolTable } from './symbol-table.js';
import { ModuleAnalyzer } from './analyzers/module-analyzer.js';

/**
 * Main semantic analyzer that processes multiple programs together.
 * This enables cross-file module resolution and unified symbol tables.
 */
export class SemanticAnalyzer {
  private symbolTable: SymbolTable;
  private errors: SemanticError[];
  private warnings: SemanticError[];

  constructor() {
    this.symbolTable = createSymbolTable();
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Analyze multiple programs together for cross-file module resolution.
   *
   * Multi-Program Analysis Pattern:
   * 1. Register all modules first (for forward references)
   * 2. Process all declarations across all programs
   * 3. Resolve cross-file imports/exports
   * 4. Return unified symbol table with all symbols
   *
   * @param programs Array of parsed AST programs to analyze
   * @returns Semantic analysis result with unified symbol table
   */
  analyze(programs: Program[]): SemanticResult<SymbolTable> {
    this.reset();

    try {
      // Phase 1: Register all modules for forward reference resolution
      this.registerAllModules(programs);

      // Phase 2: Process all program declarations
      this.processAllDeclarations(programs);

      // Phase 3: Resolve cross-file dependencies
      this.resolveModuleDependencies(programs);

      // Return unified symbol table
      if (this.errors.length > 0) {
        return {
          success: false,
          errors: this.errors,
          warnings: this.warnings.length > 0 ? this.warnings : undefined
        };
      }

      return {
        success: true,
        data: this.symbolTable,
        warnings: this.warnings.length > 0 ? this.warnings : undefined
      };

    } catch (error) {
      // Handle unexpected errors gracefully
      const internalError: SemanticError = {
        errorType: 'InvalidOperation',
        message: `Internal semantic analyzer error: ${error instanceof Error ? error.message : String(error)}`,
        location: { line: 0, column: 0, offset: 0 },
        suggestions: ['This is an internal compiler error - please report this issue']
      };

      return {
        success: false,
        errors: [...this.errors, internalError],
        warnings: this.warnings.length > 0 ? this.warnings : undefined
      };
    }
  }

  /**
   * Reset analyzer state for fresh analysis.
   * Called at the beginning of each analyze() call.
   */
  private reset(): void {
    this.symbolTable = createSymbolTable();
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Phase 1: Register all modules for forward reference resolution.
   * This allows modules to import from each other regardless of file order.
   */
  private registerAllModules(programs: Program[]): void {
    for (const program of programs) {
      this.registerModule(program);
    }
  }

  /**
   * Register a single module in the global scope.
   */
  private registerModule(program: Program): void {
    if (!program.module) {
      this.addError({
        errorType: 'InvalidScope',
        message: 'Program must have a module declaration',
        location: { line: 1, column: 1, offset: 0 },
        suggestions: [
          'Add a module declaration at the top: module ModuleName',
          'All Blend65 files must belong to a module'
        ]
      });
      return;
    }

    // Convert QualifiedName to string
    const moduleName = program.module.name.parts.join('.');

    // Create module scope using symbol table methods
    this.symbolTable.enterScope('Module', moduleName);

    // Store the module for later processing - simplified approach
    // In a full implementation, we'd create proper module symbols here
  }

  /**
   * Phase 2: Process all declarations across all programs.
   */
  private processAllDeclarations(programs: Program[]): void {
    for (const program of programs) {
      this.processProgram(program);
    }
  }

  /**
   * Process a single program's declarations.
   */
  private processProgram(program: Program): void {
    if (!program.module) {
      this.addError({
        errorType: 'InvalidScope',
        message: 'Program must have a module declaration',
        location: { line: 1, column: 1, offset: 0 },
        suggestions: [
          'Add a module declaration at the top: module ModuleName',
          'All Blend65 files must belong to a module'
        ]
      });
      return;
    }

    // Convert QualifiedName to string
    const moduleName = program.module.name.parts.join('.');

    // Process imports - basic syntax validation only
    for (const importDecl of program.imports) {
      this.validateImportSyntax(importDecl);
    }

    // Process declarations using program.body instead of program.declarations
    for (const declaration of program.body) {
      switch (declaration.type) {
        case 'VariableDeclaration':
          // TODO: Implement variable declaration processing once analyzers are updated
          this.addWarning({
            errorType: 'InvalidOperation',
            message: `Variable declaration processing not yet implemented for multi-program analysis`,
            location: declaration.metadata?.start || { line: 0, column: 0, offset: 0 }
          });
          break;

        case 'FunctionDeclaration':
          // TODO: Implement function declaration processing once analyzers are updated
          this.addWarning({
            errorType: 'InvalidOperation',
            message: `Function declaration processing not yet implemented for multi-program analysis`,
            location: declaration.metadata?.start || { line: 0, column: 0, offset: 0 }
          });
          break;

        default:
          this.addWarning({
            errorType: 'InvalidOperation',
            message: `Declaration type '${declaration.type}' not yet implemented in semantic analysis`,
            location: declaration.metadata?.start || { line: 0, column: 0, offset: 0 }
          });
      }
    }
  }

  /**
   * Resolve module dependencies across all programs using ModuleAnalyzer.
   * Task 1.6: This method implements the actual cross-file import/export resolution.
   */
  private resolveModuleDependencies(programs: Program[]): void {
    const moduleAnalyzer = new ModuleAnalyzer(this.symbolTable);
    const moduleErrors = moduleAnalyzer.analyzeModuleSystem(programs);

    // Add any module-specific errors to our error collection
    this.errors.push(...moduleErrors);
  }

  /**
   * Validate basic import declaration syntax.
   */
  private validateImportSyntax(importDecl: any): void {
    // Basic syntax validation for imports - detailed resolution is done by ModuleAnalyzer
    if (!importDecl.source || !importDecl.specifiers) {
      this.addError({
        errorType: 'InvalidOperation',
        message: 'Invalid import declaration syntax',
        location: importDecl.metadata?.start || { line: 0, column: 0, offset: 0 },
        suggestions: [
          'Use correct import syntax: import symbol from module',
          'Check the import declaration format'
        ]
      });
    }
  }

  /**
   * Add an error to the error collection.
   */
  private addError(error: SemanticError): void {
    this.errors.push(error);
  }

  /**
   * Add a warning to the warning collection.
   */
  private addWarning(warning: SemanticError): void {
    this.warnings.push(warning);
  }

  /**
   * Get current symbol table (for testing and debugging).
   */
  getSymbolTable(): SymbolTable {
    return this.symbolTable;
  }

  /**
   * Get current errors (for testing and debugging).
   */
  getErrors(): SemanticError[] {
    return [...this.errors];
  }

  /**
   * Get current warnings (for testing and debugging).
   */
  getWarnings(): SemanticError[] {
    return [...this.warnings];
  }
}

/**
 * Convenience function for single-file analysis.
 * Wraps a single program in an array for the multi-program API.
 */
export function analyzeProgram(program: Program): SemanticResult<SymbolTable> {
  const analyzer = new SemanticAnalyzer();
  return analyzer.analyze([program]);
}

/**
 * Convenience function for multi-file analysis.
 * Explicit multi-program analysis for clarity.
 */
export function analyzePrograms(programs: Program[]): SemanticResult<SymbolTable> {
  const analyzer = new SemanticAnalyzer();
  return analyzer.analyze(programs);
}
