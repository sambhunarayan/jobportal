import React, { useState } from 'react';

const AddJob = () => {
	const [jobTitle, setJobTitle] = useState('');
	const [jobDescription, setJobDescription] = useState('');

	const handleSubmit = e => {
		e.preventDefault();
		// Add job logic here
		console.log('Job added:', { jobTitle, jobDescription });
	};

	return (
		<form onSubmit={handleSubmit}>
			<h2>Add Job</h2>
			<input
				type="text"
				value={jobTitle}
				onChange={e => setJobTitle(e.target.value)}
				placeholder="Job Title"
				required
			/>
			<textarea
				value={jobDescription}
				onChange={e => setJobDescription(e.target.value)}
				placeholder="Job Description"
				required
			/>
			<button type="submit">Add Job</button>
		</form>
	);
};

export default AddJob;
