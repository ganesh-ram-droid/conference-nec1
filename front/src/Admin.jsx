import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import ViewRegistrations from "./ViewRegistrations";
import AssignReviewer from "./AssignReviewer";
import Analytics from "./Analytics";
import ReviewerComments from "./ReviewerComments";

const  API_URL = "https://nec.edu.in/icodses/admin/registrations-with-assignments";
const CREATE_REVIEWER_URL = "https://nec.edu.in/icodses/admin/create-reviewer";
const GET_REVIEWERS_URL = "https://nec.edu.in/icodses/admin/reviewers-with-assignments";
const ASSIGN_REVIEWER_URL = "https://nec.edu.in/icodses/admin/assign-reviewer";
const DELETE_REVIEWER_URL = "https://nec.edu.in/icodses/admin/delete-reviewer";
const UPDATE_REVIEWER_URL = "https://nec.edu.in/icodses/admin/update-reviewer";
const GET_UNASSIGNED_PAPERS_URL = "https://nec.edu.in/icodses/admin/unassigned-papers";
const ANALYTICS_URL = "https://nec.edu.in/icodses/admin/registration-analytics";

function Admin() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [totalRegistrations, setTotalRegistrations] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reviewerForm, setReviewerForm] = useState({ name: '', email: '', track: '' });
  const [creatingReviewer, setCreatingReviewer] = useState(false);
  const [assignments, setAssignments] = useState({});
  const [activeSection, setActiveSection] = useState('dashboard');
  const [registrationFilters, setRegistrationFilters] = useState({ fromDate: '', toDate: '', selectedTracks: [] });
  const [reviewerFilters, setReviewerFilters] = useState({ track: '' });
  const [deletingReviewer, setDeletingReviewer] = useState(null);
  const [updatingReviewer, setUpdatingReviewer] = useState(null);
  const [updatingReviewerLoading, setUpdatingReviewerLoading] = useState(false);
  const [updateForm, setUpdateForm] = useState({ name: '', email: '', track: '' });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [analyticsData, setAnalyticsData] = useState({ countries: [], states: [] });

  // Calculate analytics data
  const papersWithAbstracts = registrations.filter(reg => reg.abstract && reg.abstract.trim() !== '').length;
  const recentSubmissions = registrations.filter(reg => {
    if (!reg.createdAt) return false;
    const submissionDate = new Date(reg.createdAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return submissionDate >= sevenDaysAgo;
  }).length;

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setRegistrations([]);
          setLoading(false);
          console.warn("No token found in localStorage");
          return;
        }
        const res = await fetch(API_URL, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await res.json();
        console.log("API Response:", res.status, res.ok, data);
        if (res.ok && Array.isArray(data)) {
          setRegistrations(data);
          console.log("Registrations loaded:", data.length);
        } else {
          setRegistrations([]);
          console.warn("Failed to fetch registrations:", data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setRegistrations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrations();
  }, [refreshTrigger]);

  useEffect(() => {
    const fetchReviewers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setReviewers([]);
          return;
        }
        const res = await fetch(GET_REVIEWERS_URL, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setReviewers(data);
        } else {
          setReviewers([]);
          console.warn("Failed to fetch reviewers:", data);
        }
      } catch (err) {
        console.error("Error fetching reviewers:", err);
        setReviewers([]);
      }
    };
    fetchReviewers();
  }, [refreshTrigger]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setAnalyticsData({ countries: [], states: [] });
          return;
        }
        const res = await fetch(ANALYTICS_URL, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (res.ok) {
          setAnalyticsData(data);
        } else {
          setAnalyticsData({ countries: [], states: [] });
          console.warn("Failed to fetch analytics:", data);
        }
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setAnalyticsData({ countries: [], states: [] });
      }
    };
    fetchAnalytics();
  }, [refreshTrigger]);

  useEffect(() => {
    const fetchTotalRegistrations = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setTotalRegistrations(0);
          return;
        }
        const res = await fetch("https://nec.edu.in/icodses/admin/total-registrations", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (res.ok) {
          setTotalRegistrations(data.total || 0);
        } else {
          setTotalRegistrations(0);
          console.warn("Failed to fetch total registrations:", data);
        }
      } catch (err) {
        console.error("Error fetching total registrations:", err);
        setTotalRegistrations(0);
      }
    };
    fetchTotalRegistrations();
  }, [refreshTrigger]);

  const handleReviewerFormChange = (e) => {
    const { name, value } = e.target;
    setReviewerForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setRegistrationFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleTrackChange = (track, checked) => {
    setRegistrationFilters(prev => ({
      ...prev,
      selectedTracks: checked
        ? [...prev.selectedTracks, track]
        : prev.selectedTracks.filter(t => t !== track)
    }));
  };

  const handleReviewerFilterChange = (e) => {
    const { name, value } = e.target;
    setReviewerFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateFormChange = (e) => {
    const { name, value } = e.target;
    setUpdateForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditReviewer = (reviewer) => {
    setUpdatingReviewer(reviewer.id);
    setUpdateForm({
      name: reviewer.name,
      email: reviewer.email,
      track: reviewer.track || ''
    });
  };

  const handleUpdateReviewer = async () => {
    if (!updateForm.name || !updateForm.email || !updateForm.track) {
      alert('Please fill in all fields including track selection');
      return;
    }

    setUpdatingReviewerLoading(true);
    try {
      const token = localStorage.getItem('token');
      const reviewerData = {
        name: updateForm.name,
        email: updateForm.email,
        track: updateForm.track
      };

      const res = await fetch(`${UPDATE_REVIEWER_URL}/${updatingReviewer}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewerData)
      });
      const data = await res.json();
      if (res.ok) {
        alert('Reviewer updated successfully!');
        setUpdatingReviewer(null);
        setUpdateForm({ name: '', email: '', track: '' });
        refreshData(); // Refresh all data
      } else {
        alert(data.error || 'Failed to update reviewer');
      }
    } catch (err) {
      console.error("Error updating reviewer:", err);
      alert('Error updating reviewer');
    } finally {
      setUpdatingReviewerLoading(false);
    }
  };

  const cancelUpdate = () => {
    setUpdatingReviewer(null);
    setUpdateForm({ name: '', email: '', track: '' });
  };

  const clearFilters = () => {
    setRegistrationFilters({ fromDate: '', toDate: '', selectedTracks: [] });
  };

  const clearReviewerFilters = () => {
    setReviewerFilters({ track: '' });
  };

  const refreshData = () => {
    setLoading(true);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCreateReviewer = async () => {
    if (!reviewerForm.name || !reviewerForm.email || !reviewerForm.track) {
      alert('Please fill in all fields including track selection');
      return;
    }

    setCreatingReviewer(true);
    try {
      const token = localStorage.getItem('token');
      const reviewerData = {
        name: reviewerForm.name,
        email: reviewerForm.email,
        password: '12345678', // Default password
        track: reviewerForm.track
      };

      const res = await fetch(CREATE_REVIEWER_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewerData)
      });
      const data = await res.json();
      if (res.ok) {
        let msg = 'Reviewer created successfully!';
        if (typeof data.emailLog === 'string') {
          msg += '\n' + data.emailLog;
        } else if (data.emailSent === false) {
          msg += '\nEmail not sent.';
        }
        alert(msg);
        setReviewerForm({ name: '', email: '', track: '' });
        refreshData(); // Refresh all data
      } else {
        alert(data.error || 'Failed to create reviewer');
      }
    } catch (err) {
      console.error("Error creating reviewer:", err);
      alert('Error creating reviewer');
    } finally {
      setCreatingReviewer(false);
    }
  };

  const handleDeleteReviewer = async (reviewerId) => {
    if (!window.confirm('Are you sure you want to delete this reviewer? This action cannot be undone.')) {
      return;
    }

    setDeletingReviewer(reviewerId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${DELETE_REVIEWER_URL}/${reviewerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (res.ok) {
        alert('Reviewer deleted successfully!');
        refreshData(); // Refresh all data
      } else {
        alert(data.error || 'Failed to delete reviewer');
      }
    } catch (err) {
      console.error("Error deleting reviewer:", err);
      alert('Error deleting reviewer');
    } finally {
      setDeletingReviewer(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const tracks = [
    "Emerging & Frontier Technologies",
    "Sustainable Energy & Power Systems",
    "Environment, Climate-Tech & Sustainable Infrastructure",
    "Advanced Computing & Cyber-Physical Systems",
    "Sustainable Transportation & E-Mobility",
    "Nextgen communication, VLSI & Embedded Systems"
  ];

  // Filter reviewers based on selected track
  const filteredReviewers = reviewers.filter(reviewer => {
    if (!reviewerFilters.track) return true;
    return reviewer.track === reviewerFilters.track;
  });

  // Helper function to format authors
  const formatAuthors = (authors) => {
    if (!authors) return 'No authors';

    // If authors is a string, return it
    if (typeof authors === 'string') return authors;

    // If authors is an array of strings, join them
    if (Array.isArray(authors)) {
      if (authors.length === 0) return 'No authors';
      if (typeof authors[0] === 'string') return authors.join(', ');
      // If authors is an array of objects, extract names
      if (typeof authors[0] === 'object' && authors[0] !== null) {
        return authors.map(author => author.name || author.email || JSON.stringify(author)).join(', ');
      }
    }

    // If authors is an object, try to extract meaningful data
    if (typeof authors === 'object' && authors !== null) {
      if (authors.name) return authors.name;
      if (authors.email) return authors.email;
      return JSON.stringify(authors);
    }

    return 'No authors';
  };

  // Helper function to format abstract
  const formatAbstract = (abstract) => {
    if (!abstract) return 'Missing';
    if (typeof abstract === 'string') {
      return abstract.trim() !== '' ? 'Available' : 'Missing';
    }
    if (typeof abstract === 'object' && abstract !== null) {
      if (abstract.content) return abstract.content.trim() !== '' ? 'Available' : 'Missing';
      if (abstract.text) return abstract.text.trim() !== '' ? 'Available' : 'Missing';
      return 'Available'; // If it's an object but we can't parse it, assume it's available
    }
    return 'Missing';
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-blue-800 text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">NEC Conference Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span>Welcome, {user.name}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        <div className="w-64 bg-white shadow-lg">
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveSection('dashboard')}
                  className={`w-full text-left p-2 rounded ${activeSection === 'dashboard' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
                >
                  Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection('reviewers')}
                  className={`w-full text-left p-2 rounded ${activeSection === 'reviewers' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
                >
                  Manage Reviewers
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection('registrations')}
                  className={`w-full text-left p-2 rounded ${activeSection === 'registrations' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
                >
                  All Registrations
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection('assignments')}
                  className={`w-full text-left p-2 rounded ${activeSection === 'assignments' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
                >
                  Assign Reviewers
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection('analytics')}
                  className={`w-full text-left p-2 rounded ${activeSection === 'analytics' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
                >
                  Analytics
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection('reviewer-comments')}
                  className={`w-full text-left p-2 rounded ${activeSection === 'reviewer-comments' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
                >
                  Reviewer Comments
                </button>
              </li>
            </ul>
          </nav>
        </div>

        <div className="flex-1 p-6">
          {activeSection === 'dashboard' && (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-blue-800 mb-2">Dashboard</h2>
                <p className="text-gray-600">Overview of conference management</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6 text-center">
                  <p className="text-3xl font-bold text-blue-600">{totalRegistrations}</p>
                  <p className="text-sm text-gray-600 font-medium">Total Registrations</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6 text-center">
                  <p className="text-3xl font-bold text-blue-600">{reviewers.length}</p>
                  <p className="text-sm text-gray-600 font-medium">Total Reviewers</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'reviewers' && (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-blue-800 mb-2">Manage Reviewers</h2>
                <p className="text-gray-600">Create and manage conference reviewers</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-blue-700 mb-4">Create New Reviewer</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="name"
                    value={reviewerForm.name}
                    onChange={handleReviewerFormChange}
                    placeholder="Reviewer Name"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="email"
                    name="email"
                    value={reviewerForm.email}
                    onChange={handleReviewerFormChange}
                    placeholder="Reviewer Email"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    name="track"
                    value={reviewerForm.track}
                    onChange={handleReviewerFormChange}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Track</option>
                    {tracks.map((track, index) => (
                      <option key={index} value={track}>{track}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleCreateReviewer}
                  disabled={creatingReviewer}
                  className={`mt-4 px-6 py-2 rounded-md text-white ${
                    creatingReviewer ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {creatingReviewer ? 'Creating...' : 'Create Reviewer'}
                </button>
                <p className="mt-2 text-sm text-gray-600">
                  Note: Default password will be set to "12345678". Reviewers will be prompted to change it on first login.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <h3 className="text-lg font-semibold text-blue-700 mb-2 sm:mb-0">Filter Reviewers by Track</h3>
                  <button
                    onClick={clearReviewerFilters}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-md shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Clear Filter
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    name="track"
                    value={reviewerFilters.track}
                    onChange={handleReviewerFilterChange}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Tracks</option>
                    {tracks.map((track, index) => (
                      <option key={index} value={track}>{track}</option>
                    ))}
                  </select>
                </div>
                {reviewerFilters.track && (
                  <p className="text-sm text-blue-600 mt-2">
                    Showing {filteredReviewers.length} of {reviewers.length} reviewers
                  </p>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
                <h3 className="text-lg font-semibold text-blue-700 mb-4">Existing Reviewers</h3>
                {filteredReviewers.length === 0 ? (
                  <p className="text-gray-600">
                    {reviewerFilters.track ? 'No reviewers found for selected track.' : 'No reviewers found.'}
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2">Email</th>
                          <th className="text-left p-2">Track</th>
                          <th className="text-left p-2">Assigned Papers</th>
                          <th className="text-left p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReviewers.map((reviewer) => (
                          <tr key={reviewer.id} className="border-b">
                            <td className="p-2">{reviewer.name}</td>
                            <td className="p-2">{reviewer.email}</td>
                            <td className="p-2">{reviewer.track || 'Not assigned'}</td>
                            <td className="p-2">{reviewer.assignedPapers || 0}</td>
                            <td className="p-2">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditReviewer(reviewer)}
                                  className="px-3 py-1 rounded text-sm text-white bg-blue-500 hover:bg-blue-600"
                                >
                                  Update
                                </button>
                                <button
                                  onClick={() => handleDeleteReviewer(reviewer.id)}
                                  disabled={deletingReviewer === reviewer.id}
                                  className={`px-3 py-1 rounded text-sm text-white ${
                                    deletingReviewer === reviewer.id
                                      ? 'bg-gray-400 cursor-not-allowed'
                                      : 'bg-red-500 hover:bg-red-600'
                                  }`}
                                >
                                  {deletingReviewer === reviewer.id ? 'Deleting...' : 'Delete'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {updatingReviewer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                    <h3 className="text-lg font-semibold text-blue-700 mb-4">Update Reviewer</h3>
                    <div className="space-y-4">
                      <input
                        type="text"
                        name="name"
                        value={updateForm.name}
                        onChange={handleUpdateFormChange}
                        placeholder="Reviewer Name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="email"
                        name="email"
                        value={updateForm.email}
                        onChange={handleUpdateFormChange}
                        placeholder="Reviewer Email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <select
                        name="track"
                        value={updateForm.track}
                        onChange={handleUpdateFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Track</option>
                        {tracks.map((track, index) => (
                          <option key={index} value={track}>{track}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-end space-x-2 mt-6">
                      <button
                        onClick={cancelUpdate}
                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateReviewer}
                        disabled={updatingReviewerLoading}
                        className={`px-4 py-2 rounded-md text-white ${
                          updatingReviewerLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                      >
                        {updatingReviewerLoading ? 'Updating...' : 'Update'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === 'registrations' && (
            <ViewRegistrations
              registrations={registrations}
              registrationFilters={registrationFilters}
              handleFilterChange={handleFilterChange}
              clearFilters={clearFilters}
              tracks={tracks}
              handleTrackChange={handleTrackChange}
              refreshData={refreshData}
              onDeleteSuccess={(deletedId) => {
                setRegistrations(prev => prev.filter(reg => reg.id !== deletedId));
              }}
              loading={loading}
            />
          )}

          {activeSection === 'assignments' && (
            <AssignReviewer
              registrations={registrations}
              reviewers={reviewers}
              onAssignmentComplete={refreshData}
            />
          )}

          {activeSection === 'analytics' && (
            <Analytics
              registrations={registrations}
              analyticsData={analyticsData}
            />
          )}

          {activeSection === 'reviewer-comments' && (
            <ReviewerComments
              registrations={registrations}
              refreshData={refreshData}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;
