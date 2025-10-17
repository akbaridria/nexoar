(impl-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))

(define-fungible-token clarity-coin)

(define-public (transfer
        (amount uint)
        (sender principal)
        (recipient principal)
        (memo (optional (buff 34)))
    )
    (begin
        (asserts! (is-eq tx-sender sender) err-not-token-owner)
        (asserts! (> amount u0) (err u102))
        (try! (ft-transfer? clarity-coin amount sender recipient))
        (match memo
            to-print (print to-print)
            0x
        )
        (ok true)
    )
)

(define-read-only (get-name)
    (ok "Mock USDA")
)

(define-read-only (get-symbol)
    (ok "mUSDA")
)

(define-read-only (get-decimals)
    (ok u6)
)

(define-read-only (get-balance (who principal))
    (ok (ft-get-balance clarity-coin who))
)

(define-read-only (get-total-supply)
    (ok (ft-get-supply clarity-coin))
)

(define-read-only (get-token-uri)
    (ok none)
)

(define-public (mint
        (amount uint)
        (recipient principal)
    )
    (begin
        (ft-mint? clarity-coin amount recipient)
    )
)
