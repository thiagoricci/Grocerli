# Microphone 5-Second Inactivity Timeout Implementation

## Overview

Implement a 5-second inactivity timeout for both adding mode and shopping mode to automatically turn off the microphone when the user stops speaking.

## Current State

### Adding Mode

- **Timeout**: 3 seconds (line 169 in GroceryApp.tsx)
- **Auto-stop timeout**: 8 seconds (line 128 in useSpeechRecognition.ts)
- **Auto-stop in GroceryApp**: 3 seconds (line 738 in GroceryApp.tsx)

### Shopping Mode

- **Timeout**: 0 (no timeout, indefinite listening) (line 260 in GroceryApp.tsx)
- **Auto-stop**: None

## Changes Required

### 1. Update useSpeechRecognition Hook (`src/hooks/useSpeechRecognition.ts`)

#### Change 1.1: Update default timeout (line 32)

```typescript
// Before:
timeout = 3000, // Default 3 seconds

// After:
timeout = 5000, // Default 5 seconds
```

#### Change 1.2: Update auto-stop timeout (line 128)

```typescript
// Before:
}, 8000); // 8 seconds - longer for mobile but still auto-stop

// After:
}, 5000); // 5 seconds - inactivity timeout
```

### 2. Update GroceryApp Component (`src/components/GroceryApp.tsx`)

#### Change 2.1: Update adding mode timeout (line 169)

```typescript
// Before:
timeout: 3000, // 3 seconds - balanced timeout for natural speech

// After:
timeout: 5000, // 5 seconds - inactivity timeout
```

#### Change 2.2: Update auto-stop timeout in handleStartAddingItems (line 738)

```typescript
// Before:
}, 3000); // 3 seconds of no speech

// After:
}, 5000); // 5 seconds of no speech
```

#### Change 2.3: Add timeout to shopping mode (line 260)

```typescript
// Before:
timeout: 0, // No timeout - shopping mode can run indefinitely

// After:
timeout: 5000, // 5 seconds - inactivity timeout
```

#### Change 2.4: Add auto-stop logic for shopping mode

Similar to adding mode, add auto-stop timeout in handleStartShopping function after line 803.

```typescript
// After shoppingRecognition.startListening();

// Set auto-stop timeout to prevent no-speech errors
const shoppingTimeout = setTimeout(() => {
  if (mode === "shopping") {
    console.log("Auto-stopping shopping mode due to no speech detected");
    handleStopShopping();
    toast({
      title: "No Speech Detected",
      description:
        "Stopped listening automatically. Click 'Start Shopping' to try again.",
    });
  }
}, 5000); // 5 seconds of no speech

setAutoStopTimeoutRef(shoppingTimeout);
```

## Implementation Details

### Timeout Behavior

- **Inactivity Detection**: The microphone will automatically turn off after 5 seconds of no speech
- **User Feedback**: Toast notification will appear when auto-stop occurs
- **Mode State**: The app will return to idle mode after timeout
- **Reset on Speech**: Timeout resets each time speech is detected (interim or final results)

### Shopping Mode Considerations

- Shopping mode previously ran indefinitely to allow users to check off items at their own pace
- Adding a 5-second timeout means users must speak within 5 seconds of checking off each item
- This may be too aggressive for shopping mode - consider if users need more time between items

### Alternative Approach

If 5 seconds is too short for shopping mode, consider:

- Longer timeout for shopping mode (e.g., 10-15 seconds)
- Different timeout values for each mode
- Keep shopping mode with no timeout and only apply to adding mode

## Testing Checklist

- [ ] Test adding mode: Verify microphone stops after 5 seconds of no speech
- [ ] Test shopping mode: Verify microphone stops after 5 seconds of no speech
- [ ] Test speech detection: Verify timeout resets when user speaks
- [ ] Test toast notifications: Verify appropriate messages appear on auto-stop
- [ ] Test mode transitions: Verify app returns to idle mode after timeout
- [ ] Test mobile behavior: Verify timeout works correctly on mobile devices
- [ ] Test rapid restart: Verify user can quickly restart after timeout

## Files to Modify

1. `src/hooks/useSpeechRecognition.ts` - Update default timeout and auto-stop timeout
2. `src/components/GroceryApp.tsx` - Update mode-specific timeouts and add shopping mode auto-stop

## Dependencies

None - this change only modifies existing timeout logic

## Rollback Plan

If the 5-second timeout is too short for users:

- Revert timeout values to previous settings
- Consider implementing configurable timeout values
- Add user preference for timeout duration

## Notes

- The inactivity timeout is reset every time speech is detected (interim or final results)
- The auto-stop mechanism uses the same timeout logic for both modes
- Toast notifications provide user feedback when auto-stop occurs
- Mobile browsers may have different behavior - test thoroughly on mobile devices
