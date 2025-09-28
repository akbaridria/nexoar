;; title: nexoar
;; version: 1.0.0
;; summary: core contract of nexoar
;; description: This contract serves as the core of the Nexoar platform, providing essential functionalities and data structures.

;; traits

;; constants
(define-constant round-duration-seconds u259200) ;; 3 days
(define-constant minimum-deposit-stx u1000000) ;; 1 STX

;; errors
(define-constant err-not-owner u100)
(define-constant err-invalid-timestamp u101)
(define-constant err-round-not-found u102)
(define-constant err-initialized-has-been-called u103)
(define-constant err-amount-too-small u104)

;; data vars
(define-data-var owner principal tx-sender)
(define-data-var round-id uint u0)
(define-data-var next-round-id uint u1)
(define-data-var is-initialized-called bool false)

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

(define-map participants
    {
        round-id: uint,
        participant: principal,
    }
    {
        amount: uint,
        weight: uint,
        is-winner: bool,
        reward: uint,
        claimed: bool,
    }
)

;; public functions
(define-public (initialize)
    (begin
        (asserts! (is-valid-caller) (err err-not-owner))
        (asserts! (is-eq (var-get is-initialized-called) false)
            (err err-initialized-has-been-called)
        )
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
            (map-set rounds { id: u1 } {
                start-time: u0,
                end-time: u0,
                total-amount: u0,
                total-weight: u0,
                participants: u0,
                resolved: false,
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
                (round-detail (map-get? rounds { id: current-round-id }))
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

(define-public (deposit (amount uint))
    (begin
        (asserts! (>= amount minimum-deposit-stx) (err err-amount-too-small))

        (let (
                (n-round-id (var-get next-round-id))
                (round-detail (map-get? rounds { id: n-round-id }))
                (participant-key {
                    round-id: n-round-id,
                    participant: tx-sender,
                })
                (participant-detail (map-get? participants participant-key))
            )
            (if (is-some round-detail)
                (let (
                        (detail (unwrap! round-detail (err err-round-not-found)))
                        (total-amount (get total-amount detail))
                        (total-weight (get total-weight detail))
                        (participants-count (get participants detail))
                        (new-total-amount (+ amount total-amount))
                    )
                    (if (is-none participant-detail)
                        (begin
                            (let ((weight (sqrti amount)))
                                (map-set participants participant-key {
                                    amount: amount,
                                    weight: weight,
                                    is-winner: false,
                                    reward: u0,
                                    claimed: false,
                                })
                                (map-set rounds { id: n-round-id } {
                                    start-time: (get start-time detail),
                                    end-time: (get end-time detail),
                                    total-amount: new-total-amount,
                                    total-weight: (+ weight total-weight),
                                    participants: (+ u1 participants-count),
                                    resolved: (get resolved detail),
                                    list-winner: (get list-winner detail),
                                    winner-amounts: (get winner-amounts detail),
                                    rest-amount: (get rest-amount detail),
                                })
                                (ok true)
                            )
                        )
                        (begin
                            (let (
                                    (old-participant (unwrap! participant-detail
                                        (err err-round-not-found)
                                    ))
                                    (old-amount (get amount old-participant))
                                    (old-weight (get weight old-participant))
                                    (updated-amount (+ amount old-amount))
                                    (weight (sqrti updated-amount))
                                    (weight-diff (- weight old-weight))
                                )
                                (map-set participants participant-key {
                                    amount: updated-amount,
                                    weight: weight,
                                    is-winner: (get is-winner old-participant),
                                    reward: (get reward old-participant),
                                    claimed: (get claimed old-participant),
                                })
                                (map-set rounds { id: n-round-id } {
                                    start-time: (get start-time detail),
                                    end-time: (get end-time detail),
                                    total-amount: new-total-amount,
                                    total-weight: (+ total-weight weight-diff),
                                    participants: participants-count,
                                    resolved: (get resolved detail),
                                    list-winner: (get list-winner detail),
                                    winner-amounts: (get winner-amounts detail),
                                    rest-amount: (get rest-amount detail),
                                })
                                (ok true)
                            )
                        )
                    )
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
