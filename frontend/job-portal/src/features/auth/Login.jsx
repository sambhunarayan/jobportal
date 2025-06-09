import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from './authSlice.js';
import { Link, useNavigate } from 'react-router-dom';
import ErrorMessage from '../../components/ErrorMessage.jsx';

const Login = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { isLoggedIn, error, isLoading } = useSelector(state => ({
		isLoggedIn: !!state.auth.user,
		error: state.auth.error,
		isLoading: state.auth.isLoading,
	}));

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	useEffect(() => {
		if (isLoggedIn) navigate('/jobs');
	}, [isLoggedIn, navigate]);

	const onSubmit = e => {
		e.preventDefault();
		if (!email || !password) return;
		dispatch(loginUser({ email, password }));
	};

	return (
		<main className="flex flex-col items-center pt-16 pb-20 min-h-[calc(100vh-4rem)]">
			<h1 className="text-5xl font-extrabold mb-8 text-gray-900 leading-tight max-w-2xl text-center">
				Login
			</h1>
			<form
				onSubmit={onSubmit}
				className="w-full max-w-md space-y-6 bg-white shadow-sm rounded-xl px-8 py-10"
			>
				<ErrorMessage error={error} />
				<label
					htmlFor="email"
					className="block text-gray-700 font-semibold mb-1"
				>
					Email
				</label>
				<input
					id="email"
					type="email"
					className="w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 focus:border-gray-900 focus:outline-none transition"
					required
					value={email}
					onChange={e => setEmail(e.target.value)}
					placeholder="you@example.com"
					autoComplete="email"
				/>
				<label
					htmlFor="password"
					className="block text-gray-700 font-semibold mb-1"
				>
					Password
				</label>
				<input
					id="password"
					type="password"
					className="w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 focus:border-gray-900 focus:outline-none transition"
					required
					value={password}
					onChange={e => setPassword(e.target.value)}
					placeholder="Your password"
					autoComplete="current-password"
				/>
				<button
					className="w-full bg-black text-white py-3 rounded-xl font-semibold text-lg hover:bg-gray-900 transition focus-ring"
					type="submit"
					disabled={isLoading}
					aria-busy={isLoading}
				>
					{isLoading ? 'Logging in...' : 'Login'}
				</button>
				<p className="text-center text-gray-600 mt-4">
					Don’t have an account?{' '}
					<Link
						to="/register"
						className="text-black font-semibold hover:underline"
					>
						Register here
					</Link>
					.
				</p>
			</form>
		</main>
	);
};

export default Login;
