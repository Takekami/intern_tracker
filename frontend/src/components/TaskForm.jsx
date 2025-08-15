import { useEffect, useState } from 'react';
import axios from '../axiosConfig';

export default function TaskForm({ tasks, setTasks, editingTask, setEditingTask }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    assignee: '',
  });
  const [interns, setInterns] = useState([]);

  // populate form when editing
  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title || '',
        description: editingTask.description || '',
        deadline: editingTask.deadline ? editingTask.deadline.slice(0, 10) : '',
        assignee: editingTask.assignee?._id || editingTask.assignee || '',
      });
    } else {
      setFormData({ title: '', description: '', deadline: '', assignee: '' });
    }
  }, [editingTask]);

  // get interns for select options
  useEffect(() => {
    axios.get('/api/auth/interns')
      .then(res => setInterns(res.data || []))
      .catch(() => setInterns([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(
      Object.entries(formData).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    );

    if (editingTask) {
      const { data } = await axios.put(`/api/tasks/${editingTask._id}`, payload);
      setTasks(tasks.map((t) => (t._id === data._id ? data : t)));
      setEditingTask(null);
    } else {
      const { data } = await axios.post('/api/tasks', payload);
      setTasks([...(tasks || []), data]);
    }

    setFormData({ title: '', description: '', deadline: '', assignee: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded mb-6">
      <h1 className="text-2xl font-bold mb-4">{editingTask ? 'Edit Intern Task' : 'Add Intern Task'}</h1>

      <input
        type="text"
        placeholder="Intern Task Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />

      <textarea
        placeholder="Intern Task Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
        rows={4}
      />

      <input
        type="date"
        value={formData.deadline}
        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />

      {/* select intern */}
      <select
        value={formData.assignee}
        onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      >
        <option value="">Assign Intern</option>
        {interns.map((u) => (
          <option key={u._id} value={u._id}>
            {u.name || u.email}
          </option>
        ))}
      </select>

      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
        {editingTask ? 'Update Task' : 'Add Intern Task'}
      </button>
    </form>
  );
}
