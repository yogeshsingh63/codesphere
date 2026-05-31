import mongoose from 'mongoose';
import validator from 'validator';

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: { validator: validator.isEmail, message: 'Invalid email.' },
  },
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 6,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  enrolled: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
  }],
  created: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
  }],
  completed: [{
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
    },
    sections: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
    }],
  }],
  name: { type: String, maxlength: 30 },
  bio: { type: String, maxlength: 300 },
  profilepic: { type: String },
  storage: [{
    folder: { type: String, required: true },
    files: [{
      filename: { type: String, required: true },
      code: { type: String, required: true },
      size: { type: Number, required: true },
    }],
  }],
  size: { type: Number, min: 0, default: 0 },
}, {
  timestamps: true,
});

const calculateStorageSize = (storage = []) =>
  storage.reduce(
    (total, folder) => total + folder.files.reduce((ft, file) => ft + file.size, 0),
    0,
  );

userSchema.pre('save', function (next) {
  this.size = calculateStorageSize(this.storage);
  next();
});

userSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  const nextStorage = update?.storage || update?.$set?.storage;
  if (Array.isArray(nextStorage)) {
    if (!update.$set) update.$set = {};
    update.$set.size = calculateStorageSize(nextStorage);
    this.setUpdate(update);
  }
  next();
});

export default mongoose.model('User', userSchema);
