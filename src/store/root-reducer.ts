import { combineReducers } from '@reduxjs/toolkit';

import { reducer as calendarReducer } from 'src/slices/calendar';
import { reducer as chatReducer } from 'src/slices/chat';
import { reducer as kanbanReducer } from 'src/slices/kanban';
import { reducer as mailReducer } from 'src/slices/mail';
import { reducer as scheduleReducer } from 'src/slices/schedule';
import { reducer as appReducer } from 'src/slices/app';

export const rootReducer = combineReducers({
  calendar: calendarReducer,
  chat: chatReducer,
  kanban: kanbanReducer,
  mail: mailReducer,
  schedule: scheduleReducer,
  app: appReducer
});
