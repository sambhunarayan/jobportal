import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const fetchJobs = createAsyncThunk(
	'jobs/fetchJobs',
	async (filters, thunkAPI) => {
		try {
			const params = {};
			if (filters?.title) params.title = filters.title;
			if (filters?.company) params.company = filters.company;
			if (filters?.location) params.location = filters.location;
			const response = await axios.get(API_BASE + '/jobs', { params });
			return response.data;
		} catch {
			return thunkAPI.rejectWithValue('Failed to load jobs');
		}
	},
);

export const fetchJobDetail = createAsyncThunk(
	'jobs/fetchJobDetail',
	async (id, thunkAPI) => {
		try {
			const response = await axios.get(API_BASE + '/jobs/' + id);
			return response.data;
		} catch {
			return thunkAPI.rejectWithValue('Failed to load job details');
		}
	},
);

const jobsSlice = createSlice({
	name: 'jobs',
	initialState: {
		list: [],
		currentJob: null,
		loadingList: false,
		loadingDetail: false,
		errorList: null,
		errorDetail: null,
	},
	reducers: {
		clearCurrentJob(state) {
			state.currentJob = null;
			state.errorDetail = null;
		},
	},
	extraReducers(builder) {
		builder
			.addCase(fetchJobs.pending, state => {
				state.loadingList = true;
				state.errorList = null;
			})
			.addCase(fetchJobs.fulfilled, (state, action) => {
				state.loadingList = false;
				state.list = action.payload;
			})
			.addCase(fetchJobs.rejected, (state, action) => {
				state.loadingList = false;
				state.errorList = action.payload;
			})
			.addCase(fetchJobDetail.pending, state => {
				state.loadingDetail = true;
				state.errorDetail = null;
			})
			.addCase(fetchJobDetail.fulfilled, (state, action) => {
				state.loadingDetail = false;
				state.currentJob = action.payload;
			})
			.addCase(fetchJobDetail.rejected, (state, action) => {
				state.loadingDetail = false;
				state.errorDetail = action.payload;
			});
	},
});

export const { clearCurrentJob } = jobsSlice.actions;

export default jobsSlice.reducer;
