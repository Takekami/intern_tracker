import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const FeedbackForm = ({ feedbacks, setFeedbacks, editingFeedback, setEditingFeedback }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    mentorId: '',
    internId: '',
    weekStart: '',
    comment: '',
    score: 3,
  });

  useEffect(() => {
    if (editingFeedback) {
      setFormData({
        mentorId: editingFeedback.mentorId,
        internId: editingFeedback.internId,
        weekStart: editingFeedback.weekStart?.slice(0,10) || '',
        comment: editingFeedback.comment,
        score: editingFeedback.score,
      });
    } else {
      setFormData({ mentorId: '', internId: '', weekStart: '', comment: '', score: 3 });
    }
  }, [editingFeedback]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFeedback) {
        const res = await axiosInstance.put(
          `/api/feedback/${editingFeedback._id}`,
          formData,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setFeedbacks(feedbacks.map(f => (f._id === res.data._id ? res.data : f)));
      } else {
        const res = await axiosInstance.post(
          '/api/feedback',
          formData,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setFeedbacks([...feedbacks, res.data]);
      }
      setEditingFeedback(null);
      setFormData({ mentorId: '', internId: '', weekStart: '', comment: '', score: 3 });
    } catch (err) {
      alert('Failed to save feedback.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded mb-6">
      <h1 className="text-2xl font-bold mb-4">
        {editingFeedback ? 'Edit Feedback' : 'Add Feedback'}
      </h1>

      <input
        type="text"
        placeholder="Mentor ID"
        value={formData.mentorId}
        onChange={(e) => setFormData({ ...formData, mentorId: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />

      <input
        type="text"
        placeholder="Intern ID"
        value={formData.internId}
        onChange={(e) => setFormData({ ...formData, internId: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />

      <input
        type="date"
        value={formData.weekStart}
        onChange={(e) => setFormData({ ...formData, weekStart: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />

      <textarea
        placeholder="Comment"
        value={formData.comment}
        onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
        rows={5}
      />

      <input
        type="number"
        min="1"
        max="5"
        value={formData.score}
        onChange={(e) => setFormData({ ...formData, score: Number(e.target.value) })}
        className="w-full mb-4 p-2 border rounded"
      />

      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
        {editingFeedback ? 'Update Feedback' : 'Add Feedback'}
      </button>
    </form>
  );
};

export default FeedbackForm;
