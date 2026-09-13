# FREELA Security Specification & Security Invariants

## 1. Data Invariants
- Invariant 1 (Strict Owner Isolation): A user can only read and write documents in `/users/{userId}` and `/workspaces/{userId}` if and only if `request.auth != null` and `request.auth.uid == userId`.
- Invariant 2 (PII Protection): User profile documents containing email and personal details can never be queried or read by any other authenticated or anonymous user.
- Invariant 3 (Identity Immutability): The `uid` in `/users/{userId}` and `userId` in `/workspaces/{userId}` must match `request.auth.uid` on create and cannot be mutated during update.
- Invariant 4 (Default-Deny Catch-All): Any access to root collections or unspecified document paths must immediately evaluate to `false`.

## 2. The "Dirty Dozen" Malicious Payloads
1. Unauthenticated read on `/users/{targetUserId}`
2. Unauthenticated write on `/workspaces/{targetUserId}`
3. Authenticated User A reading User B's `/users/{userB}`
4. Authenticated User A reading User B's `/workspaces/{userB}`
5. Authenticated User A writing/overwriting User B's `/users/{userB}`
6. Authenticated User A writing/overwriting User B's `/workspaces/{userB}`
7. Authenticated User A creating a `/users/{userA}` document with a spoofed `uid: "userB"`
8. Authenticated User A creating a `/workspaces/{userA}` document with a spoofed `userId: "userB"`
9. Authenticated User attempting an update on `/workspaces/{userId}` to hijack ownership by changing `userId`
10. Attempting to list all `/users` without scoping by owner UID
11. Attempting to list all `/workspaces` without scoping by owner UID
12. Random injection into unspecified collections (e.g. `/system_configs/master` or `/admins/evil`)

All 12 payloads must result in PERMISSION_DENIED.
