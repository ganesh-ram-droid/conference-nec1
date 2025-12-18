import React from "react";

function Dashboard({ registrations, reviewers }) {
  const papersWithAbstracts = registrations.filter(reg => reg.abstractBlob).length;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-blue-800 mb-2">Admin Dashboard</h2>
        <p className="text-gray-600">Overview of conference management</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6 text-center">
          <p className="text-3xl font-bold text-blue-600">{registrations.length}</p>
          <p className="text-sm text-gray-600 font-medium">Total Registrations</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6 text-center">
          <p className="text-3xl font-bold text-blue-600">{reviewers.length}</p>
          <p className="text-sm text-gray-600 font-medium">Total Reviewers</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6 text-center">
          <p className="text-3xl font-bold text-blue-600">{papersWithAbstracts}</p>
          <p className="text-sm text-gray-600 font-medium">Papers with Abstracts</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;