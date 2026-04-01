import { createApp } from 'vue'
import './app.scss'
import '@nutui/nutui-taro/dist/style.css'
import { getCloudEnv } from './utils/cloud'

const App = createApp({
  onLaunch() {
    console.log('吃了没小程序已启动')

    const cloudEnv = getCloudEnv()
    const cloud = (globalThis as { wx?: { cloud?: any } }).wx?.cloud

    if (cloudEnv && cloud) {
      cloud.init({
        env: cloudEnv,
        traceUser: true,
      })
    }
  },
})

export default App
