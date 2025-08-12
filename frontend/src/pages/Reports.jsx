import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const ProgressBar = ({ value }) => (
  <div className="w-40 bg-gray-200 rounded-full h-3">
    <div className="h-3 rounded-full" style={{ width: `${value}%` }} />
    <div className="text-sm mt-1">{value}%</div>
  </div>
);

export default function Reports() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=> {
    if (!user?.token) return;

    (async () => {
      try {
        const { data } = await api.get('/api/reports', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setRows(data);
      } catch (e) {
        console.error(e);
        alert(`Failed to load reports (${e?.response?.status ?? 'no status'})`);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) return <div className="p-4">Loading…</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Performance Reports</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">Intern</th>
              <th className="p-2">Progress</th>
              <th className="p-2">Avg Score</th>
              <th className="p-2">Last Feedback</th>
              <th className="p-2">Final Comment</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.intern.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{r.intern.name || '-'}</td>
                <td className="p-2"><ProgressBar value={r.progress} /></td>
                <td className="p-2">{r.avgScore ?? '-'}</td>
                <td className="p-2">{r.lastFeedbackAt ? new Date(r.lastFeedbackAt).toLocaleDateString() : '-'}</td>
                <td className="p-2 truncate max-w-[260px]" title={r.finalComment}>{r.finalComment}</td>
                <td className="p-2">
                  <Link className="text-blue-600 underline" to={`/reports/${r.intern.id}`}>View</Link>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td className="p-2 text-gray-500" colSpan={6}>No interns found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
