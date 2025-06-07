import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobs } from './jobsSlice';
import { useNavigate } from 'react-router-dom';
import JobCard from '../../components/JobCard.jsx';
import Loading from '../../components/Loading.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';

const JobListings = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { list, loadingList, errorList } = useSelector(state => state.jobs);
	const [filters, setFilters] = useState({
		title: '',
		company: '',
		location: '',
	});

	useEffect(() => {
		dispatch(fetchJobs(filters));
	}, [dispatch, filters]);

	const onSearch = () => {
		dispatch(fetchJobs(filters));
	};

	const onJobClick = id => {
		navigate(`/jobs/${id}`);
	};

	return (
		<main className="pt-16 pb-20 max-w-5xl mx-auto flex flex-col">
			<h1 className="text-5xl font-extrabold mb-10 text-gray-900">
				Job Listings
			</h1>
			<section className="mb-8 flex flex-wrap gap-4">
				<input
					aria-label="Filter by job title"
					type="text"
					placeholder="Filter by title"
					value={filters.title}
					onChange={e => setFilters(f => ({ ...f, title: e.target.value }))}
					className="flex-grow min-w-[12rem] rounded-md border border-gray-300 px-4 py-3 focus:border-gray-900 outline-none focus:ring-1 focus:ring-gray-900 transition"
				/>
				<input
					aria-label="Filter by company"
					type="text"
					placeholder="Filter by company"
					value={filters.company}
					onChange={e => setFilters(f => ({ ...f, company: e.target.value }))}
					className="flex-grow min-w-[12rem] rounded-md border border-gray-300 px-4 py-3 focus:border-gray-900 outline-none focus:ring-1 focus:ring-gray-900 transition"
				/>
				<input
					aria-label="Filter by location"
					type="text"
					placeholder="Filter by location"
					value={filters.location}
					onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
					className="flex-grow min-w-[12rem] rounded-md border border-gray-300 px-4 py-3 focus:border-gray-900 outline-none focus:ring-1 focus:ring-gray-900 transition"
				/>
				<button
					onClick={onSearch}
					className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-900 transition focus-ring"
					aria-label="Search jobs"
				>
					Search
				</button>
			</section>
			{loadingList ? (
				<Loading />
			) : errorList ? (
				<ErrorMessage error={errorList} />
			) : null}
			{!loadingList && !errorList && list.length === 0 && (
				<p className="text-center text-gray-500 font-medium mt-20">
					No jobs found.
				</p>
			)}
			<section>
				{list.map(job => (
					<JobCard key={job.id} job={job} onClick={() => onJobClick(job.id)} />
				))}
			</section>
		</main>
	);
};

export default JobListings;
