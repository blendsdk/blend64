/**
 * TypeChecker Re-Export
 *
 * This file maintains backward compatibility by re-exporting the TypeChecker
 * from the new type-checker/ directory structure.
 *
 * The TypeChecker implementation has been refactored into an inheritance chain:
 * - type-checker/base.ts: Core infrastructure and helpers
 * - type-checker/literals.ts: Literal expression type checking
 * - type-checker/expressions.ts: Binary and unary operations
 * - type-checker/assignments.ts: Assignment and complex expressions
 * - type-checker/declarations.ts: Declaration and @map type checking
 * - type-checker/type-checker.ts: Final concrete implementation
 *
 * All test imports continue to work through this re-export.
 */

export { TypeChecker } from './type-checker/index.js';
