import { Lexer } from '../packages/compiler/dist/lexer/lexer.js';
import { Parser } from '../packages/compiler/dist/parser/parser.js';
import { SemanticAnalyzer } from '../packages/compiler/dist/semantic/analyzer.js';

// Test 1: Function WITHOUT parameters
const source1 = `
module Test

function test(): void
  let x: byte = 10
end function
`;

// Test 2: Function WITH parameters
const source2 = `
module Test

function test(flag: bool): void
  let x: byte = 10
end function
`;

console.log('=== Test 1: Function WITHOUT parameters ===');
try {
  const lexer1 = new Lexer(source1);
  const tokens1 = lexer1.tokenize();
  const parser1 = new Parser(tokens1);
  const ast1 = parser1.parse();
  const analyzer1 = new SemanticAnalyzer();
  analyzer1.analyze(ast1);
  
  const cfg1 = analyzer1.getCFG('test');
  console.log('CFG created:', cfg1 !== undefined);
  console.log('CFG details:', cfg1 ? 'EXISTS' : 'UNDEFINED');
} catch (e) {
  console.error('Error:', e.message);
}

console.log('\n=== Test 2: Function WITH parameters ===');
try {
  const lexer2 = new Lexer(source2);
  const tokens2 = lexer2.tokenize();
  const parser2 = new Parser(tokens2);
  const ast2 = parser2.parse();
  const analyzer2 = new SemanticAnalyzer();
  analyzer2.analyze(ast2);
  
  const cfg2 = analyzer2.getCFG('test');
  console.log('CFG created:', cfg2 !== undefined);
  console.log('CFG details:', cfg2 ? 'EXISTS' : 'UNDEFINED');
  
  // Check all CFGs
  const allCFGs = analyzer2.getAllCFGs();
  console.log('All CFGs:', Array.from(allCFGs.keys()));
} catch (e) {
  console.error('Error:', e.message);
}