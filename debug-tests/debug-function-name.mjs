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

console.log('=== Analyzing function WITH parameters ===');
try {
  const lexer = new Lexer(source);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  
  // Check AST structure
  const decls = ast.getDeclarations();
  console.log('Number of declarations:', decls.length);
  
  for (const decl of decls) {
    console.log('Declaration type:', decl.constructor.name);
    if (decl.constructor.name === 'FunctionDecl') {
      console.log('Function name:', decl.getName());
      console.log('Function parameters:', decl.getParameters().length);
      console.log('Function has body:', decl.getBody() !== null);
    }
  }
  
  // Now analyze
  const analyzer = new SemanticAnalyzer();
  analyzer.analyze(ast);
  
  const allCFGs = analyzer.getAllCFGs();
  console.log('\nAll CFGs created:', Array.from(allCFGs.keys()));
  console.log('Number of CFGs:', allCFGs.size);
  
  const cfg = analyzer.getCFG('test');
  console.log('getCFG("test") result:', cfg !== undefined ? 'EXISTS' : 'UNDEFINED');
  
} catch (e) {
  console.error('Error:', e.message);
  console.error(e.stack);
}