import { readFileSync, writeFileSync } from 'fs';

const testFile = 'packages/compiler/src/__tests__/semantic/analysis/reaching-definitions.test.ts';

console.log('Reading test file...');
let content = readFileSync(testFile, 'utf-8');

console.log('Converting fn {...} syntax to function...end function syntax...');

// Convert fn function declarations to function declarations
// Pattern: fn name(params): type {
content = content.replace(/fn\s+(\w+)\(([^)]*)\):\s*(\w+)\s*\{/g, (match, name, params, returnType) => {
  return `module Test\n\nfunction ${name}(${params}): ${returnType}`;
});

// Remove semicolons from variable declarations and assignments
content = content.replace(/;\s*$/gm, '');

// Replace closing braces with end function
// This is tricky - we need to replace the closing } that belongs to the function
// Look for patterns like:
//   }
// followed by spaces/newlines and then either ` or EOF

// First, let's count how many changes we need
const fnCount = (content.match(/module Test/g) || []).length;
console.log(`Found ${fnCount} function declarations to convert`);

// For each function, find its closing brace and replace with end function
// We'll do this by finding ` followed by };
content = content.replace(/\s*\}\s*`/g, '\nend function\n      `');

// Handle the last one if it doesn't have the pattern above
// Sometimes it's just:
//         }
//       `;
content = content.replace(/(\s+)\}\s*\n\s*`;/g, '$1end function\n      `;');

console.log('Writing fixed test file...');
writeFileSync(testFile, content, 'utf-8');

console.log('✓ Test file syntax fixed!');
console.log(`✓ Converted ${fnCount} function declarations`);
console.log('✓ Removed semicolons from statements');
console.log('✓ Replaced closing braces with "end function"');