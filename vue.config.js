module.exports = {
  "devServer": {
    "host": "0.0.0.0",
    "disableHostCheck": true
  },
  "transpileDependencies": [
    "vuetify"
  ],
  chainWebpack: config => {
    config.module.rules.delete('eslint');
  }
}