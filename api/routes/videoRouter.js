const express = require('express');
const router = express.Router();
const { Video } = require('../models/Video');
const { Subscriber } = require('../models/Subscriber');
const multer = require('multer');
var ffmpeg = require('fluent-ffmpeg');

// STORAGE MULTER CONFIG
let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== '.mp4') {
      return cb(res.status(400).end('only mp4 is allowed'), false);
    }
    cb(null, true);
  },
});
const upload = multer({ storage: storage }).single('file');

// Video
router.post('/uploadfiles', (req, res) => {
  // 클라이언트에서 요청한 비디오를 서버에 저장한다.
  upload(req, res, (err) => {
    if (err) {
      return res.json({ success: false, err });
    }
    return res.json({
      success: true,
      url: res.req.file.path,
      fileName: res.req.file.filename,
    });
  });
});

router.post('/uploadVideo', (req, res) => {
  // 비디오 정보를 DB에 저장한다
  const video = new Video(req.body);

  video.save((err, doc) => {
    console.log(err);
    if (err) return res.json({ success: false, err });
    return res.status(200).json({ success: true });
  });
});

router.get('/getVideos', (req, res) => {
  // 비디오를 DB에서 가져와서 클라이언트에 전달한다.

  Video.find()
    .populate('writer')
    .exec((err, videos) => {
      if (err) return res.status(400).send(err);
      return res.status(200).json({ success: true, videos });
    });
});

router.post('/getVideoDetail', (req, res) => {
  // 비디오를 DB에서 가져와서 클라이언트에 전달한다.
  Video.findOne({ _id: req.body.videoId })
    .populate('writer')
    .exec((err, videoDetail) => {
      if (err) return res.status(400).send(err);
      return res.status(200).json({ success: true, videoDetail });
    });
});

router.post('/thumbnail', (req, res) => {
  // 썸네일 생성, 비디오 러닝타임 가져옴

  let filePath = '';
  let fileDuration = '';

  // 비디오 정보 가져오기
  ffmpeg.ffprobe(req.body.url, function (err, metadata) {
    console.log(metadata); // all metadata
    console.log(metadata.format.duration);
    fileDuration = metadata.format.duration;
  });

  // 썸네일 생성
  ffmpeg(req.body.url)
    .on('filenames', function (filenames) {
      console.log('Will generate ' + filenames.join(', '));
      console.log(filenames);

      filePath = 'uploads/thumbnails/' + filenames[0];
    })
    .on('end', function () {
      console.log('Screenshots taken');
      return res.json({
        success: true,
        url: filePath,
        fileDuration: fileDuration,
      });
    })
    .on('error', function (err) {
      console.log(err);
      return res.json({ success: false, err });
    })
    .screenshot({
      // Will take screenshots at 20%, 40%, 60%, and 80% of the video
      count: 3,
      folder: 'uploads/thumbnails',
      size: '320x240',
      filename: 'thumbnail-%b.png', // '%b': input basename (filename w/o extension)
    });
});

router.post('/getSubscriptionVideos', (req, res) => {
  // 자신의 ID를 가지고 구독하는 사람들을 찾는다
  Subscriber.find({ userFrom: req.body.userFrom }).exec(
    (err, subscribeInfo) => {
      if (err) return res.status(400).json({ success: false, err });

      let subscribedUser = [];

      subscribeInfo.map((subscriber, i) => {
        subscribedUser.push(subscriber.userTo);
      });

      // 찾은 사람들의 비디오를 가져온다.

      Video.find({ writer: { $in: subscribedUser } })
        .populate('writer')
        .exec((err, videos) => {
          if (err) return res.status(400).send(err);
          return res.status(200).json({ success: true, videos });
        });
    }
  );
});

module.exports = { router };
