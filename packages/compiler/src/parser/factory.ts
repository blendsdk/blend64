/**
 * Node factory helpers to keep AST construction DRY and thoroughly documented.
 *
 * Each helper is intentionally tiny so junior contributors can reason about the
 * AST shapes they produce. The shared utilities (like `withSpan`) keep optional
 * metadata merging consistent across every builder.
 */

import type { LiteralValue } from './ast.js';
import {
  AstNodeKind,
  DecoratorKind,
  createNode,
  type BlockStatementNode,
  type DeclarationNode,
  type DecoratorNode,
  type EnumDeclarationNode,
  type EnumMemberNode,
  type ExpressionNode,
  type ExpressionStatementNode,
  type FunctionDeclarationNode,
  type IdentifierNode,
  type ImportDeclarationNode,
  type LiteralNode,
  type ModuleDeclarationNode,
  type NodeFactoryOptions,
  type ParameterNode,
  type ProgramNode,
  type StatementNode,
  type TypeAliasDeclarationNode,
  type TypeReferenceNode,
  type VariableDeclarationNode,
} from './ast.js';
import type { ExportDeclarationNode } from './ast.js';
import type { SourceSpan } from './source.js';

/**
 * Extended options bag for `createProgram` so callers can supply an initial body.
 */
export interface ProgramFactoryOptions extends NodeFactoryOptions {
  /** Optional list of declarations/statements included in the module body. */
  body?: Array<DeclarationNode | StatementNode>;
}

/**
 * Builds a `Program` node that owns the top-level declaration/statement list.
 *
 * @param body - Statements and declarations that make up the module body.
 * @param options - Optional metadata such as span, docs, or decorators.
 */
export function createProgram(
  body: Array<DeclarationNode | StatementNode> = [],
  options: ProgramFactoryOptions = {}
): ProgramNode {
  // Defers to the low-level `createNode` helper so optional metadata is merged
  // consistently across every factory function.
  return createNode(
    AstNodeKind.Program,
    {
      body,
    },
    options
  );
}

/**
 * Creates an identifier node representing a symbol name in source.
 *
 * @param name - Symbol text exactly as it appeared in the source file.
 * @param options - Optional metadata forwarded to `createNode`.
 */
export function createIdentifier(name: string, options: NodeFactoryOptions = {}): IdentifierNode {
  return createNode(
    AstNodeKind.Identifier,
    {
      name,
    },
    options
  );
}

/**
 * Wraps literal values (number/string/boolean) in an AST node for downstream passes.
 *
 * @param value - Runtime literal value parsed from source.
 * @param literalType - Categorization used by consumers (number|string|boolean).
 * @param options - Optional metadata forwarded to `createNode`.
 */
export function createLiteral(
  value: LiteralValue,
  literalType: LiteralNode['literalType'],
  options: NodeFactoryOptions = {}
): LiteralNode {
  return createNode(
    AstNodeKind.Literal,
    {
      value,
      literalType,
    },
    options
  );
}

/**
 * Produces a block statement node that groups a list of statements.
 *
 * @param statements - Child statements contained in the block.
 * @param options - Optional metadata forwarded to `createNode`.
 */
export function createBlock(
  statements: StatementNode[] = [],
  options: NodeFactoryOptions = {}
): BlockStatementNode {
  return createNode(
    AstNodeKind.BlockStatement,
    {
      statements,
    },
    options
  );
}

/**
 * Converts any expression node into an expression statement wrapper.
 *
 * @param expression - Expression evaluated for side effects.
 * @param options - Optional metadata forwarded to `createNode`.
 */
export function createExpressionStatement(
  expression: ExpressionNode,
  options: NodeFactoryOptions = {}
): ExpressionStatementNode {
  return createNode(
    AstNodeKind.ExpressionStatement,
    {
      expression,
    },
    options
  );
}

/**
 * Creates a module declaration node representing `module foo.bar`.
 *
 * @param name - Qualified module identifier segments.
 * @param options - Optional metadata forwarded to `createNode`.
 */
export function createModuleDeclaration(
  name: IdentifierNode[],
  options: NodeFactoryOptions = {}
): ModuleDeclarationNode {
  return createNode(
    AstNodeKind.ModuleDeclaration,
    {
      name,
    },
    options
  );
}

/**
 * Builds an import declaration describing `import foo from target.module`.
 *
 * @param symbols - Named imports being pulled from the source module.
 * @param source - Qualified module identifier segments representing the source.
 * @param options - Optional metadata forwarded to `createNode`.
 */
export function createImportDeclaration(
  symbols: IdentifierNode[],
  source: IdentifierNode[],
  options: NodeFactoryOptions = {}
): ImportDeclarationNode {
  return createNode(
    AstNodeKind.ImportDeclaration,
    {
      symbols,
      source,
    },
    options
  );
}

/**
 * Wraps a declaration inside an export node so consumers can reason about
 * export-specific metadata without mutating the inner declaration.
 *
 * @param declaration - Declaration that is being exported.
 * @param options - Optional metadata forwarded to `createNode`.
 */
export function createExportDeclaration(
  declaration: DeclarationNode,
  options: NodeFactoryOptions = {}
): ExportDeclarationNode {
  return createNode(
    AstNodeKind.ExportDeclaration,
    {
      declaration,
    },
    options
  );
}

/**
 * Creates a function declaration node with the provided structural metadata.
 *
 * @param details - Object describing the function shape such as name, params,
 * return type, and flags.
 * @param options - Optional metadata forwarded to `createNode`.
 */
export function createFunctionDeclaration(
  details: {
    name: IdentifierNode;
    parameters?: ParameterNode[];
    returnType?: TypeReferenceNode;
    body?: BlockStatementNode;
    isCallback?: boolean;
    isExported?: boolean;
  },
  options: NodeFactoryOptions = {}
): FunctionDeclarationNode {
  return createNode(
    AstNodeKind.FunctionDeclaration,
    {
      name: details.name,
      parameters: details.parameters ?? [],
      returnType: details.returnType,
      body: details.body ?? createBlock(),
      isCallback: details.isCallback ?? false,
      isExported: details.isExported ?? false,
    },
    options
  );
}

/**
 * Builds a variable declaration node used for both globals and future locals.
 *
 * @param details - Object describing the variable components.
 * @param options - Optional metadata forwarded to `createNode`.
 */
export function createVariableDeclaration(
  details: {
    name: IdentifierNode;
    type?: TypeReferenceNode;
    initializer?: ExpressionNode;
    storageClass?: DecoratorNode;
    isConst: boolean;
    isExported?: boolean;
  },
  options: NodeFactoryOptions = {}
): VariableDeclarationNode {
  return createNode(
    AstNodeKind.VariableDeclaration,
    {
      name: details.name,
      type: details.type,
      initializer: details.initializer,
      storageClass: details.storageClass,
      isConst: details.isConst,
      isExported: details.isExported ?? false,
    },
    options
  );
}

/**
 * Creates a function parameter node so callers can keep parameter parsing DRY.
 *
 * @param name - Identifier node naming the parameter.
 * @param type - Type reference node describing the parameter type.
 * @param options - Optional metadata forwarded to `createNode`.
 */
export function createParameter(
  name: IdentifierNode,
  type: TypeReferenceNode,
  options: NodeFactoryOptions = {}
): ParameterNode {
  return createNode(
    AstNodeKind.VariableDeclaration,
    {
      name,
      type,
    },
    options
  );
}

/**
 * Produces a type reference node for qualified identifiers such as `foo.bar` or
 * array references like `byte[16]`.
 *
 * @param name - Qualified identifier segments that make up the type name.
 * @param arrayLength - Optional expression describing the array length.
 * @param options - Optional metadata forwarded to `createNode`.
 */
export function createTypeReference(
  name: IdentifierNode[],
  arrayLength?: ExpressionNode,
  options: NodeFactoryOptions = {}
): TypeReferenceNode {
  return createNode(
    AstNodeKind.Identifier,
    {
      name,
      arrayLength,
    },
    options
  );
}

/**
 * Builds a type alias node such as `type SpriteId = byte`.
 *
 * @param name - Identifier that names the alias.
 * @param type - Type reference describing the target type.
 * @param options - Optional metadata forwarded to `createNode`.
 */
export function createTypeAliasDeclaration(
  name: IdentifierNode,
  type: TypeReferenceNode,
  options: NodeFactoryOptions = {}
): TypeAliasDeclarationNode {
  return createNode(
    AstNodeKind.TypeAliasDeclaration,
    {
      name,
      type,
    },
    options
  );
}

/**
 * Creates an enum declaration along with its ordered member list.
 *
 * @param name - Identifier naming the enum.
 * @param members - Ordered member nodes describing enum entries.
 * @param options - Optional metadata forwarded to `createNode`.
 */
export function createEnumDeclaration(
  name: IdentifierNode,
  members: EnumMemberNode[],
  options: NodeFactoryOptions = {}
): EnumDeclarationNode {
  return createNode(
    AstNodeKind.EnumDeclaration,
    {
      name,
      members,
    },
    options
  );
}

/**
 * Creates an individual enum member node.
 *
 * @param name - Identifier naming the enum member.
 * @param value - Optional initializer expression for the member.
 * @param options - Optional metadata forwarded to `createNode`.
 */
export function createEnumMember(
  name: IdentifierNode,
  value?: ExpressionNode,
  options: NodeFactoryOptions = {}
): EnumMemberNode {
  return createNode(
    AstNodeKind.Literal,
    {
      name,
      value,
    },
    options
  );
}

/**
 * Creates a decorator node that wraps metadata such as storage classes.
 *
 * @param decoratorKind - Broad decorator classification.
 * @param name - Identifier describing the decorator being applied.
 * @param args - Optional argument list captured by the decorator.
 * @param options - Optional metadata forwarded to `createNode`.
 */
export function createDecorator(
  decoratorKind: DecoratorKind,
  name: IdentifierNode,
  args: ExpressionNode[] = [],
  options: NodeFactoryOptions = {}
): DecoratorNode {
  return createNode(
    AstNodeKind.Decorator,
    {
      decoratorKind,
      name,
      args,
    },
    options
  );
}

/**
 * Convenience helper for attaching a span to builder options.
 *
 * @param options - Existing options object to extend (defaults to empty).
 * @param span - Span to associate with the eventual node.
 */
export function withSpan(options: NodeFactoryOptions = {}, span: SourceSpan): NodeFactoryOptions {
  // Spreading ensures we do not mutate caller-owned option objects.
  return {
    ...options,
    span,
  };
}

/**
 * Convenience helper for attaching decorators to builder options.
 *
 * @param options - Existing options object to extend (defaults to empty).
 * @param decorators - Decorators to associate with the eventual node.
 */
export function withDecorators(
  options: NodeFactoryOptions = {},
  decorators: DecoratorNode[]
): NodeFactoryOptions {
  // Decorators are optional, so callers can keep reusing the same base options
  // object without worrying about stale metadata.
  return {
    ...options,
    decorators,
  };
}
