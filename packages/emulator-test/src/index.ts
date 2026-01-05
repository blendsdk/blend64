/**
 * Blend65 Emulator Testing Package
 * Automated testing with VICE and ACME for compiler validation
 */

// Core classes
export { EmulatorTester } from './emulator-tester.js';
export { AcmeAssembler } from './acme-wrapper.js';
export { ViceEmulator } from './vice-wrapper.js';

// Configuration
export { getToolPaths, validateToolPaths, getValidatedToolPaths } from './tool-config.js';

// Types
export type {
  ToolPaths,
  AssemblyOptions,
  AssemblyResult,
  ViceOptions,
  ViceResult,
  MemoryDump,
  EmulatorTestCase,
  EmulatorTestResult,
  EmulatorTestSuite,
  EmulatorTestSuiteResult
} from './types.js';
