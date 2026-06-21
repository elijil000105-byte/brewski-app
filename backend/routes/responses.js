import express from 'express';
import auth from '../middleware/auth.js';
import DailyResponse from '../models/DailyResponse.js';
import Group from '../models/Group.js';
import User from '../models/User.js';
import { io } from '../server.js';

const router = express.Router();

// Submit response (yes/no)
router.post('/:groupId', auth, async (req, res) => {
  try {
    const { response, time } = req.body;
    const groupId = req.params.groupId;

    // Validate group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Get today's date (midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find or create response
    let dailyResponse = await DailyResponse.findOne({
      group: groupId,
      user: req.user.id,
      date: today,
    });

    if (!dailyResponse) {
      dailyResponse = new DailyResponse({
        group: groupId,
        user: req.user.id,
        date: today,
        response,
        time: response === 'yes' ? time : null,
      });
    } else {
      dailyResponse.response = response;
      dailyResponse.time = response === 'yes' ? time : null;
    }

    await dailyResponse.save();

    // Get user for notification
    const user = await User.findById(req.user.id);

    // Notify group
    io.to(`group-${groupId}`).emit('response-update', {
      username: user.username,
      response,
      time: response === 'yes' ? time : null,
      timestamp: new Date(),
    });

    res.json(dailyResponse);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get today's responses for group
router.get('/:groupId/today', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const responses = await DailyResponse.find({
      group: req.params.groupId,
      date: today,
    }).populate('user', 'username email');

    res.json(responses);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;