import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { RolePermissionInput } from '../utils/zod-schemas/role-permission';

interface AppState {
  showBlockMessage: boolean;
  refetch: boolean;
  permissions: RolePermissionInput[] | null;
  logOutLoading: boolean;
  drawerOpen: boolean;
}

const initialState: AppState = {
  showBlockMessage: false,
  refetch: false,
  permissions: null,
  logOutLoading: false,
  drawerOpen: true,
};

const reducers = {
  setShowBlockMessage(state: AppState, action: PayloadAction<boolean>): void {
    state.showBlockMessage = action.payload;
  },
  setRefetch(state: AppState, action: PayloadAction<boolean>): void {
    state.refetch = action.payload;
  },
  setPermissions(state: AppState, action: PayloadAction<RolePermissionInput[]>): void {
    state.permissions = action.payload;
  },
  setLogOutLoading(state: AppState, action: PayloadAction<boolean>): void {
    state.logOutLoading = action.payload;
  },
  setDrawerOpen(state: AppState, action: PayloadAction<boolean>): void {
    state.drawerOpen = action.payload;
  },
};

export const slice = createSlice({
  name: 'app',
  initialState,
  reducers,
});

export const { reducer } = slice;
