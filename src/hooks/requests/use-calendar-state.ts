'use client';

import { useState, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import type {
  CalendarState,
  CalendarCellState,
  PeriodType,
  RequestType,
  Request,
} from '@/types/requests';

interface UseCalendarStateOptions {
  currentMonth: Date;
  requests: Request[];
}

export function useCalendarState({
  currentMonth,
  requests,
}: UseCalendarStateOptions) {
  // Main calendar state
  const [calendarState, setCalendarState] = useState<CalendarState>({
    currentDate: currentMonth,
    selectedDates: [],
    cellStates: new Map(),
    selectionMode: 'single',
    activeRequestType: undefined,
  });

  // Helper: Generate date key for Map storage
  const getDateKey = useCallback((date: Date): string => {
    return format(date, 'yyyy-MM-dd');
  }, []);

  // Helper: Get cell state for a specific date
  const getCellState = useCallback(
    (date: Date): CalendarCellState => {
      const dateKey = getDateKey(date);
      const existingState = calendarState.cellStates.get(dateKey);

      if (existingState) {
        return existingState;
      }

      // Create default state for new dates
      const dateRequests = requests.filter((request) => {
        const requestStart = request.start_date;
        const requestEnd = request.end_date;
        const currentDateStr = format(date, 'yyyy-MM-dd');

        return currentDateStr >= requestStart && currentDateStr <= requestEnd;
      });

      // Check for conflicts on this date
      const hasConflict = dateRequests.some((request, index) => {
        return dateRequests.slice(index + 1).some((otherRequest) => {
          // Full day conflicts with everything
          if (
            request.period_type === 'FULL_DAY' ||
            otherRequest.period_type === 'FULL_DAY'
          ) {
            return true;
          }

          // Same period conflicts
          if (request.period_type === otherRequest.period_type) {
            return true;
          }

          return false;
        });
      });

      const newState: CalendarCellState = {
        date,
        mode: 'FULL_DAY',
        requests: dateRequests,
        isSelected: false,
        hasConflict,
      };

      return newState;
    },
    [calendarState.cellStates, requests, getDateKey],
  );

  // Update cell state for a specific date
  const updateCellState = useCallback(
    (date: Date, updates: Partial<CalendarCellState>) => {
      const dateKey = getDateKey(date);
      const currentState = getCellState(date);
      const updatedState = { ...currentState, ...updates };

      setCalendarState((prev) => {
        const newCellStates = new Map(prev.cellStates);
        newCellStates.set(dateKey, updatedState);

        return {
          ...prev,
          cellStates: newCellStates,
        };
      });
    },
    [getCellState, getDateKey],
  );

  // Toggle mode for a specific date (Full Day → Morning → Afternoon → Time)
  const toggleDateMode = useCallback(
    (date: Date): PeriodType => {
      const currentState = getCellState(date);
      const modes: PeriodType[] = ['FULL_DAY', 'MORNING', 'AFTERNOON', 'TIME'];
      const currentIndex = modes.indexOf(currentState.mode);
      const nextIndex = (currentIndex + 1) % modes.length;
      const nextMode = modes[nextIndex];

      updateCellState(date, { mode: nextMode });

      console.log('🔄 Mode toggled:', {
        date: format(date, 'yyyy-MM-dd'),
        from: currentState.mode,
        to: nextMode,
      });

      return nextMode;
    },
    [getCellState, updateCellState],
  );

  // Select/deselect dates
  const toggleDateSelection = useCallback(
    (date: Date, requestType?: RequestType): Date[] => {
      const dateKey = getDateKey(date);
      const isCurrentlySelected = calendarState.selectedDates.some(
        (d) => format(d, 'yyyy-MM-dd') === dateKey,
      );

      // Calculate the next state before calling setCalendarState to allow synchronous return
      let newSelectedDates: Date[];
      let newSelectionMode = calendarState.selectionMode;
      let newActiveRequestType = calendarState.activeRequestType;

      if (isCurrentlySelected) {
        // Deselect date
        newSelectedDates = calendarState.selectedDates.filter(
          (d) => format(d, 'yyyy-MM-dd') !== dateKey,
        );

        // If no dates selected, clear active request type
        if (newSelectedDates.length === 0) {
          newActiveRequestType = undefined;
          newSelectionMode = 'single';
        }
      } else {
        // Select date
        if (calendarState.selectedDates.length === 0) {
          // First selection
          newSelectedDates = [date];
          newActiveRequestType = requestType;
          newSelectionMode = 'single';
        } else if (requestType && requestType === calendarState.activeRequestType) {
          // Multi-selection of same type
          newSelectedDates = [...calendarState.selectedDates, date];
          newSelectionMode = 'range';
        } else {
          // Different request type - start new selection
          newSelectedDates = [date];
          newActiveRequestType = requestType;
          newSelectionMode = 'single';
        }
      }

      setCalendarState((prev) => {
        // We use the pre-calculated values but still need to manage cellStates
        const newCellStates = new Map(prev.cellStates);

        // Clear all previous selections from cell states
        prev.selectedDates.forEach((selectedDate) => {
          const key = format(selectedDate, 'yyyy-MM-dd');
          const cellState = newCellStates.get(key);
          if (cellState) {
            newCellStates.set(key, { ...cellState, isSelected: false });
          }
        });

        // Set new selections in cell states
        newSelectedDates.forEach((selectedDate) => {
          const key = format(selectedDate, 'yyyy-MM-dd');
          const cellState = getCellState(selectedDate);
          newCellStates.set(key, { ...cellState, isSelected: true });
        });

        return {
          ...prev,
          selectedDates: newSelectedDates,
          selectionMode: newSelectionMode,
          activeRequestType: newActiveRequestType,
          cellStates: newCellStates,
        };
      });

      console.log('📅 Date selection changed:', {
        date: format(date, 'yyyy-MM-dd'),
        isSelected: !isCurrentlySelected,
        requestType,
        totalSelected: newSelectedDates.length,
      });

      return newSelectedDates;
    },
    [calendarState, getDateKey, getCellState],
  );

  // Clear all selections
  const clearSelection = useCallback(() => {
    setCalendarState((prev) => {
      const newCellStates = new Map(prev.cellStates);

      // Clear selection flags from all cell states
      prev.selectedDates.forEach((date) => {
        const key = format(date, 'yyyy-MM-dd');
        const cellState = newCellStates.get(key);
        if (cellState) {
          newCellStates.set(key, { ...cellState, isSelected: false });
        }
      });

      return {
        ...prev,
        selectedDates: [],
        selectionMode: 'single',
        activeRequestType: undefined,
        cellStates: newCellStates,
      };
    });

    console.log('🗑️ All selections cleared');
  }, []);

  // Detect conflicts for a date and period
  const detectConflicts = useCallback(
    (date: Date, periodType: PeriodType): boolean => {
      const cellState = getCellState(date);

      // Check if there are existing requests that would conflict
      const hasConflictingRequest = cellState.requests.some((request) => {
        // Full day conflicts with everything
        if (request.period_type === 'FULL_DAY' || periodType === 'FULL_DAY') {
          return true;
        }

        // Same period conflicts
        if (request.period_type === periodType) {
          return true;
        }

        // TIME period conflicts handled differently
        if (request.period_type === 'TIME' || periodType === 'TIME') {
          // Would need to check actual time ranges
          return false;
        }

        return false;
      });

      return hasConflictingRequest;
    },
    [getCellState],
  );

  // Get formatted selection summary
  const selectionSummary = useMemo(() => {
    if (calendarState.selectedDates.length === 0) {
      return null;
    }

    const sortedDates = [...calendarState.selectedDates].sort(
      (a, b) => a.getTime() - b.getTime(),
    );
    const startDate = sortedDates[0];
    const endDate = sortedDates[sortedDates.length - 1];

    if (sortedDates.length === 1) {
      return {
        type: calendarState.activeRequestType,
        dateRange: format(startDate, 'MMM dd, yyyy'),
        count: 1,
      };
    } else {
      return {
        type: calendarState.activeRequestType,
        dateRange: `${format(startDate, 'MMM dd')} - ${format(
          endDate,
          'MMM dd, yyyy',
        )}`,
        count: sortedDates.length,
      };
    }
  }, [calendarState.selectedDates, calendarState.activeRequestType]);

  return {
    // State
    calendarState,

    // Date operations
    getCellState,
    updateCellState,
    toggleDateMode,

    // Selection operations
    toggleDateSelection,
    clearSelection,
    selectionSummary,

    // Conflict detection
    detectConflicts,

    // Computed values
    hasSelection: calendarState.selectedDates.length > 0,
    isMultiSelection: calendarState.selectionMode === 'range',
    selectedDateCount: calendarState.selectedDates.length,
    activeRequestType: calendarState.activeRequestType,
  };
}
