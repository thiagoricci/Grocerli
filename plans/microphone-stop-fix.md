# Microphone Stop Fix Plan

## Problem Analysis

The microphone is not stopping reliably when the user clicks "Stop Listening" or when stop phrases are detected. The issue is caused by race conditions between the `stopListening()` function and the `audioend` event handler.

### Root Causes

1. **Pending Timeout Race Condition**: The `audioendTimeoutRef` (100ms delay) can fire after `stopListening()` has been called, causing unwanted restarts.

2. **Multiple Timeout Interference**: There are 4 different timeouts that can interfere:

   - `timeoutRef` (not used)
   - `inactivityTimeoutRef` (3 second inactivity timeout)
   - `autoStopTimeoutRef` (3 second auto-stop timeout)
   - `audioendTimeoutRef` (100ms restart delay)

3. **Complex Condition Checks**: The `audioend` handler checks multiple refs that can change state asynchronously.

4. **Aggressive Stop with Timing Issues**: The current implementation uses multiple `abort()` calls with timeouts (10ms, 25ms, 50ms, 100ms, 200ms) which can create timing windows where restarts happen.

## Solution Design

### Core Strategy

1. **Single Source of Truth for Stop State**: Use a `stopRequestedRef` that is set immediately when stop is requested and never cleared until the next `startListening()` call.

2. **Immediate Timeout Cancellation**: Clear ALL timeouts synchronously in `stopListening()` before any async operations.

3. **Prevent Restart After Stop**: The `audioend` handler must check the stop flag BEFORE scheduling any restart timeout.

4. **Simplified Stop Logic**: Remove the cascading timeout-based stop calls and use a single, definitive stop operation.

### Implementation Steps

#### Step 1: Add Stop Request Flag

- Add `stopRequestedRef` to track when stop has been requested
- Set this flag immediately in `stopListening()`
- Clear this flag only in `startListening()`

#### Step 2: Fix audioend Handler

- Check `stopRequestedRef` BEFORE checking other conditions
- Do NOT schedule any restart timeout if stop has been requested
- This prevents the race condition where a pending timeout restarts after stop

#### Step 3: Simplify stopListening()

- Remove cascading timeout-based abort calls
- Use a single, synchronous abort operation
- Clear all timeouts immediately
- Set all stop flags synchronously

#### Step 4: Remove Redundant Timeouts

- Remove the unused `timeoutRef`
- Remove the redundant `autoStopTimeoutRef` (same as inactivity timeout)
- Keep only `inactivityTimeoutRef` for the 3-second timeout

#### Step 5: Update GroceryApp.tsx

- Ensure `handleStopListening()` properly calls `speechRecognition.stopListening()`
- Verify that stop phrases trigger the stop correctly

## Modified Code Structure

### useSpeechRecognition.ts Changes

```typescript
// New ref to track stop requests
const stopRequestedRef = useRef(false);

// Modified audioend handler
recognition.addEventListener("audioend", () => {
  isListeningRef.current = false;

  // CRITICAL: Check stopRequested FIRST - if stop was requested, never restart
  if (stopRequestedRef.current) {
    return; // Exit immediately - no restart
  }

  // Only restart if still supposed to be listening
  if (
    isListeningRef.current &&
    continuous &&
    !manuallyStoppedRef.current &&
    !forceStoppedRef.current
  ) {
    // Small delay to prevent rapid restarts
    audioendTimeoutRef.current = setTimeout(() => {
      // Triple check all conditions before restarting
      if (
        isListeningRef.current &&
        !manuallyStoppedRef.current &&
        !forceStoppedRef.current &&
        !stopRequestedRef.current &&
        recognitionRef.current
      ) {
        try {
          recognitionRef.current.start();
          isListeningRef.current = true;
        } catch (e) {
          // Ignore if already started
        }
      }
    }, 100);
  }
});

// Simplified stopListening()
const stopListening = useCallback(() => {
  if (!recognitionRef.current) return;

  // CRITICAL: Set stop flag FIRST (synchronous)
  stopRequestedRef.current = true;

  // Immediately set all flags to prevent any restarts (synchronous)
  setIsListening(false);
  isListeningRef.current = false;
  setManuallyStopped(true);
  manuallyStoppedRef.current = true;
  forceStoppedRef.current = true;

  // Clear all timeouts immediately (synchronous)
  if (inactivityTimeoutRef.current) {
    clearTimeout(inactivityTimeoutRef.current);
    inactivityTimeoutRef.current = null;
  }
  if (audioendTimeoutRef.current) {
    clearTimeout(audioendTimeoutRef.current);
    audioendTimeoutRef.current = null;
  }

  // Force stop the recognition immediately (synchronous)
  try {
    recognitionRef.current.abort();
  } catch (error) {
    // If abort fails, try stop
    try {
      recognitionRef.current.stop();
    } catch (stopError) {
      console.error("Failed to stop speech recognition:", stopError);
    }
  }

  // Force state cleanup immediately (synchronous)
  setIsListening(false);
  isListeningRef.current = false;
  forceStoppedRef.current = true;
}, []);

// Modified startListening()
const startListening = useCallback(() => {
  if (!isSupported || !recognitionRef.current) return;

  try {
    // CRITICAL: Clear stop flag before starting
    stopRequestedRef.current = false;

    setIsListening(true);
    isListeningRef.current = true;
    setManuallyStopped(false);
    manuallyStoppedRef.current = false;
    forceStoppedRef.current = false;
    setTranscript("");
    setFinalTranscript("");
    recognitionRef.current.start();
  } catch (error) {
    console.error("Failed to start speech recognition:", error);
    setIsListening(false);
    isListeningRef.current = false;
  }
}, [isSupported]);
```

## Testing Checklist

After implementation, verify:

- [ ] Clicking the microphone button stops listening immediately
- [ ] Speaking stop phrases ("that's it", "done", etc.) stops listening
- [ ] No error messages appear when stopping
- [ ] Microphone indicator turns off (red → green)
- [ ] Can start listening again after stopping
- [ ] Multiple stop/start cycles work correctly
- [ ] Works on both desktop and mobile devices

## Expected Outcome

The microphone will stop immediately and reliably when the user requests it, with no race conditions or unwanted restarts. The fix ensures that once stop is requested, no timeout or event handler can restart the recognition.
