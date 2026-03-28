const Subject = require('../models/Subject');

// @desc    Get all subjects for a user
// @route   GET /api/subjects
// @access  Private
const getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ user: req.user.id });
    res.status(200).json(subjects);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a subject
// @route   POST /api/subjects
// @access  Private
const createSubject = async (req, res, next) => {
  try {
    if (!req.body.name) {
      res.status(400);
      throw new Error('Please provide a subject name');
    }

    const subject = await Subject.create({
      name: req.body.name,
      user: req.user.id,
      topics: [],
    });

    res.status(201).json(subject);
  } catch (error) {
    next(error);
  }
};

// @desc    Add a topic to a subject
// @route   POST /api/subjects/:id/topics
// @access  Private
const addTopic = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      res.status(404);
      throw new Error('Subject not found');
    }

    // Check user ownership
    if (subject.user.toString() !== req.user.id) {
      res.status(401);
      throw new Error('User not authorized');
    }

    if (!req.body.name) {
      res.status(400);
      throw new Error('Please provide a topic name');
    }

    subject.topics.push({ name: req.body.name, completed: false });
    await subject.save();

    res.status(200).json(subject);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle topic completion
// @route   PATCH /api/subjects/:sId/topics/:tId
// @access  Private
const toggleTopic = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.sId);

    if (!subject) {
      res.status(404);
      throw new Error('Subject not found');
    }

    if (subject.user.toString() !== req.user.id) {
      res.status(401);
      throw new Error('User not authorized');
    }

    const topic = subject.topics.id(req.params.tId);
    
    if (!topic) {
      res.status(404);
      throw new Error('Topic not found');
    }

    topic.completed = !topic.completed;
    await subject.save();

    res.status(200).json(subject);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a subject
// @route   DELETE /api/subjects/:id
// @access  Private
const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      res.status(404);
      throw new Error('Subject not found');
    }

    if (subject.user.toString() !== req.user.id) {
      res.status(401);
      throw new Error('User not authorized');
    }

    await subject.deleteOne();
    res.status(200).json({ id: req.params.id, message: `Deleted subject ${req.params.id}` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSubjects,
  createSubject,
  addTopic,
  toggleTopic,
  deleteSubject,
};
