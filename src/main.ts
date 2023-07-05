/*
 * @Description:
 * @Autor: ZY
 * @Date: 2020-12-07 10:30:20
 * @LastEditors: ZY
 * @LastEditTime: 2021-01-27 19:20:07
 */
// 引入vue-amap
// import VueAMap, { initAMapApiLoader } from '@vuemap/vue-amap'
import '@vuemap/vue-amap/dist/style.css'

import { createApp, Directive } from 'vue'
import App from './App.vue'
// import './pwa/registerServiceWorker'
import router from './router'
import { store } from './store'
import { loadAllPlugins } from './plugins'
import '@/assets/iconfont/iconfont.css'
import '@/styles/index.scss'
import 'normalize.css'
import * as directives from '@/directives'
import '@/permission'
// 初始化vue-amap
// initAMapApiLoader({
//   // 高德的key
//   key: '4d3aa13e0811378f86961c163e459a0c',
//   securityJsCode: 'ec25d169a36a70236b99d6f4fdb2b2a4' // 新版key需要配合安全密钥使用
//   // Loca:{
//   //  version: '2.0.0'
//   // } // 如果需要使用loca组件库，需要加载Loca
// })

const app = createApp(App)
// 加载所有插件
loadAllPlugins(app)

console.log(process.env.VUE_APP_BASE_API)

// 自定义指令
Object.keys(directives).forEach(key => {
  app.directive(key, (directives as { [key: string ]: Directive })[key])
})

// app.use(store).use(router).use(VueAMap).mount('#app')
app.use(store).use(router).mount('#app')
