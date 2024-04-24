import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import dayjs from 'dayjs';
import { AuthUser } from '../contexts/auth/jwt/auth-context';

interface ScheduleState {
  selectedStaffId: string | null;
  selectedServiceId: string | null;
  scheduleDate: Date;
  isScheduleSubmitting: boolean;
  scheduleTimeSlot: {
    start: Date;
    end: Date;
  } | null;
  scheduleActiveStep: number;
  authenticateRedirectPath: string;
  user: AuthUser | null;
  selectedLocationId: string | null;
}

type GetSelectedStaff = PayloadAction<string>;

type GetSelectedService = PayloadAction<string>;

type GetScheduleDate = PayloadAction<Date>;

type GetScheduleIsComplete = PayloadAction<boolean>;

type GetScheduleTimeSlot = PayloadAction<{
  start: Date;
  end: Date;
}>;

const initialState: ScheduleState = {
  selectedStaffId: null,
  selectedServiceId: null,
  scheduleDate: dayjs().toDate(),
  isScheduleSubmitting: false,
  scheduleTimeSlot: null,
  scheduleActiveStep: 0,
  authenticateRedirectPath: '',
  user: null,
  selectedLocationId: '',
};

const reducers = {
  setSelectedStaff(state: ScheduleState, action: GetSelectedStaff): void {
    state.selectedStaffId = action.payload;
  },
  setSelectedService(state: ScheduleState, action: GetSelectedService): void {
    state.selectedServiceId = action.payload;
  },
  setScheduleDate(state: ScheduleState, action: GetScheduleDate): void {
    state.scheduleDate = action.payload;
  },
  setScheduleSubmitting(state: ScheduleState, action: GetScheduleIsComplete): void {
    state.isScheduleSubmitting = action.payload;
  },
  setScheduleTimeSlot(state: ScheduleState, action: GetScheduleTimeSlot): void {
    state.scheduleTimeSlot = action.payload;
  },
  setScheduleActiveStep(state: ScheduleState, action: PayloadAction<number>): void {
    state.scheduleActiveStep = action.payload;
  },
  resetScheduleState(): ScheduleState {
    return initialState;
  },
  setAuthenticateRedirectPath(state: ScheduleState, action: PayloadAction<string>): void {
    state.authenticateRedirectPath = action.payload;
  },
  setUser(state: ScheduleState, action: PayloadAction<AuthUser>): void {
    state.user = action.payload;
  },
  setSelectedLocationId(state: ScheduleState, action: PayloadAction<string>): void {
    state.selectedLocationId = action.payload;
  },
};

export const slice = createSlice({
  name: 'schedule',
  initialState,
  reducers,
});

export const { reducer } = slice;
