import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';

const router = express.Router();

/**
 * ENROLL (student)
 * POST /api/enrollments/enroll/:courseId
 */
router.post('/enroll/:courseId', protect, async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (!course.isActive) {
      return res.status(400).json({ message: 'Course is inactive' });
    }

    if ((course.enrolled || 0) >= course.capacity) {
      return res.status(400).json({ message: 'Course is full' });
    }

    const existing = await Enrollment.findOne({
      student: studentId,
      course: courseId,
      status: 'enrolled'
    });
    if (existing) {
      return res.status(400).json({ message: 'Already enrolled' });
      }

    const enrollment = await Enrollment.create({
      student: studentId,
      course: courseId,
      status: 'enrolled'
    });

    course.enrolled = (course.enrolled || 0) + 1;
    await course.save();

    return res.status(201).json(enrollment);
  } catch (err) {
    console.error('Enroll error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * DROP (student)
 * DELETE /api/enrollments/drop/:courseId
 */
router.delete('/drop/:courseId', protect, async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;

    const enrollment = await Enrollment.findOneAndDelete({
      student: studentId,
      course: courseId,
      status: 'enrolled'
    });

      if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
      }

    const course = await Course.findById(courseId);
    if (course) {
      course.enrolled = Math.max(0, (course.enrolled || 0) - 1);
      await course.save();
    }

    return res.json({ message: 'Dropped successfully' });
  } catch (err) {
    console.error('Drop error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * List enrolled students (admin)
 * GET /api/enrollments/course/:courseId/students
 */
router.get('/course/:courseId/students', protect, admin, async (req, res) => {
  try {
    const { courseId } = req.params;
    const enrollments = await Enrollment.find({ course: courseId, status: 'enrolled' })
      .populate('student', 'name email studentId major semester role');

    res.json(enrollments.map(e => ({
      _id: e._id,
      name: e.student?.name,
      email: e.student?.email,
      studentId: e.student?.studentId,
      major: e.student?.major,
      semester: e.student?.semester,
      enrolledAt: e.enrolledAt
    })));
  } catch (err) {
    console.error('List enrolled students error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// routes/enrollments.js
router.get('/my-courses', protect, async (req, res) => {
  try {
    const items = await Enrollment.find({ student: req.user._id, status: 'enrolled' })
      .populate('course', 'courseCode title department credits capacity enrolled isActive')
      .lean();
    res.json(items);
  } catch (err) {
    console.error('My courses error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Export enrolled students to CSV (admin)
 * GET /api/enrollments/course/:courseId/students/export
 */
router.get('/course/:courseId/students/export', protect, admin, async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const enrollments = await Enrollment.find({ course: courseId, status: 'enrolled' })
      .populate('student', 'name email studentId major semester');

    const header = ['Name','Email','Student ID','Major','Semester','Enrolled At'];
    const rows = enrollments.map(e => [
      e.student?.name ?? '',
      e.student?.email ?? '',
      e.student?.studentId ?? '',
      e.student?.major ?? '',
      e.student?.semester ?? '',
      new Date(e.enrolledAt).toISOString()
    ]);
    const csv = [header, ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const filename = `enrolled_${course.courseCode || 'course'}_${Date.now()}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csv);
  } catch (err) {
    console.error('Export CSV error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
