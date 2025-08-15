import axios from '../axiosConfig';
import { useMemo } from 'react';

export default function TaskList({
  tasks,
  setTasks,
  setEditingTask,
  canEdit = false,
  canDelete = false,
  canUpdateStatus = false,
}) {
  const rows = useMemo(() => tasks || [], [tasks]);

  const fmt = (d) => (d ? new Date(d).toLocaleDateString() : '—');

  const applyReplace = (updated) =>
    setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await axios.delete(`/api/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to delete');
    }
  };

  const handleStatus = async (id, status) => {
    try {
      const { data } = await axios.patch(`/api/tasks/${id}/status`, { status });
      applyReplace(data);
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to update status');
    }
  };

  const normalized = (t) =>
    t.status || (t.completed ? 'Completed' : 'To Do');

  return (
    <div>
      {rows.map((t) => (
        <div key={t._id} className="bg-gray-50 rounded p-4 mb-4 border">
          <div className="font-semibold text-lg">{t.title}</div>
          <div className="text-sm text-gray-600 mb-1">{t.description || '—'}</div>
          <div className="text-sm text-blue-700">
            Deadline: {fmt(t.deadline)}
          </div>

          <div className="mt-2 flex items-center gap-3">
            <span>Status:</span>
            {canUpdateStatus ? (
              <select
                value={normalized(t)}
                onChange={(e) => handleStatus(t._id, e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option>To Do</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            ) : (
              <span className="font-medium">{normalized(t)}</span>
            )}
          </div>

          <div className="mt-3 flex gap-2">
            {canEdit && (
              <button
                onClick={() => setEditingTask(t)}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => handleDelete(t._id)}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
      {!rows.length && (
        <div className="text-gray-500">No tasks yet</div>
      )}
    </div>
  );
}
