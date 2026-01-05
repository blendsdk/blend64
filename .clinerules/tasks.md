# Blend65 Task Management and Context Preservation System

**Purpose:** AI context management system integrated with GitHub project workflow for Blend65 compiler development

---

## Context Management Philosophy

### **Two-Level Task System**

The Blend65 project uses a two-level task management approach:

1. **AI Context Level (Cline `new_task` tool):**
   - Preserves AI knowledge and implementation context across sessions
   - Maintains architectural decisions, specification compliance, build state
   - Enables seamless continuation of complex compiler development work

2. **Project Management Level (GitHub Projects):**
   - Tracks actual implementation work through 5-lane workflow
   - Manages research findings → task creation → implementation → completion
   - Provides project visibility and progress tracking

### **Integration Flow**

```
Research/Planning Session →
  Create GitHub Project Items →
  Use new_task for AI Context →
  Implementation Work →
  GitHub Lane Management →
  When context full/domain switch → new_task (new AI session)
```

---

## New Task Tool Integration

### **MANDATORY Context Preservation Rules**

**🚨 CRITICAL REQUIREMENT:** When working on Blend65 in ACT MODE, you **MUST** use the `new_task` tool to create context-preserved AI sessions before:

- **Context window approaching limits** (>70% usage)
- **Switching between compiler domains** (frontend ↔ backend, lexer ↔ parser ↔ semantic ↔ codegen)
- **Major milestone completion** (package completion, phase completion)
- **Complex debugging sessions** (build failures, integration issues)
- **Resuming work after breaks** (different day, long interruptions)
- **Starting implementation from research/planning**

### **Context Preservation vs GitHub Management**

**Clear Separation:**
- `new_task` = AI knowledge preservation (not GitHub task creation)
- GitHub project items = Work task tracking and progress management
- Both work together but serve different purposes

**Workflow Integration:**
```bash
# AI Context Management (new_task)
new_task → Preserve AI knowledge → Continue in new session

# GitHub Task Management (separate)
create_tasks_from_research → GitHub project items → Lane management
```

### **When NOT to Use new_task**

**Do NOT create new_task for:**
- Creating GitHub project items (use gh.md workflows instead)
- Moving tasks through GitHub lanes (use lane management functions)
- Brief context switches within same domain
- Simple build/test cycles
- Minor code changes

---

## GitHub Project Integration

### **GitHub Task Creation from Context**

When AI context contains research or implementation plans:

```bash
# After research/planning, create GitHub project items
create_tasks_from_research "research_summary" "implementation_approach"

# Or create specific compiler tasks
create_compiler_development_task "semantic" "Symbol table implementation" "Description" "High" "7"
```

### **Context-Aware Task Creation**

```bash
# Function to create GitHub tasks with context reference
create_task_with_context() {
  local task_title="$1"
  local description="$2"
  local ai_context_reference="$3"

  # Enhanced description with AI context link
  local full_description="$description

## AI Context Reference
**Context Session:** $ai_context_reference
**Implementation Context:** Detailed technical context preserved in AI session
**Architectural Decisions:** Reference AI session for design patterns and approaches
**Specification Compliance:** See AI context for language specification alignment

## GitHub Project Integration
- This task tracks implementation progress
- Technical details and context maintained in AI sessions
- Use lane management for progress tracking"

  create_project_task "$task_title" "$full_description" "$priority" "$phase" "$effort" ""
}
```

### **Lane Management Integration**

Link AI context sessions with GitHub project lane progression:

```bash
# Move GitHub task through lanes while preserving AI context
progress_task_with_context() {
  local github_task="$1"
  local target_lane="$2"
  local ai_context_note="$3"

  # Move through GitHub lanes
  case $target_lane in
    "refine") move_to_refine "$github_task" ;;
    "in-progress") move_to_in_progress "$github_task" ;;
    "test") move_to_test "$github_task" ;;
    "done") move_to_done "$github_task" "Context: $ai_context_note" ;;
  esac

  echo "📋 GitHub Task: $github_task → $target_lane"
  echo "🧠 AI Context: $ai_context_note"
}
```

---

## Comprehensive Context Framework

### **Required Context Sections for new_task**

When creating a new AI task session, **ALWAYS** include these sections:

#### 1. **Current Work Summary**
```markdown
**Current Work:** [Detailed description of what was being worked on]
**GitHub Project Context:**
- **Related GitHub Tasks:** [List GitHub project items being worked on]
- **Task Status:** [Current lane status for each GitHub item]
- **Project Completion:** [Overall GitHub project completion percentage]

**Implementation Context:**
- **Specific Task:** [Exact implementation goals]
- **Progress Status:** [What was completed, what remains]
- **Last Actions:** [Recent changes made, files modified, tests added]
- **Stopping Point:** [Exact point where work was paused]
- **Next Immediate Steps:** [What should happen next]
```

#### 2. **Technical Implementation Context**
```markdown
**Build and Package Status:**
- **Frontend Status:** Lexer (✅ Complete), Parser (✅ Complete), AST (✅ Complete)
- **Backend Status:** Semantic (🔄 In Progress), IL (✅ Complete), Codegen (❌ Not Started)
- **Current Package:** [Package being worked on]
- **Build Health:** [yarn build && yarn test status]
- **Test Coverage:** [Current test counts and coverage stats]
- **Recent Changes:** [Files modified, APIs implemented, architectural decisions]
```

#### 3. **Blend65 Language Specification Context**
```markdown
**Specification Alignment:**
- **Language Version:** [v0.1/v0.2/v0.3 features being implemented]
- **Grammar Rules:** [Specific EBNF rules relevant to current work]
- **Storage Classes:** [zp/ram/data/const/io usage patterns and implementation status]
- **Callback System:** [Function pointer semantics, interrupt handling implementation]
- **Type System:** [Current type checking implementation status]
- **Hardware APIs:** [c64.sprites/vic/sid/etc. implementation status and gaps]
- **6502 Constraints:** [Memory layout, register allocation, performance considerations]
```

#### 4. **Architecture and Design Context**
```markdown
**Architectural Decisions:**
- **Design Patterns:** [Visitor pattern usage, Result types, Factory patterns, etc.]
- **Package Dependencies:** [How current package relates to others, dependency flow]
- **Error Handling:** [Current error propagation strategies and patterns]
- **Code Quality Standards:** [TypeScript strict mode compliance, test coverage requirements]
- **Performance Considerations:** [6502 constraints, memory usage, compilation speed]
- **Integration Points:** [How components connect, data flow between packages]
```

#### 5. **Evolution and Roadmap Context**
```markdown
**Evolution Alignment:**
- **Target Version:** [Which Blend65 version this work enables]
- **Game Compatibility:** [Which analyzed games become portable through this work]
- **Missing Features:** [Known gaps this work addresses from feature matrix]
- **Priority Level:** [CRITICAL/HIGH/MEDIUM/LOW based on evolution roadmap]
- **Roadmap Impact:** [How this advances toward version milestones]
- **Research Integration:** [How current work builds on previous research findings]
```

#### 6. **Quality and Testing Context**
```markdown
**Quality Status:**
- **Test Strategy:** [Current testing approach, coverage goals, test patterns]
- **Quality Gates:** [Build health status, test passing rates, TypeScript compliance]
- **Known Issues:** [Any failing tests, build problems, technical debt]
- **Validation Requirements:** [How to verify completion, acceptance criteria]
- **Integration Testing:** [Cross-package testing requirements and status]
- **Performance Validation:** [Benchmarks, memory usage, compilation speed targets]
```

#### 7. **Next Steps and Dependencies**
```markdown
**Immediate Actions:**
1. **Next Implementation Step:** [Specific next technical task]
2. **GitHub Task Management:** [Tasks to create, move, or update in GitHub project]
3. **Dependencies:** [What must be completed first, blocking issues]
4. **Validation:** [How to test/verify the work, quality checks]
5. **Documentation:** [What docs need updating, API documentation]
6. **Evolution Impact:** [How to update roadmap/matrices after completion]

**Pending Work:**
- **Implementation Queue:** [List all known follow-up implementation work]
- **GitHub Task Updates:** [Project items awaiting completion or updates]
- **Dependencies:** [Work waiting for current completion]
- **Future Version Requirements:** [Features this enables for v0.2, v0.3, etc.]
```

---

## Context Quality Assurance

### **Context Completeness Validation**

Before creating a new_task, ensure the context includes:

**✅ Required Information Checklist:**
- [ ] **GitHub project status** - current task states, lane distribution, completion percentage
- [ ] **Build health reality** - actual package states, test counts, compilation status
- [ ] **Implementation specifics** - exact files changed, APIs added, architectural decisions
- [ ] **Specification compliance** - which language features implemented, grammar rules followed
- [ ] **Evolution alignment** - version targeting, game compatibility impact, roadmap progress
- [ ] **Quality metrics** - test coverage, build health, known issues and technical debt
- [ ] **Next steps clarity** - specific actions, GitHub task management, validation requirements
- [ ] **Dependencies mapping** - what's blocked, what's ready, critical path analysis

**❌ Context Red Flags (Fix Before Proceeding):**
- Generic descriptions without GitHub project correlation
- Theoretical status vs. actual build/implementation reality
- Missing specification alignment with current language features
- Unclear next steps or GitHub task management actions
- No mention of evolution/roadmap impact
- Missing quality status or known issues
- Vague architectural decisions without technical details

### **Context Accuracy Verification**

**Before finalizing new_task context, validate:**

1. **GitHub Project Alignment**
   - Check actual GitHub project item status vs. claimed progress
   - Verify lane distribution matches current work state
   - Confirm task completion percentages are accurate

2. **Build Health Verification**
   - Run `yarn clean && yarn build && yarn test` to confirm status
   - Verify package build states and test coverage numbers
   - Check TypeScript compilation status and error counts

3. **Specification Compliance Check**
   - Reference `docs/BLEND65_LANGUAGE_SPECIFICATION.md` for current requirements
   - Verify implemented features match specification exactly
   - Confirm grammar rule compliance and error handling

4. **Evolution Document Consistency**
   - Cross-reference `docs/research/BLEND65_EVOLUTION_ROADMAP.md` priorities
   - Verify `docs/research/BLEND65_MISSING_FEATURES_MATRIX.md` accuracy
   - Ensure game compatibility assessments reflect current implementation

---

## Recovery Procedures

### **When Context Is Lost or Corrupted**

If you find yourself working without proper context:

1. **STOP IMMEDIATELY** - Do not proceed without comprehensive context
2. **Execute Context Recovery Protocol:**

#### Context Recovery Protocol

```markdown
## Emergency Context Recovery

### Phase 1: GitHub Project Assessment
1. **Load GitHub Configuration:** `source .github/project_config`
2. **Get Project Status:** Run GitHub project status queries
3. **Analyze Task Distribution:** Check current lane states and completion rates
4. **Identify Active Work:** Find tasks in In Progress and Test lanes

### Phase 2: Build Health Assessment
1. **Validate Build State:** `yarn clean && yarn build && yarn test`
2. **Check Package Health:** Verify individual package build and test status
3. **Assess Quality Gates:** Run TypeScript compilation and coverage checks
4. **Document Build Reality:** Record actual vs. theoretical implementation status

### Phase 3: Implementation Reality Check
1. **Read PROJECT_STATUS.md** - Get documented current status
2. **Review Recent Git History** - `git log --oneline -20` for latest changes
3. **Check File Modification Dates** - Understand recent development activity
4. **Validate Package States** - Check dist/ folders and test coverage

### Phase 4: Specification and Evolution Alignment
1. **Review Language Specification** - Check current implementation vs. spec
2. **Check Evolution Documents** - Verify roadmap priorities and feature status
3. **Validate Game Compatibility** - Confirm current implementation capabilities
4. **Cross-Reference Feature Matrix** - Update status based on actual implementation

### Phase 5: Create Recovery Context
1. **Comprehensive Context Creation** - Use new_task with all recovered information
2. **GitHub Task Synchronization** - Update GitHub project items if needed
3. **Quality Status Documentation** - Record current health and known issues
4. **Evolution Impact Assessment** - Document how current state affects roadmap
```

### **Context Validation Failure Recovery**

**If quality gates fail during context creation:**

1. **Priority 1: Fix Critical Issues**
   - Resolve TypeScript compilation errors immediately
   - Fix failing tests before documenting context
   - Restore package build health to known-good state

2. **Document Recovery Actions**
   - Note what was broken and how it was fixed
   - Update context with recovery actions taken
   - Include lessons learned to prevent future issues

3. **Continue with Validated Context**
   - Proceed only after all quality gates pass
   - Include recovery experience in architectural notes
   - Update GitHub project items with recovery status

---

## Summary

This task management system ensures seamless integration between AI context preservation and GitHub project management:

### **Key Integration Points:**

✅ **AI Context Preservation**: new_task tool maintains technical knowledge across sessions
✅ **GitHub Project Tracking**: 5-lane workflow tracks implementation progress
✅ **Build Health Integration**: Context always includes actual build and test status
✅ **Specification Compliance**: Context preserves language specification alignment
✅ **Evolution Alignment**: Context maintains roadmap and game compatibility focus
✅ **Quality Assurance**: Context includes comprehensive quality gates and metrics

### **Workflow Benefits:**

- **No Lost Context**: Complex compiler development continues seamlessly
- **Project Visibility**: GitHub provides clear progress tracking and task management
- **Quality Maintenance**: Context preserves architectural patterns and standards
- **Specification Compliance**: Continuous reference to language requirements
- **Evolution Focus**: All work aligns with strategic roadmap and game compatibility goals

**Remember:** Context preservation through new_task is critical infrastructure for successful compiler development. Combined with GitHub project management, it enables both technical excellence and project visibility.

**Context is code. GitHub is progress. Together they enable success.**
