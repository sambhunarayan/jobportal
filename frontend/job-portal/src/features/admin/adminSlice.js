import { createSlice } from '@reduxjs/toolkit';

const adminSlice = createSlice({
	name: 'admin',
	initialState: {
		jobs: [],
		applications: [],
	},
	reducers: {
		addJob: (state, action) => {
			state.jobs.push(action.payload);
		},
		setApplications: (state, action) => {
			state.applications = action.payload;
		},
	},
});

export const { addJob, setApplications } = adminSlice.actions;
export default adminSlice.reducer;
