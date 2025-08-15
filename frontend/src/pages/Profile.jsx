import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../axiosConfig';

export default function Profile() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ name: '', password: '' });
  const [me, setMe] = useState(null);

  useEffect(() => {
    axios.get('/api/auth/profile').then(({ data }) => {
      setMe(data);
      setForm({ name: data.name || '', password: '' });
    });
  }, []);

  const save = async (e) => {
    e.preventDefault();
    const payload = {};
    if (form.name !== '') payload.name = form.name;
    if (form.password !== '') payload.password = form.password;

    const { data } = await axios.put('/api/auth/profile', payload);
    login({ token: localStorage.getItem('token'), user: { ...user, ...data } });
    alert('Saved');
  };

  if (!me) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="mb-2 text-sm text-gray-600">Email: {me.email}</div>
      <div className="mb-4 text-sm text-gray-600">Role: {me.role}</div>

      <form onSubmit={save}>
        <input
          className="w-full mb-3 p-2 border rounded"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Name"
        />
        <input
          type="password"
          className="w-full mb-3 p-2 border rounded"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="New Password (optional)"
        />
        <button className="w-full bg-blue-600 text-white p-2 rounded">Save</button>
      </form>
    </div>
  );
}