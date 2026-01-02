# Content-Based Module Resolution Implementation Plan

**Status:** Planned
**Date:** January 2026
**Impact:** Complete overhaul of import system to use content-based resolution with dot syntax

---

## Overview

This plan details the implementation of a new content-based module resolution system for blend65 that:
- Uses dot syntax (`.`) instead of colon syntax (`:`) for imports
- Resolves modules by scanning files for `module` declarations, not by file paths
- Provides flexible project organization where files can be located anywhere
- Maintains target-specific import resolution for hardware APIs

---

## Implementation Phases

### Phase 1: Lexer/Parser Updates

#### 1.1 Token Updates
**Location:** `src/lexer/tokens.ts`

Update import tokenization to handle dot syntax:
```typescript
// Remove special handling for ':' in import contexts
// Ensure '.' (DOT) token is properly recognized in module paths
// Update token precedence for qualified names

enum TokenType {
  DOT = 'DOT',                    // For module.submodule syntax
  IDENTIFIER = 'IDENTIFIER',      // For module names
  FROM = 'FROM',                 // import ... from ...
  IMPORT = 'IMPORT'              // import keyword
}
```

#### 1.2 Grammar Updates
**Location:** `src/parser/grammar.ts`

Update EBNF grammar for new import syntax:
```ebnf
import_decl ::= "import" import_list "from" qualified_module_name newline
import_list ::= ident { "," ident }*
qualified_module_name ::= ident { "." ident }*
```

#### 1.3 Parser Updates
**Location:** `src/parser/parser.ts`

Update `parseImportDeclaration()` method:
```typescript
parseImportDeclaration(): ImportNode {
  this.expect(TokenType.IMPORT);
  const imports = this.parseImportList();
  this.expect(TokenType.FROM);
  const modulePath = this.parseQualifiedModuleName(); // New method
  return new ImportNode(imports, modulePath);
}

parseQualifiedModuleName(): QualifiedName {
  const parts: string[] = [];
  parts.push(this.expect(TokenType.IDENTIFIER).value);

  while (this.check(TokenType.DOT)) {
    this.advance(); // consume '.'
    parts.push(this.expect(TokenType.IDENTIFIER).value);
  }

  return new QualifiedName(parts);
}
```

### Phase 2: Module Discovery System

#### 2.1 File Scanner
**Location:** `src/modules/scanner.ts`

Create module file scanner:
```typescript
interface ModuleInfo {
  moduleName: string;
  filePath: string;
  exports: string[];
  lastModified: Date;
}

class ModuleScanner {
  async scanDirectory(rootPath: string): Promise<ModuleInfo[]> {
    const modules: ModuleInfo[] = [];
    const files = await this.findBlendFiles(rootPath);

    for (const file of files) {
      const moduleInfo = await this.extractModuleInfo(file);
      if (moduleInfo) {
        modules.push(moduleInfo);
      }
    }

    return modules;
  }

  private async findBlendFiles(dir: string): Promise<string[]> {
    // Recursively find all .blend files
  }

  private async extractModuleInfo(filePath: string): Promise<ModuleInfo | null> {
    // Parse file to extract module declaration and exports
  }
}
```

#### 2.2 Module Index
**Location:** `src/modules/index.ts`

Create module index for fast lookup:
```typescript
class ModuleIndex {
  private modules = new Map<string, ModuleInfo>();
  private lastScan: Date | null = null;

  async build(projectRoot: string): Promise<void> {
    const scanner = new ModuleScanner();
    const modules = await scanner.scanDirectory(projectRoot);

    this.modules.clear();
    for (const module of modules) {
      if (this.modules.has(module.moduleName)) {
        throw new Error(`Duplicate module: ${module.moduleName}`);
      }
      this.modules.set(module.moduleName, module);
    }

    this.lastScan = new Date();
  }

  resolve(moduleName: string): ModuleInfo | null {
    return this.modules.get(moduleName) || null;
  }

  getAllModules(): ModuleInfo[] {
    return Array.from(this.modules.values());
  }
}
```

### Phase 3: Import Resolution Engine

#### 3.1 Module Resolver
**Location:** `src/modules/resolver.ts`

Create the core resolution engine:
```typescript
interface ResolutionContext {
  targetMachine: string;
  projectRoot: string;
  moduleIndex: ModuleIndex;
}

class ModuleResolver {
  constructor(private context: ResolutionContext) {}

  async resolveImport(importDecl: ImportNode): Promise<ResolvedImport> {
    const modulePath = importDecl.modulePath;

    // Handle target.* resolution
    if (modulePath.startsWith('target.')) {
      return this.resolveTargetModule(modulePath, importDecl.imports);
    }

    // Handle regular module resolution
    return this.resolveUserModule(modulePath, importDecl.imports);
  }

  private async resolveTargetModule(
    modulePath: string,
    imports: string[]
  ): Promise<ResolvedImport> {
    // Replace 'target' with current target machine
    const targetModulePath = modulePath.replace(
      'target.',
      `${this.context.targetMachine}.`
    );
    return this.resolveUserModule(targetModulePath, imports);
  }

  private async resolveUserModule(
    modulePath: string,
    imports: string[]
  ): Promise<ResolvedImport> {
    const moduleInfo = this.context.moduleIndex.resolve(modulePath);

    if (!moduleInfo) {
      throw new Error(`Module not found: ${modulePath}`);
    }

    // Validate imported symbols exist
    for (const importName of imports) {
      if (!moduleInfo.exports.includes(importName)) {
        throw new Error(
          `Symbol '${importName}' not exported from '${modulePath}'`
        );
      }
    }

    return new ResolvedImport(moduleInfo, imports);
  }
}
```

#### 3.2 Target Resolution
**Location:** `src/modules/target-resolver.ts`

Handle target-specific module resolution:
```typescript
class TargetResolver {
  constructor(private targetMachine: string) {}

  resolveTargetModule(modulePath: string): string {
    // target.sprites -> c64.sprites (when target=c64)
    if (modulePath.startsWith('target.')) {
      return modulePath.replace('target.', `${this.targetMachine}.`);
    }
    return modulePath;
  }

  isTargetSpecific(modulePath: string): boolean {
    return modulePath.startsWith('target.');
  }

  validateTargetModule(modulePath: string): boolean {
    // Validate that target-specific module exists for current target
    const parts = modulePath.split('.');
    return parts[0] === this.targetMachine;
  }
}
```

### Phase 4: Caching and Performance

#### 4.1 Module Cache
**Location:** `src/modules/cache.ts`

Implement caching for performance:
```typescript
interface CacheEntry {
  moduleIndex: ModuleIndex;
  timestamp: Date;
  projectRoot: string;
}

class ModuleCache {
  private cache = new Map<string, CacheEntry>();

  async getOrBuild(projectRoot: string): Promise<ModuleIndex> {
    const existing = this.cache.get(projectRoot);

    if (existing && this.isValid(existing)) {
      return existing.moduleIndex;
    }

    const moduleIndex = new ModuleIndex();
    await moduleIndex.build(projectRoot);

    this.cache.set(projectRoot, {
      moduleIndex,
      timestamp: new Date(),
      projectRoot
    });

    return moduleIndex;
  }

  private isValid(entry: CacheEntry): boolean {
    // Check if any source files changed since last cache
    // Implementation would check file modification times
    return true; // Simplified
  }

  invalidate(projectRoot: string): void {
    this.cache.delete(projectRoot);
  }
}
```

#### 4.2 Incremental Updates
**Location:** `src/modules/watcher.ts`

Watch for file changes and update index incrementally:
```typescript
class ModuleWatcher {
  constructor(private moduleIndex: ModuleIndex) {}

  startWatching(projectRoot: string): void {
    // Use file system watcher to detect changes
    // Update module index when files are added/removed/modified
  }

  onFileChanged(filePath: string): void {
    // Re-scan specific file and update index
  }

  onFileAdded(filePath: string): void {
    // Add new module to index
  }

  onFileRemoved(filePath: string): void {
    // Remove module from index
  }
}
```

### Phase 5: Error Handling and Diagnostics

#### 5.1 Error Types
**Location:** `src/modules/errors.ts`

Define comprehensive error types:
```typescript
abstract class ModuleError extends Error {
  abstract readonly code: string;
  abstract readonly severity: 'error' | 'warning';
}

class ModuleNotFoundError extends ModuleError {
  code = 'MODULE_NOT_FOUND';
  severity = 'error' as const;

  constructor(moduleName: string) {
    super(`Module '${moduleName}' not found in project`);
  }
}

class DuplicateModuleError extends ModuleError {
  code = 'DUPLICATE_MODULE';
  severity = 'error' as const;

  constructor(moduleName: string, files: string[]) {
    super(`Module '${moduleName}' defined in multiple files: ${files.join(', ')}`);
  }
}

class ImportNotFoundError extends ModuleError {
  code = 'IMPORT_NOT_FOUND';
  severity = 'error' as const;

  constructor(importName: string, moduleName: string) {
    super(`Function '${importName}' not exported from '${moduleName}'`);
  }
}

class TargetModuleUnavailableError extends ModuleError {
  code = 'TARGET_MODULE_UNAVAILABLE';
  severity = 'error' as const;

  constructor(moduleName: string, target: string) {
    super(`Module '${moduleName}' not available for target '${target}'`);
  }
}
```

#### 5.2 Diagnostic Reporter
**Location:** `src/modules/diagnostics.ts`

Create diagnostic reporting system:
```typescript
interface Diagnostic {
  error: ModuleError;
  location?: SourceLocation;
  suggestions?: string[];
}

class DiagnosticReporter {
  private diagnostics: Diagnostic[] = [];

  report(error: ModuleError, location?: SourceLocation): void {
    const diagnostic: Diagnostic = {
      error,
      location,
      suggestions: this.generateSuggestions(error)
    };
    this.diagnostics.push(diagnostic);
  }

  private generateSuggestions(error: ModuleError): string[] {
    switch (error.code) {
      case 'MODULE_NOT_FOUND':
        return this.suggestSimilarModules(error.message);
      case 'IMPORT_NOT_FOUND':
        return this.suggestAvailableExports(error.message);
      default:
        return [];
    }
  }

  getDiagnostics(): Diagnostic[] {
    return [...this.diagnostics];
  }

  hasErrors(): boolean {
    return this.diagnostics.some(d => d.error.severity === 'error');
  }
}
```

### Phase 6: Integration with Compiler Pipeline

#### 6.1 Compiler Integration
**Location:** `src/compiler/compiler.ts`

Integrate module resolution into main compiler:
```typescript
class Compiler {
  private moduleCache = new ModuleCache();
  private resolver: ModuleResolver;

  async compile(
    entryFile: string,
    target: string,
    projectRoot: string
  ): Promise<CompilationResult> {
    // 1. Build module index
    const moduleIndex = await this.moduleCache.getOrBuild(projectRoot);

    // 2. Create resolver context
    this.resolver = new ModuleResolver({
      targetMachine: target,
      projectRoot,
      moduleIndex
    });

    // 3. Parse and resolve imports for all files
    const resolvedModules = await this.resolveAllImports();

    // 4. Continue with rest of compilation pipeline
    return this.generateCode(resolvedModules);
  }

  private async resolveAllImports(): Promise<ResolvedModule[]> {
    // Implementation for resolving all imports in dependency order
  }
}
```

### Phase 7: Tooling Support

#### 7.1 IDE Support
**Location:** `src/tools/ide-support.ts`

Provide IDE integration features:
```typescript
class IDESupport {
  constructor(private moduleIndex: ModuleIndex) {}

  getAutocompleteSuggestions(
    modulePath: string,
    position: number
  ): string[] {
    // Provide autocomplete for module names and exports
  }

  findDefinition(
    moduleName: string,
    symbolName: string
  ): SourceLocation | null {
    // Navigate to module definition
    const moduleInfo = this.moduleIndex.resolve(moduleName);
    if (moduleInfo) {
      return this.findSymbolInFile(moduleInfo.filePath, symbolName);
    }
    return null;
  }

  findReferences(symbolName: string): SourceLocation[] {
    // Find all references to a symbol across the project
  }

  generateDependencyGraph(): ModuleDependencyGraph {
    // Generate visual dependency graph for tooling
  }
}
```

---

## Testing Strategy

### Unit Tests

#### Module Scanner Tests
```typescript
describe('ModuleScanner', () => {
  test('discovers modules in nested directories', async () => {
    // Test recursive file discovery
  });

  test('extracts module declaration correctly', async () => {
    // Test module name parsing
  });

  test('identifies exported symbols', async () => {
    // Test export detection
  });
});
```

#### Module Resolver Tests
```typescript
describe('ModuleResolver', () => {
  test('resolves target.sprites to c64.sprites for C64 target', async () => {
    // Test target resolution
  });

  test('throws error for missing module', async () => {
    // Test error handling
  });

  test('validates imported symbols exist', async () => {
    // Test symbol validation
  });
});
```

### Integration Tests

#### End-to-End Import Resolution
```typescript
describe('Import Resolution Integration', () => {
  test('resolves complex project with multiple modules', async () => {
    // Test real project scenarios
  });

  test('handles circular dependencies gracefully', async () => {
    // Test cycle detection
  });
});
```

---

## Migration Strategy

### Phase 1: Dual Support (Temporary)
- Support both `:` and `.` syntax during transition
- Add deprecation warnings for `:` syntax
- Update all examples to use `.` syntax

### Phase 2: Update Existing Code
- Provide automated migration tool to convert `:` to `.`
- Update all documentation and examples
- Convert target module files to new system

### Phase 3: Remove Legacy Support
- Remove `:` syntax support from lexer/parser
- Clean up legacy code paths
- Finalize new system

---

## Performance Considerations

### Caching
- Cache module index between compilations
- Incremental updates for file changes
- Lazy loading of module content

### Optimization
- Parallel file scanning for large projects
- Smart dependency ordering to minimize re-parsing
- Memory-efficient storage of module metadata

### Scalability
- Handle projects with thousands of modules
- Efficient lookup algorithms (O(1) for module resolution)
- Minimal memory footprint for module index

---

## Deliverables

1. **Updated Language Specification** ✅
2. **Lexer/Parser Updates**
3. **Module Discovery System**
4. **Import Resolution Engine**
5. **Caching and Performance Optimizations**
6. **Error Handling and Diagnostics**
7. **Compiler Integration**
8. **IDE Support Tools**
9. **Test Suite**
10. **Migration Tools**
11. **Updated Documentation**

---

## Timeline Estimates

- **Phase 1 (Lexer/Parser)**: 3-5 days
- **Phase 2 (Module Discovery)**: 5-7 days
- **Phase 3 (Resolution Engine)**: 7-10 days
- **Phase 4 (Caching/Performance)**: 3-5 days
- **Phase 5 (Error Handling)**: 3-5 days
- **Phase 6 (Compiler Integration)**: 2-3 days
- **Phase 7 (Tooling)**: 5-7 days
- **Testing & Documentation**: 5-7 days

**Total Estimated Time**: 33-49 days

---

This implementation plan provides a comprehensive roadmap for migrating blend65 to content-based module resolution with intuitive dot syntax, significantly improving the developer experience and project organization flexibility.
