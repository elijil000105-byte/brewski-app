import express from 'express';
import auth from '../middleware/auth.js';
import Group from '../models/Group.js';
import User from '../models/User.js';

const router = express.Router();

// Create group
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;

    const group = new Group({
      name,
      description,
      owner: req.user.id,
      members: [req.user.id],
    });

    await group.save();
    await User.findByIdAndUpdate(req.user.id, { $push: { groups: group._id } });

    res.json(group);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get user's groups
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('groups');
    res.json(user.groups);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get group details
router.get('/:groupId', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('members', 'username email')
      .populate('owner', 'username email');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json(group);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Add member to group
router.post('/:groupId/add-member', auth, async (req, res) => {
  try {
    const { username } = req.body;

    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is owner
    if (group.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only owner can add members' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (group.members.includes(user._id)) {
      return res.status(400).json({ message: 'User already in group' });
    }

    group.members.push(user._id);
    await group.save();

    await User.findByIdAndUpdate(user._id, { $push: { groups: group._id } });

    res.json(group);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;