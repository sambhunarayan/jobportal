import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';

const Header = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const { user, isLoggedIn } = useSelector(state => ({
		user: state.auth.user,
		isLoggedIn: !!state.auth.user,
	}));

	const onLogout = () => {
		dispatch(logout());
		navigate('/login');
	};

	return (
		<header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
			<nav className="max-w-[1200px] mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
				<Link
					to="/"
					className="text-2xl font-extrabold text-gray-900 tracking-tight"
				>
					Job Portal
				</Link>
				<div className="flex items-center space-x-6">
					<Link
						to="/jobs"
						className="text-gray-700 font-semibold hover:text-gray-900 transition"
					>
						Jobs
					</Link>
					{isLoggedIn ? (
						<>
							{user?.role === 'admin' && (
								<Link
									to="/admin"
									className="text-gray-700 font-semibold hover:text-gray-900 transition"
								>
									Admin
								</Link>
							)}
							<button
								onClick={onLogout}
								className="text-gray-700 font-semibold hover:text-gray-900 focus-ring transition"
								aria-label="Logout"
							>
								Logout
							</button>
						</>
					) : (
						<>
							<Link
								to="/login"
								className="text-gray-700 font-semibold hover:text-gray-900 transition"
							>
								Login
							</Link>
							<Link
								to="/register"
								className="text-gray-700 font-semibold hover:text-gray-900 transition"
							>
								Register
							</Link>
						</>
					)}
				</div>
			</nav>
		</header>
	);
};

export default Header;
