import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: [true, 'Course code is required'],
    unique: true,
    uppercase: true
  },
  title: {
    type: String,
    required: [true, 'Course title is required']
  },
  description: {
    type: String,
    required: [true, 'Course description is required']
  },
  credits: {
    type: Number,
    required: [true, 'Credits are required'],
    min: [1, 'Credits must be at least 1'],
    max: [4, 'Credits cannot exceed 4']
  },
  department: {
    type: String,
    required: [true, 'Department is required']
  },
  instructor: {
    type: String,
    required: [true, 'Instructor is required']
  },
  schedule: {
    days: {
      type: [String],
      default: []
    },
    time: {
      type: String,
      required: [true, 'Schedule time is required']
    },
    room: {
      type: String,
      required: [true, 'Room is required']
    }
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  enrolled: {
    type: Number,
    default: 0
  },
  prerequisites: [{
    type: String
  }],
  semester: {
    type: String,
    required: [true, 'Semester is required'],
    enum: {
      values: ['Even','Odd'],
      message: 'Semester must be Fall, Spring, or Summer'
    }
  },
  year: {
    type: Number,
    required: [true, 'Year is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },files: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: Number },
    cloudinaryId: { type: String, required: true }, // For deletion
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now }
  }]
}, 
{
  timestamps: true
});

courseSchema.virtual('availableSeats').get(function() {
  return this.capacity - this.enrolled;
});

courseSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Course', courseSchema);
