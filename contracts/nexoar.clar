;; traits

;; constants
(define-constant BTC_PRICE_FEED_ID 0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43)

;; errors
(define-constant ERR-INVALID-DURATION (err u101))

;; data vars
(define-data-var PRECISION-PERCENTAGE uint u100000)
(define-data-var VOLATILITY uint u80000)
(define-data-var BASE-MULTIPLIER uint u40000)

;; data maps
(define-map options
    { user: principal }
    {
        option-id: uint,
        owner: principal,
        strike: uint,
        expiry: uint,
        size: uint,
        is-call: bool,
        premium: uint,
        locked-liquidity: uint,
        is-excercised: bool,
    }
)

;; public functions

;; read only functions
(define-read-only (get-cap-multiplier (days uint))
    (begin
        (asserts! (>= days u1) ERR-INVALID-DURATION)
        (asserts! (<= days u30) ERR-INVALID-DURATION)

        (ok (if (<= days u7)
            u125000
            (if (<= days u14)
                u140000
                (if (<= days u21)
                    u160000
                    u180000
                )
            )
        ))
    )
)

;; private functions
(define-private (get-price (price-feed-bytes (buff 8192)))
    (let (
            (update-status (try! (contract-call?
                'STR738QQX1PVTM6WTDF833Z18T8R0ZB791TCNEFM.pyth-oracle-v4
                verify-and-update-price-feeds price-feed-bytes {
                pyth-storage-contract: 'STR738QQX1PVTM6WTDF833Z18T8R0ZB791TCNEFM.pyth-storage-v4,
                pyth-decoder-contract: 'STR738QQX1PVTM6WTDF833Z18T8R0ZB791TCNEFM.pyth-pnau-decoder-v3,
                wormhole-core-contract: 'STR738QQX1PVTM6WTDF833Z18T8R0ZB791TCNEFM.wormhole-core-v4,
            })))
            (price-data (try! (contract-call?
                'STR738QQX1PVTM6WTDF833Z18T8R0ZB791TCNEFM.pyth-oracle-v4
                get-price BTC_PRICE_FEED_ID
                'STR738QQX1PVTM6WTDF833Z18T8R0ZB791TCNEFM.pyth-storage-v4
            )))
        )
        (ok (get price price-data))
    )
)

(define-private (calculate-intrinsic-value
        (spot-price uint)
        (strike-price uint)
        (is-call bool)
        (response uint)
    )
    (if is-call
        (if (> spot-price strike-price)
            (ok (- spot-price strike-price))
            (ok u0)
        )
        (if (< spot-price strike-price)
            (ok (- strike-price spot-price))
            (ok u0)
        )
    )
)

(define-private (max-of
        (i1 uint)
        (i2 uint)
    )
    (if (> i1 i2)
        i1
        i2
    )
)

;; (define-private (calculate-premium
;;         (spot uint)
;;         (strike uint)
;;         (is-call bool)
;;         (size uint)
;;         (days uint)
;;     )
;;     (let (
;;             (intrinsic (unwrap-panic (calculate-intrinsic-value spot strike is-call u0)))
;;             (utilization (unwrap-panic (contract-call? .vault-tracker get-utilization-rate)))
;;             (dynamic-mult (+ (var-get BASE-MULTIPLIER)
;;                 (/ (* utilization u200000) (var-get PRECISION-PERCENTAGE))
;;             ))
;;             (sqrt-days (/ (* days (var-get PRECISION-PERCENTAGE)) u365))
;;         )
;;         (let ((time-value (/ (* spot (var-get VOLATILITY) (sqrti sqrt-days) dynamic-mult)
;;                 (* (var-get PRECISION-PERCENTAGE) (var-get PRECISION-PERCENTAGE))
;;             )))
;;             (ok (* (+ intrinsic time-value) size))
;;         )
;;     )
;; )
