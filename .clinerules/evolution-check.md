# Game Compatibility Analysis System

**Purpose:** Systematic analysis of existing games and programs to identify Blend65 evolution requirements

---

## gamecheck Command

When the user provides the command `gamecheck repo_url`, execute the following comprehensive analysis workflow:

### Phase 1: Repository Acquisition

1. **Clone Repository (Shallow)**
   ```bash
   cd temp
   git clone --depth 1 repo_url game-analysis
   cd game-analysis
   ```

2. **Repository Structure Analysis**
   - List all files recursively
   - Identify programming languages used
   - Locate main source files, build systems, documentation
   - Assess project size and complexity

### Phase 2: Deep Source Code Analysis

#### 2.1 Programming Language Assessment

**For Assembly Language Projects:**
- **Target Platform Identification**: C64, VIC-20, Atari 2600, Apple II, NES, etc.
- **Assembly Style Analysis**: DASM, CA65, ACME, or custom assembler
- **Memory Layout Analysis**: Zero page usage, program organization, memory maps
- **Hardware Usage Patterns**: Direct register access, interrupt handlers, timing loops

**For High-Level Language Projects:**
- **Language Features Used**: Dynamic allocation, complex data structures, OOP, etc.
- **Runtime Dependencies**: Standard libraries, frameworks, external dependencies
- **Memory Management**: Stack vs heap usage, garbage collection requirements
- **Computational Complexity**: Mathematical operations, algorithms used

#### 2.2 Systematic Code Pattern Analysis

**Memory Management Patterns:**
- **Static vs Dynamic Allocation**: Fixed arrays vs dynamic data structures
- **Memory Access Patterns**: Sequential, random access, pointer arithmetic
- **Data Structure Complexity**: Simple types vs nested structures vs dynamic containers
- **Memory Optimization**: Zero page usage, memory-mapped I/O, bank switching

**Control Flow Analysis:**
- **Function Call Patterns**: Recursion, function pointers, callbacks
- **Loop Complexity**: Simple for/while vs complex iterator patterns
- **Conditional Logic**: Basic if/else vs complex state machines
- **Error Handling**: Return codes vs exceptions vs asserts

**Hardware Interaction Patterns:**
- **Graphics Requirements**: Sprites, bitmap graphics, text modes, raster effects
- **Sound Requirements**: Simple tones vs multi-voice music vs hardware synthesis
- **Input Handling**: Polling vs interrupt-driven vs complex input processing
- **Timing Requirements**: Basic delays vs precise timing vs synchronization

**Mathematical Requirements:**
- **Arithmetic Complexity**: Basic math vs trigonometry vs 3D calculations
- **Data Types**: 8-bit vs 16-bit vs floating point vs fixed point
- **Lookup Tables**: Sin/cos tables, multiplication tables, game data
- **Optimization Techniques**: Shift-based math, bit manipulation, fast algorithms

### Phase 3: Blend65 Compatibility Assessment

#### 3.1 Current v0.1 Capability Mapping

**Evaluate against Blend65 v0.1 features:**

```js
// SUPPORTED in v0.1:
var staticArray: byte[256]        // Fixed-size arrays
zp var counter: byte              // Storage classes
const var message: byte[10] = "HELLO"

type SimpleRecord
    x: byte
    y: byte
end type

function basicFunction(a: byte): byte
    return a + 1
end function

// Basic control flow
if condition then
    // action
end if

for i = 0 to 255
    // loop
next i

// Target-specific hardware APIs
import setSpritePosition from c64.sprites
import joystickLeft from c64.input
```

**NOT SUPPORTED in v0.1:**
- Dynamic memory allocation (`malloc`/`free`)
- Dynamic arrays (`dynamic byte[]`)
- String types and manipulation
- Function pointers
- Recursion
- Complex mathematical functions
- Interrupt handlers
- Advanced hardware control

#### 3.2 Gap Analysis Framework

**Language Feature Gaps (classify into roadmap versions):**

**Version 0.2 Requirements:**
- Dynamic arrays for variable-sized data
- Complex nested records
- Basic pointers/references

**Version 0.3 Requirements:**
- String type and operations
- Function pointers
- Enhanced math library
- Module system improvements

**Version 0.4 Requirements:**
- Full heap allocation
- Memory pools
- Garbage collection (optional)
- Advanced data structures

**Version 0.5 Requirements:**
- Interrupt system
- Hardware collision detection
- Advanced sprite control
- Precise timing control

**Hardware API Gaps:**

**Missing Hardware Features:**
- Interrupt handlers: `interrupt function rasterIrq(): void`
- Hardware collision: `readSpriteCollisions()`, `readBackgroundCollisions()`
- Advanced sprites: `setSpriteImage()`, `setSpriteExpansion()`
- Timing control: `setTimer()`, `readTimer()`, hardware synchronization
- Low-level I/O: Direct memory-mapped register access

### Phase 4: Detailed Compatibility Report

#### 4.1 Portability Assessment

**Generate classification:**

**DIRECTLY PORTABLE (v0.1 compatible):**
- Simple arcade games using basic arrays and control flow
- Games with static memory requirements
- Basic sprite/input/sound usage

**PARTIALLY PORTABLE (requires specific version):**
- v0.2 needed: Games with dynamic enemy lists, variable collections
- v0.3 needed: Games with complex AI, text processing
- v0.4 needed: Games with dynamic world systems, complex simulation
- v0.5 needed: Games with interrupt-driven gameplay, hardware collision

**NOT CURRENTLY PORTABLE:**
- Games requiring features beyond v1.0 roadmap
- Games with floating-point mathematics
- Games with recursive algorithms
- Games with complex memory management

#### 4.2 Specific Feature Requirements

**For each identified gap, provide:**

```markdown
## Required Feature: [Feature Name]

**Game Usage Pattern:** [Show specific code patterns from the analyzed game]
**Current Blend65 Limitation:** [Explain what's missing in current v0.1]
**Proposed Blend65 Solution:** [Show how this would work in future Blend65 syntax]
**Roadmap Classification:** Version [X.Y] - [Priority Level] - [Implementation Effort]
**Impact Assessment:** [How this affects game porting and Blend65 evolution]
```

### Phase 5: Evolution Roadmap Integration

#### 5.1 Automatic Roadmap Updates

**Append to `docs/research/BLEND65_EVOLUTION_ROADMAP.md`:**

```markdown
## [Game Name] Compatibility Analysis

**Repository:** [repo_url]
**Analysis Date:** [current_date]
**Target Platform:** [detected_platform]
**Project Size:** [lines_of_code / file_count]

### Portability Status: [PORTABLE/PARTIAL/NOT_PORTABLE]

### Language Feature Requirements:
**Version 0.2 Features Needed:** [List specific dynamic array needs]
**Version 0.3 Features Needed:** [List string processing needs]
**Version 0.4 Features Needed:** [List dynamic memory needs]
**Version 0.5 Features Needed:** [List interrupt system needs]

### Hardware API Requirements:
**Missing APIs:** [List specific hardware functions needed]

### Implementation Priority Updates:
[Update priority matrix based on this game's requirements]

### Code Examples:
**Original Game Code:** [Show representative code patterns from game]
**Required Blend65 Syntax:** [Show how this would be implemented in future Blend65]
```

#### 5.2 Priority Matrix Updates

**Automatically update implementation priorities based on analysis:**
- If multiple games need the same feature → increase priority
- If feature blocks many interesting games → mark as HIGH priority
- If feature is rarely needed → can remain lower priority
- Track frequency of feature requests across analyzed games

### Phase 6: Game Analysis Report Generation

#### 6.1 Analysis Summary

**Save individual game analysis to `docs/research/games/[GAME_NAME]_GAMECHECK_ANALYSIS.md`:**

```markdown
# Game Analysis Report: [Game Name]

## Executive Summary
- **Portability Status:** [DIRECTLY_PORTABLE/NEEDS_VERSION_X/NOT_PORTABLE]
- **Primary Blockers:** [List 3-5 main compatibility issues]
- **Recommended Blend65 Version:** [Version needed for full compatibility]
- **Implementation Effort:** [LOW/MEDIUM/HIGH/EXTREME]

## Technical Analysis
[Detailed breakdown of all findings]

## Evolution Impact
[How this analysis affects Blend65 development priorities]

## Recommendations
[Specific actions for Blend65 evolution]
```

### Phase 7: Quality Assurance

#### 7.1 Analysis Validation

**Ensure comprehensive coverage:**
- All source files analyzed
- Hardware usage patterns identified
- Memory management patterns documented
- Control flow complexity assessed
- Missing features clearly categorized
- Roadmap integration completed

#### 7.2 Error Handling

**Handle edge cases:**
- Repository access failures
- Unknown programming languages
- Incomplete source code
- Platform-specific code without clear documentation
- Complex build systems requiring special handling

### Phase 8: Automatic Git Integration

#### 8.1 Commit Game Research Results

**Execute `gitcmp` workflow automatically when gamecheck analysis completes:**

1. **Stage all analysis changes** (`git add .`)
2. **Create detailed commit message** following the format:
   ```
   feat(research): analyze [Game Name] for Blend65 compatibility

   - Added game analysis report to docs/research/games/
   - Updated evolution roadmap with compatibility findings
   - Updated missing features matrix with new requirements
   - Updated language features tracking with [X] new gaps
   - Updated library functions tracking with [Y] missing APIs
   - Priority adjustments based on [Game Name] requirements
   ```

3. **Commit the changes** (`git commit -m "detailed message"`)
4. **Pull and rebase** if needed (`git pull --rebase`)
5. **Push to remote** (`git push`) if no conflicts
6. **Report any conflicts** for manual resolution

**Commit Message Template:**

```
feat(research): analyze [GAME_NAME] for Blend65 compatibility

- Game analysis: [PORTABILITY_STATUS] - Version [X.Y] needed
- Updated evolution roadmap with [Game Name] compatibility analysis
- Updated missing features matrix with [N] new feature requirements
- Updated language features tracking with [N] new language gaps
- Updated library functions tracking with [N] missing APIs
- Priority updates: [List major priority changes]
- New blockers identified: [List critical missing features]
```

---

## Analysis Templates

### Template 1: Assembly Language Game

```markdown
## Assembly Game Analysis: [Game Name]

**Target Platform:** [C64/VIC-20/etc.]
**Assembly Style:** [DASM/CA65/etc.]
**Code Size:** [Bytes/Lines]

### Hardware Usage Patterns:
- **Graphics:** [VIC-II registers, sprite usage, screen modes]
- **Sound:** [SID usage, music vs sound effects]
- **Input:** [CIA registers, joystick/keyboard handling]
- **Memory:** [Zero page usage, memory layout, bank switching]
- **Timing:** [Interrupt handlers, raster timing, wait loops]

### Blend65 Hardware API Requirements:
[List specific missing APIs needed]

### Portability Assessment:
[DIRECT/PARTIAL/NOT_PORTABLE] - Version [X.Y] needed

### Implementation Roadmap Impact:
[How this affects Blend65 evolution priorities]
```

### Template 2: High-Level Language Game

```markdown
## High-Level Game Analysis: [Game Name]

**Language:** [C/C++/Python/etc.]
**Platform:** [Target system]
**Complexity:** [Simple/Moderate/Complex/Elite-class]

### Language Feature Usage:
- **Memory Management:** [Static/Dynamic/Mixed]
- **Data Structures:** [Arrays/Lists/Maps/Trees/Custom]
- **Control Flow:** [Basic/Advanced/Recursive/Functional]
- **Mathematics:** [Basic/Trigonometry/3D/Physics]
- **String Processing:** [None/Basic/Advanced/Text-heavy]

### Blend65 Language Requirements:
[Map to specific roadmap versions]

### Hardware Abstraction Needs:
[Required hardware APIs for target platform]

### Porting Strategy:
[Recommended approach for Blend65 port]
```

### Template 3: Hardware-Intensive Game

```markdown
## Hardware-Intensive Game Analysis: [Game Name]

**Platform:** [Specific hardware target]
**Hardware Focus:** [Sprites/Raster/Sound/Timing/etc.]

### Critical Hardware Dependencies:
- **Interrupt System:** [Raster/Timer/Custom interrupts needed]
- **Hardware Collision:** [Sprite/Background collision requirements]
- **Precise Timing:** [Frame timing, synchronization needs]
- **Advanced Graphics:** [Raster effects, split-screen, etc.]
- **Sound Requirements:** [Hardware synthesis, multi-voice, effects]

### Current Blend65 v0.1 Gaps:
[Specific missing hardware APIs]

### Version 0.5 Requirements:
[Detailed hardware API specifications needed]

### Implementation Priority:
[How this affects hardware API development priorities]
```

---

## Integration Guidelines

### Automatic Documentation Updates

When `gamecheck` analysis completes:

1. **Append findings** to `BLEND65_EVOLUTION_ROADMAP.md`
2. **Update priority matrices** based on feature frequency
3. **Track progress** towards supporting analyzed games
4. **Identify patterns** across multiple game analyses
5. **Generate summary reports** of ecosystem compatibility

### Continuous Evolution

The `gamecheck` system enables systematic Blend65 evolution by:

- **Identifying real-world requirements** from existing games
- **Prioritizing features** based on actual game needs
- **Validating roadmap decisions** against concrete examples
- **Building comprehensive compatibility database**
- **Tracking evolution progress** towards supporting target games

This systematic approach ensures Blend65 evolves to support the games developers actually want to create, rather than abstract language features that may not be needed in practice.
