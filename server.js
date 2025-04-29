const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection - updated to remove deprecated options
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/chatApp');
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
};

connectDB();

// User schema & model
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    passcode: { type: String, required: true },
    socketId: String,
    online: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);

// Message schema & model
const messageSchema = new mongoose.Schema({
    from: { type: String, required: true },
    to: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
});

const Message = mongoose.model('Message', messageSchema);

// API Endpoints
app.post('/api/signup', async (req, res) => {
    try {
        const { username, passcode } = req.body;
        if (!username || !passcode) {
            return res.status(400).json({ error: 'Username and passcode are required' });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const newUser = new User({ username, passcode });
        await newUser.save();
        res.json({ message: 'Signup successful' });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Server error during signup' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, passcode } = req.body;
        if (!username || !passcode) {
            return res.status(400).json({ error: 'Username and passcode are required' });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.passcode !== passcode) {
            return res.status(401).json({ error: 'Invalid passcode' });
        }

        res.json({ message: 'Login successful' });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error during login' });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({}, 'username online');
        res.json(users);
    } catch (err) {
        console.error('Fetch users error:', err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.get('/api/messages/:username', async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { from: req.params.username },
                { to: req.params.username }
            ]
        }).sort({ timestamp: 1 });
        
        res.json(messages);
    } catch (err) {
        console.error('Fetch messages error:', err);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Serve HTML
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public/dashboard.html')));

// Socket.io Logic
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('authenticate', async (username) => {
        try {
            if (!username) {
                throw new Error('Username is required');
            }

            socket.username = username;

            const updatedUser = await User.findOneAndUpdate(
                { username },
                { socketId: socket.id, online: true },
                { new: true }
            );

            if (!updatedUser) {
                throw new Error('User not found');
            }

            const users = await User.find({}, 'username online');
            io.emit('userList', users);
        } catch (err) {
            console.error('Authentication error:', err.message);
            socket.emit('error', err.message);
        }
    });

    socket.on('privateMessage', async ({ to, message }) => {
        try {
            if (!to || !message) {
                throw new Error('Recipient and message are required');
            }

            const recipient = await User.findOne({ username: to });
            if (!recipient) {
                throw new Error(`${to} does not exist`);
            }

            const newMessage = new Message({
                from: socket.username,
                to,
                message
            });
            await newMessage.save();

            const formattedMessage = {
                from: socket.username,
                to,
                message,
                timestamp: new Date()
            };

            if (recipient.socketId) {
                io.to(recipient.socketId).emit('privateMessage', formattedMessage);
            }
            socket.emit('privateMessage', formattedMessage);
        } catch (err) {
            console.error('Message error:', err.message);
            socket.emit('error', err.message);
        }
    });

    socket.on('disconnect', async () => {
        try {
            await User.findOneAndUpdate(
                { socketId: socket.id },
                { socketId: null, online: false }
            );

            const users = await User.find({}, 'username online');
            io.emit('userList', users);
        } catch (err) {
            console.error('Disconnect error:', err.message);
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});