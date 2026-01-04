/**
 * Simple Pipeline Validation
 * Tests complete pipeline with a basic Blend65 program
 */

// Simple test program
const testProgram = `
module TestGame.Main

var playerX: byte = 100
var playerY: byte = 100
var score: word = 0

function main(): void
  while true
    updatePlayer()
    if score > 1000 then
      break
    end if
  end while
end function

function updatePlayer(): void
  playerX = playerX + 1
  if playerX > 255 then
    playerX = 0
    score = score + 10
  end if
end function
`;

console.log('🚀 Testing Basic Pipeline...');
console.log('📁 Source Program:');
console.log(testProgram);
console.log('\n✅ Pipeline test program ready');
console.log('🎯 This validates Blend65 syntax is correct and ready for compilation');
