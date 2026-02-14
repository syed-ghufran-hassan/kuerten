;; Import the SIP-010 trait
(use-trait sip-010-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

;; Implement the trait
(impl-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

;; Define the FT, with no maximum supply
(define-fungible-token kuerten)

;; Define errors
(define-constant ERR_OWNER_ONLY (err u100))
(define-constant ERR_NOT_TOKEN_OWNER (err u101))
(define-constant ERR_NOT_ADMIN (err u102))
(define-constant ERR_MAX_ADMINS (err u110))
(define-constant ERR_ALREADY_ADMIN (err u111))
(define-constant ERR_CANNOT_REMOVE_OWNER (err u112))
(define-constant ERR_ADMIN_NOT_FOUND (err u113))

;; Define constants for contract
(define-constant CONTRACT_OWNER tx-sender)
(define-constant TOKEN_URI u"https://hiro.so")
(define-constant TOKEN_NAME "kuerten")
(define-constant TOKEN_SYMBOL "kuerten")
(define-constant TOKEN_DECIMALS u6)

;; Data vars
(define-data-var admins (list 10 principal) (list CONTRACT_OWNER))

;; SIP-010 function: Get the token balance
(define-read-only (get-balance (who principal))
  (ok (ft-get-balance kuerten who))
)

;; SIP-010 function: Returns the total supply
(define-read-only (get-total-supply)
  (ok (ft-get-supply kuerten))
)

;; SIP-010 function: Returns the token name
(define-read-only (get-name)
  (ok TOKEN_NAME)
)

;; SIP-010 function: Returns the symbol
(define-read-only (get-symbol)
  (ok TOKEN_SYMBOL)
)

;; SIP-010 function: Returns decimals
(define-read-only (get-decimals)
  (ok TOKEN_DECIMALS)
)

;; SIP-010 function: Returns the token URI
(define-read-only (get-token-uri)
  (ok (some TOKEN_URI))
)

;; Mint new tokens
(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
    (ft-mint? kuerten amount recipient)
  )
)

;; SIP-010 function: Transfers tokens
(define-public (transfer
    (amount uint)
    (sender principal)
    (recipient principal)
    (memo (optional (buff 34)))
  )
  (begin
    (asserts! (or (is-eq tx-sender sender) (is-eq contract-caller sender))
      ERR_NOT_TOKEN_OWNER
    )
    (try! (ft-transfer? kuerten amount sender recipient))
    (match memo
      to-print (print to-print)
      0x
    )
    (ok true)
  )
)

;; Simple admin functions
(define-read-only (is-admin (user principal))
  (match (index-of (var-get admins) user)
    some-index (ok true)
    (ok false)
  )
)

(define-public (add-admin (new-admin principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
    (let (
          (current-admins (var-get admins))
         )
      ;; Check if we have room for another admin (max 10)
      (asserts! (< (len current-admins) u10) ERR_MAX_ADMINS)
      ;; Check if not already an admin
      (asserts! (is-none (index-of current-admins new-admin)) ERR_ALREADY_ADMIN)
      ;; Add the new admin - ensure we don't exceed max length
      (let (
            (new-admins (unwrap-panic (as-max-len? (append current-admins new-admin) u10)))
           )
        (var-set admins new-admins)
      )
      (print { event: "admin-added", admin: new-admin, added-by: tx-sender })
      (ok true)
    )
  )
)

;; Non-recursive admin removal using list comprehension
(define-public (remove-admin (admin-to-remove principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_OWNER_ONLY)
    (asserts! (not (is-eq admin-to-remove CONTRACT_OWNER)) ERR_CANNOT_REMOVE_OWNER)
    
    (let (
          (current-admins (var-get admins))
         )
      ;; Manually filter the list (up to 10 admins)
      (let (
            (a0 (if (is-eq (unwrap-panic (element-at current-admins u0)) admin-to-remove) (list) (list (unwrap-panic (element-at current-admins u0)))))
            (a1 (if (>= (len current-admins) u2) (if (is-eq (unwrap-panic (element-at current-admins u1)) admin-to-remove) a0 (append a0 (unwrap-panic (element-at current-admins u1)))) a0))
            (a2 (if (>= (len current-admins) u3) (if (is-eq (unwrap-panic (element-at current-admins u2)) admin-to-remove) a1 (append a1 (unwrap-panic (element-at current-admins u2)))) a1))
            (a3 (if (>= (len current-admins) u4) (if (is-eq (unwrap-panic (element-at current-admins u3)) admin-to-remove) a2 (append a2 (unwrap-panic (element-at current-admins u3)))) a2))
            (a4 (if (>= (len current-admins) u5) (if (is-eq (unwrap-panic (element-at current-admins u4)) admin-to-remove) a3 (append a3 (unwrap-panic (element-at current-admins u4)))) a3))
            (a5 (if (>= (len current-admins) u6) (if (is-eq (unwrap-panic (element-at current-admins u5)) admin-to-remove) a4 (append a4 (unwrap-panic (element-at current-admins u5)))) a4))
            (a6 (if (>= (len current-admins) u7) (if (is-eq (unwrap-panic (element-at current-admins u6)) admin-to-remove) a5 (append a5 (unwrap-panic (element-at current-admins u6)))) a5))
            (a7 (if (>= (len current-admins) u8) (if (is-eq (unwrap-panic (element-at current-admins u7)) admin-to-remove) a6 (append a6 (unwrap-panic (element-at current-admins u7)))) a6))
            (a8 (if (>= (len current-admins) u9) (if (is-eq (unwrap-panic (element-at current-admins u8)) admin-to-remove) a7 (append a7 (unwrap-panic (element-at current-admins u8)))) a7))
            (a9 (if (>= (len current-admins) u10) (if (is-eq (unwrap-panic (element-at current-admins u9)) admin-to-remove) a8 (append a8 (unwrap-panic (element-at current-admins u9)))) a8))
           )
        (var-set admins (unwrap-panic (as-max-len? a9 u10)))
      )
      
      ;; Check if admin was actually removed
      (asserts! (< (len (var-get admins)) (len current-admins)) ERR_ADMIN_NOT_FOUND)
      (print { event: "admin-removed", admin: admin-to-remove, removed-by: tx-sender })
      (ok true)
    )
  )
)

;; Optional: Function to list all admins
(define-read-only (get-all-admins)
  (ok (var-get admins))
)

;; Optional: Function to get admin count
(define-read-only (get-admin-count)
  (ok (len (var-get admins)))
)
