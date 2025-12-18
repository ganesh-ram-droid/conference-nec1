import  React, { useState, useEffect } from "react";

const ASSIGN_REVIEWER_URL = "https://nec.edu.in/icodses/admin/assign-reviewer";
const GET_ASSIGNMENTS_URL = "https://nec.edu.in/icodses/admin/assignments";
const UPDATE_ASSIGNMENT_URL = (paperId, reviewerId) => `https://nec.edu.in/icodses/admin/assignment/${paperId}/${reviewerId}`;
const DELETE_ASSIGNMENT_URL = (paperId, reviewerId) => `https://nec.edu.in/icodses/admin/assignment/${paperId}/${reviewerId}`;

const TRACKS = [
  "Emerging & Frontier Technologies",
  "Sustainable Energy & Power Systems",
  "Environment, Climate-Tech & Sustainable Infrastructure",
  "Advanced Computing & Cyber-Physical Systems",
  "Sustainable Transportation & E-Mobility",
  "Nextgen communication, VLSI & Embedded Systems"
];

function AssignReviewer({ registrations, reviewers, onAssignmentComplete }) {
  // State for available papers
  const [availablePapers, setAvailablePapers] = useState([]);
  const [selectedReviewers1, setSelectedReviewers1] = useState({});
  const [selectedReviewers2, setSelectedReviewers2] = useState({});
  const [assigningNew, setAssigningNew] = useState(false);
  const [assignments, setAssignments] = useState([]); // Array of {paperId, paperTitle, track, reviewerNames[], reviewerDetails[], reviewerIds[]}
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [editingAssignment, setEditingAssignment] = useState(null); // {paperId, reviewerId} being edited
  const [newReviewerId, setNewReviewerId] = useState("");
  const [deletingAssignment, setDeletingAssignment] = useState(null); // {paperId, reviewerId} being deleted
  const [assigning, setAssigning] = useState(false);
  const [filters, setFilters] = useState({ fromDate: '', toDate: '', paperTracks: [], reviewerTracks: [] });
  const [reviewerTrackFilter, setReviewerTrackFilter] = useState("");
  const [paperTrackFilter, setPaperTrackFilter] = useState("");

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'paperTracks' || name === 'reviewerTracks') {
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setFilters(prev => ({ ...prev, [name]: selectedOptions }));
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  // Fetch all assignments and unassigned papers on mount/refresh or filter change
  useEffect(() => {
    const fetchAssignments = async () => {
      setLoadingAssignments(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setAssignments([]);
          setAvailablePapers([]);
          setLoadingAssignments(false);
          return;
        }
        // Build query params for filters
        const queryParams = new URLSearchParams();
        if (filters.fromDate) queryParams.append('fromDate', filters.fromDate);
        if (filters.toDate) queryParams.append('toDate', filters.toDate);
        if (filters.paperTracks && filters.paperTracks.length > 0) {
          filters.paperTracks.forEach(track => queryParams.append('paperTracks', track));
        }
        if (filters.reviewerTracks && filters.reviewerTracks.length > 0) {
          filters.reviewerTracks.forEach(track => queryParams.append('reviewerTracks', track));
        }
        const queryString = queryParams.toString();

        // Fetch assignments
        const assignmentsUrl = queryString ? `${GET_ASSIGNMENTS_URL}?${queryString}` : GET_ASSIGNMENTS_URL;
        const response = await fetch(assignmentsUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        if (response.ok && Array.isArray(data)) {
          setAssignments(data);
        } else {
          setAssignments([]);
        }
        // Fetch available papers
        const availableQueryParams = new URLSearchParams();
        if (filters.fromDate) availableQueryParams.append('fromDate', filters.fromDate);
        if (filters.toDate) availableQueryParams.append('toDate', filters.toDate);
        if (paperTrackFilter) availableQueryParams.append('paperTracks', paperTrackFilter);
        if (reviewerTrackFilter) availableQueryParams.append('reviewerTracks', reviewerTrackFilter);
        const availableQueryString = availableQueryParams.toString();
        const availableUrl = availableQueryString ? `https://nec.edu.in/icodses/admin/papers-available-for-assignment?${availableQueryString}` : "https://nec.edu.in/icodses/admin/papers-available-for-assignment";
        const availableRes = await fetch(availableUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const availableData = await availableRes.json();
        if (availableRes.ok && Array.isArray(availableData)) {
          setAvailablePapers(availableData);
        } else {
          setAvailablePapers([]);
        }
      } catch (err) {
        setAssignments([]);
        setAvailablePapers([]);
      } finally {
        setLoadingAssignments(false);
      }
    };
    fetchAssignments();
  }, [onAssignmentComplete, filters, paperTrackFilter, reviewerTrackFilter]);



  // Assign reviewers to a paper (updated for two reviewers)
  const handleAssignNew = async (paperId) => {
    const reviewerId1 = selectedReviewers1[paperId];
    const reviewerId2 = selectedReviewers2[paperId];
    if (!reviewerId1 && !reviewerId2) {
      alert("Please select at least one reviewer for the paper.");
      return;
    }
    if (reviewerId1 && reviewerId2 && reviewerId1 === reviewerId2) {
      alert("Please select different reviewers for each slot.");
      return;
    }
    setAssigningNew(true);
    try {
      const token = localStorage.getItem('token');
      const assignments = [];
      if (reviewerId1) assignments.push({ paperId, reviewerId: reviewerId1, slot: 1 });
      if (reviewerId2) assignments.push({ paperId, reviewerId: reviewerId2, slot: 2 });

      for (const assignment of assignments) {
        const response = await fetch(ASSIGN_REVIEWER_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(assignment)
        });
        const data = await response.json();
        if (!response.ok) {
          alert(data.error || 'Failed to assign reviewer');
          return;
        }
      }
      alert('Reviewers assigned successfully!');
      setSelectedReviewers1(prev => ({ ...prev, [paperId]: "" }));
      setSelectedReviewers2(prev => ({ ...prev, [paperId]: "" }));
      if (onAssignmentComplete) onAssignmentComplete();
    } catch (err) {
      alert('Error assigning reviewers');
    } finally {
      setAssigningNew(false);
    }
  };
  // Start editing assignment
  const handleEditAssignment = (paperId, currentReviewerId) => {
    setEditingAssignment({ paperId, reviewerId: currentReviewerId });
    setNewReviewerId(currentReviewerId);
  };

  // Save updated assignment
  const handleUpdateAssignment = async () => {
    if (!newReviewerId || !editingAssignment) return;
    setAssigning(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(UPDATE_ASSIGNMENT_URL(editingAssignment.paperId, editingAssignment.reviewerId), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reviewerId: newReviewerId })
      });
      const data = await response.json();
      if (response.ok) {
        alert('Assignment updated successfully!');
        setEditingAssignment(null);
        setNewReviewerId("");
        if (onAssignmentComplete) onAssignmentComplete();
      } else {
        alert(data.error || 'Failed to update assignment');
      }
    } catch (err) {
      alert('Error updating assignment');
    } finally {
      setAssigning(false);
    }
  };

  // Delete assignment
  const handleDeleteAssignment = async (paperId, reviewerId) => {
    if (!window.confirm('Are you sure you want to unassign this reviewer from the paper?')) return;
    setDeletingAssignment({ paperId, reviewerId });
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(DELETE_ASSIGNMENT_URL(paperId, reviewerId), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (response.ok) {
        alert('Assignment deleted successfully!');
        if (onAssignmentComplete) onAssignmentComplete();
      } else {
        alert(data.error || 'Failed to delete assignment');
      }
    } catch (err) {
      alert('Error deleting assignment');
    } finally {
      setDeletingAssignment(null);
    }
  };



  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-blue-800 mb-2">All Reviewer Assignments</h2>
        <p className="text-gray-600">View, update, or delete reviewer assignments for papers. Assign a reviewer to a submitted paper below.</p>
      </div>

      {/* Date Filters */}
      <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Filter by Submission Date</h3>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              name="fromDate"
              value={filters.fromDate}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              name="toDate"
              value={filters.toDate}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Assign Reviewer to Unassigned Paper */}
      <div className="mb-8 bg-white rounded-lg shadow-sm border border-green-200 p-6">
        <h3 className="text-lg font-semibold text-green-700 mb-4">Assign Reviewer to Paper</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter Papers by Track</label>
          <select
            value={paperTrackFilter}
            onChange={e => setPaperTrackFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">All Tracks</option>
            {TRACKS.map(track => (
              <option key={track} value={track}>{track}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter Reviewers by Track</label>
          <select
            value={reviewerTrackFilter}
            onChange={e => setReviewerTrackFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">All Tracks</option>
            {TRACKS.map(track => (
              <option key={track} value={track}>{track}</option>
            ))}
          </select>
        </div>
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">Paper ID</th>
              <th className="border border-gray-300 px-4 py-2">Paper Title</th>
              <th className="border border-gray-300 px-4 py-2">Track</th>
              <th className="border border-gray-300 px-4 py-2">Select Reviewer 1</th>
              <th className="border border-gray-300 px-4 py-2">Select Reviewer 2</th>
              <th className="border border-gray-300 px-4 py-2">Assign</th>
            </tr>
          </thead>
          <tbody>
            {availablePapers.filter(paper => !paperTrackFilter || (paper.track && paper.track.trim().toLowerCase() === paperTrackFilter.trim().toLowerCase())).map(paper => (
              <tr key={paper.id}>
                <td className="border border-gray-300 px-4 py-2">{paper.id}</td>
                <td className="border border-gray-300 px-4 py-2">{paper.paperTitle}</td>
                <td className="border border-gray-300 px-4 py-2">{paper.track}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <select
                    value={selectedReviewers1[paper.id] || ''}
                    onChange={e => setSelectedReviewers1({...selectedReviewers1, [paper.id]: e.target.value})}
                    disabled={paper.currentReviewers.length !== 0}
                    className="border border-gray-300 rounded-md px-2 py-1 w-full"
                  >
                    <option value="">Select Reviewer 1</option>
                    {reviewers.filter(rev => !reviewerTrackFilter || (rev.track && rev.track.trim().toLowerCase() === reviewerTrackFilter.trim().toLowerCase())).map(rev => (
                      <option key={rev.id} value={rev.id} disabled={paper.currentReviewers.includes(rev.name)}>{rev.name} ({rev.track})</option>
                    ))}
                  </select>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <select
                    value={selectedReviewers2[paper.id] || ''}
                    onChange={e => setSelectedReviewers2({...selectedReviewers2, [paper.id]: e.target.value})}
                    disabled={paper.currentReviewers.length !== 1}
                    className="border border-gray-300 rounded-md px-2 py-1 w-full"
                  >
                    <option value="">Select Reviewer 2</option>
                    {reviewers.filter(rev => !reviewerTrackFilter || (rev.track && rev.track.trim().toLowerCase() === reviewerTrackFilter.trim().toLowerCase())).map(rev => (
                      <option key={rev.id} value={rev.id} disabled={paper.currentReviewers.includes(rev.name) || rev.id === selectedReviewers1[paper.id]}>{rev.name} ({rev.track})</option>
                    ))}
                  </select>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    onClick={() => handleAssignNew(paper.id)}
                    disabled={(!selectedReviewers1[paper.id] && !selectedReviewers2[paper.id]) || assigningNew}
                    className={`px-4 py-2 rounded-md text-white ${(!selectedReviewers1[paper.id] && !selectedReviewers2[paper.id]) || assigningNew ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                  >
                    {assigningNew ? 'Assigning...' : 'Assign'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {availablePapers.filter(paper => !paperTrackFilter || (paper.track && paper.track.trim().toLowerCase() === paperTrackFilter.trim().toLowerCase())).length === 0 && (
          <p className="text-gray-500 mt-4">No papers available for assignment matching the filters.</p>
        )}
      </div>

      {/* Existing Assignments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
        {loadingAssignments ? (
          <p>Loading assignments...</p>
        ) : assignments.length === 0 ? (
          <p className="text-gray-500">No assignments found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <tr>
                  <th className="px-4 py-2">Paper ID</th>
                  <th className="px-4 py-2">Paper Title</th>
                  <th className="px-4 py-2">Reviewers</th>
                  <th className="px-4 py-2">Track</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.paperId}>
                    <td className="px-4 py-2">{a.paperId}</td>
                    <td className="px-4 py-2">{a.paperTitle}</td>
                    <td className="px-4 py-2">{a.reviewerNames.join(', ')}</td>
                    <td className="px-4 py-2">{a.track}</td>
                    <td className="px-4 py-2">
                      {a.reviewerIds.map((revId, index) => {
                        const reviewerName = a.reviewerNames[index];
                        const reviewerEmail = a.reviewerDetails[index].email;
                        const isEditing = editingAssignment && editingAssignment.paperId === a.paperId && editingAssignment.reviewerId === revId;
                        const isDeleting = deletingAssignment && deletingAssignment.paperId === a.paperId && deletingAssignment.reviewerId === revId;
                        return (
                          <div key={revId} className="mb-2">
                            {isEditing ? (
                              <>
                                <select
                                  value={newReviewerId}
                                  onChange={e => setNewReviewerId(e.target.value)}
                                  className="border border-gray-300 rounded-md px-2 py-1 mr-2"
                                >
                                  <option value="">Select Reviewer</option>
                                  {reviewers.map(rev => (
                                    <option key={rev.id} value={rev.id} disabled={a.reviewerNames.includes(rev.name)}>{rev.name} ({rev.track})</option>
                                  ))}
                                </select>
                                <button
                                  className="px-3 py-1 bg-blue-600 text-white rounded mr-2"
                                  onClick={handleUpdateAssignment}
                                  disabled={assigning}
                                >
                                  Save
                                </button>
                                <button
                                  className="px-3 py-1 bg-gray-400 text-white rounded"
                                  onClick={() => setEditingAssignment(null)}
                                  disabled={assigning}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <span className="mr-2">{reviewerName} </span>
                                <button
                                  className="px-3 py-1 bg-yellow-500 text-white rounded mr-2"
                                  onClick={() => handleEditAssignment(a.paperId, revId)}
                                >
                                  Update
                                </button>
                                <button
                                  className="px-3 py-1 bg-red-600 text-white rounded"
                                  onClick={() => handleDeleteAssignment(a.paperId, revId)}
                                  disabled={isDeleting}
                                >
                                  {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AssignReviewer;
