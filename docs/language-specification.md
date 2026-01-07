# Blend65 Language Specification (Lexer-Derived)

> **Status**: This document is derived _strictly_ from the current lexer implementation and its tests.
> It describes what the language frontend can **tokenize** today, and uses EBNF to express the
> expected surface syntax. Some higher-level semantics (type checking rules, code generation rules)
> may evolve as the compiler backend is implemented.

## Table of Contents

1. [Introduction](#introduction)
2. [Lexical Structure](#lexical-structure)
3. [Grammar Overview](#grammar-overview)
4. [Program Structure](#program-structure)
5. [Module System](#module-system)
6. [Type System](#type-system)
7. [Storage Classes](#storage-classes)
8. [Variable Declarations](#variable-declarations)
9. [Function Declarations](#function-declarations)
10. [Expressions](#expressions)
11. [Statements](#statements)
12. [Control Flow](#control-flow)
13. [Import/Export System](#importexport-system)
14. [Comments](#comments)
15. [Examples](#examples)
16. [Error Handling](#error-handling)
17. [6502 Specific Features](#6502-specific-features)

---

## Introduction

Blend65 is a modern language designed to compile to 6502-family systems (C64, VIC-20, Commander X16, and more).
It aims to provide structured programming, modularity, and a practical type system while still enabling
fine-grained memory placement and low-level control.

This specification is **lexer-derived**. That means:

- If a construct is not tokenizable by the lexer, it is not specified here.
- Some constructs are shown as “expected syntax” (EBNF) based on token streams and tests.

The lexer is implemented in:

- `packages/compiler/src/lexer/lexer.ts`
- `packages/compiler/src/lexer/types.ts`
- tests under `packages/compiler/src/__tests__/lexer/`

---

## Lexical Structure

### Character Set

The lexer operates over Unicode strings, but the language tokenization rules assume ASCII-like syntax:

- Identifiers use letters `A-Z`, `a-z`, digits `0-9`, and underscore `_`.
- Keywords are **case-sensitive** (`break` is a keyword; `Break` is an identifier).

### Whitespace and Newlines

Whitespace characters:

- Space (`' '`)
- Tab (`'\t'`)
- Carriage return (`'\r'`)

These are skipped by the lexer.

**Newline (`'\n'`) is significant** and becomes a `NEWLINE` token. This matters because Blend65 uses newline
as a primary statement separator (tests rely on this).

EBNF (lexical):

```ebnf
whitespace     = " " | "\t" | "\r" ;
newline        = "\n" ;
separator      = { whitespace } , [ newline ] ;
```

> Note: The lexer does not create an explicit token for general whitespace; only `NEWLINE` is emitted.

### Tokens

The lexer produces the following token categories:

- Identifiers and keywords
- Numeric literals (decimal, hex, binary)
- String literals (single or double quoted)
- Boolean literals (`true`, `false`)
- Operators (arithmetic, comparison, logical, bitwise, assignment)
- Punctuation (`()[]{},;:.`)
- Comments (`//` line, `/* ... */` block) — by default skipped
- `NEWLINE` and `EOF`

### Identifiers

Identifiers start with a letter or underscore, and continue with letters, digits, or underscore.

EBNF:

```ebnf
alpha          = "A"…"Z" | "a"…"z" | "_" ;
digit          = "0"…"9" ;
alnum          = alpha | digit ;

identifier     = alpha , { alnum } ;
```

Examples:

<!-- prettier-ignore -->
```js
let snakeX: byte
let _tmp123: word
```

### Keywords (Case-Sensitive)

The lexer recognizes a fixed set of keywords (from `KEYWORDS` in `types.ts`).

#### Module system keywords

- `module`
- `import`
- `export`
- `from`

#### Function keywords

- `function`
- `return`

#### Control flow keywords

- `if` `then` `else`
- `while`
- `for` `to` `next`
- `match` `case` `default`
- `break` `continue`
- `end` (used to terminate blocks like `end if`, `end function`, `end while`, `end match`, `end enum`)

#### Type/declaration keywords

- `type`
- `enum`

#### Mutability modifiers

- `let`
- `const`

#### Storage class keywords (prefixed)

- `@zp`
- `@ram`
- `@data`

#### Primitive type keywords

- `byte`
- `word`
- `void`
- `callback`
- `string`
- `boolean`

EBNF (keyword terminal names are shown as literal strings):

```ebnf
keyword = "module" | "import" | "export" | "from"
        | "function" | "return"
        | "if" | "then" | "else"
        | "while" | "for" | "to" | "next"
        | "match" | "case" | "default"
        | "break" | "continue"
        | "type" | "enum"
        | "let" | "const"
        | "end"
        | "@zp" | "@ram" | "@data"
        | "byte" | "word" | "void" | "callback" | "string" | "boolean" ;
```

### Boolean literals

The lexer treats `true` and `false` as boolean literals.

EBNF:

```ebnf
boolean_literal = "true" | "false" ;
```

<!-- prettier-ignore -->
```js
let running: boolean = true
```

### Numeric literals

The lexer supports:

- Decimal: `0`, `123`, `65536`
- Hexadecimal:
  - `$` prefix: `$FF`, `$D000`, `$0000`
  - `0x` prefix: `0xFF`, `0xD000`
- Binary: `0b1010`, `0b0001`

EBNF:

```ebnf
decimal_literal = digit , { digit } ;
hex_digit       = digit | "A"…"F" | "a"…"f" ;
bin_digit       = "0" | "1" ;

hex_literal_dollar = "$" , hex_digit , { hex_digit } ;
hex_literal_0x     = "0x" , hex_digit , { hex_digit } ;
bin_literal_0b     = "0b" , bin_digit , { bin_digit } ;

number_literal  = hex_literal_dollar
              | hex_literal_0x
              | bin_literal_0b
              | decimal_literal ;
```

Examples:

<!-- prettier-ignore -->
```js
let addr: word = $D000
let mask: byte = 0b11110000
let score: word = 65535
```

### String literals

Strings can be quoted using single quotes (`'...'`) or double quotes (`"..."`).

Escape handling (lexer behavior):

- `\n` → newline
- `\t` → tab
- `\r` → carriage return
- `\\` → backslash
- `\"` → double quote
- `\'` → single quote
- Any other escape `\X` is tokenized by including `X` as-is (no error).

> Important: Newlines **inside** string literals are permitted by the lexer; it updates its internal line/column tracking.

EBNF (simplified, because EBNF is not ideal for expressing escape-processing logic):

```ebnf
string_literal = "\"" , { string_char } , "\""
              | "'"  , { string_char } , "'" ;

string_char = ? any char except unescaped matching quote ?
            | "\\" , ? escape char ? ;
```

Examples:

<!-- prettier-ignore -->
```js
let title: string = "Hello, World!"
let path: string = 'C:\\GAMES\\SNAKE'
let multiline: string = "line1\nline2\n"
```

### Comments

Two comment styles exist:

- Line comments: `//` to end of line
- Block comments: `/* ... */` (not nested)

By default, the lexer **skips** comments and does not emit tokens for them. When configured
with `skipComments: false`, it emits `LINE_COMMENT` or `BLOCK_COMMENT` tokens.

EBNF:

```ebnf
line_comment  = "//" , { ? any char except newline ? } ;
block_comment = "/*" , { ? any char ? } , "*/" ;
```

---

## Grammar Overview

This section provides a **token-level** grammar sketch, derived from tokens the lexer emits.
It is intentionally conservative: it only references symbols visible in the lexer.

### Tokens as Terminals

For grammar readability, terminals are shown as literal strings (e.g., `"module"`) or punctuation (e.g., `"("`).

EBNF meta-notation:

- `{ X }` means “zero or more”.
- `[ X ]` means “optional”.
- `|` means “alternation”.

### Common building blocks

```ebnf
NEWLINE   = "\n" ;
EOF       = ? end of input ? ;

name      = identifier , { "." , identifier } ;

type_name = "byte" | "word" | "void" | "string" | "boolean" | "callback" | identifier ;

integer   = number_literal ;
literal   = number_literal | string_literal | boolean_literal ;
```

---

## Program Structure

At a high level, Blend65 source is a sequence of top-level declarations.

The lexer indicates **newlines are significant**, so most constructs are newline-delimited.

EBNF (top level):

```ebnf
program = { top_level_item , { NEWLINE } } , EOF ;

top_level_item = module_decl
               | import_decl
               | export_decl
               | function_decl
               | type_decl
               | enum_decl
               | variable_decl
               | statement ;
```

> Note: The parser may enforce a stricter structure (e.g. `module` must be first), but the lexer alone does not.

---

## Module System

### Module declaration

Tested example:

<!-- prettier-ignore -->
```js
module Game.Main
```

EBNF:

```ebnf
module_decl = "module" , name ;
```

Where:

```ebnf
name = identifier , { "." , identifier } ;
```

### Qualified names

Blend65 uses dot-separated names for module paths and member access.

```js
module Game.Snake
import setSpritePosition from c64.sprites
```

---

## Type System

### Primitive types

Primitive type keywords tokenized by the lexer:

- `byte` (8-bit)
- `word` (16-bit)
- `void` (no value)
- `boolean`
- `string`
- `callback` (function pointer / callback marker)

EBNF:

```ebnf
primitive_type = "byte" | "word" | "void" | "boolean" | "string" | "callback" ;
```

### Type aliases

The lexer includes a `type` keyword, so the surface syntax is expected to support type aliases.

EBNF (expected):

```ebnf
type_decl = "type" , identifier , "=" , type_expr ;

type_expr = type_name
          | type_name , "[" , integer , "]" ;
```

Example (illustrative):

<!-- prettier-ignore -->
```js
type SpriteId = byte
type TileMap = byte[256]
```

> The `=` token is lexed as `ASSIGN`.

### Enums

Enum tokens are present and there are lexer tests that tokenize enum declarations.

Tested example:

<!-- prettier-ignore -->
```js
enum Direction
  UP = 0,
  DOWN = 1,
  LEFT,
  RIGHT
end enum
```

EBNF (expected):

```ebnf
enum_decl = "enum" , identifier , { NEWLINE }
          , { enum_member , [ "," ] , { NEWLINE } }
          , "end" , "enum" ;

enum_member = identifier , [ "=" , integer ] ;
```

---

## Storage Classes

Storage classes are **6502 memory placement specifiers** and are written as `@`-prefixed keywords.

Recognized tokens:

- `@zp` → `ZP`
- `@ram` → `RAM`
- `@data` → `DATA`

The lexer will throw on unknown `@` sequences:

```js
// Throws: Invalid storage class keyword '@'
@
```

EBNF:

```ebnf
storage_class = "@zp" | "@ram" | "@data" ;
```

Storage classes typically prefix variable declarations:

<!-- prettier-ignore -->
```js
@zp let counter: byte
@ram let buffer: byte[256]
@data const initialized: word = 1000
```

---

## Variable Declarations

The lexer tokens imply a declaration style that includes:

- Optional storage class
- Mutability modifier: `let` or `const`
- Name: identifier
- Optional type annotation: `:` followed by a type
- Optional initializer: `=` expression

Tested examples:

<!-- prettier-ignore -->
```js
@zp let counter: byte
@ram let buffer: byte[256]
@data const initialized: word = 1000
```

EBNF (expected):

```ebnf
variable_decl = [ storage_class ] , ( "let" | "const" ) , identifier
              , [ ":" , type_expr ]
              , [ "=" , expression ] ;

type_expr = type_name
          | type_name , "[" , integer , "]" ;
```

Array type shapes are suggested by the presence of `[` `]` tokens and test cases like `byte[256]`.

---

## Function Declarations

Blend65 function definitions are block-structured and terminated with an `end` marker.

There is direct evidence for:

- `function name(): void ... end function`
- `export function ...`
- `callback function ...` (interrupt handler style)

Examples:

<!-- prettier-ignore -->
```js
export function main(): void
end function
```

<!-- prettier-ignore -->
```js
callback function rasterIRQ(): void
  // ...
end function
```

EBNF (expected):

```ebnf
function_decl = [ "export" ] , [ "callback" ]
              , "function" , identifier
              , "(" , [ parameter_list ] , ")"
              , [ ":" , type_name ]
              , { NEWLINE }
              , { statement , { NEWLINE } }
              , "end" , "function" ;

parameter_list = parameter , { "," , parameter } ;
parameter      = identifier , ":" , type_expr ;
```

> The lexer does not enforce parameter syntax; it only provides tokens needed to express it.

### Return

The `return` keyword is tokenized.

<!-- prettier-ignore -->
```js
return
return score
```

EBNF (expected):

```ebnf
return_stmt = "return" , [ expression ] ;
```

---

## Expressions

The lexer defines a rich set of operators. This section specifies the expression surface syntax and
operator tokens, but does not claim a final precedence table unless explicitly implemented in the parser.

### Primary expressions

EBNF:

```ebnf
primary_expr = literal
             | identifier
             | qualified_identifier
             | call_expr
             | index_expr
             | "(" , expression , ")" ;

qualified_identifier = identifier , { "." , identifier } ;
```

Examples:

<!-- prettier-ignore -->
```js
score
GameState.MENU
(snakeX + 2)
```

### Calls and indexing

Tokens exist for `(` `)` `[` `]` `,` and `.`.

EBNF (expected):

```ebnf
call_expr  = primary_expr , "(" , [ argument_list ] , ")" ;
index_expr = primary_expr , "[" , expression , "]" ;

argument_list = expression , { "," , expression } ;
```

Examples:

<!-- prettier-ignore -->
```js
setRasterInterrupt(250, callback)
enemies[i].health
snakeX[3]
```

### Operators

#### Arithmetic

- `+` `-` `*` `/` `%`

#### Comparison

- `==` `!=` `<` `<=` `>` `>=`

#### Logical

- `&&` `||` `!`

#### Bitwise

- `&` `|` `^` `~` `<<` `>>`

#### Assignment

- `=`
- `+=` `-=` `*=` `/=` `%=`
- `&=` `|=` `^=`
- `<<=` `>>=`

EBNF (expression skeleton):

```ebnf
expression = assignment_expr ;

assignment_expr = logical_or_expr
               , [ assignment_op , assignment_expr ] ;

assignment_op = "=" | "+=" | "-=" | "*=" | "/=" | "%="
              | "&=" | "|=" | "^=" | "<<=" | ">>=" ;

logical_or_expr  = logical_and_expr , { "||" , logical_and_expr } ;
logical_and_expr = bitwise_or_expr  , { "&&" , bitwise_or_expr  } ;

bitwise_or_expr  = bitwise_xor_expr , { "|"  , bitwise_xor_expr } ;
bitwise_xor_expr = bitwise_and_expr , { "^"  , bitwise_and_expr } ;
bitwise_and_expr = equality_expr    , { "&"  , equality_expr    } ;

equality_expr = relational_expr , { ( "==" | "!=" ) , relational_expr } ;
relational_expr = shift_expr , { ( "<" | "<=" | ">" | ">=" ) , shift_expr } ;
shift_expr = additive_expr , { ( "<<" | ">>" ) , additive_expr } ;

additive_expr = multiplicative_expr , { ( "+" | "-" ) , multiplicative_expr } ;
multiplicative_expr = unary_expr , { ( "*" | "/" | "%" ) , unary_expr } ;

unary_expr = [ "!" | "~" | "+" | "-" ] , unary_expr
           | primary_expr ;
```

> This precedence ladder matches the operator set the lexer provides. If the parser uses a different precedence,
> the grammar should be updated to match parser rules.

---

## Statements

Statements are generally separated by `NEWLINE` (and sometimes also by `;` in the future).
The lexer provides `SEMICOLON`, but the tests primarily show newlines used for separation.

EBNF (expected):

```ebnf
statement = variable_decl
          | assignment_stmt
          | return_stmt
          | if_stmt
          | while_stmt
          | for_stmt
          | match_stmt
          | break_stmt
          | continue_stmt
          | expr_stmt ;

assignment_stmt = lvalue , assignment_op , expression ;
lvalue          = qualified_identifier | index_expr ;

expr_stmt       = expression ;

break_stmt      = "break" ;
continue_stmt   = "continue" ;
```

Examples:

<!-- prettier-ignore -->
```js
snakeX = snakeX - 2
score += 10
break
continue
```

---

## Control Flow

### If

Tests show the `if ... then ... end if` style.

<!-- prettier-ignore -->
```js
if i == 5 then
  break
end if
```

EBNF (expected):

```ebnf
if_stmt = "if" , expression , "then" , { NEWLINE }
        , { statement , { NEWLINE } }
        , [ "else" , { NEWLINE } , { statement , { NEWLINE } } ]
        , "end" , "if" ;
```

### While

```js
while true
  updateGame()
end while
```

EBNF (expected):

```ebnf
while_stmt = "while" , expression , { NEWLINE }
           , { statement , { NEWLINE } }
           , "end" , "while" ;
```

### For

Tests show `for i = 0 to 10 ... next i`.

```js
for i = 0 to 10
  // ...
next i
```

EBNF (expected):

```ebnf
for_stmt = "for" , identifier , "=" , expression , "to" , expression , { NEWLINE }
        , { statement , { NEWLINE } }
        , "next" , identifier ;
```

### Match / Case / Default

Tests show `match expr ... case X: ... default: ... end match`.

```js
match gameState
  case MENU:
    showMenu()
  default:
    handleError()
end match
```

EBNF (expected):

```ebnf
match_stmt = "match" , expression , { NEWLINE }
           , { case_clause , { NEWLINE } }
           , [ default_clause , { NEWLINE } ]
           , "end" , "match" ;

case_clause = "case" , expression , ":" , { NEWLINE }
            , { statement , { NEWLINE } } ;

default_clause = "default" , ":" , { NEWLINE }
               , { statement , { NEWLINE } } ;
```

---

## Import/Export System

### Imports

Imports are tokenized with `import` and `from`. Tests show importing one identifier:

<!-- prettier-ignore -->
```js
import setSpritePosition from target.sprites
```

Other tests show comma-separated imports:

<!-- prettier-ignore -->
```js
import clearScreen, setPixel from c64.graphics.screen
```

EBNF (expected):

```ebnf
import_decl = "import" , import_list , "from" , name ;

import_list = identifier , { "," , identifier } ;
```

### Exports

Exports are expressed with the `export` keyword.

```js
export function main(): void
end function
```

EBNF (expected):

```ebnf
export_decl = "export" , ( function_decl | variable_decl | type_decl | enum_decl ) ;
```

---

## Comments

### Line comments

```js
// Initialize game state
let x: byte
```

### Block comments

```js
let x /* comment */ let y
```

### Nesting

Block comments are **not** truly nested. A sequence like `/* outer /* inner */ still comment */` is tokenized
by searching for the first closing `*/`. Tests note this behavior.

---

## Examples

### Minimal module with import and export

<!-- prettier-ignore -->
```js
module Game.Main
import setSpritePosition from target.sprites
export function main(): void
end function
```

### Storage classes and declarations

<!-- prettier-ignore -->
```js
@zp let counter: byte
@ram let buffer: byte[256]
@data const initialized: word = 1000
```

### Loop with break/continue

<!-- prettier-ignore -->
```js
for i = 0 to 10
  if i == 5 then
    break
  end if
  if i == 3 then
    continue
  end if
next i
```

### Match with default

<!-- prettier-ignore -->
```js
match gameState
  case MENU:
    showMenu()
  case PLAYING:
    updateGame()
  default:
    handleError()
end match
```

### Enum + state machine style

<!-- prettier-ignore -->
```js
enum GameState
  MENU, PLAYING, PAUSED, GAME_OVER
end enum

function gameLoop(): void
  while true
    match currentState
      case GameState.MENU:
        handleMenu()
      default:
        currentState = GameState.MENU
    end match
  end while
end function
```

---

## Error Handling

This section describes lexer-level errors (tokenization errors). Parser/semantic errors are separate.

### Unexpected characters

Any character not belonging to a valid token causes an exception.

Example:

<!-- prettier-ignore -->
```js
let `backtick`
```

### Invalid storage class keyword

Any `@` sequence not equal to `@zp`, `@ram`, or `@data` throws.

```js
@ $0000
```

### Invalid numeric literal

Invalid numeric prefixes throw:

- `$` with no hex digits
- `0x` with no hex digits
- `0b` with no binary digits

Examples:

<!-- prettier-ignore -->
```js
$
0x
0b
```

### Unterminated strings

Missing closing quote throws:

<!-- prettier-ignore -->
```js
"hello
'world
```

### Unterminated block comments

Missing closing `*/` throws.

<!-- prettier-ignore -->
```js
let x /* unterminated
```

---

## 6502 Specific Features

### Memory placement via storage classes

The storage class system is a first-class 6502 feature:

- `@zp` indicates zero-page allocation (fast addressing modes).
- `@ram` indicates general RAM allocation.
- `@data` indicates an initialized data region.

```js
@zp let fastCounter: byte = 0
@ram let screenBuffer: byte[1000]
@data const fontData: byte[2048] = [0, 1, 2]
```

### Callback keyword

The lexer provides a `callback` keyword used in two major ways:

1. Marking a function as callback-capable:

<!-- prettier-ignore -->
```js
callback function rasterIRQ(): void
  // interrupt handler
end function
```

2. Using `callback` as a type annotation (function pointer style):

<!-- prettier-ignore -->
```js
let handler: callback = myFunction
```

> Note: The lexer treats the exact string `callback` as a keyword token. Identifiers like `callbackCount`
> remain normal identifiers.
