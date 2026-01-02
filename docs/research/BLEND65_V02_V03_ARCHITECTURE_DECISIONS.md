# Blend65 v0.2 & v0.3+ Architecture Decisions

**Date:** 02/01/2026
**Purpose:** Comprehensive architectural roadmap based on lexer/parser/AST analysis and Missing Features Matrix cross-reference
**Status:** APPROVED - Core design decisions for next evolution phases

---

## Executive Summary

This document captures critical architectural decisions for Blend65's evolution from v0.1 to v0.3+. Based on comprehensive analysis of the current lexer/parser/AST implementation and cross-referencing with our Missing Features Matrix, we've identified a focused v0.2 scope and revolutionary v0.3+ local variable architecture that leverages 6502-native optimization strategies.

### Key Outcomes:
- **v0.2:** 3 high-impact language features with minimal complexity
- **v0.3+:** Revolutionary "Local Pool" architecture for efficient local variables
- **Innovation:** IL-based optimization that could be industry-leading for 6502 development

---

## Current State Analysis (Foundation Assessment)

### Lexer Status: ✅ EXCELLENT FOUNDATION
- **Complete token set:** All basic language constructs implemented
- **Storage classes:** ZP, RAM, DATA, CONST, IO fully supported
- **Operators:** Comprehensive arithmetic, logical, bitwise, comparison
- **Keywords:** Module system, control flow, function definitions complete
- **Assessment:** Ready for v0.2 feature additions

### AST Status: ✅ COMPREHENSIVE HIERARCHY
- **Expression system:** Complete binary/unary/call/member/index expressions
- **Statement system:** Full control flow (if/while/for/match/return)
- **Declaration system:** Functions, variables, types with storage classes
- **Type system:** Primitives, arrays, records with proper annotations
- **Import/Export:** Full module system support
- **Assessment:** Robust foundation for language feature expansion

### Parser Status: ✅ PRODUCTION READY
- **Recursive descent:** Clean, maintainable implementation
- **Module parsing:** Complete import/export/module declaration support
- **Function parsing:** Parameters, return types, body statements
- **Variable parsing:** All storage classes supported in function bodies
- **Expression parsing:** Full precedence handling with proper associativity
- **Assessment:** Can handle v0.2 features with minimal modifications

---

## v0.2 Implementation Decisions

### ✅ APPROVED FOR IMPLEMENTATION

#### 1. Break/Continue Statements (HIGH Priority)
**Decision:** IMPLEMENT - Essential for complex game loops
**Rationale:**
- Highly requested by analyzed games (Tetris C64, complex arcade games)
- Simple implementation - minimal parser/AST changes needed
- Immediate developer productivity improvement

**Implementation Requirements:**
- Add `BREAK`, `CONTINUE` tokens to lexer
- Add `BreakStatement`, `ContinueStatement` AST nodes
- Extend parser to handle break/continue within loop contexts only
- Add semantic validation (only valid inside loops)

**Syntax:**
```blend65
for i = 0 to 255
    if condition then
        break      // Exit loop entirely
    end if
    if otherCondition then
        continue   // Skip to next iteration
    end if
next i
```

#### 2. Complete Match Statement Implementation (MEDIUM Priority)
**Decision:** IMPLEMENT - Better than long if/else chains
**Rationale:**
- MATCH/CASE tokens already exist but parser/AST incomplete
- Provides clean pattern matching for game logic
- Natural fit for 6502 development patterns

**Implementation Requirements:**
- Complete `MatchStatement` and `MatchCase` AST implementation
- Add `DEFAULT` token for default case support
- Implement full pattern matching parser
- Add exhaustiveness checking in semantic analysis

**Syntax:**
```blend65
match gameState
    case MENU:
        showMenu()
    case PLAYING:
        updateGame()
    case GAME_OVER:
        showGameOver()
    default:
        handleError()
end match
```

#### 3. Enum Declarations (MEDIUM Priority)
**Decision:** IMPLEMENT - Code organization and readability
**Rationale:**
- Perfect for game states, colors, directions, input codes
- Improves code maintainability significantly
- Simple implementation with high developer value

**Implementation Requirements:**
- Add `ENUM` token to lexer
- Add `EnumDeclaration` AST node with named constants
- Add parser for enum syntax
- Generate compile-time constants in code generation

**Syntax:**
```blend65
enum GameState
    MENU = 0,
    PLAYING = 1,
    PAUSED = 2,
    GAME_OVER = 3
end enum

enum Direction
    UP, DOWN, LEFT, RIGHT    // Auto-incrementing values
end enum
```

### ❌ REJECTED FOR v0.2

#### 1. Range-Based For Loops
**Decision:** REJECT - Current syntax is adequate
**Rationale:**
- Wild Boa Snake (100% v0.1 compatible) uses `for i = 0 to 255` successfully
- C64 Examples use traditional counting loops without issues
- Adding `for x in range(0, 10)` is unnecessary complexity
- 6502/BASIC heritage makes current syntax more natural

#### 2. Assert Statements
**Decision:** REJECT - Not 6502-appropriate
**Rationale:**
- Traditional error handling problematic on 6502
- No exception mechanism on 6502
- Limited stack space for error handling
- Every byte of RAM matters
- Real-time constraints make error handling complex
- Analyzed games use return codes and flag variables instead

#### 3. Traditional Stack-Based Local Variables
**Decision:** DEFER to v0.3+ with revolutionary approach
**Rationale:**
- Stack-based locals are slow on 6502 (6+ cycles per access)
- Complex implementation requiring PhD-level compiler expertise
- Better solution available (see v0.3+ Local Pool Architecture)

---

## v0.3+ Revolutionary Local Variable Architecture

### The Local Pool Concept: GAME CHANGER

#### Core Innovation: Reserved Memory Pool for Locals
```
C64 Memory Layout with Local Pool:
$0000-$00FF: Zero Page (system + critical globals)
$0100-$01FF: Stack (6502 hardware stack)
$0200-$025F: LOCAL VARIABLE POOL (96 bytes dedicated)
$0260+: General program memory
```

**Key Advantages:**
- **Performance:** 4-cycle access vs 6+ cycles for stack-based
- **Predictable:** Fixed addresses aid debugging
- **Simple:** Stack-like allocation without stack complexity
- **Abundant:** 96 bytes vs ~15 bytes contested zero page space
- **6502-Native:** Leverages absolute addressing efficiency

#### Dynamic Pool Sizing: IL-Based Intelligence

**Compile-Time Pool Analysis:**
```
IL Analysis Pass:
main(): 4 bytes locals
├── updateEnemies(): 3 bytes locals
    ├── collision(): 2 bytes locals
Maximum simultaneous: 4 + 3 + 2 = 9 bytes

Generated Pool: $0200-$0208 (9 bytes only)
Memory Saved: 87 bytes vs 96-byte fixed pool
```

**Automatic Configuration:**
```bash
$ blend65c game.blend65

ANALYSIS: Local variable pool analysis...
- Maximum call depth: 3 functions
- Maximum local storage needed: 9 bytes
- Pool allocated: $0200-$0208 (9 bytes)
- Memory efficiency: 90.6% (87 bytes saved)
```

#### Hybrid Allocation Strategy: Best of Both Worlds

**Parser Support Already Exists:**
```blend65
function gameLogic()
    zp var critical: byte = 0       // PROGRAMMER requests zero page
    var regular: byte = 0           // COMPILER allocates to local pool
    var buffer: byte[8]            // COMPILER allocates to local pool
end function
```

**Compiler Allocation Logic:**
1. Honor `zp var` requests first (programmer knows performance needs)
2. Allocate `var` declarations to local pool (good performance, predictable)
3. Warn if zero page exhausted (help programmer understand constraints)
4. Graceful fallback (zp var → local pool if needed)

#### Advanced Lifetime Optimization: Future Phase

**Current Naive Allocation:**
```
Call Stack Growth:
main() uses: $0200-$0203 (4 bytes)
├── updateEnemies() uses: $0204-$0206 (3 bytes)
    ├── collision() uses: $0207-$0208 (2 bytes)
Total: 9 bytes
```

**Advanced Lifetime Optimization:**
```
Lifetime Analysis:
main.playerX: [LIVE: lines 10-50]
updateEnemies.enemyX: [LIVE: lines 20-30]
collision.deltaX: [LIVE: lines 25-27]

Optimized Allocation:
$0200: main.playerX [10-50], reused by updateEnemies.enemyX [20-30]
$0201: main.playerY [10-50], reused by collision.deltaX [25-27]
Result: 2 bytes instead of 9 bytes (78% reduction!)
```

**Implementation Note:** This is classic register allocation applied to pool addresses - proven compiler theory with manageable complexity.

### Return Value Management: Critical Design Decision

#### The Problem:
```blend65
function createBuffer(): byte[16]
    var buffer: byte[16]           // Allocated in local pool
    return buffer                  // PROBLEM: buffer deallocated on exit
end function

function main()
    var result: byte[16] = createBuffer()  // DANGLING POINTER!
end function
```

#### Multi-Strategy Solution:

**1. Small Values: Return by Value (Copy)**
```blend65
function getScore(): word          // 2 bytes - efficient to copy
    var temp: word = calculateScore()
    return temp                    // Copied via CPU registers
end function
```

**2. Medium Values: Static Return Buffers**
```blend65
function getCurrentSprite(): byte[24]  // 24 bytes - static buffer
    static var spriteBuffer: byte[24]  // Function-specific static storage
    // ... build sprite in static buffer
    return spriteBuffer               // Return pointer to static buffer
end function
```

**3. Large Values: Caller-Allocated Storage**
```blend65
function loadLevel(levelData: byte[512]): void  // Caller provides storage
    // Initialize provided levelData array
    // No return value needed
end function

function main()
    var myLevel: byte[512]        // Caller allocates
    loadLevel(myLevel)           // Pass storage to function
end function
```

#### Automatic Strategy Selection:
```typescript
function getReturnStrategy(returnType: TypeAnnotation): ReturnStrategy {
    const size = calculateTypeSize(returnType);

    if (size <= 2) {
        return ReturnStrategy.BY_VALUE;        // byte, word
    } else if (size <= 16) {
        return ReturnStrategy.STATIC_BUFFER;   // Small arrays
    } else {
        return ReturnStrategy.CALLER_ALLOCATED; // Large data
    }
}
```

### String Variables: Special Considerations

#### String Pool Strategy:
```
Memory Layout:
$0200-$0220: Scalar Local Pool (32 bytes)
$0221-$0280: String Local Pool (96 bytes)
$0281+: Regular program memory
```

#### String Allocation Strategies:
```blend65
// v0.3: Fixed-size string locals
var name: string[16] = "Player"    // Fixed allocation in string pool

// v0.4: Dynamic string management
var message: string = loadText()   // Compiler manages sizing

// v0.5: Full optimization
var greeting: string = "Hello"     // Compile-time constant in ROM
```

---

## IL-Based Optimization Architecture

### Cross-Module Analysis: Enterprise-Grade

**Traditional Problem:**
```blend65
// main.blend65
function gameLoop()
    var playerState: byte    // Compiler doesn't see physics module needs
    updatePhysics()
end function

// physics.blend65
function updatePhysics()
    var velocity: byte       // Compiler doesn't see main module needs
end function
```

**IL-Based Solution:**
```
Compilation Process:
1. Parse all source files → Individual ASTs
2. Semantic analysis → Individual IL modules
3. IL MERGING PASS → Combined IL database
4. Global pool allocation → Optimal assignment
5. Code generation → Conflict-free assembly

Combined Analysis:
main_module.gameLoop: local playerState [LIVE: 10-25, FREQ: 30]
physics_module.updatePhysics: local velocity [LIVE: 100-120, FREQ: 200]
Cross-module conflict detection: playerState conflicts with velocity
```

### Library Integration: Revolutionary

**Library IL Metadata:**
```
c64.sprites.lib:
Pool Requirements:
- Internal temp variables: 2 bytes (CRITICAL priority)
- Sprite calculation cache: 4 bytes (HIGH priority)

Export Functions:
setSpritePosition(x: byte, y: byte):
  Pool usage: 1 byte temporary (reusable)
```

**Whole Program Analysis:**
```
User Program: 8 bytes pool demand
c64.sprites lib: 6 bytes pool demand
c64.sid lib: 3 bytes pool demand
Total: 17 bytes

ERROR: Pool budget exceeded with imported libraries
SUGGESTION: Use --sprites-compact flag to reduce library pool usage
```

---

## Implementation Complexity Analysis

### v0.2 Features: MANAGEABLE (2-3 months with AI help)

**Break/Continue Statements: 3/10 EASY**
- Simple parser extensions
- Straightforward AST nodes
- Basic semantic validation
- **AI can easily help with implementation**

**Match Statements: 4/10 MODERATE**
- Parser extension for case handling
- AST completion for pattern matching
- Exhaustiveness checking in semantic analysis
- **AI can help with most aspects**

**Enum Declarations: 4/10 MODERATE**
- New AST node type
- Constant value generation
- Name resolution in semantic analysis
- **AI can handle implementation effectively**

### v0.3+ Local Pool: MODERATE COMPLEXITY

**Basic Local Pool: 5/10 MODERATE (2-3 months)**
- Simple pool allocation algorithm
- Fixed-size pools with basic management
- **Achievable with AI help**

**Advanced Lifetime Optimization: 8/10 VERY HARD (6-12 months)**
- Requires dataflow analysis expertise
- Graph coloring algorithms for pool allocation
- Cross-function dependency resolution
- **Needs PhD-level compiler knowledge**

### REJECTED: IL-Based Cross-Module Optimization

**Full IL Analyzer: 9/10 EXTREMELY HARD (12+ months)**
- Liveness analysis across modules
- Call graph construction with edge cases
- Register allocation theory applied to pools
- Library integration complexity
- **PhD-thesis level project - not recommended for v0.3**

---

## Strategic Recommendations

### Phase 1: v0.2 Core Language Features (Months 1-3)
1. **Break/Continue statements** - Essential developer productivity
2. **Complete Match statements** - Better game logic organization
3. **Enum declarations** - Code clarity and maintainability
4. **Comprehensive testing** - Validate against Wild Boa Snake patterns

### Phase 2: v0.3 Basic Local Pool (Months 4-6)
1. **Simple pool allocation** - Fixed-size pools with stack-like management
2. **Hybrid zp/pool allocation** - Honor `zp var` requests, fallback to pool
3. **Dynamic pool sizing** - IL-based pool size calculation
4. **Return value strategies** - Automatic strategy selection by data type
5. **Basic string support** - Fixed-size string locals in separate pool

### Phase 3: v0.4+ Advanced Features (Future)
1. **Lifetime optimization** - Pool reuse through liveness analysis
2. **Cross-module integration** - Library-aware pool management
3. **Dynamic strings** - Advanced string handling with pool optimization
4. **Performance profiling** - Validate 4-cycle access performance claims

---

## Success Metrics

### v0.2 Success Criteria:
- **All three features implemented** and fully tested
- **Zero breaking changes** to existing v0.1 functionality
- **Wild Boa Snake compatibility maintained**
- **Comprehensive test suite** covering edge cases
- **Clear documentation** with practical examples

### v0.3 Success Criteria:
- **Local variables work** with familiar syntax
- **Performance improvement** demonstrated (4-cycle vs 6+ cycle access)
- **Memory efficiency** validated (dynamic pool sizing working)
- **Zero page optimization** functional with `zp var`
- **Return value management** transparent to developers
- **String locals** working for basic use cases

### Long-term Vision:
- **Industry-leading 6502 compiler** with sophisticated optimization
- **Zero page intelligence** unmatched by other 6502 tools
- **Cross-module optimization** enabling complex multi-file projects
- **Library ecosystem** with intelligent resource management

---

## Architectural Principles

### 6502-Native Design Philosophy:
1. **Performance over abstraction** - 4-cycle pool access vs 6+ cycle stack
2. **Memory efficiency** - Dynamic sizing, lifetime optimization
3. **Programmer control** - `zp var` for critical performance needs
4. **Hardware awareness** - Leverage absolute addressing strengths
5. **Predictability** - Fixed addresses aid debugging and optimization

### Compiler Intelligence:
1. **Automatic optimization** - Pool sizing, strategy selection
2. **Clear feedback** - Warning messages explain allocation decisions
3. **Graceful degradation** - Fallback strategies when resources exhausted
4. **Cross-module awareness** - Library integration with resource management
5. **Future-proof architecture** - Foundation for advanced optimizations

### Developer Experience:
1. **Familiar syntax** - Local variables work as expected
2. **Performance transparency** - Clear model of what's fast vs slow
3. **Flexible control** - Override compiler decisions when needed
4. **Rich diagnostics** - Understand resource usage and conflicts
5. **Incremental adoption** - Can use features gradually

---

## Risk Assessment

### v0.2 Risks: LOW
- **Well-understood features** with clear implementation paths
- **Minimal parser changes** required
- **No breaking changes** to existing functionality
- **Strong AI assistance** available for implementation

### v0.3 Risks: MODERATE
- **New memory management** paradigm requires careful testing
- **Return value strategies** need comprehensive validation
- **Performance claims** must be empirically verified
- **String handling** adds complexity to pool management

### Long-term Risks: HIGH
- **Advanced optimization** requires deep compiler expertise
- **Cross-module analysis** has exponential complexity growth
- **Library ecosystem** coordination becomes complex
- **Backward compatibility** pressure increases with adoption

---

## Decision Rationale Summary

### Why These Decisions Are Optimal:

**v0.2 Focus:**
- **High impact, low risk** feature selection
- **Immediate developer value** without architectural complexity
- **Proven demand** from game analysis (break/continue/match/enum all requested)
- **Foundation building** for v0.3+ without premature optimization

**Local Pool Architecture:**
- **6502-native optimization** leveraging hardware strengths
- **Practical compromise** between zero page speed and stack complexity
- **Scalable design** from simple pools to advanced lifetime optimization
- **Developer-friendly** familiar syntax with 6502-aware performance

**Rejected Alternatives:**
- **Range syntax:** Current `for i = 0 to 255` works perfectly for target games
- **Assert statements:** 6502 constraints make traditional error handling impractical
- **Stack locals:** Performance penalty unacceptable for 6502 real-time games
- **Full IL optimization:** PhD-level complexity inappropriate for v0.3 timeline

### Competitive Advantage:
This architecture positions Blend65 as **the most sophisticated 6502 compiler ever built** while maintaining practical development timelines and manageable complexity. The local pool concept combined with zero page intelligence could be genuinely innovative in the 6502 development ecosystem.

---

## Implementation Dependencies

### Prerequisites for v0.2:
- Current lexer/parser/AST (✅ READY)
- Basic semantic analysis framework
- Test infrastructure expansion
- Documentation system for new features

### Prerequisites for v0.3:
- v0.2 features complete and stable
- IL representation framework
- Memory layout planning tools
- Cross-module compilation pipeline
- Advanced testing framework for memory management

### Prerequisites for v0.4+:
- v0.3 local pools proven in real projects
- Performance benchmarking infrastructure
- Dataflow analysis framework
- Library integration specification
- Advanced debugging tools

---

**This document represents the definitive architectural roadmap for Blend65's next evolution phases. All decisions are based on thorough analysis of current capabilities, cross-reference with Missing Features Matrix, and careful consideration of 6502-specific constraints and opportunities.**

**Status: APPROVED for implementation planning and resource allocation.**
