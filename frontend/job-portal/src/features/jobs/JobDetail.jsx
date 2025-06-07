import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobDetail } from './jobsSlice';
import { useParams } from 'react-router-dom';
import Loading from '../../components/Loading.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';

const API_BASE = 'http://localhost:5000/api';

const JobDetail = () => {
	const dispatch = useDispatch();
	const { id } = useParams();
	const { currentJob, loadingDetail, errorDetail } = useSelector(
		state => state.jobs,
	);
	const { isLoggedIn, accessToken } = useSelector(state => ({
		isLoggedIn: !!state.auth.user,
		accessToken: state.auth.accessToken,
	}));

	const [applying, setApplying] = useState(false);
	const [coverLetter, setCoverLetter] = useState('');
	const [applyError, setApplyError] = useState('');
	const [applySuccess, setApplySuccess] = useState('');
	const [hasApplied, setHasApplied] = useState(false);

	useEffect(() => {
		dispatch(fetchJobDetail(id));
		setApplySuccess('');
		setApplyError('');
		setHasApplied(false);
	}, [dispatch, id]);

	const onApply = async e => {
		e.preventDefault();
		setApplyError('');
		setApplySuccess('');
		if (!isLoggedIn) {
			setApplyError('Please login to apply');
			return;
		}
		setApplying(true);
		try {
			await fetch(`${API_BASE}/jobs/${id}/apply`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + accessToken,
				},
				body: JSON.stringify({ coverLetter }),
			});
			setApplySuccess('Successfully applied!');
			setHasApplied(true);
		} catch (err) {
			setApplyError(err.message || 'Failed to apply');
		} finally {
			setApplying(false);
		}
	};

	if (loadingDetail)
		return (
			<main className="pt-20">
				<Loading />
			</main>
		);
	if (errorDetail)
		return (
			<main className="pt-20 max-w-3xl mx-auto text-center text-red-600 font-semibold">
				{errorDetail}
			</main>
		);
	if (!currentJob) return null;

	const postedDate = new Date(currentJob.created_at).toLocaleDateString();

	return (
		<main className="pt-16 pb-20 max-w-4xl mx-auto flex flex-col gap-8 px-4 sm:px-6 lg:px-8">
			<article className="bg-white rounded-xl shadow-sm p-8">
				<h1 className="text-5xl font-extrabold mb-3 text-gray-900">
					{currentJob.title}
				</h1>
				<p className="text-gray-500 font-semibold mb-6">
					{currentJob.company} — {currentJob.location}
				</p>
				<time
					dateTime={currentJob.created_at}
					className="block text-gray-400 text-sm mb-8"
				>
					Posted: {postedDate}
				</time>
				<p className="whitespace-pre-line text-gray-800 leading-relaxed">
					{currentJob.description}
				</p>
			</article>
			<section className="bg-white rounded-xl shadow-sm p-8 max-w-2xl w-full mx-auto">
				<h2 className="text-3xl font-semibold mb-6 text-gray-900">
					Apply for this Job
				</h2>
				{!hasApplied ? (
					<form onSubmit={onApply} className="flex flex-col gap-6">
						<label
							htmlFor="coverLetter"
							className="block text-gray-700 font-semibold"
						>
							Cover Letter (optional)
						</label>
						<textarea
							id="coverLetter"
							rows="6"
							className="w-full rounded-md border border-gray-300 p-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
							value={coverLetter}
							onChange={e => setCoverLetter(e.target.value)}
							placeholder="Write your cover letter here..."
							maxLength={500}
						/>
						{applyError && (
							<p className="text-red-600 font-semibold">{applyError}</p>
						)}
						{applySuccess && (
							<p className="text-green-700 font-semibold">{applySuccess}</p>
						)}
						<button
							className="w-full bg-black text-white py-3 rounded-xl font-semibold text-lg hover:bg-gray-900 active:scale-95 transition focus-ring"
							type="submit"
							disabled={applying}
							aria-busy={applying}
						>
							{applying ? 'Submitting...' : 'Apply'}
						</button>
					</form>
				) : (
					<p className="text-green-700 font-semibold">
						You have already applied for this job.
					</p>
				)}
			</section>
		</main>
	);
};

export default JobDetail;
