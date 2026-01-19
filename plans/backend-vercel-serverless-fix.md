# Backend Vercel Serverless Function Fix - 2026-01-19

## Problem

When accessing the backend URL, the server was serving static JavaScript files instead of running as a Vercel serverless function. The browser displayed the compiled JavaScript code from `backend/src/index.js` rather than API responses.

### Symptom

```
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
...
```

## Root Cause

1. **Incorrect Export Format**: [`backend/api/index.ts`](../backend/api/index.ts:89) exported Express app directly (`export default app`) instead of a Vercel serverless function handler
2. **Vercel Configuration**: [`backend/vercel.json`](../backend/vercel.json:1) had a rewrite rule that was unnecessary and potentially conflicting
3. **Missing Handler Wrapper**: Vercel requires serverless functions to export a handler function that accepts `(req, res)` parameters in Vercel request/response format
4. **Wrong Entry Point**: Vercel was detecting and serving [`backend/src/index.ts`](../backend/src/index.ts:1) (local development server) instead of [`backend/api/index.ts`](../backend/api/index.ts:1) (Vercel serverless function)

## Fixes Applied

### 1. Fixed [`backend/api/index.ts`](../backend/api/index.ts:89)

**Before:**

```typescript
export default app;
```

**After:**

```typescript
// Vercel serverless function handler
export default function handler(req: any, res: any) {
  return app(req, res);
}
```

This wraps the Express app to work with Vercel's serverless function format, ensuring that the app receives and responds to Vercel's request/response objects.

### 2. Updated [`backend/vercel.json`](../backend/vercel.json:1)

**Before:**

```json
{
  "buildCommand": "npx prisma generate && npx tsc",
  "installCommand": "npm install",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/api/index" }]
}
```

**After:**

```json
{
  "buildCommand": "npx prisma generate && npx tsc",
  "installCommand": "npm install",
  "outputDirectory": "dist"
}
```

**Changes:**

- Removed `rewrites` rule (unnecessary for serverless functions)
- Vercel will automatically detect and serve `api/index.ts` as a serverless function
- Vercel auto-detects Node.js runtime from the project's `package.json`

### 3. Renamed Local Development Server

**Problem**: Vercel was detecting and serving [`backend/src/index.ts`](../backend/src/index.ts:1) (local development server with `app.listen()`) instead of [`backend/api/index.ts`](../backend/api/index.ts:1) (Vercel serverless function)

**Solution**: Renamed [`backend/src/index.ts`](../backend/src/index.ts:1) to [`backend/src/local-server.ts`](../backend/src/local-server.ts:1) to prevent Vercel from detecting it as an entry point

**Updated [`backend/package.json`](../backend/package.json:5)**:

```json
{
  "main": "dist/api/index.js",
  "scripts": {
    "dev": "nodemon --exec ts-node src/local-server.ts",
    "start": "node dist/local-server.js"
  }
}
```

**Changes:**

- Renamed `src/index.ts` to `src/local-server.ts`
- Updated `main` field to point to `dist/api/index.js` (serverless function)
- Updated `dev` and `start` scripts to use `local-server.ts`
- Deleted old compiled `dist/index.js` files

### 4. Updated [`backend/.vercelignore`](../backend/.vercelignore:1)

Added rules to ignore local development server files:

```gitignore
# Ignore local development server (not for Vercel deployment)

src/local-server.ts
dist/local-server.js
dist/local-server.js.map
dist/local-server.d.ts
dist/local-server.d.ts.map
```

This ensures Vercel doesn't upload or serve the local development server.

## How It Works

### Vercel Serverless Function Detection

Vercel automatically detects serverless functions in the `api/` directory:

- Files in `api/` are treated as serverless functions
- Each file exports a default handler function
- The handler receives Vercel's request/response objects
- Vercel routes HTTP requests to the appropriate function based on the file path

### Handler Function Format

```typescript
export default function handler(req: VercelRequest, res: VercelResponse) {
  // Express app handles the request
  return app(req, res);
}
```

This wrapper:

1. Receives Vercel's request/response objects
2. Passes them to the Express app
3. Express app processes the request and sends response
4. Vercel receives the response and sends it to the client

## Verification

### Build Test

```bash
cd backend && npm run build
```

**Output:**

```
✔ Generated Prisma Client (v5.22.0) to ./node_modules/@prisma/client in 79ms
```

Build completed successfully with no errors.

### Compiled Output

The compiled file at [`backend/dist/api/index.js`](../backend/dist/api/index.js:6) now correctly exports the handler:

```javascript
exports.default = handler;

// ...

function handler(req, res) {
  return app(req, res);
}
```

## Deployment

After these fixes, the backend will deploy correctly on Vercel:

1. **Build Process**: Vercel runs `npx prisma generate && tsc` during build
2. **Prisma Client**: Fresh Prisma Client generated matching the schema
3. **Serverless Function**: `api/index.ts` compiled to `dist/api/index.js`
4. **Handler Export**: Vercel recognizes the `handler` export and runs it as a serverless function
5. **API Endpoints**: All routes (`/api/auth`, `/api/lists`, `/api/recipes`) are accessible

### Expected Behavior

- **Before Fix**: Browser displays JavaScript code when accessing backend URL
- **After Fix**: Backend returns proper JSON responses for API requests
- **Health Check**: `/health` endpoint returns `{"status":"ok","timestamp":"..."}`
- **API Routes**: All API endpoints return proper JSON responses

## Testing Checklist

- [ ] Health check endpoint accessible: `GET /health`
- [ ] Auth endpoints accessible: `POST /api/auth/register`, `POST /api/auth/login`
- [ ] Lists endpoints accessible: `GET /api/lists`, `POST /api/lists`, etc.
- [ ] Recipes endpoints accessible: `GET /api/recipes`, `POST /api/recipes`, etc.
- [ ] CORS headers properly configured
- [ ] Prisma database connections work correctly
- [ ] Error handling works as expected

## Next Steps

1. **Commit and Push**: Push these changes to your repository
2. **Vercel Deployment**: Vercel will automatically redeploy with the fixed configuration
3. **Monitor Logs**: Check Vercel deployment logs to confirm successful deployment
4. **Test Endpoints**: Verify all API endpoints return proper JSON responses
5. **Frontend Integration**: Ensure frontend can successfully communicate with backend

## Related Files

- [`backend/api/index.ts`](../backend/api/index.ts) - Serverless function handler
- [`backend/vercel.json`](../backend/vercel.json) - Vercel deployment configuration
- [`backend/src/index.ts`](../backend/src/index.ts) - Express app (for local development)
- [`backend/package.json`](../backend/package.json) - Build scripts and dependencies

## Technical Notes

### Why This Fix Works

1. **Vercel Serverless Functions**: Vercel's platform expects functions in `api/` directory to export a handler
2. **Express Integration**: The handler wrapper allows Express to run within Vercel's serverless environment
3. **Request/Response Compatibility**: The wrapper ensures Vercel's request/response objects are compatible with Express

### Alternative Approaches

**Approach 1: Individual Route Functions** (Not Used)

- Create separate files for each route: `api/lists.ts`, `api/recipes.ts`, `api/auth.ts`
- More complex to maintain
- Better for very large applications

**Approach 2: Vercel Runtime Wrapper** (Current Solution)

- Single Express app wrapped as serverless function
- Simpler to maintain
- Better for medium-sized applications like SousChefy

### Performance Considerations

- **Cold Starts**: Serverless functions have cold start latency (~100-500ms)
- **Connection Pooling**: Prisma client singleton pattern reduces connection overhead
- **Graceful Shutdown**: Proper cleanup on function recycling prevents connection leaks

## Conclusion

This fix ensures that the backend runs correctly on Vercel as a serverless function, providing proper API responses instead of serving static JavaScript files. The solution is minimal, maintainable, and follows Vercel best practices for Express.js applications.
