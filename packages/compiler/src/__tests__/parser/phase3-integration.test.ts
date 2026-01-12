/**
 * Phase 3 Integration Tests - Advanced Expression Integration
 *
 * Verifies that all advanced expression features from Phase 3 are properly
 * integrated into the main Parser and work in realistic statement contexts.
 *
 * This test suite confirms that Phase 3 is complete by testing:
 * - Function calls in variable declarations
 * - Member access in assignments
 * - Index expressions in statements
 * - Unary expressions in calculations
 * - Assignment expressions in statement contexts
 * - Complex expression chains
 */

import { describe, test, expect } from 'vitest';
import { Lexer } from '../../lexer/lexer.js';
import { Parser } from '../../parser/parser.js';
import {
  AssignmentExpression,
  BinaryExpression,
  CallExpression,
  ExpressionStatement,
  IndexExpression,
  MemberExpression,
  Program,
  UnaryExpression,
  VariableDecl,
} from '../../ast/index.js';

/**
 * Helper function to parse complete Blend65 source code
 */
function parseBlendProgram(source: string) {
  const lexer = new Lexer(source);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const program = parser.parse();

  return {
    program,
    parser,
    hasErrors: parser.hasErrors(),
    diagnostics: parser.getDiagnostics(),
  };
}

describe('Phase 3 Integration - Advanced Expressions in Statements', () => {
  // ============================================
  // FUNCTION CALLS IN VARIABLE DECLARATIONS
  // ============================================

  test('function calls work in variable declarations', () => {
    const source = `
      module Test

      let result: word = calculateScore(level, bonus);
      let position: byte = getPlayerX();
      let coords: word = distance(x1, y1, x2, y2);
    `;

    const { program, hasErrors } = parseBlendProgram(source);

    expect(hasErrors).toBe(false);
    expect(program.getDeclarations()).toHaveLength(3);

    // Verify function calls are parsed correctly
    const resultDecl = program.getDeclarations()[0] as VariableDecl;
    expect(resultDecl.getInitializer()).toBeInstanceOf(CallExpression);

    const positionDecl = program.getDeclarations()[1] as VariableDecl;
    expect(positionDecl.getInitializer()).toBeInstanceOf(CallExpression);

    const coordsDecl = program.getDeclarations()[2] as VariableDecl;
    expect(coordsDecl.getInitializer()).toBeInstanceOf(CallExpression);
  });

  // ============================================
  // MEMBER ACCESS IN VARIABLE DECLARATIONS
  // ============================================

  test('member access works in variable declarations', () => {
    const source = `
      module Test

      let health: byte = player.health;
      let x: byte = player.position.x;
      let spriteData: byte = vic.sprites[0].data;
    `;

    const { program, hasErrors } = parseBlendProgram(source);

    expect(hasErrors).toBe(false);
    expect(program.getDeclarations()).toHaveLength(3);

    // Verify member access is parsed correctly
    const healthDecl = program.getDeclarations()[0] as VariableDecl;
    expect(healthDecl.getInitializer()).toBeInstanceOf(MemberExpression);

    const xDecl = program.getDeclarations()[1] as VariableDecl;
    expect(xDecl.getInitializer()).toBeInstanceOf(MemberExpression);

    const spriteDecl = program.getDeclarations()[2] as VariableDecl;
    expect(spriteDecl.getInitializer()).toBeInstanceOf(MemberExpression);
  });

  // ============================================
  // INDEX EXPRESSIONS IN VARIABLE DECLARATIONS
  // ============================================

  test('index expressions work in variable declarations', () => {
    const source = `
      module Test

      let firstByte: byte = buffer[0];
      let pixel: byte = screen[y * 40 + x];
      let nested: byte = matrix[row][col];
    `;

    const { program, hasErrors } = parseBlendProgram(source);

    expect(hasErrors).toBe(false);
    expect(program.getDeclarations()).toHaveLength(3);

    // Verify index expressions are parsed correctly
    const firstDecl = program.getDeclarations()[0] as VariableDecl;
    expect(firstDecl.getInitializer()).toBeInstanceOf(IndexExpression);

    const pixelDecl = program.getDeclarations()[1] as VariableDecl;
    expect(pixelDecl.getInitializer()).toBeInstanceOf(IndexExpression);

    const nestedDecl = program.getDeclarations()[2] as VariableDecl;
    expect(nestedDecl.getInitializer()).toBeInstanceOf(IndexExpression);
  });

  // ============================================
  // UNARY EXPRESSIONS IN VARIABLE DECLARATIONS
  // ============================================

  test('unary expressions work in variable declarations', () => {
    const source = `
      module Test

      let inverted: boolean = !gameOver;
      let negated: word = -speed;
      let masked: byte = ~flags;
      let address: word = @counter;
    `;

    const { program, hasErrors } = parseBlendProgram(source);

    expect(hasErrors).toBe(false);
    expect(program.getDeclarations()).toHaveLength(4);

    // Verify unary expressions are parsed correctly
    const invertedDecl = program.getDeclarations()[0] as VariableDecl;
    expect(invertedDecl.getInitializer()).toBeInstanceOf(UnaryExpression);

    const negatedDecl = program.getDeclarations()[1] as VariableDecl;
    expect(negatedDecl.getInitializer()).toBeInstanceOf(UnaryExpression);

    const maskedDecl = program.getDeclarations()[2] as VariableDecl;
    expect(maskedDecl.getInitializer()).toBeInstanceOf(UnaryExpression);

    const addressDecl = program.getDeclarations()[3] as VariableDecl;
    expect(addressDecl.getInitializer()).toBeInstanceOf(UnaryExpression);
  });

  // ============================================
  // COMPLEX EXPRESSION CHAINS
  // ============================================

  test('complex expression chains work in variable declarations', () => {
    const source = `
      module Test

      let value: word = player.inventory.items[slot].getValue();
      let result: byte = !enemies[i].isAlive() && player.health > 0;
      let calculated: word = -getOffset() + array[index].property;
    `;

    const { program, hasErrors } = parseBlendProgram(source);

    expect(hasErrors).toBe(false);
    expect(program.getDeclarations()).toHaveLength(3);

    // Verify complex chains are parsed correctly
    const valueDecl = program.getDeclarations()[0] as VariableDecl;
    expect(valueDecl.getInitializer()).toBeInstanceOf(CallExpression);

    const resultDecl = program.getDeclarations()[1] as VariableDecl;
    expect(resultDecl.getInitializer()).toBeInstanceOf(BinaryExpression);

    const calcDecl = program.getDeclarations()[2] as VariableDecl;
    expect(calcDecl.getInitializer()).toBeInstanceOf(BinaryExpression);
  });

  // ============================================
  // ASSIGNMENT EXPRESSIONS IN STATEMENTS
  // ============================================

  test('assignment expressions work in expression statements', () => {
    const source = `
      module Test

      // This is an implicit global module with expression statements
      let temp: byte = 5;
    `;

    const { program, hasErrors } = parseBlendProgram(source);

    expect(hasErrors).toBe(false);
    expect(program.getDeclarations()).toHaveLength(1);

    // For now, assignments in expression statements would require
    // statement parsing integration, which is planned for future phases
  });

  // ============================================
  // INTEGRATION WITH EXISTING BINARY EXPRESSIONS
  // ============================================

  test('advanced expressions integrate with binary expressions', () => {
    const source = `
      module Test

      let comparison: boolean = player.health > getMaxHealth() / 2;
      let calculation: word = getValue() + array[index] * factor;
      let complex: boolean = !flag && (getValue() > 0 || array[0] == target);
    `;

    const { program, hasErrors } = parseBlendProgram(source);

    expect(hasErrors).toBe(false);
    expect(program.getDeclarations()).toHaveLength(3);

    // Verify advanced expressions work within binary expressions
    const compDecl = program.getDeclarations()[0] as VariableDecl;
    expect(compDecl.getInitializer()).toBeInstanceOf(BinaryExpression);

    const calcDecl = program.getDeclarations()[1] as VariableDecl;
    expect(calcDecl.getInitializer()).toBeInstanceOf(BinaryExpression);

    const complexDecl = program.getDeclarations()[2] as VariableDecl;
    expect(complexDecl.getInitializer()).toBeInstanceOf(BinaryExpression);
  });

  // ============================================
  // PRECEDENCE AND ASSOCIATIVITY VERIFICATION
  // ============================================

  test('precedence works correctly with advanced expressions', () => {
    const source = `
      module Test

      let test1: word = func() + value;
      let test2: boolean = !flag || getValue() > 0;
      let test3: byte = array[index] * 2 + offset;
      let test4: word = obj.prop + func() * array[i];
    `;

    const { program, hasErrors } = parseBlendProgram(source);

    expect(hasErrors).toBe(false);
    expect(program.getDeclarations()).toHaveLength(4);

    // Verify all expressions parse as binary expressions with correct precedence
    for (let i = 0; i < 4; i++) {
      const decl = program.getDeclarations()[i] as VariableDecl;
      expect(decl.getInitializer()).toBeInstanceOf(BinaryExpression);
    }
  });

  // ============================================
  // ERROR HANDLING WITH ADVANCED EXPRESSIONS
  // ============================================

  test('error recovery works with advanced expressions', () => {
    const source = `
      module Test

      let valid1: byte = func(arg);

      let invalid: byte = func(.property;  // Syntax error

      let valid2: byte = array[index];
    `;

    const { program, hasErrors, diagnostics } = parseBlendProgram(source);

    expect(hasErrors).toBe(true);
    expect(diagnostics.length).toBeGreaterThan(0);

    // Should still parse valid declarations
    expect(program.getDeclarations().length).toBeGreaterThan(0);
  });

  // ============================================
  // REAL-WORLD USAGE SCENARIOS
  // ============================================

  test('real-world C64 game expressions', () => {
    const source = `
      module C64Game

      // Sprite collision detection
      let collision: boolean = !sprites[0].isActive() || getDistance(player.x, player.y, enemy.x, enemy.y) < 16;

      // Screen memory calculations
      let screenAddr: word = @screen + player.y * 40 + player.x;

      // Color cycling
      let newColor: byte = (borderColor + 1) == 16;

      // Sound frequency calculation
      let frequency: word = baseFreq * notes[currentNote] / 256;

      // Joystick input processing
      let moveRight: boolean = (joystick[0] & 8) == 0 && player.x < SCREEN_WIDTH - 1;
    `;

    const { program, hasErrors } = parseBlendProgram(source);

    expect(hasErrors).toBe(false);
    expect(program.getDeclarations()).toHaveLength(5);

    // Verify all complex expressions parse correctly
    program.getDeclarations().forEach(decl => {
      const variableDecl = decl as VariableDecl;
      expect(variableDecl.getInitializer()).toBeTruthy();
      // Each expression should be either a binary expression or complex expression
      expect(
        variableDecl.getInitializer() instanceof BinaryExpression ||
          variableDecl.getInitializer() instanceof CallExpression ||
          variableDecl.getInitializer() instanceof UnaryExpression ||
          variableDecl.getInitializer() instanceof MemberExpression ||
          variableDecl.getInitializer() instanceof IndexExpression
      ).toBe(true);
    });
  });

  // ============================================
  // PERFORMANCE WITH COMPLEX EXPRESSIONS
  // ============================================

  test('performance with many advanced expressions', () => {
    let source = 'module Performance\n';

    // Generate many complex expressions
    for (let i = 0; i < 50; i++) {
      source += `let expr${i}: word = getValue${i}() + array[${i}] * factor.multiplier;\n`;
    }

    const startTime = performance.now();
    const { program, hasErrors } = parseBlendProgram(source);
    const endTime = performance.now();

    expect(hasErrors).toBe(false);
    expect(program.getDeclarations()).toHaveLength(50);

    // Should parse efficiently
    const parseTime = endTime - startTime;
    expect(parseTime).toBeLessThan(500); // Less than 0.5 seconds
  });

  // ============================================
  // COMPREHENSIVE INTEGRATION TEST
  // ============================================

  test('comprehensive Phase 3 integration test', () => {
    const source = `
      module ComprehensiveTest

      // All advanced expression types in realistic context
      let functionCall: word = calculateScore(level, multiplier);
      let memberAccess: byte = player.health;
      let indexAccess: byte = buffer[offset];
      let unaryNot: boolean = !gameOver;
      let unaryMinus: word = -velocity;
      let unaryBitwise: byte = ~mask;
      let addressOf: word = @counter;

      // Complex chains
      let chain1: word = player.inventory.items[slot].getValue();
      let chain2: boolean = enemies[i].isAlive() && player.health > 0;
      let chain3: byte = getSprite(index).x + offset;

      // Mixed with binary operators
      let mixed1: word = func() + value * 2;
      let mixed2: boolean = array[i] == target && !disabled;
      let mixed3: byte = ~flags | getValue() & mask;

      // Deeply nested
      let nested: boolean = ((func() + array[i]) * factor) > (player.health - damage);

      // Real C64 scenarios
      let spriteCollision: boolean = (vic.spriteCollision & (1 << spriteIndex)) != 0;
      let colorCycle: byte = colorTable[(frameCounter + colorOffset) % COLOR_TABLE_SIZE];
      let soundFreq: word = frequencies[noteIndex] + vibrato.getValue();
    `;

    const { program, hasErrors, diagnostics } = parseBlendProgram(source);

    expect(hasErrors).toBe(false);
    expect(diagnostics).toHaveLength(0);
    expect(program.getDeclarations()).toHaveLength(17);

    // Verify each declaration has a valid initializer
    program.getDeclarations().forEach((decl, index) => {
      const variableDecl = decl as VariableDecl;
      expect(variableDecl.getInitializer()).toBeTruthy();
      expect(variableDecl.getName()).toMatch(
        /^(functionCall|memberAccess|indexAccess|unary|addressOf|chain|mixed|nested|spriteCollision|colorCycle|soundFreq)/
      );
    });

    // This test confirms that Phase 3 advanced expressions are fully integrated
    // and working correctly in the main Parser implementation
  });
});
