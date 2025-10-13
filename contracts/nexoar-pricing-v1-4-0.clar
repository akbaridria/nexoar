(define-constant PRECISION u1000000)
(define-constant VOLATILITY u800000)
(define-constant DAYS_PER_YEAR u365)
(define-constant TIME_VALUE_COEFF u496000)
(define-constant MAX_PCT_DISTANCE u500000)

(define-private (abs-diff
        (a uint)
        (b uint)
    )
    (if (> a b)
        (- a b)
        (- b a)
    )
)

(define-private (get-moneyness-distance
        (spot uint)
        (strike uint)
    )
    (if (<= strike u0)
        PRECISION
        (let ((diff (abs-diff spot strike)))
            (/ (* diff PRECISION) strike)
        )
    )
)

(define-private (get-sqrt-time (duration uint))
    (let ((scaled-input (/ (* duration (* PRECISION PRECISION)) DAYS_PER_YEAR)))
        (sqrti scaled-input)
    )
)

(define-private (calculate-time-value
        (spot uint)
        (strike uint)
        (sqrt-time uint)
    )
    (let (
            (vol-term (* strike VOLATILITY))
            (numerator (* vol-term sqrt-time))
            (denominator (* PRECISION PRECISION))
            (base (/ numerator denominator))
        )
        (let (
                (base-with-coeff (/ (* base TIME_VALUE_COEFF) PRECISION))
                (pct-dist (get-moneyness-distance spot strike))
            )
            (let (
                    (decay-numerator (* pct-dist PRECISION))
                    (decay-denominator MAX_PCT_DISTANCE)
                    (raw-decay (if (> decay-denominator u0)
                        (/ decay-numerator decay-denominator)
                        PRECISION
                    ))
                    (clamped-decay (if (> raw-decay PRECISION)
                        PRECISION
                        raw-decay
                    ))
                )
                (let ((one-minus-decay (if (> PRECISION clamped-decay)
                        (- PRECISION clamped-decay)
                        u0
                    )))
                    (/ (* base-with-coeff one-minus-decay) PRECISION)
                )
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
            (sqrt-time (get-sqrt-time duration))
            (time-value (calculate-time-value spot strike sqrt-time))
        )
        (+ intrinsic time-value)
    )
)

(define-read-only (calculate-payout
        (spot uint)
        (strike uint)
        (is-call bool)
        (size uint)
    )
    (let ((intrinsic (calculate-intrinsic spot strike is-call)))
        (ok (/ (* intrinsic size) u100))
    )
)
