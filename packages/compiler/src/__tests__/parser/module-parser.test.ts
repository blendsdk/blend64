/**
 * ModuleParser Tests
 *
 * Tests module system parsing capabilities including:
 * - Module declarations (explicit and implicit)
 * - Module scope validation
 * - Module name path parsing
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { DiagnosticCode, ModuleDecl } from '../../ast/index.js';
import { Token, TokenType } from '../../lexer/types.js';
import { ModuleParser } from '../../parser/modules.js';

// Create a concrete test implementation of ModuleParser
class TestModuleParser extends ModuleParser {
  // Expose protected methods for testing
  public testParseModuleDecl() {
    return this.parseModuleDecl();
  }

  public testCreateImplicitGlobalModule() {
    return this.createImplicitGlobalModule();
  }

  public testValidateModuleDeclaration() {
    this.validateModuleDeclaration();
  }

  public testValidateModuleScopeItem(token: Token) {
    this.validateModuleScopeItem(token);
  }
}

// Helper to create test tokens
function createToken(type: TokenType, value: string, line = 1, column = 1): Token {
  return {
    type,
    value,
    start: { line, column, offset: column },
    end: { line, column: column + value.length, offset: column + value.length },
  };
}

describe('ModuleParser', () => {
  let parser: TestModuleParser;

  describe('Module Declaration Parsing', () => {
    it('parses simple module declaration', () => {
      const tokens = [
        createToken(TokenType.MODULE, 'module'),
        createToken(TokenType.IDENTIFIER, 'Game'),
        createToken(TokenType.EOF, ''),
      ];
      parser = new TestModuleParser(tokens);

      const moduleDecl = parser.testParseModuleDecl();
      expect(moduleDecl).toBeInstanceOf(ModuleDecl);
      expect(moduleDecl.getNamePath()).toEqual(['Game']);
      expect(moduleDecl.getFullName()).toBe('Game');
      expect(moduleDecl.isImplicitModule()).toBe(false);
    });

    it('parses nested module declaration', () => {
      const tokens = [
        createToken(TokenType.MODULE, 'module'),
        createToken(TokenType.IDENTIFIER, 'Game'),
        createToken(TokenType.DOT, '.'),
        createToken(TokenType.IDENTIFIER, 'Main'),
        createToken(TokenType.EOF, ''),
      ];
      parser = new TestModuleParser(tokens);

      const moduleDecl = parser.testParseModuleDecl();
      expect(moduleDecl).toBeInstanceOf(ModuleDecl);
      expect(moduleDecl.getNamePath()).toEqual(['Game', 'Main']);
      expect(moduleDecl.getFullName()).toBe('Game.Main');
      expect(moduleDecl.isImplicitModule()).toBe(false);
    });

    it('parses deeply nested module declaration', () => {
      const tokens = [
        createToken(TokenType.MODULE, 'module'),
        createToken(TokenType.IDENTIFIER, 'Graphics'),
        createToken(TokenType.DOT, '.'),
        createToken(TokenType.IDENTIFIER, 'Sprites'),
        createToken(TokenType.DOT, '.'),
        createToken(TokenType.IDENTIFIER, 'Player'),
        createToken(TokenType.EOF, ''),
      ];
      parser = new TestModuleParser(tokens);

      const moduleDecl = parser.testParseModuleDecl();
      expect(moduleDecl).toBeInstanceOf(ModuleDecl);
      expect(moduleDecl.getNamePath()).toEqual(['Graphics', 'Sprites', 'Player']);
      expect(moduleDecl.getFullName()).toBe('Graphics.Sprites.Player');
      expect(moduleDecl.isImplicitModule()).toBe(false);
    });

    it('creates implicit global module', () => {
      const tokens = [createToken(TokenType.EOF, '')];
      parser = new TestModuleParser(tokens);

      const moduleDecl = parser.testCreateImplicitGlobalModule();
      expect(moduleDecl).toBeInstanceOf(ModuleDecl);
      expect(moduleDecl.getNamePath()).toEqual(['global']);
      expect(moduleDecl.getFullName()).toBe('global');
      expect(moduleDecl.isImplicitModule()).toBe(true);
    });
  });

  describe('Module Declaration Error Handling', () => {
    it('handles missing module name', () => {
      const tokens = [
        createToken(TokenType.MODULE, 'module'),
        createToken(TokenType.EOF, ''), // Missing identifier
      ];
      parser = new TestModuleParser(tokens);

      parser.testParseModuleDecl();
      const diagnostics = parser.getDiagnostics();
      expect(diagnostics.length).toBe(1);
      expect(diagnostics[0].code).toBe(DiagnosticCode.EXPECTED_TOKEN);
    });

    it('handles missing identifier after dot', () => {
      const tokens = [
        createToken(TokenType.MODULE, 'module'),
        createToken(TokenType.IDENTIFIER, 'Game'),
        createToken(TokenType.DOT, '.'),
        createToken(TokenType.EOF, ''), // Missing identifier after dot
      ];
      parser = new TestModuleParser(tokens);

      parser.testParseModuleDecl();
      const diagnostics = parser.getDiagnostics();
      expect(diagnostics.length).toBe(1);
      expect(diagnostics[0].code).toBe(DiagnosticCode.EXPECTED_TOKEN);
    });

    it('prevents duplicate module declarations', () => {
      const tokens = [
        createToken(TokenType.MODULE, 'module'),
        createToken(TokenType.IDENTIFIER, 'First'),
        createToken(TokenType.EOF, ''),
      ];
      parser = new TestModuleParser(tokens);

      // First module declaration should be fine
      parser.testParseModuleDecl();
      expect(parser.getDiagnostics().length).toBe(0);

      // Second module declaration should error
      parser.testValidateModuleDeclaration();
      const diagnostics = parser.getDiagnostics();
      expect(diagnostics.length).toBe(1);
      expect(diagnostics[0].code).toBe(DiagnosticCode.DUPLICATE_MODULE);
    });
  });

  describe('Module Scope Validation', () => {
    beforeEach(() => {
      parser = new TestModuleParser([createToken(TokenType.EOF, '')]);
    });

    it('allows declaration tokens at module scope', () => {
      const validTokens = [
        TokenType.MODULE,
        TokenType.IMPORT,
        TokenType.EXPORT,
        TokenType.FUNCTION,
        TokenType.LET,
        TokenType.CONST,
        TokenType.TYPE,
        TokenType.ENUM,
        TokenType.ZP,
        TokenType.RAM,
        TokenType.DATA,
        TokenType.EOF,
      ];

      for (const tokenType of validTokens) {
        const token = createToken(tokenType, tokenType.toString());
        parser.testValidateModuleScopeItem(token);
        // Should not add any diagnostics
        expect(parser.getDiagnostics().length).toBe(0);
      }
    });

    it('rejects executable statements at module scope', () => {
      const invalidTokens = [
        { type: TokenType.IDENTIFIER, value: 'someFunction' },
        { type: TokenType.NUMBER, value: '42' },
        { type: TokenType.STRING_LITERAL, value: 'hello' },
        { type: TokenType.IF, value: 'if' },
        { type: TokenType.WHILE, value: 'while' },
      ];

      for (const tokenInfo of invalidTokens) {
        const token = createToken(tokenInfo.type, tokenInfo.value);
        parser.testValidateModuleScopeItem(token);

        const diagnostics = parser.getDiagnostics();
        expect(diagnostics.length).toBeGreaterThan(0);
        expect(diagnostics.some(d => d.code === DiagnosticCode.INVALID_MODULE_SCOPE)).toBe(true);

        // Reset for next test
        parser = new TestModuleParser([createToken(TokenType.EOF, '')]);
      }
    });
  });

  describe('Module Name Processing', () => {
    it('handles single-part module names', () => {
      const tokens = [
        createToken(TokenType.MODULE, 'module'),
        createToken(TokenType.IDENTIFIER, 'Utils'),
        createToken(TokenType.EOF, ''),
      ];
      parser = new TestModuleParser(tokens);

      const moduleDecl = parser.testParseModuleDecl();
      expect(moduleDecl.getNamePath()).toEqual(['Utils']);
      expect(moduleDecl.getFullName()).toBe('Utils');
    });

    it('handles multi-part module names', () => {
      const tokens = [
        createToken(TokenType.MODULE, 'module'),
        createToken(TokenType.IDENTIFIER, 'Engine'),
        createToken(TokenType.DOT, '.'),
        createToken(TokenType.IDENTIFIER, 'Graphics'),
        createToken(TokenType.DOT, '.'),
        createToken(TokenType.IDENTIFIER, 'Renderer'),
        createToken(TokenType.EOF, ''),
      ];
      parser = new TestModuleParser(tokens);

      const moduleDecl = parser.testParseModuleDecl();
      expect(moduleDecl.getNamePath()).toEqual(['Engine', 'Graphics', 'Renderer']);
      expect(moduleDecl.getFullName()).toBe('Engine.Graphics.Renderer');
    });
  });

  describe('Module Location Tracking', () => {
    it('tracks source location correctly', () => {
      const tokens = [
        createToken(TokenType.MODULE, 'module', 1, 1),
        createToken(TokenType.IDENTIFIER, 'Test', 1, 8),
        createToken(TokenType.EOF, '', 1, 12),
      ];
      parser = new TestModuleParser(tokens);

      const moduleDecl = parser.testParseModuleDecl();
      const location = moduleDecl.getLocation();
      expect(location.start.line).toBe(1);
      expect(location.start.column).toBe(1);
      expect(location.end.line).toBe(1);
      expect(location.end.column).toBe(12);
    });
  });
});
