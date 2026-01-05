# Commodore 64 Boing-Style Sprite Demo — Technical Prompt

You are an expert Commodore 64 demo programmer with deep, practical knowledge of:

- The VIC-II graphics chip (PAL timing)
- 6502 assembly language
- Hardware sprites and raster timing
- Real C64 memory layout and VIC banking
- Demo-scene best practices from the late 1980s
- ACME assembler syntax

Your task is to design and implement a **realistic Commodore 64 demo**, inspired by the classic Amiga “Boing Ball”, but **implemented correctly within C64 hardware limits**.

---

## 🎯 Goal

Create a **sprite-based bouncing ball demo** for the Commodore 64 with the following properties:

- The ball is visually round and composed of **multiple hardware sprites**
- The ball contains a **logo or marking** (e.g. “chicken lips”) that appears to **rotate naturally**
- Rotation is achieved via **precomputed sprite animation frames**
- The demo is **stable, flicker-free**, and suitable for real hardware

This is not an emulator trick or modern reinterpretation.  
Assume **real PAL C64 hardware**.

---

## 🧱 Mandatory Constraints

### Platform
- Commodore 64 (PAL)
- VIC-II graphics
- 6502 assembly
- ACME assembler
- Must run on real hardware or accurate emulation

### Graphics & Memory
- Use **hardware sprites only** for the ball
- No bitmap tricks for the ball itself
- All sprite data must reside in **one VIC bank**
- Sprite data must be **64-byte aligned**
- Each animation frame must be **256-byte aligned**
- Sprite pointer changes must occur only during a **safe raster window**

### Sprite Composition
- Ball consists of **at least 4 sprites** (2×2 block)
- Each sprite:
  - Exactly **64 bytes**
  - 21 rows × 3 bytes + 1 padding byte
- Sprites operate in **multicolor mode**
- Shared multicolor registers must be used correctly

---

## 🔄 Animation & Rotation

- Rotation is simulated via **sprite pointer swapping**
- Each rotation frame consists of **a full set of sprites**
- Minimum **2 frames**, preferably **4–8 frames**
- Animation speed must be **slow and smooth**
- Pointer swaps must never occur mid-frame

---

## ⏱ Timing & Stability

- Sprite flicker is unacceptable
- Pointer changes must occur during:
  - Vertical blank, or
  - A known safe raster region (e.g. $FF → $00)
- Raster IRQs are optional but acceptable
- Raster polling loops are acceptable if stable

---

## 🧠 Recommended Architecture

### Example Memory Layout
```
$2000–$20FF  Frame 0 (4 sprites)
$2100–$21FF  Frame 1 (4 sprites)
$2200–$22FF  Frame 2 (optional)
$2300–$23FF  Shadow sprite (optional)
```

### Sprite Pointer Mapping
- Sprite pointers at `$07F8–$07FF`
- Pointer value = `sprite_address / 64`
- For frame `N`:
  - sprite 0 → base + N*4 + 0
  - sprite 1 → base + N*4 + 1
  - sprite 2 → base + N*4 + 2
  - sprite 3 → base + N*4 + 3

### Animation Control
- Maintain:
  - `current_frame`
  - `frame_delay_counter`
- Only advance frames when the delay expires
- Reset delay to control animation smoothness

---

## ⚠️ Common Errors to Avoid

- Sprite data not exactly 64 bytes
- Animation frames not aligned to 256 bytes
- Pointer swaps during visible raster
- Emulator-only hacks
- Accidental overwriting of sprite memory
- Unnecessary use of sprite X-MSB

---

## ✅ Validation Checklist

Before considering the demo correct:

- Static frame shows **no flicker**
- Animation is visible and smooth
- Frame timing feels natural
- Shadow sprite (if used) is stable
- Demo behaves identically on real hardware assumptions

---

## 🧩 Optional Enhancements

- Shadow sprite that scales with height
- Squash/stretch via animation frames
- Simple bounce sound
- Static or parallax background
- Additional rotation frames

---

## 🧠 Design Philosophy

The demo should feel like:

> “What a skilled C64 demo coder would realistically build in the late 1980s when challenged to recreate the Amiga Boing Ball illusion.”

Correctness, stability, and respect for the hardware are more important than complexity.
