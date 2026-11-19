# GlamGuard Firestore Security Specification

## 1. Data Invariants
1. **Strict Owner Isolation**: Every document in `/users/{userId}` and its subcollections (`/plans/{planId}`, `/feedback/{feedbackId}`, `/pricingResponses/{responseId}`) can only be read, created, updated, or deleted by the authenticated user whose `request.auth.uid == userId`.
2. **Master Gate Sync**: Subcollection writes (`plans`, `feedback`, `pricingResponses`) verify that the parent `/users/{userId}` profile document exists via `exists()` (except when creating the user document itself).
3. **Immutable Ownership & Creation Time**: `uid` / `userId` and `createdAt` cannot be modified after document creation, and `createdAt` / `updatedAt` must equal `request.time`.
4. **Strict Schema & Bounds**: Every string field enforces `.size()` limits, every list enforces `.size() <= MAX` and element type checks, and every write passes `hasOnly()` key validation.
5. **No Shadow Fields or Privilege Escalation**: Unknown fields (`role`, `isAdmin`, `isPremium`, `credits`) are rejected on both create and update.

## 2. Adversarial "Dirty Dozen" Payloads (Expected: PERMISSION_DENIED)
1. **Cross-user profile read**: User B requests `get(/users/userA)`.
2. **Cross-user plans list**: User B queries `collection('/users/userA/plans')`.
3. **Unauthenticated read/write**: Signed-out request attempts to create or read `/users/userA`.
4. **UID spoofing on create**: User A creates `/users/userA/plans/p1` with `userId: "userB"`.
5. **Shadow privilege field on create**: User A creates `/users/userA` with `{ ..., isAdmin: true }`.
6. **Shadow field on update**: User A updates `/users/userA` adding `{ subscriptionTier: "free_forever" }`.
7. **Immutable createdAt tampering**: User A updates `/users/userA` with a forged past `createdAt`.
8. **Client-forged future timestamp**: User A creates `/users/userA/plans/p1` with `createdAt: Timestamp(2099-01-01)`.
9. **ID poisoning**: User A creates `/users/userA/plans/bad$id/with/slashes` or a 300-character ID.
10. **Array flooding (Denial of Wallet)**: User A submits `existingProducts` with 100 items (limit 40) or `concerns` with 50 items (limit 20).
11. **Type poisoning on update**: User A updates `/users/userA/plans/p1` setting `feedbackRating: "five"` (string instead of number) or `feedbackRating: 99`.
12. **Out-of-bounds string injection**: User A submits `writtenFeedback` with 5,000 characters (limit 1,000).
