import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { loginApi, getUserInfoApi, getRolePermissionApi } from '@/api'

const TOKEN_KEY = 'samp_token'
const USER_KEY = 'samp_user'
const LOGIN_AT_KEY = 'samp_login_at'
const ACTIVE_AT_KEY = 'samp_last_active'

// 会话策略：登录态最长保留 2 小时；连续 30 分钟无操作自动退出
export const SESSION_TTL = 2 * 60 * 60 * 1000
export const IDLE_TTL = 30 * 60 * 1000
// 活跃时间写盘节流，避免频繁操作时反复写 sessionStorage
const ACTIVITY_WRITE_INTERVAL = 30 * 1000

export const useAuthStore = defineStore('auth', () => {
  // 旧版本把 token 永久保存在 localStorage（关闭浏览器后仍然有效），升级后统一清理
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(LOGIN_AT_KEY)
  localStorage.removeItem(ACTIVE_AT_KEY)

  function clearSessionStorage() {
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
    sessionStorage.removeItem(LOGIN_AT_KEY)
    sessionStorage.removeItem(ACTIVE_AT_KEY)
  }

  function readStoredUser() {
    try {
      return JSON.parse(sessionStorage.getItem(USER_KEY) || 'null')
    } catch {
      return null
    }
  }

  // 登录态只保存在 sessionStorage：关闭浏览器/标签页即失效；并校验绝对有效期与空闲时长
  const storedToken = sessionStorage.getItem(TOKEN_KEY) || ''
  const storedLoginAt = Number(sessionStorage.getItem(LOGIN_AT_KEY) || 0)
  const storedActiveAt = Number(sessionStorage.getItem(ACTIVE_AT_KEY) || 0)
  const now = Date.now()
  const sessionAlive =
    !!storedToken &&
    !!storedLoginAt &&
    !!storedActiveAt &&
    now - storedLoginAt <= SESSION_TTL &&
    now - storedActiveAt <= IDLE_TTL &&
    !!readStoredUser()

  if (!sessionAlive) clearSessionStorage()

  const token = ref(sessionAlive ? storedToken : '')
  const userInfo = ref(sessionAlive ? readStoredUser() : null)
  const permissions = ref([])

  const isLoggedIn = computed(() => !!token.value)
  const roles = computed(() => (userInfo.value?.roleCode ? [userInfo.value.roleCode] : []))

  // 会话有效性校验的时间戳，避免每次路由跳转都请求用户信息
  let lastCheckAt = 0
  const CHECK_INTERVAL = 20000
  let lastActiveWriteAt = storedActiveAt
  let permissionsLoaded = false
  let permVersion = 0

  async function login({ username, password }) {
    const res = await loginApi({ username, password })
    const startedAt = Date.now()
    token.value = res.token
    userInfo.value = res.userInfo
    lastCheckAt = startedAt
    lastActiveWriteAt = startedAt
    sessionStorage.setItem(TOKEN_KEY, res.token)
    sessionStorage.setItem(USER_KEY, JSON.stringify(res.userInfo))
    sessionStorage.setItem(LOGIN_AT_KEY, String(startedAt))
    sessionStorage.setItem(ACTIVE_AT_KEY, String(startedAt))
    await loadPermissions()
    return res
  }

  // 记录用户活跃时间（节流写入），用于空闲超时判定
  function touch() {
    if (!token.value) return
    const t = Date.now()
    if (t - lastActiveWriteAt < ACTIVITY_WRITE_INTERVAL) return
    lastActiveWriteAt = t
    sessionStorage.setItem(ACTIVE_AT_KEY, String(t))
  }

  // 判断会话是否已超时（绝对有效期或空闲超时）
  function isSessionExpired() {
    if (!token.value || !userInfo.value?.id) return true
    const t = Date.now()
    const startedAt = Number(sessionStorage.getItem(LOGIN_AT_KEY) || 0)
    const lastActive = Number(sessionStorage.getItem(ACTIVE_AT_KEY) || 0)
    if (!startedAt || !lastActive) return true
    return t - startedAt > SESSION_TTL || t - lastActive > IDLE_TTL
  }

  // 加载当前角色拥有的权限点
  async function loadPermissions() {
    const roleCode = userInfo.value?.roleCode
    if (!roleCode) return []
    permissions.value = await getRolePermissionApi(roleCode)
    permVersion = Number(localStorage.getItem('samp_perm_ver') || 0)
    permissionsLoaded = true
    return permissions.value
  }

  // 权限配置变更后强制重新加载，菜单与按钮立即刷新
  async function refreshPermissions() {
    permissionsLoaded = false
    return loadPermissions()
  }

  async function ensurePermissions() {
    // 其他会话保存过权限配置时，版本号变化会触发重新加载
    const storedVersion = Number(localStorage.getItem('samp_perm_ver') || 0)
    if (permissionsLoaded && storedVersion === permVersion) return permissions.value
    try {
      return await loadPermissions()
    } catch {
      permissions.value = []
      return permissions.value
    }
  }

  // 未配置权限点的菜单不做限制，配置了则按角色权限判断
  function hasPermission(code) {
    if (!code) return true
    return permissions.value.includes(code)
  }

  // 校验当前会话：先判断超时，再校验账号是否仍然有效（存在且为启用状态）
  async function checkSession() {
    if (!token.value || !userInfo.value?.id) return false
    if (isSessionExpired()) {
      logout()
      return false
    }
    touch()
    if (Date.now() - lastCheckAt < CHECK_INTERVAL) return true
    try {
      const res = await getUserInfoApi(userInfo.value.id)
      // 密码修改后，签发时间早于改密时间的旧 token 全部失效（含其他设备会话）
      const issuedAt = Number(String(token.value).split('-').pop()) || 0
      if (res.passwordChangedAt && issuedAt < res.passwordChangedAt) {
        logout()
        return false
      }
      userInfo.value = res
      lastCheckAt = Date.now()
      sessionStorage.setItem(USER_KEY, JSON.stringify(res))
      return true
    } catch {
      logout()
      return false
    }
  }

  async function fetchUserInfo() {
    const res = await getUserInfoApi(userInfo.value?.id)
    if (res) {
      userInfo.value = res
      sessionStorage.setItem(USER_KEY, JSON.stringify(res))
    }
    return res
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    permissions.value = []
    permissionsLoaded = false
    lastCheckAt = 0
    lastActiveWriteAt = 0
    clearSessionStorage()
  }

  return {
    token,
    userInfo,
    permissions,
    roles,
    isLoggedIn,
    login,
    logout,
    fetchUserInfo,
    checkSession,
    touch,
    isSessionExpired,
    loadPermissions,
    refreshPermissions,
    ensurePermissions,
    hasPermission,
  }
})
