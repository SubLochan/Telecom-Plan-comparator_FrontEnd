/**
 * Per-user session manager.
 *
 * Strategy:
 *   - Each user's JWT is stored under a unique key: `sf_token_<username>`
 *     so multiple users can have saved tokens in the same browser.
 *   - The *active* session for this tab is tracked in sessionStorage
 *     (`sf_active_user`) — tab-scoped, so two tabs can be different users.
 *   - On logout we clear only this user's token, leaving others intact.
 */

const TOKEN_PREFIX  = 'sf_token_'
const ACTIVE_KEY    = 'sf_active_user'   // sessionStorage — per tab

// ── Token storage (localStorage — persists across tabs / restarts) ──────────

export function saveToken(username, token) {
  localStorage.setItem(TOKEN_PREFIX + username, token)
  sessionStorage.setItem(ACTIVE_KEY, username)           // mark this tab's active user
}

export function getToken(username) {
  if (!username) return null
  return localStorage.getItem(TOKEN_PREFIX + username) ?? null
}

export function removeToken(username) {
  if (username) localStorage.removeItem(TOKEN_PREFIX + username)
}

// ── Active session (sessionStorage — per tab) ────────────────────────────────

export function getActiveUsername() {
  return sessionStorage.getItem(ACTIVE_KEY) ?? null
}

export function clearActiveSession() {
  sessionStorage.removeItem(ACTIVE_KEY)
}

/** Returns the JWT for whichever user is active in this tab, or null. */
export function getActiveToken() {
  const username = getActiveUsername()
  return getToken(username)
}

/** List all usernames that have a saved token (any tab). */
export function getSavedSessions() {
  const sessions = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(TOKEN_PREFIX)) {
      const username = key.slice(TOKEN_PREFIX.length)
      sessions.push(username)
    }
  }
  return sessions
}

/** Switch the active tab to a different already-saved session. */
export function switchSession(username) {
  const token = getToken(username)
  if (!token) return false
  sessionStorage.setItem(ACTIVE_KEY, username)
  return true
}
