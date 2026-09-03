// Vercel Blob read-write token resolver.
//
// The Blob store may be connected under a non-default env var name
// (e.g. BLOB_READ_WRITE_TOKEN_STORE_ID), and a stale/invalid
// BLOB_READ_WRITE_TOKEN may linger from a cloned project. A valid Vercel Blob
// read-write token always has the shape: vercel_blob_rw_<storeId>_<secret>.
//
// So instead of trusting a specific variable name, we check the known names
// first and then scan every env var, picking the first value that actually
// looks like a real token. This makes uploads work regardless of how the store
// was wired up, while ignoring store-ids and stale values.

const looksLikeToken = (v: unknown): v is string =>
  typeof v === 'string' && v.startsWith('vercel_blob_rw_')

function resolveBlobToken(): string | undefined {
  const preferred = [
    process.env.BLOB_READ_WRITE_TOKEN,
    process.env.BLOB_READ_WRITE_TOKEN_STORE_ID,
  ]
  const fromPreferred = preferred.find(looksLikeToken)
  if (fromPreferred) return fromPreferred

  // Fallback: any env var that holds a valid-looking blob token
  return Object.values(process.env).find(looksLikeToken)
}

export const BLOB_TOKEN: string | undefined = resolveBlobToken()

/** True when a usable read-write token was found in the environment. */
export const BLOB_CONFIGURED = Boolean(BLOB_TOKEN)

/**
 * Uploads fail confusingly when the store has not been connected yet, so say
 * exactly what is wrong and how to fix it rather than surfacing an SDK error.
 */
export const BLOB_NOT_CONFIGURED_MESSAGE =
  'File storage is not configured yet. Connect the Vercel Blob store to this ' +
  'project (Storage -> Blob -> Connect Project) so BLOB_READ_WRITE_TOKEN is ' +
  'available, then run `vercel env pull .env.local` for local development.'
