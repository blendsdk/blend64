import { Lexer } from '../packages/compiler/dist/lexer/lexer.js';
import { Parser } from '../packages/compiler/dist/parser/parser.js';
import { SemanticAnalyzer } from '../packages/compiler/dist/semantic/analyzer.js';

// Test: Function WITH parameters
const source = `
module Test

function test(flag: bool): void
  let x: byte = 10
end function
`;

console.log('=== Debugging CFG creation ===');
try {
  const lexer = new Lexer(source);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  
  const analyzer = new SemanticAnalyzer();
  const result = analyzer.analyze(ast);
  
  console.log('Analysis success:', result.success);
  console.log('Diagnostics count:', result.diagnostics.length);
  
  if (result.diagnostics.length > 0) {
    console.log('\nDiagnostics:');
    for (const diag of result.diagnostics) {
      console.log(`  [${diag.severity.toUpperCase()}] ${diag.code}: ${diag.message}`);
    }
  }
  
  const allCFGs = analyzer.getAllCFGs();
  console.log('\nAll CFGs created:', Array.from(allCFGs.keys()));
  console.log('Number of CFGs:', allCFGs.size);
  
} catch (e) {
  console.error('EXCEPTION:', e.message);
  console.error(e.stack);
}