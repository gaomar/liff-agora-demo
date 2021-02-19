"use strict";

const express = require("express");
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const RTCToken = require('./rtcToken');
const rtcToken = new RTCToken();
const router = express.Router();
const app = express();

router.post("/rtcToken", async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', '*')
  res.header('Access-Control-Allow-Methods', 'POST')


  try {
    const channelName = req.body.channelName;
    // 登録
    await rtcToken.generateRtcToken(channelName).then(async function (ret) {
      res.json( {
        key: ret
      })
    });
  } catch(err) {
      res.sendStatus(400)
  }

});

// サーバを起動する
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/.netlify/functions/index', router);
module.exports = app;
module.exports.handler = serverless(app);