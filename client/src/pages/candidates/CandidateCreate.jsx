import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createCandidate } from '../../api/candidate.api';

const CandidateCreate = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [status, setStatus] = useState('applied');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !email) {
      setError('Name and Email fields are required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Construct payload conforming to backend Candidate schema
      const payload = {
        name,
        email,
        phone: phone || undefined,
        experience: experience !== '' ? Number(experience) : undefined,
        skills: skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        resumeUrl: resumeUrl || undefined,
        status
      };

      await createCandidate(payload);
      navigate('/candidates');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create candidate profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center gap-4">
        <Link to="/candidates" className="text-slate-500 hover:text-slate-700 flex items-center">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-headline text-slate-800">Add Candidate</h1>
          <p className="text-sm text-slate-500 font-body">Create a new candidate profile</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
        {error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-lg p-4 mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-lg">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-body">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-indigo-500 font-body text-sm"
                required
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-body">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. john@example.com"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-indigo-500 font-body text-sm"
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-body">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +1 234 567 8900"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-indigo-500 font-body text-sm"
              />
            </div>

            {/* Years of Experience */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-body">
                Years of Experience
              </label>
              <input
                type="number"
                min="0"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="e.g. 5"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-indigo-500 font-body text-sm"
              />
            </div>
          </div>

          {/* Skills tags (CSV input) */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-body">
              Skills (Comma-separated)
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. React, Node.js, MongoDB, TypeScript"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-indigo-500 font-body text-sm"
            />
          </div>

          {/* Resume Link */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-body">
              Resume Link (URL)
            </label>
            <input
              type="url"
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              placeholder="e.g. https://drive.google.com/resume.pdf"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-indigo-500 font-body text-sm"
            />
          </div>

          {/* Initial Candidate Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-body">
              Initial Application Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-indigo-500 font-body text-sm"
            >
              <option value="applied">Applied</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="rejected">Rejected</option>
              <option value="hired">Hired</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-4 border-t border-slate-100 pt-6">
            <Link
              to="/candidates"
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold rounded-lg transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white text-sm font-semibold rounded-lg shadow-md transition-all flex items-center gap-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CandidateCreate;
