import axios from '../axiosConfig';

export default function FeedbackList({ feedbacks, setFeedbacks, setEditingFeedback }) {
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this feedback?')) return;
    try {
      await axios.delete(`/api/feedback/${id}`);
      setFeedbacks(feedbacks.filter((f) => f._id !== id));
    } catch (err) {
      alert('Failed to delete feedback.');
    }
  };

  const fmt = (d) => (d ? new Date(d).toLocaleDateString() : '—');

  return (
    <div className="bg-white p-6 shadow-md rounded">
      <h2 className="text-2xl font-bold mb-4">Feedback List</h2>

      {feedbacks.map((item) => {
        const taskLabel = item?.taskId?.title
          ? `Task: ${item.taskId.title}`
          : item?.taskId
            ? `Task: ${item.taskId}`
            : '—';

        const mentorLabel = item?.mentorId?.name || item?.mentorId?.email || '—';
        const internLabel = item?.internId?.name || item?.internId?.email || '—';

        return (
          <div key={item._id} className="border rounded p-4 mb-4">
            <div className="flex items-start justify-between">
              <div className="font-semibold">
                {(item?.taskId?.title || item?.taskId) ? `Task: ${item.taskId?.title || item.taskId}` : '—'}
                {' '}— Week: {fmt(item.weekStart)}
              </div>
              <div className="shrink-0 space-x-2">
                <button onClick={() => setEditingFeedback(item)} className="bg-gray-200 px-3 py-1 rounded">Edit</button>
                <button onClick={() => handleDelete(item._id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
              </div>
            </div>

            <div className="text-sm text-gray-500 mt-1">
              Mentor: {mentorLabel}{item?.internId ? <> · Intern: {internLabel}</> : null}
            </div>

            <div className="mt-3">{item.comment || '—'}</div>
            <div className="mt-1 text-sm">Score: {item.score ?? '—'}</div>
          </div>
        );
      })}

      {!feedbacks?.length && (
        <div className="text-gray-500">No feedback yet</div>
      )}
    </div>
  );
}



