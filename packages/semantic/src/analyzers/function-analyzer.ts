/**
 * Function Declaration Analysis for Blend65 Semantic Analysis
 * Task 1.5: Implement Function Declaration Analysis
 *
 * This analyzer validates function declarations according to the Blend65 language specification,
 * including function signature validation, callback function support, parameter type checking,
 * and function call validation.
 *
 * Key Features:
 * - Function signature validation with callback support
 * - Parameter and return type checking
 * - Callback function assignment validation
 * - Function call argument compatibility
 * - Export handling for module system
 * - Duplicate function detection
 *
 * Educational Focus:
 * - How compilers validate function contracts
 * - Callback function type checking for interrupt handlers
 * - Function overloading and signature matching
 * - Symbol table integration for function resolution
 */

import {
  FunctionDeclaration,
  Expression,
  CallExpr,
  Parameter
} from '@blend65/ast';
import {
  FunctionSymbol,
  VariableSymbol,
  Blend65Type,
  SemanticError,
  SemanticResult,
  ScopeType,
  ParameterInfo,
  createFunctionSymbol,
  createCallbackType,
  isPrimitiveType,
  isCallbackType,
  isVariableSymbol,
  isFunctionSymbol,
  typeToString,
  areCallbackTypesCompatible
} from '../types.js';
import { SymbolTable } from '../symbol-table.js';
import { TypeChecker, FunctionSignature, ValidatedParameter } from '../type-system.js';

/**
 * Function analyzer that validates function declarations and creates function symbols.
 * Provides comprehensive validation for both regular functions and v0.3 callback functions.
 */
export class FunctionAnalyzer {
  constructor(
    private symbolTable: SymbolTable,
    private typeChecker: TypeChecker
  ) {}

  /**
   * Analyze a function declaration and create a function symbol.
   * Performs comprehensive validation according to Blend65 language specification.
   *
   * Educational Note:
   * - Function declarations define the contract between caller and callee
   * - Callback functions enable interrupt handlers and function pointers
   * - Parameter validation prevents runtime type errors in 6502 assembly
   */
  analyzeFunctionDeclaration(
    funcDecl: FunctionDeclaration,
    currentScope: ScopeType
  ): SemanticResult<FunctionSymbol> {
    const errors: SemanticError[] = [];
    const location = funcDecl.metadata?.start || { line: 0, column: 0, offset: 0 };

    // 1. Validate function signature using TypeChecker
    const signatureResult = this.typeChecker.validateFunctionSignature(funcDecl, location);
    if (!signatureResult.success) {
      errors.push(...signatureResult.errors);
      return { success: false, errors };
    }
    const signature = signatureResult.data;

    // 2. Check for duplicate function declarations
    const duplicateResult = this.checkDuplicateFunctionDeclaration(funcDecl.name, location);
    if (!duplicateResult.success) {
      errors.push(...duplicateResult.errors);
    }

    // 3. Validate callback function restrictions (if applicable)
    if (funcDecl.callback) {
      const callbackValidation = this.validateCallbackFunctionDeclaration(
        signature,
        location
      );
      if (!callbackValidation.success) {
        errors.push(...callbackValidation.errors);
      }
    }

    // 4. Validate parameter names for uniqueness
    const paramResult = this.validateParameterNames(funcDecl.params, location);
    if (!paramResult.success) {
      errors.push(...paramResult.errors);
    }

    // 5. Additional function-level validations
    const additionalValidation = this.performAdditionalValidations(
      funcDecl,
      signature,
      currentScope,
      location
    );
    if (!additionalValidation.success) {
      errors.push(...additionalValidation.errors);
    }

    // Return errors if validation failed
    if (errors.length > 0) {
      return { success: false, errors };
    }

    // 6. Create and register function symbol
    const scope = this.symbolTable.getCurrentScope();
    const parameterInfo: ParameterInfo[] = signature.parameters.map(param => ({
      name: param.name,
      type: param.type,
      optional: param.hasDefaultValue,
      defaultValue: null // We could store the AST node here if needed
    }));

    const functionSymbol = createFunctionSymbol(
      funcDecl.name,
      parameterInfo,
      signature.returnType,
      scope,
      location,
      {
        isCallback: funcDecl.callback,
        isExported: funcDecl.exported
      }
    );

    const addResult = this.symbolTable.declareSymbol(functionSymbol);
    if (!addResult.success) {
      return { success: false, errors: addResult.errors };
    }

    return { success: true, data: functionSymbol };
  }

  /**
   * Validate callback function assignment compatibility.
   *
   * Educational Note:
   * - Callback variables can only hold callback functions
   * - Signature must match exactly for type safety
   * - Essential for interrupt handlers and function dispatch tables
   */
  validateCallbackAssignment(
    targetType: Blend65Type,
    sourceFunction: FunctionSymbol,
    location: { line: number; column: number; offset: number }
  ): SemanticResult<void> {
    const errors: SemanticError[] = [];

    // Target must be a callback type
    if (!isCallbackType(targetType)) {
      errors.push({
        errorType: 'CallbackMismatch',
        message: `Cannot assign function to non-callback type ${typeToString(targetType)}`,
        location,
        suggestions: [
          'Use a callback variable to hold function references',
          'Declare the target variable with callback type'
        ]
      });
      return { success: false, errors };
    }

    // Source must be a callback function
    if (!sourceFunction.isCallback) {
      errors.push({
        errorType: 'CallbackMismatch',
        message: `Cannot assign regular function '${sourceFunction.name}' to callback variable. Only callback functions can be assigned to callback variables.`,
        location,
        suggestions: [
          `Declare '${sourceFunction.name}' as a callback function`,
          'Use a regular function call instead of assignment',
          'Check if you meant to call the function directly'
        ]
      });
      return { success: false, errors };
    }

    // Create callback type from function signature
    const functionCallbackType = createCallbackType(
      sourceFunction.parameters.map(p => p.type),
      sourceFunction.returnType
    );

    // Check signature compatibility
    if (!areCallbackTypesCompatible(targetType as any, functionCallbackType)) {
      errors.push({
        errorType: 'CallbackMismatch',
        message: `Callback function '${sourceFunction.name}' signature does not match target callback type.\n` +
                `Expected: ${typeToString(targetType)}\n` +
                `Got: ${typeToString(functionCallbackType)}`,
        location,
        suggestions: [
          'Ensure callback function signature matches variable type',
          'Check parameter types and return type compatibility',
          'Verify parameter count matches exactly'
        ]
      });
      return { success: false, errors };
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return { success: true, data: undefined };
  }

  /**
   * Validate function call with argument type checking.
   *
   * Educational Note:
   * - Function calls must match the declared signature exactly
   * - Argument types are checked for compatibility
   * - Return type is inferred from function signature
   */
  validateFunctionCall(
    functionSymbol: FunctionSymbol,
    args: Expression[],
    location: { line: number; column: number; offset: number }
  ): SemanticResult<Blend65Type> {
    const errors: SemanticError[] = [];

    // Check argument count
    const requiredParams = functionSymbol.parameters.filter(p => !p.optional).length;
    const totalParams = functionSymbol.parameters.length;

    if (args.length < requiredParams || args.length > totalParams) {
      const expectedStr = requiredParams === totalParams
        ? `${requiredParams}`
        : `${requiredParams} to ${totalParams}`;

      errors.push({
        errorType: 'TypeMismatch',
        message: `Function '${functionSymbol.name}' expects ${expectedStr} arguments, got ${args.length}`,
        location,
        suggestions: [
          `Provide ${expectedStr} arguments to match function signature`,
          `Check '${functionSymbol.name}' function declaration for required parameters`
        ]
      });
      return { success: false, errors };
    }

    // Check each argument type
    for (let i = 0; i < args.length; i++) {
      const expectedType = functionSymbol.parameters[i].type;

      // Get argument type
      const argTypeResult = this.typeChecker.checkExpressionType(args[i]);
      if (!argTypeResult.success) {
        errors.push(...argTypeResult.errors.map(error => ({
          ...error,
          message: `Argument ${i + 1} error: ${error.message}`
        })));
        continue;
      }

      const actualType = argTypeResult.data;

      // Check type compatibility
      const compatibilityResult = this.typeChecker.checkAssignmentCompatibility(
        expectedType,
        actualType,
        location
      );

      if (!compatibilityResult.success) {
        errors.push({
          errorType: 'TypeMismatch',
          message: `Argument ${i + 1} to function '${functionSymbol.name}' has type ${typeToString(actualType)}, expected ${typeToString(expectedType)}`,
          location,
          suggestions: [
            'Check argument type matches parameter type',
            'Use explicit type conversion if needed',
            'Verify function signature and call arguments'
          ]
        });
      }
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    // Return the function's return type
    return { success: true, data: functionSymbol.returnType };
  }

  /**
   * Validate callback function call through callback variable.
   */
  validateCallbackCall(
    callbackVariable: VariableSymbol,
    args: Expression[],
    location: { line: number; column: number; offset: number }
  ): SemanticResult<Blend65Type> {
    const errors: SemanticError[] = [];

    // Variable must have callback type
    if (!isCallbackType(callbackVariable.varType)) {
      errors.push({
        errorType: 'CallbackMismatch',
        message: `Cannot call variable '${callbackVariable.name}' of type ${typeToString(callbackVariable.varType)} as function`,
        location,
        suggestions: [
          'Use a callback variable for indirect function calls',
          'Call the function directly by name',
          'Check variable type declaration'
        ]
      });
      return { success: false, errors };
    }

    const callbackType = callbackVariable.varType as any;

    // Check argument count
    if (args.length !== callbackType.parameterTypes.length) {
      errors.push({
        errorType: 'TypeMismatch',
        message: `Callback call expects ${callbackType.parameterTypes.length} arguments, got ${args.length}`,
        location,
        suggestions: [
          `Provide exactly ${callbackType.parameterTypes.length} arguments`,
          'Check callback type signature'
        ]
      });
      return { success: false, errors };
    }

    // Check argument types
    for (let i = 0; i < args.length; i++) {
      const expectedType = callbackType.parameterTypes[i];

      const argTypeResult = this.typeChecker.checkExpressionType(args[i]);
      if (!argTypeResult.success) {
        errors.push(...argTypeResult.errors);
        continue;
      }

      const actualType = argTypeResult.data;

      const compatibilityResult = this.typeChecker.checkAssignmentCompatibility(
        expectedType,
        actualType,
        location
      );

      if (!compatibilityResult.success) {
        errors.push({
          errorType: 'CallbackMismatch',
          message: `Callback argument ${i + 1} has type ${typeToString(actualType)}, expected ${typeToString(expectedType)}`,
          location,
          suggestions: [
            'Ensure callback argument types match signature',
            'Check callback variable type declaration'
          ]
        });
      }
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return { success: true, data: callbackType.returnType };
  }

  // ============================================================================
  // PRIVATE VALIDATION METHODS
  // ============================================================================

  /**
   * Check for duplicate function declarations in current scope.
   */
  private checkDuplicateFunctionDeclaration(
    functionName: string,
    location: { line: number; column: number; offset: number }
  ): SemanticResult<void> {
    const existingSymbol = this.symbolTable.lookupSymbolInScope(
      functionName,
      this.symbolTable.getCurrentScope()
    );

    if (existingSymbol) {
      const symbolType = existingSymbol.symbolType;
      const error: SemanticError = {
        errorType: 'DuplicateSymbol',
        message: `Function '${functionName}' is already declared as ${symbolType.toLowerCase()} in this scope`,
        location,
        suggestions: [
          `Use a different function name`,
          `Remove duplicate declaration`,
          `Check for naming conflicts with variables or other functions`
        ]
      };
      return { success: false, errors: [error] };
    }

    return { success: true, data: undefined };
  }

  /**
   * Validate callback function specific restrictions.
   */
  private validateCallbackFunctionDeclaration(
    signature: FunctionSignature,
    location: { line: number; column: number; offset: number }
  ): SemanticResult<void> {
    const errors: SemanticError[] = [];

    // Callback functions should not have too many parameters (6502 limitation)
    if (signature.parameters.length > 4) {
      errors.push({
        errorType: 'CallbackMismatch',
        message: `Callback function has ${signature.parameters.length} parameters. Callback functions should have 4 or fewer parameters for 6502 efficiency.`,
        location,
        suggestions: [
          'Reduce the number of parameters',
          'Use a regular function if many parameters are needed',
          'Consider passing data through global variables'
        ]
      });
    }

    // Check parameter types for 6502 suitability
    for (let i = 0; i < signature.parameters.length; i++) {
      const param = signature.parameters[i];

      // Complex types not ideal for callbacks
      if (!isPrimitiveType(param.type) ||
          (param.type.name !== 'byte' && param.type.name !== 'word' && param.type.name !== 'boolean')) {
        errors.push({
          errorType: 'CallbackMismatch',
          message: `Callback parameter '${param.name}' has type ${typeToString(param.type)}. Callback functions should use simple types (byte, word, boolean) for 6502 efficiency.`,
          location,
          suggestions: [
            'Use byte, word, or boolean types in callback functions',
            'Pass complex data through global variables',
            'Consider using a regular function for complex signatures'
          ]
        });
      }
    }

    // Check return type for 6502 suitability
    if (!isPrimitiveType(signature.returnType)) {
      errors.push({
        errorType: 'CallbackMismatch',
        message: `Callback function return type ${typeToString(signature.returnType)} is not suitable. Callback functions should return simple types (void, byte, word, boolean).`,
        location,
        suggestions: [
          'Use void, byte, word, or boolean return types',
          'Return complex data through global variables',
          'Consider using a regular function for complex return types'
        ]
      });
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return { success: true, data: undefined };
  }

  /**
   * Validate parameter names for uniqueness.
   */
  private validateParameterNames(
    parameters: Parameter[],
    location: { line: number; column: number; offset: number }
  ): SemanticResult<void> {
    const parameterNames = new Set<string>();
    const errors: SemanticError[] = [];

    for (const param of parameters) {
      if (parameterNames.has(param.name)) {
        errors.push({
          errorType: 'DuplicateSymbol',
          message: `Parameter name '${param.name}' is used multiple times in function signature`,
          location,
          suggestions: [
            'Use unique parameter names',
            'Check for typos in parameter names'
          ]
        });
      } else {
        parameterNames.add(param.name);
      }
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return { success: true, data: undefined };
  }

  /**
   * Perform additional function-level validations.
   */
  private performAdditionalValidations(
    funcDecl: FunctionDeclaration,
    signature: FunctionSignature,
    currentScope: ScopeType,
    location: { line: number; column: number; offset: number }
  ): SemanticResult<void> {
    const errors: SemanticError[] = [];

    // Check function naming conventions
    if (funcDecl.name.length === 0) {
      errors.push({
        errorType: 'InvalidOperation',
        message: 'Function name cannot be empty',
        location,
        suggestions: ['Provide a valid function name']
      });
    }

    // Validate export at module scope
    if (funcDecl.exported && currentScope !== 'Global') {
      errors.push({
        errorType: 'InvalidScope',
        message: 'Functions can only be exported at module scope',
        location,
        suggestions: [
          'Remove export modifier for nested functions',
          'Move function to module level to export it'
        ]
      });
    }

    // Check for reserved function names
    const reservedNames = ['main', 'init', 'interrupt'];
    if (reservedNames.includes(funcDecl.name.toLowerCase())) {
      // This is a warning, not an error
      // We could add warnings to SemanticResult if needed
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return { success: true, data: undefined };
  }

  /**
   * Get comprehensive analysis statistics for debugging and reporting.
   */
  getAnalysisStatistics(): {
    functionsAnalyzed: number;
    callbackFunctions: number;
    exportedFunctions: number;
    averageParameterCount: number;
    functionsByReturnType: Record<string, number>;
    errorsDetected: number;
  } {
    // Get all function symbols from symbol table
    const functions: FunctionSymbol[] = [];
    const collectFunctions = (scope: any): void => {
      for (const [_, symbol] of scope.symbols) {
        if (symbol.symbolType === 'Function') {
          functions.push(symbol as FunctionSymbol);
        }
      }
      for (const child of scope.children) {
        collectFunctions(child);
      }
    };
    collectFunctions(this.symbolTable.getGlobalScope());

    let callbackFunctions = 0;
    let exportedFunctions = 0;
    let totalParameters = 0;
    const functionsByReturnType: Record<string, number> = {};

    for (const func of functions) {
      if (func.isCallback) {
        callbackFunctions++;
      }
      if (func.isExported) {
        exportedFunctions++;
      }
      totalParameters += func.parameters.length;

      const returnTypeName = typeToString(func.returnType);
      functionsByReturnType[returnTypeName] = (functionsByReturnType[returnTypeName] || 0) + 1;
    }

    return {
      functionsAnalyzed: functions.length,
      callbackFunctions,
      exportedFunctions,
      averageParameterCount: functions.length > 0 ? totalParameters / functions.length : 0,
      functionsByReturnType,
      errorsDetected: 0 // Updated during analysis
    };
  }
}

/**
 * Convenience function to create and use a function analyzer.
 */
export function analyzeFunctionDeclaration(
  funcDecl: FunctionDeclaration,
  symbolTable: SymbolTable,
  typeChecker: TypeChecker,
  currentScope: ScopeType
): SemanticResult<FunctionSymbol> {
  const analyzer = new FunctionAnalyzer(symbolTable, typeChecker);
  return analyzer.analyzeFunctionDeclaration(funcDecl, currentScope);
}

/**
 * Convenience function for callback assignment validation.
 */
export function validateCallbackAssignment(
  targetType: Blend65Type,
  sourceFunction: FunctionSymbol,
  symbolTable: SymbolTable,
  typeChecker: TypeChecker,
  location: { line: number; column: number; offset: number }
): SemanticResult<void> {
  const analyzer = new FunctionAnalyzer(symbolTable, typeChecker);
  return analyzer.validateCallbackAssignment(targetType, sourceFunction, location);
}

/**
 * Convenience function for function call validation.
 */
export function validateFunctionCall(
  functionSymbol: FunctionSymbol,
  args: Expression[],
  symbolTable: SymbolTable,
  typeChecker: TypeChecker,
  location: { line: number; column: number; offset: number }
): SemanticResult<Blend65Type> {
  const analyzer = new FunctionAnalyzer(symbolTable, typeChecker);
  return analyzer.validateFunctionCall(functionSymbol, args, location);
}
