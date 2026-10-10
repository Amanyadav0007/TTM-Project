import Task from '../models/Task.js';
import Project from '../models/Project.js';

// @route   GET /api/tasks
export const getTasks = async (req, res) => {
  try {
    const { projectId } = req.query;
    let query = {};

    if (projectId) {
      // Verify the project exists and the user is authorized to access it
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      if (req.user.role === 'admin') {
        // Admin can only access projects they created
        if (project.createdBy.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: 'Not authorized for this project' });
        }
      } else {
        // Members can only access projects they belong to
        if (!project.members.map(m => m.toString()).includes(req.user._id.toString())) {
          return res.status(403).json({ message: 'Not authorized for this project' });
        }
      }

      query.project = projectId;
    } else {
      if (req.user.role === 'admin') {
        // Admin sees tasks only within their own projects
        const adminProjects = await Project.find({ createdBy: req.user._id }).select('_id');
        const projectIds = adminProjects.map(p => p._id);
        query = { project: { $in: projectIds } };
      } else {
        // Members see tasks in projects they belong to, or assigned to them
        const userProjects = await Project.find({ members: req.user._id }).select('_id');
        const projectIds = userProjects.map(p => p._id);
        query = {
          $or: [
            { project: { $in: projectIds } },
            { assignedTo: req.user._id },
          ],
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

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Task title is required' });
    }
    if (!project) {
      return res.status(400).json({ message: 'Project ID is required' });
    }
    const validStatuses = ['To Do', 'In Progress', 'Done'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    // Verify project exists
    const projectExists = await Project.findById(project);
    if (!projectExists) {
       return res.status(404).json({ message: 'Project not found' });
    }

    // Any project member (admin or regular) can create a task
    const isMember = projectExists.members.map(m => m.toString()).includes(req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized to create tasks in this project' });
    }

    // Verify assignedTo is a member of the project
    if (assignedTo && !projectExists.members.map(m => m.toString()).includes(assignedTo.toString())) {
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

    const validStatuses = ['To Do', 'In Progress', 'Done'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const task = await Task.findById(req.params.id);

    if (task) {
      if (req.user.role !== 'admin') {
        // Members can only update status, and only if it's assigned to them
        if (task.assignedTo?.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: 'Not authorized to update this task' });
        }
        task.status = status || task.status;
      } else {
        // Admin can only update tasks within their own projects
        const taskProject = await Project.findById(task.project);
        if (!taskProject || taskProject.createdBy.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: 'Not authorized to update this task' });
        }

        task.title = title || task.title;
        task.description = description !== undefined ? description : task.description;
        task.status = status || task.status;
        task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;

        if (assignedTo !== undefined) {
          if (assignedTo && !taskProject.members.map(m => m.toString()).includes(assignedTo.toString())) {
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

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only the admin who created the task can delete it
    if (task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
