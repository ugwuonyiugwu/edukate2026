import { useState, useEffect, useMemo } from "react";

export function useCountdown(deadline: Date) {
  // Calculate the initial time left
  const [timeLeft, setTimeLeft] = useState(() => 
    Math.max(0, deadline.getTime() - Date.now())
  );

  useEffect(() => {
    // If already expired, don't start interval
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      const newTime = deadline.getTime() - Date.now();
      
      if (newTime <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
      } else {
        setTimeLeft(newTime);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline, timeLeft]);

  // Memoize calculations to prevent unnecessary re-renders
  return useMemo(() => {
    const seconds = Math.floor((timeLeft / 1000) % 60);
    const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
    const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));

    return {
      days,
      hours,
      minutes,
      seconds,
      isExpired: timeLeft <= 0,
    };
  }, [timeLeft]);
}