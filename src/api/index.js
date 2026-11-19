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
  farmers,
  farmOperationTypes,
  taskTypeSpecialtyMap,
  farmPlotNameList,
  farmMaterials,
  farmPlots,
  farmPlans,
  farmWorkOrders,
  farmRecords,
  farmPurchases,
  farmHarvest,
  knowledgeFields,
  knowledgeCategories,
  knowledgeExperts,
  knowledgeArticles,
  pestLibrary,
} from './mock'

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

// 业务数据本地持久化：统一落盘，刷新页面仍保留
const BIZ_STORE_KEY = 'samp_biz_store_v1'

// 站内消息：工单指派等定向通知，按被指派人姓名投递
const farmWorkMessages = []

const bizCollections = {
  linkageStrategies,
  sceneTemplates,
  controlGroups,
  fertilizerFormulas,
  fertilizerMachines,
  alarmRealtimeList,
  alarmRules,
  salesProducts,
  salesCustomers,
  salesOrders,
  salesShipments,
  farmPlans,
  farmWorkOrders,
  farmRecords,
  farmWorkMessages,
  farmMaterials,
  farmPurchases,
  farmHarvest,
  deviceWorkOrders,
  knowledgeCategories,
  knowledgeExperts,
  knowledgeArticles,
}

// 农资种子快照：用于给旧本地数据增量补齐新增的农资/工具，避免老缓存看不到新物资
const farmMaterialSeeds = farmMaterials.map((m) => ({ ...m }))
// 农产品种子快照：用于给旧本地缓存补齐种植地块关联字段
const salesProductSeeds = salesProducts.map((p) => ({ ...p }))

function persistBiz() {
  try {
    const snapshot = {}
    Object.keys(bizCollections).forEach((k) => {
      snapshot[k] = bizCollections[k]
    })
    localStorage.setItem(BIZ_STORE_KEY, JSON.stringify(snapshot))
  } catch (e) { /* 忽略 */ }
}

;(function restoreBiz() {
  try {
    const raw = localStorage.getItem(BIZ_STORE_KEY)
    if (!raw) return
    const saved = JSON.parse(raw)
    Object.keys(bizCollections).forEach((k) => {
      const arr = bizCollections[k]
      const items = saved[k]
      if (Array.isArray(arr) && Array.isArray(items)) {
        arr.length = 0
        arr.push(...items)
      }
    })
  } catch (e) { /* 忽略损坏数据 */ }
})()

// 按名称补齐种子农资（仅执行一次，不覆盖用户已有库存，也不复活用户已删除的农资）
let deviceToolSeededThisRun = false
;(function mergeSeedFarmMaterials() {
  const VER_KEY = 'samp_material_seed_ver'
  const VER = 3
  let applied = 0
  try {
    applied = Number(localStorage.getItem(VER_KEY) || 0)
    if (applied >= VER) return
  } catch (e) {
    return
  }
  const names = new Set(farmMaterials.map((m) => m.name))
  const missing = farmMaterialSeeds.filter((m) => !names.has(m.name))
  if (missing.length) {
    let maxId = farmMaterials.reduce((max, m) => Math.max(max, m.id || 0), 0)
    missing.forEach((m) => {
      maxId += 1
      if (m.name === '数字万用表') deviceToolSeededThisRun = true
      farmMaterials.push({ ...m, id: maxId })
    })
    persistBiz()
  }
  try {
    localStorage.setItem(VER_KEY, String(VER))
  } catch (e) {
    /* 忽略存储异常 */
  }
})()

// 补齐旧缓存中的工具归还演示数据：3 号大棚水泵工单已领用万用表、尚未归还
// 仅对仍处于种子状态（未执行完）的历史工单补一次，并同步扣减库存，保证归还前后数据一致
;(function seedDeviceToolBorrowing() {
  const VER_KEY = 'samp_device_tool_return_seed_ver'
  const VER = 1
  try {
    if (Number(localStorage.getItem(VER_KEY) || 0) >= VER) return
  } catch (e) {
    return
  }
  const order = deviceWorkOrders.find((o) => o.id === 'WO20261103001')
  const material = farmMaterials.find((m) => m.name === '数字万用表')
  const hasBorrowed =
    order && (order.consumed || []).some((c) => c.material === '数字万用表')
  if (order && material && !hasBorrowed && Number(order.progress) === 60) {
    order.consumed = [
      ...(order.consumed || []),
      { material: '数字万用表', quantity: 1, unit: '台', returned: 0, returnTime: '' },
    ]
    // 工具是本次才补入库存时，种子库存已含本次领用，无需重复扣减
    if (!deviceToolSeededThisRun) {
      material.stock = Math.max(Number(material.stock) - 1, 0)
    }
    persistBiz()
  }
  try {
    localStorage.setItem(VER_KEY, String(VER))
  } catch (e) {
    /* 忽略存储异常 */
  }
})()

// 补齐旧缓存中的农产品种植地块字段（仅执行一次，仅填充缺失字段，不覆盖用户已维护数据）
;(function mergeProductPlanting() {
  const VER_KEY = 'samp_product_plot_ver'
  const VER = 1
  try {
    if (Number(localStorage.getItem(VER_KEY) || 0) >= VER) return
  } catch (e) {
    return
  }
  let changed = false
  salesProducts.forEach((p) => {
    if (p.plotCode !== undefined) return
    const seed = salesProductSeeds.find((s) => s.id === p.id)
    if (!seed || !seed.plotCode) return
    p.plotCode = seed.plotCode
    if (p.crop === undefined) p.crop = seed.crop
    changed = true
  })
  if (changed) persistBiz()
  try {
    localStorage.setItem(VER_KEY, String(VER))
  } catch (e) {
    /* 忽略存储异常 */
  }
})()

// 跨标签页同步：其他标签页（如管理员指派工单）写入业务数据后，本页内存数据随之刷新，
// 保证被指派人无需刷新页面即可收到工单消息与农事台账数据
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== BIZ_STORE_KEY || !e.newValue) return
    try {
      const saved = JSON.parse(e.newValue)
      Object.keys(bizCollections).forEach((k) => {
        const arr = bizCollections[k]
        const items = saved[k]
        if (Array.isArray(arr) && Array.isArray(items)) {
          arr.length = 0
          arr.push(...items)
        }
      })
    } catch (e) {
      /* 忽略损坏数据 */
    }
  })
}

// 基于现有记录生成自增主键
const nextId = (list) => list.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1

// 去除密码字段，避免敏感信息返回给前端
const stripPassword = (u) => {
  if (!u) return null
  const { password, failedAttempts, lockedUntil, ...safe } = u
  return safe
}

const now = () => new Date().toLocaleString('zh-CN', { hour12: false })

// 数据同步：管理员修改会影响其他账号的数据（角色权限/角色/用户）时递增版本号，
// 相关账号在下次路由跳转或跨标签页时依据版本变化自动刷新权限与用户信息
const bumpSyncVersion = () => {
  localStorage.setItem('samp_perm_ver', String(Date.now()))
}

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
    const u = JSON.parse(localStorage.getItem('samp_user') || 'null')
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
    bumpSyncVersion()
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
  bumpSyncVersion()
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
  bumpSyncVersion()
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
    bumpSyncVersion()
    return { ...roles[idx] }
  }
  const record = { ...payload, id: nextId(roles), createTime: now() }
  roles.push(record)
  recordOperationLog('角色权限', '新增角色', `新增角色「${record.name}（${record.code}）」`)
  persist()
  bumpSyncVersion()
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
  bumpSyncVersion()
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
  bumpSyncVersion()
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

/* ------------------------- 设备运维工单 ------------------------- */
// 运维人员名单：动态取「运维人员」角色且状态启用的账号，避免派发给已停用/非运维账号
const getDeviceMaintainers = () =>
  users
    .filter((u) => u.roleCode === 'operator' && Number(u.status) === 1)
    .map((u) => ({ name: u.name, phone: u.phone, team: u.department || '设备运维部', userId: u.id }))

const deviceOrderTypeOptions = ['故障维修', '校准维护', '定期保养', '巡检']
const deviceOrderStatusOptions = ['待派单', '已派单', '处理中', '已完成']
const devicePriorityOptions = ['高', '中', '低']

// 工具中的一次性耗材：使用后不回库，不参与归还
// 其余工具（万用表、扳手、梯子等）使用后应归还并回补库存
const DEVICE_CONSUMABLE_TOOLS = new Set(['绝缘胶带', '尼龙扎带', '密封胶'])
const isReturnableFarmTool = (material) =>
  !!material && material.category === '工具' && !DEVICE_CONSUMABLE_TOOLS.has(material.name)

// ---- 运维工单权限 ----
// 系统管理员 / 农场管理者：可新建、派发、查看全部工单
// 运维人员：只能查看并执行指派给本人的工单，不可新建/派发
// 其他角色：只读查看，不可做任何变更
const deviceRoleNames = {
  admin: '系统管理员',
  manager: '农场管理者',
  operator: '运维人员',
  sales: '产销业务员',
  agronomist: '农技人员',
}

function deviceOrderAccess() {
  const user = currentUser()
  const roleCode = user.roleCode || ''
  const name = user.name || ''
  const isAdmin = roleCode === 'admin'
  const isManager = roleCode === 'manager'
  const isOperator = roleCode === 'operator'
  const canManage = isAdmin || isManager
  return {
    roleCode,
    roleName: deviceRoleNames[roleCode] || '访客',
    userName: name,
    isAdmin,
    isManager,
    isOperator,
    canCreate: canManage,
    canDispatch: canManage,
    canExecuteAny: isAdmin,
    canViewAll: !isOperator,
    readOnly: !canManage && !isOperator,
  }
}

const deviceOrderPermissions = (access) => ({
  roleCode: access.roleCode,
  roleName: access.roleName,
  userName: access.userName,
  canCreate: access.canCreate,
  canDispatch: access.canDispatch,
  canExecuteAny: access.canExecuteAny,
  canViewAll: access.canViewAll,
  readOnly: access.readOnly,
})

// 按角色收敛数据范围：运维人员只能看到指派给自己的工单
function visibleDeviceOrders(access) {
  if (!access.isOperator) return deviceWorkOrders
  if (!access.userName) return []
  return deviceWorkOrders.filter((o) => o.assignee === access.userName)
}

// 新建/派发/重新派发等管理操作仅限系统管理员与农场管理者
function assertDeviceOrderManage(action) {
  const access = deviceOrderAccess()
  if (!access.canDispatch) throw new Error(`仅系统管理员或农场管理者可${action}运维工单`)
  return access
}

// 执行操作：系统管理员可处理任意工单，运维人员只能执行指派给本人的工单
function assertDeviceOrderExecutable(order) {
  const access = deviceOrderAccess()
  if (access.canExecuteAny) return access
  if (!access.isOperator) throw new Error('仅系统管理员或工单负责人可执行运维工单')
  if (!access.userName || order.assignee !== access.userName) {
    throw new Error('只能执行指派给本人的运维工单')
  }
  return access
}

const findDeviceOrder = (id) => {
  const order = deviceWorkOrders.find((o) => o.id === id)
  if (!order) throw new Error('运维工单不存在')
  return order
}

const sortDeviceOrders = (list) =>
  list
    .slice()
    .sort((a, b) => {
      // 未完成工单优先，其次按创建时间倒序
      const doneA = a.status === '已完成' ? 1 : 0
      const doneB = b.status === '已完成' ? 1 : 0
      if (doneA !== doneB) return doneA - doneB
      return a.createTime < b.createTime ? 1 : -1
    })

const deviceOrderStats = (list) => ({
  total: list.length,
  pending: list.filter((o) => o.status === '待派单').length,
  dispatched: list.filter((o) => o.status === '已派单').length,
  processing: list.filter((o) => o.status === '处理中').length,
  done: list.filter((o) => o.status === '已完成').length,
  running: list.filter((o) => o.status !== '已完成').length,
})

const normalizeDeviceOrder = (o) => ({
  ...o,
  assignee: o.assignee || '',
  consumed: (o.consumed || []).map((c) => ({
    returned: 0,
    returnTime: '',
    ...c,
  })),
  logs: (o.logs || []).map((l) => ({ ...l })),
})

const pushDeviceLog = (order, action, operator, remark) => {
  order.logs = order.logs || []
  order.logs.push({ time: stampNow(), action, operator: operator || '系统', remark: remark || '' })
}

function genDeviceOrderNo() {
  const day = stampNow().slice(0, 10).replace(/-/g, '')
  let seq = 1
  let no = `WO${day}${String(seq).padStart(3, '0')}`
  while (deviceWorkOrders.some((o) => o.id === no)) {
    seq += 1
    no = `WO${day}${String(seq).padStart(3, '0')}`
  }
  return no
}

export async function getDeviceWorkOrdersApi(params = {}) {
  await delay()
  const access = deviceOrderAccess()
  const scoped = visibleDeviceOrders(access)
  const keyword = farmText(params.keyword)
  const { status = '', type = '', assignee = '', priority = '' } = params
  let list = scoped.filter((o) => {
    if (status && o.status !== status) return false
    if (type && o.type !== type) return false
    if (assignee && o.assignee !== assignee) return false
    if (priority && o.priority !== priority) return false
    if (keyword) {
      const text = [o.id, o.device, o.deviceCode, o.location, o.park, o.assignee, o.description]
        .join(' ')
      if (!text.includes(keyword)) return false
    }
    return true
  })
  list = sortDeviceOrders(list).map(normalizeDeviceOrder)
  return {
    list,
    stats: deviceOrderStats(scoped),
    maintainers: getDeviceMaintainers(),
    types: deviceOrderTypeOptions.slice(),
    statuses: deviceOrderStatusOptions.slice(),
    priorities: devicePriorityOptions.slice(),
    permissions: deviceOrderPermissions(access),
  }
}

export async function getDeviceMaintainersApi() {
  await delay(120)
  return getDeviceMaintainers()
}

// 新建运维工单：仅系统管理员/农场管理者可创建，默认待派单
export async function createDeviceWorkOrderApi(payload) {
  await delay()
  assertDeviceOrderManage('新建')
  const device = farmText(payload.device)
  if (!device) throw new Error('请填写设备名称')
  const type = payload.type || '故障维修'
  if (!deviceOrderTypeOptions.includes(type)) throw new Error('工单类型不正确')
  const priority = payload.priority || '中'
  if (!devicePriorityOptions.includes(priority)) throw new Error('优先级不正确')
  const order = {
    id: genDeviceOrderNo(),
    device,
    deviceCode: farmText(payload.deviceCode),
    type,
    park: farmText(payload.park),
    location: farmText(payload.location),
    priority,
    description: farmText(payload.description),
    assignee: '',
    progress: 0,
    status: '待派单',
    createTime: stampNow(),
    deadline: payload.deadline || '',
    startTime: '',
    finishTime: '',
    consumed: [],
    logs: [],
  }
  pushDeviceLog(order, '创建工单', currentUserName(), payload.description || '手动创建工单')
  deviceWorkOrders.unshift(order)
  persistBiz()
  return normalizeDeviceOrder(order)
}

// 派发工单：仅系统管理员/农场管理者可指派、调整负责人与截止时间
export async function dispatchDeviceWorkOrderApi(id, payload) {
  await delay()
  assertDeviceOrderManage('派发')
  const order = findDeviceOrder(id)
  if (order.status === '处理中') throw new Error('工单已开始执行，不能重新派发')
  if (order.status === '已完成') throw new Error('工单已完成，不能重新派发')
  const assignee = farmText(payload.assignee)
  if (!assignee) throw new Error('请选择负责人')
  if (!getDeviceMaintainers().some((m) => m.name === assignee)) {
    throw new Error('负责人不在启用状态的运维人员名单中')
  }
  if (payload.priority && !devicePriorityOptions.includes(payload.priority)) {
    throw new Error('优先级不正确')
  }
  const prev = order.assignee
  order.assignee = assignee
  order.priority = payload.priority || order.priority
  order.deadline = payload.deadline || order.deadline || ''
  order.status = '已派单'
  const remark = payload.remark
    ? payload.remark
    : prev && prev !== assignee
      ? `负责人由${prev}调整为${assignee}`
      : `指派${assignee}处理`
  pushDeviceLog(order, '派发工单', currentUserName(), remark)
  persistBiz()
  return normalizeDeviceOrder(order)
}

// 开始执行：已派单 → 处理中；仅系统管理员或工单负责人可操作
export async function startDeviceWorkOrderApi(id) {
  await delay()
  const order = findDeviceOrder(id)
  assertDeviceOrderExecutable(order)
  if (order.status === '待派单') throw new Error('工单尚未派发，请先派发负责人')
  if (order.status === '已完成') throw new Error('工单已完成，无需重复执行')
  if (order.status === '处理中') throw new Error('工单已在执行中')
  order.status = '处理中'
  order.startTime = stampNow()
  if (!order.progress) order.progress = 10
  pushDeviceLog(order, '开始执行', currentUserName(), '已到场，开始处理')
  persistBiz()
  return normalizeDeviceOrder(order)
}

// 执行登记：更新进度、登记本次使用的维修工具/耗材（自动出库），进度 100% 即完工
export async function executeDeviceWorkOrderApi(id, payload) {
  await delay(400)
  const order = findDeviceOrder(id)
  assertDeviceOrderExecutable(order)
  if (order.status === '待派单') throw new Error('工单尚未派发，请先派发负责人')
  if (order.status === '已完成') throw new Error('工单已完成，不能重复提交')
  if (order.status !== '处理中') throw new Error('请先开始执行后再登记进度')
  const progress = Number(payload.progress)
  if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
    throw new Error('执行进度需在 0-100 之间')
  }
  // 防止误拖回退进度造成数据回退
  if (progress < Number(order.progress || 0)) {
    throw new Error(`执行进度不能低于当前进度（${order.progress}%）`)
  }
  const remark = farmText(payload.remark)
  if (progress === 100 && !remark) throw new Error('完工时请填写维修结果说明')
  const added = normalizeConsumedMaterials(payload.consumed)
  // 每次登记只追加本次消耗，避免把历史消耗误判为退回
  const consumedDetail = added.length ? applyConsumedMaterialsDelta([], added) : []
  if (consumedDetail.length) {
    // 新领用工具默认未归还，便于完工后归还回库
    order.consumed = [
      ...(order.consumed || []),
      ...consumedDetail.map((c) => ({ ...c, returned: 0, returnTime: '' })),
    ]
  }
  order.progress = progress
  if (progress >= 100) {
    order.status = '已完成'
    order.progress = 100
    order.finishTime = stampNow()
    pushDeviceLog(order, '完成工单', currentUserName(), remark || '工单已完工')
  } else {
    order.status = '处理中'
    pushDeviceLog(
      order,
      '进度更新',
      currentUserName(),
      `${remark ? `${remark}（` : ''}当前进度 ${progress}%${remark ? '）' : ''}`,
    )
  }
  persistBiz()
  return normalizeDeviceOrder(order)
}

// 工具归还：工具类农资使用后归还入库，同一工具支持分次归还
// 仅工单负责人、系统管理员与农场管理者可操作，且归还数量不能超过未归还数量
export async function returnDeviceWorkOrderToolsApi(id, payload = {}) {
  await delay()
  const order = findDeviceOrder(id)
  const access = deviceOrderAccess()
  const isOwner = access.isOperator && access.userName && order.assignee === access.userName
  if (!access.canDispatch && !isOwner) {
    throw new Error('仅工单负责人、系统管理员或农场管理者可归还工具')
  }
  const returnMap = new Map()
  ;(Array.isArray(payload.items) ? payload.items : []).forEach((item) => {
    const name = farmText(item && item.material)
    const qty = Number(item && item.quantity) || 0
    if (!name || qty <= 0) return
    returnMap.set(name, (returnMap.get(name) || 0) + qty)
  })
  if (!returnMap.size) throw new Error('请填写归还数量')

  // 先整体校验再统一入库，避免部分工具已归还、部分失败造成库存失真
  const plans = []
  returnMap.forEach((qty, name) => {
    const material = farmMaterials.find((m) => m.name === name)
    if (!material) throw new Error(`农资「${name}」未建档，无法归还`)
    if (material.category !== '工具') throw new Error(`「${name}」不是工具类农资，不支持归还`)
    if (!isReturnableFarmTool(material)) throw new Error(`「${name}」属于工具耗材，使用后无需归还`)
    const entries = (order.consumed || []).filter((c) => c.material === name)
    const remaining = entries.reduce(
      (sum, c) => sum + Math.max((Number(c.quantity) || 0) - (Number(c.returned) || 0), 0),
      0,
    )
    if (remaining <= 0) throw new Error(`「${name}」已全部归还，无需重复归还`)
    if (qty > remaining) throw new Error(`「${name}」最多可归还 ${remaining}${material.unit}`)
    plans.push({ name, qty, material, entries })
  })

  const now = stampNow()
  plans.forEach(({ qty, material, entries }) => {
    let left = qty
    // 按领用先后顺序分摊归还数量，保留每次领用的归还明细
    entries.forEach((entry) => {
      if (left <= 0) return
      const available = Math.max((Number(entry.quantity) || 0) - (Number(entry.returned) || 0), 0)
      if (available <= 0) return
      const take = Math.min(available, left)
      entry.returned = (Number(entry.returned) || 0) + take
      entry.returnTime = now
      left -= take
    })
    material.stock = (Number(material.stock) || 0) + qty
    material.updateTime = now
  })

  const summary = plans.map((p) => `${p.name} ${p.qty}${p.material.unit}`).join('，')
  const remark = farmText(payload.remark)
  pushDeviceLog(
    order,
    '工具归还',
    currentUserName(),
    `归还 ${summary}，库存已同步回补${remark ? `；${remark}` : ''}`,
  )
  persistBiz()
  return normalizeDeviceOrder(order)
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
  const access = deviceOrderAccess()
  const scoped = visibleDeviceOrders(access)
  const orders = sortDeviceOrders(scoped).map(normalizeDeviceOrder)
  return {
    stats: { ...deviceStats, runningOrders: deviceOrderStats(scoped).running },
    onlineRate: { ...deviceOnlineRate7d },
    fault: { ...deviceFault7d },
    typeDist: deviceTypeDist.map((i) => ({ ...i })),
    workOrders: orders,
    permissions: deviceOrderPermissions(access),
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
  persistBiz()
  return { success: true }
}

export async function toggleSceneTemplateApi(id, enabled) {
  await delay()
  const t = sceneTemplates.find((i) => i.id === id)
  if (t) t.enabled = enabled
  persistBiz()
  return { success: true }
}

export async function saveStrategyApi(payload) {
  await delay()
  if (payload.id) {
    const idx = linkageStrategies.findIndex((s) => s.id === payload.id)
    if (idx > -1) linkageStrategies[idx] = { ...linkageStrategies[idx], ...payload }
    persistBiz()
    return { ...linkageStrategies[idx] }
  }
  const record = { ...payload, id: `LS-${String(linkageStrategies.length + 1).padStart(3, '0')}`, lastTrigger: '--' }
  linkageStrategies.push(record)
  persistBiz()
  return { ...record }
}

export async function deleteStrategyApi(id) {
  await delay()
  const idx = linkageStrategies.findIndex((s) => s.id === id)
  if (idx > -1) linkageStrategies.splice(idx, 1)
  persistBiz()
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
  persistBiz()
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
    persistBiz()
    return { ...fertilizerFormulas[idx] }
  }
  const record = { ...payload, id: `FF-${String(fertilizerFormulas.length + 1).padStart(2, '0')}` }
  fertilizerFormulas.push(record)
  persistBiz()
  return { ...record }
}

export async function deleteFormulaApi(id) {
  await delay()
  const idx = fertilizerFormulas.findIndex((f) => f.id === id)
  if (idx > -1) fertilizerFormulas.splice(idx, 1)
  persistBiz()
  return { success: true }
}

export async function applyFormulaApi(machineId, formulaName) {
  await delay(600)
  const m = fertilizerMachines.find((i) => i.id === machineId)
  if (!m) throw new Error('水肥一体机不存在')
  m.currentFormula = formulaName
  persistBiz()
  return { ...m }
}

export async function toggleMachineApi(id, action) {
  await delay(500)
  const m = fertilizerMachines.find((i) => i.id === id)
  if (!m) throw new Error('水肥一体机不存在')
  m.status = action === 'start' ? 'running' : 'stopped'
  if (m.status === 'stopped') m.flowRate = 0
  persistBiz()
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
  persistBiz()
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
  persistBiz()
  return { ...alarm }
}

export async function archiveAlarmApi(id, operator) {
  await delay(300)
  const alarm = findAlarm(id)
  if (alarm.status !== '已处置') throw new Error(`当前告警为「${alarm.status}」，仅已处置告警可归档`)
  alarm.status = '已归档'
  alarm.archivedBy = operator || '系统管理员'
  alarm.archivedAt = stampNow()
  persistBiz()
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
    persistBiz()
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
  persistBiz()
  return { ...record }
}

export async function toggleAlarmRuleApi(id, enabled) {
  await delay(200)
  const rule = alarmRules.find((r) => r.id === id)
  if (!rule) throw new Error('告警规则不存在')
  rule.enabled = enabled
  persistBiz()
  return { ...rule }
}

export async function deleteAlarmRuleApi(id) {
  await delay()
  const idx = alarmRules.findIndex((r) => r.id === id)
  if (idx > -1) alarmRules.splice(idx, 1)
  persistBiz()
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

// ---- 农产品 ↔ 种植地块联动 ----
const findFarmPlotByCode = (code) => farmPlots.find((p) => p.plotCode === code)

// 解析农产品种植来源：地块档案、种植作物、最近一次种植计划与采收批次
function resolvePlanting(product) {
  const plot = findFarmPlotByCode(product.plotCode)
  const plotName = plot ? plot.name : product.plot || ''
  const crop = product.crop || (plot ? plot.crop : product.variety)
  const plan = farmPlans
    .filter((p) => p.plot === plotName && (!crop || p.crop === crop))
    .sort((a, b) => (a.endDate > b.endDate ? -1 : 1))[0]
  const harvest = farmHarvest
    .filter((h) => h.plot === plotName && (!crop || h.crop === crop))
    .sort((a, b) => (a.harvestDate > b.harvestDate ? -1 : 1))[0]
  return {
    plotCode: plot ? plot.plotCode : product.plotCode || '',
    plot: plotName,
    crop,
    park: plot ? plot.location : product.park,
    plotArea: plot ? plot.area : '',
    plotOwner: plot ? plot.owner : '',
    plantPlanName: plan ? plan.planName : '',
    plantPlanStatus: plan ? plan.status : '',
    plantPlanEnd: plan ? plan.endDate : '',
    batchNo: harvest ? harvest.batchNo : '',
    harvestDate: harvest ? harvest.harvestDate : '',
  }
}

// 已支付口径：待支付订单不计入销售额、销量与客户采购
const salesPaidOrders = () => salesOrders.filter((o) => o.status !== '待支付')

const decorateProduct = (product) => {
  const rows = salesPaidOrders().filter((o) => o.productId === product.id)
  return {
    ...product,
    ...resolvePlanting(product),
    monthSales: salesSum(rows, 'qty'),
    monthAmount: roundMoney(salesSum(rows, 'amount')),
  }
}

const decorateOrder = (order) => {
  const customer = findSalesCustomer(order.customerId)
  const product = findSalesProduct(order.productId)
  const planting = product ? resolvePlanting(product) : {}
  return {
    ...order,
    customer: customer ? customer.name : order.customer,
    customerLevel: customer ? customer.level : order.customerLevel,
    plotCode: order.plotCode || planting.plotCode || '',
    plot: order.plot || planting.plot || '',
    crop: order.crop || planting.crop || '',
    plotOwner: order.plotOwner || planting.plotOwner || '',
    batchNo: order.batchNo || planting.batchNo || '',
  }
}

const salesDateString = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export async function getProductsApi(params = {}) {
  await delay()
  const { keyword = '', category = '', status = '', park = '', plotCode = '', page = 1, pageSize = 10 } = params
  const kw = keyword.trim()
  const list = salesProducts
    .map(decorateProduct)
    .filter((p) => {
      if (category && p.category !== category) return false
      if (status && p.status !== status) return false
      if (park && p.park !== park) return false
      if (plotCode && p.plotCode !== plotCode) return false
      if (kw) {
        const text = `${p.id} ${p.name} ${p.variety} ${p.grade} ${p.spec} ${p.plot} ${p.crop} ${p.batchNo}`
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
    linkedPlots: new Set(salesProducts.map((p) => p.plotCode).filter(Boolean)).size,
    unlinked: salesProducts.filter((p) => !p.plotCode).length,
  }
}

// 农产品可关联的种植地块：带出作物、面积、负责人与当前种植计划，供产销对接选择
export async function getProductPlotOptionsApi() {
  await delay(100)
  return farmPlots.map((plot) => {
    const plan = farmPlans
      .filter((p) => p.plot === plot.name)
      .sort((a, b) => (a.endDate > b.endDate ? -1 : 1))[0]
    return {
      code: plot.plotCode,
      name: plot.name,
      crop: plot.crop,
      area: plot.area,
      park: plot.location,
      owner: plot.owner,
      status: plot.status,
      planName: plan ? plan.planName : '',
      planStatus: plan ? plan.status : '',
    }
  })
}

export async function saveProductApi(payload) {
  await delay()
  const { id, ...data } = payload
  const plot = data.plotCode ? findFarmPlotByCode(data.plotCode) : null
  if (data.plotCode && !plot) throw new Error('种植地块不存在，请重新选择')
  // 地块为主数据源：选定地块后自动带出地块名称、所属园区与种植作物
  Object.assign(data, plot
    ? { plotCode: plot.plotCode, plot: plot.name, park: plot.location, crop: farmText(data.crop) || plot.crop }
    : { plot: '', crop: farmText(data.crop) })
  if (id) {
    const idx = salesProducts.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error('农产品不存在')
    salesProducts[idx] = { ...salesProducts[idx], ...data, updateTime: stampNow() }
    persistBiz()
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
  persistBiz()
  return decorateProduct(record)
}

export async function toggleProductStatusApi(id, status) {
  await delay(200)
  const product = findSalesProduct(id)
  if (!product) throw new Error('农产品不存在')
  product.status = status
  product.updateTime = stampNow()
  persistBiz()
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
  persistBiz()
  return { success: true }
}

export async function getOrdersApi(params = {}) {
  await delay()
  const { keyword = '', status = '', customerId = '', plotCode = '', dateRange = [], page = 1, pageSize = 10 } = params
  const kw = keyword.trim()
  const list = salesOrders
    .map(decorateOrder)
    .filter((o) => {
      if (status && o.status !== status) return false
      if (customerId && o.customerId !== customerId) return false
      if (plotCode && o.plotCode !== plotCode) return false
      if (dateRange && dateRange.length === 2) {
        const day = o.createTime.slice(0, 10)
        if (day < dateRange[0] || day > dateRange[1]) return false
      }
      if (kw) {
        const text = `${o.orderNo} ${o.customer} ${o.product} ${o.logisticsNo} ${o.plot} ${o.crop} ${o.batchNo}`
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
  const planting = resolvePlanting(product)
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
    park: planting.park || product.park,
    plotCode: planting.plotCode,
    plot: planting.plot,
    crop: planting.crop,
    plotOwner: planting.plotOwner,
    batchNo: planting.batchNo,
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
  persistBiz()
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
    persistBiz()
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
    persistBiz()
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
    .map((s) => {
      const order = salesOrders.find((o) => o.id === s.orderId)
      const origin = order ? decorateOrder(order) : {}
      return {
        ...s,
        plotCode: origin.plotCode || '',
        plot: origin.plot || '',
        crop: origin.crop || '',
        tracking: s.tracking.map((n) => ({ ...n })),
      }
    })
    .filter((s) => {
      if (status && s.status !== status) return false
      if (kw) {
        const text = `${s.id} ${s.orderNo} ${s.customer} ${s.product} ${s.logisticsNo} ${s.plot} ${s.crop}`
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
    persistBiz()
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
  persistBiz()
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
  persistBiz()
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
const farmText = (v) => String(v ?? '').trim()

const findFarmOrder = (id) => farmWorkOrders.find((o) => o.id === Number(id))
const findFarmMaterial = (id) => farmMaterials.find((m) => m.id === Number(id))

// 工单状态流转：待派单 → 已派单 → 进行中 → 已完成
const farmOrderFlow = { 待派单: ['已派单'], 已派单: ['进行中'], 进行中: ['已完成'], 已完成: [] }

// 工单可指派人员：同园区（部门）+ 任务专业对口
function eligibleFarmersForOrder(order) {
  const park = (farmPlots.find((p) => p.name === order.plot) || {}).location
  const specialty = taskTypeSpecialtyMap[order.taskType]
  return farmers.filter((f) => f.park === park && f.specialty === specialty)
}

// 自动指派：在同园区、专业对口的人员中选择当前未完成工单最少者，避免任务堆积
function pickAutoAssignee(order) {
  const candidates = eligibleFarmersForOrder(order)
  if (!candidates.length) return null
  const activeCount = (name) => farmWorkOrders.filter((o) => o.assignee === name && o.status !== '已完成').length
  return [...candidates].sort((a, b) => activeCount(a.name) - activeCount(b.name))[0]
}

// 向被指派人推送工单指派站内消息
function pushAssignMessage(order, farmer) {
  farmWorkMessages.unshift({
    id: nextId(farmWorkMessages),
    recipient: farmer.name,
    type: '工单指派',
    title: '您有新的农事工单',
    content: `工单「${order.orderNo} ${order.title}」已指派给您，请前往地块「${order.plot}」执行「${order.taskType}」任务，截止日期 ${order.deadline || '不限'}`,
    route: '/farm/record',
    read: false,
    createTime: stampNow(),
  })
}

// 工作人员提交打卡即视为完成该工单，自动同步工单状态为「已完成」
// 仅当工单已指派且打卡执行人与被指派人一致（含管理员代录）时同步，避免误更新无关工单
function syncOrderStatusByRecord(record) {
  if (!record || !record.orderNo) return null
  const order = farmWorkOrders.find((o) => o.orderNo === record.orderNo)
  if (!order || order.status === '已完成') return null
  if (!order.assignee || record.worker !== order.assignee) return null
  order.status = '已完成'
  order.updateTime = stampNow()
  return order
}

// ---- 农事物资联动：打卡消耗的农资/工具自动出库 ----
// 同一农资多次选择时合并数量，忽略空行与非法数量
function normalizeConsumedMaterials(list) {
  const map = new Map()
  ;(Array.isArray(list) ? list : []).forEach((c) => {
    const name = farmText(c && c.material)
    const qty = Number(c && c.quantity) || 0
    if (!name || qty <= 0) return
    map.set(name, (map.get(name) || 0) + qty)
  })
  return [...map.entries()].map(([material, quantity]) => ({ material, quantity }))
}

// 按「新消耗 - 旧消耗」的差额调整库存：新增时扣减、编辑时补差、删除时回补
// 先整体校验再统一扣减，避免部分农资已扣、部分失败导致库存失真
function applyConsumedMaterialsDelta(oldList, newList) {
  const deltas = new Map()
  ;(Array.isArray(oldList) ? oldList : []).forEach((c) => {
    const qty = Number(c && c.quantity) || 0
    if (c && c.material) deltas.set(c.material, (deltas.get(c.material) || 0) - qty)
  })
  newList.forEach((c) => {
    deltas.set(c.material, (deltas.get(c.material) || 0) + c.quantity)
  })
  const items = []
  deltas.forEach((delta, name) => {
    if (!delta) return
    const material = farmMaterials.find((m) => m.name === name)
    if (!material) {
      if (delta > 0) throw new Error(`农资「${name}」未建档，请先在农资库存中新增`)
      return
    }
    if (Number(material.stock) < delta) {
      throw new Error(`农资「${material.name}」库存不足（当前 ${material.stock}${material.unit}，需消耗 ${delta}${material.unit}）`)
    }
    items.push({ material, delta })
  })
  items.forEach(({ material, delta }) => {
    material.stock = Number(material.stock) - delta
    material.updateTime = stampNow()
  })
  return newList.map((c) => {
    const material = farmMaterials.find((m) => m.name === c.material)
    return { material: c.material, quantity: c.quantity, unit: material ? material.unit : '' }
  })
}

// 地块档案本地持久化：新增/编辑/删除后落盘，刷新页面仍保留
const FARM_PLOTS_KEY = 'samp_farm_plots_v1'

function persistFarmPlots() {
  try {
    localStorage.setItem(FARM_PLOTS_KEY, JSON.stringify(farmPlots))
  } catch (e) {
    /* 忽略存储异常 */
  }
}

;(function loadFarmPlots() {
  try {
    const raw = localStorage.getItem(FARM_PLOTS_KEY)
    if (raw) {
      const saved = JSON.parse(raw)
      if (Array.isArray(saved) && saved.length) {
        farmPlots.length = 0
        farmPlots.push(...saved)
        farmPlotNameList.length = 0
        farmPlotNameList.push(...farmPlots.map((p) => p.name))
      }
    }
  } catch (e) {
    /* 忽略损坏数据 */
  }
})()

export async function getFarmPlotsApi(params = {}) {
  await delay()
  const { keyword = '', crop = '', page = 1, pageSize = 10 } = params
  const kw = farmText(keyword)
  const list = farmPlots
    .map((p) => ({ ...p }))
    .filter((p) => {
      if (crop && p.crop !== crop) return false
      if (kw) {
        const text = `${p.plotCode} ${p.name} ${p.crop} ${p.location} ${p.soilType} ${p.owner}`
        if (!text.includes(kw)) return false
      }
      return true
    })
    .sort((a, b) => a.id - b.id)
  const total = list.length
  const start = (page - 1) * pageSize
  return {
    list: list.slice(start, start + pageSize),
    total,
    totalArea: farmPlots.reduce((sum, p) => sum + Number(p.area || 0), 0),
    inUseCount: farmPlots.filter((p) => p.status === 1).length,
  }
}

export async function saveFarmPlotApi(payload) {
  await delay()
  const { id, ...data } = payload
  if (id) {
    const idx = farmPlots.findIndex((p) => p.id === Number(id))
    if (idx === -1) throw new Error('地块档案不存在')
    farmPlots[idx] = {
      ...farmPlots[idx],
      ...data,
      area: Number(data.area ?? farmPlots[idx].area),
      status: data.status ?? farmPlots[idx].status,
      updateTime: stampNow(),
    }
    persistFarmPlots()
    return { ...farmPlots[idx] }
  }
  const code = farmText(data.plotCode)
  if (farmPlots.some((p) => p.plotCode === code)) throw new Error(`地块编码「${code}」已存在`)
  const record = {
    ...data,
    id: nextId(farmPlots),
    plotCode: code,
    area: Number(data.area) || 0,
    status: data.status ?? 1,
    createTime: stampNow(),
    updateTime: stampNow(),
  }
  farmPlots.unshift(record)
  farmPlotNameList.push(record.name)
  persistFarmPlots()
  return { ...record }
}

export async function deleteFarmPlotApi(id) {
  await delay()
  const idx = farmPlots.findIndex((p) => p.id === Number(id))
  if (idx === -1) throw new Error('地块档案不存在')
  const plot = farmPlots[idx]
  if (farmPlans.some((p) => p.plot === plot.name)) {
    throw new Error('该地块已关联种植计划，无法删除')
  }
  if (farmWorkOrders.some((o) => o.plot === plot.name && o.status !== '已完成')) {
    throw new Error('该地块存在未完成的农事工单，无法删除')
  }
  farmPlots.splice(idx, 1)
  const nameIdx = farmPlotNameList.indexOf(plot.name)
  if (nameIdx > -1) farmPlotNameList.splice(nameIdx, 1)
  persistFarmPlots()
  return { success: true }
}

export async function getFarmPlansApi(params = {}) {
  await delay()
  const { keyword = '', operationType = '', page = 1, pageSize = 10 } = params
  const kw = farmText(keyword)
  const list = farmPlans
    .map((p) => {
      // 关联工单：计划保存时自动生成并回写工单号
      const order = p.workOrderId
        ? farmWorkOrders.find((o) => o.id === Number(p.workOrderId))
        : farmWorkOrders.find((o) => o.orderNo === p.orderNo)
      return { ...p, orderNo: order ? order.orderNo : p.orderNo || '', orderStatus: order ? order.status : '' }
    })
    .filter((p) => {
      if (operationType && p.operationType !== operationType) return false
      if (kw) {
        const text = `${p.planName} ${p.plot} ${p.crop} ${p.executor}`
        if (!text.includes(kw)) return false
      }
      return true
    })
    .sort((a, b) => (a.createTime > b.createTime ? -1 : a.createTime < b.createTime ? 1 : b.id - a.id))
  const total = list.length
  const start = (page - 1) * pageSize
  return { list: list.slice(start, start + pageSize), total }
}

// ---- 种植计划 ↔ 农事工单联动 ----
// 工单号按日期生成，同日重复时追加序号
function genWorkOrderNo() {
  const d = new Date()
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  let no = `WO-${ymd}`
  let seq = 1
  while (farmWorkOrders.some((o) => o.orderNo === no)) {
    seq += 1
    no = `WO-${ymd}-${seq}`
  }
  return no
}

// 计划状态映射到工单状态：已完成/进行中不回退，其余由指派情况决定
function planOrderStatus(plan, order) {
  if (order.status === '已完成' || plan.status === '已完成') return '已完成'
  if (order.status === '进行中' || plan.status === '进行中') return '进行中'
  return order.assignee ? '已派单' : '待派单'
}

// 保存计划后同步工单：已有则更新标题/地块/任务/截止日期与状态，无则自动生成并指派
function syncOrderFromPlan(plan) {
  let order = plan.workOrderId
    ? farmWorkOrders.find((o) => o.id === Number(plan.workOrderId))
    : farmWorkOrders.find((o) => o.orderNo === plan.orderNo)
  if (order) {
    const prevAssignee = order.assignee
    order.title = plan.planName
    order.plot = plan.plot
    order.taskType = plan.operationType
    order.deadline = plan.endDate || order.deadline
    if (plan.executor) order.assignee = plan.executor
    order.status = planOrderStatus(plan, order)
    order.planId = plan.id
    order.updateTime = stampNow()
    // 执行人变更时重新推送指派消息，确保新负责人收到通知
    if (order.assignee && prevAssignee !== order.assignee) {
      const farmer = farmers.find((f) => f.name === order.assignee)
      if (farmer) pushAssignMessage(order, farmer)
    }
    plan.orderNo = order.orderNo
    plan.workOrderId = order.id
    plan.workOrderStatus = order.status
    return { order, created: false }
  }
  const record = {
    id: nextId(farmWorkOrders),
    orderNo: genWorkOrderNo(),
    title: plan.planName,
    plot: plan.plot,
    taskType: plan.operationType,
    assignee: plan.executor || '',
    deadline: plan.endDate || '',
    planId: plan.id,
    createTime: stampNow(),
    updateTime: stampNow(),
    status: plan.executor ? '已派单' : '待派单',
  }
  if (plan.status === '进行中') record.status = '进行中'
  if (plan.status === '已完成') record.status = '已完成'
  farmWorkOrders.unshift(record)
  if (record.assignee) {
    const farmer = farmers.find((f) => f.name === record.assignee)
    if (farmer) pushAssignMessage(record, farmer)
  } else {
    // 计划未指定执行人时，按同园区、专业对口、任务最少自动指派
    const autoFarmer = pickAutoAssignee(record)
    if (autoFarmer) {
      record.assignee = autoFarmer.name
      record.status = '已派单'
      pushAssignMessage(record, autoFarmer)
    }
  }
  plan.orderNo = record.orderNo
  plan.workOrderId = record.id
  plan.workOrderStatus = record.status
  return { order: record, created: true }
}

export async function saveFarmPlanApi(payload) {
  await delay()
  const { id, ...data } = payload
  if (id) {
    const idx = farmPlans.findIndex((p) => p.id === Number(id))
    if (idx === -1) throw new Error('种植计划不存在')
    farmPlans[idx] = { ...farmPlans[idx], ...data, updateTime: stampNow() }
    // 编辑计划同步更新关联工单（无关联工单时自动补建）
    const synced = syncOrderFromPlan(farmPlans[idx])
    persistBiz()
    return { ...farmPlans[idx], orderNo: synced.order.orderNo, orderStatus: synced.order.status, orderCreated: synced.created }
  }
  const record = {
    ...data,
    id: nextId(farmPlans),
    status: data.status || '未开始',
    createTime: stampNow(),
    updateTime: stampNow(),
  }
  farmPlans.unshift(record)
  // 新增计划即生成对应农事工单，并自动指派给执行人或专业人员
  const synced = syncOrderFromPlan(record)
  persistBiz()
  return { ...record, orderNo: synced.order.orderNo, orderStatus: synced.order.status, orderCreated: synced.created }
}

export async function deleteFarmPlanApi(id) {
  await delay()
  const idx = farmPlans.findIndex((p) => p.id === Number(id))
  if (idx === -1) throw new Error('种植计划不存在')
  const plan = farmPlans[idx]
  const order = plan.workOrderId
    ? farmWorkOrders.find((o) => o.id === Number(plan.workOrderId))
    : farmWorkOrders.find((o) => o.orderNo === plan.orderNo)
  let removedOrderNo = ''
  // 删除计划同步撤销未完成的关联工单；已完成工单与已有打卡记录的工单保留以保留历史
  if (order && order.status !== '已完成' && !farmRecords.some((r) => r.orderNo === order.orderNo)) {
    const orderIdx = farmWorkOrders.findIndex((o) => o.id === order.id)
    if (orderIdx > -1) farmWorkOrders.splice(orderIdx, 1)
    removedOrderNo = order.orderNo
  }
  farmPlans.splice(idx, 1)
  persistBiz()
  return { success: true, removedOrderNo, keptOrderNo: order && !removedOrderNo ? order.orderNo : '' }
}

export async function getFarmOrdersApi(params = {}) {
  await delay()
  const { keyword = '', status = '', page = 1, pageSize = 10 } = params
  const kw = farmText(keyword)
  const list = farmWorkOrders
    .map((o) => ({ ...o }))
    .filter((o) => {
      if (status && o.status !== status) return false
      if (kw) {
        const text = `${o.orderNo} ${o.title} ${o.plot} ${o.assignee} ${o.taskType}`
        if (!text.includes(kw)) return false
      }
      return true
    })
    .sort((a, b) => (a.createTime > b.createTime ? -1 : a.createTime < b.createTime ? 1 : b.id - a.id))
  const total = list.length
  const start = (page - 1) * pageSize
  return { list: list.slice(start, start + pageSize), total }
}

export async function createFarmOrderApi(payload) {
  await delay(400)
  assertOrderAdmin()
  const orderNo = farmText(payload.orderNo)
  if (!orderNo) throw new Error('请输入工单编号')
  if (farmWorkOrders.some((o) => o.orderNo === orderNo)) throw new Error(`工单编号「${orderNo}」已存在`)
  const record = {
    ...payload,
    id: nextId(farmWorkOrders),
    orderNo,
    assignee: '',
    status: '待派单',
    createTime: stampNow(),
    updateTime: stampNow(),
  }
  // 下发即自动指派给同园区、专业对口且任务最少的工作人员；无匹配人员时保留待派单由管理员手动指派
  const autoFarmer = pickAutoAssignee(record)
  if (autoFarmer) {
    record.assignee = autoFarmer.name
    record.status = '已派单'
    pushAssignMessage(record, autoFarmer)
  }
  farmWorkOrders.unshift(record)
  persistBiz()
  return { ...record }
}

export async function assignFarmOrderApi(id, assigneeId) {
  await delay(300)
  assertOrderAdmin()
  const order = findFarmOrder(id)
  if (!order) throw new Error('工单不存在')
  if (order.status === '已完成') throw new Error('已完成工单不可再指派')
  const farmer = farmers.find((f) => f.id === Number(assigneeId))
  if (!farmer) throw new Error('请选择要指派的农户')
  // 禁止跨园区（部门）指派：工单所属园区须与农户所在园区一致
  const park = (farmPlots.find((p) => p.name === order.plot) || {}).location
  if (farmer.park !== park) {
    throw new Error(`不可跨园区指派：「${farmer.name}」所在园区「${farmer.park}」与工单所属园区「${park || '未知'}」不一致`)
  }
  // 只能指派到专业对口的工作人员
  const specialty = taskTypeSpecialtyMap[order.taskType]
  if (farmer.specialty !== specialty) {
    throw new Error(`任务类型「${order.taskType}」需指派「${specialty}」专业人员，「${farmer.name}」专业为「${farmer.specialty}」`)
  }
  const prevAssignee = order.assignee
  order.assignee = farmer.name
  if (order.status === '待派单') order.status = '已派单'
  order.updateTime = stampNow()
  // 向被指派的工作人员推送工单指派站内消息，被指派人登录后即可在站内消息与农事台账中查看
  // 重复指派同一人时不重复推送，避免消息冒泡
  if (prevAssignee !== farmer.name) pushAssignMessage(order, farmer)
  persistBiz()
  return { ...order }
}

export async function updateFarmOrderStatusApi(id, status) {
  await delay(300)
  assertOrderAdmin()
  const order = findFarmOrder(id)
  if (!order) throw new Error('工单不存在')
  const allowed = farmOrderFlow[order.status] || []
  if (!allowed.includes(status)) {
    throw new Error(`当前工单状态为「${order.status}」，无法流转为「${status}」`)
  }
  order.status = status
  order.updateTime = stampNow()
  persistBiz()
  return { ...order }
}

export async function deleteFarmOrderApi(id) {
  await delay()
  assertOrderAdmin()
  const idx = farmWorkOrders.findIndex((o) => o.id === Number(id))
  if (idx === -1) throw new Error('工单不存在')
  const order = farmWorkOrders[idx]
  if (farmRecords.some((r) => r.orderNo === order.orderNo)) {
    throw new Error('该工单已有农事台账记录，无法删除')
  }
  farmWorkOrders.splice(idx, 1)
  persistBiz()
  return { success: true }
}

/* ------------------------- 站内消息与权限判定 ------------------------- */
// 取当前登录账号，站内消息定向投递、工单操作权限与台账记录权限均以登录账号为准
function currentUser() {
  try {
    return JSON.parse(localStorage.getItem('samp_user') || 'null') || {}
  } catch {
    return {}
  }
}

// 取当前登录用户姓名：站内消息按被指派人姓名定向投递
function currentUserName() {
  return currentUser().name || ''
}

// 农事工单下发/指派/状态流转/删除仅系统管理员可操作
function assertOrderAdmin() {
  if (currentUser().roleCode !== 'admin') throw new Error('仅系统管理员可操作农事工单')
}

export async function getMessagesApi() {
  await delay(200)
  const name = currentUserName()
  const list = farmWorkMessages
    .filter((m) => !name || m.recipient === name)
    .sort((a, b) => (a.createTime > b.createTime ? -1 : a.createTime < b.createTime ? 1 : b.id - a.id))
  const unread = list.filter((m) => !m.read).length
  return { list: list.map((m) => ({ ...m })), unread }
}

export async function markMessagesReadApi(ids) {
  await delay(150)
  const name = currentUserName()
  farmWorkMessages.forEach((m) => {
    if (m.recipient === name && (!ids || ids.includes(m.id))) m.read = true
  })
  persistBiz()
  return { success: true }
}

// 当前登录账号被指派的农事工单：农事台账「我的工单」展示，含工单状态与打卡情况
export async function getMyFarmOrdersApi(params = {}) {
  await delay()
  const { keyword = '', status = '', page = 1, pageSize = 10 } = params
  const name = currentUserName()
  const kw = farmText(keyword)
  const mine = name ? farmWorkOrders.filter((o) => o.assignee === name) : []
  const statusCounts = mine.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {})
  const list = mine
    .map((o) => {
      const record = farmRecords.find((r) => r.orderNo === o.orderNo && r.worker === o.assignee)
      return {
        ...o,
        recorded: !!record,
        recordTime: record ? record.recordTime : '',
      }
    })
    .filter((o) => {
      if (status && o.status !== status) return false
      if (kw) {
        const text = `${o.orderNo} ${o.title} ${o.plot} ${o.taskType}`
        if (!text.includes(kw)) return false
      }
      return true
    })
    .sort((a, b) => (a.createTime > b.createTime ? -1 : a.createTime < b.createTime ? 1 : b.id - a.id))
  const total = list.length
  const start = (page - 1) * pageSize
  return { list: list.slice(start, start + pageSize), total, statusCounts }
}

export async function getFarmRecordsApi(params = {}) {
  await delay()
  const { keyword = '', page = 1, pageSize = 10 } = params
  const kw = farmText(keyword)
  const admin = currentUser().roleCode === 'admin'
  const name = currentUserName()
  const list = farmRecords
    .map((r) => ({
      ...r,
      images: (r.images || []).slice(),
      // 关联工单状态：删除台账时据此判断是否需要同步回退工单状态
      orderStatus: (farmWorkOrders.find((o) => o.orderNo === r.orderNo) || {}).status || '',
      // 权限标记：本人记录可编辑；删除仅系统管理员
      editable: admin || (!!name && r.worker === name),
      deletable: admin,
    }))
    .filter((r) => {
      if (kw) {
        const text = `${r.orderNo} ${r.plot} ${r.worker} ${r.taskType} ${r.materials} ${r.remark || ''} ${(r.consumed || []).map((c) => c.material).join(' ')}`
        if (!text.includes(kw)) return false
      }
      return true
    })
    .sort((a, b) => (a.recordTime > b.recordTime ? -1 : a.recordTime < b.recordTime ? 1 : b.id - a.id))
  const total = list.length
  const start = (page - 1) * pageSize
  return { list: list.slice(start, start + pageSize), total }
}

export async function saveFarmRecordApi(payload) {
  await delay()
  const { id, ...data } = payload
  const images = (data.images || []).slice()
  const admin = currentUser().roleCode === 'admin'
  const name = currentUserName()
  const consumed = normalizeConsumedMaterials(data.consumed)
  if (id) {
    const idx = farmRecords.findIndex((r) => r.id === Number(id))
    if (idx === -1) throw new Error('台账记录不存在')
    // 工作人员只能修改本人提交的打卡记录，系统管理员可修改全部
    if (!admin && farmRecords[idx].worker !== name) {
      throw new Error('只能修改本人提交的打卡记录')
    }
    // 编辑打卡：按新旧消耗差额补/退库存
    const consumedDetail = applyConsumedMaterialsDelta(farmRecords[idx].consumed, consumed)
    farmRecords[idx] = {
      ...farmRecords[idx],
      ...data,
      worker: admin ? data.worker ?? farmRecords[idx].worker : farmRecords[idx].worker,
      workHours: Number(data.workHours ?? farmRecords[idx].workHours),
      consumed: consumedDetail,
      images,
      updateTime: stampNow(),
    }
    persistBiz()
    return { ...farmRecords[idx], images: images.slice() }
  }
  // 工作人员只能提交本人的打卡记录，执行人固定为当前登录账号
  if (!admin && name) data.worker = name
  // 打卡消耗农资/工具：扣减库存并记录实际出库明细
  const consumedDetail = applyConsumedMaterialsDelta([], consumed)
  const record = {
    ...data,
    id: nextId(farmRecords),
    workHours: Number(data.workHours) || 1,
    consumed: consumedDetail,
    images,
    recordTime: stampNow(),
    createTime: stampNow(),
  }
  farmRecords.unshift(record)
  // 打卡完成后自动同步农事工单状态，保证工单与台账数据一致
  const syncedOrder = syncOrderStatusByRecord(record)
  persistBiz()
  return { ...record, images: images.slice(), orderStatus: syncedOrder ? syncedOrder.status : '' }
}

export async function deleteFarmRecordApi(id) {
  await delay()
  // 打卡台账记录仅系统管理员可删除，避免工作人员误删他人记录
  if (currentUser().roleCode !== 'admin') {
    throw new Error('打卡台账记录仅系统管理员可删除')
  }
  const idx = farmRecords.findIndex((r) => r.id === Number(id))
  if (idx === -1) throw new Error('台账记录不存在')
  const record = farmRecords[idx]
  farmRecords.splice(idx, 1)
  // 删除台账回补该次打卡消耗的农资/工具库存，避免库存失准
  applyConsumedMaterialsDelta(record.consumed, [])
  // 删除台账后同步工单状态：已完成工单若已无任何打卡记录，则回退为「进行中」
  // 仍有其他打卡记录时保持已完成，避免误回退
  const order = record.orderNo ? farmWorkOrders.find((o) => o.orderNo === record.orderNo) : null
  let rolledBack = null
  if (order && order.status === '已完成' && !farmRecords.some((r) => r.orderNo === record.orderNo)) {
    order.status = '进行中'
    order.updateTime = stampNow()
    rolledBack = order
  }
  persistBiz()
  return { success: true, orderNo: order ? order.orderNo : record.orderNo, orderStatus: rolledBack ? rolledBack.status : '' }
}

export async function getFarmMaterialsApi(params = {}) {
  await delay()
  const { keyword = '', category = '', status = '', location = '', page = 1, pageSize = 10 } = params
  const kw = farmText(keyword)
  // 统计运维工单中尚未归还的工具数量，库存页可直接看到「在外借用」情况
  const borrowedMap = new Map()
  deviceWorkOrders.forEach((o) => {
    ;(o.consumed || []).forEach((c) => {
      const remaining = (Number(c.quantity) || 0) - (Number(c.returned) || 0)
      if (remaining <= 0) return
      borrowedMap.set(c.material, (borrowedMap.get(c.material) || 0) + remaining)
    })
  })
  const list = farmMaterials
    .map((m) => ({
      ...m,
      returnable: isReturnableFarmTool(m),
      borrowed: borrowedMap.get(m.name) || 0,
    }))
    .filter((m) => {
      if (category && m.category !== category) return false
      if (location && m.location !== location) return false
      // 状态筛选：low 仅看低库存（库存 ≤ 预警阀值），normal 仅看库存充足
      if (status === 'low' && Number(m.stock) > Number(m.threshold)) return false
      if (status === 'normal' && Number(m.stock) <= Number(m.threshold)) return false
      if (kw) {
        const text = `${m.name} ${m.category} ${m.spec} ${m.location}`
        if (!text.includes(kw)) return false
      }
      return true
    })
    .sort((a, b) => (a.updateTime > b.updateTime ? -1 : a.updateTime < b.updateTime ? 1 : b.id - a.id))
  const total = list.length
  const start = (page - 1) * pageSize
  return {
    list: list.slice(start, start + pageSize),
    total,
    lowStockCount: farmMaterials.filter((m) => m.stock <= m.threshold).length,
    locations: [...new Set(farmMaterials.map((m) => m.location).filter(Boolean))],
  }
}

export async function saveFarmMaterialApi(payload) {
  await delay()
  const { id, ...data } = payload
  if (id) {
    const idx = farmMaterials.findIndex((m) => m.id === Number(id))
    if (idx === -1) throw new Error('农资不存在')
    farmMaterials[idx] = {
      ...farmMaterials[idx],
      ...data,
      stock: Number(data.stock ?? farmMaterials[idx].stock),
      threshold: Number(data.threshold ?? farmMaterials[idx].threshold),
      updateTime: stampNow(),
    }
    persistBiz()
    return { ...farmMaterials[idx] }
  }
  const record = {
    ...data,
    id: nextId(farmMaterials),
    stock: Number(data.stock) || 0,
    threshold: Number(data.threshold ?? 10),
    createTime: stampNow(),
    updateTime: stampNow(),
  }
  farmMaterials.unshift(record)
  persistBiz()
  return { ...record }
}

export async function deleteFarmMaterialApi(id) {
  await delay()
  const idx = farmMaterials.findIndex((m) => m.id === Number(id))
  if (idx === -1) throw new Error('农资不存在')
  const material = farmMaterials[idx]
  if (farmPurchases.some((p) => p.material === material.name)) {
    throw new Error('该农资已有采购记录，无法删除')
  }
  // 存在未归还工具的，删除后无法归还，先归还再删除（工具耗材无需归还，不阻塞删除）
  const hasOutstanding =
    isReturnableFarmTool(material) &&
    deviceWorkOrders.some((o) =>
      (o.consumed || []).some(
        (c) =>
          c.material === material.name &&
          (Number(c.quantity) || 0) - (Number(c.returned) || 0) > 0,
      ),
    )
  if (hasOutstanding) {
    throw new Error('该工具还有未归还记录，请全部归还后再删除')
  }
  farmMaterials.splice(idx, 1)
  persistBiz()
  return { success: true }
}

export async function adjustFarmStockApi(id, { type, quantity } = {}) {
  await delay(300)
  const material = findFarmMaterial(id)
  if (!material) throw new Error('农资不存在')
  const qty = Number(quantity)
  if (!qty || qty <= 0) throw new Error('请输入正确的出入库数量')
  if (type === 'in') {
    material.stock = Number(material.stock) + qty
  } else if (type === 'out') {
    if (Number(material.stock) < qty) {
      throw new Error(`库存不足，当前库存 ${material.stock}${material.unit}`)
    }
    material.stock = Number(material.stock) - qty
  } else {
    throw new Error('不支持的出入库类型')
  }
  material.updateTime = stampNow()
  persistBiz()
  return { ...material }
}

export async function getFarmPurchasesApi(params = {}) {
  await delay()
  const { keyword = '', page = 1, pageSize = 10 } = params
  const kw = farmText(keyword)
  const list = farmPurchases
    .map((p) => ({ ...p }))
    .filter((p) => {
      if (kw) {
        const text = `${p.purchaseNo} ${p.material} ${p.supplier} ${p.purchaser}`
        if (!text.includes(kw)) return false
      }
      return true
    })
    .sort((a, b) => (a.purchaseTime > b.purchaseTime ? -1 : a.purchaseTime < b.purchaseTime ? 1 : b.id - a.id))
  const total = list.length
  const start = (page - 1) * pageSize
  return {
    list: list.slice(start, start + pageSize),
    total,
    totalAmount: roundMoney(salesSum(farmPurchases, 'amount')),
  }
}

export async function saveFarmPurchaseApi(payload) {
  await delay()
  const { id, ...data } = payload
  const quantity = Number(data.quantity) || 0
  const unitPrice = Number(data.unitPrice) || 0
  const amount = roundMoney(quantity * unitPrice)
  const materialName = farmText(data.material)
  const material = farmMaterials.find((m) => m.name === materialName)
  if (id) {
    const idx = farmPurchases.findIndex((p) => p.id === Number(id))
    if (idx === -1) throw new Error('采购记录不存在')
    const prev = farmPurchases[idx]
    // 编辑采购单时按数量差同步调整库存（更换农资则“原农资扣回、新农资增加”）
    const prevMaterial = farmMaterials.find((m) => m.name === prev.material)
    if (prevMaterial && material && prevMaterial.id === material.id) {
      material.stock = Number(material.stock) + (quantity - Number(prev.quantity || 0))
      material.updateTime = stampNow()
    } else {
      if (prevMaterial) {
        prevMaterial.stock = Math.max(0, Number(prevMaterial.stock) - Number(prev.quantity || 0))
        prevMaterial.updateTime = stampNow()
      }
      if (material) {
        material.stock = Number(material.stock) + quantity
        material.updateTime = stampNow()
      }
    }
    farmPurchases[idx] = {
      ...prev,
      ...data,
      unit: data.unit || material?.unit || prev.unit,
      quantity,
      unitPrice,
      amount,
      updateTime: stampNow(),
    }
    persistBiz()
    return { ...farmPurchases[idx], stockAfter: material ? material.stock : null }
  }
  const record = {
    ...data,
    id: nextId(farmPurchases),
    unit: data.unit || material?.unit || '',
    quantity,
    unitPrice,
    amount,
    purchaseTime: stampNow(),
    createTime: stampNow(),
  }
  farmPurchases.unshift(record)
  // 采购入库：登记采购后同步增加对应农资库存，低库存状态随之刷新
  let stockAfter = null
  if (material) {
    material.stock = Number(material.stock) + quantity
    material.updateTime = stampNow()
    stockAfter = material.stock
  }
  persistBiz()
  return { ...record, stockAfter }
}

export async function deleteFarmPurchaseApi(id) {
  await delay()
  const idx = farmPurchases.findIndex((p) => p.id === Number(id))
  if (idx === -1) throw new Error('采购记录不存在')
  const purchase = farmPurchases[idx]
  const material = farmMaterials.find((m) => m.name === purchase.material)
  const qty = Number(purchase.quantity) || 0
  // 删除采购记录同步扣回库存；若库存已被领用且不足扣回，则禁止删除避免数据失真
  if (material) {
    if (Number(material.stock) < qty) {
      throw new Error(`农资「${material.name}」当前库存 ${material.stock}${material.unit}，不足以扣回本次采购的 ${qty}${material.unit}，无法删除`)
    }
    material.stock = Number(material.stock) - qty
    material.updateTime = stampNow()
  }
  farmPurchases.splice(idx, 1)
  persistBiz()
  return { success: true, stockAfter: material ? material.stock : null }
}

export async function getFarmHarvestApi(params = {}) {
  await delay()
  const { keyword = '', crop = '', page = 1, pageSize = 10 } = params
  const kw = farmText(keyword)
  const list = farmHarvest
    .map((h) => ({ ...h }))
    .filter((h) => {
      if (crop && h.crop !== crop) return false
      if (kw) {
        const text = `${h.batchNo} ${h.plot} ${h.crop}`
        if (!text.includes(kw)) return false
      }
      return true
    })
    .sort((a, b) => (a.harvestDate > b.harvestDate ? -1 : a.harvestDate < b.harvestDate ? 1 : b.id - a.id))
  const total = list.length
  const start = (page - 1) * pageSize

  const quantityOf = (h) => Number(h.gradeA || 0) + Number(h.gradeB || 0) + Number(h.gradeC || 0)
  const totalQuantity = farmHarvest.reduce((sum, h) => sum + quantityOf(h), 0)
  const gradeAQuantity = farmHarvest.reduce((sum, h) => sum + Number(h.gradeA || 0), 0)
  return {
    list: list.slice(start, start + pageSize),
    total,
    stats: {
      totalQuantity,
      batchCount: farmHarvest.length,
      gradeARate: totalQuantity ? Math.round((gradeAQuantity / totalQuantity) * 1000) / 10 : 0,
      plotCount: new Set(farmHarvest.map((h) => h.plot)).size,
    },
  }
}

export async function saveFarmHarvestApi(payload) {
  await delay()
  const { id, ...data } = payload
  if (id) {
    const idx = farmHarvest.findIndex((h) => h.id === Number(id))
    if (idx === -1) throw new Error('采收批次不存在')
    farmHarvest[idx] = {
      ...farmHarvest[idx],
      ...data,
      gradeA: Number(data.gradeA ?? farmHarvest[idx].gradeA),
      gradeB: Number(data.gradeB ?? farmHarvest[idx].gradeB),
      gradeC: Number(data.gradeC ?? farmHarvest[idx].gradeC),
      updateTime: stampNow(),
    }
    persistBiz()
    return { ...farmHarvest[idx] }
  }
  const record = {
    ...data,
    id: nextId(farmHarvest),
    gradeA: Number(data.gradeA) || 0,
    gradeB: Number(data.gradeB) || 0,
    gradeC: Number(data.gradeC) || 0,
    createTime: stampNow(),
  }
  farmHarvest.unshift(record)
  persistBiz()
  return { ...record }
}

export async function deleteFarmHarvestApi(id) {
  await delay()
  const idx = farmHarvest.findIndex((h) => h.id === Number(id))
  if (idx === -1) throw new Error('采收批次不存在')
  farmHarvest.splice(idx, 1)
  persistBiz()
  return { success: true }
}

/* ------------------------- 农业专家与病虫害知识库 ------------------------- */
const findKnowledgeExpert = (id) => knowledgeExperts.find((e) => e.id === id)

const decorateExpert = (expert) => {
  const published = knowledgeArticles.filter((a) => a.expertId === expert.id && a.status === '已发布')
  return {
    ...expert,
    articleCount: published.length,
    articleTotal: knowledgeArticles.filter((a) => a.expertId === expert.id).length,
    totalViews: published.reduce((sum, a) => sum + a.views, 0),
  }
}

const decorateArticle = (article) => {
  const expert = findKnowledgeExpert(article.expertId)
  return {
    ...article,
    tags: article.tags.slice(),
    author: expert ? expert.name : '平台编辑',
    authorOrg: expert ? expert.organization : '',
    authorTitle: expert ? expert.title : '',
  }
}

export async function getKnowledgeOverviewApi() {
  await delay()
  const published = knowledgeArticles.filter((a) => a.status === '已发布')
  const experts = knowledgeExperts.filter((e) => e.status === '已入驻').map(decorateExpert)
  const categories = knowledgeCategories.map((c) => ({
    ...c,
    count: published.filter((a) => a.category === c.name).length,
  }))
  return {
    stats: {
      expertCount: experts.length,
      articleCount: published.length,
      pestCount: pestLibrary.length,
      planCount: pestLibrary.filter((p) => p.plan).length,
      totalViews: published.reduce((sum, a) => sum + a.views, 0),
    },
    fields: knowledgeFields
      .map((name) => ({ name, count: experts.filter((e) => e.field === name).length }))
      .filter((i) => i.count > 0),
    categories,
    categoryDist: categories.filter((c) => c.count > 0).map((c) => ({ name: c.name, value: c.count })),
    experts,
    latestArticles: published
      .slice()
      .sort((a, b) => (a.publishTime > b.publishTime ? -1 : 1))
      .slice(0, 5)
      .map(decorateArticle),
    hotArticles: published
      .slice()
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map(decorateArticle),
  }
}

export async function getKnowledgeExpertsApi(params = {}) {
  await delay()
  const { keyword = '', field = '', status = '', page = 1, pageSize = 10 } = params
  const kw = keyword.trim()
  const list = knowledgeExperts
    .map(decorateExpert)
    .filter((e) => {
      if (field && e.field !== field) return false
      if (status && e.status !== status) return false
      if (kw) {
        const text = `${e.id} ${e.name} ${e.title} ${e.field} ${e.organization} ${e.specialty}`
        if (!text.includes(kw)) return false
      }
      return true
    })
    .sort((a, b) => (a.status === b.status ? (a.joinTime > b.joinTime ? -1 : 1) : a.status === '已入驻' ? -1 : 1))
  const total = list.length
  const start = (page - 1) * pageSize
  return {
    list: list.slice(start, start + pageSize),
    total,
    fields: knowledgeFields.slice(),
    pendingCount: knowledgeExperts.filter((e) => e.status === '待审核').length,
  }
}

export async function saveKnowledgeExpertApi(payload) {
  await delay()
  const { id, ...data } = payload
  if (id) {
    const idx = knowledgeExperts.findIndex((e) => e.id === id)
    if (idx === -1) throw new Error('专家不存在')
    knowledgeExperts[idx] = { ...knowledgeExperts[idx], ...data }
    persistBiz()
    return decorateExpert(knowledgeExperts[idx])
  }
  const max = knowledgeExperts.reduce((m, e) => Math.max(m, Number(e.id.slice(1)) || 0), 0)
  const record = {
    avatar: '',
    status: '待审核',
    years: 5,
    specialty: '',
    intro: '',
    ...data,
    id: `E${String(max + 1).padStart(3, '0')}`,
    joinTime: stampNow(),
  }
  knowledgeExperts.push(record)
  persistBiz()
  return decorateExpert(record)
}

export async function auditKnowledgeExpertApi(id, action) {
  await delay()
  const expert = findKnowledgeExpert(id)
  if (!expert) throw new Error('专家不存在')
  if (action === 'approve') {
    expert.status = '已入驻'
    expert.joinTime = stampNow()
  } else if (action === 'reject') {
    expert.status = '已驳回'
  } else {
    throw new Error('不支持的审核动作')
  }
  persistBiz()
  return decorateExpert(expert)
}

export async function deleteKnowledgeExpertApi(id) {
  await delay()
  const idx = knowledgeExperts.findIndex((e) => e.id === id)
  if (idx === -1) throw new Error('专家不存在')
  if (knowledgeArticles.some((a) => a.expertId === id)) {
    throw new Error('该专家已关联知识文章，无法删除')
  }
  knowledgeExperts.splice(idx, 1)
  persistBiz()
  return { success: true }
}

export async function getKnowledgeArticlesApi(params = {}) {
  await delay()
  const { keyword = '', category = '', status = '', page = 1, pageSize = 10 } = params
  const kw = keyword.trim()
  const list = knowledgeArticles
    .map(decorateArticle)
    .filter((a) => {
      if (category && a.category !== category) return false
      if (status && a.status !== status) return false
      if (kw) {
        const text = `${a.id} ${a.title} ${a.category} ${a.author} ${a.tags.join(' ')}`
        if (!text.includes(kw)) return false
      }
      return true
    })
    .sort((a, b) => (a.publishTime > b.publishTime ? -1 : 1))
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
    const before = { ...knowledgeArticles[idx] }
    knowledgeArticles[idx] = { ...before, ...data }
    persistBiz()
    return decorateArticle(knowledgeArticles[idx])
  }
  const max = knowledgeArticles.reduce((m, a) => Math.max(m, Number(a.id.slice(1)) || 0), 0)
  const record = {
    tags: [],
    recommend: false,
    auditRemark: '',
    ...data,
    id: `A${String(max + 1).padStart(3, '0')}`,
    views: 0,
    status: data.status || '草稿',
    publishTime: stampNow(),
  }
  knowledgeArticles.unshift(record)
  persistBiz()
  return decorateArticle(record)
}

export async function auditKnowledgeArticleApi(id, action, remark = '') {
  await delay()
  const article = knowledgeArticles.find((a) => a.id === id)
  if (!article) throw new Error('知识条目不存在')
  if (action === 'publish') {
    article.status = '已发布'
    article.publishTime = stampNow()
    article.auditRemark = remark || '审核通过，已发布'
  } else if (action === 'reject') {
    article.status = '草稿'
    article.auditRemark = remark || '审核退回，请修改后重新提交'
  } else {
    throw new Error('不支持的审核动作')
  }
  persistBiz()
  return decorateArticle(article)
}

export async function deleteKnowledgeArticleApi(id) {
  await delay()
  const idx = knowledgeArticles.findIndex((a) => a.id === id)
  if (idx === -1) throw new Error('知识条目不存在')
  knowledgeArticles.splice(idx, 1)
  persistBiz()
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
  const name = (payload.name || '').trim()
  if (!name) throw new Error('请输入分类名称')
  if (knowledgeCategories.some((c) => c.name === name && c.id !== payload.id)) {
    throw new Error('该分类名称已存在')
  }
  if (payload.id) {
    const idx = knowledgeCategories.findIndex((c) => c.id === payload.id)
    if (idx === -1) throw new Error('分类不存在')
    const oldName = knowledgeCategories[idx].name
    knowledgeCategories[idx] = { ...knowledgeCategories[idx], ...payload, name }
    if (oldName !== name) {
      knowledgeArticles.forEach((a) => {
        if (a.category === oldName) a.category = name
      })
    }
    persistBiz()
    return { ...knowledgeCategories[idx] }
  }
  const max = knowledgeCategories.reduce((m, c) => Math.max(m, Number(c.id.slice(1)) || 0), 0)
  const record = {
    description: '',
    ...payload,
    name,
    id: `K${String(max + 1).padStart(2, '0')}`,
  }
  knowledgeCategories.push(record)
  persistBiz()
  return { ...record }
}

export async function deleteKnowledgeCategoryApi(id) {
  await delay()
  const idx = knowledgeCategories.findIndex((c) => c.id === id)
  if (idx === -1) throw new Error('分类不存在')
  const name = knowledgeCategories[idx].name
  // 级联处理：删除分类时，关联文章的 category 置为空，前端渲染兜底显示"未分类"
  knowledgeArticles.forEach((a) => {
    if (a.category === name) a.category = ''
  })
  knowledgeCategories.splice(idx, 1)
  persistBiz()
  return { success: true }
}

export async function getPestsApi(params = {}) {
  await delay()
  const { keyword = '', type = '', crop = '', severity = '', page = 1, pageSize = 8 } = params
  const kw = keyword.trim()
  const list = pestLibrary
    .filter((p) => {
      if (type && p.type !== type) return false
      if (crop && !p.crops.includes(crop)) return false
      if (severity && p.severity !== severity) return false
      if (kw) {
        const text = `${p.id} ${p.name} ${p.alias} ${p.crops} ${p.symptom}`
        if (!text.includes(kw)) return false
      }
      return true
    })
    .map(({ plan, ...rest }) => ({ ...rest }))
    .sort((a, b) => (a.type === b.type ? (a.severity === b.severity ? 0 : a.severity === '高' ? -1 : 1) : a.type === '病害' ? -1 : 1))
  const total = list.length
  const start = (page - 1) * pageSize
  const crops = Array.from(new Set(pestLibrary.flatMap((p) => p.crops.split('、'))))
  return {
    list: list.slice(start, start + pageSize),
    total,
    crops,
    diseaseCount: pestLibrary.filter((p) => p.type === '病害').length,
    insectCount: pestLibrary.filter((p) => p.type === '虫害').length,
  }
}

export async function getPestPlansApi(params = {}) {
  await delay()
  const { keyword = '', type = '', page = 1, pageSize = 10 } = params
  const kw = keyword.trim()
  const list = pestLibrary
    .filter((p) => {
      if (type && p.type !== type) return false
      if (kw) {
        const text = `${p.id} ${p.name} ${p.alias} ${p.crops} ${p.plan.principle}`
        if (!text.includes(kw)) return false
      }
      return true
    })
    .map((p) => JSON.parse(JSON.stringify(p)))
  const total = list.length
  const start = (page - 1) * pageSize
  return {
    list: list.slice(start, start + pageSize),
    total,
    stats: {
      total: pestLibrary.length,
      disease: pestLibrary.filter((p) => p.type === '病害').length,
      insect: pestLibrary.filter((p) => p.type === '虫害').length,
      drugs: pestLibrary.reduce((sum, p) => sum + p.plan.drugs.length, 0),
    },
  }
}
