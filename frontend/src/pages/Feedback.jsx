import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import FeedbackForm from '../components/FeedbackForm';
import FeedbackList from '../components/FeedbackList';
import { useAuth } from '../context/AuthContext';

const Feedback = () => {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [editingFeedback, setEditingFeedback] = useState(null);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await axiosInstance.get('/api/feedback', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setFeedbacks(res.data);
      } catch (err) {
        alert('Failed to fetch feedback.');
      }
    };
    fetchFeedbacks();
  }, [user]);

  return (
    <div className="container mx-auto p-6">
      <FeedbackForm
        feedbacks={feedbacks}
        setFeedbacks={setFeedbacks}
        editingFeedback={editingFeedback}
        setEditingFeedback={setEditingFeedback}
      />
      <FeedbackList
        feedbacks={feedbacks}
        setFeedbacks={setFeedbacks}
        setEditingFeedback={setEditingFeedback}
      />
    </div>
  );
};

export default Feedback;
