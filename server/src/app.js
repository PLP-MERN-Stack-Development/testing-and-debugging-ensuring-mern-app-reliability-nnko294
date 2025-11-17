const express = require('express');
const mongoose = require('mongoose');

// Compatibility shim: allow calling mongoose.Types.ObjectId() without `new`
try {
  if (mongoose && mongoose.Types && typeof mongoose.Types.ObjectId === 'function') {
    const OriginalObjectId = mongoose.Types.ObjectId;
    const wrapper = function (...args) {
      return new OriginalObjectId(...args);
    };
    wrapper.prototype = OriginalObjectId.prototype;
    mongoose.Types.ObjectId = wrapper;
  }
} catch (e) {
  // ignore shim errors
}

const Post = require('./models/Post');
const { verifyTokenMiddleware } = require('./utils/auth');

const app = express();
app.use(express.json());

// Create a post (authenticated)
app.post('/api/posts', verifyTokenMiddleware, async (req, res) => {
  const { title, content, category } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Validation error' });

  try {
    const post = await Post.create({
      title,
      content,
      author: req.user.id,
      category,
      slug: (title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    });
    return res.status(201).json(post);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Get posts (filter, paginate)
app.get('/api/posts', async (req, res) => {
  const { category, page = 1, limit = 10 } = req.query;
  const query = {};
  if (category) query.category = category;

  const skip = (Number(page) - 1) * Number(limit);
  const posts = await Post.find(query).skip(skip).limit(Number(limit));
  const formatted = posts.map(p => ({
    _id: p._id.toString(),
    title: p.title,
    content: p.content,
    author: p.author ? p.author.toString() : null,
    category: p.category ? p.category.toString() : p.category,
    slug: p.slug,
  }));
  return res.json(formatted);
});

// Get post by id
app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Not found' });
    return res.json({
      _id: post._id.toString(),
      title: post.title,
      content: post.content,
      author: post.author ? post.author.toString() : null,
      category: post.category ? post.category.toString() : post.category,
      slug: post.slug,
    });
  } catch (err) {
    return res.status(404).json({ error: 'Not found' });
  }
});

// Update post
app.put('/api/posts/:id', verifyTokenMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Not found' });
    if (post.author.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    const updates = req.body;
    Object.assign(post, updates);
    await post.save();
    return res.json(post);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Delete post
app.delete('/api/posts/:id', verifyTokenMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Not found' });
    if (post.author.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    await Post.deleteOne({ _id: post._id });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = app;
