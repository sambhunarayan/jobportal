import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { store } from './store.js';
import Header from '../components/Header.jsx';
import Register from '../features/auth/Register.jsx';
import Login from '../features/auth/Login.jsx';
import JobListings from '../features/jobs/JobListings.jsx';
import JobDetail from '../features/jobs/JobDetail.jsx';
import AdminDashboard from '../features/admin/AdminDashboard.jsx';

const RequireAuth = ({ children, role }) => {
	const { user, isLoggedIn } = useSelector(state => ({
		user: state.auth.user,
		isLoggedIn: !!state.auth.user,
	}));
	if (!isLoggedIn) return <Navigate to="/login" replace />;
	if (role && user.role !== role) return <Navigate to="/jobs" replace />;
	return children;
};

const Home = () => <Navigate to="/jobs" replace />;

function App() {
	return (
		<Provider store={store}>
			<BrowserRouter>
				<Header />
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/register" element={<Register />} />
					<Route path="/login" element={<Login />} />
					<Route path="/jobs" element={<JobListings />} />
					<Route path="/jobs/:id" element={<JobDetail />} />
					<Route
						path="/admin"
						element={
							<RequireAuth role="admin">
								<AdminDashboard />
							</RequireAuth>
						}
					/>
					<Route
						path="*"
						element={
							<main className="pt-20 text-center text-gray-600 font-semibold text-xl">
								Page not found.
							</main>
						}
					/>
				</Routes>
			</BrowserRouter>
		</Provider>
	);
}

export default App;
