/**
 * Function Declaration Parser Tests
 *
 * Tests for Phase 4 function declaration parsing implementation.
 * Covers all function declaration syntax from the language specification.
 */

import { describe, test, expect } from 'vitest';
import { Lexer } from '../../lexer/index.js';
import { Parser } from '../../parser/index.js';
import { FunctionDecl, Program, DiagnosticSeverity } from '../../ast/index.js';

/**
 * Helper function to parse complete Blend65 source code
 */
function parseBlendProgram(source: string) {
  const lexer = new Lexer(source);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();

  return {
    ast,
    parser,
    diagnostics: parser.getDiagnostics(),
    errors: parser.getDiagnostics().filter(d => d.severity === DiagnosticSeverity.ERROR),
    warnings: parser.getDiagnostics().filter(d => d.severity === DiagnosticSeverity.WARNING),
  };
}

describe('Function Declaration Parser', () => {
  describe('Basic Function Declarations', () => {
    test('parses simple function with no parameters', () => {
      const source = `
        function init(): void
        end function
      `;

      const { ast, errors } = parseBlendProgram(source);

      expect(errors).toHaveLength(0);

      const program = ast as Program;
      const declarations = program.getDeclarations();
      expect(declarations).toHaveLength(1);

      const functionDecl = declarations[0] as FunctionDecl;
      expect(functionDecl.getName()).toBe('init');
      expect(functionDecl.getParameters()).toHaveLength(0);
      expect(functionDecl.getReturnType()).toBe('void');
      expect(functionDecl.isExportedFunction()).toBe(false);
      expect(functionDecl.isCallbackFunction()).toBe(false);
      expect(functionDecl.getBody()).toHaveLength(0);
    });

    test('parses function with parameters', () => {
      const source = `
        function add(a: byte, b: byte): byte
        end function
      `;

      const { ast, errors } = parseBlendProgram(source);

      expect(errors).toHaveLength(0);

      const program = ast as Program;
      const functionDecl = program.getDeclarations()[0] as FunctionDecl;

      expect(functionDecl.getName()).toBe('add');

      const parameters = functionDecl.getParameters();
      expect(parameters).toHaveLength(2);
      expect(parameters[0].name).toBe('a');
      expect(parameters[0].typeAnnotation).toBe('byte');
      expect(parameters[1].name).toBe('b');
      expect(parameters[1].typeAnnotation).toBe('byte');

      expect(functionDecl.getReturnType()).toBe('byte');
    });

    test('parses function with multiple parameter types', () => {
      const source = `
        function complexCalc(count: byte, offset: word, flag: boolean): word
        end function
      `;

      const { ast, errors } = parseBlendProgram(source);

      expect(errors).toHaveLength(0);

      const program = ast as Program;
      const functionDecl = program.getDeclarations()[0] as FunctionDecl;

      const parameters = functionDecl.getParameters();
      expect(parameters).toHaveLength(3);
      expect(parameters[0].typeAnnotation).toBe('byte');
      expect(parameters[1].typeAnnotation).toBe('word');
      expect(parameters[2].typeAnnotation).toBe('boolean');
      expect(functionDecl.getReturnType()).toBe('word');
    });

    test('parses function without return type', () => {
      const source = `
        function doSomething()
        end function
      `;

      const { ast, errors } = parseBlendProgram(source);

      expect(errors).toHaveLength(0);

      const program = ast as Program;
      const functionDecl = program.getDeclarations()[0] as FunctionDecl;

      expect(functionDecl.getReturnType()).toBe(null);
    });
  });

  describe('Export Modifier', () => {
    test('parses exported function', () => {
      const source = `
        export function clearScreen(): void
        end function
      `;

      const { ast, errors } = parseBlendProgram(source);

      expect(errors).toHaveLength(0);

      const program = ast as Program;
      const functionDecl = program.getDeclarations()[0] as FunctionDecl;

      expect(functionDecl.getName()).toBe('clearScreen');
      expect(functionDecl.isExportedFunction()).toBe(true);
    });

    test('handles main function auto-export with warning', () => {
      const source = `
        function main(): void
        end function
      `;

      const { ast, warnings, errors } = parseBlendProgram(source);

      expect(errors).toHaveLength(0);
      expect(warnings).toHaveLength(1);
      expect(warnings[0].message).toContain('Main function should be explicitly exported');

      const program = ast as Program;
      const functionDecl = program.getDeclarations()[0] as FunctionDecl;

      expect(functionDecl.getName()).toBe('main');
      expect(functionDecl.isExportedFunction()).toBe(true); // Auto-exported
    });

    test('explicitly exported main function should not warn', () => {
      const source = `
        export function main(): void
        end function
      `;

      const { warnings } = parseBlendProgram(source);

      expect(warnings).toHaveLength(0); // No warning for explicit export
    });
  });

  describe('Callback Functions', () => {
    test('parses callback function', () => {
      const source = `
        callback function rasterIRQ(): void
        end function
      `;

      const { ast, errors } = parseBlendProgram(source);

      expect(errors).toHaveLength(0);

      const program = ast as Program;
      const functionDecl = program.getDeclarations()[0] as FunctionDecl;

      expect(functionDecl.getName()).toBe('rasterIRQ');
      expect(functionDecl.isCallbackFunction()).toBe(true);
      expect(functionDecl.isExportedFunction()).toBe(false);
    });

    test('parses exported callback function', () => {
      const source = `
        export callback function vblankIRQ(): void
        end function
      `;

      const { ast, errors } = parseBlendProgram(source);

      expect(errors).toHaveLength(0);

      const program = ast as Program;
      const functionDecl = program.getDeclarations()[0] as FunctionDecl;

      expect(functionDecl.getName()).toBe('vblankIRQ');
      expect(functionDecl.isCallbackFunction()).toBe(true);
      expect(functionDecl.isExportedFunction()).toBe(true);
    });
  });

  describe('Function Body Parsing', () => {
    test('parses empty function body', () => {
      const source = `
        function noop(): void
        end function
      `;

      const { ast, errors } = parseBlendProgram(source);

      expect(errors).toHaveLength(0);

      const program = ast as Program;
      const functionDecl = program.getDeclarations()[0] as FunctionDecl;

      expect(functionDecl.getBody()).toHaveLength(0);
    });
  });

  describe('Multiple Function Declarations', () => {
    test('parses multiple functions in same module', () => {
      const source = `
        function init(): void
        end function

        export function main(): void
        end function

        callback function timerIRQ(): void
        end function
      `;

      const { ast, errors } = parseBlendProgram(source);

      expect(errors).toHaveLength(0);

      const program = ast as Program;
      const declarations = program.getDeclarations();
      expect(declarations).toHaveLength(3);

      const [init, main, timer] = declarations as FunctionDecl[];

      expect(init.getName()).toBe('init');
      expect(init.isExportedFunction()).toBe(false);

      expect(main.getName()).toBe('main');
      expect(main.isExportedFunction()).toBe(true);

      expect(timer.getName()).toBe('timerIRQ');
      expect(timer.isCallbackFunction()).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('reports error for missing function name', () => {
      const source = `
        function (): void
        end function
      `;

      const { errors } = parseBlendProgram(source);

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Expected function name');
    });

    test('reports error for missing parameter type', () => {
      const source = `
        function test(x): void
        end function
      `;

      const { errors } = parseBlendProgram(source);

      expect(errors.length).toBeGreaterThan(0);
      // Check that at least one error mentions the missing colon
      const colonError = errors.find(e => e.message.includes("Expected ':' after parameter name"));
      expect(colonError).toBeDefined();
    });

    test('reports error for missing end function', () => {
      const source = `
        function test(): void
          return;
      `;

      const { errors } = parseBlendProgram(source);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toContain("Expected 'end' after function body");
    });

    test('handles parameter parsing errors gracefully', () => {
      const source = `
        function test(a: byte, , c: word): void
        end function
      `;

      const { errors } = parseBlendProgram(source);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toContain('Expected parameter name');
    });
  });

  describe('Specification Compliance', () => {
    test('follows exact grammar from language specification', () => {
      const source = `
        export callback function irqHandler(): void
        end function
      `;

      const { ast, errors } = parseBlendProgram(source);

      expect(errors).toHaveLength(0);

      const program = ast as Program;
      const functionDecl = program.getDeclarations()[0] as FunctionDecl;

      // Verify all specification requirements
      expect(functionDecl.getName()).toBe('irqHandler');
      expect(functionDecl.isExportedFunction()).toBe(true);
      expect(functionDecl.isCallbackFunction()).toBe(true);
      expect(functionDecl.getParameters()).toHaveLength(0);
      expect(functionDecl.getReturnType()).toBe('void');
      expect(functionDecl.getBody().length).toBe(0);
    });

    test('rejects invalid syntax not in specification', () => {
      const source = `
        function* generator(): void
        end function
      `;

      const { errors } = parseBlendProgram(source);

      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
