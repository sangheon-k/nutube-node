const express = require('express');
const router = express.Router();
const { Comment } = require('../models/Comment');

// Comment
router.post('/getComments', (req, res) => {
  Comment.find({ postId: req.body.videoId })
    .populate('writer')
    .exec((err, comments) => {
      if (err) return res.send(err);
      return res.status(200).json({ success: true, comments });
    });
});

router.post('/saveComment', (req, res) => {
  const comment = new Comment(req.body);
  comment.save((err, comment) => {
    if (err) return res.json({ success: false, err });

    Comment.find({ _id: comment._id })
      .populate('writer')
      .exec((err, comment) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).json({ success: true, comment });
      });
  });
});

module.exports = { router };
