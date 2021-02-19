<template>
  <v-app>
    <header>
      <v-app-bar app>
        <v-toolbar-title>LIFF-AGORA-DEMO</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-avatar class="mx-5"><v-img :src="localState.icon" /></v-avatar>
        <v-btn color="success" class="font-weight-bold" v-on:click="signOut">ログアウト</v-btn>
      </v-app-bar>
    </header>

    <v-main>
      <v-card width="750px" class="mx-auto mt-5">
        <v-container>
          <v-card-subtitle>AGORA-UserID:{{localState.currentUserId}}</v-card-subtitle>
          <v-form ref="send_data">
            <v-row>
              <v-col>
                  <v-text-field v-model="channelName" label="ルーム名" outlined :rules="[required, inputRules.regex]" :disabled="localState.joined"/>
              </v-col>
            </v-row>

            <v-row>
              <v-col>
                <v-btn large block color="success" class="font-weight-bold" v-on:click="onJoinClick" :disabled="localState.joined">入室する</v-btn>
              </v-col>
              <v-col>
                <v-btn large block color="error" class="font-weight-bold" v-on:click="onLeaveClick" :disabled="!localState.joined">退室する</v-btn>
              </v-col>
            </v-row>

          </v-form>
          <v-row >
            <v-col>
              <v-btn large block color="info" class="font-weight-bold" v-on:click="onPublishClick" :disabled="!localState.joined || localState.published">ミュート解除</v-btn>
            </v-col>
            <v-col>
              <v-btn large block class="font-weight-bold" v-on:click="onUnpublishClick" :disabled="!localState.joined || !localState.published">ミュート</v-btn>
            </v-col>
          </v-row>
          <v-card-text>
            ■ 参加者リスト
            <div v-for="item in participants" :key="item.uid">
              <div v-if="localState.speakers.has(item)">・{{item.uid}} 🔊</div>
              <div v-else>・{{item.uid}}</div>
            </div>
          </v-card-text>

        </v-container>
      </v-card>
    </v-main>

  </v-app>
</template>

<script>
import axios from 'axios'

export default {
  props: {
    state: Object
  },
  computed: {
    localState: {
      get: function() {
        this.state.client.on("user-joined", this.onAgoraUserJoined);
        this.state.client.on("user-left", this.onAgoraUserLeft);
        this.state.client.on("user-published", this.onAgoraUserPublished);
        this.state.client.on("user-unpublished", this.onAgoraUserUnpublished);
        return this.state
      }
    }
  },
  data () {
    return {
      channelName: '',
      participants: [],
      required: value => !!value || "必ず入力してください",
      inputRules: {
        regex: v => /^[a-zA-Z0-9]*$/.test(v) || '英数字のみ入力してください'
      },

    }
  },
  methods: {
    async onJoinClick() {
      if (this.$refs.send_data.validate()) {
        console.log('onJoinClick!')
        if (!this.localState.client) {
          throw new Error("Client must be ready");
        }

        const params = new URLSearchParams()
        params.append('channelName', this.channelName)
        axios.post(process.env.VUE_APP_GENERATE_TOKEN_API, params)
          .then(async response => {
            const token = response.data.key
            const uid = await this.localState.client.join(process.env.VUE_APP_APPID, this.channelName, token, null);

            this.localState.currentUserId = uid;
            this.localState.joined = true;

          }).catch(error => {
            console.log(error);
        });
      }
    },
    async onLeaveClick() {
      console.log('onLeaveClick!')
      if (!this.localState.client) {
        throw new Error("Client must be ready");
      }

      // Destroy the local audio and track.
      this.localState.client.localTracks.forEach((v) => v.close());

      // Leave the channel.
      await this.localState.client.leave();

      this.localState.currentUserId = null;
      this.localState.joined = false;
      this.localState.localAudioTrack = null;
      this.localState.participants.clear();
      this.participants = []
      this.localState.published = false;

    },
    async onPublishClick() {
      if (!this.localState.client) {
        throw new Error("Client must be ready");
      }

      // Create an audio track from the audio sampled by a microphone.
      const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      // Publish the local audio track to the channel.
      await this.localState.client.publish([localAudioTrack]);

      this.localState.localAudioTrack = localAudioTrack;
      this.localState.published = true;

    },
    async onUnpublishClick() {
      if (!this.localState.client) {
        throw new Error("Client must be ready");
      }

      await this.localState.client.unpublish();

      this.localState.published = false;

    },
    async onAgoraUserJoined(user) {
      console.log("onAgoraUserJoined="+user.uid)
      this.localState.participants.add(user)
      this.participants = Array.from(this.localState.participants)

    },
    async onAgoraUserLeft(user) {
      this.localState.participants.delete(user);
      this.participants = Array.from(this.localState.participants)
    },
    async onAgoraUserPublished(user, mediaType) {
      if (!this.localState.client) {
        throw new Error("Client must be ready");
      }

      this.localState.speakers.add(user);
      this.participants = Array.from(this.localState.participants)

      const remoteTrack = await this.localState.client.subscribe(user, mediaType);
      remoteTrack.play();
    },
    async onAgoraUserUnpublished(user) {
      this.localState.speakers.delete(user);
      this.participants = Array.from(this.localState.participants)

    },
    async signOut() {
      await this.onLeaveClick()
      if (liff.isLoggedIn()) {
        liff.logout();
        this.$router.go({path: '/', force: true})
      }
    }
  }
}
</script>
