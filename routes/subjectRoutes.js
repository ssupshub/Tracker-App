const express = require('express');
const router = express.Router();
const {
  getSubjects,
  createSubject,
  addTopic,
  toggleTopic,
  deleteSubject,
} = require('../controllers/subjectController');
const { protect } = require('../middleware/auth');

// All subject routes are protected
router.use(protect);

router.route('/').get(getSubjects).post(createSubject);
router.route('/:id').delete(deleteSubject);
router.post('/:id/topics', addTopic);
router.patch('/:sId/topics/:tId', toggleTopic);

module.exports = router;
