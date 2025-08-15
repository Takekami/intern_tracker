import { useState, useEffect, useMemo } from 'react';
import axios from '../axiosConfig';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import { useAuth } from '../context/AuthContext';

const dedupeById = (arr = []) =>
  Array.from(new Map(arr.map((t) => [t._id, t])).values());

export default function Tasks() {
  const { user } = useAuth();
  const role = user?.user?.role || user?.role;
  const isMentor = role === 'mentor';

  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get('/api/tasks');
        setTasks(dedupeById(data || []));
      } catch (e) {
        alert(e?.response?.data?.message || 'Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  // Not have duplicate tasks
  const upsertTask = (item) =>
    setTasks((prev) => {
      const map = new Map(prev.map((t) => [t._id, t]));
      map.set(item._id, item);
      return Array.from(map.values());
    });

  return (
    <div className="container mx-auto p-6">
      {isMentor && (
        <TaskForm
          tasks={tasks}
          setTasks={setTasks}
          editingTask={editingTask}
          setEditingTask={setEditingTask}
          onSaved={upsertTask}
        />
      )}

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : (
        <TaskList
          tasks={tasks}
          setTasks={setTasks}
          setEditingTask={setEditingTask}
          canEdit={isMentor}
          canDelete={isMentor}
          canUpdateStatus={true} // Intern and mentor can update status
        />
      )}
    </div>
  );
}
