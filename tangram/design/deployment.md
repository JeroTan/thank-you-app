# Deployment

- **Target**: Cloudflare Workers.
- **Tooling**: Wrangler CLI configured to package the Astro SSR output directly into a worker script.
- **Implementation**: Utilizes the `@astrojs/cloudflare` adapter to handle fetch requests natively on the edge.