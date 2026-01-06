; ============================================================================
; Blend65 Generated Assembly - Demo.BuiltinFunctions
; Target Platform: Commodore 64
; Generated: 2026-01-06T19:16:47.853Z
; ============================================================================

!cpu 6502        ; Specify processor type
!to "demo.builtinfunctions.prg",cbm  ; Output format

; BASIC Stub: 10 SYS2064
* = $0801
        !word $080D  ; Next line pointer
        !word 10        ; Line number
        !byte $9E       ; SYS token
        !text "2064"
        !byte $00       ; End of line
        !word $0000     ; End of program

; Machine code starts here
* = $0810

; Module: Demo.BuiltinFunctions

; Program Entry Point - automatically calls main()
    JSR Demo_BuiltinFunctions_main      ; Call main() function
    RTS              ; Return to BASIC

; Function: dummyLoop
; Parameters: 0

Demo_BuiltinFunctions_dummyLoop:
    ; TODO: Implement STORE_VARIABLE - DEBUG INFO:
    ; Type: STORE_VARIABLE (string)
    ; Operands: 2
    ; ID: 0
    ; First operand: {"valueType":"variable","name":"i","qualifiedName":[],"type":{"kind":"primitive","name":"byte"},"storageClass":null,"scope":"local"}
    for_loop_0:           ; Label
    ; TODO: Implement LOAD_VARIABLE - DEBUG INFO:
    ; Type: LOAD_VARIABLE (string)
    ; Operands: 1
    ; ID: 2
    ; First operand: {"valueType":"variable","name":"i","qualifiedName":[],"type":{"kind":"primitive","name":"byte"},"storageClass":null,"scope":"local"}
    CMP #100    ; Compare with right operand
    BEQ for_end_2      ; Branch if false (zero)
    for_continue_1:           ; Label
    CLC              ; Clear carry for addition
    ADC #1    ; Add right operand
    ; TODO: Implement STORE_VARIABLE - DEBUG INFO:
    ; Type: STORE_VARIABLE (string)
    ; Operands: 2
    ; ID: 7
    ; First operand: {"valueType":"variable","name":"i","qualifiedName":[],"type":{"kind":"primitive","name":"byte"},"storageClass":null,"scope":"local"}
    JMP for_loop_0      ; Unconditional branch
    for_end_2:           ; Label
    RTS              ; Return from subroutine

; Function: main
; Parameters: 0

Demo_BuiltinFunctions_main:
    ; Line 0:0
    LDA #5    ; Load value to poke
    STA $D020    ; POKE to $D020 ; Hardware I/O register
    RTS              ; Return from subroutine

; Program cleanup
RTS              ; Return to BASIC
