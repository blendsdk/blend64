import { readFileSync, writeFileSync } from 'fs';

const testFile = 'packages/compiler/src/__tests__/semantic/analysis/reaching-definitions.test.ts';

console.log('Reading test file...');
let content = readFileSync(testFile, 'utf-8');

console.log('Converting control flow syntax...');

// Fix if statements: if (condition) { → if condition then
content = content.replace(/if\s+\(([^)]+)\)\s*\{/g, 'if $1 then');

// Fix else clauses: } else { → else
content = content.replace(/\}\s*else\s*\{/g, 'else');

// Fix while loops: while (condition) { → while condition
content = content.replace(/while\s+\(([^)]+)\)\s*\{/g, 'while $1');

// Count changes
const ifCount = (content.match(/if .+ then/g) || []).length;
const whileCount = (content.match(/while \w+/g) || []).length;

console.log(`Found ${ifCount} if statements`);
console.log(`Found ${whileCount} while loops`);

// Now we need to replace closing braces with appropriate end keywords
// This is complex because we need to match braces to their statements

// For now, let's replace based on indentation patterns
// Pattern: lines ending with } that are inside functions

// Replace } followed by newline and more code (not end function) with end if/end while
// This is a heuristic approach

// Better approach: manually fix the remaining syntax issues
// Let me just convert simple patterns

// Fix standalone closing braces (these should be end if or end while)
// We'll do this by looking at context

console.log('Please note: Control flow end keywords need manual fixing');
console.log('You should replace closing } with:');
console.log('  - "end if" for if/else blocks');
console.log('  - "end while" for while loops');

writeFileSync(testFile, content, 'utf-8');

console.log('✓ Phase 1 complete: if/else/while syntax converted');
console.log('✓ Next: Manually replace closing } with end if/end while');