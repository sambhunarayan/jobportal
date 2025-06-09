import React from 'react';

const ErrorMessage = ({ error }) => {
	if (!error) return null;
	return (
		<div className="text-red-600 bg-red-50 border border-red-200 rounded-md p-3 mb-4 text-center font-semibold">
			{error}
		</div>
	);
};

export default ErrorMessage;
