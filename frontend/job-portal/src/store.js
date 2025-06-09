import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import jobsReducer from './features/jobs/jobsSlice';
import adminReducer from './features/admin/adminSlice';

export const store = configureStore({
	reducer: {
		auth: authReducer,
		jobs: jobsReducer,
		admin: adminReducer,
	},
});
