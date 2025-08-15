import { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../axiosConfig';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import { useAuth } from '../context/AuthContext';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);

  const isMentor = user?.role === 'mentor';
  const isIntern = user?.role === 'intern';

  const listEndpoint = useMemo(
    () => (isMentor ? '/api/tasks' : '/api/intern/tasks/my'),
    [isMentor]
  );

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axiosInstance.get(listEndpoint, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setTasks(response.data);
      } catch (error) {
        alert('Failed to fetch tasks.');
      }
    };
    if (user?.token) fetchTasks();
  }, [user, listEndpoint]);

  return (
    <div className="container mx-auto p-6">
      {/* Only Mentor. Add and edit tasks */}
      {isMentor && (
        <TaskForm
          tasks={tasks}
          setTasks={setTasks}
          editingTask={editingTask}
          setEditingTask={setEditingTask}
        />
      )}

      {/* A list of task */}
      <TaskList
        tasks={tasks}
        setTasks={setTasks}
        setEditingTask={isMentor ? setEditingTask : () => {}}
        readOnly={isIntern}
        canUpdateStatus={isIntern}
      />
    </div>
  );
};

export default Tasks;
