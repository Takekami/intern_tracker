import { useEffect, useMemo, useState } from 'react';
import axios from '../axiosConfig';

const dedupeById = (arr = []) =>
  Array.from(new Map(arr.map((x) => [x._id, x])).values());

const normalizeStatus = (status, completed) => {
  if (typeof status === 'string') {
    const s = status.toLowerCase().trim();
    if (s.startsWith('to')) return 'To Do';
    if (s.startsWith('in')) return 'In Progress';
    if (s.startsWith('comp')) return 'Completed';
  }
  if (completed === true) return 'Completed';
  return 'To Do';
};


export default function Reports() {
  const [tasks, setTasks] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [{ data: t }, { data: f }] = await Promise.all([
          axios.get('/api/tasks'),
          axios.get('/api/feedback'),
        ]);
        setTasks(dedupeById(t || []));
        setFeedbacks(f || []);
      } catch (e) {
        alert(e?.response?.data?.message || 'Failed to load reports data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const latestFbByTask = useMemo(() => {
    const m = new Map();
    for (const fb of feedbacks || []) {
      const key = fb?.taskId?._id || fb?.taskId;
      if (!key) continue;
      const prev = m.get(String(key));
      const prevTime = prev ? new Date(prev.weekStart || prev.createdAt || 0).getTime() : -1;
      const curTime = new Date(fb.weekStart || fb.createdAt || 0).getTime();
      if (!prev || curTime > prevTime) m.set(String(key), fb);
    }
    return m;
  }, [feedbacks]);


  const rows = useMemo(() => {
    return (tasks || []).map((t) => {
      const status = normalizeStatus(t.status, t.completed);
      const latestFb = latestFbByTask.get(String(t._id));
      return {
        id: t._id,
        title: t.title,
        assignee: t.assignee?.name || t.assignee?.email || '—',
        status,
        due: t.deadline ? new Date(t.deadline).toLocaleDateString() : '—',
        latestComment: latestFb?.comment || '—',
        latestScore: latestFb?.score ?? '—',
      };
    });
  }, [tasks, latestFbByTask]);

  const counts = useMemo(() => {
    const c = { 'To Do': 0, 'In Progress': 0, 'Completed': 0 };
    for (const r of rows) c[r.status] = (c[r.status] || 0) + 1;
    return c;
  }, [rows]);

  const total = rows.length;
  const donePct = total ? Math.round((counts['Completed'] / total) * 100) : 0;
  const workPct = total ? 100 - donePct : 0;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Dashboard (Reports)</h1>
      <div className="text-gray-600 mb-3">
        To Do: {counts['To Do'] ?? 0} / In Progress: {counts['In Progress'] ?? 0} / Completed: {counts['Completed'] ?? 0}
      </div>

      {/* progress bar */}
      <div className="w-full h-6 bg-gray-300 rounded overflow-hidden mb-6">
        <div className="h-6 bg-gray-400 inline-block align-top" style={{ width: `${workPct}%` }} />
        <div className="h-6 bg-blue-500 inline-block align-top" style={{ width: `${donePct}%` }} />
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-3">Task</th>
                <th className="text-left p-3">Assignee</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Due</th>
                <th className="text-left p-3">Latest Feedback</th>
                <th className="text-left p-3">Score</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">{r.title}</td>
                  <td className="p-3">{r.assignee}</td>
                  <td className="p-3">{r.status}</td>
                  <td className="p-3">{r.due}</td>
                  <td className="p-3">{r.latestComment}</td>
                  <td className="p-3">{r.latestScore}</td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td colSpan={6} className="p-4 text-gray-500">No data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}