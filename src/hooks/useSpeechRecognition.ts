import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from '@/types/speech';

// Enhanced Speech Recognition Hook optimized for mobile
export interface UseSpeechRecognitionOptions {
 continuous?: boolean;
 interimResults?: boolean;
 lang?: string;
 timeout?: number; // Timeout in milliseconds
 onResult?: (transcript: string, isFinal: boolean) => void;
 onEnd?: () => void;
 onError?: (error: string) => void;
 mobileOptimized?: boolean; // New option for mobile optimization
}

export interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  finalTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

// Mobile-optimized Speech Recognition
export const useSpeechRecognition = (options: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn => {
  const {
    continuous = true,
    interimResults = true,
    lang = 'en-US',
    timeout = 3000, // Default 3 seconds
    onResult,
    onEnd,
    onError,
    mobileOptimized = false, // Default false for backward compatibility
  } = options;

  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [manuallyStopped, setManuallyStopped] = useState(false);
  const isListeningRef = useRef(false);
  const manuallyStoppedRef = useRef(false);
  const forceStoppedRef = useRef(false); // New ref to prevent any restart attempts
  const stopRequestedRef = useRef(false); // Track when stop has been requested

  const recognitionRef = useRef<any>(null);
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioendTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize speech recognition with mobile optimizations
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      
      // Mobile-optimized settings
       recognition.continuous = continuous;
       recognition.interimResults = interimResults;
       recognition.lang = lang;
       recognition.maxAlternatives = 1;
      
      // Mobile-optimized audioend handler - only restart if explicitly needed
       recognition.addEventListener('audioend', () => {
         isListeningRef.current = false;
         
         // CRITICAL: Check stopRequested FIRST - if stop was requested, never restart
         if (stopRequestedRef.current) {
           return; // Exit immediately - no restart
         }
         
         // Only restart if NOT manually stopped, NOT force stopped, and still supposed to be listening
         // Add additional check to prevent unwanted restarts on mobile
         // IMPORTANT: Use isListeningRef.current instead of isListening (state) because state is asynchronous
         if (isListeningRef.current && continuous && !manuallyStoppedRef.current && !forceStoppedRef.current) {
           // Small delay to prevent rapid restarts
           audioendTimeoutRef.current = setTimeout(() => {
             // Triple check all conditions before restarting - ensure manuallyStopped and forceStopped are still false
             if (isListeningRef.current && !manuallyStoppedRef.current && !forceStoppedRef.current && !stopRequestedRef.current && recognitionRef.current) {
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
      
      
      recognition.addEventListener('result', (event) => {
        // Reset inactivity timeout on speech detection
        if (inactivityTimeoutRef.current) {
          clearTimeout(inactivityTimeoutRef.current);
        }
        
        // Set new inactivity timeout - 3 seconds to stop microphone when inactive
         if (timeout > 0 && isListeningRef.current) {
           inactivityTimeoutRef.current = setTimeout(() => {
             if (isListeningRef.current && recognitionRef.current && !manuallyStoppedRef.current) {
               try {
                 recognitionRef.current.abort();
                 setIsListening(false);
                 isListeningRef.current = false;
               } catch (error) {
                 console.error('Failed to stop recognition on timeout:', error);
               }
             }
           }, timeout);
         }

        
        let interimTranscript = '';
        let finalText = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalText += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }
        
        if (finalText) {
          setFinalTranscript(prev => prev + finalText);
          onResult?.(finalText, true);
        }
        
        if (interimTranscript) {
          setTranscript(interimTranscript);
          onResult?.(interimTranscript, false);
        }
      });

      recognition.addEventListener('error', (event) => {
        // Handle aborted error (often occurs during normal operation)
        if (event.error === 'aborted') {
          // Don't stop listening for aborted errors, as they often happen during normal operation
          // The audioend handler will restart recognition if needed
          return;
        }

        // Handle no-speech error more gracefully - don't stop listening immediately
        if (event.error === 'no-speech') {
          console.log('No speech detected, continuing to listen...');
          // Don't call onError for no-speech, as it's not really an error in this context
          return;
        }

        console.error('Speech recognition error:', event.error);
        onError?.(event.error);

        // Handle mobile-specific errors
        if (event.error === 'network' || event.error === 'not-allowed') {
          setIsListening(false);
        }
      });

      recognition.addEventListener('end', () => {
        isListeningRef.current = false;
        
        // Only call onEnd if not manually stopped
        if (!manuallyStoppedRef.current) {
          onEnd?.();
        }
        
        if (!continuous || manuallyStoppedRef.current) {
          setIsListening(false);
          setManuallyStopped(false); // Reset manual stop flag
          manuallyStoppedRef.current = false;
        }
      });

      recognitionRef.current = recognition;
    }

    return () => {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
      if (audioendTimeoutRef.current) {
        clearTimeout(audioendTimeoutRef.current);
      }
    };
  }, [continuous, interimResults, lang, onResult, onEnd, onError]);

  
  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
      if (audioendTimeoutRef.current) {
        clearTimeout(audioendTimeoutRef.current);
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) return;

    try {
      // CRITICAL: Clear stop flag before starting
      stopRequestedRef.current = false;
      
      setIsListening(true);
      isListeningRef.current = true;
      setManuallyStopped(false); // Reset manual stop flag when starting
      manuallyStoppedRef.current = false;
      forceStoppedRef.current = false; // Reset force stop flag when starting
      setTranscript('');
      setFinalTranscript('');
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setIsListening(false);
      isListeningRef.current = false;
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    // CRITICAL: Set stop flag FIRST (synchronous) to prevent any restarts
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
        console.error('Failed to stop speech recognition:', stopError);
      }
    }

    // Force state cleanup immediately (synchronous)
    setIsListening(false);
    isListeningRef.current = false;
    forceStoppedRef.current = true;
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setFinalTranscript('');
  }, []);

  const returnValue = useMemo(() => ({
    isSupported,
    isListening,
    transcript,
    finalTranscript,
    startListening,
    stopListening,
    resetTranscript,
  }), [isSupported, isListening, transcript, finalTranscript, startListening, stopListening, resetTranscript]);
  
  return returnValue;
};
