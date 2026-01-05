# Blend65 Semantic Analysis Optimization Enhancement Plan

**Purpose:** Complete semantic analysis infrastructure for peephole optimization readiness
**Date:** 2026-01-03
**Status:** Implementation Plan - Ready for Execution
**Prerequisites:** Task 1.6 (Module System Analysis) Complete - 279 tests passing

---

## Executive Summary

The current semantic analysis infrastructure provides solid foundations but is missing **critical optimization metadata collection** essential for effective peephole optimization. This plan implements **Tasks 1.7-1.12** to complete Phase 1 of the backend with full optimization readiness.

**Current Status Assessment:**
- ✅ **Symbol System**: Complete with all Blend65 constructs
- ✅ **Type System**: Full validation with 6502 storage classes
- ✅ **Module System**: Cross-file import/export resolution complete
- ✅ **Scope Management**: Hierarchical scoping working
- ⚠️ **Expression Analysis**: Missing (Task 1.7)
- ⚠️ **Optimization Metadata**: Missing across all analyzers
- ⚠️ **Control Flow**: Missing CFG construction
- ⚠️ **Hardware Analysis**: Missing 6502-specific patterns

**Goals:**
1. **Complete semantic analysis validation** for all Blend65 constructs
2. **Collect optimization metadata** during semantic analysis
3. **Build foundations** for IL-level and assembly-level optimizations
4. **Maintain backward compatibility** with existing 279 tests
5. **Prepare optimization context** for Phase 2 (IL system)

---

## Implementation Architecture

### **Two-Stage Optimization Metadata Collection**

**Stage 1: Semantic Analysis Enhancements (This Plan)**
- Expression and statement validation with optimization metadata
- Variable usage pattern analysis
- Function complexity and inlining analysis
- Control flow graph construction
- Hardware usage pattern detection

**Stage 2: IL/Assembly Optimization (Future)**
- Use collected metadata for IL optimization passes
- Assembly peephole optimization using semantic context
- 6502-specific optimization patterns

### **Enhanced Semantic Analysis Pipeline**
```
Raw AST (from parser)
    ↓
Phase 1: Module Registration (existing)
    ↓
Phase 2: Declaration Processing (enhanced with metadata)
    ↓
Phase 3: Module Resolution (existing - Task 1.6)
    ↓
Phase 4: Expression/Statement Analysis (NEW - Task 1.7)
    ↓
Phase 5: Optimization Metadata Collection (NEW - Tasks 1.8-1.11)
    ↓
Phase 6: Optimization Database Construction (NEW - Task 1.12)
    ↓
Enhanced Semantic Result (symbol table + optimization metadata)
```

---

## TASK 1.7: Expression and Statement Analysis Implementation

### **Goal**
Implement comprehensive expression and statement validation with optimization metadata collection.

### **File Structure**
```
packages/semantic/src/analyzers/expression-analyzer.ts
packages/semantic/src/analyzers/__tests__/expression-analyzer.test.ts
```

### **Core Implementation Requirements**

#### **ExpressionAnalyzer Class**
```typescript
export class ExpressionAnalyzer {
  private symbolTable: SymbolTable;
  private typeChecker: TypeChecker;
  private errors: SemanticError[] = [];
  private optimizationMetadata: Map<Expression, ExpressionOptimizationData> = new Map();

  constructor(symbolTable: SymbolTable, typeChecker: TypeChecker) {
    this.symbolTable = symbolTable;
    this.typeChecker = typeChecker;
  }

  // Main analysis methods
  analyzeExpression(expr: Expression, context: AnalysisContext): ExpressionAnalysisResult;
  analyzeStatement(stmt: Statement, context: AnalysisContext): StatementAnalysisResult;
  analyzeBlock(statements: Statement[], context: AnalysisContext): BlockAnalysisResult;

  // Optimization metadata collection
  collectExpressionMetadata(expr: Expression): ExpressionOptimizationData;
  analyzeVariableReferences(expr: Expression): VariableReference[];
  identifyConstantExpressions(expr: Expression): ConstantExpressionInfo;
  detectSideEffects(expr: Expression): SideEffectAnalysis;
}
```

#### **Key Data Structures**
```typescript
interface ExpressionOptimizationData {
  isConstant: boolean;
  constantValue?: number | boolean | string;
  usedVariables: VariableReference[];
  hasSideEffects: boolean;
  registerPressure: RegisterPressureInfo;
  6502Hints: {
    preferredRegister?: 'A' | 'X' | 'Y';
    zeroPageAccess: boolean;
    addressingMode: AddressingModeHint;
  };
  complexityScore: number;
  loopInvariant: boolean;
}

interface VariableReference {
  symbol: VariableSymbol;
  accessType: 'read' | 'write' | 'modify';
  location: SourcePosition;
  context: ExpressionContext;
}

interface AnalysisContext {
  currentFunction?: FunctionSymbol;
  loopDepth: number;
  inHotPath: boolean;
  hardwareContext?: HardwareContext;
}
```

#### **Expression Validation Capabilities**

**Type Checking:**
- Binary expressions with operator compatibility
- Unary expressions with type validation
- Function calls with parameter matching
- Array access with bounds checking (where possible)
- Member access with struct validation
- Assignment compatibility checking

**Optimization Analysis:**
- Constant expression identification and evaluation
- Variable usage pattern tracking
- Side effect detection for pure function optimization
- Register allocation hint generation
- Addressing mode recommendation

### **Testing Requirements**
```typescript
describe('ExpressionAnalyzer', () => {
  // Expression type checking (30+ tests)
  describe('Type Validation', () => {
    it('should validate binary expression types');
    it('should detect type mismatches in assignments');
    it('should validate function call arguments');
    it('should check array bounds where possible');
  });

  // Optimization metadata collection (20+ tests)
  describe('Optimization Metadata', () => {
    it('should identify constant expressions');
    it('should track variable usage patterns');
    it('should detect side effects');
    it('should generate register allocation hints');
  });

  // Error reporting (15+ tests)
  describe('Error Reporting', () => {
    it('should provide helpful error messages');
    it('should suggest fixes for type mismatches');
    it('should report array bounds violations');
  });
});
```

### **Success Criteria**
- ✅ All expression types validated with proper error reporting
- ✅ Statement semantics validated (if, while, for, match, return)
- ✅ Optimization metadata collected for all expressions
- ✅ Variable usage tracking working
- ✅ Constant expression identification working
- ✅ 65+ comprehensive tests passing
- ✅ Integration with existing semantic analyzer

---

## TASK 1.8: Enhanced Variable Usage Analysis

### **Goal**
Enhance existing VariableAnalyzer with comprehensive usage tracking and optimization metadata collection.

### **File Enhancement**
```
packages/semantic/src/analyzers/variable-analyzer.ts (enhance existing)
packages/semantic/src/analyzers/__tests__/variable-analyzer.test.ts (expand existing)
```

### **Enhancement Requirements**

#### **Extended VariableSymbol Interface**
```typescript
interface OptimizedVariableSymbol extends VariableSymbol {
  optimizationMetadata: VariableOptimizationMetadata;
}

interface VariableOptimizationMetadata {
  // Usage frequency analysis
  accessCount: number;
  readCount: number;
  writeCount: number;
  modifyCount: number;

  // Access pattern analysis
  accessPattern: AccessPattern;
  loopUsage: LoopUsageInfo[];
  hotPathUsage: boolean;

  // Optimization candidates
  registerCandidate: boolean;
  zeroPageCandidate: boolean;
  constantPropagationCandidate: boolean;
  loopInvariantCandidate: boolean;

  // 6502-specific hints
  preferredStorageClass?: StorageClass;
  hardwareRegisterMapping?: HardwareRegisterInfo;
  lifetimeSpan: VariableLifetime;

  // Memory layout hints
  alignmentRequirement?: number;
  memoryBankPreference?: MemoryBank;
}

type AccessPattern = 'sequential' | 'random' | 'single' | 'structured';

interface LoopUsageInfo {
  loopId: string;
  usageType: 'invariant' | 'induction' | 'dependent';
  accessFrequency: number;
}

interface VariableLifetime {
  firstUse: SourcePosition;
  lastUse: SourcePosition;
  liveRanges: CodeRange[];
  interferenceSet: Set<string>; // Other variables with overlapping lifetimes
}
```

#### **Enhanced VariableAnalyzer Methods**
```typescript
class VariableAnalyzer {
  // Existing methods (maintain compatibility)
  analyzeVariableDeclaration(decl: VariableDeclaration): AnalysisResult;

  // NEW: Usage analysis methods
  analyzeVariableUsage(variable: VariableSymbol, usageContext: UsageContext): UsageAnalysis;
  collectUsagePatterns(variables: VariableSymbol[]): UsagePatternMap;
  identifyOptimizationCandidates(variables: VariableSymbol[]): OptimizationCandidate[];

  // NEW: 6502-specific analysis
  analyzeZeroPageCandidates(variables: VariableSymbol[]): ZeroPageCandidate[];
  analyzeRegisterCandidates(variables: VariableSymbol[]): RegisterCandidate[];
  analyzeHardwareMappingCandidates(variables: VariableSymbol[]): HardwareMappingCandidate[];

  // NEW: Lifetime analysis
  analyzeVariableLifetimes(program: Program, variables: VariableSymbol[]): LifetimeAnalysis;
  buildInterferenceGraph(lifetimes: LifetimeAnalysis): InterferenceGraph;
}
```

### **Analysis Algorithms**

#### **Zero Page Promotion Algorithm**
```typescript
function analyzeZeroPageCandidates(variables: VariableSymbol[]): ZeroPageCandidate[] {
  return variables
    .filter(v => v.varType.kind === 'primitive' ||
                (v.varType.kind === 'array' && v.varType.size <= 2))
    .map(v => ({
      variable: v,
      score: calculateZeroPageScore(v),
      benefit: estimateZeroPageBenefit(v)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_ZERO_PAGE_VARIABLES);
}

function calculateZeroPageScore(variable: VariableSymbol): number {
  let score = 0;

  // High access frequency = higher score
  score += variable.optimizationMetadata.accessCount * 10;

  // Loop usage = much higher score
  score += variable.optimizationMetadata.loopUsage.length * 50;

  // Hot path usage = higher score
  if (variable.optimizationMetadata.hotPathUsage) score += 100;

  // Smaller types get preference (fit in zero page)
  if (variable.varType.kind === 'primitive') score += 20;

  return score;
}
```

#### **Register Allocation Candidate Algorithm**
```typescript
function analyzeRegisterCandidates(variables: VariableSymbol[]): RegisterCandidate[] {
  return variables
    .filter(v => v.varType.kind === 'primitive')
    .filter(v => v.optimizationMetadata.lifetimeSpan.isShort())
    .map(v => ({
      variable: v,
      preferredRegister: determineOptimalRegister(v),
      lifetimeConflicts: analyzeRegisterConflicts(v),
      benefit: estimateRegisterBenefit(v)
    }));
}

function determineOptimalRegister(variable: VariableSymbol): 'A' | 'X' | 'Y' | 'memory' {
  const usage = variable.optimizationMetadata;

  // Accumulator for arithmetic operations
  if (usage.usedInArithmetic) return 'A';

  // X/Y for indexing operations
  if (usage.usedAsArrayIndex) return usage.indexingBias === 'X' ? 'X' : 'Y';

  // Memory if lifetime too long or high register pressure
  if (usage.lifetimeSpan.duration > REGISTER_LIFETIME_THRESHOLD) return 'memory';

  return 'A'; // Default to accumulator
}
```

### **Testing Framework**
```typescript
describe('Enhanced VariableAnalyzer', () => {
  describe('Usage Pattern Analysis', () => {
    it('should track variable access frequency');
    it('should identify access patterns (sequential/random/single)');
    it('should detect loop usage patterns');
    it('should identify hot path variables');
  });

  describe('Optimization Candidate Identification', () => {
    it('should identify zero page promotion candidates');
    it('should rank candidates by optimization benefit');
    it('should respect zero page size constraints');
    it('should identify register allocation candidates');
  });

  describe('Lifetime Analysis', () => {
    it('should calculate variable lifetimes accurately');
    it('should build interference graphs');
    it('should identify lifetime conflicts');
  });

  describe('6502-Specific Analysis', () => {
    it('should identify hardware register mapping opportunities');
    it('should analyze memory bank preferences');
    it('should respect 6502 addressing mode constraints');
  });
});
```

### **Integration Points**
- **With ExpressionAnalyzer**: Variable usage tracking during expression analysis
- **With SymbolTable**: Enhanced symbol metadata storage
- **With Type System**: Storage class optimization hints
- **With ModuleAnalyzer**: Cross-module variable usage patterns

---

## TASK 1.9: Enhanced Function Optimization Analysis

### **Goal**
Enhance existing FunctionAnalyzer with comprehensive optimization analysis for function inlining and performance optimization.

### **File Enhancement**
```
packages/semantic/src/analyzers/function-analyzer.ts (enhance existing)
packages/semantic/src/analyzers/__tests__/function-analyzer.test.ts (expand existing)
```

### **Enhancement Requirements**

#### **Extended FunctionSymbol Interface**
```typescript
interface OptimizedFunctionSymbol extends FunctionSymbol {
  optimizationMetadata: FunctionOptimizationMetadata;
}

interface FunctionOptimizationMetadata {
  // Inlining analysis
  inlineCandidate: boolean;
  inlineScore: number;
  bodyComplexity: ComplexityMetrics;
  callSiteCount: number;
  callSiteLocations: SourcePosition[];

  // Purity analysis
  isPure: boolean;
  sideEffects: SideEffectInfo[];
  globalVariableAccess: GlobalVariableAccess[];
  hardwareInteraction: HardwareInteractionInfo[];

  // Performance analysis
  performanceCritical: boolean;
  estimatedCycleCount: number;
  estimatedCodeSize: number;
  hotPathFunction: boolean;

  // Stack analysis
  stackUsage: StackUsageAnalysis;
  localVariableCount: number;
  parameterComplexity: ParameterComplexityInfo[];

  // 6502-specific analysis
  registerUsagePattern: RegisterUsagePattern;
  hardwareRegisterAccess: HardwareRegisterAccess[];
  interruptSafety: InterruptSafetyInfo;
}

interface ComplexityMetrics {
  cyclomaticComplexity: number;    // Control flow complexity
  statementCount: number;          // Physical lines of code
  expressionComplexity: number;    // Mathematical complexity
  loopNesting: number;            // Nested loop depth
  functionCallCount: number;       // Number of function calls
}

interface SideEffectInfo {
  type: 'global_variable' | 'hardware_register' | 'function_call' | 'memory_write';
  location: SourcePosition;
  target: string;
  impact: 'low' | 'medium' | 'high';
}
```

#### **Enhanced FunctionAnalyzer Methods**
```typescript
class FunctionAnalyzer {
  // Existing methods (maintain compatibility)
  analyzeFunctionDeclaration(decl: FunctionDeclaration): AnalysisResult;
  validateCallbackFunctions(functions: FunctionSymbol[]): ValidationResult;

  // NEW: Optimization analysis methods
  analyzeInliningCandidates(functions: FunctionSymbol[]): InliningCandidate[];
  analyzeFunctionComplexity(func: FunctionSymbol): ComplexityMetrics;
  detectPureFunctions(functions: FunctionSymbol[]): PureFunctionInfo[];
  analyzeCallSites(functions: FunctionSymbol[], expressions: Expression[]): CallSiteAnalysis;

  // NEW: Performance analysis
  estimatePerformanceImpact(func: FunctionSymbol): PerformanceEstimate;
  identifyHotPathFunctions(functions: FunctionSymbol[], cfg: ControlFlowGraph): HotPathFunction[];
  analyzeStackUsage(func: FunctionSymbol): StackUsageAnalysis;

  // NEW: 6502-specific analysis
  analyzeRegisterUsage(func: FunctionSymbol): RegisterUsagePattern;
  detectHardwareInteraction(func: FunctionSymbol): HardwareInteractionInfo[];
  analyzeInterruptSafety(func: FunctionSymbol): InterruptSafetyInfo;
}
```

### **Inlining Decision Algorithm**
```typescript
function calculateInliningScore(func: FunctionSymbol): InliningScore {
  let score = 0;
  const metadata = func.optimizationMetadata;

  // High call count = good inlining candidate
  score += Math.min(metadata.callSiteCount * 10, 100);

  // Small function size = good candidate
  score += Math.max(50 - metadata.bodyComplexity.statementCount * 5, 0);

  // Pure functions = better candidates
  if (metadata.isPure) score += 30;

  // Performance critical = higher priority
  if (metadata.performanceCritical) score += 40;

  // Penalize complex functions
  score -= metadata.bodyComplexity.cyclomaticComplexity * 10;

  // Penalize functions with hardware interaction
  if (metadata.hardwareInteraction.length > 0) score -= 20;

  return {
    score,
    recommendation: score > INLINING_THRESHOLD ? 'inline' : 'call',
    reasoning: generateInliningReasoning(metadata, score)
  };
}
```

### **Testing Framework**
```typescript
describe('Enhanced FunctionAnalyzer', () => {
  describe('Inlining Analysis', () => {
    it('should identify small, frequently called functions as inline candidates');
    it('should calculate function complexity metrics');
    it('should analyze call site frequency');
    it('should respect inlining size limits');
  });

  describe('Purity Analysis', () => {
    it('should detect pure functions (no side effects)');
    it('should identify global variable access');
    it('should detect hardware register interaction');
    it('should analyze function call side effects');
  });

  describe('Performance Analysis', () => {
    it('should estimate function execution cycles');
    it('should identify performance-critical functions');
    it('should analyze stack usage requirements');
  });

  describe('6502-Specific Analysis', () => {
    it('should analyze register usage patterns');
    it('should detect hardware register access');
    it('should analyze interrupt safety');
  });
});
```

---

## TASK 1.10: Control Flow Graph Construction

### **Goal**
Implement control flow graph construction for advanced optimization analysis.

### **File Structure**
```
packages/semantic/src/analyzers/control-flow-analyzer.ts
packages/semantic/src/analyzers/__tests__/control-flow-analyzer.test.ts
packages/semantic/src/control-flow/
packages/semantic/src/control-flow/basic-block.ts
packages/semantic/src/control-flow/cfg-builder.ts
packages/semantic/src/control-flow/loop-analysis.ts
packages/semantic/src/control-flow/dominance-analysis.ts
```

### **Core Implementation Requirements**

#### **ControlFlowAnalyzer Class**
```typescript
export class ControlFlowAnalyzer {
  private symbolTable: SymbolTable;
  private cfgCache: Map<string, ControlFlowGraph> = new Map();

  // Main CFG construction
  buildControlFlowGraph(program: Program): ControlFlowGraph;
  buildFunctionCFG(func: FunctionDeclaration): FunctionCFG;

  // Analysis methods
  analyzeLoops(cfg: ControlFlowGraph): LoopAnalysis[];
  analyzeDominance(cfg: ControlFlowGraph): DominanceInfo;
  identifyHotPaths(cfg: ControlFlowGraph): HotPathInfo[];
  detectUnreachableCode(cfg: ControlFlowGraph): UnreachableCodeInfo[];

  // Optimization opportunity detection
  identifyLoopInvariants(loops: LoopAnalysis[]): LoopInvariantInfo[];
  analyzeControlFlowOptimizations(cfg: ControlFlowGraph): ControlFlowOptimization[];
}
```

#### **Control Flow Data Structures**
```typescript
interface ControlFlowGraph {
  nodes: BasicBlock[];
  edges: CFGEdge[];
  entryBlock: BasicBlock;
  exitBlocks: BasicBlock[];

  // Analysis results
  loops: LoopInfo[];
  dominanceTree: DominanceTree;
  postDominanceTree: PostDominanceTree;
  hotPaths: HotPath[];

  // Optimization metadata
  optimizationOpportunities: CFGOptimization[];
}

interface BasicBlock {
  id: string;
  statements: Statement[];
  predecessors: BasicBlock[];
  successors: BasicBlock[];

  // Analysis metadata
  isLoopHeader: boolean;
  loopDepth: number;
  dominatedBy: BasicBlock[];
  hotPathMember: boolean;

  // 6502-specific metadata
  registerState: RegisterState;
  memoryPressure: MemoryPressureInfo;
  hardwareAccess: HardwareAccessInfo[];
}

interface LoopInfo {
  header: BasicBlock;
  body: BasicBlock[];
  backEdges: CFGEdge[];
  exitEdges: CFGEdge[];

  // Optimization analysis
  invariantExpressions: Expression[];
  inductionVariables: VariableSymbol[];
  unrollCandidate: boolean;
  unrollFactor?: number;
}
```

#### **CFG Construction Algorithm**
```typescript
class CFGBuilder {
  build(statements: Statement[]): ControlFlowGraph {
    const blocks: BasicBlock[] = [];
    let currentBlock = this.createBasicBlock();

    for (const stmt of statements) {
      switch (stmt.type) {
        case 'IfStatement':
          // Split at conditional
          this.finalizeBlock(currentBlock, blocks);
          const condBlock = this.createConditionalBlock(stmt);
          const thenBlock = this.build(stmt.thenBody);
          const elseBlock = stmt.elseBody ? this.build(stmt.elseBody) : null;
          // Connect blocks...
          break;

        case 'WhileStatement':
          // Create loop structure
          this.finalizeBlock(currentBlock, blocks);
          const loopHeader = this.createLoopHeader(stmt);
          const loopBody = this.build(stmt.body);
          // Create back edge...
          break;

        case 'BreakStatement':
        case 'ContinueStatement':
        case 'ReturnStatement':
          // Terminal statements
          currentBlock.statements.push(stmt);
          this.finalizeBlock(currentBlock, blocks);
          currentBlock = this.createBasicBlock();
          break;

        default:
          // Regular statement
          currentBlock.statements.push(stmt);
      }
    }

    return this.connectBlocks(blocks);
  }
}
```

### **Testing Framework**
```typescript
describe('ControlFlowAnalyzer', () => {
  describe('CFG Construction', () => {
    it('should build basic blocks correctly');
    it('should connect control flow edges properly');
    it('should handle nested control structures');
    it('should identify loop structures');
  });

  describe('Loop Analysis', () => {
    it('should detect loop headers and bodies');
    it('should identify loop invariant expressions');
    it('should find induction variables');
    it('should analyze loop unrolling opportunities');
  });

  describe('Optimization Analysis', () => {
    it('should identify hot paths in control flow');
    it('should detect unreachable code');
    it('should find optimization opportunities');
  });
});
```

---

## TASK 1.11: Hardware Usage Pattern Analysis

### **Goal**
Implement 6502-specific hardware usage pattern analysis for targeted optimizations.

### **File Structure**
```
packages/semantic/src/analyzers/hardware-analyzer.ts
packages/semantic/src/analyzers/__tests__/hardware-analyzer.test.ts
packages/semantic/src/hardware/
packages/semantic/src/hardware/vic-analyzer.ts
packages/semantic/src/hardware/sid-analyzer.ts
packages/semantic/src/hardware/cia-analyzer.ts
```

### **Core Implementation Requirements**

#### **HardwareAnalyzer Class**
```typescript
export class HardwareAnalyzer {
  private symbolTable: SymbolTable;
  private hardwareUsageMap: Map<string, HardwareUsageInfo> = new Map();

  // Main analysis methods
  analyzeHardwareUsage(programs: Program[]): HardwareUsageAnalysis;
  analyzeVICUsage(functions: FunctionSymbol[]): VICUsagePattern[];
  analyzeSIDUsage(functions: FunctionSymbol[]): SIDUsagePattern[];
  analyzeCIAUsage(functions: FunctionSymbol[]): CIAUsagePattern[];

  // Optimization opportunity detection
  identifyRegisterBatchingOpportunities(usage: HardwareUsageInfo[]): BatchingOpportunity[];
  analyzeTimingCriticalSections(usage: HardwareUsageInfo[]): TimingCriticalInfo[];
  detectHardwareConflicts(usage: HardwareUsageInfo[]): HardwareConflictInfo[];
}
```

#### **Hardware Usage Data Structures**
```typescript
interface HardwareUsageAnalysis {
  vicUsage: VICUsageDatabase;
  sidUsage: SIDUsageDatabase;
  ciaUsage: CIAUsageDatabase;
  memoryMappedIO: IOUsageDatabase;

  // Optimization opportunities
  batchingOpportunities: BatchingOpportunity[];
  timingOptimizations: TimingOptimization[];
  registerOptimizations: HardwareRegisterOptimization[];
}

interface VICUsagePattern {
  registerAccess: VICRegisterAccess[];
  spriteManipulation: SpriteUsageInfo[];
  colorRAMAccess: ColorRAMUsageInfo[];
  screenModeChanges: ScreenModeInfo[];

  // Optimization hints
  batchingOpportunity: boolean;
  timingCritical: boolean;
  rasterSyncRequired: boolean;
}

interface SIDUsagePattern {
  voiceUsage: SIDVoiceUsage[];
  filterUsage: SIDFilterUsage[];
  oscillatorReading: OscillatorUsage[];

  // Optimization hints
  voiceSequencing: VoiceSequencingOptimization;
  filterOptimization: FilterOptimizationHint;
  timingRequirements: SIDTimingInfo;
}

interface CIAUsagePattern {
  timerUsage: CIATimerUsage[];
  portUsage: CIAPortUsage[];
  interruptUsage: CIAInterruptUsage[];

  // Optimization hints
  timerOptimization: TimerOptimizationHint;
  atomicOperations: AtomicOperationInfo[];
}
```

#### **Hardware Optimization Detection Algorithms**
```typescript
class VICOptimizationAnalyzer {
  identifySpriteBatchingOpportunities(spriteAccess: SpriteUsageInfo[]): BatchingOpportunity[] {
    // Group sprite register writes that can be batched
    const batchableSequences = this.findConsecutiveAccess(spriteAccess);

    return batchableSequences.map(sequence => ({
      type: 'sprite_register_batching',
      registers: sequence.registers,
      estimatedSavings: this.calculateBatchingSavings(sequence),
      implementation: this.generateBatchingCode(sequence)
    }));
  }

  analyzeColorRAMOptimization(colorAccess: ColorRAMUsageInfo[]): ColorRAMOptimization[] {
    // Color RAM has special timing characteristics
    return colorAccess.map(access => ({
      type: 'color_ram_optimization',
      accessPattern: access.pattern,
      timingRequirement: this.analyzeColorRAMTiming(access),
      optimizationHint: this.generateColorRAMHint(access)
    }));
  }
}

class SIDOptimizationAnalyzer {
  analyzeVoiceSequencing(voiceUsage: SIDVoiceUsage[]): VoiceOptimization[] {
    // Optimize SID voice register programming order
    return voiceUsage.map(usage => ({
      voice: usage.voiceNumber,
      registerSequence: this.optimizeRegisterSequence(usage.registers),
      timingConstraints: this.analyzeVoiceTiming(usage),
      glitchPrevention: this.generateGlitchPrevention(usage)
    }));
  }
}
```

### **Testing Framework**
```typescript
describe('HardwareAnalyzer', () => {
  describe('VIC-II Analysis', () => {
    it('should detect sprite register access patterns');
    it('should identify register batching opportunities');
    it('should analyze raster timing requirements');
    it('should detect color RAM usage patterns');
  });

  describe('SID Analysis', () => {
    it('should analyze voice usage patterns');
    it('should detect filter usage');
    it('should identify timing-critical sequences');
    it('should optimize voice register sequencing');
  });

  describe('CIA Analysis', () => {
    it('should analyze timer usage patterns');
    it('should detect interrupt usage');
    it('should identify atomic operation requirements');
  });

  describe('Optimization Detection', () => {
    it('should identify hardware register batching opportunities');
    it('should detect timing-critical sections');
    it('should suggest hardware-specific optimizations');
  });
});
```

---

## TASK 1.12: Optimization Metadata Integration

### **Goal**
Create unified optimization metadata collection and integration system.

### **File Structure**
```
packages/semantic/src/optimization/
packages/semantic/src/optimization/metadata-collector.ts
packages/semantic/src/optimization/optimization-database.ts
packages/semantic/src/optimization/optimization-reporter.ts
packages/semantic/src/optimization/__tests__/
```

### **Core Implementation Requirements**

#### **OptimizationMetadataCollector Class**
```typescript
export class OptimizationMetadataCollector {
  private symbolTable: SymbolTable;
  private analysisResults: Map<string, AnalysisResult> = new Map();

  // Main collection method
  collectAllMetadata(
    programs: Program[],
    symbolTable: SymbolTable,
    expressionResults: ExpressionAnalysisResult[],
    variableResults: VariableUsageAnalysis[],
    functionResults: FunctionOptimizationAnalysis[],
    controlFlowGraphs: ControlFlowGraph[],
    hardwareUsage: HardwareUsageAnalysis[]
  ): OptimizationDatabase;

  // Metadata aggregation
  aggregateVariableMetadata(variables: VariableSymbol[]): VariableOptimizationSummary;
  aggregateFunctionMetadata(functions: FunctionSymbol[]): FunctionOptimizationSummary;
  aggregateHardwareMetadata(hardware: HardwareUsageAnalysis[]): HardwareOptimizationSummary;

  // Export for IL phase
  exportForILPhase(database: OptimizationDatabase): ILOptimizationHints;
  generateOptimizationReport(database: OptimizationDatabase): OptimizationReport;
}
```

#### **Unified Optimization Database**
```typescript
interface OptimizationDatabase {
  // Core symbol metadata
  variables: Map<string, VariableOptimizationMetadata>;
  functions: Map<string, FunctionOptimizationMetadata>;
  modules: Map<string, ModuleOptimizationMetadata>;

  // Analysis results
  expressions: Map<string, ExpressionOptimizationData>;
  controlFlowGraphs: Map<string, ControlFlowGraph>;
  hardwareUsage: HardwareUsageAnalysis;

  // Optimization opportunities
  optimizationOpportunities: OptimizationOpportunity[];
  optimizationRecommendations: OptimizationRecommendation[];

  // Performance estimates
  performanceProjections: PerformanceProjection[];
  memoryLayoutRecommendations: MemoryLayoutRecommendation[];

  // Quality metrics
  analysisQuality: AnalysisQualityMetrics;
  completeness: CompletenessMetrics;
}

interface OptimizationOpportunity {
  type: OptimizationType;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedBenefit: OptimizationBenefit;
  implementationComplexity: 'trivial' | 'easy' | 'moderate' | 'complex';
  location: SourcePosition;
  description: string;
  recommendation: string;
}

type OptimizationType =
  | 'zero_page_promotion'
  | 'register_allocation'
  | 'function_inlining'
  | 'constant_folding'
  | 'dead_code_elimination'
  | 'loop_optimization'
  | 'hardware_batching'
  | 'addressing_mode_optimization';

interface OptimizationBenefit {
  cycleReduction: number;
  sizeReduction: number;
  qualityImprovement: QualityMetric[];
}
```

#### **Integration with Enhanced SemanticAnalyzer**
```typescript
// Enhanced SemanticAnalyzer.analyze() method
analyze(programs: Program[]): EnhancedSemanticResult<SymbolTable> {
  this.reset();

  try {
    // Phase 1: Register all modules (existing)
    this.registerAllModules(programs);

    // Phase 2: Process declarations (existing)
    this.processAllDeclarations(programs);

    // Phase 3: Module resolution (existing - Task 1.6)
    this.resolveModuleDependencies(programs);

    // Phase 4: Expression/Statement analysis (NEW - Task 1.7)
    const expressionResults = this.analyzeExpressionsAndStatements(programs);

    // Phase 5: Optimization metadata collection (NEW - Tasks 1.8-1.11)
    const optimizationMetadata = this.collectOptimizationMetadata(programs, expressionResults);

    // Phase 6: Integration and reporting (NEW - Task 1.12)
    const optimizationDatabase = this.buildOptimizationDatabase(optimizationMetadata);

    return {
      success: true,
      data: this.symbolTable,
      optimizationDatabase,
      warnings: this.warnings.length > 0 ? this.warnings : undefined
    };

  } catch (error) {
    // Error handling...
  }
}
```

### **Testing Framework**
```typescript
describe('OptimizationMetadataCollector', () => {
  describe('Metadata Collection', () => {
    it('should collect all variable optimization metadata');
    it('should collect all function optimization metadata');
    it('should integrate control flow analysis results');
    it('should aggregate hardware usage patterns');
  });

  describe('Database Construction', () => {
    it('should build comprehensive optimization database');
    it('should identify optimization opportunities');
    it('should prioritize optimizations by benefit');
    it('should generate optimization recommendations');
  });

  describe('IL Phase Integration', () => {
    it('should export optimization hints for IL phase');
    it('should provide performance projections');
    it('should recommend memory layout optimizations');
  });
});
```

---

## Implementation Timeline and Dependencies

### **Phase 1: Foundation (Week 1)**
**Task 1.7: Expression/Statement Analysis**
- **Days 1-3**: Core expression validation implementation
- **Days 4-5**: Optimization metadata collection
- **Days 6-7**: Comprehensive testing and integration
- **Dependencies**: Existing symbol table and type system
- **Deliverable**: 65+ tests passing, expression validation complete

### **Phase 2: Enhanced Analysis (Week 2)**
**Task 1.8: Enhanced Variable Analysis**
- **Days 1-2**: Variable usage tracking implementation
- **Days 3-4**: Zero page and register candidate analysis
- **Days 5**: Lifetime analysis and interference graphs
- **Dependencies**: Task 1.7 (Expression Analyzer)
- **Deliverable**: Enhanced variable analysis with optimization metadata

**Task 1.9: Enhanced Function Analysis**
- **Days 6-7**: Function complexity and inlining analysis
- **Days 8**: Purity analysis and side effect detection
- **Dependencies**: Task 1.7 (Expression Analyzer)
- **Deliverable**: Function optimization metadata collection

### **Phase 3: Advanced Analysis (Week 3)**
**Task 1.10: Control Flow Graph Construction**
- **Days 1-3**: CFG construction algorithms
- **Days 4-5**: Loop and dominance analysis
- **Days 6**: Hot path and optimization opportunity detection
- **Dependencies**: Tasks 1.7, 1.8, 1.9
- **Deliverable**: Complete CFG infrastructure

**Task 1.11: Hardware Usage Analysis**
- **Days 7**: Hardware pattern detection
- **Days 8**: 6502-specific optimization analysis
- **Dependencies**: All previous tasks
- **Deliverable**: Hardware optimization metadata

### **Phase 4: Integration and Testing (Week 4)**
**Task 1.12: Optimization Metadata Integration**
- **Days 1-2**: Unified metadata collection system
- **Days 3-4**: Optimization database construction
- **Days 5-7**: Comprehensive integration testing and validation
- **Dependencies**: All previous tasks (1.7-1.11)
- **Deliverable**: Complete optimization-ready semantic analysis

---

## Quality Assurance Framework

### **Test Coverage Targets**
- **Task 1.7**: 65+ tests (expression validation + optimization metadata)
- **Task 1.8**: 40+ new tests (enhanced variable analysis)
- **Task 1.9**: 35+ new tests (enhanced function analysis)
- **Task 1.10**: 50+ tests (control flow graph construction)
- **Task 1.11**: 30+ tests (hardware analysis)
- **Task 1.12**: 25+ tests (integration and database)
- **Total New Tests**: 245+ tests
- **Grand Total**: 520+ tests project-wide

### **Integration Testing Requirements**
```typescript
describe('Enhanced Semantic Analysis Integration', () => {
  describe('End-to-End Analysis', () => {
    it('should analyze complete Blend65 programs with optimization metadata');
    it('should maintain backward compatibility with existing tests');
    it('should integrate all analyzer results correctly');
    it('should export complete optimization database');
  });

  describe('Performance Validation', () => {
    it('should complete analysis within acceptable time limits');
    it('should handle large programs efficiently');
    it('should provide accurate optimization recommendations');
  });

  describe('Real-World Program Testing', () => {
    it('should analyze Snake game example with optimization metadata');
    it('should analyze Pyout game example with hardware optimizations');
    it('should handle callback-heavy programs correctly');
  });
});
```

### **Regression Testing Strategy**
- **Existing 279 tests must continue passing**
- **All existing APIs must remain compatible**
- **Performance regressions not acceptable**
- **Memory usage must remain reasonable**

---

## Expected Deliverables

### **Enhanced Semantic Analysis Output**
```typescript
interface EnhancedSemanticResult<T> extends SemanticResult<T> {
  // Existing
  data: T; // SymbolTable
  errors?: SemanticError[];
  warnings?: SemanticError[];

  // NEW: Optimization metadata
  optimizationDatabase?: OptimizationDatabase;
  performanceProjections?: PerformanceProjection[];
  optimizationRecommendations?: OptimizationRecommendation[];

  // NEW: Analysis quality metrics
  analysisMetrics?: {
    completeness: number; // 0-100% completeness score
    confidence: number;   // Analysis confidence level
    optimizationPotential: number; // Estimated optimization benefit
  };
}
```

### **IL Phase Integration**
```typescript
// Export interface for IL phase consumption
interface ILOptimizationHints {
  variableHints: Map<string, VariableOptimizationHint>;
  functionHints: Map<string, FunctionOptimizationHint>;
  controlFlowHints: ControlFlowOptimizationHint[];
  hardwareHints: HardwareOptimizationHint[];

  // 6502-specific recommendations
  zeroPageCandidates: ZeroPageCandidate[];
  registerAllocationHints: RegisterAllocationHint[];
  inliningCandidates: InliningCandidate[];
  optimizationOpportunities: OptimizationOpportunity[];
}
```

---

## Risk Mitigation Strategy

### **Technical Risks**
- **Complexity Management**: Implement incrementally, test each component
- **Performance Impact**: Monitor analysis time, optimize hot paths
- **Integration Complexity**: Maintain clean interfaces between analyzers
- **Backward Compatibility**: Extensive regression testing

### **Quality Risks**
- **Test Coverage**: Require 90%+ coverage for all new components
- **API Stability**: Version all interfaces, maintain compatibility
- **Documentation**: Comprehensive API documentation and examples
- **Code Review**: Thorough review of all optimization algorithms

### **Implementation Risks**
- **Scope Creep**: Follow task specifications precisely
- **Dependencies**: Clear dependency management between tasks
- **Timeline Management**: Regular checkpoints and progress validation
- **Resource Requirements**: Monitor memory usage and performance

---

## Success Criteria for Complete Plan

### **Phase 1 Completion Criteria**
- ✅ **All 6 tasks (1.7-1.12) implemented and tested**
- ✅ **520+ total tests passing across entire project**
- ✅ **Complete optimization metadata collection working**
- ✅ **Enhanced semantic analysis ready for IL phase**
- ✅ **Zero performance regression in existing functionality**

### **Optimization Readiness Criteria**
- ✅ **Variable usage patterns collected and analyzed**
- ✅ **Function inlining candidates identified**
- ✅ **Control flow graphs constructed for all programs**
- ✅ **Hardware usage patterns detected and categorized**
- ✅ **Optimization database exported for IL phase consumption**

### **Quality Criteria**
- ✅ **TypeScript compilation with zero errors**
- ✅ **Comprehensive test coverage (>90% for new components)**
- ✅ **Clean integration with existing architecture**
- ✅ **Documentation complete for all new APIs**
- ✅ **Performance benchmarks within acceptable limits**

---

## Next Steps After Plan Completion

### **Immediate (Post-Completion)**
1. **Validate against real Blend65 programs** (Snake, Pyout examples)
2. **Performance benchmark** the enhanced semantic analysis
3. **Generate optimization reports** for example programs
4. **Document optimization opportunities** found in real code

### **Phase 2 Preparation**
1. **Review IL system requirements** with optimization context
2. **Design IL optimization passes** using collected metadata
3. **Plan peephole optimization integration**
4. **Prepare backend Task 2.1** with optimization foundations

### **Long-term Integration**
1. **Monitor optimization effectiveness** in compiled output
2. **Refine optimization algorithms** based on real-world results
3. **Expand hardware analysis** for additional 6502 platforms
4. **Implement machine learning** optimization pattern discovery

---

**Status:** Implementation plan complete and ready for systematic execution
**Next Action:** Begin Task 1.7 (Expression and Statement Analysis) implementation
**Total Estimated Timeline:** 4 weeks for complete enhancement implementation
**Expected Outcome:** Optimization-ready semantic analysis infrastructure for effective peephole optimization
