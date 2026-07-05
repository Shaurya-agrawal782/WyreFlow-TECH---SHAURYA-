import React, { useState } from 'react';
import { importCSV } from '../../api/import.api';

const CSVImport = () => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;
    const name = selectedFile.name.toLowerCase();
    if (!name.endsWith('.csv')) {
      setError('Invalid file format. Please upload a CSV (.csv) file.');
      setFile(null);
      return false;
    }
    setError(null);
    return true;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        setSummary(null);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        setSummary(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      setProgress(0);

      const result = await importCSV(file, (percent) => {
        setProgress(percent);
      });

      setSummary(result);
      setFile(null); // Clear selected file after upload
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing CSV import bulk upload.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold font-headline text-slate-800">CSV Bulk Import</h1>
        <p className="text-sm text-slate-500 font-body">Upload and parse a CSV file of candidates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Drag & Drop Upload Zone (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            
            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 text-red-700 text-sm rounded-lg p-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-lg">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Drag & Drop Card */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center space-y-4 transition-all ${
                dragActive ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-350 hover:bg-slate-50/50'
              }`}
            >
              <span className="material-symbols-outlined text-5xl text-slate-400">upload_file</span>
              
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-700">
                  {file ? file.name : 'Drag and drop your CSV file here'}
                </p>
                <p className="text-xs text-slate-400 font-body">
                  {file ? `${(file.size / 1024).toFixed(2)} KB` : 'Only CSV (.csv) file formats are accepted'}
                </p>
              </div>

              {!uploading && (
                <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all bg-white">
                  Browse Files
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Progress bar */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>Uploading file...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            {file && !uploading && (
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setFile(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold rounded-lg transition-all"
                >
                  Clear Selection
                </button>
                <button
                  onClick={handleUpload}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-md transition-all inline-flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">publish</span>
                  Import Candidates
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CSV Format Specifications (Right column) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 h-fit">
          <h3 className="font-headline font-bold text-slate-800 text-base border-b border-slate-100 pb-3">
            Expected Format Specs
          </h3>
          <p className="text-xs text-slate-500 font-body leading-relaxed">
            The CSV file must contain a header row. Ensure columns are exactly named as follows:
          </p>
          <ul className="text-xs text-slate-600 space-y-2 font-body list-disc pl-4">
            <li>
              <strong>name</strong> <span className="text-red-500">*</span>: Candidate full name
            </li>
            <li>
              <strong>email</strong> <span className="text-red-500">*</span>: Unique lowercase email address
            </li>
            <li>
              <strong>phone</strong>: Candidate contact number
            </li>
            <li>
              <strong>experience</strong>: Number value (minimum 0)
            </li>
            <li>
              <strong>skills</strong>: Pipe-separated values e.g. <code>React|Node|Express</code>
            </li>
          </ul>
        </div>
      </div>

      {/* Summary Report & Detailed Failure Tables */}
      {summary && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <h3 className="font-headline font-bold text-slate-800 text-lg border-b border-slate-100 pb-3">
            Import Summary Report
          </h3>
          
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-body">Total Rows</p>
              <h4 className="text-2xl font-bold text-slate-800 mt-1 font-headline">{summary.totalRows}</h4>
            </div>
            <div className="bg-emerald-50/55 p-4 rounded-xl border border-emerald-100">
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider font-body">Success</p>
              <h4 className="text-2xl font-bold text-emerald-700 mt-1 font-headline">{summary.successCount}</h4>
            </div>
            <div className="bg-red-50/55 p-4 rounded-xl border border-red-100">
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wider font-body">Failed</p>
              <h4 className="text-2xl font-bold text-red-700 mt-1 font-headline">{summary.failedCount}</h4>
            </div>
          </div>

          {/* Failure description details table */}
          {summary.failedRows && summary.failedRows.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-headline font-bold text-slate-800 text-sm">Failed Row Details</h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">
                        Row No.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Validation Failure Reason
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200 font-body text-sm">
                    {summary.failedRows.map((fail, index) => (
                      <tr key={index} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-semibold font-body">
                          {fail.row}
                        </td>
                        <td className="px-6 py-4 text-red-600 font-body">
                          {fail.reason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CSVImport;
