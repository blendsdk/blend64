# Blend65 Pipeline Testing and Revolutionary Platform Library Implementation Plan

**Version:** 1.0
**Date:** January 4, 2026
**Status:** Ready for Implementation
**Project Completion:** 80% (Frontend + IL System Complete)

---

## Executive Summary

This implementation plan establishes a revolutionary approach to retro development by implementing hardware APIs as compilable Blend65 source code, creating transparent, optimizable platform abstractions that users can read, understand, and extend. The plan covers comprehensive pipeline validation, platform library architecture, and game development ecosystem creation.

### Revolutionary Discovery
**Hardware APIs as Blend65 Source Code:**
```js
// platform-libs/c64/sprites.blend
module c64.sprites

io var VIC_SPRITE_0_X = $D000    // Explicit hardware memory mapping
io var VIC_SPRITE_0_Y = $D001    // Transparent implementation

export function setSpritePosition(spriteId: byte, x: byte, y: byte): void
    if spriteId == 0 then
        VIC_SPRITE_0_X = x       // Direct register access
        VIC_SPRITE_0_Y = y       // Cross-module optimizable
    end if
end function
```

### Strategic Impact
- **Transparent Implementation**: Users can read and modify hardware abstractions
- **Cross-Module Optimization**: Platform libraries optimized with user code
- **Multi-Platform Support**: Same API, different memory maps per target
- **Extensible Architecture**: Custom hardware abstractions and game libraries
- **Educational Value**: Complete visibility into hardware programming

---

## Table of Contents

1. [Current Project Status](#current-project-status)
2. [Phase A: Pipeline Testing Infrastructure](#phase-a-pipeline-testing-infrastructure)
3. [Phase B: Revolutionary Platform Library System](#phase-b-revolutionary-platform-library-system)
4. [Phase C: Game Development Library Ecosystem](#phase-c-game-development-library-ecosystem)
5. [Phase D: IL Caching and Development Performance](#phase-d-il-caching-and-development-performance)
6. [Phase E: Integration Testing and Production Validation](#phase-e-integration-testing-and-production-validation)
7. [Implementation Timeline](#implementation-timeline)
8. [Success Criteria](#success-criteria)
9. [Quality Assurance](#quality-assurance)

---

## Current Project Status

### **✅ Exceptional Foundation Complete (80%)**

**Frontend System (100% Complete):**
- ✅ **Lexer**: 65 tests passing, all Blend65 tokens supported
- ✅ **Parser**: 128 tests passing, v0.1-v0.3 syntax complete including callbacks
- ✅ **AST**: 48 tests passing, all node types implemented

**Semantic Analysis (100% Complete):**
- ✅ **Symbol Tables**: 344 tests passing, hierarchical scoping with module system
- ✅ **Type System**: Complete with 6502-specific storage classes (zp/ram/data/const/io)
- ✅ **Optimization Metadata**: Comprehensive 6502 optimization data collection

**IL System (100% Complete):**
- ✅ **IL Builder API**: 403 tests passing, production-ready fluent interface
- ✅ **Optimization Framework**: Intelligent pattern application with analytics
- ✅ **Multi-Platform Support**: C64/VIC-20/X16 with hardware-specific optimizations
- ✅ **Performance**: 0.099ms average program construction, sub-millisecond compilation

**Build Health:** ✅ 1,132 total tests passing, zero TypeScript errors, all packages building successfully

### **Ready for Revolutionary Development**
- Complete compilation pipeline: **Blend65 Source → Lexer → Parser → AST → Semantic → IL → Optimization**
- Production-ready IL system with world-class optimization intelligence
- Perfect foundation for transparent platform library implementation

---

## Phase A: Pipeline Testing Infrastructure
**Duration:** 2-3 weeks
**Goal:** Create comprehensive end-to-end testing framework before Phase 3 code generation

### **Task A.1: Create Pipeline Testing Package**
**File:** `packages/pipeline-test/`
**Duration:** 1 week

#### Implementation Details
```typescript
// packages/pipeline-test/src/pipeline-tester.ts
export interface PipelineTestResult {
  success: boolean;
  lexerResult?: LexerResult;
  parserResult?: ParseResult;
  semanticResult?: SemanticResult;
  ilResult?: ILTransformResult;
  optimizationResult?: OptimizationResult;
  errors: CompilationError[];
  metrics: PipelineMetrics;
}

export class PipelineTester {
  async testFullPipeline(source: string, target: Platform): Promise<PipelineTestResult>
  async testPipelineStage(source: string, stage: PipelineStage): Promise<StageResult>
  async benchmarkPipeline(sources: string[], iterations: number): Promise<BenchmarkResult>
  async validateOptimizations(source: string, expectedOptimizations: string[]): Promise<ValidationResult>
}
```

#### Test Program Library
```js
// Test programs for pipeline validation
export const PIPELINE_TEST_PROGRAMS = {
  // Basic language features
  SIMPLE_VARIABLES: `
    module Test.Basic
    var counter: byte = 0
    function main(): void
      counter = 42
    end function
  `,

  // Storage classes
  STORAGE_CLASSES: `
    module Test.Storage
    zp var fastVar: byte
    io var VIC_BG: byte = $D020
    data var table: byte[256] = [/* data */]
  `,

  // Callback functions (v0.3)
  CALLBACK_SYSTEM: `
    module Test.Callbacks
    var irqHandler: callback function(): void

    callback function rasterIRQ(): void
      // Interrupt handler
    end function

    function main(): void
      irqHandler = rasterIRQ
    end function
  `,

  // Complex control flow
  CONTROL_FLOW: `
    module Test.Control

    function gameLoop(): void
      for frame = 0 to 255
        if frame % 60 == 0 then
          updateLogic()
        end if

        while inputAvailable()
          processInput()
        end while
      next frame
    end function
  `,

  // Real game example
  SNAKE_GAME: `
    module Game.Snake
    import setSpritePosition from c64.sprites

    var snakeX: byte = 100
    var snakeY: byte = 100
    var direction: byte = 0

    function updateSnake(): void
      match direction
        case 0: snakeY -= 1  // Up
        case 1: snakeX += 1  // Right
        case 2: snakeY += 1  // Down
        case 3: snakeX -= 1  // Left
      end match

      setSpritePosition(0, snakeX, snakeY)
    end function
  `
};
```

#### Success Criteria
- [ ] All test programs compile through complete pipeline
- [ ] Comprehensive error handling and reporting
- [ ] Performance benchmarking under 10ms for typical programs
- [ ] Validation of optimization metadata preservation
- [ ] Integration with existing test framework

### **Task A.2: Platform Library Compilation Testing**
**File:** `packages/pipeline-test/src/platform-library-tester.ts`
**Duration:** 1 week

#### Platform Library Test Framework
```typescript
export class PlatformLibraryTester {
  async testPlatformLibraryCompilation(
    platformLib: string,
    userCode: string,
    target: Platform
  ): Promise<LibraryTestResult>

  async validateCrossModuleOptimization(
    libraries: PlatformLibrary[],
    userCode: string
  ): Promise<OptimizationValidationResult>

  async testHardwareRegisterMapping(
    platform: Platform,
    expectedMappings: HardwareMapping[]
  ): Promise<MappingValidationResult>
}
```

#### Test Platform Library Samples
```js
// Minimal C64 sprite library for testing
export const C64_SPRITE_LIBRARY_TEST = `
module c64.sprites

// Hardware register mapping
io var VIC_SPRITE_0_X = $D000
io var VIC_SPRITE_0_Y = $D001
io var VIC_SPRITE_1_X = $D002
io var VIC_SPRITE_1_Y = $D003
io var VIC_SPRITE_ENABLE = $D015

export function setSpritePosition(spriteId: byte, x: byte, y: byte): void
  if spriteId == 0 then
    VIC_SPRITE_0_X = x
    VIC_SPRITE_0_Y = y
  else if spriteId == 1 then
    VIC_SPRITE_1_X = x
    VIC_SPRITE_1_Y = y
  end if
end function

export function enableSprite(spriteId: byte): void
  var mask: byte = 1 << spriteId
  VIC_SPRITE_ENABLE = VIC_SPRITE_ENABLE | mask
end function
`;

// User code that uses the platform library
export const USER_CODE_TEST = `
module Game.Main
import setSpritePosition, enableSprite from c64.sprites

var playerX: byte = 100
var playerY: byte = 100

function main(): void
  enableSprite(0)

  while true
    updatePlayer()
    setSpritePosition(0, playerX, playerY)
  end while
end function

function updatePlayer(): void
  playerX = playerX + 1
  if playerX > 255 then
    playerX = 0
  end if
end function
`;
```

#### Cross-Module Optimization Validation
```typescript
export interface OptimizationValidation {
  // Validate platform library code is optimized with user code
  validateInlining: boolean;           // setSpritePosition() inlined in hot paths
  validateConstantPropagation: boolean; // Sprite IDs become constants
  validateRegisterAllocation: boolean;  // Shared register allocation across modules
  validateMemoryLayout: boolean;        // Optimal memory layout for all variables
}
```

#### Success Criteria
- [ ] Platform libraries compile as standard Blend65 modules
- [ ] Cross-module optimization works between platform libs and user code
- [ ] Hardware register mappings validate correctly
- [ ] Performance benchmarking shows optimization benefits
- [ ] Error handling for invalid hardware mappings

### **Task A.3: Integration Performance Testing**
**File:** `packages/pipeline-test/src/performance-tester.ts`
**Duration:** 0.5 weeks

#### Performance Benchmarking Framework
```typescript
export interface PerformanceBenchmarks {
  compilationSpeed: {
    simpleProgram: number;      // Target: <5ms
    complexProgram: number;     // Target: <50ms
    platformLibrary: number;    // Target: <10ms
    crossModuleOptimization: number; // Target: <100ms
  };

  memoryUsage: {
    peakMemory: number;         // Target: <50MB
    steadyStateMemory: number;  // Target: <20MB
  };

  optimizationMetrics: {
    patternApplicationTime: number;    // Target: <20ms
    analysisTime: number;             // Target: <10ms
    crossModuleAnalysisTime: number;  // Target: <30ms
  };
}

export class PerformanceTester {
  async benchmarkFullPipeline(testPrograms: TestProgram[]): Promise<PerformanceBenchmarks>
  async profileMemoryUsage(source: string): Promise<MemoryProfile>
  async benchmarkOptimizationPerformance(complexPrograms: string[]): Promise<OptimizationBenchmarks>
}
```

#### Success Criteria
- [ ] Compilation speed under target thresholds
- [ ] Memory usage within acceptable bounds
- [ ] Optimization performance meets targets
- [ ] Regression testing framework established
- [ ] Performance monitoring integration

---

## Phase B: Revolutionary Platform Library System
**Duration:** 3-4 weeks
**Goal:** Implement hardware APIs as compilable Blend65 source code with transparent, optimizable abstractions

### **Task B.1: Platform Library Architecture Design**
**File:** `platform-libs/README.md` and architecture documentation
**Duration:** 1 week

#### Directory Structure Design
```
platform-libs/
├── c64/                           # Commodore 64 platform libraries
│   ├── sprites.blend             # VIC-II sprite control
│   ├── vic.blend                 # VIC-II graphics control
│   ├── sid.blend                 # SID sound control
│   ├── cia.blend                 # CIA timers and input
│   ├── memory.blend              # Memory management
│   └── interrupts.blend          # Hardware interrupts
├── vic20/                        # VIC-20 platform libraries
│   ├── sprites.blend             # VIC-I sprite control (limited)
│   ├── vic.blend                 # VIC-I graphics control
│   ├── sound.blend               # Simple sound control
│   └── memory.blend              # VIC-20 memory layout
├── x16/                          # Commander X16 platform libraries
│   ├── vera/                     # VERA graphics system
│   │   ├── sprites.blend         # Advanced sprite control
│   │   ├── layers.blend          # Graphics layers
│   │   └── palette.blend         # Color palette management
│   ├── sound.blend               # Enhanced sound control
│   └── memory.blend              # Banked memory management
└── common/                       # Cross-platform abstractions
    ├── math.blend                # Mathematics library
    ├── input.blend               # Generic input abstraction
    └── graphics.blend            # Generic graphics primitives
```

#### Platform Library Specification Format
```js
// Platform library header specification
module c64.sprites

/*
 * C64 Sprite Control Library
 * Hardware: VIC-II chip sprite system
 * Registers: $D000-$D02E (VIC-II sprite registers)
 * Features: 8 hardware sprites, 24x21 pixels, collision detection
 */

// ===== HARDWARE REGISTER MAPPING =====
// Explicit hardware memory layout - users can see and understand

// Sprite position registers
io var VIC_SPRITE_0_X = $D000      // Sprite 0 X position
io var VIC_SPRITE_0_Y = $D001      // Sprite 0 Y position
io var VIC_SPRITE_1_X = $D002      // Sprite 1 X position
io var VIC_SPRITE_1_Y = $D003      // Sprite 1 Y position
// ... continue for all 8 sprites

// Sprite control registers
io var VIC_SPRITE_ENABLE = $D015   // Sprite enable bits (8 sprites)
io var VIC_SPRITE_COLOR_0 = $D027  // Sprite 0 color
io var VIC_SPRITE_COLOR_1 = $D028  // Sprite 1 color
// ... continue for all sprite colors

// Sprite collision detection
io var VIC_SPRITE_COLLISION = $D01E    // Sprite-sprite collision
io var VIC_BACKGROUND_COLLISION = $D01F // Sprite-background collision

// ===== PUBLIC API =====
// High-level functions using transparent hardware access

export function setSpritePosition(spriteId: byte, x: byte, y: byte): void
export function setSpriteColor(spriteId: byte, color: byte): void
export function enableSprite(spriteId: byte): void
export function disableSprite(spriteId: byte): void
export function readSpriteCollisions(): byte
export function clearCollisions(): void
```

#### Cross-Platform API Design
```js
// Common API across all platforms - same interface, different implementations
module platform.sprites

// Generic sprite API that works on all platforms
export function setSpritePosition(spriteId: byte, x: byte, y: byte): void
export function setSpriteColor(spriteId: byte, color: byte): void
export function enableSprite(spriteId: byte): void
export function readCollisions(): byte

// Platform-specific implementation imported at compile time
// C64: Uses VIC-II registers
// VIC-20: Uses VIC-I registers (limited functionality)
// X16: Uses VERA sprite system (enhanced functionality)
```

#### Success Criteria
- [ ] Complete platform library architecture specification
- [ ] Cross-platform API design with implementation strategy
- [ ] Hardware register mapping methodology established
- [ ] Documentation standards for platform libraries
- [ ] Integration strategy with compilation pipeline

### **Task B.2: C64 Platform Library Implementation**
**File:** `platform-libs/c64/` directory
**Duration:** 2 weeks

#### C64 Sprite Control Implementation
```js
// platform-libs/c64/sprites.blend
module c64.sprites

/*
 * Commodore 64 VIC-II Sprite Control Library
 * Transparent hardware abstraction using explicit register mapping
 * Users can read, understand, and modify the implementation
 */

// ===== HARDWARE REGISTER MAPPING =====
// Complete VIC-II sprite register layout

// Sprite X/Y position registers ($D000-$D00F)
io var VIC_SPRITE_0_X = $D000
io var VIC_SPRITE_0_Y = $D001
io var VIC_SPRITE_1_X = $D002
io var VIC_SPRITE_1_Y = $D003
io var VIC_SPRITE_2_X = $D004
io var VIC_SPRITE_2_Y = $D005
io var VIC_SPRITE_3_X = $D006
io var VIC_SPRITE_3_Y = $D007
io var VIC_SPRITE_4_X = $D008
io var VIC_SPRITE_4_Y = $D009
io var VIC_SPRITE_5_X = $D00A
io var VIC_SPRITE_5_Y = $D00B
io var VIC_SPRITE_6_X = $D00C
io var VIC_SPRITE_6_Y = $D00D
io var VIC_SPRITE_7_X = $D00E
io var VIC_SPRITE_7_Y = $D00F

// Sprite MSB X position register ($D010)
io var VIC_SPRITE_X_MSB = $D010

// Sprite control registers
io var VIC_SPRITE_ENABLE = $D015       // Sprite enable bits
io var VIC_SPRITE_EXPAND_Y = $D017     // Sprite Y expansion
io var VIC_SPRITE_PRIORITY = $D01B     // Sprite-background priority
io var VIC_SPRITE_MULTICOLOR = $D01C   // Multicolor sprite mode
io var VIC_SPRITE_EXPAND_X = $D01D     // Sprite X expansion

// Collision detection registers
io var VIC_SPRITE_COLLISION = $D01E    // Sprite-sprite collision
io var VIC_BACKGROUND_COLLISION = $D01F // Sprite-background collision

// Sprite colors ($D027-$D02E)
io var VIC_SPRITE_COLOR_0 = $D027
io var VIC_SPRITE_COLOR_1 = $D028
io var VIC_SPRITE_COLOR_2 = $D029
io var VIC_SPRITE_COLOR_3 = $D02A
io var VIC_SPRITE_COLOR_4 = $D02B
io var VIC_SPRITE_COLOR_5 = $D02C
io var VIC_SPRITE_COLOR_6 = $D02D
io var VIC_SPRITE_COLOR_7 = $D02E

// Sprite data pointers (in screen memory)
io var SPRITE_POINTER_0 = $07F8
io var SPRITE_POINTER_1 = $07F9
io var SPRITE_POINTER_2 = $07FA
io var SPRITE_POINTER_3 = $07FB
io var SPRITE_POINTER_4 = $07FC
io var SPRITE_POINTER_5 = $07FD
io var SPRITE_POINTER_6 = $07FE
io var SPRITE_POINTER_7 = $07FF

// ===== PUBLIC API IMPLEMENTATION =====
// Transparent, optimizable hardware abstractions

export function setSpritePosition(spriteId: byte, x: word, y: byte): void
  // Set sprite position with 9-bit X coordinate support
  if spriteId == 0 then
    VIC_SPRITE_0_X = x & $FF
    VIC_SPRITE_0_Y = y
  else if spriteId == 1 then
    VIC_SPRITE_1_X = x & $FF
    VIC_SPRITE_1_Y = y
  else if spriteId == 2 then
    VIC_SPRITE_2_X = x & $FF
    VIC_SPRITE_2_Y = y
  else if spriteId == 3 then
    VIC_SPRITE_3_X = x & $FF
    VIC_SPRITE_3_Y = y
  else if spriteId == 4 then
    VIC_SPRITE_4_X = x & $FF
    VIC_SPRITE_4_Y = y
  else if spriteId == 5 then
    VIC_SPRITE_5_X = x & $FF
    VIC_SPRITE_5_Y = y
  else if spriteId == 6 then
    VIC_SPRITE_6_X = x & $FF
    VIC_SPRITE_6_Y = y
  else if spriteId == 7 then
    VIC_SPRITE_7_X = x & $FF
    VIC_SPRITE_7_Y = y
  end if

  // Handle 9th bit of X coordinate
  var xMSB: byte = VIC_SPRITE_X_MSB
  var spriteBit: byte = 1 << spriteId

  if (x & $100) != 0 then
    xMSB = xMSB | spriteBit     // Set bit
  else
    xMSB = xMSB & ~spriteBit    // Clear bit
  end if

  VIC_SPRITE_X_MSB = xMSB
end function

export function setSpriteColor(spriteId: byte, color: byte): void
  // Set sprite color - transparent hardware access
  if spriteId == 0 then
    VIC_SPRITE_COLOR_0 = color
  else if spriteId == 1 then
    VIC_SPRITE_COLOR_1 = color
  else if spriteId == 2 then
    VIC_SPRITE_COLOR_2 = color
  else if spriteId == 3 then
    VIC_SPRITE_COLOR_3 = color
  else if spriteId == 4 then
    VIC_SPRITE_COLOR_4 = color
  else if spriteId == 5 then
    VIC_SPRITE_COLOR_5 = color
  else if spriteId == 6 then
    VIC_SPRITE_COLOR_6 = color
  else if spriteId == 7 then
    VIC_SPRITE_COLOR_7 = color
  end if
end function

export function enableSprite(spriteId: byte): void
  // Enable single sprite - bitwise operation
  var spriteMask: byte = 1 << spriteId
  VIC_SPRITE_ENABLE = VIC_SPRITE_ENABLE | spriteMask
end function

export function disableSprite(spriteId: byte): void
  // Disable single sprite - bitwise operation
  var spriteMask: byte = ~(1 << spriteId)
  VIC_SPRITE_ENABLE = VIC_SPRITE_ENABLE & spriteMask
end function

export function enableAllSprites(): void
  // Enable all 8 sprites
  VIC_SPRITE_ENABLE = $FF
end function

export function disableAllSprites(): void
  // Disable all sprites
  VIC_SPRITE_ENABLE = $00
end function

export function setSpriteData(spriteId: byte, dataBlock: byte): void
  // Set sprite data pointer (dataBlock * 64 = sprite data address)
  if spriteId == 0 then
    SPRITE_POINTER_0 = dataBlock
  else if spriteId == 1 then
    SPRITE_POINTER_1 = dataBlock
  else if spriteId == 2 then
    SPRITE_POINTER_2 = dataBlock
  else if spriteId == 3 then
    SPRITE_POINTER_3 = dataBlock
  else if spriteId == 4 then
    SPRITE_POINTER_4 = dataBlock
  else if spriteId == 5 then
    SPRITE_POINTER_5 = dataBlock
  else if spriteId == 6 then
    SPRITE_POINTER_6 = dataBlock
  else if spriteId == 7 then
    SPRITE_POINTER_7 = dataBlock
  end if
end function

export function readSpriteCollisions(): byte
  // Read sprite-sprite collision register
  return VIC_SPRITE_COLLISION
end function

export function readBackgroundCollisions(): byte
  // Read sprite-background collision register
  return VIC_BACKGROUND_COLLISION
end function

export function clearCollisions(): void
  // Clear collision detection by reading registers
  var dummy1: byte = VIC_SPRITE_COLLISION
  var dummy2: byte = VIC_BACKGROUND_COLLISION
end function

export function setSpriteExpansion(spriteId: byte, expandX: boolean, expandY: boolean): void
  // Set sprite expansion (double size)
  var spriteBit: byte = 1 << spriteId

  if expandX then
    VIC_SPRITE_EXPAND_X = VIC_SPRITE_EXPAND_X | spriteBit
  else
    VIC_SPRITE_EXPAND_X = VIC_SPRITE_EXPAND_X & ~spriteBit
  end if

  if expandY then
    VIC_SPRITE_EXPAND_Y = VIC_SPRITE_EXPAND_Y | spriteBit
  else
    VIC_SPRITE_EXPAND_Y = VIC_SPRITE_EXPAND_Y & ~spriteBit
  end if
end function

export function setSpriteMulticolor(spriteId: byte, multicolor: boolean): void
  // Enable/disable multicolor mode for sprite
  var spriteBit: byte = 1 << spriteId

  if multicolor then
    VIC_SPRITE_MULTICOLOR = VIC_SPRITE_MULTICOLOR | spriteBit
  else
    VIC_SPRITE_MULTICOLOR = VIC_SPRITE_MULTICOLOR & ~spriteBit
  end if
end function

export function setSpritePriority(spriteId: byte, foreground: boolean): void
  // Set sprite priority (foreground/background)
  var spriteBit: byte = 1 << spriteId

  if foreground then
    VIC_SPRITE_PRIORITY = VIC_SPRITE_PRIORITY & ~spriteBit
  else
    VIC_SPRITE_PRIORITY = VIC_SPRITE_PRIORITY | spriteBit
  end if
end function
```

#### C64 Graphics Control Implementation
```js
// platform-libs/c64/vic.blend
module c64.vic

/*
 * Commodore 64 VIC-II Graphics Control Library
 * Screen modes, colors, scrolling, memory management
 */

// ===== VIC-II CONTROL REGISTERS =====
io var VIC_CONTROL_1 = $D011          // Control register 1
io var VIC_RASTER = $D012             // Raster line register
io var VIC_LIGHT_PEN_X = $D013        // Light pen X position
io var VIC_LIGHT_PEN_Y = $D014        // Light pen Y position
io var VIC_CONTROL_2 = $D016          // Control register 2
io var VIC_INTERRUPT = $D019          // Interrupt register
io var VIC_INTERRUPT_ENABLE = $D01A   // Interrupt enable register

// Color registers
io var VIC_BORDER_COLOR = $D020       // Border color
io var VIC_BACKGROUND_COLOR = $D021   // Background color 0
io var VIC_BACKGROUND_COLOR_1 = $D022 // Background color 1 (multicolor)
io var VIC_BACKGROUND_COLOR_2 = $D023 // Background color 2 (multicolor)
io var VIC_BACKGROUND_COLOR_3 = $D024 // Background color 3 (multicolor)

// Memory pointers
io var VIC_MEMORY_CONTROL = $D018     // Memory control register

// ===== GRAPHICS API =====
export function setBackgroundColor(color: byte): void
  VIC_BACKGROUND_COLOR = color
end function

export function setBorderColor(color: byte): void
  VIC_BORDER_COLOR = color
end function

export function setTextMode(): void
  // Set standard text mode (40x25 characters)
  VIC_CONTROL_1 = (VIC_CONTROL_1 & $9F) | $10  // Clear BMM, set DEN
  VIC_CONTROL_2 = VIC_CONTROL_2 & $EF          // Clear MCM
end function

export function setBitmapMode(): void
  // Set high-resolution bitmap mode
  VIC_CONTROL_1 = VIC_CONTROL_1 | $20          // Set BMM
  VIC_CONTROL_2 = VIC_CONTROL_2 & $EF          // Clear MCM
end function

export function setMulticolorMode(): void
  // Set multicolor text/bitmap mode
  VIC_CONTROL_2 = VIC_CONTROL_2 | $10          // Set MCM
end function

export function setScrollX(scroll: byte): void
  // Set horizontal fine scroll (0-7)
  var control2: byte = VIC_CONTROL_2 & $F8     // Clear scroll bits
  VIC_CONTROL_2 = control2 | (scroll & $07)   // Set new scroll
end function

export function setScrollY(scroll: byte): void
  // Set vertical fine scroll (0-7)
  var control1: byte = VIC_CONTROL_1 & $F8     // Clear scroll bits
  VIC_CONTROL_1 = control1 | (scroll & $07)   // Set new scroll
end function

export function setScreenMemory(bank: byte): void
  // Set screen memory location (within VIC bank)
  var memory: byte = VIC_MEMORY_CONTROL & $0F  // Keep character memory bits
  VIC_MEMORY_CONTROL = memory | ((bank & $0F) << 4)
end function

export function setCharacterMemory(bank: byte): void
  // Set character memory location (within VIC bank)
  var memory: byte = VIC_MEMORY_CONTROL & $F0  // Keep screen memory bits
  VIC_MEMORY_CONTROL = memory | ((bank & $0E) << 1)
end function

export function waitRasterLine(line: byte): void
  // Wait for specific raster line
  while VIC_RASTER != line
    // Wait for raster
  end while
end function

export function getRasterLine(): byte
  // Read current raster line
  return VIC_RASTER
end function
```

#### C64 Sound Control Implementation
```js
// platform-libs/c64/sid.blend
module c64.sid

/*
 * Commodore 64 SID Sound Control Library
 * Hardware: SID chip (6581/8580) sound generation
 * Registers: $D400-$D7FF (SID registers)
 * Features: 3 voices, filters, oscillators, ADSR envelopes
 */

// ===== SID VOICE REGISTERS =====

// Voice 1 ($D400-$D406)
io var SID_V1_FREQ_LO = $D400      // Voice 1 frequency low byte
io var SID_V1_FREQ_HI = $D401      // Voice 1 frequency high byte
io var SID_V1_PW_LO = $D402        // Voice 1 pulse width low byte
io var SID_V1_PW_HI = $D403        // Voice 1 pulse width high byte
io var SID_V1_CONTROL = $D404      // Voice 1 control register
io var SID_V1_ATTACK_DECAY = $D405 // Voice 1 attack/decay
io var SID_V1_SUSTAIN_RELEASE = $D406 // Voice 1 sustain/release

// Voice 2 ($D407-$D40D)
io var SID_V2_FREQ_LO = $D407
io var SID_V2_FREQ_HI = $D408
io var SID_V2_PW_LO = $D409
io var SID_V2_PW_HI = $D40A
io var SID_V2_CONTROL = $D40B
io var SID_V2_ATTACK_DECAY = $D40C
io var SID_V2_SUSTAIN_RELEASE = $D40D

// Voice 3 ($D40E-$D414)
io var SID_V3_FREQ_LO = $D40E
io var SID_V3_FREQ_HI = $D40F
io var SID_V3_PW_LO = $D410
io var SID_V3_PW_HI = $D411
io var SID_V3_CONTROL = $D412
io var SID_V3_ATTACK_DECAY = $D413
io var SID_V3_SUSTAIN_RELEASE = $D414

// Filter and volume ($D415-$D418)
io var SID_FILTER_CUTOFF_LO = $D415  // Filter cutoff frequency low
io var SID_FILTER_CUTOFF_HI = $D416  // Filter cutoff frequency high
io var SID_FILTER_RESONANCE = $D417  // Filter resonance and routing
io var SID_FILTER_MODE_VOLUME = $D418 // Filter mode and master volume

// Read-only registers
io var SID_OSC3_RANDOM = $D41B       // Oscillator 3 output / random number

// ===== SOUND API =====

export function setFrequency(voice: byte, frequency: word): void
  // Set voice frequency (0-65535, corresponds to musical notes)
  if voice == 1 then
    SID_V1_FREQ_LO = frequency & $FF
    SID_V1_FREQ_HI = frequency >> 8
  else if voice == 2 then
    SID_V2_FREQ_LO = frequency & $FF
    SID_V2_FREQ_HI = frequency >> 8
  else if voice == 3 then
    SID_V3_FREQ_LO = frequency & $FF
    SID_V3_FREQ_HI = frequency >> 8
  end if
end function

export function setWaveform(voice: byte, waveform: byte): void
  // Set voice waveform: $10=triangle, $20=sawtooth, $40=pulse, $80=noise
  var control: byte

  if voice == 1 then
    control = SID_V1_CONTROL & $0F  // Keep gate and other bits
    SID_V1_CONTROL = control | waveform
  else if voice == 2 then
    control = SID_V2_CONTROL & $0F
    SID_V2_CONTROL = control | waveform
  else if voice == 3 then
    control = SID_V3_CONTROL & $0F
    SID_V3_CONTROL = control | waveform
  end if
end function

export function gateOn(voice: byte): void
  // Turn voice gate on (start playing note)
  if voice == 1 then
    SID_V1_CONTROL = SID_V1_CONTROL | $01
  else if voice == 2 then
    SID_V2_CONTROL = SID_V2_CONTROL | $01
  else if voice == 3 then
    SID_V3_CONTROL = SID_V3_CONTROL | $01
  end if
end function

export function gateOff(voice: byte): void
  // Turn voice gate off (stop playing note)
  if voice == 1 then
    SID_V1_CONTROL = SID_V1_CONTROL & $FE
  else if voice == 2 then
    SID_V2_CONTROL = SID_V2_CONTROL & $FE
  else if voice == 3 then
    SID_V3_CONTROL = SID_V3_CONTROL & $FE
  end if
end function

export function setADSR(voice: byte, attack: byte, decay: byte, sustain: byte, release: byte): void
  // Set ADSR envelope parameters (0-15 for each parameter)
  var ad: byte = ((attack & $0F) << 4) | (decay & $0F)
  var sr: byte = ((sustain & $0F) << 4) | (release & $0F)

  if voice == 1 then
    SID_V1_ATTACK_DECAY = ad
    SID_V1_SUSTAIN_RELEASE = sr
  else if voice == 2 then
    SID_V2_ATTACK_DECAY = ad
    SID_V2_SUSTAIN_RELEASE = sr
  else if voice == 3 then
    SID_V3_ATTACK_DECAY = ad
    SID_V3_SUSTAIN_RELEASE = sr
  end if
end function

export function setMasterVolume(volume: byte): void
  // Set master volume (0-15)
  var filterMode: byte = SID_FILTER_MODE_VOLUME & $F0
  SID_FILTER_MODE_VOLUME = filterMode | (volume & $0F)
end function

export function playNote(voice: byte, frequency: word, waveform: byte): void
  // Convenience function to play a note
  setFrequency(voice, frequency)
  setWaveform(voice, waveform)
  gateOn(voice)
end function

export function stopNote(voice: byte): void
  // Convenience function to stop a note
  gateOff(voice)
end function

export function getRandom(): byte
  // Get random number from SID oscillator 3
  return SID_OSC3_RANDOM
end function

// Music note frequencies (approximate values for C64)
export const var NOTE_C4: word = 16744
export const var NOTE_D4: word = 18794
export const var NOTE_E4: word = 21096
export const var NOTE_F4: word = 22351
export const var NOTE_G4: word = 25087
export const var NOTE_A4: word = 28160
export const var NOTE_B4: word = 31608
```

#### C64 Input Control Implementation
```js
// platform-libs/c64/cia.blend
module c64.cia

/*
 * Commodore 64 CIA (Complex Interface Adapter) Control Library
 * Hardware: CIA1 and CIA2 chips for input, timers, and I/O
 * CIA1: $DC00-$DCFF (keyboard, joysticks, timers)
 * CIA2: $DD00-$DDFF (serial, user port, memory banking)
 */

// ===== CIA1 REGISTERS (Input and Timers) =====
io var CIA1_DATA_PORT_A = $DC00      // Data port A (keyboard columns)
io var CIA1_DATA_PORT_B = $DC01      // Data port B (keyboard rows, joystick)
io var CIA1_DATA_DIRECTION_A = $DC02 // Data direction register A
io var CIA1_DATA_DIRECTION_B = $DC03 // Data direction register B
io var CIA1_TIMER_A_LO = $DC04       // Timer A low byte
io var CIA1_TIMER_A_HI = $DC05       // Timer A high byte
io var CIA1_TIMER_B_LO = $DC06       // Timer B low byte
io var CIA1_TIMER_B_HI = $DC07       // Timer B high byte
io var CIA1_TOD_10THS = $DC08        // Time of day: 10ths of seconds
io var CIA1_TOD_SECONDS = $DC09      // Time of day: seconds
io var CIA1_TOD_MINUTES = $DC0A      // Time of day: minutes
io var CIA1_TOD_HOURS = $DC0B        // Time of day: hours
io var CIA1_SERIAL_DATA = $DC0C      // Serial data register
io var CIA1_INTERRUPT_CONTROL = $DC0D // Interrupt control register
io var CIA1_CONTROL_A = $DC0E        // Timer A control register
io var CIA1_CONTROL_B = $DC0F        // Timer B control register

// ===== INPUT API =====

export function readJoystick(port: byte): byte
  // Read joystick input (port 1 or 2)
  var input: byte

  if port == 1 then
    // Joystick 1 connected to CIA1 port B
    input = CIA1_DATA_PORT_B
  else if port == 2 then
    // Joystick 2 connected to CIA1 port A
    input = CIA1_DATA_PORT_A
  else
    return $FF  // Invalid port
  end if

  // Invert bits (joystick inputs are active low)
  return ~input & $1F
end function

export function joystickUp(port: byte): boolean
  var input: byte = readJoystick(port)
  return (input & $01) != 0
end function

export function joystickDown(port: byte): boolean
  var input: byte = readJoystick(port)
  return (input & $02) != 0
end function

export function joystickLeft(port: byte): boolean
  var input: byte = readJoystick(port)
  return (input & $04) != 0
end function

export function joystickRight(port: byte): boolean
  var input: byte = readJoystick(port)
  return (input & $08) != 0
end function

export function joystickFire(port: byte): boolean
  var input: byte = readJoystick(port)
  return (input & $10) != 0
end function

export function readKeyboard(): byte
  // Basic keyboard scanning - simplified for common keys
  // Returns scan code of pressed key, 0 if none
  var row: byte
  var column: byte
  var result: byte = 0

  // Set all columns as outputs, all low
  CIA1_DATA_DIRECTION_A = $FF
  CIA1_DATA_PORT_A = $00

  // Read all rows
  result = ~CIA1_DATA_PORT_B & $FF

  // Restore CIA1 for normal operation
  CIA1_DATA_DIRECTION_A = $00

  return result
end function

export function keyPressed(scanCode: byte): boolean
  // Check if specific key is pressed (simplified)
  var keyboard: byte = readKeyboard()
  return (keyboard & (1 << scanCode)) != 0
end function

export function setTimer(timer: byte, cycles: word): void
  // Set CIA timer (timer A=0, timer B=1)
  if timer == 0 then
    CIA1_TIMER_A_LO = cycles & $FF
    CIA1_TIMER_A_HI = cycles >> 8
  else if timer == 1 then
    CIA1_TIMER_B_LO = cycles & $FF
    CIA1_TIMER_B_HI = cycles >> 8
  end if
end function

export function startTimer(timer: byte): void
  // Start CIA timer
  if timer == 0 then
    CIA1_CONTROL_A = CIA1_CONTROL_A | $01  // Set start bit
  else if timer == 1 then
    CIA1_CONTROL_B = CIA1_CONTROL_B | $01  // Set start bit
  end if
end function

export function stopTimer(timer: byte): void
  // Stop CIA timer
  if timer == 0 then
    CIA1_CONTROL_A = CIA1_CONTROL_A & $FE  // Clear start bit
  else if timer == 1 then
    CIA1_CONTROL_B = CIA1_CONTROL_B & $FE  // Clear start bit
  end if
end function
```

#### Success Criteria for Task B.2
- [ ] Complete C64 sprite control library with all VIC-II registers
- [ ] Full graphics control library with screen modes and scrolling
- [ ] Comprehensive sound library with 3-voice SID control
- [ ] Complete input library with joystick and keyboard support
- [ ] Timer and interrupt control through CIA chips
- [ ] Hardware register documentation and usage examples
- [ ] Integration testing with platform library compilation

### **Task B.3: Multi-Platform Library Architecture**
**File:** `platform-libs/` directory structure
**Duration:** 1 week

#### Cross-Platform Abstraction Layer
```js
// platform-libs/common/graphics.blend
module platform.graphics

/*
 * Cross-Platform Graphics Abstraction
 * Provides consistent API across all supported platforms
 * Implementation imported based on compilation target
 */

// Platform-specific implementations
import * from c64.sprites when target == "c64"
import * from vic20.sprites when target == "vic20"
import * from x16.vera.sprites when target == "x16"

// Generic graphics API that works on all platforms
export function initGraphics(): void
  // Platform-specific initialization
end function

export function setPixel(x: byte, y: byte, color: byte): void
  // Set individual pixel - platform optimized implementation
end function

export function clearScreen(color: byte): void
  // Clear screen with specified color
end function

export function drawLine(x1: byte, y1: byte, x2: byte, y2: byte, color: byte): void
  // Draw line using platform-optimized algorithm
end function

// Sprite abstraction (maps to platform capabilities)
export function createSprite(id: byte): void
export function moveSprite(id: byte, x: word, y: byte): void
export function colorSprite(id: byte, color: byte): void
export function showSprite(id: byte): void
export function hideSprite(id: byte): void
```

#### Platform-Specific Implementations
```js
// platform-libs/vic20/sprites.blend - VIC-20 implementation (limited sprites)
module vic20.sprites

// VIC-20 has very limited sprite capabilities compared to C64
io var VIC_BACKGROUND = $900F
io var VIC_BORDER = $900F

export function setSpritePosition(spriteId: byte, x: word, y: byte): void
  // VIC-20 doesn't have hardware sprites - use character graphics
  // This would implement sprite emulation using character mode
end function

export function setSpriteColor(spriteId: byte, color: byte): void
  // Implement using VIC-20 color capabilities
end function
```

```js
// platform-libs/x16/vera/sprites.blend - Commander X16 advanced sprites
module x16.vera.sprites

// Commander X16 VERA has advanced sprite capabilities
io var VERA_CTRL = $9F20
io var VERA_ADDR_LOW = $9F20
io var VERA_ADDR_MID = $9F21
io var VERA_ADDR_HIGH = $9F22
io var VERA_DATA0 = $9F23
io var VERA_DATA1 = $9F24

export function setSpritePosition(spriteId: byte, x: word, y: word): void
  // X16 supports higher resolution and more sprites than C64
  // Implement using VERA graphics system
end function

export function setSpriteLayer(spriteId: byte, layer: byte): void
  // X16 supports multiple graphics layers
end function

export function setSpriteZDepth(spriteId: byte, depth: byte): void
  // X16 supports z-depth ordering
end function
```

#### Build System Integration
```typescript
// Platform library compilation configuration
export interface PlatformLibraryConfig {
  target: Platform;
  platformLibs: string[];       // Platform-specific libraries to include
  commonLibs: string[];         // Cross-platform libraries to include
  hardwareMappings: HardwareMapping[];
  optimizationSettings: OptimizationConfig;
}

// Example configurations
export const C64_CONFIG: PlatformLibraryConfig = {
  target: 'c64',
  platformLibs: [
    'platform-libs/c64/sprites.blend',
    'platform-libs/c64/vic.blend',
    'platform-libs/c64/sid.blend',
    'platform-libs/c64/cia.blend'
  ],
  commonLibs: [
    'platform-libs/common/math.blend',
    'platform-libs/common/graphics.blend'
  ],
  hardwareMappings: C64_HARDWARE_MAP,
  optimizationSettings: C64_OPTIMIZATION_CONFIG
};
```

#### Success Criteria for Task B.3
- [ ] Cross-platform abstraction layer working across C64/VIC-20/X16
- [ ] Platform-specific implementations for each target
- [ ] Build system integration for platform library selection
- [ ] Consistent API while leveraging platform capabilities
- [ ] Performance optimization per platform

---

## Phase C: Game Development Library Ecosystem
**Duration:** 4-5 weeks
**Goal:** Create sophisticated game development libraries enabling Elite-level 3D, Last Ninja isometric, and advanced AI systems

### **Task C.1: 3D Graphics Mathematics Library**
**File:** `game-libs/graphics/graphics3d.blend`
**Duration:** 2 weeks

#### Elite-Style 3D Wireframe Mathematics
```js
// game-libs/graphics/graphics3d.blend
module game.graphics.graphics3d

/*
 * Elite-Style 3D Wireframe Graphics Library
 * Enables complex 3D wireframe rendering on 6502 systems
 * Optimized for real-time performance with fixed-point mathematics
 */

import sin, cos from common.math
import setPixel, drawLine from platform.graphics

// 3D coordinate system using fixed-point arithmetic (8.8 format)
type FixedPoint = word  // 8 bits integer, 8 bits fractional

// 3D vector representation
type Vector3D
  x: FixedPoint
  y: FixedPoint
  z: FixedPoint
end type

// 3D transformation matrix (3x3)
type Matrix3D
  m11: FixedPoint; m12: FixedPoint; m13: FixedPoint
  m21: FixedPoint; m22: FixedPoint; m23: FixedPoint
  m31: FixedPoint; m32: FixedPoint; m33: FixedPoint
end type

// 3D object definition
type Object3D
  vertices: Vector3D[32]    // Maximum 32 vertices per object
  edges: byte[64]           // Edge connections (pairs of vertex indices)
  vertexCount: byte
  edgeCount: byte
  position: Vector3D
  rotation: Vector3D
end type

// Global transformation matrices
var worldMatrix: Matrix3D
var viewMatrix: Matrix3D
var projectionMatrix: Matrix3D

// Screen projection constants
const var SCREEN_CENTER_X: byte = 160
const var SCREEN_CENTER_Y: byte = 100
const var PROJECTION_DISTANCE: FixedPoint = 256  // Fixed-point 1.0

export function initGraphics3D(): void
  // Initialize 3D graphics system
  setIdentityMatrix(worldMatrix)
  setIdentityMatrix(viewMatrix)
  setupProjectionMatrix()
end function

export function setIdentityMatrix(matrix: Matrix3D): void
  // Set matrix to identity
  matrix.m11 = 256; matrix.m12 = 0; matrix.m13 = 0    // 1.0 in fixed-point
  matrix.m21 = 0; matrix.m22 = 256; matrix.m23 = 0
  matrix.m31 = 0; matrix.m32 = 0; matrix.m33 = 256
end function

export function setupProjectionMatrix(): void
  // Setup perspective projection matrix
  setIdentityMatrix(projectionMatrix)
  // Perspective projection setup
end function

export function rotateMatrixX(matrix: Matrix3D, angle: byte): void
  // Rotate matrix around X axis using lookup table
  var cosAngle: FixedPoint = cos(angle)
  var sinAngle: FixedPoint = sin(angle)

  // Apply X rotation to matrix
  var temp22: FixedPoint = (matrix.m22 * cosAngle - matrix.m23 * sinAngle) >> 8
  var temp23: FixedPoint = (matrix.m22 * sinAngle + matrix.m23 * cosAngle) >> 8
  var temp32: FixedPoint = (matrix.m32 * cosAngle - matrix.m33 * sinAngle) >> 8
  var temp33: FixedPoint = (matrix.m32 * sinAngle + matrix.m33 * cosAngle) >> 8

  matrix.m22 = temp22; matrix.m23 = temp23
  matrix.m32 = temp32; matrix.m33 = temp33
end function

export function rotateMatrixY(matrix: Matrix3D, angle: byte): void
  // Rotate matrix around Y axis
  var cosAngle: FixedPoint = cos(angle)
  var sinAngle: FixedPoint = sin(angle)

  var temp11: FixedPoint = (matrix.m11 * cosAngle + matrix.m13 * sinAngle) >> 8
  var temp13: FixedPoint = (-matrix.m11 * sinAngle + matrix.m13 * cosAngle) >> 8
  var temp31: FixedPoint = (matrix.m31 * cosAngle + matrix.m33 * sinAngle) >> 8
  var temp33: FixedPoint = (-matrix.m31 * sinAngle + matrix.m33 * cosAngle) >> 8

  matrix.m11 = temp11; matrix.m13 = temp13
  matrix.m31 = temp31; matrix.m33 = temp33
end function

export function rotateMatrixZ(matrix: Matrix3D, angle: byte): void
  // Rotate matrix around Z axis
  var cosAngle: FixedPoint = cos(angle)
  var sinAngle: FixedPoint = sin(angle)

  var temp11: FixedPoint = (matrix.m11 * cosAngle - matrix.m12 * sinAngle) >> 8
  var temp12: FixedPoint = (matrix.m11 * sinAngle + matrix.m12 * cosAngle) >> 8
  var temp21: FixedPoint = (matrix.m21 * cosAngle - matrix.m22 * sinAngle) >> 8
  var temp22: FixedPoint = (matrix.m21 * sinAngle + matrix.m22 * cosAngle) >> 8

  matrix.m11 = temp11; matrix.m12 = temp12
  matrix.m21 = temp21; matrix.m22 = temp22
end function

export function transformVector(vector: Vector3D, matrix: Matrix3D): Vector3D
  // Transform vector by matrix
  var result: Vector3D

  result.x = ((matrix.m11 * vector.x + matrix.m12 * vector.y + matrix.m13 * vector.z) >> 8)
  result.y = ((matrix.m21 * vector.x + matrix.m22 * vector.y + matrix.m23 * vector.z) >> 8)
  result.z = ((matrix.m31 * vector.x + matrix.m32 * vector.y + matrix.m33 * vector.z) >> 8)

  return result
end function

export function projectTo2D(vector3D: Vector3D): Vector2D
  // Project 3D point to 2D screen coordinates
  var result: Vector2D

  // Perspective division
  if vector3D.z > 32 then  // Avoid division by zero/very small numbers
    result.x = SCREEN_CENTER_X + ((vector3D.x * PROJECTION_DISTANCE) / vector3D.z)
    result.y = SCREEN_CENTER_Y - ((vector3D.y * PROJECTION_DISTANCE) / vector3D.z)
  else
    // Point is too close or behind camera
    result.x = SCREEN_CENTER_X
    result.y = SCREEN_CENTER_Y
  end if

  return result
end function

export function renderObject3D(object: Object3D): void
  // Render 3D wireframe object
  var transformedVertices: Vector3D[32]
  var screenVertices: Vector2D[32]
  var i: byte
  var edge: byte
  var v1: byte
  var v2: byte

  // Transform all vertices
  for i = 0 to object.vertexCount - 1
    // Apply object position
    var worldVertex: Vector3D
    worldVertex.x = object.vertices[i].x + object.position.x
    worldVertex.y = object.vertices[i].y + object.position.y
    worldVertex.z = object.vertices[i].z + object.position.z

    // Apply world transformation
    transformedVertices[i] = transformVector(worldVertex, worldMatrix)

    // Project to 2D
    screenVertices[i] = projectTo2D(transformedVertices[i])
  next i

  // Draw all edges
  for edge = 0 to object.edgeCount - 1 step 2
    v1 = object.edges[edge]
    v2 = object.edges[edge + 1]

    // Draw line between vertices
    drawLine(screenVertices[v1].x, screenVertices[v1].y,
             screenVertices[v2].x, screenVertices[v2].y, 1)
  next edge
end function

// Predefined 3D objects
export function createCube(): Object3D
  // Create a simple cube object
  var cube: Object3D

  // Define cube vertices (-1 to +1 in each dimension, fixed-point format)
  cube.vertices[0] = {x: -128, y: -128, z: -128}  // -0.5 in fixed-point
  cube.vertices[1] = {x: 128, y: -128, z: -128}   //  0.5 in fixed-point
  cube.vertices[2] = {x: 128, y: 128, z: -128}
  cube.vertices[3] = {x: -128, y: 128, z: -128}
  cube.vertices[4] = {x: -128, y: -128, z: 128}
  cube.vertices[5] = {x: 128, y: -128, z: 128}
  cube.vertices[6] = {x: 128, y: 128, z: 128}
  cube.vertices[7] = {x: -128, y: 128, z: 128}
  cube.vertexCount = 8

  // Define cube edges (pairs of vertex indices)
  cube.edges[0] = 0; cube.edges[1] = 1    // Bottom face
  cube.edges[2] = 1; cube.edges[3] = 2
  cube.edges[4] = 2; cube.edges[5] = 3
  cube.edges[6] = 3; cube.edges[7] = 0
  cube.edges[8] = 4; cube.edges[9] = 5    // Top face
  cube.edges[10] = 5; cube.edges[11] = 6
  cube.edges[12] = 6; cube.edges[13] = 7
  cube.edges[14] = 7; cube.edges[15] = 4
  cube.edges[16] = 0; cube.edges[17] = 4  // Vertical edges
  cube.edges[18] = 1; cube.edges[19] = 5
  cube.edges[20] = 2; cube.edges[21] = 6
  cube.edges[22] = 3; cube.edges[23] = 7
  cube.edgeCount = 24

  // Initialize position and rotation
  cube.position = {x: 0, y: 0, z: 512}  // 2.0 units away
  cube.rotation = {x: 0, y: 0, z: 0}

  return cube
end function

export function createSpaceship(): Object3D
  // Create Elite-style spaceship wireframe
  var ship: Object3D

  // Define spaceship vertices (distinctive Elite-style shape)
  ship.vertices[0] = {x: 0, y: 64, z: 128}      // Nose
  ship.vertices[1] = {x: -64, y: -32, z: -64}   // Left wing back
  ship.vertices[2] = {x: 64, y: -32, z: -64}    // Right wing back
  ship.vertices[3] = {x: -32, y: 0, z: -128}    // Left engine
  ship.vertices[4] = {x: 32, y: 0, z: -128}     // Right engine
  ship.vertices[5] = {x: 0, y: -16, z: -64}     // Center bottom
  ship.vertexCount = 6

  // Define spaceship edges for classic look
  ship.edges[0] = 0; ship.edges[1] = 1    // Nose to left wing
  ship.edges[2] = 0; ship.edges[3] = 2    // Nose to right wing
  ship.edges[4] = 1; ship.edges[5] = 3    // Left wing to engine
  ship.edges[6] = 2; ship.edges[7] = 4    // Right wing to engine
  ship.edges[8] = 1; ship.edges[9] = 5    // Left wing to center
  ship.edges[10] = 2; ship.edges[11] = 5  // Right wing to center
  ship.edges[12] = 3; ship.edges[13] = 4  // Engine connection
  ship.edges[14] = 5; ship.edges[15] = 3  // Center to left engine
  ship.edges[16] = 5; ship.edges[17] = 4  // Center to right engine
  ship.edgeCount = 18

  // Initialize position and rotation
  ship.position = {x: 0, y: 0, z: 768}   // 3.0 units away
  ship.rotation = {x: 0, y: 0, z: 0}

  return ship
end function
```

#### Success Criteria for Task C.1
- [ ] Complete 3D mathematics library with fixed-point arithmetic
- [ ] Elite-style wireframe rendering working on 6502
- [ ] 3D transformation and projection systems
- [ ] Predefined 3D objects (cube, spaceship, complex shapes)
- [ ] Performance optimized for real-time rendering
- [ ] Integration with platform graphics libraries

### **Task C.2: Isometric Graphics Library**
**File:** `game-libs/graphics/isometric.blend`
**Duration:** 1.5 weeks

#### Last Ninja-Style Isometric Projection
```js
// game-libs/graphics/isometric.blend
module game.graphics.isometric

/*
 * Last Ninja-Style Isometric Graphics Library
 * Advanced isometric projection and world management
 * Optimized for complex 3D worlds rendered in 2D
 */

import drawLine, setPixel from platform.graphics
import sin, cos from common.math

// Isometric projection constants (optimized for 6502)
const var ISO_ANGLE: byte = 30          // 30-degree isometric projection
const var ISO_SCALE: word = 256         // Fixed-point scale factor
const var ISO_COS_30: word = 221        // cos(30°) * 256 = 0.866 * 256
const var ISO_SIN_30: word = 128        // sin(30°) * 256 = 0.5 * 256

// 3D world coordinate (integer coordinates for tiles/objects)
type IsoPoint3D
  x: byte    // World X coordinate
  y: byte    // World Y coordinate
  z: byte    // Height/elevation
end type

// 2D screen coordinate
type IsoPoint2D
  x: word    // Screen X coordinate
  y: word    // Screen Y coordinate
end type

// Isometric tile definition
type IsoTile
  tileType: byte        // Tile type identifier
  height: byte          // Tile height (0-15)
  solid: boolean        // Can objects walk through?
  textureId: byte       // Texture/sprite to render
end type

// Isometric world map
type IsoWorld
  tiles: IsoTile[64][64]  // 64x64 tile world
  width: byte
  height: byte
  cameraX: word           // Camera position
  cameraY: word
  cameraZ: byte
end type

// Global isometric world
var currentWorld: IsoWorld

export function initIsometricGraphics(): void
  // Initialize isometric graphics system
  currentWorld.width = 64
  currentWorld.height = 64
  currentWorld.cameraX = 0
  currentWorld.cameraY = 0
  currentWorld.cameraZ = 0
end function

export function worldToScreen(world: IsoPoint3D): IsoPoint2D
  // Convert 3D world coordinates to 2D isometric screen coordinates
  var screen: IsoPoint2D
  var adjustedX: word = world.x - currentWorld.cameraX
  var adjustedY: word = world.y - currentWorld.cameraY
  var adjustedZ: word = world.z - currentWorld.cameraZ

  // Isometric projection formula
  // screen.x = (world.x - world.y) * cos(30°)
  // screen.y = (world.x + world.y) * sin(30°) - world.z

  screen.x = ((adjustedX - adjustedY) * ISO_COS_30) >> 8
  screen.y = ((adjustedX + adjustedY) * ISO_SIN_30) >> 8
  screen.y -= adjustedZ * 2  // Height scaling

  // Add screen center offset
  screen.x += 160  // Center of screen
  screen.y += 100

  return screen
end function

export function screenToWorld(screen: IsoPoint2D): IsoPoint3D
  // Convert 2D screen coordinates back to 3D world coordinates (for collision)
  var world: IsoPoint3D
  var adjustedX: word = screen.x - 160
  var adjustedY: word = screen.y - 100

  // Inverse isometric projection (approximate)
  world.x = ((adjustedX + adjustedY * 2) / ISO_COS_30) + currentWorld.cameraX
  world.y = ((adjustedY * 2 - adjustedX) / ISO_COS_30) + currentWorld.cameraY
  world.z = currentWorld.cameraZ  // Assume ground level

  return world
end function

export function renderIsoTile(worldX: byte, worldY: byte): void
  // Render a single isometric tile
  var tile: IsoTile = currentWorld.tiles[worldX][worldY]
  var worldPos: IsoPoint3D = {x: worldX, y: worldY, z: 0}
  var screenPos: IsoPoint2D = worldToScreen(worldPos)

  // Draw tile base (diamond shape for isometric view)
  drawIsometricDiamond(screenPos.x, screenPos.y, tile.textureId)

  // Draw height layers if tile has elevation
  if tile.height > 0 then
    for layer = 1 to tile.height
      var heightPos: IsoPoint3D = {x: worldX, y: worldY, z: layer}
      var heightScreen: IsoPoint2D = worldToScreen(heightPos)
      drawIsometricDiamond(heightScreen.x, heightScreen.y, tile.textureId + 1)
    next layer
  end if
end function

function drawIsometricDiamond(centerX: word, centerY: word, textureId: byte): void
  // Draw isometric diamond tile (simple wireframe version)
  var tileWidth: byte = 32
  var tileHeight: byte = 16

  // Draw diamond outline
  drawLine(centerX - tileWidth/2, centerY, centerX, centerY - tileHeight/2, textureId)  // Top-left
  drawLine(centerX, centerY - tileHeight/2, centerX + tileWidth/2, centerY, textureId)  // Top-right
  drawLine(centerX + tileWidth/2, centerY, centerX, centerY + tileHeight/2, textureId)  // Bottom-right
  drawLine(centerX, centerY + tileHeight/2, centerX - tileWidth/2, centerY, textureId)  // Bottom-left
end function

export function renderIsoWorld(startX: byte, startY: byte, viewWidth: byte, viewHeight: byte): void
  // Render visible portion of isometric world
  var x: byte
  var y: byte

  // Render from back to front for proper depth sorting
  for y = startY + viewHeight - 1 to startY step -1
    for x = startX to startX + viewWidth - 1
      if x < currentWorld.width and y < currentWorld.height then
        renderIsoTile(x, y)
      end if
    next x
  next y
end function

export function moveIsoCamera(deltaX: word, deltaY: word, deltaZ: byte): void
  // Move isometric camera
  currentWorld.cameraX += deltaX
  currentWorld.cameraY += deltaY
  currentWorld.cameraZ += deltaZ

  // Keep camera in bounds
  if currentWorld.cameraX < 0 then currentWorld.cameraX = 0
  if currentWorld.cameraY < 0 then currentWorld.cameraY = 0
  if currentWorld.cameraX > (currentWorld.width - 20) * 16 then
    currentWorld.cameraX = (currentWorld.width - 20) * 16
  end if
  if currentWorld.cameraY > (currentWorld.height - 15) * 16 then
    currentWorld.cameraY = (currentWorld.height - 15) * 16
  end if
end function

export function setIsoTile(worldX: byte, worldY: byte, tileType: byte, height: byte): void
  // Set tile in isometric world
  if worldX < currentWorld.width and worldY < currentWorld.height then
    currentWorld.tiles[worldX][worldY].tileType = tileType
    currentWorld.tiles[worldX][worldY].height = height
    currentWorld.tiles[worldX][worldY].textureId = tileType
    currentWorld.tiles[worldX][worldY].solid = (height > 0)
  end if
end function

export function getIsoTile(worldX: byte, worldY: byte): IsoTile
  // Get tile from isometric world
  if worldX < currentWorld.width and worldY < currentWorld.height then
    return currentWorld.tiles[worldX][worldY]
  end if

  // Return empty tile for out of bounds
  var emptyTile: IsoTile = {tileType: 0, height: 0, solid: false, textureId: 0}
  return emptyTile
end function

export function checkIsoCollision(worldX: byte, worldY: byte, objectHeight: byte): boolean
  // Check collision with isometric world
  var tile: IsoTile = getIsoTile(worldX, worldY)
  return tile.solid and (tile.height >= objectHeight)
end function
```

#### Success Criteria for Task C.2
- [ ] Complete isometric projection mathematics
- [ ] Last Ninja-style world rendering system
- [ ] Isometric tile management and world maps
- [ ] Camera control and view management
- [ ] Collision detection in isometric space
- [ ] Performance optimized for complex worlds

### **Task C.3: AI and Pathfinding Libraries**
**File:** `game-libs/ai/` directory
**Duration:** 1.5 weeks

#### Advanced AI System Implementation
```js
// game-libs/ai/pathfinding.blend
module game.ai.pathfinding

/*
 * Advanced Pathfinding Library
 * A* pathfinding, flood-fill algorithms, and maze solving
 * Optimized for 6502 performance with memory-conscious design
 */

import getIsoTile, checkIsoCollision from game.graphics.isometric

// Pathfinding node for A* algorithm
type PathNode
  x: byte
  y: byte
  gCost: word      // Distance from start
  hCost: word      // Heuristic distance to goal
  fCost: word      // gCost + hCost
  parent: byte     // Index of parent node
  inOpenSet: boolean
  inClosedSet: boolean
end type

// Pathfinding result
type PathResult
  found: boolean
  pathLength: byte
  path: PathNode[32]   // Maximum path length
end type

// Global pathfinding data (memory-conscious)
var pathNodes: PathNode[256]    // Node pool
var openSet: byte[64]          // Open set indices
var openSetSize: byte
var nodeCount: byte

export function findPath(startX: byte, startY: byte, goalX: byte, goalY: byte): PathResult
  // A* pathfinding algorithm optimized for 6502
  var result: PathResult
  var current: byte
  var neighbor: byte
  var i: byte

  // Initialize pathfinding
  initPathfinding()

  // Add start node
  var startNode: byte = createPathNode(startX, startY, 0, heuristicDistance(startX, startY, goalX, goalY), 255)
  addToOpenSet(startNode)

  while openSetSize > 0
    // Get node with lowest F cost
    current = getBestNode()
    removeFromOpenSet(current)
    pathNodes[current].inClosedSet = true

    // Check if we reached the goal
    if pathNodes[current].x == goalX and pathNodes[current].y == goalY then
      result.found = true
      result.pathLength = reconstructPath(current, result.path)
      return result
    end if

    // Check all neighbors
    for i = 0 to 7  // 8-directional movement
      neighbor = getNeighbor(current, i, goalX, goalY)
      if neighbor != 255 then  // Valid neighbor
        processNeighbor(current, neighbor)
      end if
    next i
  end while

  // No path found
  result.found = false
  result.pathLength = 0
  return result
end function

function heuristicDistance(x1: byte, y1: byte, x2: byte, y2: byte): word
  // Manhattan distance heuristic (fast for 6502)
  var dx: byte = x1 > x2 ? x1 - x2 : x2 - x1
  var dy: byte = y1 > y2 ? y1 - y2 : y2 - y1
  return dx + dy
end function

function createPathNode(x: byte, y: byte, gCost: word, hCost: word, parent: byte): byte
  // Create new pathfinding node
  if nodeCount >= 255 then return 255  // Node pool full

  pathNodes[nodeCount].x = x
  pathNodes[nodeCount].y = y
  pathNodes[nodeCount].gCost = gCost
  pathNodes[nodeCount].hCost = hCost
  pathNodes[nodeCount].fCost = gCost + hCost
  pathNodes[nodeCount].parent = parent
  pathNodes[nodeCount].inOpenSet = false
  pathNodes[nodeCount].inClosedSet = false

  nodeCount += 1
  return nodeCount - 1
end function

function addToOpenSet(nodeIndex: byte): void
  // Add node to open set
  if openSetSize < 64 then
    openSet[openSetSize] = nodeIndex
    pathNodes[nodeIndex].inOpenSet = true
    openSetSize += 1
  end if
end function

function getBestNode(): byte
  // Get node with lowest F cost from open set
  var bestIndex: byte = 0
  var bestFCost: word = pathNodes[openSet[0]].fCost
  var i: byte

  for i = 1 to openSetSize - 1
    if pathNodes[openSet[i]].fCost < bestFCost then
      bestFCost = pathNodes[openSet[i]].fCost
      bestIndex = i
    end if
  next i

  return openSet[bestIndex]
end function

function removeFromOpenSet(nodeIndex: byte): void
  // Remove node from open set
  var i: byte
  var found: boolean = false

  for i = 0 to openSetSize - 1
    if openSet[i] == nodeIndex then
      found = true
    end if

    if found and i < openSetSize - 1 then
      openSet[i] = openSet[i + 1]
    end if
  next i

  if found then
    openSetSize -= 1
    pathNodes[nodeIndex].inOpenSet = false
  end if
end function

function getNeighbor(nodeIndex: byte, direction: byte, goalX: byte, goalY: byte): byte
  // Get neighbor node in specified direction
  var x: byte = pathNodes[nodeIndex].x
  var y: byte = pathNodes[nodeIndex].y
  var newX: byte
  var newY: byte
  var gCost: word

  // Calculate neighbor position based on direction
  match direction
    case 0: newX = x - 1; newY = y - 1  // Northwest
    case 1: newX = x;     newY = y - 1  // North
    case 2: newX = x + 1; newY = y - 1  // Northeast
    case 3: newX = x + 1; newY = y      // East
    case 4: newX = x + 1; newY = y + 1  // Southeast
    case 5: newX = x;     newY = y + 1  // South
    case 6: newX = x - 1; newY = y + 1  // Southwest
    case 7: newX = x - 1; newY = y      // West
  end match

  // Check bounds and collision
  if newX >= 64 or newY >= 64 or checkIsoCollision(newX, newY, 1) then
    return 255  // Invalid neighbor
  end if

  // Calculate movement cost (diagonal = 14, straight = 10)
  gCost = pathNodes[nodeIndex].gCost
  if direction % 2 == 0 then
    gCost += 14  // Diagonal movement
  else
    gCost += 10  // Straight movement
  end if

  return createPathNode(newX, newY, gCost, heuristicDistance(newX, newY, goalX, goalY), nodeIndex)
end function

function processNeighbor(currentIndex: byte, neighborIndex: byte): void
  // Process neighbor node for A* algorithm
  if pathNodes[neighborIndex].inClosedSet then
    return  // Already processed
  end if

  if not pathNodes[neighborIndex].inOpenSet then
    addToOpenSet(neighborIndex)
  else
    // Check if this path to neighbor is better
    if pathNodes[neighborIndex].gCost > pathNodes[currentIndex].gCost + 10 then
      pathNodes[neighborIndex].parent = currentIndex
      pathNodes[neighborIndex].gCost = pathNodes[currentIndex].gCost + 10
      pathNodes[neighborIndex].fCost = pathNodes[neighborIndex].gCost + pathNodes[neighborIndex].hCost
    end if
  end if
end function

function reconstructPath(goalIndex: byte, path: PathNode[]): byte
  // Reconstruct path from goal to start
  var current: byte = goalIndex
  var pathLength: byte = 0

  while current != 255 and pathLength < 32
    path[pathLength] = pathNodes[current]
    current = pathNodes[current].parent
    pathLength += 1
  end while

  // Reverse path (currently goal to start, want start to goal)
  var i: byte
  var temp: PathNode

  for i = 0 to pathLength / 2 - 1
    temp = path[i]
    path[i] = path[pathLength - 1 - i]
    path[pathLength - 1 - i] = temp
  next i

  return pathLength
end function

function initPathfinding(): void
  // Initialize pathfinding system
  nodeCount = 0
  openSetSize = 0
  var i: byte

  for i = 0 to 255
    pathNodes[i].inOpenSet = false
    pathNodes[i].inClosedSet = false
  next i
end function
```

#### Behavior Tree AI System
```js
// game-libs/ai/behavior-trees.blend
module game.ai.behavior

/*
 * Behavior Tree AI System
 * Advanced AI decision making for complex game characters
 * Modular, reusable AI behaviors
 */

// Behavior tree node types
type BehaviorNodeType = byte
const var NODE_SELECTOR: BehaviorNodeType = 0     // OR node - succeeds if any child succeeds
const var NODE_SEQUENCE: BehaviorNodeType = 1     // AND node - succeeds only if all children succeed
const var NODE_ACTION: BehaviorNodeType = 2       // Leaf node - performs an action
const var NODE_CONDITION: BehaviorNodeType = 3    // Leaf node - tests a condition

// Behavior execution results
type BehaviorResult = byte
const var BEHAVIOR_SUCCESS: BehaviorResult = 0
const var BEHAVIOR_FAILURE: BehaviorResult = 1
const var BEHAVIOR_RUNNING: BehaviorResult = 2

// Behavior tree node
type BehaviorNode
  nodeType: BehaviorNodeType
  actionId: byte              // For action/condition nodes
  children: byte[4]           // Child node indices (max 4 children)
  childCount: byte
  currentChild: byte          // For sequence/selector execution
end type

// AI agent with behavior tree
type AIAgent
  x: byte
  y: byte
  health: byte
  state: byte
  behaviorTree: byte          // Root behavior node index
  target: byte               // Target agent index
  lastAction: byte
  cooldown: byte
end type

// Global AI data
var behaviorNodes: BehaviorNode[64]     // Behavior node pool
var nodeCount: byte
var aiAgents: AIAgent[16]               // Maximum 16 AI agents
var agentCount: byte

export function createAIAgent(x: byte, y: byte, behaviorTreeRoot: byte): byte
  // Create new AI agent
  if agentCount >= 16 then return 255

  aiAgents[agentCount].x = x
  aiAgents[agentCount].y = y
  aiAgents[agentCount].health = 100
  aiAgents[agentCount].state = 0
  aiAgents[agentCount].behaviorTree = behaviorTreeRoot
  aiAgents[agentCount].target = 255
  aiAgents[agentCount].lastAction = 0
  aiAgents[agentCount].cooldown = 0

  agentCount += 1
  return agentCount - 1
end function

export function updateAI(): void
  // Update all AI agents
  var i: byte

  for i = 0 to agentCount - 1
    if aiAgents[i].health > 0 then
      updateAgent(i)
    end if
  next i
end function

function updateAgent(agentIndex: byte): void
  // Update single AI agent
  var agent: AIAgent = aiAgents[agentIndex]

  // Decrease cooldown
  if agent.cooldown > 0 then
    agent.cooldown -= 1
  end if

  // Execute behavior tree
  var result: BehaviorResult = executeBehaviorNode(agent.behaviorTree, agentIndex)

  // Update agent state based on behavior result
  match result
    case BEHAVIOR_SUCCESS:
      agent.state = 1  // Action completed successfully
    case BEHAVIOR_FAILURE:
      agent.state = 2  // Action failed
    case BEHAVIOR_RUNNING:
      agent.state = 3  // Action still in progress
  end match

  aiAgents[agentIndex] = agent
end function

function executeBehaviorNode(nodeIndex: byte, agentIndex: byte): BehaviorResult
  // Execute behavior tree node
  var node: BehaviorNode = behaviorNodes[nodeIndex]
  var result: BehaviorResult
  var i: byte

  match node.nodeType
    case NODE_SELECTOR:
      // OR node - try each child until one succeeds
      for i = 0 to node.childCount - 1
        result = executeBehaviorNode(node.children[i], agentIndex)
        if result == BEHAVIOR_SUCCESS or result == BEHAVIOR_RUNNING then
          return result
        end if
      next i
      return BEHAVIOR_FAILURE

    case NODE_SEQUENCE:
      // AND node - execute children in sequence
      for i = 0 to node.childCount - 1
        result = executeBehaviorNode(node.children[i], agentIndex)
        if result == BEHAVIOR_FAILURE or result == BEHAVIOR_RUNNING then
          return result
        end if
      next i
      return BEHAVIOR_SUCCESS

    case NODE_ACTION:
      // Execute action
      return executeAction(node.actionId, agentIndex)

    case NODE_CONDITION:
      // Test condition
      return testCondition(node.actionId, agentIndex) ? BEHAVIOR_SUCCESS : BEHAVIOR_FAILURE
  end match

  return BEHAVIOR_FAILURE
end function

function executeAction(actionId: byte, agentIndex: byte): BehaviorResult
  // Execute AI action
  var agent: AIAgent = aiAgents[agentIndex]

  match actionId
    case 1: // Move towards target
      return moveTowardsTarget(agentIndex)
    case 2: // Attack target
      return attackTarget(agentIndex)
    case 3: // Flee from target
      return fleeFromTarget(agentIndex)
    case 4: // Search for target
      return searchForTarget(agentIndex)
    case 5: // Patrol area
      return patrolArea(agentIndex)
    case 6: // Rest/heal
      return restAndHeal(agentIndex)
  end match

  return BEHAVIOR_FAILURE
end function

function testCondition(conditionId: byte, agentIndex: byte): boolean
  // Test AI condition
  var agent: AIAgent = aiAgents[agentIndex]

  match conditionId
    case 1: // Has target
      return agent.target != 255
    case 2: // Target in range
      return isTargetInRange(agentIndex, 3)
    case 3: // Health low
      return agent.health < 30
    case 4: // Can see target
      return canSeeTarget(agentIndex)
    case 5: // Cooldown finished
      return agent.cooldown == 0
  end match

  return false
end function

function moveTowardsTarget(agentIndex: byte): BehaviorResult
  // Move AI agent towards target
  var agent: AIAgent = aiAgents[agentIndex]
  if agent.target == 255 then return BEHAVIOR_FAILURE

  var targetAgent: AIAgent = aiAgents[agent.target]
  var newX: byte = agent.x
  var newY: byte = agent.y

  // Simple movement towards target
  if targetAgent.x > agent.x then newX += 1
  else if targetAgent.x < agent.x then newX -= 1

  if targetAgent.y > agent.y then newY += 1
  else if targetAgent.y < agent.y then newY -= 1

  // Check collision
  if not checkIsoCollision(newX, newY, 1) then
    aiAgents[agentIndex].x = newX
    aiAgents[agentIndex].y = newY
    return BEHAVIOR_SUCCESS
  end if

  return BEHAVIOR_FAILURE
end function

function attackTarget(agentIndex: byte): BehaviorResult
  // Attack target
  var agent: AIAgent = aiAgents[agentIndex]
  if agent.target == 255 or agent.cooldown > 0 then
    return BEHAVIOR_FAILURE
  end if

  if isTargetInRange(agentIndex, 2) then
    // Deal damage to target
    aiAgents[agent.target].health -= 10
    aiAgents[agentIndex].cooldown = 30  // Attack cooldown
    return BEHAVIOR_SUCCESS
  end if

  return BEHAVIOR_FAILURE
end function

function isTargetInRange(agentIndex: byte, range: byte): boolean
  // Check if target is in range
  var agent: AIAgent = aiAgents[agentIndex]
  if agent.target == 255 then return false

  var targetAgent: AIAgent = aiAgents[agent.target]
  var dx: byte = agent.x > targetAgent.x ? agent.x - targetAgent.x : targetAgent.x - agent.x
  var dy: byte = agent.y > targetAgent.y ? agent.y - targetAgent.y : targetAgent.y - agent.y

  return (dx + dy) <= range
end function

function canSeeTarget(agentIndex: byte): boolean
  // Line of sight check (simplified)
  var agent: AIAgent = aiAgents[agentIndex]
  if agent.target == 255 then return false

  // For now, assume can always see if in range
  return isTargetInRange(agentIndex, 10)
end function

// Additional AI behaviors can be added here...
function fleeFromTarget(agentIndex: byte): BehaviorResult
  // Move away from target
  return BEHAVIOR_SUCCESS  // Placeholder implementation
end function

function searchForTarget(agentIndex: byte): BehaviorResult
  // Search for new target
  return BEHAVIOR_SUCCESS  // Placeholder implementation
end function

function patrolArea(agentIndex: byte): BehaviorResult
  // Patrol assigned area
  return BEHAVIOR_SUCCESS  // Placeholder implementation
end function

function restAndHeal(agentIndex: byte): BehaviorResult
  // Rest and recover health
  if aiAgents[agentIndex].health < 100 then
    aiAgents[agentIndex].health += 1
  end if
  return BEHAVIOR_SUCCESS
end function
```

#### Success Criteria for Task C.3
- [ ] Complete A* pathfinding algorithm optimized for 6502
- [ ] Behavior tree AI system with modular behaviors
- [ ] AI agent management and state machines
- [ ] Performance optimized for multiple AI agents
- [ ] Integration with isometric world system
- [ ] Extensible AI behavior library

---

## Phase D: IL Caching and Development Performance
**Duration:** 2-3 weeks
**Goal:** Implement IL caching system for incremental compilation and development performance optimization

### **Task D.1: IL Caching System Design**
**File:** `packages/il-cache/`
**Duration:** 1 week

#### Incremental Compilation Architecture
```typescript
// packages/il-cache/src/il-cache-manager.ts
export interface ILCacheEntry {
  sourceHash: string;
  dependencies: string[];
  ilProgram: ILProgram;
  optimizationLevel: OptimizationLevel;
  targetPlatform: Platform;
  timestamp: number;
  analysisResult: AnalysisResult;
}

export class ILCacheManager {
  async getCachedIL(
    sourceFile: string,
    dependencies: string[],
    optimizationLevel: OptimizationLevel,
    targetPlatform: Platform
  ): Promise<ILCacheEntry | null>

  async storeIL(
    sourceFile: string,
    dependencies: string[],
    ilProgram: ILProgram,
    analysisResult: AnalysisResult,
    optimizationLevel: OptimizationLevel,
    targetPlatform: Platform
  ): Promise<void>

  async invalidateCache(sourceFile: string): Promise<void>
  async cleanExpiredEntries(maxAge: number): Promise<void>
  async getCache: istics(): Promise<CacheStatistics>
}
```

#### Platform Library Caching
```typescript
// packages/il-cache/src/platform-library-cache.ts
export interface PlatformLibraryCacheEntry {
  libraryName: string;
  platform: Platform;
  sourceHash: string;
  ilModule: ILModule;
  optimizationMetadata: OptimizationMetadata;
  hardwareRegisterMap: HardwareRegisterMap;
  timestamp: number;
}

export class PlatformLibraryCache {
  async getCachedLibrary(
    libraryName: string,
    platform: Platform,
    sourceHash: string
  ): Promise<PlatformLibraryCacheEntry | null>

  async storePlatformLibrary(
    libraryName: string,
    platform: Platform,
    sourceHash: string,
    ilModule: ILModule,
    optimizationMetadata: OptimizationMetadata,
    hardwareRegisterMap: HardwareRegisterMap
  ): Promise<void>

  async invalidateLibrary(libraryName: string, platform: Platform): Promise<void>
}
```

#### Development Performance Optimization
```typescript
// packages/il-cache/src/incremental-compiler.ts
export class IncrementalCompiler {
  async compileProject(
    projectFiles: string[],
    platformLibraries: string[],
    target: Platform,
    optimizationLevel: OptimizationLevel
  ): Promise<CompilationResult>

  async compileFile(
    sourceFile: string,
    dependencies: string[],
    target: Platform,
    optimizationLevel: OptimizationLevel,
    useCache: boolean = true
  ): Promise<FileCompilationResult>

  async buildDependencyGraph(projectFiles: string[]): Promise<DependencyGraph>
  async invalidateChangedFiles(changedFiles: string[]): Promise<void>
  async warmCache(projectFiles: string[]): Promise<void>
}
```

#### Success Criteria for Task D.1
- [ ] Complete IL caching system with dependency tracking
- [ ] Platform library caching for cross-module optimization
- [ ] Incremental compilation reducing build times by 70-90%
- [ ] Development performance under 100ms for typical changes
- [ ] Cache invalidation and dependency management

### **Task D.2: Development Build Optimization**
**File:** `packages/dev-server/`
**Duration:** 1 week

#### Development Server with Hot Reloading
```typescript
// packages/dev-server/src/blend65-dev-server.ts
export class Blend65DevServer {
  async startServer(
    projectRoot: string,
    platformLibraryPath: string,
    port: number = 3000
  ): Promise<DevServerInstance>

  async watchFiles(patterns: string[]): Promise<FileWatcher>
  async handleFileChange(filePath: string, changeType: FileChangeType): Promise<void>
  async triggerRecompilation(affectedFiles: string[]): Promise<CompilationResult>
  async serveCompilationResults(): Promise<void>
}

export interface DevServerInstance {
  port: number;
  compilationStatus: CompilationStatus;
  lastCompileTime: number;
  cacheHitRate: number;
  stop(): Promise<void>;
}
```

#### Live Development Features
```typescript
// packages/dev-server/src/live-reload.ts
export class LiveReloadSystem {
  async enableLiveReload(
    gameExecutablePath: string,
    emulatorPath: string
  ): Promise<LiveReloadInstance>

  async reloadGame(
    compiledProgram: CompiledProgram,
    preserveState: boolean = true
  ): Promise<ReloadResult>

  async saveGameState(): Promise<GameState>
  async restoreGameState(state: GameState): Promise<void>
}
```

#### Success Criteria for Task D.2
- [ ] Development server with file watching and automatic recompilation
- [ ] Hot reloading for rapid game development iteration
- [ ] Live debugging and state preservation
- [ ] Sub-second compilation for development builds
- [ ] Integration with emulator for immediate testing

---

## Phase E: Integration Testing and Production Validation
**Duration:** 2-3 weeks
**Goal:** Comprehensive validation system ensuring production-ready platform library ecosystem

### **Task E.1: End-to-End Game Compilation Testing**
**File:** `packages/e2e-test/`
**Duration:** 1.5 weeks

#### Real Game Compilation Validation
```typescript
// packages/e2e-test/src/game-compilation-tester.ts
export class GameCompilationTester {
  async compileGame(
    gameSource: string,
    platformLibraries: string[],
    target: Platform
  ): Promise<GameCompilationResult>

  async validateGameExecution(
    compiledGame: CompiledGame,
    emulatorPath: string
  ): Promise<ExecutionValidationResult>

  async benchmarkGamePerformance(
    compiledGame: CompiledGame,
    benchmarkSuite: BenchmarkSuite
  ): Promise<PerformanceBenchmarkResult>
}
```

#### Target Game Validation Suite
```js
// Test games for end-to-end validation
export const E2E_GAME_TESTS = {
  // Simple arcade game
  SIMPLE_SNAKE: `
    module Game.Snake
    import setSpritePosition, enableSprite from c64.sprites
    import joystickLeft, joystickRight, joystickUp, joystickDown from c64.cia

    var snakeX: byte = 100
    var snakeY: byte = 100
    var direction: byte = 1

    function main(): void
      enableSprite(0)

      while true
        handleInput()
        updateSnake()
        setSpritePosition(0, snakeX, snakeY)
      end while
    end function

    function handleInput(): void
      if joystickUp(1) then direction = 0
      else if joystickRight(1) then direction = 1
      else if joystickDown(1) then direction = 2
      else if joystickLeft(1) then direction = 3
    end function

    function updateSnake(): void
      match direction
        case 0: snakeY = snakeY - 2
        case 1: snakeX = snakeX + 2
        case 2: snakeY = snakeY + 2
        case 3: snakeX = snakeX - 2
      end match

      // Wrap around screen
      if snakeX > 255 then snakeX = 0
      if snakeY > 255 then snakeY = 0
    end function
  `,

  // Complex isometric game
  ISOMETRIC_ADVENTURE: `
    module Game.IsoAdventure
    import * from game.graphics.isometric
    import * from game.ai.pathfinding
    import setSpritePosition from c64.sprites
    import joystickRead from c64.cia

    var playerX: byte = 32
    var playerY: byte = 32
    var enemies: byte[4] = [10, 20, 30, 40]

    function main(): void
      initIsometricGraphics()
      createWorld()

      while true
        handleInput()
        updateEnemyAI()
        renderWorld()
      end while
    end function

    function createWorld(): void
      var x: byte
      var y: byte

      for x = 0 to 63
        for y = 0 to 63
          if (x + y) % 8 == 0 then
            setIsoTile(x, y, 1, 2)  // Wall tiles
          else
            setIsoTile(x, y, 0, 0)  // Floor tiles
          end if
        next y
      next x
    end function

    function updateEnemyAI(): void
      var i: byte
      var path: PathResult

      for i = 0 to 3
        // Simple AI: move towards player
        path = findPath(enemies[i * 2], enemies[i * 2 + 1], playerX, playerY)
        if path.found and path.pathLength > 0 then
          enemies[i * 2] = path.path[1].x
          enemies[i * 2 + 1] = path.path[1].y
        end if
      next i
    end function
  `,

  // Elite-style 3D space game
  ELITE_3D_DEMO: `
    module Game.Elite3D
    import * from game.graphics.graphics3d
    import joystickRead from c64.cia
    import clearScreen from c64.vic

    var spaceship: Object3D
    var rotationX: byte = 0
    var rotationY: byte = 0
    var rotationZ: byte = 0

    function main(): void
      initGraphics3D()
      spaceship = createSpaceship()

      while true
        handleInput()
        updateRotation()
        renderScene()
      end while
    end function

    function handleInput(): void
      var input: byte = joystickRead(1)

      if (input & $01) != 0 then rotationX += 2  // Up
      if (input & $02) != 0 then rotationX -= 2  // Down
      if (input & $04) != 0 then rotationY -= 2  // Left
      if (input & $08) != 0 then rotationY += 2  // Right
    end function

    function updateRotation(): void
      rotateMatrixX(worldMatrix, rotationX)
      rotateMatrixY(worldMatrix, rotationY)
      rotateMatrixZ(worldMatrix, rotationZ)
    end function

    function renderScene(): void
      clearScreen(0)
      renderObject3D(spaceship)
    end function
  `
};
```

#### Success Criteria for Task E.1
- [ ] Complete games compile and execute successfully
- [ ] Performance benchmarking meets targets
- [ ] Emulator integration testing passes
- [ ] Real hardware validation (where possible)
- [ ] Game complexity stress testing

### **Task E.2: Quality Assurance Framework**
**File:** `packages/qa-framework/`
**Duration:** 1 week

#### Comprehensive Quality Validation
```typescript
// packages/qa-framework/src/quality-validator.ts
export class QualityValidator {
  async validateProjectQuality(): Promise<QualityReport>
  async validatePlatformLibraries(platform: Platform): Promise<LibraryQualityReport>
  async validateGameLibraries(): Promise<GameLibraryQualityReport>
  async validatePerformance(): Promise<PerformanceQualityReport>
  async validateSpecificationCompliance(): Promise<ComplianceReport>
}

export interface QualityReport {
  overallScore: number;        // 0-100 quality score
  testCoverage: number;        // Percentage test coverage
  performanceScore: number;    // Performance benchmarks score
  complianceScore: number;     // Specification compliance score
  issues: QualityIssue[];
  recommendations: string[];
}
```

#### Production Readiness Checklist
```typescript
// packages/qa-framework/src/production-readiness.ts
export interface ProductionReadinessChecklist {
  codeQuality: {
    testCoverage: boolean;           // >95% coverage
    typeScriptErrors: boolean;       // Zero TS errors
    performanceBenchmarks: boolean;  // All benchmarks pass
    specificationCompliance: boolean; // 100% spec compliance
  };

  platformLibraries: {
    c64LibrariesComplete: boolean;
    vic20LibrariesComplete: boolean;
    x16LibrariesComplete: boolean;
    crossPlatformTesting: boolean;
  };

  gameLibraries: {
    graphics3dTested: boolean;
    isometricTested: boolean;
    aiSystemTested: boolean;
    performanceValidated: boolean;
  };

  integration: {
    pipelineTesting: boolean;
    e2eGameCompilation: boolean;
    emulatorValidation: boolean;
    documentationComplete: boolean;
  };
}
```

#### Success Criteria for Task E.2
- [ ] Complete quality assurance framework
- [ ] Production readiness validation checklist
- [ ] Automated quality monitoring
- [ ] Performance regression detection
- [ ] Specification compliance validation

---

## Implementation Timeline

### **Phase Sequencing**
```
Phase A (Pipeline Testing):     3 weeks  │████████████░░░░░░░░░░░░░
Phase B (Platform Libraries):   4 weeks  │░░░░░░░░░░░░████████████░
Phase C (Game Libraries):       5 weeks  │░░░░░░░░░░░░░░░░████████░
Phase D (IL Caching):          3 weeks  │░░░░░░░░░░░░░░░░░░░░████░
Phase E (Integration Testing):  3 weeks  │░░░░░░░░░░░░░░░░░░░░░░░█
                              ────────
                              18 weeks total
```

### **Critical Path Dependencies**
1. **Phase A → Phase B**: Pipeline testing enables platform library validation
2. **Phase B → Phase C**: Platform libraries enable sophisticated game libraries
3. **Phase C → Phase D**: Game libraries stress-test caching system
4. **Phase D → Phase E**: Complete system enables production validation

### **Milestone Schedule**
- **Week 3**: Pipeline testing framework operational
- **Week 7**: C64 platform libraries complete and tested
- **Week 12**: Game development libraries (3D, isometric, AI) complete
- **Week 15**: IL caching system operational with development server
- **Week 18**: Complete system validated and production-ready

---

## Success Criteria

### **Revolutionary Platform Library Achievement**
- ✅ **Transparent Implementation**: Hardware APIs as readable Blend65 source code
- ✅ **Cross-Module Optimization**: Platform libraries optimized with user code
- ✅ **Multi-Platform Support**: C64/VIC-20/X16 with consistent APIs
- ✅ **Extensible Architecture**: Users can create custom hardware abstractions
- ✅ **Educational Value**: Complete visibility into hardware programming

### **Game Development Ecosystem Achievement**
- ✅ **Elite-Level 3D Graphics**: Wireframe 3D rendering with fixed-point mathematics
- ✅ **Last Ninja Isometric**: Advanced isometric world management and rendering
- ✅ **Sophisticated AI**: A* pathfinding and behavior tree systems
- ✅ **Performance Excellence**: Real-time operation on 6502 hardware
- ✅ **Comprehensive Testing**: End-to-end validation with real games

### **Production Quality Achievement**
- ✅ **Sub-Second Compilation**: Development builds under 1 second
- ✅ **Intelligent Caching**: 70-90% build time reduction through incremental compilation
- ✅ **Live Development**: Hot reloading and state preservation
- ✅ **Quality Assurance**: Comprehensive validation and monitoring
- ✅ **Documentation Excellence**: Complete API documentation and examples

### **Technical Excellence Standards**
- **Test Coverage**: >95% across all components
- **Performance**: <100ms for development compilation, <1s for production
- **Memory Usage**: <50MB peak, <20MB steady state
- **Quality Score**: >90/100 across all quality metrics
- **Specification Compliance**: 100% Blend65 language specification adherence

---

## Quality Assurance

### **Continuous Integration Requirements**
```yaml
# .github/workflows/platform-library-ci.yml
name: Platform Library CI

on: [push, pull_request]

jobs:
  pipeline-testing:
    runs-on: ubuntu-latest
    steps:
      - name: Pipeline Test Suite
        run: yarn test:pipeline
      - name: Platform Library Compilation
        run: yarn test:platform-libraries
      - name: Performance Benchmarks
        run: yarn test:performance

  game-library-testing:
    runs-on: ubuntu-latest
    steps:
      - name: 3D Graphics Library Tests
        run: yarn test:graphics3d
      - name: Isometric Library Tests
        run: yarn test:isometric
      - name: AI Library Tests
        run: yarn test:ai

  e2e-validation:
    runs-on: ubuntu-latest
    steps:
      - name: End-to-End Game Compilation
        run: yarn test:e2e-games
      - name: Quality Assurance Validation
        run: yarn test:qa-framework
      - name: Production Readiness Check
        run: yarn test:production-ready
```

### **Code Quality Standards**
- **TypeScript Strict Mode**: All packages use strict TypeScript configuration
- **Test Coverage**: Minimum 95% coverage for all new components
- **Performance Benchmarks**: All targets must be met or exceeded
- **Documentation**: Complete API documentation with usage examples
- **Specification Compliance**: 100% adherence to Blend65 language specification

### **Review Requirements**
- **Architecture Review**: Platform library design patterns and cross-module optimization
- **Performance Review**: Compilation speed and runtime performance validation
- **Game Development Review**: Library usability and completeness for target games
- **Quality Review**: Test coverage, documentation, and production readiness

### **Release Criteria**
- ✅ **All Tests Passing**: 100% test suite success rate
- ✅ **Performance Targets Met**: All benchmarks within acceptable ranges
- ✅ **Documentation Complete**: User guides, API references, and examples
- ✅ **Game Compilation Validated**: Target games compile and execute successfully
- ✅ **Multi-Platform Verified**: C64/VIC-20/X16 libraries tested and validated

---

## Revolutionary Impact Summary

### **Transformational Achievement**
This implementation plan establishes Blend65 as the **most sophisticated retro development platform ever created**, combining:

- **Modern Compiler Intelligence**: World-class optimization with 6502-specific awareness
- **Transparent Hardware Abstraction**: Users can read, understand, and modify all hardware APIs
- **Cross-Module Optimization**: Platform libraries optimized together with user code
- **Comprehensive Game Libraries**: Elite-level 3D, Last Ninja isometric, advanced AI systems
- **Production-Quality Engineering**: Sub-second compilation with intelligent caching

### **Developer Experience Revolution**
- **Educational Excellence**: Complete visibility into hardware programming concepts
- **Extensible Architecture**: Users can create custom hardware abstractions and game libraries
- **Live Development**: Hot reloading and state preservation for rapid iteration
- **Multi-Platform**: Single codebase targeting C64, VIC-20, and Commander X16
- **Professional Quality**: Production-ready optimization and debugging tools

### **Strategic Significance**
- **Enables Elite-Class Games**: 3D wireframe, isometric worlds, sophisticated AI
- **Preserves Retro Spirit**: Direct hardware access with modern development experience
- **Educational Impact**: Teaches hardware programming through transparent abstractions
- **Community Building**: Extensible platform enabling user-created libraries and tools
- **Future Foundation**: Architecture ready for additional platforms and advanced features

**This revolutionary platform library approach transforms Blend65 from a compiler into a complete retro development ecosystem, enabling the creation of games that rival the classics while maintaining modern development productivity and code quality.**

---

## Next Steps

### **Implementation Readiness**
- **Dependencies Met**: ✅ Complete IL system (1,132 tests passing)
- **Foundation Ready**: ✅ World-class optimization framework operational
- **Architecture Validated**: ✅ Platform library design proven through specification analysis
- **Team Ready**: ✅ Clear implementation plan with detailed success criteria

### **Immediate Action Items**
1. **Begin Phase A**: Create pipeline testing package (Task A.1)
2. **Establish Quality Gates**: Implement continuous integration for platform libraries
3. **Prototype Validation**: Build minimal C64 sprite library to validate approach
4. **Performance Baseline**: Establish benchmarks for incremental compilation system
5. **Documentation Foundation**: Create platform library development guidelines

