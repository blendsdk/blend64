/**
 * Semantic Analysis Infrastructure - Core Types and Interfaces
 * Task 1.1: Create Semantic Analysis Infrastructure
 *
 * This file defines the foundational types for the Blend65 semantic analyzer:
 * - Symbol system for tracking variables, functions, modules, types, enums
 * - Type system with Blend65's unique storage classes
 * - Scope hierarchy for lexical scoping
 * - Error reporting with rich source location information
 * - Type compatibility checking utilities
 *
 * Educational Focus:
 * - How compilers represent program symbols internally
 * - Type system design for 6502 development
 * - Lexical scoping and symbol resolution
 * - Compiler error reporting best practices
 */

import { SourcePosition } from '@blend65/lexer';
import type { Expression, TypeAnnotation } from '@blend65/ast';

// ============================================================================
// PHASE 1: CORE SYMBOL SYSTEM
// ============================================================================

/**
 * Base interface for all symbols in the Blend65 symbol table.
 * Every symbol (variable, function, type, etc.) implements this interface.
 *
 * Educational Note:
 * - Symbols are the compiler's internal representation of named entities
 * - Source location tracking enables precise error reporting
 * - Scope tracking enables proper variable resolution
 */
export interface Symbol {
  /** The name of the symbol (e.g., "playerX", "updatePlayer") */
  name: string;

  /** What kind of symbol this is (variable, function, etc.) */
  symbolType: SymbolType;

  /** Where this symbol was defined in the source code */
  sourceLocation: SourcePosition;

  /** Which scope owns this symbol */
  scope: Scope;

  /** Whether this symbol is exported from its module */
  isExported: boolean;
}

/**
 * Discriminator for different symbol types.
 * Used for TypeScript discriminated unions and type checking.
 */
export type SymbolType = 'Variable' | 'Function' | 'Module' | 'Type' | 'Enum';

/**
 * Variable symbol - represents Blend65 variable declarations.
 *
 * Examples:
 * - var counter: byte = 0
 * - zp var playerX: byte
 * - data var palette: byte[16] = [...]
 *
 * Educational Note:
 * - Storage classes are unique to Blend65 for 6502 memory management
 * - Initial values must be compile-time constants for 'data' and 'const'
 * - Task 1.8: Enhanced with optimization metadata for 6502 code generation
 */
export interface VariableSymbol extends Symbol {
  symbolType: 'Variable';

  /** The type of the variable (byte, word, boolean, array, etc.) */
  varType: Blend65Type;

  /** Storage class for memory allocation (zp, ram, data, const, io) */
  storageClass: StorageClass | null;

  /** Initial value expression (if provided) */
  initialValue: Expression | null;

  /** Whether this is a local variable (function parameter or local declaration) */
  isLocal: boolean;

  /** Task 1.8: Optimization metadata for 6502 code generation */
  optimizationMetadata?: VariableOptimizationMetadata;
}

/**
 * Function symbol - represents Blend65 function declarations.
 *
 * Examples:
 * - function add(a: byte, b: byte): byte
 * - callback function onInterrupt(): void
 *
 * Educational Note:
 * - Callback functions can be assigned to callback variables
 * - Parameter types enable function call validation
 */
export interface FunctionSymbol extends Symbol {
  symbolType: 'Function';

  /** Function parameters with names and types */
  parameters: ParameterInfo[];

  /** Return type (void for no return) */
  returnType: Blend65Type;

  /** Whether this is a callback function */
  isCallback: boolean;
}

/**
 * Module symbol - represents Blend65 module declarations.
 *
 * Examples:
 * - module Game.Main
 * - module c64.sprites
 *
 * Educational Note:
 * - Modules organize code and provide namespace isolation
 * - Qualified names enable hierarchical organization
 */
export interface ModuleSymbol extends Symbol {
  symbolType: 'Module';

  /** Qualified module name parts (e.g., ["Game", "Main"]) */
  qualifiedName: string[];

  /** Symbols exported by this module */
  exports: Map<string, Symbol>;

  /** Modules imported by this module */
  imports: Map<string, ImportInfo>;
}

/**
 * Type symbol - represents Blend65 type declarations.
 *
 * Examples:
 * - type Player extends HasPos ... end type
 * - type Color ... end type
 *
 * Educational Note:
 * - User-defined types for structured data
 * - Inheritance through 'extends' keyword
 */
export interface TypeSymbol extends Symbol {
  symbolType: 'Type';

  /** The actual type definition */
  typeDefinition: Blend65Type;

  /** Base types this type extends */
  extends: Blend65Type[];

  /** Fields in this type */
  fields: TypeFieldInfo[];
}

/**
 * Enum symbol - represents Blend65 enum declarations.
 *
 * Examples:
 * - enum GameState MENU = 1, PLAYING, PAUSED end enum
 * - enum Color RED = 2, GREEN, BLUE = 8 end enum
 *
 * Educational Note:
 * - Enums provide named constants with auto-increment
 * - Useful for state machines and configuration
 */
export interface EnumSymbol extends Symbol {
  symbolType: 'Enum';

  /** Enum members with names and values */
  members: Map<string, EnumMemberInfo>;

  /** The underlying type (usually byte) */
  underlyingType: Blend65Type;
}

// ============================================================================
// PHASE 2: BLEND65 TYPE SYSTEM
// ============================================================================

/**
 * Union type for all types in the Blend65 type system.
 *
 * Educational Note:
 * - Type systems enable compile-time error detection
 * - Different type kinds require different validation rules
 */
export type Blend65Type =
  | PrimitiveType
  | ArrayType
  | NamedType
  | CallbackType;

/**
 * Primitive types built into Blend65.
 *
 * Educational Note:
 * - byte: 8-bit value (0-255), most common 6502 type
 * - word: 16-bit value (0-65535), for addresses and larger values
 * - boolean: true/false, stored as byte
 * - void: no value, only valid for function returns
 * - callback: function pointer type
 */
export interface PrimitiveType {
  kind: 'primitive';
  name: 'byte' | 'word' | 'boolean' | 'void' | 'callback';
}

/**
 * Array type with compile-time size.
 *
 * Examples:
 * - byte[256] (256-byte array)
 * - word[100] (100-word array)
 *
 * Educational Note:
 * - Array sizes must be compile-time constants for 6502
 * - No dynamic arrays in v0.1 (planned for future versions)
 */
export interface ArrayType {
  kind: 'array';
  elementType: Blend65Type;
  size: number; // Must be compile-time constant
}

/**
 * Named type reference (user-defined types).
 *
 * Examples:
 * - Player (references a type declaration)
 * - Color (references an enum)
 *
 * Educational Note:
 * - References are resolved during semantic analysis
 * - Enables forward declarations and recursive types
 */
export interface NamedType {
  kind: 'named';
  name: string;
  resolvedType?: Blend65Type; // Filled in during analysis
}

/**
 * Callback type for function pointers.
 *
 * Examples:
 * - callback: void (no parameters, no return)
 * - callback(byte, byte): word (two byte params, word return)
 *
 * Educational Note:
 * - Enables function pointers and interrupt handlers
 * - Type-safe function assignments
 */
export interface CallbackType {
  kind: 'callback';
  parameterTypes: Blend65Type[];
  returnType: Blend65Type;
}

/**
 * Storage classes for Blend65 variables.
 * Each class maps to different 6502 memory regions.
 *
 * Educational Note:
 * - zp: Zero page ($00-$FF), fastest access, limited space
 * - ram: General RAM, normal access speed
 * - data: Pre-initialized data, compile-time constants
 * - const: Read-only constants, often in ROM
 * - io: Memory-mapped I/O, hardware registers
 */
export type StorageClass = 'zp' | 'ram' | 'data' | 'const' | 'io';

// ============================================================================
// PHASE 3: SCOPE HIERARCHY SYSTEM
// ============================================================================

/**
 * Represents a lexical scope in the Blend65 program.
 * Scopes form a tree structure with nested visibility rules.
 *
 * Educational Note:
 * - Lexical scoping: inner scopes can access outer scope symbols
 * - Symbol resolution walks up the scope chain
 * - Each scope type has different rules
 */
export interface Scope {
  /** What kind of scope this is */
  scopeType: ScopeType;

  /** Parent scope (null for global scope) */
  parent: Scope | null;

  /** Symbols defined directly in this scope */
  symbols: Map<string, Symbol>;

  /** Child scopes contained within this scope */
  children: Scope[];

  /** Optional name for debugging (function name, module name, etc.) */
  name?: string;
}

/**
 * Different types of scopes in Blend65.
 *
 * Educational Note:
 * - Global: Top-level scope, contains all modules
 * - Module: Module scope, contains module's declarations
 * - Function: Function scope, contains parameters and local variables
 * - Block: Block scope, contains local variables within blocks
 */
export type ScopeType = 'Global' | 'Module' | 'Function' | 'Block';

// ============================================================================
// PHASE 4: ERROR REPORTING SYSTEM
// ============================================================================

/**
 * Represents a semantic error found during analysis.
 *
 * Educational Note:
 * - Rich error information helps developers fix problems quickly
 * - Source location enables IDE integration and precise error highlighting
 * - Suggestions provide actionable guidance
 */
export interface SemanticError {
  /** What category of error this is */
  errorType: SemanticErrorType;

  /** Human-readable error message */
  message: string;

  /** Where the error occurred in the source code */
  location: SourcePosition;

  /** Optional suggestions for fixing the error */
  suggestions?: string[];

  /** Related errors (for complex multi-part errors) */
  relatedErrors?: SemanticError[];
}

/**
 * Categories of semantic errors.
 *
 * Educational Note:
 * - Different error types enable different error recovery strategies
 * - IDE tooling can provide different icons/colors per error type
 * - Error categories help with compiler debugging
 */
export type SemanticErrorType =
  | 'UndefinedSymbol'      // Using a symbol that doesn't exist
  | 'DuplicateSymbol'      // Defining a symbol that already exists
  | 'DuplicateIdentifier'  // Identifier conflicts with existing symbol
  | 'TypeMismatch'         // Type incompatibility (e.g., assigning string to byte)
  | 'InvalidStorageClass'  // Invalid storage class usage
  | 'ImportNotFound'       // Imported symbol doesn't exist
  | 'ExportNotFound'       // Exported symbol doesn't exist
  | 'ModuleNotFound'       // Module doesn't exist
  | 'InvalidScope'         // Symbol used in wrong scope
  | 'ConstantRequired'     // Compile-time constant required
  | 'CallbackMismatch'     // Callback function signature mismatch
  | 'ArrayBounds'          // Array access out of bounds
  | 'InvalidOperation'     // Invalid operation for type
  | 'CircularDependency';  // Circular module dependencies

/**
 * Result type for operations that can fail with semantic errors.
 *
 * Educational Note:
 * - Result types make error handling explicit and type-safe
 * - Prevents accidentally ignoring errors
 * - Enables compiler phases to continue after non-fatal errors
 */
export type SemanticResult<T> = {
  success: true;
  data: T;
  warnings?: SemanticError[];
} | {
  success: false;
  errors: SemanticError[];
  warnings?: SemanticError[];
};

// ============================================================================
// TASK 1.8: VARIABLE OPTIMIZATION METADATA
// ============================================================================

/**
 * Comprehensive optimization metadata for variables.
 * Collects all information needed for zero page promotion, register allocation,
 * and 6502-specific memory layout optimization.
 *
 * Educational Note:
 * - Zero page promotion: Move frequently accessed variables to fast zero page memory
 * - Register allocation: Assign short-lived variables to A/X/Y registers
 * - Lifetime analysis: Determine when variables are live for interference detection
 * - Usage patterns: Optimize based on access frequency and loop usage
 */
export interface VariableOptimizationMetadata {
  /** Usage pattern analysis */
  usageStatistics: VariableUsageStatistics;

  /** Zero page promotion analysis */
  zeroPageCandidate: ZeroPageCandidateInfo;

  /** Register allocation analysis */
  registerCandidate: RegisterCandidateInfo;

  /** Variable lifetime analysis */
  lifetimeInfo: VariableLifetimeInfo;

  /** 6502-specific optimization hints */
  sixtyTwoHints: Variable6502OptimizationHints;

  /** Memory layout preferences */
  memoryLayout: VariableMemoryLayoutInfo;
}

/**
 * Usage pattern statistics for a variable.
 */
export interface VariableUsageStatistics {
  /** Total number of times this variable is accessed */
  accessCount: number;

  /** Number of read accesses */
  readCount: number;

  /** Number of write accesses */
  writeCount: number;

  /** Number of read-modify-write accesses (++, +=, etc.) */
  modifyCount: number;

  /** Loop nesting levels where this variable is used */
  loopUsage: LoopUsageInfo[];

  /** Hot path usage (frequently executed code) */
  hotPathUsage: number;

  /** Average access frequency estimate */
  estimatedAccessFrequency: AccessFrequency;

  /** Access pattern type */
  accessPattern: VariableAccessPattern;
}

/**
 * Information about variable usage within loops.
 */
export interface LoopUsageInfo {
  /** Nesting level of the loop (1 = outermost, 2 = nested, etc.) */
  loopLevel: number;

  /** Number of accesses within this loop level */
  accessesInLoop: number;

  /** Whether the variable is loop-invariant at this level */
  isLoopInvariant: boolean;

  /** Whether this might be an induction variable */
  isInductionVariable: boolean;

  /** Estimated loop iteration count */
  estimatedIterations: number;
}

/**
 * Access frequency classification.
 */
export type AccessFrequency = 'rare' | 'normal' | 'frequent' | 'very_frequent' | 'hot';

/**
 * Variable access pattern classification.
 */
export type VariableAccessPattern =
  | 'single_use'          // Used only once
  | 'multiple_read'       // Read multiple times
  | 'read_write'          // Both read and written
  | 'loop_dependent'      // Access depends on loop variables
  | 'sequential_array'    // Sequential array access pattern
  | 'random_array'        // Random array access pattern
  | 'hot_path'            // Frequently accessed in hot paths
  | 'induction_variable'  // Loop induction variable
  | 'accumulator';        // Accumulator pattern (frequent read-modify-write)

/**
 * Zero page promotion candidate information.
 */
export interface ZeroPageCandidateInfo {
  /** Whether this variable is a good zero page candidate */
  isCandidate: boolean;

  /** Zero page promotion priority score (0-100, higher is better) */
  promotionScore: number;

  /** Estimated benefit of zero page promotion (cycle savings) */
  estimatedBenefit: number;

  /** Size requirement in zero page (bytes) */
  sizeRequirement: number;

  /** Factors contributing to promotion decision */
  promotionFactors: ZeroPagePromotionFactor[];

  /** Factors against promotion */
  antiPromotionFactors: ZeroPageAntiPromotionFactor[];

  /** Final recommendation */
  recommendation: ZeroPageRecommendation;
}

/**
 * Factors that favor zero page promotion.
 */
export interface ZeroPagePromotionFactor {
  factor: ZeroPagePromotionFactorType;
  weight: number;
  description: string;
}

export type ZeroPagePromotionFactorType =
  | 'high_access_frequency'    // Variable accessed very frequently
  | 'loop_usage'              // Variable used inside loops
  | 'hot_path_usage'          // Variable used in hot execution paths
  | 'small_size'              // Variable fits easily in zero page
  | 'arithmetic_operations'   // Variable used in arithmetic (A register operations)
  | 'index_operations'        // Variable used for array indexing
  | 'no_storage_class'        // Variable has no explicit storage class
  | 'short_lifetime';         // Variable has short lifetime

/**
 * Factors that discourage zero page promotion.
 */
export interface ZeroPageAntiPromotionFactor {
  factor: ZeroPageAntiPromotionFactorType;
  weight: number;
  description: string;
}

export type ZeroPageAntiPromotionFactorType =
  | 'already_zp'              // Variable already has 'zp' storage class
  | 'large_size'              // Variable is too large for efficient zero page use
  | 'io_access'               // Variable accesses I/O (should use 'io' storage class)
  | 'const_data'              // Variable is constant data (should use 'data'/'const')
  | 'low_frequency'           // Variable accessed infrequently
  | 'single_use'              // Variable used only once
  | 'zero_page_pressure';     // Too many other zero page candidates

/**
 * Zero page promotion recommendation.
 */
export type ZeroPageRecommendation =
  | 'strongly_recommended'    // High benefit, should definitely promote
  | 'recommended'             // Good candidate for promotion
  | 'neutral'                 // No strong preference
  | 'not_recommended'         // Better left in normal memory
  | 'strongly_discouraged';   // Should not be promoted

/**
 * Register allocation candidate information.
 */
export interface RegisterCandidateInfo {
  /** Whether this variable is suitable for register allocation */
  isCandidate: boolean;

  /** Preferred register for allocation */
  preferredRegister: PreferredRegister;

  /** Alternative registers that could be used */
  alternativeRegisters: PreferredRegister[];

  /** Register allocation benefit score (0-100) */
  allocationScore: number;

  /** Estimated benefit of register allocation (cycle savings) */
  estimatedBenefit: number;

  /** Variable's interference with other register candidates */
  interferenceInfo: RegisterInterferenceInfo;

  /** Register usage patterns */
  usagePatterns: RegisterUsagePattern[];

  /** Final allocation recommendation */
  recommendation: RegisterAllocationRecommendation;
}

/**
 * Preferred register types for 6502.
 */
export type PreferredRegister = 'A' | 'X' | 'Y' | 'zero_page' | 'memory';

/**
 * Register interference information.
 */
export interface RegisterInterferenceInfo {
  /** Other variables that interfere with this one */
  interferingVariables: string[];

  /** Register pressure at allocation sites */
  registerPressure: RegisterPressureLevel[];

  /** Whether allocation would require spilling other variables */
  requiresSpilling: boolean;

  /** Cost of potential spilling */
  spillingCost: number;
}

/**
 * Register pressure level information.
 */
export interface RegisterPressureLevel {
  location: SourcePosition;
  pressure: 'low' | 'medium' | 'high' | 'critical';
  availableRegisters: PreferredRegister[];
}

/**
 * Register usage patterns.
 */
export interface RegisterUsagePattern {
  pattern: RegisterUsagePatternType;
  frequency: number;
  benefit: number;
}

export type RegisterUsagePatternType =
  | 'arithmetic_accumulator'   // Used in arithmetic operations (A register)
  | 'array_index'             // Used for array indexing (X/Y registers)
  | 'loop_counter'            // Used as loop counter (X/Y registers)
  | 'temporary_storage'       // Short-term temporary storage
  | 'function_parameter'      // Function parameter passing
  | 'function_return'         // Function return value
  | 'address_calculation';    // Address calculation (X/Y registers)

/**
 * Register allocation recommendation.
 */
export type RegisterAllocationRecommendation =
  | 'strongly_recommended'    // High benefit, allocate to preferred register
  | 'recommended'             // Good candidate, consider for allocation
  | 'conditional'             // Allocate only if registers available
  | 'not_recommended'         // Better left in memory
  | 'impossible';             // Cannot be allocated due to constraints

/**
 * Variable lifetime information for interference analysis.
 */
export interface VariableLifetimeInfo {
  /** Program points where variable is defined */
  definitionPoints: SourcePosition[];

  /** Program points where variable is used */
  usePoints: SourcePosition[];

  /** Program points where variable is live */
  liveRanges: LiveRange[];

  /** Whether variable lifetime spans function calls */
  spansFunctionCalls: boolean;

  /** Whether variable lifetime spans loops */
  spansLoops: boolean;

  /** Estimated lifetime duration (in basic blocks) */
  estimatedDuration: number;

  /** Variables that interfere with this one */
  interferingVariables: string[];
}

/**
 * Live range information for a variable.
 */
export interface LiveRange {
  /** Start of live range */
  start: SourcePosition;

  /** End of live range */
  end: SourcePosition;

  /** Whether this range spans a loop */
  spansLoop: boolean;

  /** Whether this range is in a hot path */
  isHotPath: boolean;
}

/**
 * 6502-specific optimization hints for variables.
 */
export interface Variable6502OptimizationHints {
  /** Preferred addressing mode for this variable */
  addressingMode: AddressingModeHint;

  /** Memory bank preference */
  memoryBank: MemoryBank;

  /** Whether variable should be aligned */
  alignmentPreference: AlignmentPreference;

  /** Hardware interaction hints */
  hardwareInteraction: HardwareInteractionHint;

  /** Optimization opportunities */
  optimizationOpportunities: VariableOptimizationOpportunity[];

  /** Performance characteristics */
  performanceHints: VariablePerformanceHint[];
}

/**
 * Addressing mode hints for 6502.
 */
export type AddressingModeHint =
  | 'zero_page'               // $00-$FF (3 cycles)
  | 'absolute'                // $0000-$FFFF (4 cycles)
  | 'zero_page_x'             // $00,X (4 cycles)
  | 'zero_page_y'             // $00,Y (4 cycles)
  | 'absolute_x'              // $0000,X (4+ cycles)
  | 'absolute_y'              // $0000,Y (4+ cycles)
  | 'indirect'                // ($00) (5 cycles)
  | 'indexed_indirect'        // ($00,X) (6 cycles)
  | 'indirect_indexed';       // ($00),Y (5+ cycles)

/**
 * Memory bank preferences for 6502.
 */
export type MemoryBank =
  | 'zero_page'               // $00-$FF
  | 'stack'                   // $0100-$01FF
  | 'low_ram'                 // $0200-$7FFF
  | 'high_ram'                // $8000-$BFFF
  | 'io_area'                 // $D000-$DFFF
  | 'rom_area'                // $E000-$FFFF
  | 'cartridge';              // External cartridge space

/**
 * Variable alignment preferences.
 */
export interface AlignmentPreference {
  /** Required alignment (1, 2, 4, 8, etc.) */
  requiredAlignment: number;

  /** Preferred alignment for performance */
  preferredAlignment: number;

  /** Whether variable benefits from page boundary alignment */
  preferPageBoundary: boolean;

  /** Reason for alignment requirement */
  reason: AlignmentReason;
}

export type AlignmentReason =
  | 'none'                    // No special alignment needed
  | 'word_access'             // 16-bit access benefits from even alignment
  | 'array_optimization'      // Array access optimization
  | 'hardware_requirement'    // Hardware register requires specific alignment
  | 'performance'             // General performance benefit
  | 'cache_line';             // Cache line alignment (future 65816 support)

/**
 * Hardware interaction hints.
 */
export interface HardwareInteractionHint {
  /** Whether variable interacts with hardware registers */
  isHardwareRegister: boolean;

  /** Whether variable is memory-mapped I/O */
  isMemoryMappedIO: boolean;

  /** Whether variable is timing-critical */
  isTimingCritical: boolean;

  /** Whether variable is used in interrupt handlers */
  usedInInterrupts: boolean;

  /** Hardware components this variable interacts with */
  hardwareComponents: HardwareComponent[];
}

export type HardwareComponent =
  | 'vic_ii'                  // VIC-II graphics chip
  | 'sid'                     // SID sound chip
  | 'cia1'                    // CIA1 (keyboard, joystick)
  | 'cia2'                    // CIA2 (serial, user port)
  | 'color_ram'               // Color RAM
  | 'sprite_data'             // Sprite data area
  | 'character_rom'           // Character ROM
  | 'kernel_rom'              // KERNAL ROM
  | 'basic_rom';              // BASIC ROM

/**
 * Variable optimization opportunities.
 */
export interface VariableOptimizationOpportunity {
  opportunity: VariableOptimizationOpportunityType;
  benefit: number; // Estimated cycle savings
  complexity: OptimizationComplexity;
  description: string;
}

export type VariableOptimizationOpportunityType =
  | 'constant_propagation'    // Variable has constant value
  | 'dead_store_elimination'  // Stores that are never read
  | 'common_subexpression'    // Variable involved in repeated calculations
  | 'loop_invariant_motion'   // Variable calculation can be moved out of loop
  | 'strength_reduction'      // Expensive operations can be reduced
  | 'induction_variable'      // Loop induction variable optimization
  | 'register_promotion'      // Variable should be kept in register
  | 'memory_layout'           // Variable placement optimization
  | 'addressing_mode';        // Better addressing mode available

export type OptimizationComplexity = 'simple' | 'moderate' | 'complex' | 'very_complex';

/**
 * Variable performance hints.
 */
export interface VariablePerformanceHint {
  hint: VariablePerformanceHintType;
  impact: PerformanceImpact;
  description: string;
}

export type VariablePerformanceHintType =
  | 'hot_variable'            // Variable accessed very frequently
  | 'cold_variable'           // Variable accessed infrequently
  | 'cache_friendly'          // Variable access pattern is cache-friendly
  | 'cache_unfriendly'        // Variable access pattern hurts cache
  | 'memory_bandwidth'        // Variable access affects memory bandwidth
  | 'critical_path'           // Variable is on performance critical path
  | 'spill_candidate'         // Variable likely to be spilled from registers
  | 'prefetch_candidate';     // Variable could benefit from prefetching

export type PerformanceImpact = 'low' | 'medium' | 'high' | 'critical';

/**
 * Variable memory layout information.
 */
export interface VariableMemoryLayoutInfo {
  /** Preferred memory region */
  preferredRegion: MemoryRegion;

  /** Size in bytes */
  sizeInBytes: number;

  /** Alignment requirements */
  alignment: AlignmentPreference;

  /** Whether variable should be grouped with related variables */
  groupingPreference: VariableGroupingInfo;

  /** Memory access patterns */
  accessPatterns: MemoryAccessPattern[];

  /** Locality characteristics */
  localityInfo: MemoryLocalityInfo;
}

/**
 * Memory regions for variable placement.
 */
export type MemoryRegion =
  | 'zero_page_high_priority' // Most valuable zero page locations
  | 'zero_page_normal'        // Standard zero page usage
  | 'ram_fast'                // Fast RAM access areas
  | 'ram_normal'              // Standard RAM
  | 'ram_slow'                // Slower RAM areas
  | 'data_section'            // Pre-initialized data area
  | 'bss_section'             // Uninitialized data area
  | 'io_region';              // Memory-mapped I/O area

/**
 * Variable grouping preferences.
 */
export interface VariableGroupingInfo {
  /** Whether this variable should be grouped */
  shouldGroup: boolean;

  /** Variables that should be grouped together */
  groupWith: string[];

  /** Reason for grouping */
  groupingReason: VariableGroupingReason;

  /** Preferred group layout */
  layoutPreference: GroupLayoutPreference;
}

export type VariableGroupingReason =
  | 'cache_locality'          // Variables accessed together
  | 'struct_members'          // Members of the same logical structure
  | 'array_elements'          // Elements of the same array
  | 'related_state'           // Variables representing related state
  | 'hardware_registers'      // Hardware register group
  | 'function_locals';        // Local variables in same function

export type GroupLayoutPreference =
  | 'sequential'              // Place variables sequentially
  | 'interleaved'             // Interleave for better access patterns
  | 'aligned'                 // Align group to specific boundary
  | 'packed'                  // Pack tightly to save space
  | 'scattered';              // Don't group (better distributed)

/**
 * Memory access patterns for variables.
 */
export interface MemoryAccessPattern {
  pattern: MemoryAccessPatternType;
  frequency: number;
  spatialLocality: SpatialLocality;
  temporalLocality: TemporalLocality;
}

export type MemoryAccessPatternType =
  | 'sequential'              // Sequential access pattern
  | 'random'                  // Random access pattern
  | 'strided'                 // Fixed stride access pattern
  | 'clustered'               // Clustered access pattern
  | 'sparse'                  // Sparse access pattern
  | 'single_shot';            // Single access then done

export type SpatialLocality = 'none' | 'low' | 'medium' | 'high';
export type TemporalLocality = 'none' | 'low' | 'medium' | 'high';

/**
 * Memory locality characteristics.
 */
export interface MemoryLocalityInfo {
  /** Spatial locality (nearby addresses accessed together) */
  spatialLocality: SpatialLocality;

  /** Temporal locality (same address accessed again soon) */
  temporalLocality: TemporalLocality;

  /** Variables frequently accessed together */
  coAccessedVariables: string[];

  /** Working set size estimate */
  workingSetSize: number;

  /** Whether variable is part of hot data structures */
  isHotData: boolean;
}

// ============================================================================
// HELPER TYPES AND INTERFACES
// ============================================================================

/**
 * Information about a function parameter.
 */
export interface ParameterInfo {
  name: string;
  type: Blend65Type;
  optional: boolean;
  defaultValue: Expression | null;
}

/**
 * Information about a type field.
 */
export interface TypeFieldInfo {
  name: string;
  type: Blend65Type;
  optional: boolean;
}

/**
 * Information about an enum member.
 */
export interface EnumMemberInfo {
  name: string;
  value: number; // Computed value
  explicitValue: Expression | null; // Original expression if provided
}

/**
 * Information about an import.
 */
export interface ImportInfo {
  /** Name imported from the module */
  importedName: string;

  /** Local name (same as imported if no alias) */
  localName: string;

  /** Source module qualified name */
  sourceModule: string[];

  /** Resolved symbol (filled during analysis) */
  resolvedSymbol?: Symbol;
}

// ============================================================================
// PHASE 5: UTILITY FUNCTIONS AND TYPE GUARDS
// ============================================================================

/**
 * Type guard functions for symbol types.
 * Enables safe type narrowing in TypeScript.
 */
export function isVariableSymbol(symbol: Symbol): symbol is VariableSymbol {
  return symbol.symbolType === 'Variable';
}

export function isFunctionSymbol(symbol: Symbol): symbol is FunctionSymbol {
  return symbol.symbolType === 'Function';
}

export function isModuleSymbol(symbol: Symbol): symbol is ModuleSymbol {
  return symbol.symbolType === 'Module';
}

export function isTypeSymbol(symbol: Symbol): symbol is TypeSymbol {
  return symbol.symbolType === 'Type';
}

export function isEnumSymbol(symbol: Symbol): symbol is EnumSymbol {
  return symbol.symbolType === 'Enum';
}

/**
 * Type guard functions for Blend65 types.
 */
export function isPrimitiveType(type: Blend65Type): type is PrimitiveType {
  return type.kind === 'primitive';
}

export function isArrayType(type: Blend65Type): type is ArrayType {
  return type.kind === 'array';
}

export function isNamedType(type: Blend65Type): type is NamedType {
  return type.kind === 'named';
}

export function isCallbackType(type: Blend65Type): type is CallbackType {
  return type.kind === 'callback';
}

/**
 * Helper functions for creating common types.
 *
 * Educational Note:
 * - Factory functions provide consistent type creation
 * - Reduces boilerplate and potential errors
 * - Centralized type creation for easy modification
 */
export function createPrimitiveType(name: PrimitiveType['name']): PrimitiveType {
  return { kind: 'primitive', name };
}

export function createArrayType(elementType: Blend65Type, size: number): ArrayType {
  return { kind: 'array', elementType, size };
}

export function createNamedType(name: string): NamedType {
  return { kind: 'named', name };
}

export function createCallbackType(parameterTypes: Blend65Type[], returnType: Blend65Type): CallbackType {
  return { kind: 'callback', parameterTypes, returnType };
}

/**
 * Type compatibility checking functions.
 *
 * Educational Note:
 * - Assignment compatibility: can we assign source to target?
 * - Type equality: are two types exactly the same?
 * - Implicit conversion: can we automatically convert between types?
 */

/**
 * Check if a source type can be assigned to a target type.
 *
 * Rules:
 * - Same types are always compatible
 * - byte/word are NOT implicitly compatible (explicit in 6502 code)
 * - Arrays must have same element type and size
 * - Callbacks must have same signature
 * - Named types require resolution
 */
export function isAssignmentCompatible(target: Blend65Type, source: Blend65Type): boolean {
  // Same type is always compatible
  if (areTypesEqual(target, source)) {
    return true;
  }

  // Primitive type compatibility
  if (isPrimitiveType(target) && isPrimitiveType(source)) {
    // byte and word are NOT implicitly compatible in Blend65
    // This forces explicit conversions, making 6502 code clearer
    return false;
  }

  // Array type compatibility
  if (isArrayType(target) && isArrayType(source)) {
    return target.size === source.size &&
           isAssignmentCompatible(target.elementType, source.elementType);
  }

  // Callback type compatibility
  if (isCallbackType(target) && isCallbackType(source)) {
    return areCallbackTypesCompatible(target, source);
  }

  // Named types require resolution (handled in semantic analyzer)
  if (isNamedType(target) || isNamedType(source)) {
    // This will be handled by the semantic analyzer after type resolution
    return false; // Conservative approach for now
  }

  return false;
}

/**
 * Check if two types are exactly equal.
 */
export function areTypesEqual(type1: Blend65Type, type2: Blend65Type): boolean {
  if (type1.kind !== type2.kind) {
    return false;
  }

  switch (type1.kind) {
    case 'primitive':
      return type1.name === (type2 as PrimitiveType).name;

    case 'array':
      const array2 = type2 as ArrayType;
      return type1.size === array2.size &&
             areTypesEqual(type1.elementType, array2.elementType);

    case 'named':
      return type1.name === (type2 as NamedType).name;

    case 'callback':
      return areCallbackTypesCompatible(type1, type2 as CallbackType);

    default:
      return false;
  }
}

/**
 * Check if two callback types are compatible.
 * Callback types are compatible if they have the same signature.
 */
export function areCallbackTypesCompatible(callback1: CallbackType, callback2: CallbackType): boolean {
  // Same return type
  if (!areTypesEqual(callback1.returnType, callback2.returnType)) {
    return false;
  }

  // Same number of parameters
  if (callback1.parameterTypes.length !== callback2.parameterTypes.length) {
    return false;
  }

  // All parameter types match
  for (let i = 0; i < callback1.parameterTypes.length; i++) {
    if (!areTypesEqual(callback1.parameterTypes[i], callback2.parameterTypes[i])) {
      return false;
    }
  }

  return true;
}

/**
 * Get a human-readable string representation of a type.
 * Useful for error messages and debugging.
 */
export function typeToString(type: Blend65Type): string {
  switch (type.kind) {
    case 'primitive':
      return type.name;

    case 'array':
      return `${typeToString(type.elementType)}[${type.size}]`;

    case 'named':
      return type.name;

    case 'callback':
      const params = type.parameterTypes.map(t => typeToString(t)).join(', ');
      const returnStr = type.returnType.kind === 'primitive' && type.returnType.name === 'void'
        ? '' : `: ${typeToString(type.returnType)}`;
      return `callback(${params})${returnStr}`;

    default:
      return 'unknown';
  }
}

/**
 * Validate storage class usage.
 * Different storage classes have different constraints.
 */
export function validateStorageClassUsage(
  storageClass: StorageClass,
  scope: ScopeType,
  hasInitializer: boolean
): SemanticResult<void> {

  // Storage classes only allowed at global/module scope
  if (scope === 'Function' || scope === 'Block') {
    return {
      success: false,
      errors: [{
        errorType: 'InvalidStorageClass',
        message: `Storage class '${storageClass}' not allowed in ${scope.toLowerCase()} scope. Storage classes are only valid for global variables.`,
        location: { line: 0, column: 0, offset: 0 }, // Will be filled by caller
        suggestions: [
          'Remove the storage class to create a local variable',
          'Move the variable declaration to module level to use storage classes'
        ]
      }]
    };
  }

  // 'const' and 'data' require initializers
  if ((storageClass === 'const' || storageClass === 'data') && !hasInitializer) {
    return {
      success: false,
      errors: [{
        errorType: 'ConstantRequired',
        message: `Variables with '${storageClass}' storage class must have an initializer.`,
        location: { line: 0, column: 0, offset: 0 },
        suggestions: [
          `Add an initializer: var name: type = value`,
          `Use 'ram' or 'zp' storage class for uninitialized variables`
        ]
      }]
    };
  }

  // 'io' variables cannot have initializers
  if (storageClass === 'io' && hasInitializer) {
    return {
      success: false,
      errors: [{
        errorType: 'InvalidStorageClass',
        message: `Variables with 'io' storage class cannot have initializers. They represent memory-mapped hardware registers.`,
        location: { line: 0, column: 0, offset: 0 },
        suggestions: [
          'Remove the initializer for io variables',
          'Use a different storage class if you need initialization'
        ]
      }]
    };
  }

  return { success: true, data: undefined };
}

// ============================================================================
// SYMBOL CREATION HELPER FUNCTIONS
// ============================================================================

/**
 * Helper functions for creating symbols with proper defaults.
 * These will be used by the semantic analyzer to create symbols consistently.
 */

export function createVariableSymbol(
  name: string,
  varType: Blend65Type,
  scope: Scope,
  location: SourcePosition,
  options: {
    storageClass?: StorageClass;
    initialValue?: Expression;
    isExported?: boolean;
    isLocal?: boolean;
  } = {}
): VariableSymbol {
  return {
    name,
    symbolType: 'Variable',
    sourceLocation: location,
    scope,
    isExported: options.isExported ?? false,
    varType,
    storageClass: options.storageClass ?? null,
    initialValue: options.initialValue ?? null,
    isLocal: options.isLocal ?? false
  };
}

export function createFunctionSymbol(
  name: string,
  parameters: ParameterInfo[],
  returnType: Blend65Type,
  scope: Scope,
  location: SourcePosition,
  options: {
    isCallback?: boolean;
    isExported?: boolean;
  } = {}
): FunctionSymbol {
  return {
    name,
    symbolType: 'Function',
    sourceLocation: location,
    scope,
    isExported: options.isExported ?? false,
    parameters,
    returnType,
    isCallback: options.isCallback ?? false
  };
}

export function createModuleSymbol(
  name: string,
  qualifiedName: string[],
  scope: Scope,
  location: SourcePosition
): ModuleSymbol {
  return {
    name,
    symbolType: 'Module',
    sourceLocation: location,
    scope,
    isExported: false, // Modules themselves are not exported
    qualifiedName,
    exports: new Map(),
    imports: new Map()
  };
}

export function createScope(
  scopeType: ScopeType,
  parent: Scope | null = null,
  name?: string
): Scope {
  return {
    scopeType,
    parent,
    symbols: new Map(),
    children: [],
    name
  };
}

// ============================================================================
// EXPORTS FOR SEMANTIC ANALYZER
// ============================================================================

/**
 * Main exports for use by other packages.
 * This is the public API of the semantic analysis infrastructure.
 *
 * Note: All types are already exported individually where they are defined.
 * This section serves as documentation of the complete API.
 */

/**
 * Summary of what we've built:
 *
 * 1. Complete symbol system for all Blend65 constructs
 * 2. Rich type system with 6502-specific storage classes
 * 3. Hierarchical scope management for lexical scoping
 * 4. Comprehensive error reporting with source locations
 * 5. Type compatibility checking for safe operations
 * 6. Helper functions and factory methods for consistent usage
 *
 * This foundation enables:
 * - Task 1.2: Symbol table implementation
 * - Task 1.3: Type system implementation
 * - Task 1.4+: All semantic analysis phases
 * - Eventually: Complete compilation to 6502 assembly
 *
 * The educational journey continues with implementing the semantic analyzer
 * that uses these types to validate real Blend65 programs!
 */
