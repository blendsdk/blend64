# Blend65 GitHub CLI Project Management System

**Purpose:** Comprehensive GitHub CLI automation for Blend65 compiler project management using GitHub Projects v2

---

## Table of Contents

1. [Project Management Philosophy](#project-management-philosophy)
2. [GitHub CLI Command Reference](#github-cli-command-reference)
3. [Project Setup and Initialization](#project-setup-and-initialization)
4. [Work Item Lifecycle Management](#work-item-lifecycle-management)
5. [Lane Management System](#lane-management-system)
6. [Milestone and Progress Tracking](#milestone-and-progress-tracking)
7. [Blend65-Specific Workflows](#blend65-specific-workflows)
8. [Automation Commands](#automation-commands)
9. [Integration Patterns](#integration-patterns)
10. [Error Handling and Recovery](#error-handling-and-recovery)

---

## Project Management Philosophy

### **Blend65 Development Lanes**

The Blend65 project uses a 5-stage workflow optimized for compiler development:

```
📋 BACKLOG → 🔍 REFINE → 🛠️ IN PROGRESS → 🧪 TEST → ✅ DONE
```

**Lane Definitions:**
- **📋 BACKLOG**: Tasks identified but not yet detailed
- **🔍 REFINE**: Tasks being refined with detailed specifications
- **🛠️ IN PROGRESS**: Active implementation work
- **🧪 TEST**: Implementation complete, testing and validation
- **✅ DONE**: Completed and validated tasks

### **Project Structure**
- **Repository**: `blendsdk/blend65`
- **Project Name**: "Blend65 Compiler Backend Implementation"
- **Milestones**: Phase 3 (Code Generation), Phase 4 (Hardware APIs)
- **Labels**: Critical, High, Medium, Backend, Frontend, Enhancement

---

## GitHub CLI Command Reference

### **Core Commands for Project Management**

#### Authentication and Setup
```bash
# Authenticate with GitHub (one-time setup)
gh auth login --hostname github.com --web

# Check authentication status
gh auth status

# Set default repository
gh repo set-default blendsdk/blend65
```

#### Project Commands
```bash
# List all projects for the repository owner
gh project list --owner blendsdk

# View project details
gh project view [PROJECT_NUMBER] --owner blendsdk

# Create new project
gh project create --title "Project Name" --owner blendsdk

# Edit project settings
gh project edit [PROJECT_NUMBER] --title "New Title" --owner blendsdk
```

#### Issue Management
```bash
# Create issue
gh issue create --title "Title" --body "Description" --label "label1,label2" --milestone "milestone"

# List issues
gh issue list --state open --limit 50

# View issue details
gh issue view [ISSUE_NUMBER]

# Edit issue
gh issue edit [ISSUE_NUMBER] --title "New Title" --body "New Description"

# Close issue
gh issue close [ISSUE_NUMBER] --comment "Completion comment"

# Assign issue
gh issue edit [ISSUE_NUMBER] --add-assignee username
```

#### Project Item Management
```bash
# Add issue to project
gh project item-add [PROJECT_NUMBER] --owner blendsdk --url https://github.com/blendsdk/blend65/issues/[ISSUE_NUMBER]

# List project items
gh project item-list [PROJECT_NUMBER] --owner blendsdk

# Edit project item fields
gh project item-edit --project-id [PROJECT_ID] --id [ITEM_ID] --field-id [FIELD_ID] --text "value"

# Delete project item
gh project item-delete --project-id [PROJECT_ID] --id [ITEM_ID]
```

---

## Project Setup and Initialization

### **Initial Project Creation**

When setting up the Blend65 project management system:

```bash
# Step 1: Create the main project
gh project create --title "Blend65 Compiler Backend Implementation" --owner blendsdk

# Step 2: Note the project number returned (use in subsequent commands)
PROJECT_NUM=[returned_project_number]

# Step 3: Get project ID for advanced operations
gh project view $PROJECT_NUM --owner blendsdk --format json | jq -r '.id'
PROJECT_ID=[extracted_project_id]
```

### **Configure Project Fields**

```bash
# Add custom fields for Blend65 tracking
# Priority field (Single Select: Critical, High, Medium, Low)
# Phase field (Single Select: Phase 3, Phase 4, Enhancement)
# Effort field (Number: 1-10 scale)
# Dependencies field (Text: linked issue numbers)

# Note: Custom field creation requires GraphQL API or web interface
# Document field IDs after creation for scripting
```

### **Create Project Lanes**

```bash
# GitHub Projects v2 uses "Status" field with custom values
# Configure via web interface or GraphQL:
# - Backlog (📋)
# - Refine (🔍)
# - Develop (🛠️)
# - Test (🧪)
# - Done (✅)
```

### **Initial Milestones**

```bash
# Create Phase 3 milestone
gh api repos/blendsdk/blend65/milestones \
  --method POST \
  --field title='Phase 3: Code Generation' \
  --field description='6502 assembly generation from IL (Tasks 3.1-3.5)' \
  --field due_on='2026-02-28T23:59:59Z'

# Create Phase 4 milestone
gh api repos/blendsdk/blend65/milestones \
  --method POST \
  --field title='Phase 4: Hardware APIs' \
  --field description='Hardware abstraction and multi-platform support (Tasks 4.1-4.8)' \
  --field due_on='2026-04-15T23:59:59Z'
```

---

## Work Item Lifecycle Management

### **Creating New Work Items**

#### Standard Task Creation Pattern
```bash
# Function to create Blend65 compiler tasks
create_compiler_task() {
  local title="$1"
  local phase="$2"
  local priority="$3"
  local description="$4"
  local effort="$5"

  # Create the issue
  ISSUE_URL=$(gh issue create \
    --title "$title" \
    --body "$description" \
    --label "backend,$priority,compiler,$phase" \
    --milestone "$phase" \
    --format json | jq -r '.url')

  # Add to project
  gh project item-add $PROJECT_NUM --owner blendsdk --url "$ISSUE_URL"

  echo "Created task: $title"
  echo "Issue URL: $ISSUE_URL"
}

# Example usage:
create_compiler_task \
  "Task 3.1: 6502 Code Generation Infrastructure" \
  "Phase 3" \
  "Critical" \
  "$(cat task_3_1_description.md)" \
  "8"
```

#### Batch Task Creation
```bash
# Create multiple related tasks
create_phase_tasks() {
  local phase="$1"
  local tasks_file="$2"

  while IFS='|' read -r task_id title priority effort description; do
    [[ "$task_id" =~ ^#.*$ ]] && continue  # Skip comments

    create_compiler_task \
      "$task_id: $title" \
      "$phase" \
      "$priority" \
      "$description" \
      "$effort"

    sleep 1  # Rate limiting
  done < "$tasks_file"
}
```

### **Work Item Templates**

#### Phase 3 Code Generation Task Template
```markdown
## Goal
[Brief task objective]

## Dependencies
- ✅ [Completed dependency]
- 🔄 [Pending dependency]

## Implementation Requirements
- [ ] Core functionality
- [ ] Error handling
- [ ] Performance optimization
- [ ] 6502-specific considerations

## Success Criteria
- [ ] Functional implementation
- [ ] Comprehensive tests (>90% coverage)
- [ ] Integration validation
- [ ] Performance benchmarks

## 6502 Considerations
- Register allocation impact
- Memory layout implications
- Cycle count optimization
- Hardware constraint compliance

## Testing Strategy
- Unit tests for core functionality
- Integration tests with IL system
- Real hardware validation via emulator
- Performance benchmarking

## Files Modified
- `packages/codegen/src/[specific-files]`
- Test files in `__tests__/`

## Validation Commands
```bash
yarn test packages/codegen
yarn build && yarn test:integration
```

## Definition of Done
- [ ] Implementation complete and tested
- [ ] Code review approved
- [ ] CI/CD pipeline passes
- [ ] Documentation updated
- [ ] Performance validated
```

---

## Lane Management System

### **Moving Items Between Lanes**

#### Individual Item Movement
```bash
# Move item from Backlog to Refine
move_to_refine() {
  local issue_number="$1"
  local item_id=$(get_project_item_id $issue_number)

  gh project item-edit \
    --project-id $PROJECT_ID \
    --id $item_id \
    --field-id $STATUS_FIELD_ID \
    --single-select-option-id $REFINE_OPTION_ID

  # Add refinement comment
  gh issue comment $issue_number --body "🔍 **Moved to REFINE** - Detailing implementation requirements"
}

# Move item from Refine to In Progress
move_to_in_progress() {
  local issue_number="$1"
  local item_id=$(get_project_item_id $issue_number)

  gh project item-edit \
    --project-id $PROJECT_ID \
    --id $item_id \
    --field-id $STATUS_FIELD_ID \
    --single-select-option-id $IN_PROGRESS_OPTION_ID

  # Add development start comment
  gh issue comment $issue_number --body "🛠️ **Moved to IN PROGRESS** - Implementation started"
}

# Move item from In Progress to Test
move_to_test() {
  local issue_number="$1"
  local item_id=$(get_project_item_id $issue_number)

  gh project item-edit \
    --project-id $PROJECT_ID \
    --id $item_id \
    --field-id $STATUS_FIELD_ID \
    --single-select-option-id $TEST_OPTION_ID

  # Add testing comment with validation checklist
  gh issue comment $issue_number --body "🧪 **Moved to TEST** - Implementation complete, validation in progress

## Testing Checklist
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Performance benchmarks validated
- [ ] Code review complete"
}

# Move item from Test to Done
move_to_done() {
  local issue_number="$1"
  local item_id=$(get_project_item_id $issue_number)
  local completion_comment="$2"

  gh project item-edit \
    --project-id $PROJECT_ID \
    --id $item_id \
    --field-id $STATUS_FIELD_ID \
    --single-select-option-id $DONE_OPTION_ID

  # Close issue with completion summary
  gh issue close $issue_number --comment "✅ **TASK COMPLETE** - $completion_comment

## Completion Summary
- All success criteria met
- Tests passing: $(get_test_status)
- Performance validated: $(get_performance_status)
- Integration confirmed: $(get_integration_status)

Ready for next dependent tasks."
}
```

#### Utility Functions for Lane Management
```bash
# Get project item ID for an issue
get_project_item_id() {
  local issue_number="$1"
  gh project item-list $PROJECT_NUM --owner blendsdk --format json | \
    jq -r ".items[] | select(.content.number == $issue_number) | .id"
}

# Get current lane/status of an item
get_current_status() {
  local issue_number="$1"
  local item_id=$(get_project_item_id $issue_number)

  gh project item-list $PROJECT_NUM --owner blendsdk --format json | \
    jq -r ".items[] | select(.id == \"$item_id\") | .status"
}

# Bulk lane movement
bulk_move_to_lane() {
  local target_lane="$1"
  shift
  local issues=("$@")

  for issue in "${issues[@]}"; do
    case $target_lane in
      "refine") move_to_refine $issue ;;
      "in-progress") move_to_in_progress $issue ;;
      "test") move_to_test $issue ;;
      "done") move_to_done $issue "Bulk completion" ;;
    esac
    sleep 0.5  # Rate limiting
  done
}
```

---

## Milestone and Progress Tracking

### **Milestone Management**

```bash
# Get milestone information
get_milestone_progress() {
  local milestone_title="$1"

  gh api repos/blendsdk/blend65/milestones --jq ".[] | select(.title == \"$milestone_title\")" | \
    jq '{
      title: .title,
      open_issues: .open_issues,
      closed_issues: .closed_issues,
      completion: (.closed_issues / (.open_issues + .closed_issues) * 100)
    }'
}

# Update milestone due date
update_milestone_due_date() {
  local milestone_title="$1"
  local new_due_date="$2"  # Format: 2026-02-28T23:59:59Z

  local milestone_number=$(gh api repos/blendsdk/blend65/milestones --jq ".[] | select(.title == \"$milestone_title\") | .number")

  gh api repos/blendsdk/blend65/milestones/$milestone_number \
    --method PATCH \
    --field due_on="$new_due_date"
}

# Generate milestone progress report
generate_milestone_report() {
  local milestone_title="$1"

  echo "# $milestone_title Progress Report"
  echo "**Generated:** $(date)"
  echo ""

  local progress=$(get_milestone_progress "$milestone_title")
  local completion=$(echo $progress | jq -r '.completion')

  echo "## Overall Progress: ${completion}%"
  echo ""
  echo "### Task Status:"

  gh issue list --milestone "$milestone_title" --state all --format json | \
    jq -r '.[] | "- [\(if .state == "closed" then "x" else " " end)] \(.title) (\(.state))"'
}
```

### **Progress Tracking Functions**

```bash
# Daily progress check
daily_progress_check() {
  echo "# Blend65 Daily Progress Report - $(date '+%Y-%m-%d')"
  echo ""

  echo "## Phase 3 Progress:"
  generate_milestone_report "Phase 3: Code Generation"
  echo ""

  echo "## Phase 4 Progress:"
  generate_milestone_report "Phase 4: Hardware APIs"
  echo ""

  echo "## Recent Activity:"
  gh issue list --state all --limit 10 --sort updated --format json | \
    jq -r '.[] | "- \(.title) (Updated: \(.updated_at))"'
}

# Weekly summary
weekly_summary() {
  local week_start="$1"  # Format: 2026-01-01

  echo "# Weekly Summary: $week_start"
  echo ""

  echo "## Completed Tasks:"
  gh issue list --state closed --search "closed:>$week_start" --format json | \
    jq -r '.[] | "- ✅ \(.title)"'

  echo ""
  echo "## In Progress:"
  gh project item-list $PROJECT_NUM --owner blendsdk --format json | \
    jq -r '.items[] | select(.status == "Develop" or .status == "Test") | "- 🔄 \(.content.title)"'
}
```

---

## Blend65-Specific Workflows

### **Compiler Development Workflow Integration**

#### Task Creation for Compiler Phases
```bash
# Create Phase 3 tasks (Code Generation)
create_phase3_tasks() {
  # Task 3.1: 6502 Code Generation Infrastructure
  create_compiler_task \
    "Task 3.1: 6502 Code Generation Infrastructure" \
    "Phase 3" \
    "Critical" \
    "Create foundational 6502 code generation system with IL mapping, register allocation, and memory layout. This is the critical path task that enables all subsequent code generation work." \
    "8"

  # Task 3.2: Basic Instruction Mapping
  create_compiler_task \
    "Task 3.2: Basic Instruction Mapping" \
    "Phase 3" \
    "Critical" \
    "Implement IL to 6502 assembly instruction translation with addressing mode optimization and cycle count estimation." \
    "6"

  # Task 3.3: Register Allocation and Memory Management
  create_compiler_task \
    "Task 3.3: Register Allocation and Memory Management" \
    "Phase 3" \
    "High" \
    "Implement efficient A/X/Y register allocation with spill management and zero page optimization for storage classes." \
    "7"

  # Task 3.4: Hardware API Code Generation
  create_compiler_task \
    "Task 3.4: Hardware API Code Generation" \
    "Phase 3" \
    "High" \
    "Generate 6502 code for hardware module calls (c64.sprites, c64.vic, etc.) with proper register management and memory-mapped I/O access." \
    "6"

  # Task 3.5: Multi-Platform Code Generation
  create_compiler_task \
    "Task 3.5: Multi-Platform Code Generation" \
    "Phase 3" \
    "Medium" \
    "Extend code generation for VIC-20 and X16 targets with platform-specific optimizations and memory layout differences." \
    "5"
}

# Create Phase 4 tasks (Hardware APIs)
create_phase4_tasks() {
  # Task 4.1: Create 6502 Instruction Templates
  create_compiler_task \
    "Task 4.1: Create 6502 Instruction Templates" \
    "Phase 4" \
    "Critical" \
    "Define comprehensive 6502 instruction generation templates with addressing mode support and performance metrics." \
    "6"

  # ... continue with remaining Phase 4 tasks
}
```

#### Development Workflow Commands
```bash
# Start working on a task
start_task() {
  local issue_number="$1"
  local developer="$2"

  # Assign task
  gh issue edit $issue_number --add-assignee "$developer"

  # Move to In Progress lane
  move_to_in_progress $issue_number

  # Create development branch
  local branch_name="task-$issue_number-$(gh issue view $issue_number --json title --jq '.title' | tr '[:upper:]' '[:lower:]' | tr ' ' '-')"
  git checkout -b "$branch_name"

  echo "Started task $issue_number - Branch: $branch_name"
}

# Complete a task
complete_task() {
  local issue_number="$1"
  local commit_hash="$2"
  local test_results="$3"

  # Move to Test lane
  move_to_test $issue_number

  # Add completion comment with technical details
  gh issue comment $issue_number --body "🧪 **Implementation Complete**

## Technical Summary
- **Commit:** $commit_hash
- **Test Results:** $test_results
- **Files Modified:** $(git diff --name-only HEAD~5..HEAD | tr '\n' ', ')

## Performance Impact
- **Build Time:** $(measure_build_time)
- **Test Coverage:** $(get_test_coverage)
- **IL Generation:** $(measure_il_performance)

## Validation Checklist
- [ ] All tests passing
- [ ] Code review complete
- [ ] Performance benchmarks meet targets
- [ ] Documentation updated"

  # Wait for validation, then move to Done
  echo "Task $issue_number ready for final validation"
}

# Link task to commit
link_task_commit() {
  local issue_number="$1"
  local commit_hash="$2"

  gh issue comment $issue_number --body "🔗 **Linked to commit:** $commit_hash

View changes: https://github.com/blendsdk/blend65/commit/$commit_hash"
}
```

### **Integration with Build System**

```bash
# Validate task completion with build system
validate_task_completion() {
  local issue_number="$1"

  echo "Validating task $issue_number completion..."

  # Run build validation
  if yarn clean && yarn build && yarn test; then
    echo "✅ Build validation passed"

    # Move to Done and close
    move_to_done $issue_number "Build validation passed - all tests green"

    # Update project metrics
    update_project_metrics
  else
    echo "❌ Build validation failed"
    gh issue comment $issue_number --body "❌ **Build Validation Failed**

Please review test failures and fix before marking complete:
$(yarn test 2>&1 | tail -20)"
  fi
}

# Performance impact analysis
analyze_performance_impact() {
  local issue_number="$1"

  # Measure compilation performance
  local compile_time=$(time yarn build 2>&1 | grep real | awk '{print $2}')
  local test_time=$(time yarn test 2>&1 | grep real | awk '{print $2}')

  gh issue comment $issue_number --body "📊 **Performance Impact Analysis**

- **Build Time:** $compile_time
- **Test Time:** $test_time
- **Package Sizes:** $(du -sh packages/*/dist | head -5)
- **Memory Usage:** $(ps aux | grep node | awk '{sum+=$6} END {print sum/1024 " MB"}')

Performance impact: $(get_performance_rating $compile_time)"
}
```

---

## Automation Commands

### **Automated Project Management**

#### Daily Automation Scripts
```bash
# Morning standup preparation
morning_standup() {
  echo "# Blend65 Morning Standup - $(date '+%Y-%m-%d')"
  echo ""

  echo "## Today's Focus:"
  gh project item-list $PROJECT_NUM --owner blendsdk --format json | \
    jq -r '.items[] | select(.status == "In Progress") | "- 🛠️ \(.content.title) (@\(.assignees[0].login // "unassigned"))"'

  echo ""
  echo "## Ready for Testing:"
  gh project item-list $PROJECT_NUM --owner blendsdk --format json | \
    jq -r '.items[] | select(.status == "Test") | "- 🧪 \(.content.title)"'

  echo ""
  echo "## Blockers:"
  gh issue list --label "blocked" --format json | \
    jq -r '.[] | "- ⛔ \(.title) - \(.labels[] | select(.name == "blocked") | .description)"'
}

# Evening summary
evening_summary() {
  echo "# Blend65 Evening Summary - $(date '+%Y-%m-%d')"
  echo ""

  echo "## Completed Today:"
  gh issue list --state closed --search "closed:$(date '+%Y-%m-%d')" --format json | \
    jq -r '.[] | "- ✅ \(.title)"'

  echo ""
  echo "## In Progress:"
  gh project item-list $PROJECT_NUM --owner blendsdk --format json | \
    jq -r '.items[] | select(.status == "In Progress") | "- 🔄 \(.content.title)"'

  echo ""
  echo "## Tomorrow's Priorities:"
  gh project item-list $PROJECT_NUM --owner blendsdk --format json | \
    jq -r '.items[] | select(.status == "Refine") | "- 📋 \(.content.title)"' | head -3
}
```

#### Weekly Automation
```bash
# Weekly project health check
weekly_health_check() {
  echo "# Blend65 Weekly Health Check - Week of $(date '+%Y-%m-%d')"
  echo ""

  # Milestone progress
  echo "## Milestone Progress:"
  echo "### Phase 3: $(get_milestone_progress 'Phase 3: Code Generation' | jq -r '.completion')% Complete"
  echo "### Phase 4: $(get_milestone_progress 'Phase 4: Hardware APIs' | jq -r '.completion')% Complete"
  echo ""

  # Velocity tracking
  echo "## Development Velocity:"
  local completed_this_week=$(gh issue list --state closed --search "closed:>$(date -d '7 days ago' '+%Y-%m-%d')" --format json | jq length)
  echo "- **Tasks completed this week:** $completed_this_week"
  echo "- **Average task completion time:** $(calculate_average_completion_time)"
  echo ""

  # Risk assessment
  echo "## Risk Assessment:"
  local overdue_tasks=$(gh issue list --search "milestone:'Phase 3: Code Generation' is:open" --format json | jq length)
  if [ $overdue_tasks -gt 5 ]; then
    echo "- ⚠️ **HIGH RISK**: $overdue_tasks tasks still open in Phase 3"
  else
    echo "- ✅ **LOW RISK**: Phase 3 on track"
  fi
}

# Automated dependency checking
check_task_dependencies() {
  echo "# Task Dependency Analysis"
  echo ""

  gh project item-list $PROJECT_NUM --owner blendsdk --format json | \
    jq -r '.items[] | select(.status == "Backlog" or .status == "Refine") |
           "## \(.content.title)\n\(.content.body)" ' | \
    grep -A 5 "Dependencies" | \
    while read line; do
      if [[ $line =~ "🔄" ]]; then
        echo "⚠️ Dependency blocker found: $line"
      fi
    done
}
```

---

## Integration Patterns

### **Git Workflow Integration**

#### Branch Naming Convention
```bash
# Generate branch name from issue
get_branch_name() {
  local issue_number="$1"
  local title=$(gh issue view $issue_number --json title --jq '.title')
  echo "task-$issue_number-$(echo $title | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g')"
}

# Create feature branch linked to issue
create_feature_branch() {
  local issue_number="$1"
  local branch_name=$(get_branch_name $issue_number)

  git checkout main
  git pull origin main
  git checkout -b "$branch_name"

  # Link branch to issue
  gh issue comment $issue_number --body "🌿 **Feature branch created:** \`$branch_name\`

Development branch ready for implementation."

  echo "Created branch: $branch_name"
}

# Merge and close workflow
merge_and_close() {
  local issue_number="$1"
  local branch_name="$2"

  # Create PR
  local pr_url=$(gh pr create \
    --title "$(gh issue view $issue_number --json title --jq '.title')" \
    --body "Closes #$issue_number

$(gh issue view $issue_number --json body --jq '.body')" \
    --head "$branch_name" \
    --base main)

  # Link PR to issue
  gh issue comment $issue_number --body "📥 **Pull Request Created:** $pr_url

Ready for code review and testing."

  echo "Created PR: $pr_url"
}
```

### **CI/CD Integration**

```bash
# Monitor CI/CD status for tasks
monitor_ci_status() {
  local issue_number="$1"

  # Find associated PR
  local pr_number=$(gh issue view $issue_number --json body --jq '.body' | grep -o '#[0-9]*' | head -1 | tr -d '#')

  if [ -n "$pr_number" ]; then
    local ci_status=$(gh pr view $pr_number --json statusCheckRollup --jq '.statusCheckRollup.state')

    case $ci_status in
      "SUCCESS")
        gh issue comment $issue_number --body "✅ **CI/CD Pipeline Passed**

All checks completed successfully. Ready for final testing and merge."
        ;;
      "FAILURE")
        gh issue comment $issue_number --body "❌ **CI/CD Pipeline Failed**

Please review failures and fix before proceeding:
$(gh pr view $pr_number --json statusCheckRollup --jq '.statusCheckRollup.contexts[].conclusion')"
        ;;
      "PENDING")
        gh issue comment $issue_number --body "🔄 **CI/CD Pipeline Running**

Checks in progress. Will update when complete."
        ;;
    esac
  fi
}

# Automated testing integration
run_task_validation() {
  local issue_number="$1"

  echo "Running validation for task $issue_number..."

  # Run Blend65-specific tests
  local test_results=$(yarn test:semantic && yarn test:il && yarn test:codegen 2>&1)
  local test_status=$?

  if [ $test_status -eq 0 ]; then
    gh issue comment $issue_number --body "✅ **Validation Passed**

All Blend65 compiler tests completed successfully:
- ✅ Semantic Analysis Tests
- ✅ IL System Tests
- ✅ Code Generation Tests

Task ready for final review and closure."

    move_to_done $issue_number "All validation tests passed"
  else
    gh issue comment $issue_number --body "❌ **Validation Failed**

Test failures detected:
\`\`\`
$test_results
\`\`\`

Please fix failing tests before marking complete."
  fi
}
```

---

## Error Handling and Recovery

### **Common Error Scenarios**

#### API Rate Limiting
```bash
# Handle GitHub API rate limits
handle_rate_limit() {
  local max_retries=3
  local retry_count=0

  while [ $retry_count -lt $max_retries ]; do
    if gh api rate_limit --jq '.resources.core.remaining' | [ $(cat) -lt 10 ]; then
      local reset_time=$(gh api rate_limit --jq '.resources.core.reset')
      local wait_time=$((reset_time - $(date +%s) + 60))

      echo "⚠️ Rate limit approaching. Waiting $wait_time seconds..."
      sleep $wait_time
    else
      break
    fi

    retry_count=$((retry_count + 1))
  done

  if [ $retry_count -eq $max_retries ]; then
    echo "❌ Max retries reached. Please try again later."
    exit 1
  fi
}

# Project not found recovery
recover_project_access() {
  echo "🔍 **Project Access Recovery**"

  # Check authentication
  gh auth status || {
    echo "❌ Authentication failed. Please re-authenticate:"
    gh auth login --hostname github.com --web
  }

  # Check repository access
  gh repo view blendsdk/blend65 || {
    echo "❌ Repository access failed. Please check permissions."
    exit 1
  }

  # List available projects
  echo "📋 **Available Projects:**"
  gh project list --owner blendsdk
}

# Issue creation failure recovery
recover_issue_creation() {
  local title="$1"
  local body="$2"

  echo "🔄 **Retrying issue creation:** $title"

  # Validate inputs
  if [ -z "$title" ]; then
    echo "❌ Issue title cannot be empty"
    return 1
  fi

  # Retry with simpler approach
  local simple_issue_url=$(gh issue create \
    --title "$title" \
    --body "Issue created via recovery. Original description in comments." \
    --format json | jq -r '.url')

  if [ -n "$simple_issue_url" ]; then
    # Add full description as comment
    local issue_number=$(echo $simple_issue_url | grep -o '[0-9]*$')
    gh issue comment $issue_number --body "$body"
    echo "✅ Issue created with recovery method: $simple_issue_url"
  fi
}
```

#### Project State Recovery
```bash
# Recover from corrupted project state
recover_project_state() {
  echo "🔧 **Project State Recovery**"

  # Backup current state
  gh project item-list $PROJECT_NUM --owner blendsdk --format json > "project_backup_$(date +%s).json"

  # Validate all issues exist
  local missing_issues=()
  gh project item-list $PROJECT_NUM --owner blendsdk --format json | \
    jq -r '.items[].content.number' | \
    while read issue_num; do
      gh issue view $issue_num > /dev/null 2>&1 || {
        missing_issues+=($issue_num)
      }
    done

  if [ ${#missing_issues[@]} -gt 0 ]; then
    echo "⚠️ Found ${#missing_issues[@]} missing issues: ${missing_issues[*]}"
    echo "📋 Consider recreating missing issues from backup."
  fi
}
```

---

## Complete Setup Workflow

### **First-Time Project Setup**

```bash
# Complete Blend65 project setup
setup_blend65_project() {
  echo "🚀 **Setting up Blend65 GitHub Project Management**"

  # Step 1: Verify authentication
  gh auth status || {
    echo "❌ Please authenticate first: gh auth login --hostname github.com --web"
    return 1
  }

  # Step 2: Set repository default
  gh repo set-default blendsdk/blend65

  # Step 3: Create project
  echo "📋 Creating main project..."
  PROJECT_NUM=$(gh project create \
    --title "Blend65 Compiler Backend Implementation" \
    --owner blendsdk \
    --format json | jq -r '.number')

  echo "✅ Project created: #$PROJECT_NUM"

  # Step 4: Get project ID for advanced operations
  PROJECT_ID=$(gh project view $PROJECT_NUM --owner blendsdk --format json | jq -r '.id')
  echo "🔧 Project ID: $PROJECT_ID"

  # Step 5: Create milestones
  echo "🎯 Creating milestones..."
  create_project_milestones

  # Step 6: Store configuration
  echo "PROJECT_NUM=$PROJECT_NUM" > .github/project_config
  echo "PROJECT_ID=$PROJECT_ID" >> .github/project_config

  echo "✅ **Setup complete!** Project: $PROJECT_NUM"
  echo "📖 Next: Configure project lanes via GitHub web interface"
  echo "🏗️ Then run: create_phase3_tasks && create_phase4_tasks"
}

# Load project configuration
load_project_config() {
  if [ -f ".github/project_config" ]; then
    source .github/project_config
    echo "📋 Loaded project configuration: Project #$PROJECT_NUM"
  else
    echo "⚠️ Project configuration not found. Run setup_blend65_project first."
    return 1
  fi
}

# Create project milestones
create_project_milestones() {
  echo "🎯 Creating Phase 3 milestone..."
  gh api repos/blendsdk/blend65/milestones \
    --method POST \
    --field title='Phase 3: Code Generation' \
    --field description='6502 assembly generation from IL (Tasks 3.1-3.5)' \
    --field due_on='2026-02-28T23:59:59Z'

  echo "🎯 Creating Phase 4 milestone..."
  gh api repos/blendsdk/blend65/milestones \
    --method POST \
    --field title='Phase 4: Hardware APIs' \
    --field description='Hardware abstraction and multi-platform support (Tasks 4.1-4.8)' \
    --field due_on='2026-04-15T23:59:59Z'

  echo "✅ Milestones created successfully"
}
```

---

## Quick Start Guide

### **Essential Commands for Daily Use**

```bash
# Load configuration (run first)
load_project_config

# Create all Phase 3 & 4 tasks
create_phase3_tasks
create_phase4_tasks

# Start working on a task
start_task 123 your-github-username

# Move task through workflow
move_to_develop 123
move_to_test 123
move_to_done 123 "Implementation complete with all tests passing"

# Daily standup
morning_standup

# Weekly project health
weekly_health_check

# Emergency recovery
recover_project_access
```

### **One-Time Setup Checklist**

- [ ] **Install GitHub CLI**: `brew install gh`
- [ ] **Authenticate**: `gh auth login --hostname github.com --web`
- [ ] **Verify repository access**: `gh repo view blendsdk/blend65`
- [ ] **Run setup**: `setup_blend65_project`
- [ ] **Configure project lanes** via GitHub web interface:
  - Backlog (📋)
  - Refine (🔍)
  - Develop (🛠️)
  - Test (🧪)
  - Done (✅)
- [ ] **Create tasks**: `create_phase3_tasks && create_phase4_tasks`
- [ ] **Test workflow**: Move a task through lanes

### **Integration with Existing Workflow**

```bash
# Add to your shell profile (.zshrc, .bashrc)
alias blend65-standup='morning_standup'
alias blend65-status='weekly_health_check'
alias blend65-setup='setup_blend65_project'

# For task workflow automation
function blend65-start() {
  start_task $1 $(gh api user --jq '.login')
}

function blend65-complete() {
  local issue_num=$1
  local commit_hash=$(git rev-parse HEAD)
  complete_task $issue_num $commit_hash "Implementation complete"
}
```

---

## Summary

This GitHub CLI project management system provides:

✅ **Complete Project Lifecycle**: From setup to task completion
✅ **5-Lane Workflow**: Optimized for compiler development
✅ **Automation Integration**: Daily standup, weekly health checks
✅ **Error Recovery**: Robust handling of common failure scenarios
✅ **Git Integration**: Branch creation, PR linking, commit tracking
✅ **Performance Monitoring**: Build time, test coverage, metrics
✅ **Milestone Tracking**: Phase 3 & 4 progress monitoring

**Next Steps:**
1. Complete GitHub CLI authentication setup
2. Run `setup_blend65_project` to initialize the project
3. Configure project lanes via GitHub web interface
4. Create Phase 3 & 4 tasks with the provided functions
5. Begin using the workflow for daily Blend65 development

This system transforms file-based tracking into a professional, collaborative, and automated project management workflow optimized for the Blend65 compiler development process.
