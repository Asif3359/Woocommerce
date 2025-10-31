// Import from compiled output (built by npm run build)
// @ts-expect-error - dist/app.js is compiled output, TypeScript can't verify it at build time
import handler from '../dist/app.js';

export default handler;

