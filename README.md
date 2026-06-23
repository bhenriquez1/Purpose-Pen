# Purpose-Pen

## Render environment variables

Set these in the Render dashboard for the service. See `.env.example` for
full descriptions.

**Required for the app to function at all:**

- `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`,
  `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`
- `SESSION_SECRET` — signs the edge session cookie (`proxy.ts`). Without
  this, protected pages and `/api/*` fail closed (deny) for every real
  user, even with Firebase configured correctly. Generate with
  `openssl rand -hex 32`.
- `ALLOWED_EMAILS` and/or `OWNER_EMAILS` — beta allowlist.
- `ANTHROPIC_API_KEY` — required for AI letter drafting/analysis features.

**Recommended for any publicly reachable deployment (e.g. staging/beta):**

- `SITE_PASSWORD_USERNAME`, `SITE_PASSWORD` — puts the whole site behind
  HTTP Basic Auth at the edge, in front of everything else.

**Only set while actively building, never on a real production deployment
without `SITE_PASSWORD` also set:**

- `NEXT_PUBLIC_DEV_BYPASS_AUTH=true` — skips Firebase auth and grants a mock
  owner user.
- `ALLOW_PRODUCTION_DEV_BYPASS=true` — required *in addition to* the above
  to let the bypass take effect on Render, since Render's production build
  otherwise blocks it automatically.

After changing any environment variable on Render, redeploy for it to take effect.
