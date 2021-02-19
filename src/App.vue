<template>
  <v-app>
    <router-view v-bind:state.sync="state"/>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      state: {
        uuid: '',
        name: '',
        icon: '',
        client: null,
        currentUserId: null,
        joined: false,
        localAudioTrack: null,
        participants: new Set(),
        published: false,
        speakers: new Set(),
        isClient: false
      },
    }
  },
  created () {
    this.initializeAgora()
  },
  methods: {
    initializeAgora() {
      this.state.client = this.createLocalClient()
      this.initializeLIFF()
    },
    createLocalClient() {
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })
      return client
    },
    initializeLIFF() {
      var me = this
      this.state.isClient = liff.isInClient()
      liff.init(
        {
          liffId: process.env.VUE_APP_LIFF_ID
        },
        data => {
          if (liff.isLoggedIn()) {
            // プロフィール取得
            liff.getProfile()
              .then(profile => {
                me.state.uuid = profile.userId
                me.state.name = profile.displayName
                me.state.icon = profile.pictureUrl
              })
              .catch((err) => {
                console.log('error', err)
              })
          } else {
            this.loginAction()
          }
        },
        err => {
          console.log('LIFF initialization failed', err)
        }
      )
    },
    loginAction() {
      // ログインまだ
      if (!liff.isLoggedIn()) {
        liff.login()
      }
    }
  }
}
</script>