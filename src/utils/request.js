import axios from 'axios'
import router from '@/router'
import notification from 'ant-design-vue/es/notification'
import { VueAxios } from './axios'

// 创建 axios 实例
const request = axios.create({
  // API 请求的默认前缀
  baseURL: 'http://127.0.0.1:7001',
  timeout: 6000 // 请求超时时间
})
request.defaults.withCredentials = true
// 异常拦截处理器
const errorHandler = (error) => {
  if (error.response) {
    const data = error.response.data
    // 从 localstorage 获取 token
    if (error.response.status === 403) {
      notification.error({
        message: 'Forbidden',
        description: data.message
      })
    }
    if (error.response.status === 401) {
      notification.error({
        message: 'Unauthorized',
        description: 'Authorization verification failed'
      })
      router.push('/401')
    }
  }
  return Promise.reject(error)
}

// request interceptor
request.interceptors.request.use(config => {
  // 如果 token 存在
  // 让每个请求携带自定义 token 请根据实际情况自行修改
  return config
}, errorHandler)

// response interceptor
request.interceptors.response.use((response) => {
  return response.data
}, errorHandler)

const installer = {
  vm: {},
  install (Vue) {
    Vue.use(VueAxios, request)
  }
}

export default request

export {
  installer as VueAxios,
  request as axios
}
