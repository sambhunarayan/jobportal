import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const fetchAdminJobs = createAsyncThunk(
	'admin/fetchAdminJobs',
	async (_, thunkAPI) => {
		const state = thunkAPI.getState();
		const token = state.auth.accessToken;
		try {
			const response = await axios.get(`${API_BASE}/jobs`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			return response.data;
		} catch {
			return thunkAPI.rejectWithValue('Failed to load jobs');
		}
	},
);

export const deleteJob = createAsyncThunk(
	'admin/deleteJob',
	async (id, thunkAPI) => {
		const state = thunkAPI.getState();
		const token = state.auth.accessToken;
		try {
			await axios.delete(`${API_BASE}/admin/jobs/${id}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			return id;
		} catch {
			return thunkAPI.rejectWithValue('Failed to delete job');
		}
	},
);

// Add more thunks for create, update, fetch applicants as needed

const adminSlice = createSlice({
	name: 'admin',
	initialState: {
		jobs: [],
		loading: false,
		error: null,
	},
	reducers: {},
	extraReducers(builder) {
		builder
			.addCase(fetchAdminJobs.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchAdminJobs.fulfilled, (state, action) => {
				state.loading = false;
				state.jobs = action.payload;
			})
			.addCase(fetchAdminJobs.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			.addCase(deleteJob.fulfilled, (state, action) => {
				state.jobs = state.jobs.filter(job => job.id !== action.payload);
			});
	},
});

export default adminSlice.reducer;
