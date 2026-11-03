// 智慧农业综合管理平台「登录与个人中心」模块 - 数据接口层
// 说明：由于实训尚未联调后端，接口以模拟数据实现并模拟网络延迟，
// 函数签名与返回结构按前后端「接口契约」设计，后续可直接替换为 request.js 调用。
import {
  users,
  roles,
  tenants,
  loginLogs,
  operationLogs,
  notificationsDefaults,
  dashboardStats,
  todos,
  latestAlarms,
  permissionTree,
  rolePermissions,
} from './mock'

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

let userIdSeed = users.length
let roleIdSeed = roles.length
let tenantIdSeed = tenants.length

/* ------------------------- 认证 ------------------------- */
export async function loginApi({ username, password }) {
  await delay(500)
  const user = users.find((u) => u.username === username)
  if (!user || user.status !== 1) {
    throw new Error('账号不存在或已被停用')
  }
  if (password !== '123456') {
    throw new Error('密码错误')
  }
  return {
    token: `mock-token-${user.id}-${Date.now()}`,
    userInfo: { ...user },
  }
}

export async function getUserInfoApi(id) {
  await delay()
  return users.find((u) => u.id === id) || null
}

/* ------------------------- 个人中心 ------------------------- */
export async function updateProfileApi(payload) {
  await delay()
  const user = users.find((u) => u.id === payload.id)
  if (user) {
    Object.assign(user, payload, { username: user.username })
  }
  return { ...user }
}

export async function changePasswordApi({ id, oldPassword, newPassword }) {
  await delay()
  const user = users.find((u) => u.id === id)
  if (!user) throw new Error('用户不存在')
  if (oldPassword !== '123456') throw new Error('当前密码错误')
  return { success: true }
}

export async function getNotificationsApi() {
  await delay()
  return { ...notificationsDefaults }
}

export async function updateNotificationsApi(payload) {
  await delay()
  Object.assign(notificationsDefaults, payload)
  return { ...notificationsDefaults }
}

/* ------------------------- 仪表盘 ------------------------- */
export async function getDashboardApi() {
  await delay()
  return {
    stats: { ...dashboardStats },
    todos: todos.slice(0, 5),
    alarms: latestAlarms.slice(0, 4),
    alarmCount: dashboardStats.alarmCount,
  }
}

/* ------------------------- 用户管理 ------------------------- */
export async function getUserListApi() {
  await delay()
  return users.map((u) => ({ ...u }))
}

export async function saveUserApi(payload) {
  await delay()
  if (payload.id) {
    const idx = users.findIndex((u) => u.id === payload.id)
    if (idx > -1) users[idx] = { ...users[idx], ...payload }
    return { ...users[idx] }
  }
  userIdSeed += 1
  const record = {
    ...payload,
    id: userIdSeed,
    status: 1,
    createTime: new Date().toLocaleString('zh-CN', { hour12: false }),
  }
  users.unshift(record)
  return { ...record }
}

export async function deleteUserApi(id) {
  await delay()
  const idx = users.findIndex((u) => u.id === id)
  if (idx > -1) users.splice(idx, 1)
  return { success: true }
}

/* ------------------------- 角色管理 ------------------------- */
export async function getRoleListApi() {
  await delay()
  return roles.map((r) => ({ ...r, userCount: users.filter((u) => u.roleCode === r.code).length }))
}

export async function saveRoleApi(payload) {
  await delay()
  if (payload.id) {
    const idx = roles.findIndex((r) => r.id === payload.id)
    if (idx > -1) roles[idx] = { ...roles[idx], ...payload }
    return { ...roles[idx] }
  }
  roleIdSeed += 1
  const record = { ...payload, id: roleIdSeed, createTime: new Date().toLocaleString('zh-CN', { hour12: false }) }
  roles.push(record)
  return { ...record }
}

export async function deleteRoleApi(id) {
  await delay()
  const idx = roles.findIndex((r) => r.id === id)
  if (idx > -1) roles.splice(idx, 1)
  return { success: true }
}

/* ------------------------- 权限配置 ------------------------- */
export async function getPermissionTreeApi() {
  await delay()
  return JSON.parse(JSON.stringify(permissionTree))
}

export async function getRolePermissionApi(roleCode) {
  await delay()
  return (rolePermissions[roleCode] || []).slice()
}

export async function saveRolePermissionApi(roleCode, checkedKeys) {
  await delay()
  rolePermissions[roleCode] = checkedKeys
  return { success: true }
}

/* ------------------------- 租户管理 ------------------------- */
export async function getTenantListApi() {
  await delay()
  return tenants.map((t) => ({ ...t }))
}

export async function saveTenantApi(payload) {
  await delay()
  if (payload.id) {
    const idx = tenants.findIndex((t) => t.id === payload.id)
    if (idx > -1) tenants[idx] = { ...tenants[idx], ...payload }
    return { ...tenants[idx] }
  }
  tenantIdSeed += 1
  const record = { ...payload, id: tenantIdSeed, createTime: new Date().toLocaleString('zh-CN', { hour12: false }) }
  tenants.unshift(record)
  return { ...record }
}

export async function deleteTenantApi(id) {
  await delay()
  const idx = tenants.findIndex((t) => t.id === id)
  if (idx > -1) tenants.splice(idx, 1)
  return { success: true }
}

/* ------------------------- 日志审计 ------------------------- */
export async function getLoginLogsApi() {
  await delay()
  return loginLogs.map((l) => ({ ...l }))
}

export async function getOperationLogsApi() {
  await delay()
  return operationLogs.map((l) => ({ ...l }))
}

export async function backupApi() {
  await delay(600)
  return { file: 'samp_backup_20261103.sql', time: new Date().toLocaleString('zh-CN', { hour12: false }) }
}

export async function restoreApi() {
  await delay(600)
  return { success: true }
}