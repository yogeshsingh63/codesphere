import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const roomSchema = new Schema({
  title: {
    type: String,
    required: true,
    maxlength: 30,
  },
  desc: {
    type: String,
    required: true,
    maxlength: 280,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    minlength: 6,
  },
  sections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: true,
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  public: {
    type: Boolean,
    required: true,
    default: false,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Room', roomSchema);
