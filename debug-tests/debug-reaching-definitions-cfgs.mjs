import { Lexer } from '../packages/compiler/dist/lexer/index.js';
import { Parser } from '../packages/compiler/dist/parser/index.js';
import { SemanticAnalyzer } from '../packages/compiler/dist/semantic/index.js';
import { ReachingDefinitionsAnalyzer } from '../packages/compiler/dist/semantic/analysis/index.js';

const source = `
module Test

function test(): void
  let x: byte = 10
  let y: byte = x
end function
`;

console.log('=== Debug: CFG Function Names ===\n');

// Parse
const lexer = new Lexer(source);
const tokens = lexer.tokenize();
const parser = new Parser(tokens);
const ast = parser.parse();

console.log('1. AST Parsed Successfully');
console.log(`   - Declarations: ${ast.declarations.length}`);
console.log(`   - AST kind: ${ast.kind}`);

// Log all declarations
for (let i = 0; i < ast.declarations.length; i++) {
  const decl = ast.declarations[i];
  console.log(`   - Declaration ${i}: kind=${decl.kind}, type=${typeof decl}`);
  console.log(`     Constructor: ${decl.constructor?.name}`);
  console.log(`     Properties: ${Object.keys(decl).slice(0, 10).join(', ')}`);
  
  if (decl.kind === 'FunctionDeclaration') {
    console.log(`     Name: ${decl.name?.name || 'NO NAME'}`);
  }
}

// Semantic Analysis
const analyzer = new SemanticAnalyzer();
analyzer.analyze(ast);

console.log('\n2. Semantic Analysis Complete');
console.log(`   - Diagnostics: ${analyzer.getDiagnostics().length}`);
if (analyzer.getDiagnostics().length > 0) {
  console.log('   - First 3 diagnostics:');
  for (let i = 0; i < Math.min(3, analyzer.getDiagnostics().length); i++) {
    const diag = analyzer.getDiagnostics()[i];
    console.log(`     ${i+1}. ${diag.severity}: ${diag.message}`);
  }
}

// Get all CFGs
const cfgs = analyzer.getAllCFGs();

console.log('\n3. CFGs Map Contents:');
console.log(`   - Size: ${cfgs.size}`);
console.log(`   - Keys: ${JSON.stringify([...cfgs.keys()])}`);

// Try to get specific CFG
const testCFG = analyzer.getCFG('test');
console.log(`\n4. getCFG('test'): ${testCFG ? 'FOUND' : 'NOT FOUND'}`);

// Check what function declarations exist in AST
console.log('\n5. Function Declarations in AST:');
for (const decl of ast.declarations) {
  if (decl.kind === 'FunctionDeclaration') {
    console.log(`   - Function: ${decl.name.name}`);
  }
}

// Create reaching definitions analyzer
const symbolTable = analyzer.getSymbolTable();
const reachingAnalyzer = new ReachingDefinitionsAnalyzer(symbolTable, cfgs);

console.log('\n6. Running reaching definitions analysis...');
reachingAnalyzer.analyze(ast);

// Try to get reaching definitions
const reachingDefs = reachingAnalyzer.getReachingDefinitions('test');
console.log(`\n7. getReachingDefinitions('test'): ${reachingDefs ? 'FOUND' : 'NOT FOUND'}`);

if (reachingDefs) {
  console.log('   - Success! Definitions found.');
} else {
  console.log('   - FAILED! Returning undefined.');
  
  // Check internal storage
  console.log('\n8. Debugging internal storage:');
  console.log(`   - reachingAnalyzer has method: ${typeof reachingAnalyzer.getReachingDefinitions === 'function'}`);
  
  // Try all keys in CFGs
  console.log('\n9. Trying all CFG keys:');
  for (const key of cfgs.keys()) {
    const result = reachingAnalyzer.getReachingDefinitions(key);
    console.log(`   - getReachingDefinitions('${key}'): ${result ? 'FOUND' : 'NOT FOUND'}`);
  }
}

console.log('\n=== Debug Complete ===');