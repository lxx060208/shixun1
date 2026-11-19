import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { loginApi, getUserInfoApi, getRolePermissionApi } from '@/api'

const TOKEN_KEY = 'samp_token'
const USER_KEY = 'samp_user'

let storageSyncBound = false

export const useAuthStore = defineStore('auth', () => {
  // 登录态永久保存在 localStorage：关闭浏览器/重启服务后仍然保持登录，
  // 仅手动退出或账号失效（被禁用/删除）时结束会话。
  function clearStorage() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  function readStoredUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
    } catch {
      return null
    }
  }

  const storedToken = localStorage.getItem(TOKEN_KEY) || ''
  const storedUser = readStoredUser()
  const sessionAlive = !!storedToken && !!storedUser

  if (!sessionAlive) clearStorage()

  const token = ref(sessionAlive ? storedToken : '')
  const userInfo = ref(sessionAlive ? storedUser : null)
  const permissions = ref([])

  const isLoggedIn = computed(() => !!token.value)
  const roles = computed(() => (userInfo.value?.roleCode ? [userInfo.value.roleCode] : []))

  // 会话账号有效性校验的节流，避免每次路由跳转都请求用户信息
  let lastCheckAt = 0
  const CHECK_INTERVAL = 20000
  let permissionsLoaded = false
  let permVersion = 0

  async function login({ username, password }) {
    const res = await loginApi({ username, password })
    token.value = res.token
    userInfo.value = res.userInfo
    lastCheckAt = Date.now()
    localStorage.setItem(TOKEN_KEY, res.token)
    localStorage.setItem(USER_KEY, JSON.stringify(res.userInfo))
    await loadPermissions()
    return res
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
    // 管理员修改角色权限/角色/用户后，版本号变化会触发相关账号自动刷新
    const storedVersion = Number(localStorage.getItem('samp_perm_ver') || 0)
    if (permissionsLoaded && storedVersion === permVersion) return permissions.value
    // 先刷新当前用户信息（角色/状态可能已变更），再按最新角色重载权限
    try {
      if (userInfo.value?.id) {
        const fresh = await getUserInfoApi(userInfo.value.id)
        if (fresh) {
          userInfo.value = fresh
          localStorage.setItem(USER_KEY, JSON.stringify(fresh))
        }
      }
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

  // 登录态永久保存，不存在时间/空闲过期，仅在未登录或账号无效时视为失效
  function isSessionExpired() {
    return !token.value || !userInfo.value?.id
  }

  // 校验当前会话：账号是否仍然有效（存在且为启用状态）
  async function checkSession() {
    if (!token.value || !userInfo.value?.id) return false
    if (isSessionExpired()) {
      logout()
      return false
    }
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
      localStorage.setItem(USER_KEY, JSON.stringify(res))
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
      localStorage.setItem(USER_KEY, JSON.stringify(res))
    }
    return res
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    permissions.value = []
    permissionsLoaded = false
    lastCheckAt = 0
    clearStorage()
  }

  // 数据同步：跨标签页监听 localStorage 变化，管理员在其他标签页修改数据后本页实时刷新
  if (!storageSyncBound) {
    storageSyncBound = true
    window.addEventListener('storage', (e) => {
      if (e.key === 'samp_perm_ver') {
        ensurePermissions()
      } else if (e.key === USER_KEY) {
        const u = readStoredUser()
        if (u) {
          userInfo.value = u
          permissionsLoaded = false
          loadPermissions()
        }
      }
    })
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
    isSessionExpired,
    loadPermissions,
    refreshPermissions,
    ensurePermissions,
    hasPermission,
  }
})
