# Security

- **Asset Resolution**: Securely injecting `env.APP_URL` from Cloudflare environment variables to resolve user profile pictures without hardcoding domains or exposing internal paths.
- **Client-Side Safety**: Since all data is mocked via `.ts` in the client for this MVP, we avoid XSS risks by safely binding text nodes within the React SVGs.