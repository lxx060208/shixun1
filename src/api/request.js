// Axios 实例与统一请求封装
// 说明：实训项目当前使用模拟数据（见 ./mock.js），本模块仅保留与 Spring Boot REST
// 接口对接时的真实请求入口，用于后续前后端联调的接口契约层。
import axios from 'axios'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
})

// 请求拦截：注入 Token 鉴权头
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('samp_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// 响应拦截：统一解包与错误处理
request.interceptors.response.use(
  (response) => {
    const data = response.data
    // 约定后端统一返回 { code, message, data }
    if (data && typeof data === 'object' && 'code' in data) {
      if (data.code === 200 || data.code === 0) return data.data
      return Promise.reject(new Error(data.message || '请求失败'))
    }
    return data
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default request