import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const TaskList = ({ tasks, setTasks, setEditingTask }) => {
  const { user } = useAuth();

  const handleDelete = async (taskId) => {
    try {
      await axiosInstance.delete(`/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setTasks(tasks.filter((task) => task._id !== taskId));
    } catch (error) {
      alert('Failed to delete task.');
    }
  };

  return (
    <div>
      {tasks.map((task) => (
        <div key={task._id} className="bg-gray-100 p-4 mb-4 rounded shadow">
          <h2 className="font-bold">{task.title}</h2>
          <p>{task.description}</p>
          <p className="text-sm text-gray-500">Deadline: {new Date(task.deadline).toLocaleDateString()}</p>
          {/* add task status update button */}
          <select
            value={task.status}
            onChange={async (e) => {
              try {
                const res = await axiosInstance.patch(`/api/tasks/${task._id}/status`, { status: e.target.value }, {
                  headers: { Authorization: `Bearer ${user.token}` },
                });
                setTasks(tasks.map((t) => (t._id === task._id ? res.data : t)));
              } catch (error) {
                alert('Failed to update status.');
              }
            }}
            className="mt-2 px-2 py-1 border rounded"
          >
            <option value="To Do">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
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
        </div>
      ))}
    </div>
  );
};

export default TaskList;
