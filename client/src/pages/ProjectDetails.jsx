import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { TaskCard } from '../components/TaskCard';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Plus, X, Users, ArrowLeft } from 'lucide-react';

export const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Users state for members modal
  const [allUsers, setAllUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  // Task Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('To Do');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');

  const fetchProjectDetails = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`https://ttm-project-psi.vercel.app/api/projects/${id}`, config);
      setProject(data.project);
      setTasks(data.tasks);
      setSelectedMembers(data.project.members.map(m => m._id));
    } catch (err) {
      setError('Failed to load project details or not authorized.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    if (user.role !== 'admin') return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('https://ttm-project-psi.vercel.app/api/auth/members', config);
      setAllUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
    fetchAllUsers();
  }, [id]);

  const handleUpdateMembers = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`https://ttm-project-psi.vercel.app/api/projects/${id}/members`, { members: selectedMembers }, config);
      setIsMemberModalOpen(false);
      fetchProjectDetails();
    } catch (err) {
      console.error('Error updating members');
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    const taskData = { 
      title, 
      description, 
      status, 
      assignedTo: assignedTo || null,
      project: id,
      dueDate: dueDate || null
    };

    try {
      if (editingTask) {
        await axios.put(`https://ttm-project-psi.vercel.app/api/tasks/${editingTask._id}`, taskData, config);
      } else {
        await axios.post('https://ttm-project-psi.vercel.app/api/tasks', taskData, config);
      }
      fetchProjectDetails();
      closeTaskModal();
    } catch (error) {
      console.error('Error saving task', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Delete this task?')) {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      try {
        await axios.delete(`https://ttm-project-psi.vercel.app/api/tasks/${taskId}`, config);
        fetchProjectDetails();
      } catch (error) {
        console.error('Error deleting task');
      }
    }
  };

  const openTaskModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setAssignedTo(task.assignedTo?._id || '');
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    } else {
      setEditingTask(null);
      setTitle('');
      setDescription('');
      setStatus('To Do');
      setAssignedTo('');
      setDueDate('');
    }
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/projects" className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Projects
      </Link>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-gray-500 mt-1">{project.description}</p>
        </div>
        <div className="flex gap-3">
          {user.role === 'admin' && (
            <Button variant="outline" onClick={() => setIsMemberModalOpen(true)} className="gap-2">
              <Users size={16} /> Manage Members
            </Button>
          )}
          {user.role === 'admin' && (
            <Button onClick={() => openTaskModal()} className="gap-2">
              <Plus size={16} /> Add Task
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {['To Do', 'In Progress', 'Done'].map(columnStatus => (
          <div key={columnStatus} className="flex flex-col gap-4">
            <h2 className="font-semibold text-gray-700 flex items-center gap-2">
              {columnStatus}
              <span className="bg-gray-100 text-gray-500 text-xs py-0.5 px-2 rounded-full font-medium">
                {tasks.filter(t => t.status === columnStatus).length}
              </span>
            </h2>
            <div className="flex flex-col gap-4">
              {tasks.filter(t => t.status === columnStatus).map(task => (
                <TaskCard 
                  key={task._id} 
                  task={task} 
                  onEdit={openTaskModal} 
                  onDelete={handleDeleteTask}
                  currentUserRole={user.role}
                  currentUserId={user._id}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{editingTask ? 'Edit Task' : 'Create Task'}</h3>
              <button onClick={closeTaskModal} className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleTaskSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent min-h-[80px]"
                  value={description} onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-accent">
                    <option value="To Do">To Do</option><option value="In Progress">In Progress</option><option value="Done">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
              </div>
              {user.role === 'admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                  <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-accent">
                    <option value="">Unassigned</option>
                    {project.members.map(m => (
                      <option key={m._id} value={m._id}>{m.username}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="pt-4 flex gap-3 justify-end">
                <Button type="button" variant="ghost" onClick={closeTaskModal}>Cancel</Button>
                <Button type="submit">{editingTask ? 'Save' : 'Create'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Members Modal (Admin Only) */}
      {isMemberModalOpen && user.role === 'admin' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
             <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Manage Members</h3>
              <button onClick={() => setIsMemberModalOpen(false)} className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdateMembers} className="p-5 space-y-4">
              <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                {allUsers.map(u => (
                  <label key={u._id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded text-accent focus:ring-accent"
                      checked={selectedMembers.includes(u._id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedMembers([...selectedMembers, u._id]);
                        else setSelectedMembers(selectedMembers.filter(id => id !== u._id));
                      }}
                      disabled={u._id === project.createdBy._id} // Cannot remove creator
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{u.username}</div>
                      <div className="text-xs text-gray-500">{u.email}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="pt-4 flex gap-3 justify-end border-t border-gray-100 mt-4">
                <Button type="button" variant="ghost" onClick={() => setIsMemberModalOpen(false)}>Cancel</Button>
                <Button type="submit">Save Members</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
