/**
 * Tests for Function Declaration Analysis
 * Task 1.5: Implement Function Declaration Analysis
 *
 * Comprehensive test suite covering:
 * - Basic function declaration validation
 * - Callback function declarations and assignments
 * - Function signature validation
 * - Parameter type checking
 * - Return type validation
 * - Function call validation
 * - Export handling
 * - Error detection and reporting
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FunctionAnalyzer } from '../function-analyzer.js';
import { SymbolTable } from '../../symbol-table.js';
import { TypeChecker } from '../../type-system.js';
import {
  createPrimitiveType,
  createArrayType,
  createCallbackType,
  createScope,
  FunctionSymbol,
  VariableSymbol,
  createVariableSymbol
} from '../../types.js';
import type {
  FunctionDeclaration,
  Parameter,
  TypeAnnotation,
  Expression
} from '@blend65/ast';

describe('FunctionAnalyzer', () => {
  let symbolTable: SymbolTable;
  let typeChecker: TypeChecker;
  let analyzer: FunctionAnalyzer;

  beforeEach(() => {
    symbolTable = new SymbolTable();
    typeChecker = new TypeChecker((name: string) => symbolTable.lookupSymbol(name));
    analyzer = new FunctionAnalyzer(symbolTable, typeChecker);
  });

  // Helper function to create test function declarations
  function createFunctionDecl(options: {
    name: string;
    params?: Parameter[];
    returnType?: TypeAnnotation;
    callback?: boolean;
    exported?: boolean;
  }): FunctionDeclaration {
    return {
      type: 'FunctionDeclaration',
      name: options.name,
      params: options.params || [],
      returnType: options.returnType || {
        type: 'PrimitiveType',
        name: 'void',
        metadata: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 4, offset: 3 } }
      },
      body: [],
      callback: options.callback || false,
      exported: options.exported || false,
      metadata: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 1, offset: 0 } }
    };
  }

  // Helper function to create test parameters
  function createParam(name: string, type: 'byte' | 'word' | 'boolean' | 'callback', hasDefault = false): Parameter {
    return {
      type: 'Parameter',
      name,
      paramType: {
        type: 'PrimitiveType',
        name: type,
        metadata: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 4, offset: 3 } }
      },
      optional: hasDefault,
      defaultValue: hasDefault ? {
        type: 'Literal',
        value: type === 'boolean' ? true : 0,
        raw: type === 'boolean' ? 'true' : '0',
        metadata: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 1, offset: 0 } }
      } : null,
      metadata: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 1, offset: 0 } }
    };
  }

  describe('Basic Function Declaration Analysis', () => {
    it('should analyze simple function declaration', () => {
      const funcDecl = createFunctionDecl({
        name: 'test'
      });

      const result = analyzer.analyzeFunctionDeclaration(funcDecl, 'Global');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('test');
        expect(result.data.symbolType).toBe('Function');
        expect(result.data.parameters).toHaveLength(0);
        expect(result.data.returnType.kind).toBe('primitive');
        expect((result.data.returnType as any).name).toBe('void');
        expect(result.data.isCallback).toBe(false);
        expect(result.data.isExported).toBe(false);
      }
    });

    it('should analyze function with parameters', () => {
      const funcDecl = createFunctionDecl({
        name: 'add',
        params: [
          createParam('a', 'byte'),
          createParam('b', 'byte')
        ],
        returnType: {
          type: 'PrimitiveType',
          name: 'byte',
          metadata: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 4, offset: 3 } }
        }
      });

      const result = analyzer.analyzeFunctionDeclaration(funcDecl, 'Global');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.parameters).toHaveLength(2);
        expect(result.data.parameters[0].name).toBe('a');
        expect(result.data.parameters[0].type.kind).toBe('primitive');
        expect((result.data.parameters[0].type as any).name).toBe('byte');
        expect(result.data.parameters[1].name).toBe('b');
        expect((result.data.returnType as any).name).toBe('byte');
      }
    });

    it('should analyze exported function', () => {
      const funcDecl = createFunctionDecl({
        name: 'publicFunction',
        exported: true
      });

      const result = analyzer.analyzeFunctionDeclaration(funcDecl, 'Global');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isExported).toBe(true);
      }
    });

    it('should detect duplicate function declarations', () => {
      // First declaration
      const funcDecl1 = createFunctionDecl({ name: 'duplicate' });
      const result1 = analyzer.analyzeFunctionDeclaration(funcDecl1, 'Global');
      expect(result1.success).toBe(true);

      // Second declaration (duplicate)
      const funcDecl2 = createFunctionDecl({ name: 'duplicate' });
      const result2 = analyzer.analyzeFunctionDeclaration(funcDecl2, 'Global');

      expect(result2.success).toBe(false);
      expect(result2.errors[0].errorType).toBe('DuplicateSymbol');
      expect(result2.errors[0].message).toContain('already declared');
    });

    it('should detect duplicate parameter names', () => {
      const funcDecl = createFunctionDecl({
        name: 'badParams',
        params: [
          createParam('x', 'byte'),
          createParam('x', 'byte') // Duplicate parameter name
        ]
      });

      const result = analyzer.analyzeFunctionDeclaration(funcDecl, 'Global');

      expect(result.success).toBe(false);
      expect(result.errors[0].errorType).toBe('DuplicateSymbol');
      expect(result.errors[0].message).toContain('used multiple times');
    });
  });

  describe('Callback Function Analysis', () => {
    it('should analyze basic callback function', () => {
      const funcDecl = createFunctionDecl({
        name: 'irqHandler',
        callback: true,
        returnType: {
          type: 'PrimitiveType',
          name: 'void',
          metadata: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 4, offset: 3 } }
        }
      });

      const result = analyzer.analyzeFunctionDeclaration(funcDecl, 'Global');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isCallback).toBe(true);
        expect(result.data.name).toBe('irqHandler');
      }
    });

    it('should analyze callback function with simple parameters', () => {
      const funcDecl = createFunctionDecl({
        name: 'simpleCallback',
        callback: true,
        params: [
          createParam('x', 'byte'),
          createParam('y', 'byte')
        ],
        returnType: {
          type: 'PrimitiveType',
          name: 'boolean',
          metadata: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 7, offset: 6 } }
        }
      });

      const result = analyzer.analyzeFunctionDeclaration(funcDecl, 'Global');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isCallback).toBe(true);
        expect(result.data.parameters).toHaveLength(2);
      }
    });

    it('should reject callback function with too many parameters', () => {
      const funcDecl = createFunctionDecl({
        name: 'tooManyParams',
        callback: true,
        params: [
          createParam('a', 'byte'),
          createParam('b', 'byte'),
          createParam('c', 'byte'),
          createParam('d', 'byte'),
          createParam('e', 'byte') // 5 parameters - too many for callback
        ]
      });

      const result = analyzer.analyzeFunctionDeclaration(funcDecl, 'Global');

      expect(result.success).toBe(false);
      expect(result.errors[0].errorType).toBe('CallbackMismatch');
      expect(result.errors[0].message).toContain('4 or fewer parameters');
    });

    it('should warn about complex callback parameter types', () => {
      // This would need to be tested with array types, but we need to create proper TypeAnnotation
      const funcDecl = createFunctionDecl({
        name: 'complexCallback',
        callback: true,
        params: [
          {
            name: 'buffer',
            paramType: {
              type: 'ArrayType',
              elementType: {
                type: 'PrimitiveType',
                name: 'byte',
                metadata: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 4, offset: 3 } }
              },
              size: {
                type: 'Literal',
                value: 10,
                metadata: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 1, offset: 0 } }
              },
              metadata: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 1, offset: 0 } }
            },
            defaultValue: null,
            metadata: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 1, offset: 0 } }
          }
        ]
      });

      const result = analyzer.analyzeFunctionDeclaration(funcDecl, 'Global');

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.errorType === 'CallbackMismatch')).toBe(true);
    });
  });

  describe('Callback Assignment Validation', () => {
    it('should validate valid callback assignment', () => {
      // First create a callback function
      const callbackDecl = createFunctionDecl({
        name: 'handler',
        callback: true,
        params: [createParam('value', 'byte')],
        returnType: {
          type: 'PrimitiveType',
          name: 'void',
          metadata: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 4, offset: 3 } }
        }
      });

      const funcResult = analyzer.analyzeFunctionDeclaration(callbackDecl, 'Global');
      expect(funcResult.success).toBe(true);

      if (funcResult.success) {
        const callbackFunction = funcResult.data;
        const callbackType = createCallbackType(
          [createPrimitiveType('byte')],
          createPrimitiveType('void')
        );

        const assignmentResult = analyzer.validateCallbackAssignment(
          callbackType,
          callbackFunction,
          { line: 1, column: 1, offset: 0 }
        );

        expect(assignmentResult.success).toBe(true);
      }
    });

    it('should reject assignment of regular function to callback variable', () => {
      // Create a regular (non-callback) function
      const regularDecl = createFunctionDecl({
        name: 'regularFunc',
        callback: false,
        params: [createParam('x', 'byte')]
      });

      const funcResult = analyzer.analyzeFunctionDeclaration(regularDecl, 'Global');
      expect(funcResult.success).toBe(true);

      if (funcResult.success) {
        const regularFunction = funcResult.data;
        const callbackType = createCallbackType(
          [createPrimitiveType('byte')],
          createPrimitiveType('void')
        );

        const assignmentResult = analyzer.validateCallbackAssignment(
          callbackType,
          regularFunction,
          { line: 1, column: 1, offset: 0 }
        );

        expect(assignmentResult.success).toBe(false);
        expect(assignmentResult.errors[0].errorType).toBe('CallbackMismatch');
        expect(assignmentResult.errors[0].message).toContain('Only callback functions can be assigned');
      }
    });

    it('should reject callback assignment with signature mismatch', () => {
      // Create callback function with wrong signature
      const callbackDecl = createFunctionDecl({
        name: 'wrongSignature',
        callback: true,
        params: [createParam('x', 'word')], // word instead of byte
        returnType: {
          type: 'PrimitiveType',
          name: 'void',
          metadata: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 4, offset: 3 } }
        }
      });

      const funcResult = analyzer.analyzeFunctionDeclaration(callbackDecl, 'Global');
      expect(funcResult.success).toBe(true);

      if (funcResult.success) {
        const callbackFunction = funcResult.data;
        const expectedCallbackType = createCallbackType(
          [createPrimitiveType('byte')], // Expects byte
          createPrimitiveType('void')
        );

        const assignmentResult = analyzer.validateCallbackAssignment(
          expectedCallbackType,
          callbackFunction,
          { line: 1, column: 1, offset: 0 }
        );

        expect(assignmentResult.success).toBe(false);
        expect(assignmentResult.errors[0].errorType).toBe('CallbackMismatch');
        expect(assignmentResult.errors[0].message).toContain('signature does not match');
      }
    });

    it('should reject assignment to non-callback type', () => {
      const callbackDecl = createFunctionDecl({
        name: 'validCallback',
        callback: true
      });

      const funcResult = analyzer.analyzeFunctionDeclaration(callbackDecl, 'Global');
      expect(funcResult.success).toBe(true);

      if (funcResult.success) {
        const callbackFunction = funcResult.data;
        const nonCallbackType = createPrimitiveType('byte'); // Not a callback type

        const assignmentResult = analyzer.validateCallbackAssignment(
          nonCallbackType,
          callbackFunction,
          { line: 1, column: 1, offset: 0 }
        );

        expect(assignmentResult.success).toBe(false);
        expect(assignmentResult.errors[0].errorType).toBe('CallbackMismatch');
        expect(assignmentResult.errors[0].message).toContain('non-callback type');
      }
    });
  });

  describe('Function Call Validation', () => {
    it('should validate function call with correct arguments', () => {
      // Create function to call
      const funcDecl = createFunctionDecl({
        name: 'multiply',
        params: [
          createParam('a', 'byte'),
          createParam('b', 'byte')
        ],
        returnType: {
          type: 'PrimitiveType',
          name: 'byte',
          metadata: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 4, offset: 3 } }
        }
      });

      const funcResult = analyzer.analyzeFunctionDeclaration(funcDecl, 'Global');
      expect(funcResult.success).toBe(true);

      if (funcResult.success) {
        const functionSymbol = funcResult.data;

        // Create arguments
        const args: Expression[] = [
          {
            type: 'Literal',
            value: 5,
            metadata: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 1, offset: 0 } }
          },
          {
            type: 'Literal',
            value: 10,
            metadata: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 1, offset: 0 } }
          }
        ];

        const callResult = analyzer.validateFunctionCall(
          functionSymbol,
          args,
          { line: 1, column: 1, offset: 0 }
        );

        expect(callResult.success).toBe(true);
        if (callResult.success) {
          expect(callResult.data.kind).toBe('primitive');
          expect((callResult.data as any).name).toBe('byte');
        }
      }
    });

    it('should reject function call with wrong argument count', () => {
      const funcDecl = createFunctionDecl({
        name: 'needsTwoArgs',
        params: [
          createParam('a', 'byte'),
          createParam('b', 'byte')
        ]
      });

      const funcResult = analyzer.analyzeFunctionDeclaration(funcDecl, 'Global');
      expect(funcResult.success).toBe(true);

      if (funcResult.success) {
        const functionSymbol = funcResult.data;

        // Only provide one argument
        const args: Expression[] = [
          {
            type: 'Literal',
            value: 5,
            metadata: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 1, offset: 0 } }
          }
        ];

        const callResult = analyzer.validateFunctionCall(
          functionSymbol,
          args,
          { line: 1, column: 1, offset: 0 }
        );

        expect(callResult.success).toBe(false);
        expect(callResult.errors[0].errorType).toBe('TypeMismatch');
        expect(callResult.errors[0].message).toContain('expects 2 arguments, got 1');
      }
    });

    it('should handle functions with optional parameters', () => {
      const funcDecl = createFunctionDecl({
        name: 'withDefault',
        params: [
          createParam('required', 'byte'),
          createParam('optional', 'byte', true) // Has default value
        ]
      });

      const funcResult = analyzer.analyzeFunctionDeclaration(funcDecl, 'Global');
      expect(funcResult.success).toBe(true);

      if (funcResult.success) {
        const functionSymbol = funcResult.data;

        // Call with only required argument
        const args: Expression[] = [
          {
            type: 'Literal',
            value: 5,
            metadata: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 1, offset: 0 } }
          }
        ];

        const callResult = analyzer.validateFunctionCall(
          functionSymbol,
          args,
          { line: 1, column: 1, offset: 0 }
        );

        expect(callResult.success).toBe(true);
      }
    });
  });

  describe('Callback Function Call Validation', () => {
    it('should validate callback call through variable', () => {
      // Create a callback variable
      const scope = symbolTable.getCurrentScope();
      const callbackType = createCallbackType(
        [createPrimitiveType('byte')],
        createPrimitiveType('word')
      );

      const callbackVar = createVariableSymbol(
        'handler',
        callbackType,
        scope,
        { line: 1, column: 1, offset: 0 }
      );

      const varResult = symbolTable.declareSymbol(callbackVar);
      expect(varResult.success).toBe(true);

      // Test callback call
      const args: Expression[] = [
        {
          type: 'Literal',
          value: 42,
          metadata: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 1, offset: 0 } }
        }
      ];

      const callResult = analyzer.validateCallbackCall(
        callbackVar,
        args,
        { line: 1, column: 1, offset: 0 }
      );

      expect(callResult.success).toBe(true);
      if (callResult.success) {
        expect(callResult.data.kind).toBe('primitive');
        expect((callResult.data as any).name).toBe('word');
      }
    });

    it('should reject callback call on non-callback variable', () => {
      // Create a regular variable
      const scope = symbolTable.getCurrentScope();
      const regularVar = createVariableSymbol(
        'notCallback',
        createPrimitiveType('byte'),
        scope,
        { line: 1, column: 1, offset: 0 }
      );

      const varResult = symbolTable.declareSymbol(regularVar);
      expect(varResult.success).toBe(true);

      const args: Expression[] = [];

      const callResult = analyzer.validateCallbackCall(
        regularVar,
        args,
        { line: 1, column: 1, offset: 0 }
      );

      expect(callResult.success).toBe(false);
      expect(callResult.errors[0].errorType).toBe('CallbackMismatch');
      expect(callResult.errors[0].message).toContain('Cannot call variable');
    });

    it('should reject callback call with wrong argument count', () => {
      const scope = symbolTable.getCurrentScope();
      const callbackType = createCallbackType(
        [createPrimitiveType('byte'), createPrimitiveType('byte')], // Expects 2 args
        createPrimitiveType('void')
      );

      const callbackVar = createVariableSymbol(
        'twoArgCallback',
        callbackType,
        scope,
        { line: 1, column: 1, offset: 0 }
      );

      symbolTable.declareSymbol(callbackVar);

      // Provide only one argument
      const args: Expression[] = [
        {
          type: 'Literal',
          value: 42,
          metadata: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 1, offset: 0 } }
        }
      ];

      const callResult = analyzer.validateCallbackCall(
        callbackVar,
        args,
        { line: 1, column: 1, offset: 0 }
      );

      expect(callResult.success).toBe(false);
      expect(callResult.errors[0].errorType).toBe('TypeMismatch');
      expect(callResult.errors[0].message).toContain('expects 2 arguments, got 1');
    });
  });

  describe('Export and Scope Validation', () => {
    it('should allow function export at global scope', () => {
      const funcDecl = createFunctionDecl({
        name: 'exportedFunc',
        exported: true
      });

      const result = analyzer.analyzeFunctionDeclaration(funcDecl, 'Global');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isExported).toBe(true);
      }
    });

    it('should reject function export at non-global scope', () => {
      const funcDecl = createFunctionDecl({
        name: 'localExported',
        exported: true
      });

      const result = analyzer.analyzeFunctionDeclaration(funcDecl, 'Function'); // Not global

      expect(result.success).toBe(false);
      expect(result.errors[0].errorType).toBe('InvalidScope');
      expect(result.errors[0].message).toContain('only be exported at module scope');
    });

    it('should reject empty function names', () => {
      const funcDecl = createFunctionDecl({
        name: '' // Empty name
      });

      const result = analyzer.analyzeFunctionDeclaration(funcDecl, 'Global');

      expect(result.success).toBe(false);
      expect(result.errors[0].errorType).toBe('InvalidOperation');
      expect(result.errors[0].message).toContain('cannot be empty');
    });
  });

  describe('Analysis Statistics', () => {
    it('should provide accurate analysis statistics', () => {
      // Create several functions
      const regularFunc = createFunctionDecl({ name: 'regular' });
      const callbackFunc = createFunctionDecl({
        name: 'callback',
        callback: true,
        params: [createParam('x', 'byte')]
      });
      const exportedFunc = createFunctionDecl({
        name: 'exported',
        exported: true,
        returnType: {
          type: 'PrimitiveType',
          name: 'byte',
          metadata: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 4, offset: 3 } }
        }
      });

      analyzer.analyzeFunctionDeclaration(regularFunc, 'Global');
      analyzer.analyzeFunctionDeclaration(callbackFunc, 'Global');
      analyzer.analyzeFunctionDeclaration(exportedFunc, 'Global');

      const stats = analyzer.getAnalysisStatistics();

      expect(stats.functionsAnalyzed).toBe(3);
      expect(stats.callbackFunctions).toBe(1);
      expect(stats.exportedFunctions).toBe(1);
      expect(stats.averageParameterCount).toBeCloseTo(1/3); // Only callback has parameter
      expect(stats.functionsByReturnType['void']).toBe(2);
      expect(stats.functionsByReturnType['byte']).toBe(1);
    });
  });

  describe('Integration with Existing Infrastructure', () => {
    it('should work with symbol table lookup', () => {
      // Create and register a function
      const funcDecl = createFunctionDecl({ name: 'lookupTest' });
      const result = analyzer.analyzeFunctionDeclaration(funcDecl, 'Global');
      expect(result.success).toBe(true);

      // Verify it can be looked up
      const symbol = symbolTable.lookupSymbol('lookupTest');
      expect(symbol).toBeTruthy();
      expect(symbol?.symbolType).toBe('Function');
      expect(symbol?.name).toBe('lookupTest');
    });

    it('should integrate with type checker for parameter validation', () => {
      // This test verifies that the function analyzer properly uses the TypeChecker
      const funcDecl = createFunctionDecl({
        name: 'typeTest',
        params: [
          createParam('valid', 'byte'),
          {
            name: 'invalid',
            paramType: {
              type: 'ArrayType',
              elementType: {
                type: 'PrimitiveType',
                name: 'byte',
                metadata: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 4, offset: 3 } }
              },
              size: {
                type: 'Literal',
                value: -1, // Invalid array size
                metadata: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 1, offset: 0 } }
              },
              metadata: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 1, offset: 0 } }
            },
            defaultValue: null,
            metadata: { start: { line: 1, column: 1, offset: 0 }, end: { line: 1, column: 1, offset: 0 } }
          }
        ]
      });

      const result = analyzer.analyzeFunctionDeclaration(funcDecl, 'Global');

      expect(result.success).toBe(false);
      // Should get error from TypeChecker about invalid array size
      expect(result.errors.some(e => e.errorType === 'ConstantRequired')).toBe(true);
    });
  });
});
