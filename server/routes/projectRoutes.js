import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getProjects, createProject, getProjectDetails, updateProjectMembers } from '../controllers/projectController.js';

const router = express.Router();

router.route('/').get(protect, getProjects).post(protect, admin, createProject);

router.route('/:id').get(protect, getProjectDetails);

router.route('/:id/members').put(protect, admin, updateProjectMembers);

export default router;
