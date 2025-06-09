import React from 'react';

const JobCard = ({ job, onClick }) => {
	const postedDate = new Date(job.created_at).toLocaleDateString();

	return (
		<article
			tabIndex={0}
			onClick={onClick}
			onKeyPress={e => {
				if (e.key === 'Enter' || e.key === ' ') onClick();
			}}
			className="cursor-pointer bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition focus:ring-2 focus:ring-offset-2 focus:ring-black outline-none mb-6"
			aria-label={`Job: ${job.title}, company: ${job.company}, location: ${job.location}`}
		>
			<h2 className="text-xl font-semibold text-gray-900 mb-1">{job.title}</h2>
			<p className="text-gray-500 font-medium">
				{job.company} — {job.location}
			</p>
			<p className="text-gray-400 mt-1 text-sm">Posted: {postedDate}</p>
		</article>
	);
};

export default JobCard;
