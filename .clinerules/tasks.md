# Blend65 Task Management and Context Preservation System

**Purpose:** Mandatory context management system to ensure seamless task transitions and prevent information loss due to AI context window limitations

---

## Table of Contents

1. [Critical Context Management Rules](#critical-context-management-rules)
2. [Mandatory New Task Creation Protocol](#mandatory-new-task-creation-protocol)
3. [Comprehensive Context Summary Framework](#comprehensive-context-summary-framework)
4. [Context Quality Assurance](#context-quality-assurance)
5. [Integration with Blend65 Workflow](#integration-with-blend65-workflow)
6. [Recovery Procedures](#recovery-procedures)
7. [Context Template Examples](#context-template-examples)

---

## Critical Context Management Rules

### **RULE 1: MANDATORY NEW TASK CREATION**

**🚨 CRITICAL REQUIREMENT:** When working on Blend65 in ACT MODE, you **MUST ALWAYS** use the `new_task` tool to create a "Task With Context" before beginning any new task that follows a previous task.

**NEVER continue in the same task session** when:
- Starting a new task after completing a previous one
- Context window usage exceeds 70% (700K tokens)
- Switching between different phases of work (frontend → backend, implementation → testing, etc.)
- Working on different packages or subsystems
- More than 1 hour has passed since the last task creation
- Task complexity requires detailed historical context

### **RULE 2: ZERO TOLERANCE FOR CONTEXT LOSS**

**Consequences of not following this rule:**
- ❌ **Critical implementation details lost** - architectural decisions, design patterns
- ❌ **Build state confusion** - unknown package states, broken dependencies
- ❌ **Duplicate work** - reimplementing already completed features
- ❌ **Specification drift** - forgetting Blend65 language requirements
- ❌ **Quality regression** - missing test patterns, breaking established conventions
- ❌ **Evolution misalignment** - losing track of roadmap priorities and version targeting

### **RULE 3: PROACTIVE CONTEXT MANAGEMENT**

**Create new tasks when:**
- ✅ **Starting any new implementation task** (backend development, new packages, features)
- ✅ **Context window approaching limits** (>70% usage)
- ✅ **Switching work domains** (lexer → parser → semantic → codegen)
- ✅ **After completing major milestones** (package completion, phase completion)
- ✅ **Before complex debugging sessions** (build failures, test failures)
- ✅ **When resuming work after breaks** (different day, after user questions)

---

## Mandatory New Task Creation Protocol

### When to Create New Tasks

**IMMEDIATE new task creation required for:**

1. **Implementation Tasks**
   - Adding new packages to the Blend65 compiler
   - Implementing semantic analysis components
   - Building IL (Intermediate Language) systems
   - Creating code generation modules
   - Adding hardware API implementations

2. **Major System Changes**
   - Modifying compiler architecture
   - Updating TypeScript configurations
   - Changing build systems or dependencies
   - Refactoring across multiple packages

3. **Quality Assurance Tasks**
   - Fixing failing tests across packages
   - Resolving build or compilation errors
   - Updating documentation systems
   - Implementing new test frameworks

4. **Evolution-Related Tasks**
   - Implementing new language features (v0.2, v0.3+)
   - Adding game compatibility requirements
   - Updating missing features matrices
   - Roadmap realignment activities

### Context Creation Trigger Points

**Automatic triggers (always create new task):**

```
IF current_context_usage > 70% THEN create_new_task()
IF task_domain_change THEN create_new_task()
IF package_switch THEN create_new_task()
IF major_milestone_completed THEN create_new_task()
IF build_failure_resolution THEN create_new_task()
IF specification_compliance_check THEN create_new_task()
```

**Manual triggers (create when appropriate):**

- User requests a new task after current completion
- Complex debugging requiring deep context
- Integration work spanning multiple packages
- Performance optimization requiring full system understanding
- Architectural decision requiring evolution context

---

## Comprehensive Context Summary Framework

### **Required Context Sections**

When creating a new task using the `new_task` tool, **ALWAYS** include these sections in your context:

#### 1. **Current Work Summary**
```markdown
**Current Work:** [Describe in detail what was being worked on]
- **Specific Task:** [Exact task name and goals]
- **Progress Status:** [What was completed, what remains]
- **Last Actions:** [Recent changes made, files modified]
- **Stopping Point:** [Exact point where work was paused]
- **Next Immediate Steps:** [What should happen next]
```

#### 2. **Technical Implementation Context**
```markdown
**Implementation Status:**
- **Frontend Status:** Lexer (✅), Parser (✅), AST (✅)
- **Backend Status:** Semantic ([current_status]), IL ([status]), Codegen ([status])
- **Current Package:** [Package being worked on]
- **Recent Changes:** [Files modified, tests added, APIs implemented]
- **Build Health:** [yarn build && yarn test status]
- **Test Coverage:** [Current test counts and coverage]
```

#### 3. **Blend65 Language Specification Context**
```markdown
**Specification Alignment:**
- **Language Version:** [v0.1/v0.2/v0.3 features being implemented]
- **Grammar Rules:** [Specific EBNF rules relevant to current work]
- **Storage Classes:** [zp/ram/data/const/io usage patterns]
- **Callback System:** [Function pointer semantics, interrupt handling]
- **Type System:** [Current type checking implementation status]
- **Hardware APIs:** [c64.sprites/vic/sid/etc. implementation status]
```

#### 4. **Architecture and Design Context**
```markdown
**Architectural Decisions:**
- **Design Patterns:** [Visitor pattern, Result types, etc.]
- **Package Dependencies:** [How current package relates to others]
- **Error Handling:** [Current error propagation strategies]
- **Code Quality Standards:** [TypeScript strict mode, test coverage requirements]
- **Performance Considerations:** [6502 constraints, optimization strategies]
```

#### 5. **Evolution and Roadmap Context**
```markdown
**Evolution Alignment:**
- **Target Version:** [Which Blend65 version this work enables]
- **Game Compatibility:** [Which games become portable through this work]
- **Missing Features:** [Known gaps this work addresses]
- **Priority Level:** [CRITICAL/HIGH/MEDIUM/LOW based on roadmap]
- **Roadmap Impact:** [How this advances toward version milestones]
```

#### 6. **Quality and Testing Context**
```markdown
**Quality Status:**
- **Test Strategy:** [Current testing approach and coverage]
- **Quality Gates:** [Build health, test passing status]
- **Known Issues:** [Any failing tests, build problems, technical debt]
- **Validation Requirements:** [How to verify completion]
- **Integration Points:** [Where this work connects to other components]
```

#### 7. **Next Steps and Dependencies**
```markdown
**Immediate Actions:**
1. **Next Task:** [Specific next implementation step]
2. **Dependencies:** [What must be completed first]
3. **Validation:** [How to test/verify the work]
4. **Documentation:** [What docs need updating]
5. **Evolution Impact:** [How to update roadmap/matrices]

**Pending Tasks:**
- [List all known follow-up work]
- [Dependencies waiting for current completion]
- [Future version requirements this enables]
```

---

## Context Quality Assurance

### **Context Completeness Validation**

Before creating a new task, ensure the context includes:

**✅ Required Information Checklist:**
- [ ] **Current project status** - build health, package states, test counts
- [ ] **Implementation reality** - what's actually complete vs. theoretical
- [ ] **Specification compliance** - which language features are implemented
- [ ] **Recent work details** - exact files changed, APIs added, tests written
- [ ] **Architectural decisions** - design patterns used, error handling approaches
- [ ] **Evolution alignment** - version targeting, game compatibility, roadmap impact
- [ ] **Next steps clarity** - specific actions, dependencies, validation requirements
- [ ] **Quality status** - test coverage, build health, known issues

**❌ Context Red Flags (Fix Before Proceeding):**
- Generic descriptions without specific details
- Theoretical status vs. actual implementation reality
- Missing specification alignment information
- Unclear next steps or dependencies
- No mention of build/test health
- Missing evolution/roadmap context
- Vague architectural decisions

### **Context Accuracy Verification**

**Before finalizing context, validate:**

1. **Implementation Status Accuracy**
   - Check actual package completion vs. claimed status
   - Verify test counts and build health
   - Confirm API implementation vs. specification

2. **Specification Alignment Check**
   - Reference `docs/BLEND65_LANGUAGE_SPECIFICATION.md` for current requirements
   - Verify language feature implementation completeness
   - Confirm grammar rule compliance

3. **Evolution Document Consistency**
   - Check `docs/research/BLEND65_EVOLUTION_ROADMAP.md` for priority alignment
   - Verify `docs/research/BLEND65_MISSING_FEATURES_MATRIX.md` accuracy
   - Ensure game compatibility assessments are current

---

## Integration with Blend65 Workflow

### **Automatic Documentation Updates**

When creating new tasks, **always consider updating:**

1. **Evolution Documents**
   - Update `BLEND65_EVOLUTION_ROADMAP.md` with progress
   - Mark completed features in `BLEND65_MISSING_FEATURES_MATRIX.md`
   - Update game compatibility analyses

2. **Project Status**
   - Update `docs/PROJECT_STATUS.md` with current build health
   - Document package completion percentages
   - Update recommended next tasks

3. **Implementation Plans**
   - Mark completed tasks in backend/frontend plans
   - Update dependency status for pending tasks
   - Document architectural decisions made

### **Git Workflow Integration**

**New task creation should trigger:**

1. **Git Status Check** - Ensure clean working directory
2. **Commit Pending Work** - Use `gitcm` to commit current progress
3. **Documentation Updates** - Update relevant evolution/status docs
4. **Quality Validation** - Verify build health before proceeding

### **Build Health Integration**

**Before creating new task context:**

```bash
# Verify current build health
yarn clean && yarn build && yarn test

# Document results in context:
- Build Status: ✅/❌
- Test Results: [X] passing, [Y] failing
- TypeScript Status: Clean/Errors
- Package Health: [Status by package]
```

---

## Recovery Procedures

### **When Context Is Lost**

If you find yourself working without proper context:

1. **STOP IMMEDIATELY** - Do not proceed without context
2. **Execute Recovery Protocol:**

   ```markdown
   ## Context Recovery Protocol

   1. **Read PROJECT_STATUS.md** - Get current build health and status
   2. **Check Latest Git Commits** - Understand recent changes
   3. **Review Evolution Documents** - Understand current priorities
   4. **Validate Build Health** - Run yarn clean && yarn build && yarn test
   5. **Create Recovery Context** - Use new_task with recovered information
   ```

3. **Mandatory Context Reconstruction:**
   - Read `docs/PROJECT_STATUS.md` for current status
   - Check `docs/research/BLEND65_EVOLUTION_ROADMAP.md` for priorities
   - Review recent git commits for latest changes
   - Execute build validation to confirm current health
   - Create comprehensive context summary using recovery information

### **Context Validation Failure Recovery**

**If build health checks fail during context creation:**

1. **Priority 1: Fix Quality Gates**
   - Resolve all TypeScript compilation errors
   - Fix failing tests before proceeding
   - Restore package build health

2. **Document Recovery in Context**
   - Note what was broken and how it was fixed
   - Update context with recovery actions taken
   - Include validated build health status

3. **Continue with Validated Context**
   - Proceed only after quality gates pass
   - Include recovery experience in architectural notes
   - Use experience to improve future context creation

---

## Context Template Examples

### **Template 1: Backend Development Task Context**

```markdown
## Blend65 Backend Development Context

### Current Work Summary
**Task:** Implement semantic analysis infrastructure for Blend65 compiler
**Progress:** Created semantic package structure, implementing symbol table system
**Last Actions:** Added SymbolTable interface, SymbolType definitions, basic scope management
**Stopping Point:** Need to implement type checking for variable declarations
**Next Steps:** Add variable declaration analysis with storage class validation

### Technical Implementation Context
**Frontend Status:** Lexer (✅ 65 tests), Parser (✅ 128 tests), AST (✅ 48 tests)
**Backend Status:** Semantic (🔄 IN PROGRESS - 15 tests), IL (❌ Not Started), Codegen (❌ Not Started)
**Current Package:** @blend65/semantic - building core semantic analysis infrastructure
**Build Health:** ✅ All packages compile, 256 total tests passing
**Recent Changes:**
- Added packages/semantic/src/types.ts with SymbolTable, SymbolType definitions
- Implemented packages/semantic/src/symbol-table.ts with scope management
- Created comprehensive test suite for symbol table operations

### Blend65 Specification Context
**Target Language Version:** v0.1 core features + v0.2 enums + v0.3 callback functions
**Grammar Compliance:** Processing variable declarations, function definitions, module imports
**Storage Classes:** Implementing zp/ram/data/const/io semantic validation
**Type System:** Building type compatibility checking for primitive types, arrays, named types
**Callback System:** Need to handle callback type checking and assignment validation

### Architecture & Design Context
**Design Patterns:** Using Visitor pattern for AST traversal, Result types for error handling
**Error Handling:** SemanticError with source location, error recovery for continued analysis
**Quality Standards:** TypeScript strict mode, 90%+ test coverage, JSDoc for public APIs
**Package Dependencies:** @blend65/semantic depends on @blend65/ast for node traversal

### Evolution & Roadmap Context
**Target Version:** Enables v0.1 compilation once IL and codegen complete
**Game Compatibility:** Foundational for all analyzed games requiring semantic validation
**Missing Features Addressed:** Symbol resolution, type checking (marked as CRITICAL in matrix)
**Priority Level:** CRITICAL - blocks all backend development progress

### Quality & Testing Context
**Test Strategy:** Unit tests for each analyzer, integration tests for complete analysis
**Current Coverage:** 15 tests covering symbol table, type system basics
**Quality Gates:** ✅ All tests passing, ✅ TypeScript clean, ✅ Build successful
**Next Validation:** Variable declaration analysis with comprehensive test coverage

### Next Steps
1. **Implement VariableAnalyzer** - Handle variable declarations with storage class validation
2. **Add Type Checking** - Implement type compatibility for primitive types and arrays
3. **Test Integration** - Validate complete semantic analysis pipeline
4. **Update Documentation** - Mark semantic infrastructure as complete in evolution docs
5. **Plan IL Development** - Prepare for Phase 2 once semantic analysis complete

**Dependencies Met:** ✅ AST package complete with all node types
**Blocked Tasks:** IL development awaits semantic analysis completion
**Critical Path:** This task unblocks entire backend development pipeline
```

### **Template 2: Hardware API Implementation Context**

```markdown
## Blend65 Hardware API Implementation Context

### Current Work Summary
**Task:** Implement C64 sprite control APIs for hardware abstraction layer
**Progress:** Added c64.sprites module foundation, implementing setSpritePosition and enableSprite
**Last Actions:** Created sprite register mapping, basic sprite enable/disable functions
**Stopping Point:** Need to implement setSpriteImage function with VIC-II memory layout
**Next Steps:** Complete sprite image data management and sprite collision detection APIs

### Technical Implementation Context
**Frontend Status:** Complete - can parse all sprite API calls from Blend65 programs
**Backend Status:** Semantic (✅), IL (✅), Codegen (🔄 Hardware APIs in progress)
**Hardware Platform:** Commodore 64 VIC-II chip programming via memory-mapped registers
**Current Module:** c64.sprites - sprite control and management APIs
**Build Health:** ✅ All packages building, hardware API tests passing for implemented functions

### Blend65 Specification Context
**Hardware API Requirements:** c64.sprites.setSpritePosition, enableSprite, setSpriteImage, readSpriteCollisions
**Memory Layout:** VIC-II sprite registers at $D000-$D02E, sprite data in VIC bank
**Storage Classes:** Sprite data uses 'data' storage class for VIC-accessible memory
**Type System:** sprite_id: byte (0-7), position coordinates: word, collision_mask: byte

### Game Compatibility Context
**Requesting Games:** [Iridis Alpha, 1nvader, C64 Space Shooter, Atomic Robokid]
**Compatibility Impact:** Enables 85% of sprite-based games analyzed in research
**Missing API Status:** setSpriteImage (HIGH priority), readSpriteCollisions (CRITICAL)
**Version Target:** Required for v0.1 C64 game compilation capability

### 6502 Implementation Context
**VIC-II Programming:** Direct register writes to $D015 (sprite enable), $D000-$D00F (positions)
**Memory Management:** Sprite data requires bank-aware memory allocation
**Performance:** Sprite updates in raster interrupt context, timing-critical operations
**Hardware Constraints:** 8 sprites maximum, 24x21 pixel resolution, shared VIC memory

### Quality & Testing Context
**Test Strategy:** Hardware simulation tests + real C64 validation programs
**Current Coverage:** setSpritePosition (✅), enableSprite (✅), setSpriteImage (🔄)
**Emulator Integration:** Testing with VICE emulator for register validation
**Real Hardware:** Final validation on actual C64 hardware

### Evolution Impact
**Game Portability:** Moves 6 analyzed games from "Backend Pending" to "Compilable" status
**Roadmap Progress:** Critical component for v0.1 C64 game compilation milestone
**Feature Matrix Update:** Mark sprite control APIs as COMPLETE upon task completion
**Next Hardware APIs:** Sound (c64.sid), Input (c64.cia), Graphics (c64.vic) priorities

### Next Steps
1. **Complete setSpriteImage** - Implement VIC bank-aware sprite data management
2. **Add Collision Detection** - Implement readSpriteCollisions from VIC-II registers
3. **Integration Testing** - Test complete sprite system with real game examples
4. **Documentation Update** - Update hardware API status in evolution matrices
5. **Game Validation** - Test sprite APIs with Iridis Alpha sprite movement code

**Dependencies Met:** ✅ Code generation infrastructure, ✅ Memory management
**Enables Next:** Sound APIs (c64.sid), Complete C64 game compilation
**Critical for:** All sprite-based C64 games in compatibility analysis
```

---

## Enforcement and Compliance

### **Automated Validation**

The context management system should automatically validate:

1. **Context Completeness** - All required sections present
2. **Information Accuracy** - Status matches actual implementation
3. **Specification Alignment** - References current language specification
4. **Evolution Consistency** - Aligns with roadmap and missing features matrix

### **Quality Gates Integration**

**Context creation triggers quality validation:**

- Build health verification (`yarn clean && yarn build && yarn test`)
- Test coverage validation (minimum 90% for new packages)
- TypeScript compilation verification (strict mode, zero errors)
- Documentation currency check (API docs match implementation)

### **Evolution Document Synchronization**

**Context creation automatically updates:**

- `docs/research/BLEND65_EVOLUTION_ROADMAP.md` with progress
- `docs/research/BLEND65_MISSING_FEATURES_MATRIX.md` with status changes
- `docs/PROJECT_STATUS.md` with current build health and capabilities
- Game analysis files with updated compatibility status

---

## Summary

This task management system ensures that **no implementation context is ever lost** due to AI limitations, enabling seamless continuation of complex compiler development work. By mandating comprehensive context preservation, Blend65 development maintains architectural coherence, specification compliance, and evolution alignment across all tasks.

**Remember:** Context preservation is not optional - it's critical infrastructure for successful compiler development. Every task transition **MUST** use the `new_task` tool with comprehensive context to ensure project continuity and prevent costly rework.

The investment in detailed context creation pays dividends in:
- ✅ **Faster development** - No time lost reconstructing context
- ✅ **Higher quality** - Maintains architectural patterns and quality standards
- ✅ **Specification compliance** - Continuous reference to language requirements
- ✅ **Evolution alignment** - All work supports strategic roadmap goals
- ✅ **Reduced technical debt** - Prevents context-loss-driven shortcuts and workarounds

**Context is code. Preserve it religiously.**
