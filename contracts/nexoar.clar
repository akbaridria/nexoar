;; constants
(define-constant BTC_PRICE_FEED_ID 0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43)
(define-constant PRECISION u1000000)
(define-constant VOLATILITY u800000)
(define-constant BASE-MULTIPLIER u100000)
(define-constant UTILIZATION-MULTIPLIER u200000)
(define-constant PROTOCOL-FEE-PERCENTAGE u200000)

;; errors
;; general errors
(define-constant ERR-UNAUTHORIZED (err u1000))

;; create-option errors
(define-constant ERR-INVALID-DURATION (err u101))
(define-constant ERR-INVALID-PRICE (err u102))
(define-constant ERR-PRICE-SLIPPAGE (err u103))
(define-constant ERR-INVALID-SIZE (err u104))
(define-constant ERR-INSUFFICIENT-LIQUIDITY (err u105))
(define-constant ERR-IN-THE-MONEY (err u106))
(define-constant ERR-INSUFFICIENT-BALANCE (err u107))

;; exercise-option errors
(define-constant ERR-OPTIONS-NOT-EXIST (err u201))
(define-constant ERR-NOT-OPTION-OWNER (err u202))
(define-constant ERR-OPTION-EXERCISED (err u203))
(define-constant ERR-OPTION-EXPIRED (err u204))
(define-constant ERR-OPTION-NOT-EXPIRED (err u205))

;; claim-revenue errors
(define-constant ERR-NO-REVENUE (err u301))

;; data vars
(define-data-var option-counter uint u0)
(define-data-var protocol-revenue uint u0)
(define-data-var contract-owner principal tx-sender)

;; data maps
(define-map options
    { option-id: uint }
    {
        option-id: uint,
        owner: principal,
        strike: uint,
        expiry: uint,
        size: uint,
        is-call: bool,
        premium: uint,
        locked-liquidity: uint,
        is-exercised: bool,
        profit: int,
        exercise-price: uint,
    }
)

;; public functions
(define-public (create-option
        (price-feed (buff 8192))
        (strike-price uint)
        (days uint)
        (is-call bool)
        (premium-slippage uint)
        (size uint)
    )
    (begin
        (asserts! (>= size PRECISION) ERR-INVALID-PRICE)
        (let (
                (spot-price (to-uint (unwrap-panic (get-price price-feed))))
                (premium (unwrap-panic (calculate-premium spot-price strike-price is-call days size)))
                (option-id (+ (var-get option-counter) u1))
                (expiry (+ (unwrap-panic (get-stacks-block-info? time u0))
                    (* days u86400)
                ))
                (locked-liquidity (unwrap-panic (calculate-locked-liquidity size spot-price strike-price is-call
                    days
                )))
            )
            (begin
                (if is-call
                    (asserts! (< strike-price spot-price) ERR-IN-THE-MONEY)
                    (asserts! (> strike-price spot-price) ERR-IN-THE-MONEY)
                )
                (asserts!
                    (<= locked-liquidity
                        (unwrap-panic (contract-call? .liquidity-manager
                            get-available-liquidity
                        ))
                    )
                    ERR-INSUFFICIENT-LIQUIDITY
                )
                (asserts! (< premium-slippage premium) ERR-INSUFFICIENT-BALANCE)
                (try! (contract-call? .mock-usda transfer premium tx-sender
                    (as-contract tx-sender) none
                ))
                (try! (contract-call? .liquidity-manager lock-liquidity
                    locked-liquidity
                ))

                (var-set option-counter option-id)
                (map-set options { option-id: option-id } {
                    option-id: option-id,
                    owner: tx-sender,
                    strike: strike-price,
                    expiry: expiry,
                    size: size,
                    is-call: is-call,
                    premium: premium,
                    locked-liquidity: locked-liquidity,
                    is-exercised: false,
                    profit: 0,
                    exercise-price: u0,
                })
                (print {
                    event: "option-created",
                    option-id: option-id,
                    owner: tx-sender,
                    strike: strike-price,
                    expiry: expiry,
                    size: size,
                    is-call: is-call,
                    premium: premium,
                    locked-liquidity: locked-liquidity,
                    spot-price: spot-price,
                })
                (ok {
                    option-id: option-id,
                    premium: premium,
                    expiry: expiry,
                    spot-price: spot-price,
                })
            )
        )
    )
)

(define-public (exercise-option
        (option-id uint)
        (price-feed (buff 8192))
    )
    (let ((option (map-get? options { option-id: option-id })))
        (begin
            (asserts! (is-some option) ERR-OPTIONS-NOT-EXIST)
            (let (
                    (option-data (unwrap! option ERR-OPTIONS-NOT-EXIST))
                    (is-excercised (get is-exercised option-data))
                    (expiry (get expiry option-data))
                    (size (get size option-data))
                    (strike (get strike option-data))
                    (is-call (get is-call option-data))
                    (premium (get premium option-data))
                    (locked-liquidity (get locked-liquidity option-data))
                    (owner (get owner option-data))
                )
                (begin
                    (asserts! (is-eq owner tx-sender) ERR-NOT-OPTION-OWNER)
                    (asserts! (not is-excercised) ERR-OPTION-EXERCISED)
                    (asserts!
                        (> expiry (unwrap-panic (get-stacks-block-info? time u0)))
                        ERR-OPTION-NOT-EXPIRED
                    )
                    (let (
                            (spot-price (to-uint (unwrap-panic (get-price price-feed))))
                            (payout (unwrap-panic (calculate-payout spot-price strike is-call size)))
                            (protocol-fee (/ (* premium PROTOCOL-FEE-PERCENTAGE) PRECISION))
                            (liquidity-fee (- premium protocol-fee))
                        )
                        (begin
                            (map-set options { option-id: option-id }
                                (merge option-data {
                                    is-exercised: true,
                                    profit: (to-int payout),
                                    exercise-price: spot-price,
                                })
                            )
                            (var-set protocol-revenue
                                (+ (var-get protocol-revenue) protocol-fee)
                            )
                            (let ((liquidity-pnl (if (> payout u0)
                                    (- (to-int liquidity-fee) (to-int payout))
                                    (to-int liquidity-fee)
                                )))
                                (begin
                                    (try! (contract-call? .liquidity-manager
                                        distribute-pnl liquidity-pnl
                                    ))
                                    (print {
                                        event: "option-exercised",
                                        option-id: option-id,
                                        owner: owner,
                                        payout: payout,
                                        spot-price: spot-price,
                                        protocol-fee: protocol-fee,
                                        liquidity-fee: liquidity-fee,
                                        liquidity-pnl: liquidity-pnl,
                                    })
                                    (ok {
                                        payout: payout,
                                        spot-price: spot-price,
                                        protocol-fee: protocol-fee,
                                        liquidity-fee: liquidity-fee,
                                        liquidity-pnl: liquidity-pnl,
                                    })
                                )
                            )
                        )
                    )
                )
            )
        )
    )
)

(define-public (add-liquidity (amount uint))
    (begin
        (asserts! (> amount u0) ERR-INVALID-PRICE)
        (try! (contract-call? .mock-usda transfer amount tx-sender
            (as-contract tx-sender) none
        ))
        (try! (contract-call? .liquidity-manager add-liquidity tx-sender amount))
        (print {
            event: "liquidity-added",
            provider: tx-sender,
            amount: amount,
        })
        (ok amount)
    )
)

(define-public (remove-liquidity (amount uint))
    (begin
        (asserts! (> amount u0) ERR-INVALID-PRICE)
        (try! (contract-call? .liquidity-manager remove-liquidity tx-sender amount))
        (try! (contract-call? .mock-usda transfer amount (as-contract tx-sender)
            tx-sender none
        ))
        (print {
            event: "liquidity-removed",
            provider: tx-sender,
            amount: amount,
        })
        (ok amount)
    )
)

(define-public (claim-protocol-revenue (recipient principal))
    (begin
        (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-UNAUTHORIZED)
        (let ((amount (var-get protocol-revenue)))
            (begin
                (asserts! (> amount u0) ERR-NO-REVENUE)
                (var-set protocol-revenue u0)
                (try! (contract-call? .mock-usda transfer amount
                    (as-contract tx-sender) recipient none
                ))
                (print {
                    event: "protocol-revenue-claimed",
                    recipient: recipient,
                    amount: amount,
                })
                (ok amount)
            )
        )
    )
)

;; read only functions
(define-read-only (get-cap-multiplier (days uint))
    (begin
        (asserts! (>= days u1) ERR-INVALID-DURATION)
        (asserts! (<= days u30) ERR-INVALID-DURATION)

        (ok (if (<= days u7)
            u125000
            (if (<= days u14)
                u150000
                (if (<= days u21)
                    u175000
                    u200000
                )
            )
        ))
    )
)

(define-read-only (calculate-premium
        (spot-price uint)
        (strike-price uint)
        (is-call bool)
        (days uint)
        (size uint)
    )
    (let (
            (moneyness-multiplier (get-moneyness-multiplier spot-price strike-price is-call))
            (sqrt-time (sqrti (/ (* days PRECISION) u365)))
            (utilization-rate (unwrap-panic (contract-call? .liquidity-manager get-utilization-rate)))
            (dynamic-multiplier (+ BASE-MULTIPLIER
                (/ (* utilization-rate UTILIZATION-MULTIPLIER) PRECISION)
            ))
            (time-value (/
                (* spot-price VOLATILITY sqrt-time dynamic-multiplier
                    moneyness-multiplier size
                )
                (* PRECISION PRECISION PRECISION PRECISION PRECISION)
            ))
        )
        (ok time-value)
    )
)

(define-read-only (get-moneyness-multiplier
        (spot uint)
        (strike uint)
        (is-call bool)
    )
    (let ((ratio (if is-call
            (/ (* strike u100) spot)
            (/ (* spot u100) strike)
        )))
        (if (<= ratio u105)
            u1000000
            (if (<= ratio u110)
                u800000
                (if (<= ratio u115)
                    u600000
                    (if (<= ratio u120)
                        u400000
                        (if (<= ratio u125)
                            u2500000
                            u1000000
                        )
                    )
                )
            )
        )
    )
)

(define-read-only (calculate-locked-liquidity
        (size uint)
        (spot-price uint)
        (strike-price uint)
        (is-call bool)
        (days uint)
    )
    (let (
            (cap-mult (unwrap-panic (get-cap-multiplier days)))
            (capped-spot (if is-call
                (/ (* spot-price cap-mult) PRECISION)
                (/ (* spot-price PRECISION) cap-mult)
            ))
            (intrinsic (unwrap-panic (calculate-intrinsic-value capped-spot strike-price is-call)))
        )
        (ok (* intrinsic size))
    )
)

(define-read-only (calculate-payout
        (spot-price uint)
        (strike-price uint)
        (is-call bool)
        (size uint)
    )
    (let ((intrinsic (unwrap-panic (calculate-intrinsic-value spot-price strike-price is-call))))
        (ok (* intrinsic size))
    )
)

(define-read-only (calculate-intrinsic-value
        (spot-price uint)
        (strike-price uint)
        (is-call bool)
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

(define-read-only (max-of
        (i1 uint)
        (i2 uint)
    )
    (if (> i1 i2)
        i1
        i2
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
