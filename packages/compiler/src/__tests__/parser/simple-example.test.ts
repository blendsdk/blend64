/**
 * Simple Example Parser Tests
 *
 * Demonstrates the parser foundation in action.
 * Shows how to:
 * - Lex source code
 * - Parse into AST
 * - Check for errors
 * - Inspect AST structure
 */

import { describe, expect, it } from 'vitest';
import { Lexer } from '../../lexer/lexer.js';
import { SimpleExampleParser } from '../../parser/simple-example.js';
import { ASTNodeType } from '../../ast/base.js';

describe('SimpleExampleParser - Basic Functionality', () => {
  /**
   * Helper function to parse source code
   */
  function parse(source: string) {
    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();
    const parser = new SimpleExampleParser(tokens);
    const ast = parser.parse();

    return {
      ast,
      diagnostics: parser.getDiagnostics(),
      hasErrors: parser.hasErrors(),
    };
  }

  it('should parse a simple variable declaration', () => {
    const source = 'let x: byte = 5;';
    const { ast, hasErrors } = parse(source);

    // Should parse without errors
    expect(hasErrors).toBe(false);

    // Should have implicit global module
    expect(ast.getModule().getFullName()).toBe('global');
    expect(ast.getModule().isImplicitModule()).toBe(true);

    // Should have one declaration
    const declarations = ast.getDeclarations();
    expect(declarations).toHaveLength(1);

    // First declaration should be a variable
    const varDecl = declarations[0];
    expect(varDecl.getNodeType()).toBe(ASTNodeType.VARIABLE_DECL);
  });

  it('should parse variable with storage class', () => {
    const source = '@zp let counter: byte = 0;';
    const { ast, hasErrors } = parse(source);

    expect(hasErrors).toBe(false);

    const varDecl = ast.getDeclarations()[0] as any;
    expect(varDecl.getName()).toBe('counter');
    expect(varDecl.getTypeAnnotation()).toBe('byte');
    expect(varDecl.getStorageClass()).toBe('ZP'); // TokenType.ZP
    expect(varDecl.isConst()).toBe(false);
  });

  it('should parse const variable', () => {
    const source = 'const MAX: byte = 255;';
    const { ast, hasErrors } = parse(source);

    expect(hasErrors).toBe(false);

    const varDecl = ast.getDeclarations()[0] as any;
    expect(varDecl.getName()).toBe('MAX');
    expect(varDecl.isConst()).toBe(true);
  });

  it('should parse explicit module declaration', () => {
    const source = `module Game.Main
let x: byte = 1;`;
    const { ast, hasErrors } = parse(source);

    expect(hasErrors).toBe(false);

    // Should have explicit module
    expect(ast.getModule().getFullName()).toBe('Game.Main');
    expect(ast.getModule().isImplicitModule()).toBe(false);
    expect(ast.getModule().getNamePath()).toEqual(['Game', 'Main']);
  });

  it('should parse binary expressions', () => {
    const source = 'let result: byte = 2 + 3;';
    const { ast, hasErrors } = parse(source);

    expect(hasErrors).toBe(false);

    const varDecl = ast.getDeclarations()[0] as any;
    const expr = varDecl.getInitializer();

    // Should be: BinaryExpression(2 + 3)
    expect(expr.getNodeType()).toBe(ASTNodeType.BINARY_EXPR);
    expect(expr.getOperator()).toBe('PLUS');
    expect(expr.getLeft().getValue()).toBe(2);
    expect(expr.getRight().getValue()).toBe(3);
  });

  it('should parse hex numbers', () => {
    const source = 'let addr: word = $D000;';
    const { ast, hasErrors } = parse(source);

    expect(hasErrors).toBe(false);

    const varDecl = ast.getDeclarations()[0] as any;
    const expr = varDecl.getInitializer();

    expect(expr.getValue()).toBe(0xd000); // Hex D000 = decimal 53248
  });

  it('should parse multiple variables', () => {
    const source = `@zp let x: byte = 1;
@ram let y: word = 2;
const z: byte = 3;`;

    const { ast, hasErrors } = parse(source);

    expect(hasErrors).toBe(false);
    expect(ast.getDeclarations()).toHaveLength(3);
  });

  it('should handle parse errors gracefully', () => {
    const source = 'let x: byte =;'; // Missing initializer value

    const { ast, hasErrors, diagnostics } = parse(source);

    // Should have errors
    expect(hasErrors).toBe(true);

    // Should report the error
    expect(diagnostics.length).toBeGreaterThan(0);
    expect(diagnostics[0].code).toBe('P001'); // UNEXPECTED_TOKEN

    // Should still return an AST (recovery)
    expect(ast).toBeDefined();
  });

  it('should demonstrate visitor pattern with AST traversal', () => {
    const source = 'let x: byte = 2 + 3;';
    const { ast } = parse(source);

    // Count expression nodes using manual traversal
    let expressionCount = 0;

    const varDecl = ast.getDeclarations()[0] as any;
    const expr = varDecl.getInitializer();

    function countExpressions(node: any): void {
      if (
        node.getNodeType &&
        (node.getNodeType() === ASTNodeType.BINARY_EXPR ||
          node.getNodeType() === ASTNodeType.LITERAL_EXPR ||
          node.getNodeType() === ASTNodeType.IDENTIFIER_EXPR)
      ) {
        expressionCount++;
      }

      // Traverse children
      if (node.getLeft) countExpressions(node.getLeft());
      if (node.getRight) countExpressions(node.getRight());
    }

    countExpressions(expr);

    // Should have: BinaryExpr + LiteralExpr(2) + LiteralExpr(3) = 3 expressions
    expect(expressionCount).toBe(3);
  });

  it('should report error for missing semicolon', () => {
    const source = 'let x: byte = 5'; // Missing semicolon

    const { hasErrors, diagnostics } = parse(source);

    // Should have errors
    expect(hasErrors).toBe(true);

    // Should report semicolon error
    expect(diagnostics.length).toBeGreaterThan(0);
    expect(diagnostics[0].code).toBe('P002'); // EXPECTED_TOKEN
    expect(diagnostics[0].message).toContain('semicolon');
  });

  it('should parse multi-line expressions', () => {
    const source = `let result: byte = 
      1 + 
      2 + 
      3;`;

    const { ast, hasErrors } = parse(source);

    expect(hasErrors).toBe(false);

    const varDecl = ast.getDeclarations()[0] as any;
    expect(varDecl.getName()).toBe('result');
    
    // The expression should parse correctly across multiple lines
    const expr = varDecl.getInitializer();
    expect(expr.getNodeType()).toBe(ASTNodeType.BINARY_EXPR);
  });

  it('should parse module declaration without semicolon', () => {
    // Module declarations are self-terminating (no semicolon needed)
    const source = `module Test.Module
let x: byte = 1;`;

    const { ast, hasErrors } = parse(source);

    expect(hasErrors).toBe(false);
    expect(ast.getModule().getFullName()).toBe('Test.Module');
    expect(ast.getDeclarations()).toHaveLength(1);
  });
});

describe('SimpleExampleParser - Default Storage Class (@ram)', () => {
  /**
   * Helper function to parse source code
   */
  function parse(source: string) {
    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();
    const parser = new SimpleExampleParser(tokens);
    const ast = parser.parse();

    return {
      ast,
      diagnostics: parser.getDiagnostics(),
      hasErrors: parser.hasErrors(),
    };
  }

  it('should default to @ram when storage class is omitted', () => {
    const source = 'let buffer: byte = 0;';
    const { ast, hasErrors } = parse(source);

    expect(hasErrors).toBe(false);

    const varDecl = ast.getDeclarations()[0] as any;
    expect(varDecl.getName()).toBe('buffer');
    expect(varDecl.getStorageClass()).toBe('RAM'); // Should default to RAM
  });

  it('should accept explicit @ram storage class', () => {
    const source = '@ram let buffer: byte = 0;';
    const { ast, hasErrors } = parse(source);

    expect(hasErrors).toBe(false);

    const varDecl = ast.getDeclarations()[0] as any;
    expect(varDecl.getName()).toBe('buffer');
    expect(varDecl.getStorageClass()).toBe('RAM');
  });

  it('should treat explicit @ram and omitted storage class as equivalent', () => {
    const source1 = '@ram let x: byte = 1;';
    const source2 = 'let x: byte = 1;';

    const result1 = parse(source1);
    const result2 = parse(source2);

    expect(result1.hasErrors).toBe(false);
    expect(result2.hasErrors).toBe(false);

    const varDecl1 = result1.ast.getDeclarations()[0] as any;
    const varDecl2 = result2.ast.getDeclarations()[0] as any;

    // Both should have RAM storage class
    expect(varDecl1.getStorageClass()).toBe('RAM');
    expect(varDecl2.getStorageClass()).toBe('RAM');
  });

  it('should handle mixed storage classes with defaults', () => {
    const source = `@zp let counter: byte = 0;
let buffer: byte = 1;
@ram let explicit: byte = 2;
@data const table: byte = 3;`;

    const { ast, hasErrors } = parse(source);

    expect(hasErrors).toBe(false);
    expect(ast.getDeclarations()).toHaveLength(4);

    const decls = ast.getDeclarations() as any[];

    // @zp explicit
    expect(decls[0].getName()).toBe('counter');
    expect(decls[0].getStorageClass()).toBe('ZP');

    // No storage class (defaults to RAM)
    expect(decls[1].getName()).toBe('buffer');
    expect(decls[1].getStorageClass()).toBe('RAM');

    // @ram explicit
    expect(decls[2].getName()).toBe('explicit');
    expect(decls[2].getStorageClass()).toBe('RAM');

    // @data explicit
    expect(decls[3].getName()).toBe('table');
    expect(decls[3].getStorageClass()).toBe('DATA');
  });

  it('should default const variables to @ram', () => {
    const source = 'const MAX: byte = 255;';
    const { ast, hasErrors } = parse(source);

    expect(hasErrors).toBe(false);

    const varDecl = ast.getDeclarations()[0] as any;
    expect(varDecl.isConst()).toBe(true);
    expect(varDecl.getStorageClass()).toBe('RAM'); // Should default to RAM
  });

  it('should parse all three storage classes explicitly', () => {
    const source = `@zp let fast: byte = 0;
@ram let general: byte = 1;
@data const preInit: byte = 2;`;

    const { ast, hasErrors } = parse(source);

    expect(hasErrors).toBe(false);
    expect(ast.getDeclarations()).toHaveLength(3);

    const decls = ast.getDeclarations() as any[];

    expect(decls[0].getStorageClass()).toBe('ZP');
    expect(decls[1].getStorageClass()).toBe('RAM');
    expect(decls[2].getStorageClass()).toBe('DATA');
  });
});
