import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const FeedbackList = ({ feedbacks, setFeedbacks, setEditingFeedback }) => {
  const { user } = useAuth();

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this feedback?')) return;
    try {
      await axiosInstance.delete(`/api/feedback/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setFeedbacks(feedbacks.filter((f) => f._id !== id));
    } catch (err) {
      alert('Failed to delete.');
    }
  };

  return (
    <div className="bg-white p-6 shadow-md rounded">
      <h2 className="text-xl font-semibold mb-4">Feedback List</h2>
      {feedbacks.length === 0 && <p className="text-gray-500">No feedback yet.</p>}
      <ul className="space-y-3">
        {feedbacks.map((f) => (
          <li key={f._id} className="border p-3 rounded">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">
                  {f.internId} — Week: {new Date(f.weekStart).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">Mentor: {f.mentorId}</p>
                <p className="mt-2">{f.comment}</p>
                <p className="mt-1 text-sm">Score: {f.score}</p>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 text-sm bg-gray-200 rounded"
                  onClick={() => setEditingFeedback(f)}
                >
                  Edit
                </button>
                <button
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded"
                  onClick={() => handleDelete(f._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FeedbackList;
