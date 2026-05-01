import Project from '../models/Project.js';
import Task from '../models/Task.js';

// @route   GET /api/projects
export const getProjects = async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'admin') {
      projects = await Project.find({}).populate('members', 'username email').populate('createdBy', 'username');
    } else {
      projects = await Project.find({ members: req.user._id }).populate('members', 'username email').populate('createdBy', 'username');
    }
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/projects
export const createProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    
    // Always include the admin who created it as a member
    const projectMembers = members ? [...new Set([...members, req.user._id])] : [req.user._id];

    const project = new Project({
      name,
      description,
      members: projectMembers,
      createdBy: req.user._id
    });

    const createdProject = await project.save();
    res.status(201).json(createdProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/projects/:id
export const getProjectDetails = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('members', 'username email').populate('createdBy', 'username');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if member or admin
    if (req.user.role !== 'admin' && !project.members.some(m => m._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to view this project' });
    }

    const tasks = await Task.find({ project: project._id }).populate('assignedTo', 'username email').populate('createdBy', 'username');
    
    res.json({ project, tasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/projects/:id/members
export const updateProjectMembers = async (req, res) => {
  try {
    const { members } = req.body; // Array of user IDs
    const project = await Project.findById(req.params.id);

    if (project) {
      project.members = members;
      // Ensure creator is always in members
      if (!project.members.includes(project.createdBy)) {
          project.members.push(project.createdBy);
      }
      const updatedProject = await project.save();
      
      const populatedProject = await Project.findById(updatedProject._id).populate('members', 'username email').populate('createdBy', 'username');
      res.json(populatedProject);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
