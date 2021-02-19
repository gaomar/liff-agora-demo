const { RtcTokenBuilder, RtcRole } = require('agora-access-token')
require('dotenv').config();

// Fill the appID and appCertificate key given by Agora.io
const appID = process.env.VUE_APP_APPID;
const appCertificate= process.env.VUE_APP_CERTIFICATE;

const expirationTimeInSeconds = 3600;
const role = RtcRole.PUBLISHER;

class rtcToken {
  constructor() {
  }

  generateRtcToken(channelName) {
    return new Promise(function(resolve, reject) {
      if (!channelName) {
        reject({error: 'チャンネル名がありません'});
      }

      const uid = 0;
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

      // トークン発行
      var key = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, uid, role, privilegeExpiredTs);
  
      resolve(key);
    });
  }
}
module.exports = rtcToken;