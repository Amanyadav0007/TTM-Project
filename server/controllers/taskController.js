import Task from '../models/Task.js';
import Project from '../models/Project.js';

// @route   GET /api/tasks
export const getTasks = async (req, res) => {
  try {
    const { projectId } = req.query;
    let query = {};
    
    if (projectId) {
      query.project = projectId;
      // Verify user is a member of this project if not admin
      if (req.user.role !== 'admin') {
         const project = await Project.findById(projectId);
         if (!project || !project.members.includes(req.user._id)) {
            return res.status(403).json({ message: 'Not authorized for this project' });
         }
      }
    } else {
      // If no project ID, get tasks for all projects the user is a part of
      if (req.user.role !== 'admin') {
        const userProjects = await Project.find({ members: req.user._id }).select('_id');
        const projectIds = userProjects.map(p => p._id);
        query = {
          $or: [
            { project: { $in: projectIds } },
            { assignedTo: req.user._id }
          ]
        };
      }
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'username email')
      .populate('createdBy', 'username')
      .populate('project', 'name');
      
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/tasks
export const createTask = async (req, res) => {
  try {
    const { title, description, status, assignedTo, project, dueDate } = req.body;
    
    // Verify project exists
    const projectExists = await Project.findById(project);
    if (!projectExists) {
       return res.status(404).json({ message: 'Project not found' });
    }

    // Verify assignedTo is a member of the project
    if (assignedTo && !projectExists.members.includes(assignedTo)) {
       return res.status(400).json({ message: 'Assigned user is not a member of this project' });
    }

    const task = new Task({
      title,
      description,
      status,
      assignedTo: assignedTo || null,
      project,
      dueDate,
      createdBy: req.user._id
    });

    const createdTask = await task.save();
    res.status(201).json(createdTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/tasks/:id
export const updateTask = async (req, res) => {
  try {
    const { title, description, status, assignedTo, dueDate } = req.body;
    const task = await Task.findById(req.params.id);

    if (task) {
      if (req.user.role !== 'admin') {
         // Members can only update status, and only if it's assigned to them
         if (task.assignedTo?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this task' });
         }
         task.status = status || task.status;
      } else {
         // Admin can update all fields
         task.title = title || task.title;
         task.description = description !== undefined ? description : task.description;
         task.status = status || task.status;
         task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;
         
         if (assignedTo !== undefined) {
             const projectExists = await Project.findById(task.project);
             if (assignedTo && !projectExists.members.includes(assignedTo)) {
                return res.status(400).json({ message: 'Assigned user is not a member of this project' });
             }
             task.assignedTo = assignedTo;
         }
      }

      const updatedTask = await task.save();
      res.json(updatedTask);
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/tasks/:id
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (task) {
      await task.deleteOne();
      res.json({ message: 'Task removed' });
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
