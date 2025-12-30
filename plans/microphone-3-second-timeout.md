# Microphone 3-Second Inactivity Timeout Implementation

## Overview

Implement a 3-second microphone inactivity timeout for the Voice Shopper application. When no speech is detected for 3 seconds, the microphone will automatically stop listening.

## Current State Analysis

### Existing Timeout Implementation

The application currently has two timeout mechanisms in [`useSpeechRecognition.ts`](../src/hooks/useSpeechRecognition.ts):

1. **Inactivity Timeout** (lines 93-110):

   - Uses `inactivityTimeoutRef`
   - Configurable via `timeout` option (default: 5000ms)
   - Resets on each speech detection event
   - Stops recognition when timeout expires

2. **Auto-Stop Timeout** (lines 112-129):
   - Uses `autoStopTimeoutRef`
   - Hardcoded to 5000ms
   - Resets on each speech detection event
   - Stops recognition when timeout expires

### Current Configuration

In [`GroceryApp.tsx`](../src/components/GroceryApp.tsx:72):

```typescript
const speechRecognition = useSpeechRecognition({
  timeout: 5000,  // Currently 5 seconds
  ...
});
```

In [`useSpeechRecognition.ts`](../src/hooks/useSpeechRecognition.ts:32):

```typescript
timeout = 5000, // Default 5 seconds
```

In [`useSpeechRecognition.ts`](../src/hooks/useSpeechRecognition.ts:128):

```typescript
}, 5000); // 5 seconds - inactivity timeout
```

## Implementation Plan

### Step 1: Update GroceryApp.tsx

**File:** [`src/components/GroceryApp.tsx`](../src/components/GroceryApp.tsx:72)

**Change:**

```typescript
// Before:
timeout: 5000,

// After:
timeout: 3000,
```

### Step 2: Update Default Timeout in useSpeechRecognition.ts

**File:** [`src/hooks/useSpeechRecognition.ts`](../src/hooks/useSpeechRecognition.ts:32)

**Change:**

```typescript
// Before:
timeout = 5000, // Default 5 seconds

// After:
timeout = 3000, // Default 3 seconds
```

### Step 3: Update Auto-Stop Timeout in useSpeechRecognition.ts

**File:** [`src/hooks/useSpeechRecognition.ts`](../src/hooks/useSpeechRecognition.ts:128)

**Change:**

```typescript
// Before:
}, 5000); // 5 seconds - inactivity timeout

// After:
}, 3000); // 3 seconds - inactivity timeout
```

### Step 4: Update Comment in useSpeechRecognition.ts

**File:** [`src/hooks/useSpeechRecognition.ts`](../src/hooks/useSpeechRecognition.ts:98)

**Change:**

```typescript
// Before:
// Set new inactivity timeout - longer for mobile to prevent unwanted stops

// After:
// Set new inactivity timeout - 3 seconds to stop microphone when inactive
```

## Expected Behavior

After implementation:

1. **User clicks microphone button** → Microphone starts listening
2. **User speaks** → Timeout resets, microphone continues listening
3. **User stops speaking** → 3-second countdown begins
4. **3 seconds pass with no speech** → Microphone automatically stops
5. **User speaks again before timeout** → Countdown resets, microphone continues

## Technical Details

### Timeout Reset Mechanism

The timeout is reset on every `result` event from the speech recognition API:

```typescript
recognition.addEventListener("result", (event) => {
  // Reset inactivity timeout on speech detection
  if (inactivityTimeoutRef.current) {
    clearTimeout(inactivityTimeoutRef.current);
  }

  // Set new inactivity timeout
  if (timeout > 0 && isListeningRef.current) {
    inactivityTimeoutRef.current = setTimeout(() => {
      // Stop recognition
    }, timeout);
  }

  // ... process speech results
});
```

### Timeout Cleanup

All timeouts are properly cleaned up:

- When `stopListening()` is called
- When component unmounts
- When speech recognition ends

## Testing Checklist

- [ ] Microphone starts listening when button is clicked
- [ ] Microphone continues listening while user is speaking
- [ ] Microphone stops automatically after 3 seconds of silence
- [ ] Timeout resets when user speaks again before 3 seconds
- [ ] Manual stop button still works correctly
- [ ] No memory leaks (timeouts properly cleaned up)
- [ ] Works on both desktop and mobile devices

## Files to Modify

1. [`src/components/GroceryApp.tsx`](../src/components/GroceryApp.tsx) - Line 72
2. [`src/hooks/useSpeechRecognition.ts`](../src/hooks/useSpeechRecognition.ts) - Lines 32, 98, 128

## Impact Assessment

### Positive Impact

- Faster response to inactivity (3 seconds vs 5 seconds)
- Better user experience with quicker feedback
- Consistent with design principle: "Fast Response: Microphone should stop within 3 seconds when requested"

### Potential Concerns

- May be too aggressive for users who pause while thinking
- Could interrupt users with slower speech patterns
- May require users to speak more continuously

### Mitigation

- Users can still manually stop the microphone at any time
- Users can restart listening if stopped prematurely
- Timeout can be adjusted in the future based on user feedback

## Related Documentation

- [Memory Bank - Architecture](../.kilocode/rules/memory-bank/architecture.md)
- [Memory Bank - Context](../.kilocode/rules/memory-bank/context.md)
- [Memory Bank - Tech](../.kilocode/rules/memory-bank/tech.md)
