import { createApp } from 'vue'
import './app.scss'
import '@nutui/nutui-taro/dist/style.css'

const App = createApp({
  onLaunch() {
    console.log('吃了没小程序已启动')
  },
})

export default App
