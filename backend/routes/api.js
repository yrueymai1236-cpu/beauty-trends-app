const express = require('express');
const router = express.Router();
const { getTrendData } = require('../services/aggregator');

router.get('/trends', async (req, res) => {
  try {
    const data = await getTrendData();
    res.json(data);
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

module.exports = router;
