import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { loginApi, getUserInfoApi } from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('samp_token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('samp_user') || 'null'))

  const isLoggedIn = computed(() => !!token.value)
  const roles = computed(() => (userInfo.value?.roleCode ? [userInfo.value.roleCode] : []))

  async function login({ username, password }) {
    const res = await loginApi({ username, password })
    token.value = res.token
    userInfo.value = res.userInfo
    localStorage.setItem('samp_token', res.token)
    localStorage.setItem('samp_user', JSON.stringify(res.userInfo))
    return res
  }

  async function fetchUserInfo() {
    const res = await getUserInfoApi(userInfo.value?.id)
    if (res) {
      userInfo.value = res
      localStorage.setItem('samp_user', JSON.stringify(res))
    }
    return res
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('samp_token')
    localStorage.removeItem('samp_user')
  }

  return { token, userInfo, roles, isLoggedIn, login, logout, fetchUserInfo }
})