import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const FILE_SCHEMA = {
  filename: { type: String },
  code: { type: String },
  size: { type: Number },
};

const STORAGE_SCHEMA = [{
  folder: { type: String },
  files: [FILE_SCHEMA],
}];

const sectionSchema = new Schema({
  title: {
    type: String,
    required: true,
    maxlength: 30,
  },
  type: {
    type: String,
    enum: ["info", "coding", "quiz", "flag", "website"],
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    minlength: 6,
  },
  markdown: { type: String },
  layout: { type: Number, default: 0 },

  info: {
    type: {
      image: FILE_SCHEMA,
    },
    required: false,
    default: undefined,
  },

  coding: {
    type: {
      lang: { type: String },
      files: STORAGE_SCHEMA,
      checks: [{
        stdin: String,
        stdout: String,
        code: String,
        output: String,
        multiline: Boolean,
        fail: Boolean,
        hint: String,
      }],
    },
    required: false,
    default: undefined,
  },

  quiz: {
    type: {
      question: { type: String },
      answers: [{
        choice: { type: String },
        correct: { type: Boolean },
      }],
      all: { type: Boolean, default: false },
    },
    required: false,
    default: undefined,
  },

  flag: {
    type: String,
    required: false,
  },

  website: {
    type: {
      url: { type: String },
      autopass: { type: Boolean, default: true },
    },
    required: false,
    default: undefined,
  },

  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
  },
}, {
  timestamps: true,
});


export default mongoose.model('Section', sectionSchema);
