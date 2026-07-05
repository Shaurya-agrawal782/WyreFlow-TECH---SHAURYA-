import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { listCandidates, deleteCandidate } from '../../api/candidate.api';

const CandidateList = () => {
  const { user } = useContext(AuthContext);
  
  // State for query options
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('');
  const [minExp, setMinExp] = useState('');
  const [maxExp, setMaxExp] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  // Data State
  const [candidates, setCandidates] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch candidates from API
  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        q: debouncedSearch || undefined,
        status: status || undefined,
        minExp: minExp !== '' ? minExp : undefined,
        maxExp: maxExp !== '' ? maxExp : undefined,
        sortBy,
        sortOrder,
        page,
        limit
      };

      const res = await listCandidates(params);
      setCandidates(res.data || []);
      setTotalRecords(res.totalRecords || 0);
      setTotalPages(res.totalPages || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading candidates list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [debouncedSearch, status, minExp, maxExp, sortBy, sortOrder, page]);

  // Handle deletion (Admin only)
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete candidate ${name}?`)) {
      try {
        await deleteCandidate(id);
        fetchCandidates(); // Refresh list
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete candidate.');
      }
    }
  };

  // Toggle sorting fields
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const isAdmin = user?.role === 'admin';
  const isRecruiter = user?.role === 'recruiter';
  const canWrite = isAdmin || isRecruiter;

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-slate-800">Candidates</h1>
          <p className="text-sm text-slate-500 font-body">Manage and review candidates profiles</p>
        </div>
        {canWrite && (
          <Link
            to="/candidates/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-md transition-all self-start"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create Candidate
          </Link>
        )}
      </div>

      {/* Filter panel */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Text Search */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-body">
              Search
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, skills..."
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-indigo-500 font-body text-sm"
            />
          </div>

          {/* Status filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-body">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-indigo-500 font-body text-sm"
            >
              <option value="">All Statuses</option>
              <option value="applied">Applied</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Experience Range */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-body">
              Min Experience (yrs)
            </label>
            <input
              type="number"
              value={minExp}
              onChange={(e) => { setMinExp(e.target.value); setPage(1); }}
              placeholder="e.g. 0"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-indigo-500 font-body text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-body">
              Max Experience (yrs)
            </label>
            <input
              type="number"
              value={maxExp}
              onChange={(e) => { setMaxExp(e.target.value); setPage(1); }}
              placeholder="e.g. 15"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-indigo-500 font-body text-sm"
            />
          </div>
        </div>

        {/* Filters reset */}
        {(search || status || minExp || maxExp) && (
          <button
            onClick={() => {
              setSearch('');
              setStatus('');
              setMinExp('');
              setMaxExp('');
              setPage(1);
            }}
            className="text-xs font-medium text-red-500 hover:text-red-700 flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">clear_all</span>
            Reset Filters
          </button>
        )}
      </div>

      {/* Candidates Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 space-y-4 animate-pulse">
            <div className="h-8 bg-slate-100 rounded"></div>
            <div className="h-8 bg-slate-100 rounded"></div>
            <div className="h-8 bg-slate-100 rounded"></div>
            <div className="h-8 bg-slate-100 rounded"></div>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-500 space-y-2">
            <span className="material-symbols-outlined text-4xl">warning</span>
            <p className="text-sm">{error}</p>
          </div>
        ) : candidates.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <span className="material-symbols-outlined text-4xl">person_search</span>
            <p className="text-sm">No matching candidate records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th
                    onClick={() => handleSort('name')}
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-all"
                  >
                    <div className="flex items-center gap-1">
                      Name
                      {sortBy === 'name' && (
                        <span className="material-symbols-outlined text-xs">
                          {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th
                    onClick={() => handleSort('experience')}
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-all"
                  >
                    <div className="flex items-center gap-1">
                      Experience
                      {sortBy === 'experience' && (
                        <span className="material-symbols-outlined text-xs">
                          {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Skills
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {candidates.map((candidate) => (
                  <tr key={candidate._id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">
                      {candidate.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-body">
                      {candidate.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-body">
                      {candidate.experience} yrs
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">
                      {candidate.skills && candidate.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {candidate.skills.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-body capitalize"
                            >
                              {skill}
                            </span>
                          ))}
                          {candidate.skills.length > 3 && (
                            <span className="text-xs text-slate-400 font-body">
                              +{candidate.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-300 font-body italic">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                          candidate.status === 'hired'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : candidate.status === 'rejected'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : candidate.status === 'shortlisted'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {candidate.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <Link
                        to={`/candidates/${candidate._id}`}
                        className="text-indigo-600 hover:text-indigo-900 inline-flex items-center gap-0.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        View
                      </Link>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(candidate._id, candidate.name)}
                          className="text-red-600 hover:text-red-900 inline-flex items-center gap-0.5"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination component */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg transition-all"
          >
            Previous
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${
                  page === p
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg transition-all"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CandidateList;
