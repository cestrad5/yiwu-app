const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ username, password: hashedPassword, role: role || 'CLIENT' });
    await user.save();

    res.status(201).json({ message: 'User created successfully', user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Admin seed if it doesn't exist
    if (username === 'admin' && await User.countDocuments() === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      const adminUser = new User({ username: 'admin', password: hashedPassword, role: 'ADMIN' });
      await adminUser.save();
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

    const payload = {
      id: user._id,
      username: user.username,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'yiwu_secret_key', { expiresIn: '7d' });
    res.json({ token, user: payload });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('assignedAgentId', 'username');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.assignAgentToClient = async (req, res) => {
  try {
    const { clientId, agentId } = req.body;
    
    const client = await User.findById(clientId);
    if (!client || client.role !== 'CLIENT') return res.status(400).json({ message: 'Invalid client' });

    const agent = await User.findById(agentId);
    if (!agent || agent.role !== 'AGENT') return res.status(400).json({ message: 'Invalid agent' });

    client.assignedAgentId = agentId;
    await client.save();

    res.json({ message: 'Agent assigned to client successfully', client });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, role } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (username) user.username = username;
    if (role) user.role = role;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json({ message: 'User updated successfully', user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Prevent deleting the last admin if necessary, but for now we trust the requester
    await User.findByIdAndDelete(id);

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getMyClients = async (req, res) => {
  try {
    // req.user comes from authMiddleware (requireAuth)
    const agentId = req.user.id;
    const clients = await User.find({ assignedAgentId: agentId, role: 'CLIENT' }).select('username');
    res.json(clients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
