; Simple 6502 assembly test for VICE emulator testing
; Sets memory location $0400 to value $42

* = $0801

; BASIC stub to auto-run the program
!byte $0c, $08, $0a, $00, $9e, $32, $30, $36, $34, $00, $00, $00

; Main program starts at $0810
* = $0810

start:
    lda #$42        ; Load value $42 into accumulator
    sta $0400       ; Store it at memory location $0400
    rts             ; Return
