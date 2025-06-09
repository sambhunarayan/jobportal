import React from 'react';

const SuccessMessage = ({ message }) => {
	if (!message) return null;
	return (
		<div className="text-green-700 bg-green-50 border border-green-200 rounded-md p-3 mb-4 text-center font-semibold">
			{message}
		</div>
	);
};

export default SuccessMessage;
