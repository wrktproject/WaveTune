import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'wavetune_activity_dates';

/**
 * Hook to track and calculate user streaks
 * Uses localStorage for immediate tracking and optionally syncs with Supabase
 */
const useStreak = (userId) => {
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  // Get today's date as YYYY-MM-DD string
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get stored activity dates from localStorage
  const getStoredDates = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        // Return dates for current user only
        return data[userId] || [];
      }
    } catch (e) {
      console.error('Error reading streak data:', e);
    }
    return [];
  }, [userId]);

  // Save activity dates to localStorage
  const saveDates = useCallback((dates) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const data = stored ? JSON.parse(stored) : {};
      data[userId] = dates;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving streak data:', e);
    }
  }, [userId]);

  // Calculate streak from array of date strings
  const calculateStreak = useCallback((dates) => {
    if (!dates || dates.length === 0) return 0;

    // Sort dates in descending order (most recent first)
    const sortedDates = [...new Set(dates)].sort((a, b) => new Date(b) - new Date(a));
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if the most recent activity was today or yesterday
    const mostRecentDate = new Date(sortedDates[0]);
    mostRecentDate.setHours(0, 0, 0, 0);

    // If the most recent activity wasn't today or yesterday, streak is broken
    if (mostRecentDate < yesterday) {
      return 0;
    }

    // Count consecutive days
    let streakCount = 1;
    let currentDate = mostRecentDate;

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i]);
      prevDate.setHours(0, 0, 0, 0);

      const expectedPrevDate = new Date(currentDate);
      expectedPrevDate.setDate(expectedPrevDate.getDate() - 1);

      if (prevDate.getTime() === expectedPrevDate.getTime()) {
        streakCount++;
        currentDate = prevDate;
      } else if (prevDate.getTime() < expectedPrevDate.getTime()) {
        // Gap in dates, streak ends here
        break;
      }
      // If same date, continue checking
    }

    return streakCount;
  }, []);

  // Record today's activity
  const recordActivity = useCallback(async () => {
    if (!userId) return;

    const today = getTodayString();
    const dates = getStoredDates();

    // Only add if not already recorded today
    if (!dates.includes(today)) {
      const updatedDates = [...dates, today];
      
      // Keep only last 365 days to prevent storage bloat
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const filteredDates = updatedDates.filter(d => new Date(d) >= oneYearAgo);
      
      saveDates(filteredDates);
      setStreak(calculateStreak(filteredDates));

      // Optionally sync to Supabase (if table exists)
      try {
        await supabase.from('user_activity').upsert({
          user_id: userId,
          activity_date: today,
        }, {
          onConflict: 'user_id,activity_date'
        });
      } catch (e) {
        // Table might not exist yet, that's okay
        console.debug('Supabase sync skipped:', e.message);
      }
    }
  }, [userId, getStoredDates, saveDates, calculateStreak]);

  // Load streak on mount and when userId changes
  useEffect(() => {
    if (!userId) {
      setStreak(0);
      setLoading(false);
      return;
    }

    const loadStreak = async () => {
      setLoading(true);

      // Try to load from Supabase first
      try {
        const { data, error } = await supabase
          .from('user_activity')
          .select('activity_date')
          .eq('user_id', userId)
          .order('activity_date', { ascending: false })
          .limit(365);

        if (!error && data && data.length > 0) {
          const supabaseDates = data.map(d => d.activity_date);
          // Merge with local storage dates
          const localDates = getStoredDates();
          const allDates = [...new Set([...supabaseDates, ...localDates])];
          saveDates(allDates);
          setStreak(calculateStreak(allDates));
          setLoading(false);
          return;
        }
      } catch (e) {
        // Supabase table might not exist, fall back to localStorage
        console.debug('Using localStorage for streak:', e.message);
      }

      // Fall back to localStorage
      const dates = getStoredDates();
      setStreak(calculateStreak(dates));
      setLoading(false);
    };

    loadStreak();
  }, [userId, getStoredDates, saveDates, calculateStreak]);

  // Record activity when hook is first used (user is active)
  useEffect(() => {
    if (userId && !loading) {
      recordActivity();
    }
  }, [userId, loading, recordActivity]);

  return {
    streak,
    loading,
    recordActivity,
  };
};

export default useStreak;
