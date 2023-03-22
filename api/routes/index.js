const express = require('express');
const router = express.Router();

const userRouter = require('./userRouter');
const videoRouter = require('./videoRouter');
const commentRouter = require('./commentRouter');
const likeRouter = require('./likeRouter');
const subscribeRouter = require('./subscribeRouter');

router.use('/users', userRouter.router);
router.use('/video', videoRouter.router);
router.use('/subscribe', commentRouter.router);
router.use('/comment', likeRouter.router);
router.use('/like', subscribeRouter.router);

module.exports = router;
