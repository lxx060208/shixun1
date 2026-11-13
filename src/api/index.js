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
  db,
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
  alarmRealtimeList,
  alarmRules,
  alarmHistoryList,
  alarmStatisticsSummary,
  alarmTypeDist,
  alarmParkDist,
  alarmHandleDurationDist,
  salesProducts,
  salesOrders,
  salesShipments,
  salesCustomers,
  farmCrops,
  farmSoilTypes,
  farmOperationTypes,
  farmPlotNameList,
  farmers,
  farmPlots,
  farmPlantPlans,
  farmWorkOrders,
  farmRecords,
  farmMaterials,
  farmPurchases,
  farmHarvestBatches,
  expertFields,
  knowledgeExperts,
  knowledgeCategories,
  knowledgeArticles,
  knowledgePests,
  knowledgePlans,
} from './mock'

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

// 基于现有记录生成自增主键
const nextId = (list) => list.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1

// 去除密码字段，避免敏感信息返回给前端
const stripPassword = (u) => {
  if (!u) return null
  const { password, failedAttempts, lockedUntil, ...safe } = u
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

// 取当前登录操作人，用于写入操作日志（日志跟随业务操作一同落盘）
function currentOperator() {
  try {
    const u = JSON.parse(sessionStorage.getItem('samp_user') || 'null')
    return { username: u?.username || 'system', name: u?.name || '系统' }
  } catch {
    return { username: 'system', name: '系统' }
  }
}

function recordOperationLog(module, operation, content) {
  const operator = currentOperator()
  operationLogs.unshift({
    id: nextId(operationLogs),
    username: operator.username,
    name: operator.name,
    module,
    operation,
    content,
    ip: '127.0.0.1',
    time: now(),
  })
}

/* ------------------------- 认证 ------------------------- */
// 登录防暴力破解策略：连续失败 5 次锁定账号 10 分钟，连续失败 3 次起升级验证码难度
const MAX_LOGIN_ATTEMPTS = 5
const LOCK_MINUTES = 10
export const CAPTCHA_ESCALATE_AT = 3

const loginError = (message, extra = {}) => Object.assign(new Error(message), extra)

export async function loginApi({ username, password }) {
  await delay(500)
  const user = users.find((u) => u.username === username)
  if (!user) {
    recordLoginLog(username, '', 0)
    throw loginError('账号不存在或已被停用')
  }
  if (user.status !== 1) {
    recordLoginLog(user.username, user.name, 0)
    throw loginError('账号不存在或已被停用')
  }

  // 锁定期内即使密码正确也拒绝登录
  if (user.lockedUntil && Date.now() < user.lockedUntil) {
    recordLoginLog(user.username, user.name, 0)
    const remain = Math.ceil((user.lockedUntil - Date.now()) / 60000)
    throw loginError(`账号已锁定，请 ${remain} 分钟后再试`, {
      code: 'ACCOUNT_LOCKED',
      failedAttempts: user.failedAttempts || MAX_LOGIN_ATTEMPTS,
    })
  }
  // 锁定期已过，重新计数
  if (user.lockedUntil && Date.now() >= user.lockedUntil) {
    user.lockedUntil = 0
    user.failedAttempts = 0
  }

  if (password !== (user.password || '123456')) {
    user.failedAttempts = (user.failedAttempts || 0) + 1
    const attempts = user.failedAttempts
    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      user.lockedUntil = Date.now() + LOCK_MINUTES * 60 * 1000
      persist()
      recordLoginLog(user.username, user.name, 0)
      throw loginError(`密码连续错误 ${MAX_LOGIN_ATTEMPTS} 次，账号已锁定 ${LOCK_MINUTES} 分钟`, {
        code: 'ACCOUNT_LOCKED',
        failedAttempts: attempts,
      })
    }
    persist()
    recordLoginLog(user.username, user.name, 0)
    throw loginError(`密码错误，您还可尝试 ${MAX_LOGIN_ATTEMPTS - attempts} 次，超过将锁定账号`, {
      code: 'PASSWORD_ERROR',
      failedAttempts: attempts,
    })
  }

  // 登录成功：清除失败计数与锁定状态
  user.failedAttempts = 0
  user.lockedUntil = 0
  persist()
  recordLoginLog(user.username, user.name, 1)
  return {
    token: `mock-token-${user.id}-${Date.now()}`,
    userInfo: stripPassword(user),
  }
}

export async function getUserInfoApi(id) {
  await delay()
  const user = users.find((u) => u.id === id)
  if (!user) throw new Error('用户不存在')
  if (user.status !== 1) throw new Error('账号已被停用')
  return stripPassword(user)
}

export async function resetPasswordApi({ username, phone, newPassword }) {
  await delay()
  const user = users.find((u) => u.username === username)
  if (!user) throw new Error('账号不存在')
  if (user.phone !== phone) throw new Error('预留手机号不匹配')
  user.password = newPassword
  // 重置密码同样使所有已签发 token 失效
  user.passwordChangedAt = Date.now()
  // 重置密码后解除失败计数与锁定，避免用户被永久锁死
  user.failedAttempts = 0
  user.lockedUntil = 0
  user.mustChangePassword = false
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
  // 后端与前端保持一致的密码强度校验
  if (!newPassword) throw new Error('新密码不能为空')
  if (newPassword.length < 8 || newPassword.length > 20) throw new Error('新密码长度须为 8-20 位')
  if (newPassword === oldPassword) throw new Error('新密码不能与当前密码相同')
  const classes = [
    /[a-z]/.test(newPassword),
    /[A-Z]/.test(newPassword),
    /\d/.test(newPassword),
    /[^A-Za-z0-9]/.test(newPassword),
  ].filter(Boolean).length
  if (classes < 3) throw new Error('新密码强度不足：至少包含小写字母、大写字母、数字、特殊符号中的 3 类')

  user.password = newPassword
  // 记录改密时间：签发时间早于该时刻的旧 token 全部失效（含其他设备会话）
  user.passwordChangedAt = Date.now()
  // 已修改初始密码，解除首次登录强制改密标记
  user.mustChangePassword = false
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
  const username = (data.username || '').trim()
  if (!username) throw new Error('用户名不能为空')
  // 用户名全局唯一（不区分大小写），避免登录时按顺序命中造成身份混淆
  const duplicated = users.some(
    (u) => u.username.toLowerCase() === username.toLowerCase() && u.id !== data.id,
  )
  if (duplicated) throw new Error(`用户名「${username}」已存在，请更换`)
  data.username = username
  if (data.id) {
    const idx = users.findIndex((u) => u.id === data.id)
    if (idx > -1) {
      users[idx] = { ...users[idx], ...data }
      recordOperationLog('用户管理', '编辑用户', `修改用户「${users[idx].name}（${users[idx].username}）」的信息`)
    }
    persist()
    return stripPassword(users[idx])
  }
  // 新增用户必须由管理员设置初始密码，并标记首次登录强制修改
  if (!/^(?=.*[A-Za-z])(?=.*\d)[\w!@#$%^&*]{8,20}$/.test(password || '')) {
    throw new Error('初始密码需为 8-20 位且同时包含字母和数字')
  }
  const record = {
    ...data,
    id: nextId(users),
    password,
    mustChangePassword: true,
    avatar: '',
    status: data.status ?? 1,
    createTime: now(),
  }
  users.unshift(record)
  recordOperationLog('用户管理', '新增用户', `新增用户「${record.name}（${record.username}）」`)
  persist()
  return stripPassword(record)
}

export async function deleteUserApi(id, currentUserId) {
  await delay()
  // 禁止删除当前登录账号，避免删除后会话失效且无法找回
  if (currentUserId && id === currentUserId) throw new Error('不能删除当前登录账号')
  const idx = users.findIndex((u) => u.id === id)
  if (idx > -1) {
    const [removed] = users.splice(idx, 1)
    recordOperationLog('用户管理', '删除用户', `删除用户「${removed.name}（${removed.username}）」`)
  }
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
    if (idx > -1) {
      roles[idx] = { ...roles[idx], ...payload }
      recordOperationLog('角色权限', '编辑角色', `修改角色「${roles[idx].name}（${roles[idx].code}）」`)
    }
    persist()
    return { ...roles[idx] }
  }
  const record = { ...payload, id: nextId(roles), createTime: now() }
  roles.push(record)
  recordOperationLog('角色权限', '新增角色', `新增角色「${record.name}（${record.code}）」`)
  persist()
  return { ...record }
}

export async function deleteRoleApi(id) {
  await delay()
  const role = roles.find((r) => r.id === id)
  if (!role) throw new Error('角色不存在')
  // 仍被用户引用的角色不允许删除，避免用户角色编码悬空导致权限判定异常
  const usedCount = users.filter((u) => u.roleCode === role.code).length
  if (usedCount > 0) {
    throw new Error(`角色「${role.name}」仍被 ${usedCount} 名用户使用，无法删除`)
  }
  const idx = roles.findIndex((r) => r.id === id)
  if (idx > -1) roles.splice(idx, 1)
  recordOperationLog('角色权限', '删除角色', `删除角色「${role.name}（${role.code}）」`)
  // 同步清理该角色的权限配置，避免残留脏数据
  delete rolePermissions[role.code]
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
  const roleName = roles.find((r) => r.code === roleCode)?.name || roleCode
  recordOperationLog('角色权限', '修改权限', `调整「${roleName}」角色的权限，共 ${checkedKeys.length} 项`)
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
  const code = (payload.code || '').trim()
  if (!code) throw new Error('租户编码不能为空')
  // 租户编码全局唯一（不区分大小写），避免后续按编码识别租户时产生数据归属歧义
  const duplicated = tenants.some(
    (t) => t.code.toLowerCase() === code.toLowerCase() && t.id !== payload.id,
  )
  if (duplicated) throw new Error(`租户编码「${code}」已存在，请更换`)
  if (payload.id) {
    const idx = tenants.findIndex((t) => t.id === payload.id)
    if (idx > -1) {
      tenants[idx] = { ...tenants[idx], ...payload, code }
      recordOperationLog('租户管理', '编辑租户', `修改租户「${tenants[idx].name}（${code}）」`)
    }
    persist()
    return { ...tenants[idx] }
  }
  const record = { ...payload, code, id: nextId(tenants), createTime: now() }
  tenants.unshift(record)
  recordOperationLog('租户管理', '新增租户', `新增租户「${record.name}（${code}）」`)
  persist()
  return { ...record }
}

export async function deleteTenantApi(id) {
  await delay()
  const tenant = tenants.find((t) => t.id === id)
  if (!tenant) throw new Error('租户不存在')

  // 检查所有与租户名称相关联的业务数据，阻断删除以避免产生无归属的孤立数据
  const refs = []
  const T = tenant.name

  // 1. 园区概览与 GIS 数据
  const parkCount = parkSummaries.filter((p) => p.name === T).length
  if (parkCount) refs.push(`园区概览 ${parkCount} 条`)
  const gisCount = gisParks.filter((p) => p.name === T).length
  if (gisCount) refs.push(`GIS 园区 ${gisCount} 条`)

  // 2. 设备与远程控制
  const devCount = controlDeviceGroups.filter((g) => g.park === T).length
  if (devCount) refs.push(`设备控制台 ${devCount} 组`)

  // 3. 告警数据
  const alarmRt = alarmRealtimeList.filter((a) => a.park === T).length
  if (alarmRt) refs.push('实时告警')
  const alarmHis = alarmHistoryList.filter((a) => a.park === T).length
  if (alarmHis) refs.push(`历史告警 ${alarmHis} 条`)

  // 4. 产销对接（农产品 + 其关联订单）
  const prodCount = salesProducts.filter((p) => p.park === T).length
  if (prodCount) refs.push(`农产品 ${prodCount} 个`)
  const prodIds = salesProducts.filter((p) => p.park === T).map((p) => p.id)
  const orderCount = salesOrders.filter((o) => prodIds.includes(o.productId)).length
  if (orderCount) refs.push(`销售订单 ${orderCount} 单`)

  // 5. 农事数据
  const plotCount = farmPlots.filter((p) => p.location === T).length
  if (plotCount) refs.push(`地块档案 ${plotCount} 块`)

  if (refs.length > 0) {
    throw new Error(
      `租户「${T}」名下仍有 ${refs.join('、')} 等业务数据，请先处理迁移后再删除`,
    )
  }

  const idx = tenants.findIndex((t) => t.id === id)
  const [removed] = tenants.splice(idx, 1)
  recordOperationLog('租户管理', '删除租户', `删除租户「${removed.name}」(联系人 ${removed.contact})`)
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

// 备份文件存放在独立的 localStorage 键中，内容为整库 JSON 快照
const BACKUP_KEY = 'samp_db_backups'
const BACKUP_LIMIT = 10

function readBackups() {
  try {
    const list = JSON.parse(localStorage.getItem(BACKUP_KEY) || '[]')
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${bytes} B`
}

function backupFileName(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return `samp_backup_${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}.json`
}

export async function getBackupListApi() {
  await delay()
  return readBackups().map(({ id, file, time, size }) => ({ id, file, time, size }))
}

export async function backupApi() {
  await delay(600)
  // 真实快照：把当前整库序列化成备份文件内容
  const snapshot = JSON.stringify(db)
  const bytes = new Blob([snapshot]).size
  const record = {
    id: `bk_${Date.now()}`,
    file: backupFileName(),
    time: now(),
    size: formatSize(bytes),
    snapshot,
  }
  let list = [record, ...readBackups()].slice(0, BACKUP_LIMIT)
  // 本地存储空间不足时逐步丢弃最旧的备份，保证本次备份可用
  while (list.length) {
    try {
      localStorage.setItem(BACKUP_KEY, JSON.stringify(list))
      break
    } catch {
      list = list.slice(0, list.length - 1)
    }
  }
  if (!list.length) throw new Error('本地存储空间不足，备份失败')
  const { snapshot: _snapshot, ...meta } = record
  return meta
}

export async function restoreApi(backupId) {
  await delay(600)
  const list = readBackups()
  if (!list.length) throw new Error('暂无可恢复的备份文件')
  const target = backupId ? list.find((b) => b.id === backupId) : list[0]
  if (!target) throw new Error('备份文件不存在或已被删除')

  let data
  try {
    data = JSON.parse(target.snapshot)
  } catch {
    throw new Error('备份文件已损坏，无法恢复')
  }
  if (!data || !Array.isArray(data.users) || data.users.length === 0) {
    throw new Error('备份文件内容无效，无法恢复')
  }

  // 原地回写各数据表（保持其它模块已引用的数组对象不变）
  const clone = (v) => JSON.parse(JSON.stringify(v))
  const tables = ['users', 'roles', 'tenants', 'loginLogs', 'operationLogs', 'rolePermissions', 'notifications']
  tables.forEach((key) => {
    if (Array.isArray(data[key]) && Array.isArray(db[key])) {
      db[key].splice(0, db[key].length, ...clone(data[key]))
    } else if (data[key] && typeof data[key] === 'object' && db[key] && typeof db[key] === 'object') {
      Object.keys(db[key]).forEach((k) => delete db[key][k])
      Object.assign(db[key], clone(data[key]))
    }
  })
  persist()
  // 权限配置可能被还原，通知权限模块重新加载
  localStorage.setItem('samp_perm_ver', String(Date.now()))
  return { success: true, file: target.file, time: target.time }
}

export async function downloadBackupApi(backupId) {
  await delay()
  const target = readBackups().find((b) => b.id === backupId)
  if (!target) throw new Error('备份文件不存在或已被删除')
  return { file: target.file, content: target.snapshot }
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

/* ------------------------- 告警消息中心 ------------------------- */
const stampNow = () => {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

// 根据操作人姓名解析所属角色，用于流转记录展示
const roleOf = (name) => {
  const user = users.find((u) => u.name === name)
  const role = user ? roles.find((r) => r.code === user.roleCode) : null
  return role ? role.name : '系统'
}

const findAlarm = (id) => {
  const alarm = alarmRealtimeList.find((a) => a.id === id)
  if (!alarm) throw new Error('告警记录不存在')
  return alarm
}

export async function getAlarmRealtimeApi() {
  await delay()
  const list = alarmRealtimeList
    .map((a) => ({ ...a }))
    .sort((x, y) => (x.time > y.time ? -1 : 1))
  const total = list.length
  const pending = list.filter((a) => a.status === '待处置').length
  const confirmed = list.filter((a) => a.status === '已确认').length
  const handled = list.filter((a) => a.status === '已处置').length
  const archived = list.filter((a) => a.status === '已归档').length
  return {
    list,
    stats: {
      today: total,
      pending,
      confirmed,
      handled,
      archived,
      severe: list.filter((a) => a.level === '严重').length,
      handledRate: total ? Math.round(((handled + archived) / total) * 1000) / 10 : 0,
    },
  }
}

export async function confirmAlarmApi(id, operator) {
  await delay(300)
  const alarm = findAlarm(id)
  if (alarm.status !== '待处置') throw new Error(`当前告警为「${alarm.status}」，无需重复确认`)
  alarm.status = '已确认'
  alarm.confirmedBy = operator || '系统管理员'
  alarm.confirmedAt = stampNow()
  return { ...alarm }
}

export async function handleAlarmApi(id, { operator, note } = {}) {
  await delay(400)
  const alarm = findAlarm(id)
  if (alarm.status !== '已确认') throw new Error(`当前告警为「${alarm.status}」，请先确认后再处置`)
  if (!note) throw new Error('请填写处置说明')
  alarm.status = '已处置'
  alarm.handledBy = operator || '系统管理员'
  alarm.handledAt = stampNow()
  alarm.handleNote = note
  return { ...alarm }
}

export async function archiveAlarmApi(id, operator) {
  await delay(300)
  const alarm = findAlarm(id)
  if (alarm.status !== '已处置') throw new Error(`当前告警为「${alarm.status}」，仅已处置告警可归档`)
  alarm.status = '已归档'
  alarm.archivedBy = operator || '系统管理员'
  alarm.archivedAt = stampNow()
  return { ...alarm }
}

export async function getAlarmFlowApi() {
  await delay()
  const list = alarmRealtimeList
    .map((a) => ({ ...a }))
    .sort((x, y) => (x.time > y.time ? -1 : 1))
  const records = []
  let rid = 1
  list.forEach((a) => {
    records.push({
      id: rid++,
      alarmId: a.id,
      device: a.device,
      level: a.level,
      node: '告警产生',
      operator: '系统',
      role: '监测规则',
      time: a.time,
      remark: a.desc,
    })
    if (a.confirmedAt) {
      records.push({
        id: rid++,
        alarmId: a.id,
        device: a.device,
        level: a.level,
        node: '确认',
        operator: a.confirmedBy,
        role: roleOf(a.confirmedBy),
        time: a.confirmedAt,
        remark: '已确认真实告警，进入处置环节',
      })
    }
    if (a.handledAt) {
      records.push({
        id: rid++,
        alarmId: a.id,
        device: a.device,
        level: a.level,
        node: '处置',
        operator: a.handledBy,
        role: roleOf(a.handledBy),
        time: a.handledAt,
        remark: a.handleNote,
      })
    }
    if (a.archivedAt) {
      records.push({
        id: rid++,
        alarmId: a.id,
        device: a.device,
        level: a.level,
        node: '归档',
        operator: a.archivedBy,
        role: roleOf(a.archivedBy),
        time: a.archivedAt,
        remark: '告警闭环完成，资料已归档',
      })
    }
  })
  return {
    list,
    records,
    stats: {
      pending: list.filter((a) => a.status === '待处置').length,
      confirmed: list.filter((a) => a.status === '已确认').length,
      handled: list.filter((a) => a.status === '已处置').length,
      archived: list.filter((a) => a.status === '已归档').length,
    },
  }
}

export async function getAlarmRulesApi() {
  await delay()
  return alarmRules.map((r) => ({ ...r, notify: r.notify.slice() }))
}

export async function saveAlarmRuleApi(payload) {
  await delay()
  if (payload.id) {
    const idx = alarmRules.findIndex((r) => r.id === payload.id)
    if (idx === -1) throw new Error('告警规则不存在')
    alarmRules[idx] = { ...alarmRules[idx], ...payload, notify: (payload.notify || alarmRules[idx].notify).slice() }
    return { ...alarmRules[idx] }
  }
  const record = {
    ...payload,
    id: nextId(alarmRules),
    notify: (payload.notify || ['站内消息']).slice(),
    enabled: payload.enabled ?? true,
    creator: payload.creator || '系统管理员',
    createTime: stampNow(),
    lastTriggerTime: '—',
  }
  alarmRules.unshift(record)
  return { ...record }
}

export async function toggleAlarmRuleApi(id, enabled) {
  await delay(200)
  const rule = alarmRules.find((r) => r.id === id)
  if (!rule) throw new Error('告警规则不存在')
  rule.enabled = enabled
  return { ...rule }
}

export async function deleteAlarmRuleApi(id) {
  await delay()
  const idx = alarmRules.findIndex((r) => r.id === id)
  if (idx > -1) alarmRules.splice(idx, 1)
  return { success: true }
}

export async function getAlarmHistoryApi(params = {}) {
  await delay()
  const { keyword = '', level = '', status = '', source = '', park = '', dateRange = [], page = 1, pageSize = 10 } = params
  const kw = keyword.trim()
  const list = alarmHistoryList
    .filter((item) => {
      if (level && item.level !== level) return false
      if (status && item.status !== status) return false
      if (source && item.source !== source) return false
      if (park && item.park !== park) return false
      if (dateRange && dateRange.length === 2) {
        const day = item.time.slice(0, 10)
        if (day < dateRange[0] || day > dateRange[1]) return false
      }
      if (kw) {
        const text = `${item.id} ${item.device} ${item.type} ${item.plot} ${item.park}`
        if (!text.includes(kw)) return false
      }
      return true
    })
    .sort((a, b) => (a.time > b.time ? -1 : 1))
  const total = list.length
  const start = (page - 1) * pageSize
  return { list: list.slice(start, start + pageSize).map((i) => ({ ...i })), total }
}

export async function getAlarmStatisticsApi() {
  await delay()
  const sum = (arr) => arr.reduce((acc, n) => acc + n, 0)
  return {
    summary: { ...alarmStatisticsSummary },
    trend: { ...alarmTrend14d },
    levelDist: alarmLevelDist.map((i) => ({ ...i })),
    typeDist: alarmTypeDist.map((i) => ({ ...i })),
    parkDist: alarmParkDist.map((i) => ({ ...i })),
    handleDuration: { ranges: alarmHandleDurationDist.ranges.slice(), values: alarmHandleDurationDist.values.slice() },
    sourceDist: [
      { name: '环境告警', value: sum(alarmTrend14d.env) },
      { name: '设备告警', value: sum(alarmTrend14d.device) },
      { name: '安防告警', value: sum(alarmTrend14d.security) },
    ],
  }
}

/* ------------------------- 产销对接与订单管理 ------------------------- */
const roundMoney = (n) => Math.round(n * 100) / 100
const salesSum = (list, key) => list.reduce((sum, item) => sum + (item[key] || 0), 0)

const findSalesProduct = (id) => salesProducts.find((p) => p.id === id)
const findSalesCustomer = (id) => salesCustomers.find((c) => c.id === id)

// 已支付口径：待支付订单不计入销售额、销量与客户采购
const salesPaidOrders = () => salesOrders.filter((o) => o.status !== '待支付')

const decorateProduct = (product) => {
  const rows = salesPaidOrders().filter((o) => o.productId === product.id)
  return {
    ...product,
    monthSales: salesSum(rows, 'qty'),
    monthAmount: roundMoney(salesSum(rows, 'amount')),
  }
}

const decorateOrder = (order) => {
  const customer = findSalesCustomer(order.customerId)
  return {
    ...order,
    customer: customer ? customer.name : order.customer,
    customerLevel: customer ? customer.level : order.customerLevel,
  }
}

const salesDateString = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export async function getProductsApi(params = {}) {
  await delay()
  const { keyword = '', category = '', status = '', park = '', page = 1, pageSize = 10 } = params
  const kw = keyword.trim()
  const list = salesProducts
    .map(decorateProduct)
    .filter((p) => {
      if (category && p.category !== category) return false
      if (status && p.status !== status) return false
      if (park && p.park !== park) return false
      if (kw) {
        const text = `${p.id} ${p.name} ${p.variety} ${p.grade} ${p.spec}`
        if (!text.includes(kw)) return false
      }
      return true
    })
    .sort((a, b) => (a.updateTime > b.updateTime ? -1 : 1))
  const total = list.length
  const start = (page - 1) * pageSize
  return {
    list: list.slice(start, start + pageSize),
    total,
    onShelf: salesProducts.filter((p) => p.status === '上架').length,
    offShelf: salesProducts.filter((p) => p.status === '下架').length,
    lowStock: salesProducts.filter((p) => p.status === '上架' && p.stock < 200).length,
  }
}

export async function saveProductApi(payload) {
  await delay()
  const { id, ...data } = payload
  if (id) {
    const idx = salesProducts.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error('农产品不存在')
    salesProducts[idx] = { ...salesProducts[idx], ...data, updateTime: stampNow() }
    return decorateProduct(salesProducts[idx])
  }
  const max = salesProducts.reduce((m, p) => Math.max(m, Number(p.id.slice(1)) || 0), 0)
  const record = {
    image: '',
    stock: 0,
    status: '上架',
    park: '南山智慧农业示范园',
    description: '',
    ...data,
    id: `P${String(max + 1).padStart(3, '0')}`,
    updateTime: stampNow(),
  }
  salesProducts.unshift(record)
  return decorateProduct(record)
}

export async function toggleProductStatusApi(id, status) {
  await delay(200)
  const product = findSalesProduct(id)
  if (!product) throw new Error('农产品不存在')
  product.status = status
  product.updateTime = stampNow()
  return decorateProduct(product)
}

export async function deleteProductApi(id) {
  await delay()
  const idx = salesProducts.findIndex((p) => p.id === id)
  if (idx === -1) throw new Error('农产品不存在')
  if (salesOrders.some((o) => o.productId === id)) {
    throw new Error('该农产品已有订单记录，无法删除，可先执行下架')
  }
  salesProducts.splice(idx, 1)
  return { success: true }
}

export async function getOrdersApi(params = {}) {
  await delay()
  const { keyword = '', status = '', customerId = '', dateRange = [], page = 1, pageSize = 10 } = params
  const kw = keyword.trim()
  const list = salesOrders
    .map(decorateOrder)
    .filter((o) => {
      if (status && o.status !== status) return false
      if (customerId && o.customerId !== customerId) return false
      if (dateRange && dateRange.length === 2) {
        const day = o.createTime.slice(0, 10)
        if (day < dateRange[0] || day > dateRange[1]) return false
      }
      if (kw) {
        const text = `${o.orderNo} ${o.customer} ${o.product} ${o.logisticsNo}`
        if (!text.includes(kw)) return false
      }
      return true
    })
    .sort((a, b) => (a.createTime > b.createTime ? -1 : a.createTime < b.createTime ? 1 : b.id - a.id))
  const total = list.length
  const start = (page - 1) * pageSize
  const paid = salesPaidOrders()
  return {
    list: list.slice(start, start + pageSize),
    total,
    stats: {
      pending: salesOrders.filter((o) => o.status === '待支付').length,
      shipped: salesOrders.filter((o) => o.status === '已发货').length,
      finished: salesOrders.filter((o) => o.status === '已完成').length,
      amount: roundMoney(salesSum(paid, 'amount')),
    },
  }
}

export async function createOrderApi(payload) {
  await delay(400)
  const product = findSalesProduct(payload.productId)
  if (!product) throw new Error('请选择农产品')
  if (product.status !== '上架') throw new Error(`「${product.name}」已下架，无法下单`)
  const customer = findSalesCustomer(payload.customerId)
  if (!customer) throw new Error('请选择下单客户')
  const qty = Number(payload.qty)
  if (!qty || qty <= 0) throw new Error('请输入正确的采购数量')
  if (qty > product.stock) throw new Error(`库存不足，当前可售 ${product.stock}${product.unit}`)

  const maxId = salesOrders.reduce((m, o) => Math.max(m, o.id), 0) + 1
  const stamp = stampNow()
  const dateCompact = stamp.slice(0, 10).replace(/-/g, '')
  const record = {
    id: maxId,
    orderNo: `SO${dateCompact}${String(maxId).padStart(3, '0')}`,
    customerId: customer.id,
    customer: customer.name,
    customerLevel: customer.level,
    productId: product.id,
    product: product.name,
    productSpec: product.spec,
    unit: product.unit,
    unitPrice: product.price,
    qty,
    amount: roundMoney(product.price * qty),
    park: product.park,
    status: '待支付',
    createTime: stamp.slice(0, 16),
    payTime: '',
    shipTime: '',
    finishTime: '',
    logisticsCompany: '',
    logisticsNo: '',
    remark: payload.remark || '',
  }
  salesOrders.unshift(record)
  return { ...record }
}

export async function updateOrderStatusApi(id, status, payload = {}) {
  await delay(400)
  const order = salesOrders.find((o) => o.id === id)
  if (!order) throw new Error('订单不存在')

  if (status === '已发货') {
    if (order.status !== '待支付') throw new Error(`当前订单状态为「${order.status}」，不可重复发货`)
    const logisticsCompany = (payload.logisticsCompany || '').trim()
    const logisticsNo = (payload.logisticsNo || '').trim()
    if (!logisticsCompany || !logisticsNo) throw new Error('请填写物流公司与物流单号')
    const stamp = stampNow()
    order.payTime = order.payTime || stamp.slice(0, 16)
    order.shipTime = stamp.slice(0, 16)
    order.logisticsCompany = logisticsCompany
    order.logisticsNo = logisticsNo
    order.status = '已发货'
    const customer = findSalesCustomer(order.customerId)
    salesShipments.unshift({
      id: `SH${order.orderNo.slice(2)}`,
      orderId: order.id,
      orderNo: order.orderNo,
      customer: order.customer,
      product: order.product,
      qty: order.qty,
      unit: order.unit,
      logisticsCompany,
      logisticsNo,
      shipTime: order.shipTime,
      status: '运输中',
      receiver: customer ? customer.contact : order.customer,
      address: customer ? customer.address : '',
      tracking: [{ time: order.shipTime, location: '发货仓库', desc: '已登记发货，等待快递揽收' }],
    })
    return decorateOrder(order)
  }

  if (status === '已完成') {
    if (order.status !== '已发货') throw new Error(`当前订单状态为「${order.status}」，仅已发货订单可完成`)
    order.status = '已完成'
    order.finishTime = stampNow().slice(0, 16)
    const shipment = salesShipments.find((s) => s.orderId === order.id)
    if (shipment) {
      shipment.status = '已签收'
      shipment.tracking.unshift({
        time: order.finishTime,
        location: shipment.address || '客户收货地址',
        desc: '快件已签收，订单交易完成',
      })
    }
    return decorateOrder(order)
  }

  throw new Error('不支持的订单状态')
}

export async function shipOrderApi(orderId, payload) {
  return updateOrderStatusApi(orderId, '已发货', payload)
}

export async function getShipmentsApi(params = {}) {
  await delay()
  const { keyword = '', status = '', page = 1, pageSize = 10 } = params
  const kw = keyword.trim()
  const list = salesShipments
    .map((s) => ({ ...s, tracking: s.tracking.map((n) => ({ ...n })) }))
    .filter((s) => {
      if (status && s.status !== status) return false
      if (kw) {
        const text = `${s.id} ${s.orderNo} ${s.customer} ${s.product} ${s.logisticsNo}`
        if (!text.includes(kw)) return false
      }
      return true
    })
    .sort((a, b) => (a.shipTime > b.shipTime ? -1 : 1))
  const total = list.length
  const start = (page - 1) * pageSize
  return {
    list: list.slice(start, start + pageSize),
    total,
    stats: {
      total: salesShipments.length,
      shipping: salesShipments.filter((s) => s.status === '运输中').length,
      signed: salesShipments.filter((s) => s.status === '已签收').length,
      abnormal: salesShipments.filter((s) => s.status === '异常').length,
    },
  }
}

export async function getCustomersApi(params = {}) {
  await delay()
  const { keyword = '', level = '', type = '', page = 1, pageSize = 10 } = params
  const kw = keyword.trim()

  const all = salesCustomers.map((c) => {
    const rows = salesPaidOrders().filter((o) => o.customerId === c.id)
    const amount = roundMoney(salesSum(rows, 'amount'))
    const sorted = rows.slice().sort((a, b) => (a.createTime > b.createTime ? -1 : 1))
    return {
      ...c,
      purchaseCount: rows.length,
      totalAmount: amount,
      avgAmount: rows.length ? roundMoney(amount / rows.length) : 0,
      lastOrderTime: sorted[0] ? sorted[0].createTime : '',
      repeat: rows.length > 1,
    }
  })

  const repeatCount = all.filter((c) => c.repeat).length
  const analysis = {
    totalCustomers: all.length,
    aLevelCount: all.filter((c) => c.level === 'A').length,
    repeatCount,
    repurchaseRate: all.length ? Math.round((repeatCount / all.length) * 1000) / 10 : 0,
  }

  const list = all
    .filter((c) => {
      if (level && c.level !== level) return false
      if (type && c.type !== type) return false
      if (kw) {
        const text = `${c.id} ${c.name} ${c.contact} ${c.phone} ${c.address}`
        if (!text.includes(kw)) return false
      }
      return true
    })
    .sort((a, b) => b.totalAmount - a.totalAmount)

  const total = list.length
  const start = (page - 1) * pageSize
  return { list: list.slice(start, start + pageSize), total, analysis }
}

export async function getCustomerOrdersApi(customerId) {
  await delay()
  return salesOrders
    .filter((o) => o.customerId === customerId)
    .map(decorateOrder)
    .sort((a, b) => (a.createTime > b.createTime ? -1 : 1))
}

export async function saveCustomerApi(payload) {
  await delay()
  const { id, ...data } = payload
  if (id) {
    const idx = salesCustomers.findIndex((c) => c.id === id)
    if (idx === -1) throw new Error('客户不存在')
    salesCustomers[idx] = { ...salesCustomers[idx], ...data }
    return { ...salesCustomers[idx] }
  }
  const max = salesCustomers.reduce((m, c) => Math.max(m, Number(c.id.slice(1)) || 0), 0)
  const record = {
    level: 'C',
    type: '企业',
    remark: '',
    ...data,
    id: `C${String(max + 1).padStart(3, '0')}`,
    createTime: stampNow(),
  }
  salesCustomers.unshift(record)
  return { ...record }
}

export async function deleteCustomerApi(id) {
  await delay()
  const idx = salesCustomers.findIndex((c) => c.id === id)
  if (idx === -1) throw new Error('客户不存在')
  if (salesOrders.some((o) => o.customerId === id)) {
    throw new Error('该客户已有订单记录，无法删除档案')
  }
  salesCustomers.splice(idx, 1)
  return { success: true }
}

export async function getSalesStatsApi() {
  await delay()
  const paid = salesPaidOrders()
  const totalAmount = roundMoney(salesSum(paid, 'amount'))
  const totalQty = salesSum(paid, 'qty')
  const customers = salesCustomers.map((c) => ({
    id: c.id,
    count: paid.filter((o) => o.customerId === c.id).length,
  }))
  const repeatCount = customers.filter((c) => c.count > 1).length

  // 趋势以最新订单日期为终点回溯 14 天，新增订单后图表可自动延伸
  const latestDate = salesOrders.reduce(
    (max, o) => (o.createTime.slice(0, 10) > max ? o.createTime.slice(0, 10) : max),
    salesOrders[0] ? salesOrders[0].createTime.slice(0, 10) : salesDateString(new Date()),
  )
  const base = new Date(`${latestDate}T00:00:00`)
  const dates = []
  for (let i = 13; i >= 0; i -= 1) {
    const d = new Date(base)
    d.setDate(base.getDate() - i)
    dates.push(salesDateString(d))
  }
  const trendAmount = dates.map((day) =>
    roundMoney(salesSum(paid.filter((o) => o.createTime.slice(0, 10) === day), 'amount')),
  )
  const trendQty = dates.map((day) => salesSum(paid.filter((o) => o.createTime.slice(0, 10) === day), 'qty'))

  const hotProducts = salesProducts
    .map((p) => {
      const rows = paid.filter((o) => o.productId === p.id)
      return { name: p.name, unit: p.unit, qty: salesSum(rows, 'qty'), amount: roundMoney(salesSum(rows, 'amount')) }
    })
    .filter((i) => i.qty > 0)
    .sort((a, b) => b.amount - a.amount)

  const categoryMap = {}
  const parkMap = {}
  paid.forEach((o) => {
    const product = findSalesProduct(o.productId)
    const category = product ? product.category : '其他'
    categoryMap[category] = roundMoney((categoryMap[category] || 0) + o.amount)
    parkMap[o.park] = roundMoney((parkMap[o.park] || 0) + o.amount)
  })

  return {
    summary: {
      totalAmount,
      totalQty,
      orderCount: salesOrders.length,
      repurchaseRate: customers.length ? Math.round((repeatCount / customers.length) * 1000) / 10 : 0,
      avgOrderAmount: paid.length ? roundMoney(totalAmount / paid.length) : 0,
    },
    trend: { dates, amount: trendAmount, qty: trendQty },
    hotProducts,
    categoryDist: Object.entries(categoryMap).map(([name, value]) => ({ name, value })),
    parkDist: Object.entries(parkMap).map(([name, value]) => ({ name, value })),
  }
}

/* ------------------------- 生产农事管理 ------------------------- */

export async function getFarmPlotsApi(params = {}) {
  await delay()
  const { keyword = '', crop = '', page = 1, pageSize = 10 } = params
  const kw = keyword.trim()
  const list = farmPlots.filter((p) => {
    if (crop && p.crop !== crop) return false
    if (kw) {
      const text = `${p.plotCode} ${p.name} ${p.crop} ${p.owner} ${p.location}`
      if (!text.includes(kw)) return false
    }
    return true
  })
  const total = list.length
  const start = (page - 1) * pageSize
  return {
    list: list.slice(start, start + pageSize),
    total,
    totalArea: farmPlots.reduce((s, p) => s + Number(p.area || 0), 0),
    inUseCount: farmPlots.filter((p) => p.status === 1).length,
  }
}

export async function saveFarmPlotApi(payload) {
  await delay()
  const { id, ...data } = payload
  if (id) {
    const idx = farmPlots.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error('地块不存在')
    farmPlots[idx] = { ...farmPlots[idx], ...data }
    return { ...farmPlots[idx] }
  }
  const record = { ...data, coverImage: data.coverImage || '', id: nextId(farmPlots), createTime: stampNow() }
  farmPlots.push(record)
  return { ...record }
}

export async function deleteFarmPlotApi(id) {
  await delay()
  const idx = farmPlots.findIndex((p) => p.id === id)
  if (idx === -1) throw new Error('地块不存在')
  farmPlots.splice(idx, 1)
  return { success: true }
}

export async function getFarmPlansApi(params = {}) {
  await delay()
  const { operationType = '', keyword = '', page = 1, pageSize = 10 } = params
  const kw = keyword.trim()
  const list = farmPlantPlans.filter((p) => {
    if (operationType && p.operationType !== operationType) return false
    if (kw) {
      const text = `${p.planName} ${p.plot} ${p.crop} ${p.executor}`
      if (!text.includes(kw)) return false
    }
    return true
  })
  const total = list.length
  const start = (page - 1) * pageSize
  return { list: list.slice(start, start + pageSize), total }
}

export async function saveFarmPlanApi(payload) {
  await delay()
  const { id, ...data } = payload
  if (id) {
    const idx = farmPlantPlans.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error('种植计划不存在')
    farmPlantPlans[idx] = { ...farmPlantPlans[idx], ...data }
    return { ...farmPlantPlans[idx] }
  }
  const record = { ...data, id: nextId(farmPlantPlans), createTime: stampNow() }
  farmPlantPlans.push(record)
  return { ...record }
}

export async function deleteFarmPlanApi(id) {
  await delay()
  const idx = farmPlantPlans.findIndex((p) => p.id === id)
  if (idx === -1) throw new Error('种植计划不存在')
  farmPlantPlans.splice(idx, 1)
  return { success: true }
}

export async function getFarmOrdersApi(params = {}) {
  await delay()
  const { status = '', keyword = '', page = 1, pageSize = 10 } = params
  const kw = keyword.trim()
  const list = farmWorkOrders.filter((o) => {
    if (status && o.status !== status) return false
    if (kw) {
      const text = `${o.orderNo} ${o.title} ${o.plot} ${o.taskType} ${o.assignee}`
      if (!text.includes(kw)) return false
    }
    return true
  })
  const total = list.length
  const start = (page - 1) * pageSize
  return { list: list.slice(start, start + pageSize), total }
}

export async function createFarmOrderApi(payload) {
  await delay()
  const orderNo = payload.orderNo || ''
  if (farmWorkOrders.some((o) => o.orderNo === orderNo)) throw new Error('工单编号已存在')
  const record = { ...payload, assignee: payload.assignee || '', status: '待派单', id: nextId(farmWorkOrders), createTime: stampNow() }
  farmWorkOrders.unshift(record)
  return { ...record }
}

export async function assignFarmOrderApi(id, assignee) {
  await delay()
  const idx = farmWorkOrders.findIndex((o) => o.id === id)
  if (idx === -1) throw new Error('工单不存在')
  farmWorkOrders[idx] = { ...farmWorkOrders[idx], assignee, status: '已派单' }
  return { ...farmWorkOrders[idx] }
}

export async function updateFarmOrderStatusApi(id, status) {
  await delay()
  const idx = farmWorkOrders.findIndex((o) => o.id === id)
  if (idx === -1) throw new Error('工单不存在')
  farmWorkOrders[idx] = { ...farmWorkOrders[idx], status }
  return { ...farmWorkOrders[idx] }
}

export async function deleteFarmOrderApi(id) {
  await delay()
  const idx = farmWorkOrders.findIndex((o) => o.id === id)
  if (idx === -1) throw new Error('工单不存在')
  farmWorkOrders.splice(idx, 1)
  return { success: true }
}

export async function getFarmRecordsApi(params = {}) {
  await delay()
  const { keyword = '', page = 1, pageSize = 10 } = params
  const kw = keyword.trim()
  const list = farmRecords.filter((r) => {
    if (kw) {
      const text = `${r.orderNo} ${r.plot} ${r.taskType} ${r.worker} ${r.materials}`
      if (!text.includes(kw)) return false
    }
    return true
  })
  const total = list.length
  const start = (page - 1) * pageSize
  return { list: list.slice(start, start + pageSize), total }
}

export async function saveFarmRecordApi(payload) {
  await delay()
  const { id, ...data } = payload
  if (id) {
    const idx = farmRecords.findIndex((r) => r.id === id)
    if (idx === -1) throw new Error('台账记录不存在')
    farmRecords[idx] = { ...farmRecords[idx], ...data }
    return { ...farmRecords[idx] }
  }
  const record = { ...data, images: data.images || [], id: nextId(farmRecords), recordTime: stampNow() }
  farmRecords.unshift(record)
  return { ...record }
}

export async function deleteFarmRecordApi(id) {
  await delay()
  const idx = farmRecords.findIndex((r) => r.id === id)
  if (idx === -1) throw new Error('台账记录不存在')
  farmRecords.splice(idx, 1)
  return { success: true }
}

export async function getFarmMaterialsApi(params = {}) {
  await delay()
  const { keyword = '', category = '', page = 1, pageSize = 10 } = params
  const kw = keyword.trim()
  const list = farmMaterials.filter((m) => {
    if (category && m.category !== category) return false
    if (kw) {
      const text = `${m.name} ${m.spec} ${m.location}`
      if (!text.includes(kw)) return false
    }
    return true
  })
  const total = list.length
  const start = (page - 1) * pageSize
  return {
    list: list.slice(start, start + pageSize),
    total,
    lowStockCount: farmMaterials.filter((m) => m.stock <= m.threshold).length,
  }
}

export async function saveFarmMaterialApi(payload) {
  await delay()
  const { id, ...data } = payload
  if (id) {
    const idx = farmMaterials.findIndex((m) => m.id === id)
    if (idx === -1) throw new Error('农资不存在')
    farmMaterials[idx] = { ...farmMaterials[idx], ...data, updateTime: stampNow() }
    return { ...farmMaterials[idx] }
  }
  const record = { ...data, id: nextId(farmMaterials), updateTime: stampNow() }
  farmMaterials.push(record)
  return { ...record }
}

export async function adjustFarmStockApi(id, { type, quantity }) {
  await delay()
  const idx = farmMaterials.findIndex((m) => m.id === id)
  if (idx === -1) throw new Error('农资不存在')
  const item = farmMaterials[idx]
  const qty = Number(quantity) || 0
  const stock = type === 'in' ? item.stock + qty : item.stock - qty
  if (stock < 0) throw new Error('库存不足，无法出库')
  farmMaterials[idx] = { ...item, stock, updateTime: stampNow() }
  return { ...farmMaterials[idx] }
}

export async function deleteFarmMaterialApi(id) {
  await delay()
  const idx = farmMaterials.findIndex((m) => m.id === id)
  if (idx === -1) throw new Error('农资不存在')
  farmMaterials.splice(idx, 1)
  return { success: true }
}

export async function getFarmPurchasesApi(params = {}) {
  await delay()
  const { keyword = '', page = 1, pageSize = 10 } = params
  const kw = keyword.trim()
  const list = farmPurchases.filter((p) => {
    if (kw) {
      const text = `${p.purchaseNo} ${p.material} ${p.supplier} ${p.purchaser}`
      if (!text.includes(kw)) return false
    }
    return true
  })
  const total = list.length
  const start = (page - 1) * pageSize
  return {
    list: list.slice(start, start + pageSize),
    total,
    totalAmount: roundMoney(farmPurchases.reduce((s, p) => s + Number(p.amount || 0), 0)),
  }
}

export async function saveFarmPurchaseApi(payload) {
  await delay()
  const purchaseNo = payload.purchaseNo || ''
  if (farmPurchases.some((p) => p.purchaseNo === purchaseNo)) throw new Error('采购单号已存在')
  const record = { ...payload, id: nextId(farmPurchases), purchaseTime: stampNow() }
  farmPurchases.unshift(record)
  return { ...record }
}

export async function deleteFarmPurchaseApi(id) {
  await delay()
  const idx = farmPurchases.findIndex((p) => p.id === id)
  if (idx === -1) throw new Error('采购记录不存在')
  farmPurchases.splice(idx, 1)
  return { success: true }
}

export async function getFarmHarvestApi(params = {}) {
  await delay()
  const { keyword = '', crop = '', page = 1, pageSize = 10 } = params
  const kw = keyword.trim()
  const list = farmHarvestBatches.filter((b) => {
    if (crop && b.crop !== crop) return false
    if (kw) {
      const text = `${b.batchNo} ${b.plot} ${b.crop}`
      if (!text.includes(kw)) return false
    }
    return true
  })
  const total = list.length
  const start = (page - 1) * pageSize
  const qtyOf = (b) => Number(b.gradeA || 0) + Number(b.gradeB || 0) + Number(b.gradeC || 0)
  const totalQuantity = farmHarvestBatches.reduce((s, b) => s + qtyOf(b), 0)
  const gradeASum = farmHarvestBatches.reduce((s, b) => s + Number(b.gradeA || 0), 0)
  return {
    list: list.slice(start, start + pageSize),
    total,
    stats: {
      totalQuantity,
      batchCount: farmHarvestBatches.length,
      gradeARate: totalQuantity ? Math.round((gradeASum / totalQuantity) * 1000) / 10 : 0,
      plotCount: new Set(farmHarvestBatches.map((b) => b.plot)).size,
    },
  }
}

export async function saveFarmHarvestApi(payload) {
  await delay()
  const { id, ...data } = payload
  if (id) {
    const idx = farmHarvestBatches.findIndex((b) => b.id === id)
    if (idx === -1) throw new Error('采收批次不存在')
    farmHarvestBatches[idx] = { ...farmHarvestBatches[idx], ...data }
    return { ...farmHarvestBatches[idx] }
  }
  const record = { ...data, id: nextId(farmHarvestBatches), createTime: stampNow() }
  farmHarvestBatches.unshift(record)
  return { ...record }
}

export async function deleteFarmHarvestApi(id) {
  await delay()
  const idx = farmHarvestBatches.findIndex((b) => b.id === id)
  if (idx === -1) throw new Error('采收批次不存在')
  farmHarvestBatches.splice(idx, 1)
  return { success: true }
}

/* ------------------------- 农业专家与病虫害知识库 ------------------------- */

const decorateKnowledgeArticle = (a) => {
  const expert = knowledgeExperts.find((e) => e.id === a.expertId)
  return {
    ...a,
    tags: a.tags || [],
    author: expert ? expert.name : '',
    authorOrg: expert ? expert.organization : '',
    authorTitle: expert ? expert.title : '',
  }
}

export async function getKnowledgeOverviewApi() {
  await delay()
  const published = knowledgeArticles.filter((a) => a.status === '已发布')
  const experts = knowledgeExperts.filter((e) => e.status === '已入驻')
  const fields = expertFields
    .map((name) => ({ name, count: experts.filter((e) => e.field === name).length }))
    .filter((f) => f.count > 0)
  const categories = knowledgeCategories.map((c) => ({
    ...c,
    count: knowledgeArticles.filter((a) => a.category === c.name).length,
  }))
  const latestArticles = [...published]
    .sort((a, b) => (a.publishTime > b.publishTime ? -1 : 1))
    .slice(0, 5)
    .map(decorateKnowledgeArticle)
  const hotArticles = [...published]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)
    .map((a) => {
      const expert = knowledgeExperts.find((e) => e.id === a.expertId)
      return { id: a.id, title: a.title, author: expert ? expert.name : '', category: a.category, views: a.views }
    })
  return {
    stats: {
      expertCount: experts.length,
      articleCount: published.length,
      pestCount: knowledgePests.length,
      planCount: knowledgePlans.length,
      totalViews: knowledgeArticles.reduce((s, a) => s + Number(a.views || 0), 0),
    },
    experts,
    fields,
    categories,
    latestArticles,
    hotArticles,
  }
}

export async function getPestsApi(params = {}) {
  await delay()
  const { keyword = '', type = '', crop = '', severity = '', page = 1, pageSize = 8 } = params
  const kw = keyword.trim()
  const list = knowledgePests.filter((p) => {
    if (type && p.type !== type) return false
    if (crop && !p.crops.split('、').includes(crop)) return false
    if (severity && p.severity !== severity) return false
    if (kw) {
      const text = `${p.name} ${p.alias} ${p.crops} ${p.symptom}`
      if (!text.includes(kw)) return false
    }
    return true
  })
  const total = list.length
  const start = (page - 1) * pageSize
  return {
    list: list.slice(start, start + pageSize),
    total,
    crops: [...new Set(knowledgePests.flatMap((p) => p.crops.split('、')))].sort(),
    diseaseCount: knowledgePests.filter((p) => p.type === '病害').length,
    insectCount: knowledgePests.filter((p) => p.type === '虫害').length,
  }
}

export async function getPestPlansApi(params = {}) {
  await delay()
  const { keyword = '', type = '', page = 1, pageSize = 10 } = params
  const kw = keyword.trim()
  const list = knowledgePlans.filter((p) => {
    if (type && p.type !== type) return false
    if (kw) {
      const text = `${p.name} ${p.alias} ${p.crops} ${p.plan.principle}`
      if (!text.includes(kw)) return false
    }
    return true
  })
  const total = list.length
  const start = (page - 1) * pageSize
  return {
    list: list.slice(start, start + pageSize),
    total,
    stats: {
      total: knowledgePlans.length,
      disease: knowledgePlans.filter((p) => p.type === '病害').length,
      insect: knowledgePlans.filter((p) => p.type === '虫害').length,
      drugs: knowledgePlans.reduce((s, p) => s + p.plan.drugs.length, 0),
    },
  }
}

export async function getKnowledgeArticlesApi(params = {}) {
  await delay()
  const { keyword = '', category = '', status = '', page = 1, pageSize = 10 } = params
  const kw = keyword.trim()
  const list = knowledgeArticles
    .filter((a) => {
      if (category && a.category !== category) return false
      if (status && a.status !== status) return false
      if (kw) {
        const author = (knowledgeExperts.find((e) => e.id === a.expertId) || {}).name || ''
        const text = `${a.title} ${a.tags.join(' ')} ${author}`
        if (!text.includes(kw)) return false
      }
      return true
    })
    .map(decorateKnowledgeArticle)
  const total = list.length
  const start = (page - 1) * pageSize
  return {
    list: list.slice(start, start + pageSize),
    total,
    categories: knowledgeCategories.map((c) => c.name),
    stats: {
      published: knowledgeArticles.filter((a) => a.status === '已发布').length,
      pending: knowledgeArticles.filter((a) => a.status === '待审核').length,
      draft: knowledgeArticles.filter((a) => a.status === '草稿').length,
    },
  }
}

export async function saveKnowledgeArticleApi(payload) {
  await delay()
  const { id, ...data } = payload
  if (id) {
    const idx = knowledgeArticles.findIndex((a) => a.id === id)
    if (idx === -1) throw new Error('知识条目不存在')
    knowledgeArticles[idx] = { ...knowledgeArticles[idx], ...data }
    return decorateKnowledgeArticle(knowledgeArticles[idx])
  }
  const max = knowledgeArticles.reduce((m, a) => Math.max(m, Number(a.id.slice(3)) || 0), 0)
  const record = {
    ...data,
    status: '待审核',
    views: 0,
    publishTime: '',
    auditRemark: '',
    recommend: !!data.recommend,
    tags: data.tags || [],
    id: `ART${String(max + 1).padStart(11, '0')}`,
  }
  knowledgeArticles.unshift(record)
  return decorateKnowledgeArticle(record)
}

export async function auditKnowledgeArticleApi(id, action, remark = '') {
  await delay()
  const idx = knowledgeArticles.findIndex((a) => a.id === id)
  if (idx === -1) throw new Error('知识条目不存在')
  const article = knowledgeArticles[idx]
  if (action === 'publish') {
    knowledgeArticles[idx] = { ...article, status: '已发布', publishTime: stampNow(), auditRemark: '' }
  } else if (action === 'reject') {
    knowledgeArticles[idx] = { ...article, status: '草稿', auditRemark: remark }
  }
  return decorateKnowledgeArticle(knowledgeArticles[idx])
}

export async function deleteKnowledgeArticleApi(id) {
  await delay()
  const idx = knowledgeArticles.findIndex((a) => a.id === id)
  if (idx === -1) throw new Error('知识条目不存在')
  knowledgeArticles.splice(idx, 1)
  return { success: true }
}

export async function getKnowledgeExpertsApi(params = {}) {
  await delay()
  const { keyword = '', field = '', status = '', page = 1, pageSize = 10 } = params
  const kw = keyword.trim()
  const list = knowledgeExperts.filter((e) => {
    if (field && e.field !== field) return false
    if (status && e.status !== status) return false
    if (kw) {
      const text = `${e.name} ${e.organization} ${e.specialty}`
      if (!text.includes(kw)) return false
    }
    return true
  })
  const total = list.length
  const start = (page - 1) * pageSize
  return {
    list: list.slice(start, start + pageSize),
    total,
    fields: expertFields,
    pendingCount: knowledgeExperts.filter((e) => e.status === '待审核').length,
  }
}

export async function saveKnowledgeExpertApi(payload) {
  await delay()
  const { id, ...data } = payload
  if (id) {
    const idx = knowledgeExperts.findIndex((e) => e.id === id)
    if (idx === -1) throw new Error('专家档案不存在')
    knowledgeExperts[idx] = { ...knowledgeExperts[idx], ...data }
    return { ...knowledgeExperts[idx] }
  }
  const record = {
    ...data,
    status: '待审核',
    articleCount: 0,
    totalViews: 0,
    joinTime: stampNow(),
    id: nextId(knowledgeExperts),
  }
  knowledgeExperts.unshift(record)
  return { ...record }
}

export async function auditKnowledgeExpertApi(id, action) {
  await delay()
  const idx = knowledgeExperts.findIndex((e) => e.id === id)
  if (idx === -1) throw new Error('专家不存在')
  knowledgeExperts[idx] = { ...knowledgeExperts[idx], status: action === 'approve' ? '已入驻' : '已驳回' }
  return { ...knowledgeExperts[idx] }
}

export async function deleteKnowledgeExpertApi(id) {
  await delay()
  const idx = knowledgeExperts.findIndex((e) => e.id === id)
  if (idx === -1) throw new Error('专家不存在')
  knowledgeExperts.splice(idx, 1)
  return { success: true }
}

export async function getKnowledgeCategoriesApi() {
  await delay()
  return knowledgeCategories.map((c) => ({
    ...c,
    articleCount: knowledgeArticles.filter((a) => a.category === c.name).length,
  }))
}

export async function saveKnowledgeCategoryApi(payload) {
  await delay()
  const { id, ...data } = payload
  if (id) {
    const idx = knowledgeCategories.findIndex((c) => c.id === id)
    if (idx === -1) throw new Error('分类不存在')
    const oldName = knowledgeCategories[idx].name
    knowledgeCategories[idx] = { ...knowledgeCategories[idx], ...data }
    if (data.name && data.name !== oldName) {
      knowledgeArticles.forEach((a) => {
        if (a.category === oldName) a.category = data.name
      })
    }
    return { ...knowledgeCategories[idx] }
  }
  const max = knowledgeCategories.reduce((m, c) => Math.max(m, Number(c.id.slice(2)) || 0), 0)
  const record = { ...data, id: `C-${String(max + 1).padStart(2, '0')}` }
  knowledgeCategories.push(record)
  return { ...record }
}

export async function deleteKnowledgeCategoryApi(id) {
  await delay()
  const idx = knowledgeCategories.findIndex((c) => c.id === id)
  if (idx === -1) throw new Error('分类不存在')
  if (knowledgeArticles.some((a) => a.category === knowledgeCategories[idx].name)) {
    throw new Error('该分类下仍有知识条目，无法删除')
  }
  knowledgeCategories.splice(idx, 1)
  return { success: true }
}