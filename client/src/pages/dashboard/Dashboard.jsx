import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { listCandidates } from '../../api/candidate.api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    importedToday: 0,
    applied: 0,
    shortlisted: 0,
    rejected: 0,
    hired: 0,
    recent: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch candidates list (request large limit to calculate breakdown stats)
        const res = await listCandidates({ limit: 1000 });
        const data = res.data || [];

        setCandidates(data);

        // Compute metrics
        const total = res.totalRecords || data.length;
        
        // Count statuses
        let applied = 0;
        let shortlisted = 0;
        let rejected = 0;
        let hired = 0;
        let importedToday = 0;

        const todayStr = new Date().toDateString();

        data.forEach((c) => {
          if (c.status === 'applied') applied++;
          else if (c.status === 'shortlisted') shortlisted++;
          else if (c.status === 'rejected') rejected++;
          else if (c.status === 'hired') hired++;

          if (c.createdAt) {
            const createdDate = new Date(c.createdAt).toDateString();
            if (createdDate === todayStr) {
              importedToday++;
            }
          }
        });

        // Get recently updated candidates (sorted by updatedAt desc)
        const sortedByUpdated = [...data].sort(
          (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
        );
        const recent = sortedByUpdated.slice(0, 5);

        setMetrics({
          total,
          importedToday,
          applied,
          shortlisted,
          rejected,
          hired,
          recent,
        });
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-slate-200 rounded-md"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="h-28 bg-slate-200 rounded-xl"></div>
          <div className="h-28 bg-slate-200 rounded-xl"></div>
          <div className="h-28 bg-slate-200 rounded-xl"></div>
          <div className="h-28 bg-slate-200 rounded-xl"></div>
        </div>
        <div className="h-64 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold font-headline text-slate-800">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-sm text-slate-500 capitalize">
          Overview of the system as an {user?.role}
        </p>
      </div>

      {/* Admin metrics dashboard */}
      {isAdmin ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">people</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-body">
                Total Candidates
              </p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1 font-headline">
                {metrics.total}
              </h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">upload_file</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-body">
                Imported Today
              </p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1 font-headline">
                {metrics.importedToday}
              </h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">gpp_bad</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-body">
                Failed Imports
              </p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1 font-headline">
                0
              </h3>
            </div>
          </div>
        </div>
      ) : (
        /* Recruiter Metrics Dashboard */
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-body">
              Candidates Count
            </p>
            <h3 className="text-3xl font-bold text-slate-800 mt-2 font-headline">
              {metrics.total}
            </h3>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-body">
              Applied
            </p>
            <h3 className="text-2xl font-bold text-blue-600 mt-2 font-headline">
              {metrics.applied}
            </h3>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-body">
              Shortlisted
            </p>
            <h3 className="text-2xl font-bold text-indigo-600 mt-2 font-headline">
              {metrics.shortlisted}
            </h3>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-body">
              Hired
            </p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-2 font-headline">
              {metrics.hired}
            </h3>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-body">
              Rejected
            </p>
            <h3 className="text-2xl font-bold text-red-600 mt-2 font-headline">
              {metrics.rejected}
            </h3>
          </div>
        </div>
      )}

      {/* Recent Activity Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-headline font-bold text-slate-800 text-lg">
            Recently Updated Candidates
          </h3>
        </div>

        {metrics.recent.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <span className="material-symbols-outlined text-4xl">person_search</span>
            <p className="text-sm">No candidate records found in database.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {metrics.recent.map((candidate) => (
              <div
                key={candidate._id}
                className="p-6 flex items-center justify-between hover:bg-slate-50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm">
                    {candidate.name[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">
                      {candidate.name}
                    </h4>
                    <p className="text-xs text-slate-400 font-body">
                      {candidate.email} &bull; {candidate.experience} yrs exp
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
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
                  <a
                    href={`/candidates/${candidate._id}`}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    View details
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
