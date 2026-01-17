import { readFileSync, writeFileSync } from 'fs';

const testFile = 'packages/compiler/src/__tests__/semantic/analysis/reaching-definitions.test.ts';

console.log('Reading test file...');
let content = readFileSync(testFile, 'utf-8');

console.log('Fixing test source strings only (not TypeScript code)...');

// Strategy: Only fix content inside template literals (between ` marks)
// We'll process each test case separately

// Pattern: const source = `...content...`;
// We need to fix the content between the backticks

// Split by const source = ` to find all test sources
const parts = content.split('const source = `');
const fixed = [parts[0]]; // Keep the imports/header

for (let i = 1; i < parts.length; i++) {
  // Find the closing backtick
  const endIndex = parts[i].indexOf('`;');
  if (endIndex === -1) {
    fixed.push(parts[i]);
    continue;
  }
  
  let sourceCode = parts[i].substring(0, endIndex);
  const rest = parts[i].substring(endIndex);
  
  // Now fix the source code
  // 1. fn name(): type { → module Test\n\nfunction name(): type
  sourceCode = sourceCode.replace(/fn\s+(\w+)\(([^)]*)\):\s*(\w+)\s*\{/g, 
    'module Test\n\nfunction $1($2): $3');
  
  // 2. if (cond) { → if cond then
  sourceCode = sourceCode.replace(/if\s+\(([^)]+)\)\s*\{/g, 'if $1 then');
  
  // 3. } else { → else
  sourceCode = sourceCode.replace(/\}\s*else\s*\{/g, 'else');
  
  // 4. while (cond) { → while cond
  sourceCode = sourceCode.replace(/while\s+\(([^)]+)\)\s*\{/g, 'while $1');
  
  // 5. Remove semicolons at end of lines (but only in source code, not TS!)
  sourceCode = sourceCode.replace(/;(\s*\n)/g, '$1');
  
  // 6. Replace } with end if or end while or end function
  // We need to be smart about this
  // Split by lines and track blocks
  const lines = sourceCode.split('\n');
  const resultLines = [];
  const blockStack = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('if ') && trimmed.includes(' then')) {
      blockStack.push('if');
      resultLines.push(line);
    } else if (trimmed === 'else') {
      resultLines.push(line);
    } else if (trimmed.startsWith('while ')) {
      blockStack.push('while');
      resultLines.push(line);
    } else if (trimmed.startsWith('function ')) {
      blockStack.push('function');
      resultLines.push(line);
    } else if (trimmed === '}') {
      const blockType = blockStack.pop();
      if (blockType === 'if') {
        resultLines.push(line.replace('}', 'end if'));
      } else if (blockType === 'while') {
        resultLines.push(line.replace('}', 'end while'));
      } else if (blockType === 'function') {
        resultLines.push(line.replace('}', 'end function'));
      } else {
        resultLines.push(line); // Keep as is
      }
    } else {
      resultLines.push(line);
    }
  }
  
  sourceCode = resultLines.join('\n');
  
  fixed.push(sourceCode + rest);
}

content = fixed.join('const source = `');

// Verify structure is intact
const testCount = (content.match(/it\(/g) || []).length;
const importCount = (content.match(/^import /gm) || []).length;

console.log(`✓ File structure intact: ${testCount} tests, ${importCount} imports`);
console.log(`✓ Fixed ${parts.length - 1} test source blocks`);

writeFileSync(testFile, content, 'utf-8');

console.log('✓ Test file syntax fixed (sources only)!');