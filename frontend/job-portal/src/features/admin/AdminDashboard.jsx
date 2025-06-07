import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminJobs, deleteJob } from './adminSlice';
import Loading from '../../components/Loading.jsx';

const AdminDashboard = () => {
	const dispatch = useDispatch();
	const { jobs, loading, error } = useSelector(state => state.admin);

	useEffect(() => {
		dispatch(fetchAdminJobs());
	}, [dispatch]);

	const onDelete = id => {
		if (window.confirm('Are you sure you want to delete this job?')) {
			dispatch(deleteJob(id));
		}
	};

	return (
		<main className="pt-16 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
			<h1 className="text-5xl font-extrabold text-gray-900">Admin Dashboard</h1>
			{loading && <Loading />}
			{error && <p className="text-red-600 font-semibold">{error}</p>}
			<section className="flex flex-col gap-6">
				{jobs.map(job => (
					<article
						key={job.id}
						className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between"
					>
						<div>
							<h2 className="text-xl font-semibold text-gray-900">
								{job.title}
							</h2>
							<p className="text-gray-500 font-medium">
								{job.company} — {job.location}
							</p>
						</div>
						<button
							onClick={() => onDelete(job.id)}
							className="bg-red-600 px-4 py-2 rounded text-white font-semibold hover:bg-red-700 transition focus-ring"
						>
							Delete
						</button>
					</article>
				))}
				{!loading && jobs.length === 0 && (
					<p className="text-center text-gray-600 font-semibold">
						No jobs available.
					</p>
				)}
			</section>
		</main>
	);
};

export default AdminDashboard;
