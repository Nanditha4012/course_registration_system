import express from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import mongoose from 'mongoose'; // ADD THIS
import Course from '../models/Course.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, Word, PowerPoint, and Excel files allowed'));
    }
  }
});

// Get all courses
router.get('/', protect, async (req, res) => {
  try {
    const { department, search } = req.query;
    
    let query = { isActive: true };
    
    if (department && department !== 'All Departments') {
      query.department = department;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { courseCode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const courses = await Course.find(query).sort({ courseCode: 1 });
    res.json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single course by ID - FIXED VERSION
router.get('/:id', protect, async (req, res) => {
  try {
    const courseId = req.params.id;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      console.error('Invalid ObjectId format:', courseId);
      return res.status(400).json({ message: 'Invalid course ID format' });
    }

    const course = await Course.findById(courseId);
    
    if (!course) {
      console.error('Course not found:', courseId);
      return res.status(404).json({ message: 'Course not found' });
    }
    
    console.log('Course found:', course._id);
    res.json(course);
  } catch (error) {
    console.error('Get course by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create course (admin only)
router.post('/', protect, admin, async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update course (admin only)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid course ID format' });
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json(course);
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Delete course (admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid course ID format' });
    }

    const course = await Course.findByIdAndDelete(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Upload file to course (admin only)

// Upload and convert to PDF
router.post('/:id/upload', protect, admin, upload.single('file'), async (req, res) => {
  try {
    const courseId = req.params.id;
    
    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('Uploading file:', req.file.originalname);

    // Get file extension
    const fileExtension = req.file.originalname.split('.').pop();
    
    // Upload to Cloudinary with proper resource_type
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: `course-materials/${courseId}`,
          resource_type: 'raw', // Use 'raw' for documents to preserve format
          public_id: `${Date.now()}_${req.file.originalname.replace(/\.[^/.]+$/, '')}`,
          format: fileExtension // Preserve original format
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('Cloudinary upload success');
            resolve(result);
          }
        }
      );
      uploadStream.end(req.file.buffer);
    });

    // Add fl_attachment to URL to force download
    const downloadUrl = result.secure_url.replace('/upload/', '/upload/fl_attachment/');

    // Save to MongoDB
    course.files.push({
      name: req.file.originalname,
      url: downloadUrl, // Use modified URL with fl_attachment
      size: req.file.size,
      cloudinaryId: result.public_id,
      uploadedBy: req.user._id
    });
    await course.save();

    console.log('File saved to database');

    res.status(201).json({ 
      message: 'File uploaded successfully', 
      file: course.files[course.files.length - 1]
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      message: 'Upload failed', 
      error: error.message 
    });
  }
});


// Delete file from course (admin only)
router.delete('/:id/files/:fileId', protect, admin, async (req, res) => {
  try {
    const { id: courseId, fileId } = req.params;

    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const file = course.files.id(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    console.log('Deleting from Cloudinary:', file.cloudinaryId);

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(file.cloudinaryId, { 
        resource_type: 'raw',
        invalidate: true
      });
      console.log('Deleted from Cloudinary successfully');
    } catch (err) {
      console.warn('Cloudinary deletion warning:', err);
      // Continue even if Cloudinary deletion fails
    }

    // Remove from MongoDB
    course.files.pull(fileId);
    await course.save();

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
});

export default router;
