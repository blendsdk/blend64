# @blend65/emulator-test

Automated VICE emulator and ACME assembler testing for Blend65 compiler validation.

## Overview

This package provides automated testing capabilities for the Blend65 compiler by integrating with:
- **VICE** C64/VIC-20 emulator for program execution
- **ACME** cross-assembler for 6502 assembly compilation

## Installation

1. Install VICE and ACME on your system:
```bash
# macOS with Homebrew
brew install vice acme
```

2. Configure tool paths in `.env` file (copy from `.env.example`):
```bash
# Copy example configuration
cp .env.example .env

# Edit .env with your actual tool paths
VICE64_PATH=/opt/homebrew/bin/x64sc
ACME_PATH=/opt/homebrew/bin/acme
```

## Usage

### Basic Testing

```typescript
import { EmulatorTester } from '@blend65/emulator-test';

// Create tester with auto-configured tools
const tester = await EmulatorTester.create();

// Test a simple assembly program
const result = await tester.testAssemblyProgram(
  'examples/test-assembly/simple-test.asm',
  [{ address: 0x0400, expectedValue: 0x42 }]
);

if (result.success) {
  console.log('✅ Test passed!');
} else {
  console.log('❌ Test failed:', result.errors);
}
```

### Test Suite Execution

```typescript
import { EmulatorTestSuite } from '@blend65/emulator-test';

const testSuite: EmulatorTestSuite = {
  name: 'Basic Assembly Tests',
  testCases: [
    {
      name: 'Memory Store Test',
      assemblyFile: 'test1.asm',
      expectedMemoryStates: [
        { address: 0x0400, expectedValue: 0x42 }
      ]
    },
    {
      name: 'Cycle Count Test',
      assemblyFile: 'test2.asm',
      expectedCycles: 1000,
      toleranceCycles: 10
    }
  ]
};

const results = await tester.runTestSuite(testSuite);
console.log(`Passed: ${results.summary.passed}/${results.summary.total}`);
```

### Individual Component Usage

```typescript
import { AcmeAssembler, ViceEmulator } from '@blend65/emulator-test';

// Assemble program
const acme = new AcmeAssembler('/path/to/acme');
const assemblyResult = await acme.assemble({
  inputFile: 'program.asm',
  outputFile: 'program.prg',
  format: 'cbm'
});

// Run in emulator
const vice = new ViceEmulator('/path/to/x64sc');
const viceResult = await vice.runProgram({
  programFile: 'program.prg',
  memoryDumpAddresses: [0x0400]
});
```

## Features

- **Automated Assembly**: ACME cross-assembler integration with error parsing
- **Emulator Testing**: Headless VICE execution with memory validation
- **Memory State Validation**: Check specific memory addresses after program execution
- **Cycle Count Validation**: Performance testing with cycle counting
- **Test Suite Management**: Organize and run multiple test cases
- **Error Reporting**: Comprehensive error collection and reporting
- **Tool Validation**: Automatic verification of tool availability

## Test Case Configuration

```typescript
interface EmulatorTestCase {
  name: string;
  assemblyFile: string;
  expectedMemoryStates?: Array<{
    address: number;
    expectedValue: number;
  }>;
  expectedCycles?: number;
  toleranceCycles?: number;
  timeoutMs?: number;
}
```

## Assembly File Format

The package expects ACME-compatible assembly files:

```asm
; example.asm - Simple test program
* = $0801

; BASIC stub for auto-run
!byte $0c, $08, $0a, $00, $9e, $32, $30, $36, $34, $00, $00, $00

; Main program
* = $0810
start:
    lda #$42        ; Load test value
    sta $0400       ; Store at test location
    rts             ; Return
```

## Integration with Blend65

This package is designed to validate the Blend65 compiler pipeline:

1. **Code Generation Testing**: Validate generated 6502 assembly
2. **Performance Benchmarking**: Measure cycle counts and execution time
3. **Hardware Compatibility**: Test on accurate C64/VIC-20 emulation
4. **Regression Testing**: Automated validation of compiler changes

## Tool Requirements

- **VICE 3.7+**: C64/VIC-20 emulator with monitor support
- **ACME 0.97+**: Cross-assembler for 6502 code generation
- **Node.js 18+**: Runtime environment

## Development

```bash
# Build package
yarn build

# Run tests
yarn test

# Run with coverage
yarn test:coverage
```

## API Reference

### EmulatorTester

Main orchestrator class combining ACME and VICE.

- `static create()`: Create with auto-configured tools
- `runTestCase(testCase)`: Execute single test
- `runTestSuite(suite)`: Execute test suite
- `testAssemblyProgram(file, memory?)`: Convenience method
- `getToolVersions()`: Get tool version information

### AcmeAssembler

ACME cross-assembler wrapper.

- `assemble(options)`: Compile assembly to .prg file
- `getVersion()`: Get assembler version

### ViceEmulator

VICE emulator wrapper.

- `runProgram(options)`: Execute program with validation
- `validateMemoryStates(file, expected)`: Memory validation helper
- `getVersion()`: Get emulator version

## Error Handling

The package provides comprehensive error handling:

- **Assembly errors**: ACME syntax and semantic errors
- **Execution errors**: VICE runtime failures
- **Validation errors**: Memory state and cycle count mismatches
- **Tool errors**: Missing or invalid tool installations

All errors include detailed messages for debugging and resolution.
