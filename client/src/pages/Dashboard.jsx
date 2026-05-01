import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Clock, Loader2, Target } from 'lucide-react';
import { cn } from '../utils/cn';

export const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/tasks', config);
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-accent" size={32} /></div>;

  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done');
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress');
  const doneTasks = tasks.filter(t => t.status === 'Done');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back, {user.username}. Here is your task summary.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2 text-gray-500 font-medium">
               <Target size={18} className="text-blue-500" /> Total Tasks
            </div>
            <div className="text-3xl font-bold text-gray-900">{tasks.length}</div>
         </div>
         <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2 text-gray-500 font-medium">
               <Clock size={18} className="text-yellow-500" /> In Progress
            </div>
            <div className="text-3xl font-bold text-gray-900">{inProgressTasks.length}</div>
         </div>
         <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2 text-gray-500 font-medium">
               <CheckCircle2 size={18} className="text-green-500" /> Completed
            </div>
            <div className="text-3xl font-bold text-gray-900">{doneTasks.length}</div>
         </div>
         <div className="bg-white p-5 rounded-xl border border-danger/30 shadow-sm bg-red-50/30">
            <div className="flex items-center gap-3 mb-2 text-danger font-medium">
               <AlertCircle size={18} /> Overdue
            </div>
            <div className="text-3xl font-bold text-danger">{overdueTasks.length}</div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Overdue Tasks */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
           <div className="p-4 border-b border-gray-100 bg-red-50/50">
              <h2 className="font-semibold text-danger flex items-center gap-2">
                 <AlertCircle size={18} /> Overdue Tasks Action Required
              </h2>
           </div>
           <div className="p-0">
             {overdueTasks.length === 0 ? (
               <div className="p-6 text-center text-sm text-gray-500">No overdue tasks. Great job!</div>
             ) : (
               <div className="divide-y divide-gray-100">
                  {overdueTasks.map(task => (
                    <div key={task._id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                       <div>
                          <div className="font-medium text-gray-900">{task.title}</div>
                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                            <span>Project: {task.project?.name}</span>
                            <span className="text-danger font-medium border border-danger/20 bg-danger/10 px-1.5 py-0.5 rounded text-[10px]">
                               Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                       </div>
                       <Link to={`/projects/${task.project?._id}`} className="text-xs font-medium text-accent hover:underline">
                          View Project
                       </Link>
                    </div>
                  ))}
               </div>
             )}
           </div>
        </div>

        {/* Who is doing what (In Progress) */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
           <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                 <Loader2 size={18} className="text-accent animate-spin-slow" /> Active Work (In Progress)
              </h2>
           </div>
           <div className="p-0">
             {inProgressTasks.length === 0 ? (
               <div className="p-6 text-center text-sm text-gray-500">No tasks currently in progress.</div>
             ) : (
               <div className="divide-y divide-gray-100">
                  {inProgressTasks.map(task => (
                    <div key={task._id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                       <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold uppercase shrink-0">
                          {task.assignedTo ? task.assignedTo.username.substring(0, 2) : '?'}
                       </div>
                       <div className="flex-grow min-w-0">
                          <div className="font-medium text-gray-900 truncate">{task.title}</div>
                          <div className="text-xs text-gray-500 mt-1 truncate">
                            Project: {task.project?.name}
                          </div>
                       </div>
                       <Link to={`/projects/${task.project?._id}`} className="text-xs font-medium text-accent hover:underline shrink-0">
                          View
                       </Link>
                    </div>
                  ))}
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};
