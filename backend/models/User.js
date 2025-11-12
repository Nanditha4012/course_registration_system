import mongoose from 'mongoose';
import bcrypt from 'bcrypt'; // ← change here

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },

  // Student-only fields
  studentId: {
    type: String,
    unique: true,
    sparse: true,
    required: function () { return this.role === 'student'; }
  },
  major: {
    type: String,
    required: function () { return this.role === 'student'; }
  },
  semester: {
    type: Number,
    min: 1,
    max: 8,
    required: function () { return this.role === 'student'; }
  },
  gpa: { type: Number, min: 0, max: 10, default: 0 },

  // Email verification fields
  otp: { 
    type: String,
    required: function() { return this.role === 'student' && !this.isEmailVerified; }
  },
  otpExpiry: { 
    type: Date,
    required: function() { return this.role === 'student' && !this.isEmailVerified; }
  },
  isEmailVerified: { type: Boolean, default: false },

  // Account status
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', UserSchema);
