/**
 * Optimization Patterns - Smart Modular Architecture Entry Point
 *
 * This file provides the main entry point for the optimization pattern library
 * with smart modular architecture, lazy loading, and memory management.
 */

// Core infrastructure
export * from './core/pattern-types';
export * from './core/pattern-registry';
export * from './core/pattern-engine';
export * from './core/optimization-metrics';

// Convenience exports
export { createOptimizationEngine, optimizeExpression } from './core/pattern-engine';
export { createPatternRegistry } from './core/pattern-registry';
export { createMetricsCollector } from './core/optimization-metrics';
