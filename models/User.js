const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { isDBConnected } = require('../config/db');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
}, { timestamps: true });

// Hash password before saving (Mongoose specific)
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(Number(process.env.BCRYPT_SALT_ROUNDS) || 12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password (Mongoose specific)
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const UserModel = mongoose.model('User', UserSchema);

// ----------- IN-MEMORY FALLBACK ------------
const memoryUsers = [];

class MemoryUser {
  static findOne({ username }) {
    const user = memoryUsers.find((u) => u.username === username);
    return Promise.resolve(user || null);
  }

  static findById(id) {
    return {
      select: function () {
        return this; // chainable
      },
      then: function (resolve) {
        const user = memoryUsers.find((u) => String(u._id) === String(id));
        resolve(user || null);
      },
    };
  }

  static async create(data) {
    const salt = await bcrypt.genSalt(Number(process.env.BCRYPT_SALT_ROUNDS) || 12);
    const password = await bcrypt.hash(data.password, salt);
    const newUser = {
      _id: String(Date.now() + Math.random()),
      username: data.username,
      password,
      matchPassword: async function (enteredPassword) {
        return await bcrypt.compare(enteredPassword, this.password);
      },
    };
    memoryUsers.push(newUser);
    return newUser;
  }
}

const UserProxy = new Proxy(UserModel, {
  get(target, prop) {
    if (!isDBConnected() && MemoryUser[prop]) {
      return MemoryUser[prop].bind(MemoryUser);
    }
    return target[prop];
  },
});

module.exports = UserProxy;

