import { readFileSync, writeFileSync } from 'fs';

const testFile = 'packages/compiler/src/__tests__/semantic/analysis/reaching-definitions.test.ts';

console.log('Reading test file...');
let content = readFileSync(testFile, 'utf-8');

console.log('Converting control flow syntax completely...');

// Step 1: Fix if statements: if (condition) { → if condition then
content = content.replace(/if\s+\(([^)]+)\)\s*\{/g, 'if $1 then');

// Step 2: Fix else clauses: } else { → else
content = content.replace(/\}\s*else\s*\{/g, 'else');

// Step 3: Fix while loops: while (condition) { → while condition
content = content.replace(/while\s+\(([^)]+)\)\s*\{/g, 'while $1');

// Step 4: Now handle closing braces
// We need to replace } with either "end if" or "end while"
// Strategy: Process line by line, track what blocks are open

const lines = content.split('\n');
const result = [];
const blockStack = []; // Stack to track open blocks

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();
  
  // Track block opening
  if (trimmed.startsWith('if ') && trimmed.includes(' then')) {
    blockStack.push('if');
    result.push(line);
  } else if (trimmed === 'else') {
    // else doesn't change the stack (it's part of if)
    result.push(line);
  } else if (trimmed.startsWith('while ')) {
    blockStack.push('while');
    result.push(line);
  } else if (trimmed === '}' || trimmed.startsWith('} ')) {
    // This is a closing brace - replace with appropriate end keyword
    const blockType = blockStack.pop();
    
    if (blockType === 'if') {
      result.push(line.replace(/\}/, 'end if'));
    } else if (blockType === 'while') {
      result.push(line.replace(/\}/, 'end while'));
    } else {
      // No block type (probably end function - keep as is)
      blockStack.push(blockType); // Put it back
      result.push(line);
    }
  } else {
    result.push(line);
  }
}

content = result.join('\n');

// Count changes
const ifCount = (content.match(/if .+ then/g) || []).length;
const whileCount = (content.match(/while \w+/g) || []).length;
const endIfCount = (content.match(/end if/g) || []).length;
const endWhileCount = (content.match(/end while/g) || []).length;

console.log(`✓ Converted ${ifCount} if statements (${endIfCount} end if)`);
console.log(`✓ Converted ${whileCount} while loops (${endWhileCount} end while)`);

writeFileSync(testFile, content, 'utf-8');

console.log('✓ Control flow syntax completely fixed!');