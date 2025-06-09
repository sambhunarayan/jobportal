import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const loginUser = createAsyncThunk(
	'auth/loginUser',
	async ({ email, password }, thunkAPI) => {
		try {
			const response = await axios.post(`${API_BASE}/login`, {
				email,
				password,
			});
			return response.data;
		} catch (error) {
			return thunkAPI.rejectWithValue(
				error.response?.data?.error || 'Login failed',
			);
		}
	},
);

export const registerUser = createAsyncThunk(
	'auth/registerUser',
	async ({ email, password }, thunkAPI) => {
		try {
			const response = await axios.post(`${API_BASE}/register`, {
				email,
				password,
			});
			return response.data;
		} catch (error) {
			return thunkAPI.rejectWithValue(
				error.response?.data?.error || 'Registration failed',
			);
		}
	},
);

export const refreshToken = createAsyncThunk(
	'auth/refreshToken',
	async (refreshToken, thunkAPI) => {
		try {
			const response = await axios.post(`${API_BASE}/token`, {
				token: refreshToken,
			});
			return response.data.accessToken;
		} catch {
			return thunkAPI.rejectWithValue('Refresh token failed');
		}
	},
);

const authSlice = createSlice({
	name: 'auth',
	initialState: {
		user: null,
		accessToken: null,
		refreshToken: null,
		isLoading: false,
		isRefreshing: false,
		error: null,
		registerSuccess: null,
	},
	reducers: {
		logout(state) {
			state.user = null;
			state.accessToken = null;
			state.refreshToken = null;
			state.error = null;
			state.registerSuccess = null;
			localStorage.clear();
		},
		setUser(state, action) {
			state.user = action.payload.user;
			state.accessToken = action.payload.accessToken;
			state.refreshToken = action.payload.refreshToken;
			state.error = null;
			state.registerSuccess = null;
			localStorage.setItem('user', JSON.stringify(state.user));
			localStorage.setItem('accessToken', state.accessToken);
			localStorage.setItem('refreshToken', state.refreshToken);
		},
	},
	extraReducers: builder => {
		builder
			.addCase(loginUser.pending, state => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(loginUser.fulfilled, (state, action) => {
				state.isLoading = false;
				state.user = action.payload.user;
				state.accessToken = action.payload.accessToken;
				state.refreshToken = action.payload.refreshToken;
				localStorage.setItem('user', JSON.stringify(state.user));
				localStorage.setItem('accessToken', state.accessToken);
				localStorage.setItem('refreshToken', state.refreshToken);
			})
			.addCase(loginUser.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload;
			})
			.addCase(registerUser.pending, state => {
				state.isLoading = true;
				state.error = null;
				state.registerSuccess = null;
			})
			.addCase(registerUser.fulfilled, (state, action) => {
				state.isLoading = false;
				state.registerSuccess =
					action.payload.message || 'Registration successful';
			})
			.addCase(registerUser.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload;
				state.registerSuccess = null;
			})
			.addCase(refreshToken.pending, state => {
				state.isRefreshing = true;
				state.error = null;
			})
			.addCase(refreshToken.fulfilled, (state, action) => {
				state.isRefreshing = false;
				state.accessToken = action.payload;
				localStorage.setItem('accessToken', action.payload);
			})
			.addCase(refreshToken.rejected, state => {
				state.isRefreshing = false;
				state.user = null;
				state.accessToken = null;
				state.refreshToken = null;
				state.error = 'Session expired, please login again';
				localStorage.clear();
			});
	},
});

export const { logout, setUser } = authSlice.actions;

export default authSlice.reducer;
