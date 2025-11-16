
import { useState, useEffect, useRef } from 'react';

export const useIdleTimeout = (timeout: number, onIdle: () => void) => {
  const timeoutId = useRef<number | null>(null);

  const resetTimer = () => {
    if (timeoutId.current) {
      window.clearTimeout(timeoutId.current);
    }
    timeoutId.current = window.setTimeout(onIdle, timeout);
  };

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
    
    const eventListener = () => {
      resetTimer();
    };

    events.forEach(event => {
      window.addEventListener(event, eventListener);
    });

    resetTimer();

    return () => {
      if (timeoutId.current) {
        window.clearTimeout(timeoutId.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, eventListener);
      });
    };
  }, [timeout, onIdle]);

  return {};
};
