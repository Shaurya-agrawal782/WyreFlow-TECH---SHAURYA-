import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getCandidateById, updateCandidate, deleteCandidate } from '../../api/candidate.api';

const CandidateDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  const fetchCandidate = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCandidateById(id);
      setCandidate(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Candidate not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidate();
  }, [id]);

  // Handle status update
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      setUpdating(true);
      await updateCandidate(id, { status: newStatus });
      setCandidate({ ...candidate, status: newStatus });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update candidate status.');
    } finally {
      setUpdating(false);
    }
  };

  // Handle deletion (Admin only)
  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete candidate ${candidate?.name}?`)) {
      try {
        await deleteCandidate(id);
        navigate('/candidates');
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete candidate.');
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-200 rounded-md"></div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 h-64"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <span className="material-symbols-outlined text-red-500 text-5xl">warning</span>
        <h2 className="text-xl font-bold font-headline text-slate-800">Error</h2>
        <p className="text-slate-600 font-body">{error}</p>
        <Link to="/candidates" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
          Return to Candidates list
        </Link>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';
  const isRecruiter = user?.role === 'recruiter';
  const canUpdate = isAdmin || isRecruiter;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top bar with routing */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/candidates" className="text-slate-500 hover:text-slate-700 flex items-center">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-headline text-slate-800">{candidate?.name}</h1>
            <p className="text-sm text-slate-500 font-body">Candidate details page</p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={handleDelete}
            className="px-4 py-2 border border-red-200 hover:bg-red-50 text-red-600 text-sm font-semibold rounded-lg transition-all inline-flex items-center gap-1 self-start"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
            Delete Candidate
          </button>
        )}
      </div>

      {/* Main detail card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Details (Left 2 columns) */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-headline font-bold text-slate-800 text-lg border-b border-slate-100 pb-3">
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-body">
                  Email Address
                </p>
                <p className="text-sm font-semibold text-slate-700 mt-1 font-body">
                  {candidate?.email}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-body">
                  Phone Number
                </p>
                <p className="text-sm font-semibold text-slate-700 mt-1 font-body">
                  {candidate?.phone || <span className="text-slate-300 italic font-normal">Not Provided</span>}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-body">
                  Years of Experience
                </p>
                <p className="text-sm font-semibold text-slate-700 mt-1 font-body">
                  {candidate?.experience !== undefined ? `${candidate.experience} years` : <span className="text-slate-300 italic font-normal">Not Provided</span>}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-body">
                  Resume
                </p>
                {candidate?.resumeUrl ? (
                  <a
                    href={candidate.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 mt-1"
                  >
                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                    View Resume File
                  </a>
                ) : (
                  <p className="text-sm text-slate-300 italic mt-1 font-body">No attachment</p>
                )}
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-body">
                Candidate Skills
              </p>
              {candidate?.skills && candidate.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {candidate.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-150 text-xs font-semibold capitalize font-body"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-300 italic font-body">None specified</p>
              )}
            </div>
          </div>
          
          {/* Metadata details */}
          <div className="bg-slate-100 p-6 rounded-xl border border-slate-200/60 text-xs text-slate-500 space-y-2 font-body">
            <p>
              <strong>Profile Created:</strong> {new Date(candidate?.createdAt).toLocaleString()}
            </p>
            <p>
              <strong>Profile Last Updated:</strong> {new Date(candidate?.updatedAt).toLocaleString()}
            </p>
            <p>
              <strong>Registered By:</strong> {candidate?.createdBy?.name} ({candidate?.createdBy?.role})
            </p>
          </div>
        </div>

        {/* Application Status (Right Column) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 h-fit">
          <h3 className="font-headline font-bold text-slate-800 text-lg border-b border-slate-100 pb-3">
            Hiring Workflow
          </h3>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-body">
                Current Status
              </p>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${
                    candidate?.status === 'hired'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : candidate?.status === 'rejected'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : candidate?.status === 'shortlisted'
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}
                >
                  {candidate?.status}
                </span>
                {updating && <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>}
              </div>
            </div>

            {canUpdate && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-body">
                  Update Status
                </label>
                <select
                  value={candidate?.status}
                  onChange={handleStatusChange}
                  disabled={updating}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-indigo-500 font-body text-sm bg-white"
                >
                  <option value="applied">Applied</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="hired">Hired</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetail;
