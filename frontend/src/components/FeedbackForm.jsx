import { useEffect, useState } from 'react';
import axios from '../axiosConfig';

export default function FeedbackForm({ feedbacks, setFeedbacks, editingFeedback, setEditingFeedback }) {
  const [tasks, setTasks] = useState([]);

  const [form, setForm] = useState({
    taskId: '',
    internId: '',
    weekStart: '',
    comment: '',
    score: 3,
  });

  useEffect(() => {
    // For mentor （GET /api/tasks: mentor/intern）
    axios.get('/api/tasks').then(r => setTasks(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (editingFeedback) {
      setForm({
        taskId: editingFeedback.taskId?._id || editingFeedback.taskId || '',
        internId: editingFeedback.internId?._id || editingFeedback.internId || '',
        weekStart: (editingFeedback.weekStart || '').slice(0, 10),
        comment: editingFeedback.comment || '',
        score: editingFeedback.score ?? 3,
      });
    } else {
      setForm({ taskId: '', internId: '', weekStart: '', comment: '', score: 3 });
    }
  }, [editingFeedback]);

  const onChangeTask = (e) => {
    const tid = e.target.value;
    const t = tasks.find(x => String(x._id) === String(tid));
    const autoIntern = t?.assignee?._id || t?.assignee || '';
    setForm(f => ({ ...f, taskId: tid, internId: autoIntern || f.internId }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(
      Object.entries(form).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
    );
    // mentorId is retrieved from server

    if (editingFeedback) {
      const { data } = await axios.put(`/api/feedback/${editingFeedback._id}`, payload);
      setFeedbacks(feedbacks.map(f => (f._id === data._id ? data : f)));
    } else {
      const { data } = await axios.post('/api/feedback', payload);
      setFeedbacks([...feedbacks, data]);
    }
    setEditingFeedback(null);
    setForm({ taskId: '', internId: '', weekStart: '', comment: '', score: 3 });
  };

  return (
    <form onSubmit={submit} className="bg-white p-6 shadow-md rounded mb-6">
      <h1 className="text-2xl font-bold mb-4">{editingFeedback ? 'Edit Feedback' : 'Add Feedback'}</h1>

      {/* Select Task */}
      <select
        value={form.taskId}
        onChange={onChangeTask}
        className="w-full mb-4 p-2 border rounded"
      >
        <option value="">Select Task</option>
        {tasks.map(t => (
          <option key={t._id} value={t._id}>{t.title}</option>
        ))}
      </select>

      {/* Intern ID */}
      <input
        type="text"
        placeholder="Intern ID (auto-filled from task if selected)"
        value={form.internId}
        onChange={(e) => setForm({ ...form, internId: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />

      <input
        type="date"
        value={form.weekStart}
        onChange={(e) => setForm({ ...form, weekStart: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />

      <textarea
        placeholder="Comment"
        value={form.comment}
        onChange={(e) => setForm({ ...form, comment: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
        rows={5}
      />

      <input
        type="number"
        min="1"
        max="5"
        value={form.score}
        onChange={(e) => setForm({ ...form, score: Number(e.target.value) })}
        className="w-full mb-4 p-2 border rounded"
      />

      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
        {editingFeedback ? 'Update Feedback' : 'Add Feedback'}
      </button>
    </form>
  );
}
