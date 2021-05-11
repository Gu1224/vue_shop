import Vue from 'vue'
// 按需导入element组件
import { Button, Form, FormItem, Input, Message } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
// message组件挂载到vue原型对象；$message为自定义属性
Vue.prototype.$message = Message
