(define-constant PRECISION u1000000)
(define-constant VOLATILITY u80)
(define-constant EXTRINSIC_RATE u5)
(define-constant DAYS_PER_YEAR u365)

(define-read-only (get-moneyness-factor
        (spot uint)
        (strike uint)
        (is-call bool)
    )
    (let (
            (ratio (if is-call
                (/ (* spot u100) strike)
                (/ (* strike u100) spot)
            ))
            (diff (if (> ratio u100)
                (- ratio u100)
                (- u100 ratio)
            ))
            ;; 0.005 * diff = decay rate
            (decay (/ (* diff u5) u1000))
            (base u1200000)
            (m (if (> ratio u100)
                (if (> base decay)
                    (- base decay)
                    u600000
                )
                (+ base decay)
            ))
        )
        (if (> m u1500000)
            u1500000
            (if (< m u600000)
                u600000
                m
            )
        )
    )
)

(define-read-only (calculate-intrinsic
        (spot uint)
        (strike uint)
        (is-call bool)
    )
    (if is-call
        (if (> spot strike)
            (- spot strike)
            u0
        )
        (if (< spot strike)
            (- strike spot)
            u0
        )
    )
)

(define-read-only (calculate-premium
        (spot uint)
        (strike uint)
        (duration uint)
        (is-call bool)
    )
    (let (
            (intrinsic (calculate-intrinsic spot strike is-call))
            (extrinsic (/ (* strike EXTRINSIC_RATE) u100))
            (time-ratio (/ (* duration PRECISION) DAYS_PER_YEAR))
            (vol-mult (+ PRECISION (/ (* VOLATILITY time-ratio) u100)))
            (moneyness (get-moneyness-factor spot strike is-call))
            (base (+ intrinsic extrinsic))
            (premium (/ (* (* base vol-mult) moneyness) PRECISION))
        )
        premium
    )
)

(define-read-only (calculate-payout
        (spot uint)
        (strike uint)
        (is-call bool)
        (size uint)
    )
    (let ((intrinsic (calculate-intrinsic spot strike is-call)))
        (ok (* intrinsic size))
    )
)
