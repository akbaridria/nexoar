;; title: nexoar
;; version: 1.0.0
;; summary: core contract of nexoar
;; description: This contract serves as the core of the Nexoar platform, providing essential functionalities and data structures.

;; traits

;; constants
(define-constant round-duration-seconds u259200)

;; errors
(define-constant err-not-owner u100)
(define-constant err-invalid-timestamp u101)
(define-constant err-round-not-found u102)

;; data vars
(define-data-var owner principal tx-sender)
(define-data-var round-id uint u0)
(define-data-var next-round-id uint u1)

;; data maps
(define-map rounds
    { id: uint }
    {
        start-time: uint,
        end-time: uint,
        total-amount: uint,
        total-weight: uint,
        participants: uint,
        resolved: bool,
        list-winner: (optional (list 3 principal)),
        winner-amounts: (optional (list 3 uint)),
        rest-amount: uint,
    }
)

;; public functions
(define-public (initialize)
    (begin
        (asserts! (is-valid-caller) (err err-not-owner))
        (begin
            (map-set rounds { id: u0 } {
                start-time: u0,
                end-time: u0,
                total-amount: u0,
                total-weight: u0,
                participants: u0,
                resolved: true,
                list-winner: none,
                winner-amounts: none,
                rest-amount: u0,
            })
            (ok true)
        )
    )
)

(define-public (start-round)
    (begin
        (asserts! (is-valid-caller) (err err-not-owner))
        (let (
                (current-round-id (var-get next-round-id))
                (current-time (unwrap! (get-stacks-block-info? time u0)
                    (err err-invalid-timestamp)
                ))
                (new-round-id (+ (var-get next-round-id) u1))
            )
            (if (is-none (map-get? rounds { id: current-round-id }))
                (begin
                    (map-set rounds { id: current-round-id } {
                        start-time: current-time,
                        end-time: (+ current-time round-duration-seconds),
                        total-amount: u0,
                        total-weight: u0,
                        participants: u0,
                        resolved: false,
                        list-winner: none,
                        winner-amounts: none,
                        rest-amount: u0,
                    })
                    (var-set round-id current-round-id)
                    (var-set next-round-id new-round-id)
                    (ok true)
                )
                (err err-round-not-found)
            )
        )
    )
)

;; read only functions
(define-read-only (get-round-detail)
    (map-get? rounds { id: (var-get round-id) })
)

(define-read-only (get-current-round)
    (var-get round-id)
)

;; private functions
(define-private (is-valid-caller)
    (is-eq tx-sender (var-get owner))
)
