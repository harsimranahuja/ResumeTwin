import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
//karandes
const app = express();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

const allowedOrigins = [
  "https://resume-twin.vercel.app",   // Production Vercel
  "http://localhost:5173",            // Local Vite
  "https://resume-twin-git-main-harsimranahujas-projects.vercel.app",   // Preview
  "https://resume-twin-7vld2pkjw-harsimranahujas-projects.vercel.app"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

// MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Models
const UserSchema = new mongoose.Schema({
  fullName: String,
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  goal: String,
  agreedToTerms: Boolean,
  timestamp: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

const ResumeSchema = new mongoose.Schema({
  username: { type: String, required: true, index: true },
  title: String,
  data: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const Resume = mongoose.model('Resume', ResumeSchema);

const FeedbackSchema = new mongoose.Schema({
  type: { type: String, default: 'feedback' },
  username: String,
  rating: Number,
  message: String,
  timestamp: { type: Date, default: Date.now }
});
const Feedback = mongoose.model('Feedback', FeedbackSchema);

// Authentication Logic
app.post('/api/leads', async (req, res) => {
  const { fullName, username, password, goal, mode, agreedToTerms } = req.body;
  try {
    if (mode === 'signin') {
      const existingUser = await User.findOne({ username: username.trim().toLowerCase() });
      if (!existingUser) return res.status(404).json({ error: 'Account not found.' });
      if (existingUser.password !== password) return res.status(401).json({ error: 'Incorrect password.' });
      return res.status(200).json({
        user: {
          fullName: existingUser.fullName,
          username: existingUser.username,
          goal: existingUser.goal
        }
      });
    }

    if (mode === 'signup') {
      const existingUser = await User.findOne({ username: username.trim().toLowerCase() });
      if (existingUser) return res.status(400).json({ error: 'Username already taken.' });

      const newUser = new User({
        fullName,
        username: username.trim().toLowerCase(),
        password,
        goal,
        agreedToTerms
      });

      await newUser.save();

      return res.status(201).json({
        user: {
          fullName,
          username: newUser.username,
          goal
        }
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server Error', details: error.message });
  }
});

// ====== RESUME HISTORY SYSTEM ======

// Save a resume to history
app.post('/api/history/save', async (req, res) => {
  const { email, resumeData, title, id } = req.body; // email is actually username now
  if (!email || !resumeData) return res.status(400).json({ error: 'Username and resumeData required.' });

  try {
    const resumeTitle = title || resumeData.personal?.fullName || 'Untitled Resume';

    if (id) {
      // Update existing entry
      const updated = await Resume.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId.isValid(id) ? id : null, username: email.toLowerCase() },
        {
          title: resumeTitle,
          data: resumeData,
          updatedAt: Date.now()
        },
        { returnDocument: 'after' }
      );

      if (updated) {
        return res.status(200).json({ message: 'Resume updated.', id: updated._id });
      }
    }

    // Create new entry
    const newResume = new Resume({
      username: email.toLowerCase(),
      title: resumeTitle,
      data: resumeData
    });

    await newResume.save();
    return res.status(201).json({ message: 'Resume saved.', id: newResume._id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save resume.', details: err.message });
  }
});

// Get all resumes for a user
app.get('/api/history/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const resumes = await Resume.find({ username: username.toLowerCase() }).sort({ updatedAt: -1 });

    const formattedResumes = resumes.map(r => ({
      id: r._id,
      title: r.title,
      data: r.data,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }));

    res.status(200).json({ resumes: formattedResumes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load history.', details: err.message });
  }
});

// Delete a specific resume from history
app.delete('/api/history/:username/:id', async (req, res) => {
  const { username, id } = req.params;
  try {
    const result = await Resume.findOneAndDelete({
      _id: mongoose.Types.ObjectId.isValid(id) ? id : null,
      username: username.toLowerCase()
    });

    if (!result) return res.status(404).json({ error: 'Resume not found.' });
    res.status(200).json({ message: 'Resume deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete resume.', details: err.message });
  }
});

// Clear all history for a user
app.delete('/api/history/:username', async (req, res) => {
  const { username } = req.params;
  try {
    await Resume.deleteMany({ username: username.toLowerCase() });
    res.status(200).json({ message: 'All history cleared.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear history.', details: err.message });
  }
});

// ====== FEEDBACK SYSTEM ======
app.post('/api/feedback', async (req, res) => {
  const { type, email, rating, message } = req.body; // email is actually username now
  try {
    const newFeedback = new Feedback({
      type: type || 'feedback',
      username: email || 'Anonymous',
      rating: rating || 0,
      message: message || ''
    });

    await newFeedback.save();
    res.status(201).json({ message: 'Feedback received. Thank you!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save feedback.', details: err.message });
  }
});

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);

  // Quick DB Check on Startup
  try {
    const userCount = await User.countDocuments();
    const resumeCount = await Resume.countDocuments();
    console.log(`📡 Database Status: ${userCount} Users, ${resumeCount} Resumes`);
  } catch (err) {
    console.error('📡 Database Status Check Failed:', err.message);
  }
});
