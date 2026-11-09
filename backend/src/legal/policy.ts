// The current versions. Bump a version whenever the text changes in a way users should re-accept.
export const POLICY_VERSION = '2026-11-09'
export const TERMS_VERSION = '2026-11-09'

// Users must accept both documents. Changing either version asks everyone to accept again.
export const CURRENT_ACCEPTANCE = `${POLICY_VERSION}|${TERMS_VERSION}`