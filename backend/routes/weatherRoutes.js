import express from 'express';
import SearchHistory from '../models/SearchHistory.js';
import { fetchWeatherData } from '../services/weatherService.js';

const router = express.Router();

// GET Weather & Generate Advisory
router.get('/weather', async (req, res) => {
  try {
    const { location } = req.query;
    if (!location) return res.status(400).json({ error: "Location required" });

    const data = await fetchWeatherData(location);

    // Save history (Keep only last 5)
    await SearchHistory.create({ location: data.location });
    const count = await SearchHistory.countDocuments();
    if (count > 5) {
      const oldest = await SearchHistory.findOne().sort({ searchedAt: 1 });
      await SearchHistory.findByIdAndDelete(oldest._id);
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET Search History
router.get('/history', async (req, res) => {
  const history = await SearchHistory.find().sort({ searchedAt: -1 }).limit(5);
  res.json(history);
});

export default router;