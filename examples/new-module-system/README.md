# New Content-Based Module Resolution Example

This example demonstrates the new content-based module resolution system in blend65 using intuitive dot syntax.

## Key Features Demonstrated

### 1. Content-Based Resolution
Modules are resolved by scanning files for `module` declarations, not by file paths. Files can be located anywhere in the project.

### 2. Dot Syntax
Uses familiar dot notation instead of colon syntax:
- ✅ `import func from target.sprites` (new)
- ❌ `import func from target:sprites` (old)

### 3. Flexible File Organization

Files can be organized however you prefer:
```
examples/new-module-system/
├── main.blend                            → module Game.Main
├── src/game/player.blend                 → module game.player
├── lib/level.blend                       → module game.level
├── engine/logic.blend                    → module game.logic
└── targets/c64_sprites.blend             → module c64.sprites
```

The compiler finds modules by their declaration, not their location!

## Module Resolution Examples

### Target-Specific Imports
```blend65
// These resolve differently based on --target flag
import setSpritePosition from target.sprites  // → c64.sprites (for C64)
import setBackgroundColor from target.video   // → c64.vic (for C64)
import readJoystick from target.input         // → c64.input (for C64)
```

### User Module Imports
```blend65
// These are resolved by scanning for module declarations
import initPlayer from game.player      // Found in src/game/player.blend
import initLevel from game.level        // Found in lib/level.blend
import updateGameState from game.logic  // Found in engine/logic.blend
```

### Direct Target Imports
```blend
// Only works when compiling for specific target
import setSIDVolume from c64.sid  // C64-specific, fails on other targets
```

## Compilation Process

1. **Module Discovery**: Compiler scans all `.blend` files for module declarations
2. **Index Building**: Creates mapping of module names to file paths
3. **Import Resolution**: Resolves imports using the index
4. **Target Resolution**: `target.*` modules resolve based on `--target` flag

## Benefits

### For Developers
- **Intuitive syntax**: Familiar dot notation
- **Flexible organization**: Files can be anywhere
- **Clear dependencies**: Easy to see what modules are imported
- **IDE support**: Better autocomplete and navigation

### For Projects
- **Maintainable**: Module structure independent of file structure
- **Scalable**: Easy to reorganize files without breaking imports
- **Portable**: Same source works on multiple targets

## Compilation Commands

```bash
# Compile for C64
blend65 --target=c64 main.blend
# → target.sprites resolves to c64.sprites

# Compile for Commander X16
blend65 --target=x16 main.blend
# → target.sprites resolves to x16.vera

# C64-specific imports (c64.sid) only work with --target=c64
```

## Error Handling

The new system provides clear error messages:

```
Error: Module 'game.player' not found in project
Suggestion: Did you mean 'game.level'?

Error: Function 'initPlayer' not exported from 'game.player'
Available exports: updatePlayer, renderPlayer, getPlayerX, getPlayerY
```

This example showcases how the new module system makes blend65 projects more intuitive and maintainable while preserving the powerful target-specific capabilities.
