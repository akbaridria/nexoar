;; constants
(define-constant PRECISION u1000000)

;; data-vars
(define-data-var total-liquidity uint u0)
(define-data-var locked-liquidity uint u0)

;; errors
(define-constant ERR-UNAUTHORIZED (err u100))
(define-constant ERR-INSUFFICIENT-LIQUIDITY (err u101))
(define-constant ERR-INVALID-UNLOCK (err u102))
(define-constant ERR-INVALID-AMOUNT (err u103))

;; public functions
(define-public (add-liquidity
        (provider principal)
        (amount uint)
    )
    (begin
        (asserts! (is-eq contract-caller .nexoar-v1-5-0) ERR-UNAUTHORIZED)
        (asserts! (> amount u0) ERR-INVALID-AMOUNT)
        (unwrap!
            (as-contract (contract-call? .vault-tracker-v1-5-0 add-stake provider amount))
            ERR-INVALID-AMOUNT
        )
        (var-set total-liquidity (+ (var-get total-liquidity) amount))
        (ok true)
    )
)

(define-public (remove-liquidity
        (provider principal)
        (amount uint)
    )
    (begin
        (asserts! (is-eq contract-caller .nexoar-v1-5-0) ERR-UNAUTHORIZED)
        (let ((actual-amount (unwrap!
                (as-contract (contract-call? .vault-tracker-v1-5-0 remove-stake provider
                    amount
                ))
                ERR-INVALID-AMOUNT
            )))
            (asserts! (<= actual-amount (var-get total-liquidity))
                ERR-INSUFFICIENT-LIQUIDITY
            )
            (var-set total-liquidity (- (var-get total-liquidity) actual-amount))
            (ok actual-amount)
        )
    )
)

(define-public (lock-liquidity (amount uint))
    (begin
        (asserts! (is-eq contract-caller .nexoar-v1-5-0) ERR-UNAUTHORIZED)
        (asserts!
            (<= (+ (var-get locked-liquidity) amount) (var-get total-liquidity))
            ERR-INSUFFICIENT-LIQUIDITY
        )
        (var-set locked-liquidity (+ (var-get locked-liquidity) amount))
        (ok true)
    )
)

(define-public (unlock-liquidity (amount uint))
    (begin
        (asserts! (is-eq contract-caller .nexoar-v1-5-0) ERR-UNAUTHORIZED)
        (asserts! (>= (var-get locked-liquidity) amount) ERR-INVALID-UNLOCK)
        (var-set locked-liquidity (- (var-get locked-liquidity) amount))
        (ok true)
    )
)

(define-public (distribute-pnl (pnl-amount int))
    (begin
        (asserts! (is-eq contract-caller .nexoar-v1-5-0) ERR-UNAUTHORIZED)
        (unwrap!
            (as-contract (contract-call? .vault-tracker-v1-5-0 distribute-pnl pnl-amount))
            ERR-INVALID-AMOUNT
        )
        (if (>= pnl-amount 0)
            (var-set total-liquidity
                (+ (var-get total-liquidity) (to-uint pnl-amount))
            )
            (var-set total-liquidity
                (- (var-get total-liquidity) (to-uint (- pnl-amount)))
            )
        )
        (ok true)
    )
)

;; read-only functions
(define-read-only (get-total-liquidity)
    (ok (var-get total-liquidity))
)

(define-read-only (get-available-liquidity)
    (ok (- (var-get total-liquidity) (var-get locked-liquidity)))
)

(define-read-only (get-provider-balance (provider principal))
    (let ((info (unwrap-panic (contract-call? .vault-tracker-v1-5-0 get-provider-info provider))))
        (ok (get effective-balance info))
    )
)

(define-read-only (get-utilization-rate)
    (let (
            (total (var-get total-liquidity))
            (locked (var-get locked-liquidity))
        )
        (if (is-eq total u0)
            (ok u0)
            (ok (/ (* locked PRECISION) total))
        )
    )
)
