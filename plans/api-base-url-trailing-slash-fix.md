# API Base URL Trailing Slash Fix

## Problem Identified

The frontend code has a potential bug where the API base URL could have a trailing slash, causing double slashes in API endpoint URLs.

### Current Implementation

**src/lib/api.ts (Line 3):**

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
```

**src/lib/storage.ts (Lines 83, 141, 174, 209, 232, 261, 289):**

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
```

### Path Concatenation Examples

All fetch calls concatenate paths like:

```typescript
fetch(`${API_BASE_URL}/api/lists/active`);
fetch(`${API_BASE_URL}/api/lists/${listId}`);
fetch(`${API_BASE_URL}/api/recipes`);
```

### The Issue

If `VITE_API_URL` is set with a trailing slash (e.g., `https://api.example.com/`), the resulting URLs will be:

- `https://api.example.com//api/lists/active` ❌ (double slash)
- `https://api.example.com//api/lists/123` ❌ (double slash)

While most browsers and servers handle double slashes gracefully, this is not best practice and can cause issues with:

- URL parsing
- API route matching
- Proxy configurations
- Some strict server configurations

## Solution

Create a utility function to normalize the base URL by removing trailing slashes, then use it consistently across all API calls.

### Implementation Steps

#### Step 1: Create a utility function in src/lib/api.ts

Add a helper function to normalize the base URL:

```typescript
/**
 * Normalize API base URL by removing trailing slashes
 * Ensures consistent path concatenation
 */
function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_URL || "http://localhost:3001",
);
```

#### Step 2: Update src/lib/api.ts

Replace the current `API_BASE_URL` definition with the normalized version.

#### Step 3: Update src/lib/storage.ts

Replace all 7 instances of `API_BASE_URL` definition with a single normalized version at the top of the file:

```typescript
/**
 * Normalize API base URL by removing trailing slashes
 */
function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_URL || "http://localhost:3001",
);
```

Then remove the duplicate `API_BASE_URL` definitions from each function.

### Benefits

1. **Consistency**: All API calls use the same normalized base URL
2. **Robustness**: Works correctly regardless of whether `VITE_API_URL` has a trailing slash
3. **Maintainability**: Single source of truth for base URL normalization
4. **Best Practice**: Follows industry standards for URL handling
5. **DRY Principle**: Eliminates code duplication (7 duplicate definitions in storage.ts)

### Files to Modify

1. **src/lib/api.ts**
   - Add `normalizeBaseUrl()` function
   - Update `API_BASE_URL` to use normalization

2. **src/lib/storage.ts**
   - Add `normalizeBaseUrl()` function at file level
   - Define `API_BASE_URL` once at file level
   - Remove 7 duplicate `API_BASE_URL` definitions from functions

### Testing Checklist

After implementation, verify:

- [ ] API calls work with base URL without trailing slash (current behavior)
- [ ] API calls work with base URL with trailing slash (e.g., `https://api.example.com/`)
- [ ] All endpoints resolve correctly:
  - `/api/lists/active`
  - `/api/lists`
  - `/api/lists/{id}`
  - `/api/recipes`
  - `/api/recipes/{id}`
- [ ] No double slashes in network requests (check DevTools Network tab)
- [ ] Authentication still works (Bearer token headers)
- [ ] Error handling remains intact

### Environment Variables

Current `.env` and `.env.example` files already use correct format (no trailing slash):

**.env (Line 7):**

```env
VITE_API_URL="http://localhost:3001"
```

**.env.example (Line 12):**

```env
VITE_API_URL=http://localhost:3001
```

However, this fix ensures that even if someone accidentally adds a trailing slash in the future, the application will still work correctly.

### Deployment Notes

- This change is backward compatible
- No changes required to environment variables
- No changes required to backend API
- Safe to deploy without backend coordination
