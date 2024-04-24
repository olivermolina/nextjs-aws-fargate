import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch as useReduxDispatch, useSelector as useReduxSelector } from 'react-redux';
import type { ThunkAction } from 'redux-thunk';
import type { AnyAction } from '@reduxjs/toolkit';
import { configureStore } from '@reduxjs/toolkit';
import { enableDevTools } from 'src/config';
import { rootReducer } from './root-reducer';

import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const persistConfig = {
  key: 'luna-health-root',
  storage,
  whitelist: ['schedule', 'app'],
};
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  devTools: enableDevTools,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'calendar/getEvents',
          'schedule/setScheduleDate',
          'chat/getThread',
          'chat/getThreads',
        ],
        // Ignore these paths in the state
        ignoredPaths: [
          'schedule.scheduleDate',
          'schedule.scheduleTimeSlot.start',
          'schedule.scheduleTimeSlot.end',
          'chat.threads',
          'payload',
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export type AppThunk = ThunkAction<void, RootState, unknown, AnyAction>;

export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;

export const useDispatch = () => useReduxDispatch<AppDispatch>();

export const persistor = persistStore(store);
