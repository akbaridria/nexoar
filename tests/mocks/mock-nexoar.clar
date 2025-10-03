;; Mock Nexoar Contract
;; This contract is used for testing the vault-tracker contract
;; It allows us to call vault-tracker functions as contract-caller

;; Call add-stake on vault-tracker
(define-public (call-add-stake (provider principal) (amount uint))
    (contract-call? .vault-tracker add-stake provider amount)
)

;; Call remove-stake on vault-tracker
(define-public (call-remove-stake (provider principal) (amount uint))
    (contract-call? .vault-tracker remove-stake provider amount)
)

;; Call distribute-pnl on vault-tracker
(define-public (call-distribute-pnl (pnl int))
    (contract-call? .vault-tracker distribute-pnl pnl)
)