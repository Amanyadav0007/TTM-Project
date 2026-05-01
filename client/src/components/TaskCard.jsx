import { Edit2, Trash2, Clock, CheckCircle2, CircleDashed } from 'lucide-react';
import { cn } from '../utils/cn';
import { Button } from './Button';

export const TaskCard = ({ task, onEdit, onDelete, currentUserRole, currentUserId }) => {
  const statusConfig = {
    'To Do': { icon: CircleDashed, color: 'text-gray-500', bg: 'bg-gray-100' },
    'In Progress': { icon: Clock, color: 'text-accent', bg: 'bg-blue-50' },
    'Done': { icon: CheckCircle2, color: 'text-success', bg: 'bg-green-50' },
  };

  const StatusIcon = statusConfig[task.status].icon;
  
  // Can delete if admin or if creator
  const canDelete = currentUserRole === 'admin' || task.createdBy?._id === currentUserId;
  // Can edit if admin, creator, or assigned to it
  const canEdit = currentUserRole === 'admin' || task.createdBy?._id === currentUserId || task.assignedTo?._id === currentUserId;

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 text-lg leading-tight line-clamp-2">{task.title}</h3>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {canEdit && (
            <button onClick={() => onEdit(task)} className="p-1.5 text-gray-400 hover:text-accent hover:bg-blue-50 rounded-md transition-colors">
              <Edit2 size={16} />
            </button>
          )}
          {canDelete && (
            <button onClick={() => onDelete(task._id)} className="p-1.5 text-gray-400 hover:text-danger hover:bg-red-50 rounded-md transition-colors">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
      
      {task.description && (
        <p className="text-gray-500 text-sm mb-4 line-clamp-3">{task.description}</p>
      )}

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
        <div className="flex items-center gap-2">
          <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", statusConfig[task.status].bg, statusConfig[task.status].color)}>
            <StatusIcon size={14} />
            {task.status}
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1 text-xs text-gray-500">
          {task.dueDate && (
             <div className={cn("flex items-center gap-1", new Date(task.dueDate) < new Date() && task.status !== 'Done' ? "text-danger font-medium" : "text-gray-400")}>
                <Clock size={12} />
                {new Date(task.dueDate).toLocaleDateString()}
             </div>
          )}
          {task.assignedTo ? (
            <div className="flex items-center gap-1.5" title={`Assigned to: ${task.assignedTo.email}`}>
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold uppercase">
                {task.assignedTo.username.substring(0, 2)}
              </div>
            </div>
          ) : (
            <span className="text-gray-400 italic">Unassigned</span>
          )}
        </div>
      </div>
    </div>
  );
};
