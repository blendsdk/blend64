### Cline Commands

**CRITICALLY IMPORTANT**

1. IMPORTANT: Always perform the `gitcmp` or `gitcm` commands in a new Cline task with context.

   **Why:** This creates a clean task boundary for git operations while maintaining
   previous context, enabling better error recovery and workflow continuity.

   **How:** Use Cline's "New Task With Context" feature to start a fresh task
   that has access to previous work but creates a clean checkpoint for git operations.

When the user provides these keywords, Cline should perform the following actions:

#### `gitcm` - Git Commit with Message

1. Stage all changes (`git add .`)
2. Create a detailed, descriptive commit message following format:

   ```
   feat(package): implement feature description

   - Specific change 1
   - Specific change 2
   - Tests added/updated
   ```

3. Write commit message to temporary file (`/tmp/git_commit_msg.txt`)
4. Commit using the file (`git commit -F /tmp/git_commit_msg.txt`)
5. Clean up temporary file (`rm /tmp/git_commit_msg.txt`)

**Implementation Steps:**

```bash
# Stage changes
clear && git add .

# Create commit message file
cat > /tmp/git_commit_msg.txt << 'EOF'
feat(package): implement feature description

- Specific change 1
- Specific change 2
- Tests added/updated
EOF

# Commit using file
git commit -F /tmp/git_commit_msg.txt

# Clean up
rm /tmp/git_commit_msg.txt
```

#### `gitcmp` - Git Commit, Rebase, and Push

1. Perform `gitcm` workflow (stage all changes and create detailed commit using temporary file)
2. Pull and rebase if needed (`git pull --rebase`)
3. If there are no conflicts, push to remote (`git push`)
4. Report any conflicts for manual resolution

**Implementation Steps:**

```bash
# Stage changes
clear && git add .

# Create commit message file
cat > /tmp/git_commit_msg.txt << 'EOF'
feat(package): implement feature description

- Specific change 1
- Specific change 2
- Tests added/updated
EOF

# Commit using file
git commit -F /tmp/git_commit_msg.txt

# Clean up
rm /tmp/git_commit_msg.txt

# Rebase and push
git pull --rebase
git push
```
