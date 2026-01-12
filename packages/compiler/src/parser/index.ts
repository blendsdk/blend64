/**
 * Parser Module Public API
 *
 * This module exports all parser-related types, classes, and utilities
 * for use throughout the compiler.
 *
 * Architecture: Inheritance Chain
 * BaseParser → ExpressionParser → DeclarationParser → ModuleParser → Parser
 */

// Parser configuration
export * from './config.js';

// Operator precedence
export * from './precedence.js';

// Base parser infrastructure
export * from './base.js';

// Expression parsing layer
export * from './expressions.js';

// Declaration parsing layer
export * from './declarations.js';

// Module system parsing layer
export * from './modules.js';

// Main concrete parser class (primary export)
export * from './parser.js';

// Re-export ParseError for convenience
export { ParseError } from './base.js';
