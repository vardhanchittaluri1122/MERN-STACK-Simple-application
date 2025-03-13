const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  allowedHeaders: ['Content-Type'], 
}));


app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todo';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connected to MongoDB');
}).catch((error) => {
  console.error('❌ Error connecting to MongoDB:', error.message);
});

// Schema
const todoSchema = new mongoose.Schema({
  title: String,
  description: String,
  completed: { type: Boolean, default: false },
  completedOn: String,
});

const Operation = mongoose.model('Operation', todoSchema);

// Routes

// Get all todos
app.get('/api/todos', async (req, res) => {
  try {
    const todos = await Operation.find();
    res.status(200).json(todos);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching todos', details: err.message });
  }
});

// Add a new todo
app.post('/api/todos', async (req, res) => {
  try {
    const { title, description } = req.body;
    const newTodo = new Operation({ title, description });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(500).json({ error: 'Error adding todo', details: err.message });
  }
});

// Update a todo
app.put('/api/todos/:id', async (req, res) => {
  try {
    const { title, description } = req.body;
    const updatedTodo = await Operation.findByIdAndUpdate(
      req.params.id,
      { title, description },
      { new: true }
    );
    res.status(200).json(updatedTodo);
  } catch (err) {
    res.status(500).json({ error: 'Error updating todo', details: err.message });
  }
});

// Mark as completed
app.put('/api/todos/complete/:id', async (req, res) => {
  try {
    const completedOn = new Date().toLocaleString();
    const updatedTodo = await Operation.findByIdAndUpdate(
      req.params.id,
      { completed: true, completedOn },
      { new: true }
    );
    res.status(200).json(updatedTodo);
  } catch (err) {
    res.status(500).json({ error: 'Error marking as completed', details: err.message });
  }
});

// Delete a todo
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Deleting todo with ID:", id);

    const deletedTodo = await Operation.findByIdAndDelete(id);

    if (!deletedTodo) {
      return res.status(404).json({ error: "Todo not found" });
    }

    // Return updated list of todos
    const todos = await Operation.find();
    res.status(200).json({ message: 'Todo deleted successfully', todos });
  } catch (err) {
    console.error("Error deleting todo:", err.message);
    res.status(500).json({ error: 'Error deleting todo', details: err.message });
  }
});



// Root Route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
