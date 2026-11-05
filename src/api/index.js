// 智慧农业综合管理平台「登录与个人中心」模块 - 数据接口层
// 说明：实训尚未联调后端，接口以本地持久化「数据库」实现（见 ./db.js）并模拟网络延迟，
// 数据增删改即时落盘，关闭后再次启动仍然保留。函数签名与返回结构按前后端「接口契约」设计，
// 后续可直接替换为 request.js 真实调用。
import {
  users,
  roles,
  tenants,
  loginLogs,
  operationLogs,
  notifications,
  rolePermissions,
  persist,
} from './db'
import {
  dashboardStats,
  todos,
  latestAlarms,
  permissionTree,
  overviewStats,
  parkSummaries,
  alarmTrend7d,
  gisParks,
  realtimeMetrics,
  waterFertilizerMonthly,
  waterFertilizerSummary,
  yieldForecastPie,
  yieldCompare,
  deviceStats,
  deviceOnlineRate7d,
  deviceFault7d,
  deviceTypeDist,
  deviceWorkOrders,
  alarmPanelStats,
  alarmTrend14d,
  alarmLevelDist,
  farmWeekly,
  farmOrders,
  controlDeviceGroups,
  controlDeviceSummary,
  linkageStrategies,
  sceneTemplates,
  controlGroups,
  fertilizerFormulas,
  fertilizerMachines,
  controlLogs,
  utilityDaily7d,
  utilityByPark,
  utilitySummary,
} from './mock'

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

// 基于现有记录生成自增主键
const nextId = (list) => list.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1

// 去除密码字段，避免敏感信息返回给前端
const stripPassword = (u) => {
  if (!u) return null
  const { password, ...safe } = u
  return safe
}

const now = () => new Date().toLocaleString('zh-CN', { hour12: false })

const detectBrowser = () => {
  const ua = navigator.userAgent
  if (ua.includes('Edg')) return 'Edge'
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Safari')) return 'Safari'
  return '浏览器'
}

const detectOS = () => {
  const ua = navigator.userAgent
  if (ua.includes('Windows')) return 'Windows'
  if (ua.includes('Mac')) return 'macOS'
  if (ua.includes('Linux')) return 'Linux'
  return '未知'
}

function recordLoginLog(username, name, status) {
  loginLogs.unshift({
    id: nextId(loginLogs),
    username,
    name: name || '匿名用户',
    ip: '127.0.0.1',
    location: '本机',
    browser: detectBrowser(),
    os: detectOS(),
    status,
    time: now(),
  })
  persist()
}

/* ------------------------- 认证 ------------------------- */
export async function loginApi({ username, password }) {
  await delay(500)
  const user = users.find((u) => u.username === username)
  if (!user) {
    recordLoginLog(username, '', 0)
    throw new Error('账号不存在或已被停用')
  }
  if (user.status !== 1) {
    recordLoginLog(user.username, user.name, 0)
    throw new Error('账号不存在或已被停用')
  }
  if (password !== (user.password || '123456')) {
    recordLoginLog(user.username, user.name, 0)
    throw new Error('密码错误')
  }
  recordLoginLog(user.username, user.name, 1)
  return {
    token: `mock-token-${user.id}-${Date.now()}`,
    userInfo: stripPassword(user),
  }
}

export async function getUserInfoApi(id) {
  await delay()
  return stripPassword(users.find((u) => u.id === id))
}

export async function resetPasswordApi({ username, phone, newPassword }) {
  await delay()
  const user = users.find((u) => u.username === username)
  if (!user) throw new Error('账号不存在')
  if (user.phone !== phone) throw new Error('预留手机号不匹配')
  user.password = newPassword
  persist()
  return { success: true }
}

/* ------------------------- 个人中心 ------------------------- */
export async function updateProfileApi(payload) {
  await delay()
  const user = users.find((u) => u.id === payload.id)
  if (user) {
    const { password, ...rest } = payload
    Object.assign(user, rest, { username: user.username })
    persist()
  }
  return stripPassword(user)
}

export async function changePasswordApi({ id, oldPassword, newPassword }) {
  await delay()
  const user = users.find((u) => u.id === id)
  if (!user) throw new Error('用户不存在')
  if (oldPassword !== (user.password || '123456')) throw new Error('当前密码错误')
  user.password = newPassword
  persist()
  return { success: true }
}

export async function getNotificationsApi() {
  await delay()
  return { ...notifications }
}

export async function updateNotificationsApi(payload) {
  await delay()
  Object.assign(notifications, payload)
  persist()
  return { ...notifications }
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
  return users.map((u) => stripPassword(u))
}

export async function saveUserApi(payload) {
  await delay()
  const { password, ...data } = payload
  if (data.id) {
    const idx = users.findIndex((u) => u.id === data.id)
    if (idx > -1) users[idx] = { ...users[idx], ...data }
    persist()
    return stripPassword(users[idx])
  }
  const record = {
    ...data,
    id: nextId(users),
    password: '123456',
    avatar: '',
    status: data.status ?? 1,
    createTime: now(),
  }
  users.unshift(record)
  persist()
  return stripPassword(record)
}

export async function deleteUserApi(id) {
  await delay()
  const idx = users.findIndex((u) => u.id === id)
  if (idx > -1) users.splice(idx, 1)
  persist()
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
    persist()
    return { ...roles[idx] }
  }
  const record = { ...payload, id: nextId(roles), createTime: now() }
  roles.push(record)
  persist()
  return { ...record }
}

export async function deleteRoleApi(id) {
  await delay()
  const idx = roles.findIndex((r) => r.id === id)
  if (idx > -1) roles.splice(idx, 1)
  persist()
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
  persist()
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
    persist()
    return { ...tenants[idx] }
  }
  const record = { ...payload, id: nextId(tenants), createTime: now() }
  tenants.unshift(record)
  persist()
  return { ...record }
}

export async function deleteTenantApi(id) {
  await delay()
  const idx = tenants.findIndex((t) => t.id === id)
  if (idx > -1) tenants.splice(idx, 1)
  persist()
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
  return { file: 'samp_backup_20261103.sql', time: now() }
}

export async function restoreApi() {
  await delay(600)
  return { success: true }
}

/* ------------------------- 数据展示 ------------------------- */
export async function getDataOverviewApi() {
  await delay()
  return {
    stats: { ...overviewStats },
    parks: parkSummaries.map((p) => ({ ...p })),
    alarmTrend: { ...alarmTrend7d },
  }
}

export async function getGisParksApi() {
  await delay()
  return JSON.parse(JSON.stringify(gisParks))
}

export async function getRealtimeMetricsApi() {
  await delay()
  return JSON.parse(JSON.stringify(realtimeMetrics))
}

export async function getWaterFertilizerApi() {
  await delay()
  return {
    monthly: { ...waterFertilizerMonthly },
    summary: { ...waterFertilizerSummary },
    forecastPie: yieldForecastPie.map((i) => ({ ...i })),
    compare: { ...yieldCompare },
  }
}

export async function getDeviceDashboardApi() {
  await delay()
  return {
    stats: { ...deviceStats },
    onlineRate: { ...deviceOnlineRate7d },
    fault: { ...deviceFault7d },
    typeDist: deviceTypeDist.map((i) => ({ ...i })),
    workOrders: deviceWorkOrders.map((o) => ({ ...o })),
  }
}

export async function getAlarmFarmPanelApi() {
  await delay()
  return {
    stats: { ...alarmPanelStats },
    trend: { ...alarmTrend14d },
    levelDist: alarmLevelDist.map((i) => ({ ...i })),
    farmWeekly: { ...farmWeekly },
    farmOrders: farmOrders.map((o) => ({ ...o })),
  }
}

/* ------------------------- 远程智能控制与水肥 ------------------------- */
export async function getControlDevicesApi() {
  await delay()
  return {
    summary: { ...controlDeviceSummary },
    groups: JSON.parse(JSON.stringify(controlDeviceGroups)),
  }
}

export async function controlDeviceApi(id, action) {
  await delay(500)
  const all = controlDeviceGroups.flatMap((g) => g.devices)
  const device = all.find((d) => d.id === id)
  if (!device) throw new Error('设备不存在')
  if (device.status === 'offline') throw new Error(`「${device.name}」当前离线，无法控制`)
  device.status = action === 'start' ? 'running' : 'stopped'
  return { ...device }
}

export async function getLinkageStrategiesApi() {
  await delay()
  return {
    strategies: JSON.parse(JSON.stringify(linkageStrategies)),
    templates: sceneTemplates.map((t) => ({ ...t })),
  }
}

export async function toggleStrategyApi(id, enabled) {
  await delay()
  const s = linkageStrategies.find((i) => i.id === id)
  if (s) s.enabled = enabled
  return { success: true }
}

export async function toggleSceneTemplateApi(id, enabled) {
  await delay()
  const t = sceneTemplates.find((i) => i.id === id)
  if (t) t.enabled = enabled
  return { success: true }
}

export async function saveStrategyApi(payload) {
  await delay()
  if (payload.id) {
    const idx = linkageStrategies.findIndex((s) => s.id === payload.id)
    if (idx > -1) linkageStrategies[idx] = { ...linkageStrategies[idx], ...payload }
    return { ...linkageStrategies[idx] }
  }
  const record = { ...payload, id: `LS-${String(linkageStrategies.length + 1).padStart(3, '0')}`, lastTrigger: '--' }
  linkageStrategies.push(record)
  return { ...record }
}

export async function deleteStrategyApi(id) {
  await delay()
  const idx = linkageStrategies.findIndex((s) => s.id === id)
  if (idx > -1) linkageStrategies.splice(idx, 1)
  return { success: true }
}

export async function getControlGroupsApi() {
  await delay()
  return JSON.parse(JSON.stringify(controlGroups))
}

export async function toggleGroupLockApi(id, locked) {
  await delay()
  const g = controlGroups.find((i) => i.id === id)
  if (g) g.locked = locked
  return { success: true }
}

export async function groupControlApi(id, action) {
  await delay(600)
  const g = controlGroups.find((i) => i.id === id)
  if (!g) throw new Error('分组不存在')
  if (g.locked) throw new Error(`「${g.name}」已上锁，禁止批量操作`)
  return { success: true, affected: g.deviceCount }
}

export async function getFertilizerApi() {
  await delay()
  return {
    formulas: fertilizerFormulas.map((f) => ({ ...f })),
    machines: fertilizerMachines.map((m) => ({ ...m })),
  }
}

export async function saveFormulaApi(payload) {
  await delay()
  if (payload.id) {
    const idx = fertilizerFormulas.findIndex((f) => f.id === payload.id)
    if (idx > -1) fertilizerFormulas[idx] = { ...fertilizerFormulas[idx], ...payload }
    return { ...fertilizerFormulas[idx] }
  }
  const record = { ...payload, id: `FF-${String(fertilizerFormulas.length + 1).padStart(2, '0')}` }
  fertilizerFormulas.push(record)
  return { ...record }
}

export async function deleteFormulaApi(id) {
  await delay()
  const idx = fertilizerFormulas.findIndex((f) => f.id === id)
  if (idx > -1) fertilizerFormulas.splice(idx, 1)
  return { success: true }
}

export async function applyFormulaApi(machineId, formulaName) {
  await delay(600)
  const m = fertilizerMachines.find((i) => i.id === machineId)
  if (!m) throw new Error('水肥一体机不存在')
  m.currentFormula = formulaName
  return { ...m }
}

export async function toggleMachineApi(id, action) {
  await delay(500)
  const m = fertilizerMachines.find((i) => i.id === id)
  if (!m) throw new Error('水肥一体机不存在')
  m.status = action === 'start' ? 'running' : 'stopped'
  if (m.status === 'stopped') m.flowRate = 0
  return { ...m }
}

export async function getControlLogsApi() {
  await delay()
  return controlLogs.map((l) => ({ ...l }))
}

export async function getUtilityStatsApi() {
  await delay()
  return {
    summary: { ...utilitySummary },
    daily: { ...utilityDaily7d },
    byPark: utilityByPark.map((p) => ({ ...p })),
  }
}