;; constants
(define-constant PRECISION u1000000) ;; 1e6
(define-constant CONTRACT-OWNER tx-sender)

;; errors
(define-constant ERR-INSUFFICIENT-BALANCE (err u100))
(define-constant ERR-INSUFFICIENT-STAKE (err u101))
(define-constant ERR-UNAUTHORIZED (err u102))

;; data vars
(define-data-var total-staked uint u0)
(define-data-var acc-reward-per-share int 0)
(define-data-var last-reward-time uint u0)
(define-data-var total-pnl int 0)

;; data maps
(define-map providers
    principal
    {
        stake: uint,
        reward-debt: int,
        last-update-time: uint,
    }
)

;; public functions
(define-public (add-stake
        (provider principal)
        (amount uint)
    )
    (begin
        (asserts! (is-eq contract-caller .liquidity-manager-v1-7-0)
            ERR-UNAUTHORIZED
        )
        (asserts! (>= amount u0) ERR-INSUFFICIENT-BALANCE)
        (update-pool)

        (match (map-get? providers provider)
            existing-provider (begin
                (map-set providers provider {
                    stake: (+ (get stake existing-provider) amount),
                    reward-debt: (+ (get reward-debt existing-provider)
                        (/ (* (var-get acc-reward-per-share) (to-int amount))
                            (to-int PRECISION)
                        )),
                    last-update-time: stacks-block-height,
                })
            )
            (map-set providers provider {
                stake: amount,
                reward-debt: (/ (* (var-get acc-reward-per-share) (to-int amount))
                    (to-int PRECISION)
                ),
                last-update-time: stacks-block-height,
            })
        )

        (var-set total-staked (+ (var-get total-staked) amount))
        (ok true)
    )
)

(define-public (remove-stake
        (provider principal)
        (amount uint)
    )
    (let (
            (provider-data (unwrap! (map-get? providers provider) ERR-INSUFFICIENT-STAKE))
            (effective-balance (get-effective-balance provider))
            (pending-rewards (get-pending-rewards provider))
        )
        (begin
            (asserts! (is-eq contract-caller .liquidity-manager-v1-7-0)
                ERR-UNAUTHORIZED
            )
            (update-pool)

            (asserts! (<= amount effective-balance) ERR-INSUFFICIENT-BALANCE)

            (let (
                    (stake-to-remove (if (>= pending-rewards 0)
                        (let ((positive-rewards (to-uint pending-rewards)))
                            (if (<= amount positive-rewards)
                                u0
                                (- amount positive-rewards)
                            )
                        )
                        amount
                    ))
                    (current-stake (get stake provider-data))
                )
                (if (> stake-to-remove u0)
                    (begin
                        (asserts! (>= current-stake stake-to-remove)
                            ERR-INSUFFICIENT-STAKE
                        )

                        (let ((new-stake (- current-stake stake-to-remove)))
                            (if (is-eq new-stake u0)
                                (map-delete providers provider)
                                (map-set providers provider {
                                    stake: new-stake,
                                    reward-debt: (- (get reward-debt provider-data)
                                        (/
                                            (* (var-get acc-reward-per-share)
                                                (to-int stake-to-remove)
                                            )
                                            (to-int PRECISION)
                                        )),
                                    last-update-time: stacks-block-height,
                                })
                            )
                        )

                        (var-set total-staked
                            (- (var-get total-staked) stake-to-remove)
                        )
                    )
                    (map-set providers provider {
                        stake: current-stake,
                        reward-debt: (get reward-debt provider-data),
                        last-update-time: stacks-block-height,
                    })
                )
                (ok amount)
            )
        )
    )
)

(define-public (distribute-pnl (pnl int))
    (begin
        (asserts! (is-eq contract-caller .liquidity-manager-v1-7-0)
            ERR-UNAUTHORIZED
        )
        (if (is-eq (var-get total-staked) u0)
            (ok true)
            (begin
                (update-pool)

                (var-set total-pnl (+ (var-get total-pnl) pnl))

                (if (not (is-eq pnl 0))
                    (let ((reward-per-share (/ (* pnl (to-int PRECISION))
                            (to-int (var-get total-staked))
                        )))
                        (var-set acc-reward-per-share
                            (+ (var-get acc-reward-per-share) reward-per-share)
                        )
                    )
                    false
                )
                (ok true)
            )
        )
    )
)

;; private functions
(define-private (get-pending-rewards (provider principal))
    (match (map-get? providers provider)
        provider-data (let (
                (stake (get stake provider-data))
                (reward-debt (get reward-debt provider-data))
            )
            (if (is-eq stake u0)
                0
                (-
                    (/ (* (to-int stake) (var-get acc-reward-per-share))
                        (to-int PRECISION)
                    )
                    reward-debt
                )
            )
        )
        0
    )
)

(define-private (get-effective-balance (provider principal))
    (match (map-get? providers provider)
        provider-data (let (
                (stake (get stake provider-data))
                (pending-rewards (get-pending-rewards provider))
                (effective-bal (+ (to-int stake) pending-rewards))
            )
            (if (is-eq stake u0)
                u0
                (if (> effective-bal 0)
                    (to-uint effective-bal)
                    u0
                )
            )
        )
        u0
    )
)

(define-private (update-pool)
    (begin
        (if (<= stacks-block-height (var-get last-reward-time))
            true
            (var-set last-reward-time stacks-block-height)
        )
        true
    )
)

;; read only functions
(define-read-only (get-provider-info (provider principal))
    (match (map-get? providers provider)
        provider-data (ok {
            stake: (get stake provider-data),
            pending-rewards: (get-pending-rewards provider),
            effective-balance: (get-effective-balance provider),
        })
        (ok {
            stake: u0,
            pending-rewards: 0,
            effective-balance: u0,
        })
    )
)

(define-read-only (get-pool-info)
    (ok {
        total-staked: (var-get total-staked),
        acc-reward-per-share: (var-get acc-reward-per-share),
        total-pnl: (var-get total-pnl),
        last-reward-time: (var-get last-reward-time),
    })
)

(define-read-only (get-provider-stake (provider principal))
    (match (map-get? providers provider)
        provider-data (get stake provider-data)
        u0
    )
)

(define-read-only (get-provider-pending-rewards (provider principal))
    (get-pending-rewards provider)
)

(define-read-only (get-provider-effective-balance (provider principal))
    (get-effective-balance provider)
)
