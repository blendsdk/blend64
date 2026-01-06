/**
 * Debug script to identify why compilation is failing
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Blend65 compiler pipeline
import { Blend65Lexer } from '@blend65/lexer';
import { Blend65Parser } from '@blend65/parser';
import { SemanticAnalyzer } from '@blend65/semantic';
import { ASTToILTransformer } from '@blend65/il';

function findProjectRoot(): string {
  const currentFile = fileURLToPath(import.meta.url);
  let currentDir = dirname(currentFile);
  while (currentDir !== dirname(currentDir)) {
    const examplesPath = join(currentDir, 'examples');
    if (existsSync(examplesPath)) {
      return currentDir;
    }
    currentDir = dirname(currentDir);
  }
  return join(dirname(dirname(fileURLToPath(import.meta.url))), '..', '..');
}

async function debugCompilation(): Promise<void> {
  console.log('🔍 DEBUGGING BLEND65 COMPILATION PIPELINE');
  console.log('='.repeat(60));

  try {
    const projectRoot = findProjectRoot();
    const sourceFile = join(projectRoot, 'examples', 'builtin-functions-demo.blend');
    const sourceCode = readFileSync(sourceFile, 'utf-8');

    console.log('📄 Source Code:');
    console.log(sourceCode);
    console.log('='.repeat(60));

    // PHASE 1: LEXICAL ANALYSIS
    console.log('\n🔍 Phase 1: Lexical Analysis');
    const lexer = new Blend65Lexer(sourceCode);
    const tokens = lexer.tokenize();
    console.log(`✅ Generated ${tokens.length} tokens`);

    // Show first few tokens
    console.log('First 10 tokens:');
    for (let i = 0; i < Math.min(10, tokens.length); i++) {
      console.log(`  ${i}: ${tokens[i].type} - "${tokens[i].value}"`);
    }

    // PHASE 2: PARSING
    console.log('\n📝 Phase 2: Parsing');
    const parser = new Blend65Parser(tokens);
    const program = parser.parse();
    console.log('✅ AST generated successfully');

    // Debug AST structure
    console.log('\n🌳 AST Structure:');
    console.log(`Module: ${program.module?.name.parts.join('.')}`);
    console.log(`Body declarations: ${program.body.length}`);

    for (let i = 0; i < program.body.length; i++) {
      const decl = program.body[i];
      console.log(`  Declaration ${i}: ${decl.type}`);
      if (decl.type === 'FunctionDeclaration') {
        const funcDecl = decl as any;
        console.log(`    Name: ${funcDecl.name}`);
        console.log(`    Return Type: ${JSON.stringify(funcDecl.returnType)}`);
        console.log(`    Parameters: ${funcDecl.params?.length || 0}`);
        console.log(`    Body statements: ${funcDecl.body?.length || 0}`);
      }
    }

    // PHASE 3: SEMANTIC ANALYSIS
    console.log('\n🧠 Phase 3: Semantic Analysis');
    const semanticAnalyzer = new SemanticAnalyzer();
    const semanticResult = semanticAnalyzer.analyze([program]);

    console.log(`Semantic Analysis Success: ${semanticResult.success}`);
    if (!semanticResult.success) {
      console.log('Semantic Errors:');
      semanticResult.errors.forEach((error, i) => {
        console.log(`  Error ${i}: ${error.errorType} - ${error.message}`);
      });
    }

    if (semanticResult.success && semanticResult.data) {
      // Debug symbol table
      console.log('\n📋 Symbol Table Contents:');
      const symbols = semanticResult.data.getAccessibleSymbols();
      console.log(`Total symbols: ${symbols.size}`);

      for (const [name, symbol] of symbols) {
        console.log(`  Symbol: ${name} (${symbol.symbolType})`);
        if (symbol.symbolType === 'Function') {
          const funcSymbol = symbol as any;
          console.log(`    Return Type: ${JSON.stringify(funcSymbol.returnType)}`);
          console.log(`    Parameters: ${funcSymbol.parameters?.length || 0}`);
        }
      }
    }

    // PHASE 4: IL GENERATION
    console.log('\n🔧 Phase 4: IL Generation');
    const symbolMap = semanticResult.success
      ? semanticResult.data.getAccessibleSymbols()
      : new Map();

    console.log(`Symbol map size: ${symbolMap.size}`);
    const ilTransformer = new ASTToILTransformer(symbolMap);
    const ilResult = ilTransformer.transformProgram(program);

    console.log(`IL Generation Success: ${ilResult.success}`);
    if (!ilResult.success) {
      console.log('IL Generation Errors:');
      ilResult.errors.forEach((error, i) => {
        console.log(`  Error ${i}: ${error.message}`);
      });
    }

    console.log(`IL Program modules: ${ilResult.program.modules.length}`);
    for (const module of ilResult.program.modules) {
      console.log(`  Module: ${module.qualifiedName.join('.')}`);
      console.log(`    Functions: ${module.functions.length}`);
      console.log(`    Module Data: ${module.moduleData.length}`);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
  }
}

// Export and run
export { debugCompilation };

if (process.argv[1] && process.argv[1].includes('debug-compilation')) {
  debugCompilation().catch(console.error);
}
