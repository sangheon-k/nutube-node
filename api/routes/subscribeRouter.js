const express = require('express');
const router = express.Router();
const { Subscriber } = require('../models/Subscriber');

// Subscribe
router.post('/subscribeNumber', (req, res) => {
  // 클라이언트에서 요청한 구독자 수를 가져온다
  Subscriber.find({ userTo: req.body.userTo }).exec((err, subscribe) => {
    if (err) return res.status(400).send(err);
    return res
      .status(200)
      .json({ success: true, subscribeNumber: subscribe.length });
  });
});

router.post('/subscribed', (req, res) => {
  // 요청한 구독자 Id와 현재 로그인된 Id 비교한다
  Subscriber.find({
    userTo: req.body.userTo,
    userFrom: req.body.userFrom,
  }).exec((err, subscribe) => {
    if (err) return res.status(400).send(err);
    let result = false;
    if (subscribe.length !== 0) {
      result = true;
    }
    return res.status(200).json({ success: true, subscribed: result });
  });
});

router.post('/unSubscribe', (req, res) => {
  // 요청한 정보를 찾아서 삭제해준다.
  Subscriber.findOneAndDelete({
    userId: req.body.userId,
    userFrom: req.body.userFrom,
  }).exec((err, doc) => {
    if (err) return res.status(400).json({ success: false, err });
    return res.status(200).json({ success: true, doc });
  });
});

router.post('/subscribe', (req, res) => {
  // 요청한 정보를 등록해준다.
  const subscribe = new Subscriber(req.body);

  subscribe.save((err, doc) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({ success: true });
  });
});

module.exports = { router };
