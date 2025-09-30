;; title: nexoar
;; version: 1.0.0
;; summary: core contract of nexoar
;; description: This contract serves as the core of the Nexoar platform, providing essential functionalities and data structures.

;; traits

;; constants

;; errors

;; data vars

;; data maps
(define-map options
    { user: principal }
    {
        option-id: uint,
        strike-price: uint,
        premium: uint,
        expiration: uint,
        is-called: bool,
        is-exercised: bool,
    }
)
;; public functions

;; read only functions)

;; private functions

(define-private (calculate-intrinsic-value
        (spot-price uint)
        (strike-price uint)
        (is-called bool)
        (response uint)
    )
    (if is-called
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
