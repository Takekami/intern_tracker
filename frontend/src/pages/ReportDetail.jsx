import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

export default function ReportDetail() {
  const { internId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [finalComment, setFinalComment] = useState('');
  const [saving, setSaving] = useState(false);
  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : '-');

  useEffect(() => {
    if (!user?.token) return;

    (async () => {
      try {
        const res = await api.get(`/api/reports/${internId}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setData(res.data);
        setFinalComment(res.data.intern.finalComment || '');
      } catch (e) {
        console.error(e);
        alert(`Failed to load report (${e?.response?.status ?? 'no status'})`);
        navigate('/reports');
      }
    })();
  }, [internId, navigate, user]);

  const onSave = async () => {
    try {
      setSaving(true);
      await api.put(
        `/api/reports/${internId}/final-comment`,
        { finalComment },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert('Saved');
    } catch (e) {
      console.error(e);
      alert(`Failed to save (${e?.response?.status ?? 'no status'})`);
    } finally {
      setSaving(false);
    }
  };

  if (!data) return <div className="p-4">Loading…</div>;

  return (
    <div className="p-4 space-y-6">
      <button className="text-blue-600 underline" onClick={() => navigate('/reports')}>
        ← Back
      </button>

      <div>
        <h2 className="text-xl font-semibold">{data.intern.name} — Performance</h2>
        <div className="mt-2 text-sm">
          Progress: <b>{data.progress}%</b>
        </div>
        <div className="text-sm">
          Avg Score: <b>{data.avgScore ?? '-'}</b>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Feedback History</h3>
        <ul className="space-y-3">
          {data.feedbacks?.length ? (
            data.feedbacks.map((fb) => (
              <li key={fb._id} className="border p-3 rounded">
                <div className="flex justify-between text-sm">
                  <div>
                    <b>Week of {fmtDate(fb.weekStart)}</b> — Score: {fb.score ?? '-'}
                  </div>
                  <div className="text-gray-500">
                    {fmtDate(fb.submittedAt || fb.createdAt)}
                  </div>
                </div>
                <div className="whitespace-pre-wrap mt-2 text-sm">{fb.comment}</div>
              </li>
            ))
          ) : (
            <li className="text-gray-500 text-sm">No feedback yet.</li>
          )}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Final Comment</h3>
        <textarea
          className="w-full border rounded p-2 min-h-[120px]"
          value={finalComment}
          onChange={(e) => setFinalComment(e.target.value)}
          placeholder="Enter final comment…"
        />
        <button
          onClick={onSave}
          disabled={saving}
          className="mt-2 px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}
