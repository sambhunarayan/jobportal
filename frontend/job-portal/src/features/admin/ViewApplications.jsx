import React from 'react';

const ViewApplications = () => {
	const applications = []; // Fetch applications data

	return (
		<div>
			<h2>View Applications</h2>
			{applications.length > 0 ? (
				<ul>
					{applications.map(app => (
						<li key={app.id}>
							<h3>{app.name}</h3>
							<p>{app.resume}</p>
						</li>
					))}
				</ul>
			) : (
				<p>No applications available</p>
			)}
		</div>
	);
};

export default ViewApplications;
