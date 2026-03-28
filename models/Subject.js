const mongoose = require('mongoose');
const { isDBConnected } = require('../config/db');

const TopicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

const SubjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  topics: [TopicSchema],
}, { timestamps: true });

const SubjectModel = mongoose.model('Subject', SubjectSchema);

// ----------- IN-MEMORY FALLBACK ------------
const memorySubjects = [];

class MemoryTopicDoc {
  constructor(data) {
    this._id = data._id || String(Date.now() + Math.random());
    this.name = data.name;
    this.completed = data.completed || false;
  }
}

class MemorySubjectDoc {
  constructor(data) {
    this._id = data._id || String(Date.now() + Math.random());
    this.name = data.name;
    this.user = String(data.user); // Supports .toString() implicitly
    
    // Topics array that mimics Mongoose Subdocument Array
    this.topics = Array.isArray(data.topics) ? data.topics.map(t => new MemoryTopicDoc(t)) : [];
    // Inject the .id() method required by Mongoose Document Arrays
    this.topics.id = (topicId) => {
      return this.topics.find(t => String(t._id) === String(topicId));
    };
  }

  async save() {
    const index = memorySubjects.findIndex(s => String(s._id) === String(this._id));
    if (index !== -1) {
      memorySubjects[index] = this;
    } else {
      memorySubjects.push(this);
    }
    return this;
  }

  async deleteOne() {
    const index = memorySubjects.findIndex(s => String(s._id) === String(this._id));
    if (index !== -1) {
      memorySubjects.splice(index, 1);
    }
    return this;
  }
}

class MemorySubject {
  static async find(query) {
    return memorySubjects.filter(s => s.user === String(query.user));
  }
  
  static async create(data) {
    const doc = new MemorySubjectDoc(data);
    await doc.save();
    return doc;
  }
  
  static async findById(id) {
    const doc = memorySubjects.find(s => String(s._id) === String(id));
    return doc || null;
  }
}

const SubjectProxy = new Proxy(SubjectModel, {
  get(target, prop) {
    if (!isDBConnected() && MemorySubject[prop]) {
      return MemorySubject[prop].bind(MemorySubject);
    }
    return target[prop];
  },
});

module.exports = SubjectProxy;
