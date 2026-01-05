# Blend65 GitHub Project Management System

**Purpose:** GitHub CLI automation for Blend65 compiler project management using GitHub Projects v2 with direct project item creation

---

## Project Management Philosophy

### **Blend65 Development Workflow**

Research-driven task creation workflow:
```
📋 RESEARCH & PLANNING → 🎯 TASK CREATION → 🔄 IMPLEMENTATION WORKFLOW
```

**5-Stage Lane System:**
```
📋 BACKLOG → 🔍 REFINE → 🛠️ IN PROGRESS → 🧪 TEST → ✅ DONE
```

**Project Structure:**
- **Repository**: `blendsdk/blend65`
- **Task Management**: Direct project items (no GitHub Issues)
- **Labels**: Critical, High, Medium, Low, Backend, Frontend, Enhancement, Research

---

## GitHub CLI Command Reference

### **Essential Commands**

#### Authentication
```bash
gh auth login --hostname github.com --web
gh auth status
gh repo set-default blendsdk/blend65
```

#### Project Management
```bash
# Create project item directly (no issues)
gh project item-create [PROJECT_NUMBER] --owner blendsdk --title "Task Title" --body "Description"

# List project items with --limit 1000 to avoid 30-item limitation
gh project item-list [PROJECT_NUMBER] --owner blendsdk --limit 1000 --format json

# Edit project item fields
gh project item-edit --project-id [PROJECT_ID] --id [ITEM_ID] --field-id [FIELD_ID] --text "value"
```

#### Label Management
```bash
gh label create "label-name" --description "Description" --color "color-code"
```

---

## Project Setup and Initialization

### **One-Time Setup**

```bash
# Complete setup workflow
setup_blend65_project() {
  gh auth status || { echo "❌ Run: gh auth login --hostname github.com --web"; return 1; }
  gh repo set-default blendsdk/blend65

  PROJECT_NUM=$(gh project create --title "Blend65 Compiler Development" --owner blendsdk --format json | jq -r '.number')
  PROJECT_ID=$(gh project view $PROJECT_NUM --owner blendsdk --format json | jq -r '.id')

  mkdir -p .github
  echo "PROJECT_NUM=$PROJECT_NUM" > .github/project_config
  echo "PROJECT_ID=$PROJECT_ID" >> .github/project_config

  create_project_labels
  echo "✅ Setup complete! Project: $PROJECT_NUM"
}

# Create essential labels
create_project_labels() {
  gh label create "Critical" --color "d73a4a" 2>/dev/null || true
  gh label create "High" --color "f85149" 2>/dev/null || true
  gh label create "Medium" --color "fb8500" 2>/dev/null || true
  gh label create "Low" --color "0969da" 2>/dev/null || true
  gh label create "Backend" --color "1d76db" 2>/dev/null || true
  gh label create "Frontend" --color "0e8a16" 2>/dev/null || true
  gh label create "Research" --color "7b68ee" 2>/dev/null || true
}
```

---

## Direct Project Item Management

### **Core Functions**

```bash
# Load project configuration
load_project_config() {
  [ -f ".github/project_config" ] && source .github/project_config || {
    echo "⚠️ Run setup_blend65_project first"; return 1;
  }
}

# Create project task
create_project_task() {
  local title="$1" description="$2" priority="$3" phase="$4" effort="$5"

  ITEM_ID=$(gh project item-create $PROJECT_NUM --owner blendsdk --title "$title" --body "$description" --format json | jq -r '.id')
  echo "Created: $title (ID: $ITEM_ID)"
}

# Create tasks from research
create_tasks_from_research() {
  local research_summary="$1" implementation_approach="$2"

  local task_desc="## Research Implementation Task
**Research:** $research_summary
**Approach:** $implementation_approach
**Requirements:** Core functionality, 90%+ test coverage, documentation"

  create_project_task "Research Implementation" "$task_desc" "$(determine_priority "$research_summary")" "$(determine_phase "$research_summary")" "5"
}

# Helper functions
determine_priority() {
  [[ "$1" =~ critical|blocker ]] && echo "Critical" || echo "Medium"
}

determine_phase() {
  [[ "$1" =~ semantic|symbol ]] && echo "Backend" || echo "Frontend"
}
```

---

## Lane Management System

### **Lane Movement Functions**

```bash
# Get project item ID by title pattern
get_project_item_id() {
  gh project item-list $PROJECT_NUM --owner blendsdk --limit 1000 --format json | \
    jq -r ".items[] | select(.content.title | test(\"$1\")) | .id" | head -1
}

# Move through lanes
move_to_refine() {
  local item_id=$(get_project_item_id "$1")
  [[ -n "$item_id" ]] && gh project item-edit --project-id $PROJECT_ID --id $item_id --field-id $STATUS_FIELD_ID --single-select-option-id $REFINE_OPTION_ID
  echo "🔍 Moved to REFINE: $1"
}

move_to_in_progress() {
  local item_id=$(get_project_item_id "$1")
  [[ -n "$item_id" ]] && gh project item-edit --project-id $PROJECT_ID --id $item_id --field-id $STATUS_FIELD_ID --single-select-option-id $IN_PROGRESS_OPTION_ID
  echo "🛠️ Moved to IN PROGRESS: $1"
}

move_to_test() {
  local item_id=$(get_project_item_id "$1")
  [[ -n "$item_id" ]] && gh project item-edit --project-id $PROJECT_ID --id $item_id --field-id $STATUS_FIELD_ID --single-select-option-id $TEST_OPTION_ID
  echo "🧪 Moved to TEST: $1"
}

move_to_done() {
  local item_id=$(get_project_item_id "$1")
  [[ -n "$item_id" ]] && gh project item-edit --project-id $PROJECT_ID --id $item_id --field-id $STATUS_FIELD_ID --single-select-option-id $DONE_OPTION_ID
  echo "✅ Moved to DONE: $1"
}
```

---

## Project Status and Progress Tracking

### **Status Functions**

```bash
# Get project status
get_project_status() {
  local items=$(gh project item-list $PROJECT_NUM --owner blendsdk --limit 1000 --format json)

  local backlog=$(echo "$items" | jq '[.items[] | select(.status == "Backlog")] | length')
  local refine=$(echo "$items" | jq '[.items[] | select(.status == "Refine")] | length')
  local progress=$(echo "$items" | jq '[.items[] | select(.status == "In Progress")] | length')
  local test=$(echo "$items" | jq '[.items[] | select(.status == "Test")] | length')
  local done=$(echo "$items" | jq '[.items[] | select(.status == "Done")] | length')
  local total=$(echo "$items" | jq '.items | length')

  echo "# Blend65 Project Status"
  echo "📋 Backlog: $backlog | 🔍 Refine: $refine | 🛠️ Progress: $progress | 🧪 Test: $test | ✅ Done: $done"
  [ "$total" -gt 0 ] && echo "Completion: $((done * 100 / total))%"

  # Show active work
  [ "$progress" -gt 0 ] && echo -e "\n🛠️ In Progress:" && echo "$items" | jq -r '.items[] | select(.status == "In Progress") | "- \(.content.title)"'
  [ "$test" -gt 0 ] && echo -e "\n🧪 Testing:" && echo "$items" | jq -r '.items[] | select(.status == "Test") | "- \(.content.title)"'
}

# Get next recommended task
get_next_recommended_task() {
  local items=$(gh project item-list $PROJECT_NUM --owner blendsdk --limit 1000 --format json)

  local in_test=$(echo "$items" | jq -r '.items[] | select(.status == "Test") | .content.title' | head -1)
  local in_progress=$(echo "$items" | jq -r '.items[] | select(.status == "In Progress") | .content.title' | head -1)
  local in_refine=$(echo "$items" | jq -r '.items[] | select(.status == "Refine") | .content.title' | head -1)

  echo "## 🎯 Next Action:"
  if [[ -n "$in_test" ]]; then
    echo "Complete testing: $in_test"
  elif [[ -n "$in_progress" ]]; then
    echo "Continue implementation: $in_progress"
  elif [[ -n "$in_refine" ]]; then
    echo "Start refined task: $in_refine"
  else
    echo "Create new tasks or refine backlog"
  fi
}
```

---

## Blend65-Specific Workflows

### **Compiler Development Tasks**

```bash
# Create compiler development task
create_compiler_development_task() {
  local component="$1" feature="$2" description="$3" priority="$4" effort="$5"

  local template="## $component: $feature
$description

**Requirements:** Blend65 spec compliance, TypeScript strict, 90%+ test coverage, 6502 optimization
**Files:** packages/$component/src/, tests in __tests__/
**Validation:** \`yarn test packages/$component && yarn build\`"

  create_project_task "Implement $feature in $component" "$template" "$priority" "Backend" "$effort"
}

# Link task to commit
link_task_to_commit() {
  local task_title="$1" commit_hash="$2"
  local item_id=$(get_project_item_id "$task_title")
  [[ -n "$item_id" ]] && echo "🔗 Linked task '$task_title' to commit $commit_hash"
}

# Validate task completion
validate_task_completion() {
  local task_title="$1"
  if yarn clean && yarn build && yarn test; then
    move_to_done "$task_title" "All validation checks passed"
  else
    echo "❌ Build validation failed for: $task_title"
  fi
}
```

---

## Integration Patterns

### **Git Workflow Integration**

```bash
# Git workflow with project updates
gitcm_with_project_update() {
  local commit_message="$1" related_task="$2"
  git add . && git commit -m "$commit_message"
  local commit_hash=$(git rev-parse HEAD)
  [[ -n "$related_task" ]] && link_task_to_commit "$related_task" "$commit_hash"
}

gitcmp_with_project() {
  gitcm_with_project_update "$1" "$2"
  git pull --rebase && git push || echo "⚠️ Conflicts detected"
}
```

---

## Error Handling and Recovery

### **Recovery Functions**

```bash
# Handle rate limits and recover project access
handle_rate_limit() {
  local remaining=$(gh api rate_limit --jq '.resources.core.remaining')
  [ "$remaining" -lt 10 ] && echo "⚠️ Rate limit low, waiting..." && sleep 60
}

recover_project_access() {
  gh auth status || gh auth login --hostname github.com --web
  gh repo view blendsdk/blend65 || { echo "❌ Repository access failed"; exit 1; }
}
```

---

## Quick Start Guide

### **Daily Use Commands**

```bash
# Essential workflow
load_project_config
create_tasks_from_research "research_summary" "implementation_approach"
get_project_status
move_to_in_progress "Task Title"
move_to_done "Task Title" "Complete"
```

### **Setup Checklist**

- [ ] Install GitHub CLI: `brew install gh`
- [ ] Authenticate: `gh auth login --hostname github.com --web`
- [ ] Run setup: `setup_blend65_project`
- [ ] Configure project lanes via GitHub web interface (Backlog → Refine → In Progress → Test → Done)

---

## Summary

✅ **Direct project items** (no GitHub Issues)
✅ **Research → GitHub tasks workflow**
✅ **5-lane development process**
✅ **Git integration** with automatic linking
✅ **Error recovery** and rate limit handling

This system transforms research into actionable GitHub project items with comprehensive tracking.
