import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'

// 导入element组件
import './plugins/element.js'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入全局样式
import './assets/css/global.css'
// 导入树形表格组件
import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器组件
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1'
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须返回config
  return config
})

// 将axios挂载在vue原型中，使用this.$http发起请求
Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.component('tree-table', TreeTable)
// 将富文本编辑器注册未全局可用
Vue.use(VueQuillEditor)
// 时间转换器
Vue.filter('dateFormat', function (dataVal) {
  const dt = new Date(dataVal)
  const y = dt.getFullYear()
  const m = dt.getMonth()
  const d = dt.getDate()
  const hh = dt.getHours()
  const mm = dt.getMinutes()
  return `${y}-${m}-${d} ${hh}:${mm}`
})
// 路由挂载
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
