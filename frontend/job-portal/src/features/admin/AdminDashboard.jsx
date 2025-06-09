import React from 'react';
import AddJob from './AddJob';
import ViewApplications from './ViewApplications';

const AdminDashboard = () => {
	return (
		<div>
			<h1>Admin Dashboard</h1>
			<AddJob />
			<ViewApplications />
		</div>
	);
};

export default AdminDashboard;
