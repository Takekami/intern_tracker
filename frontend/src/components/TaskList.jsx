import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const TaskList = ({ tasks, setTasks, setEditingTask, readOnly = false, canUpdateStatus = false }) => {
  const { user } = useAuth();

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await axiosInstance.delete(`/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setTasks(tasks.filter((task) => task._id !== taskId));
    } catch (error) {
      alert('Failed to delete task.');
    }
  };

  const handleStatusChange = async (task, next) => {
    try {
      const res = await axiosInstance.patch(
        `/api/tasks/${task._id}/status`,
        { status: next },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setTasks(tasks.map((t) => (t._id === task._id ? res.data : t)));
    } catch (error) {
      alert('Failed to update status.');
    }
  };

  return (
    <div>
      {tasks.map((task) => (
        <div key={task._id} className="bg-gray-100 p-4 mb-4 rounded shadow">
          <h2 className="font-bold">{task.title}</h2>
          <p>{task.description}</p>
          {task.deadline && (
            <p className="text-sm text-gray-500">
              Deadline: {new Date(task.deadline).toLocaleDateString()}
            </p>
          )}
          <p className="mt-1 text-sm">Status: {task.status || 'Pending'}</p>

          {/* Update status：Intern（canUpdateStatus）and mentor */}
          {(canUpdateStatus || user?.role === 'mentor') && (
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(task, e.target.value)}
              className="mt-2 px-2 py-1 border rounded"
            >
              <option value="To Do">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          )}

          {/* edit/delete：only mentor */}
          {!readOnly && (
            <div className="mt-2">
              <button
                onClick={() => setEditingTask(task)}
                className="mr-2 bg-yellow-500 text-white px-4 py-2 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(task._id)}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TaskList;