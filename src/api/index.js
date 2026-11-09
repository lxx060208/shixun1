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
const farmStamp = () => stampNow().slice(0, 16)

const farmPage = (list, page, pageSize) => {
  const total = list.length
  const start = (page - 1) * pageSize
  return { list: list.slice(start, start + pageSize).map((i) => ({ ...i })), total }
}

/* ---- 地块档案 ---- */
export async function getFarmPlotsApi({ keyword = '', crop = '', status = '', page = 1, pageSize = 10 } = {}) {
  await delay()
  const kw = keyword.trim()
  const list = farmPlots
    .filter((p) => {
      if (crop && p.crop !== crop) return false
      if (status !== '' && p.status !== status) return false
      if (kw) {
        const text = `${p.plotCode} ${p.name} ${p.location} ${p.owner} ${p.crop}`
        if (!text.includes(kw)) return false
      }
      return true
    })
    .sort((a, b) => (a.createTime > b.createTime ? -1 : 1))
  const { list: rows, total } = farmPage(list, page, pageSize)
  return {
    list: rows,
    total,
    totalArea: farmPlots.reduce((s, p) => s + (Number(p.area) || 0), 0),
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
  const record = {
    coverImage: '',
    status: 1,
    owner: '',
    soilType: '壤土',
    location: '南山智慧农业示范园',
    ...data,
    id: nextId(farmPlots),
    createTime: farmStamp(),
  }
  farmPlots.unshift(record)
  return { ...record }
}

export async function deleteFarmPlotApi(id) {
  await delay()
  const idx = farmPlots.findIndex((p) => p.id === id)
  if (idx > -1) farmPlots.splice(idx, 1)
  return { success: true }
}

/* ---- 种植计划 ---- */
export async function getFarmPlansApi({ operationType = '', keyword = '', page = 1, pageSize = 10 } = {}) {
  await delay()
  const kw = keyword.trim()
  const list = farmPlantPlans
    .filter((p) => {
      if (operationType && p.operationType !== operationType) return false
      if (kw) {
        const text = `${p.planName} ${p.plot} ${p.crop} ${p.executor}`
        if (!text.includes(kw)) return false
      }
      return true
    })
    .sort((a, b) => (a.createTime > b.createTime ? -1 : 1))
  return farmPage(list, page, pageSize)
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
  const record = { status: '未开始', ...data, id: nextId(farmPlantPlans), createTime: farmStamp() }
  farmPlantPlans.unshift(record)
  return { ...record }
}

export async function deleteFarmPlanApi(id) {
  await delay()
  const idx = farmPlantPlans.findIndex((p) => p.id === id)
  if (idx > -1) farmPlantPlans.splice(idx, 1)
  return { success: true }
}

/* ---- 农事工单 ---- */
export async function getFarmOrdersApi({ status = '', keyword = '', page = 1, pageSize = 10 } = {}) {
  await delay()
  const kw = keyword.trim()
  const list = farmWorkOrders
    .filter((o) => {
      if (status && o.status !== status) return false
      if (kw) {
        const text = `${o.orderNo} ${o.title} ${o.plot} ${o.taskType} ${o.assignee}`
        if (!text.includes(kw)) return false
      }
      return true
    })
    .sort((a, b) => b.id - a.id)
  return farmPage(list, page, pageSize)
}

export async function createFarmOrderApi(payload) {
  await delay()
  const record = {
    ...payload,
    id: nextId(farmWorkOrders),
    assignee: '',
    status: '待派单',
    createTime: farmStamp(),
  }
  farmWorkOrders.unshift(record)
  return { ...record }
}

export async function assignFarmOrderApi(id, assignee) {
  await delay()
  const order = farmWorkOrders.find((o) => o.id === id)
  if (!order) throw new Error('工单不存在')
  order.assignee = assignee
  order.status = '已派单'
  return { ...order }
}

export async function updateFarmOrderStatusApi(id, status) {
  await delay()
  const order = farmWorkOrders.find((o) => o.id === id)
  if (!order) throw new Error('工单不存在')
  const flow = { 待派单: '已派单', 已派单: '进行中', 进行中: '已完成' }
  if (flow[order.status] !== status) throw new Error(`当前状态「${order.status}」无法流转为「${status}」`)
  order.status = status
  return { ...order }
}

export async function deleteFarmOrderApi(id) {
  await delay()
  const idx = farmWorkOrders.findIndex((o) => o.id === id)
  if (idx > -1) farmWorkOrders.splice(idx, 1)
  return { success: true }
}

/* ---- 农事执行打卡与台账 ---- */
export async function getFarmRecordsApi({ orderNo = '', keyword = '', page = 1, pageSize = 10 } = {}) {
  await delay()
  const kw = keyword.trim()
  const list = farmRecords
    .filter((r) => {
      if (orderNo && r.orderNo !== orderNo) return false
      if (kw) {
        const text = `${r.orderNo} ${r.plot} ${r.taskType} ${r.worker}`
        if (!text.includes(kw)) return false
      }
      return true
    })
    .sort((a, b) => (a.recordTime > b.recordTime ? -1 : 1))
  return farmPage(list, page, pageSize)
}

export async function saveFarmRecordApi(payload) {
  await delay()
  const { id, ...data } = payload
  if (id) {
    const idx = farmRecords.findIndex((r) => r.id === id)
    if (idx === -1) throw new Error('打卡记录不存在')
    farmRecords[idx] = { ...farmRecords[idx], ...data }
    return { ...farmRecords[idx] }
  }
  const record = { ...data, id: nextId(farmRecords), recordTime: farmStamp() }
  farmRecords.unshift(record)
  return { ...record }
}

export async function deleteFarmRecordApi(id) {
  await delay()
  const idx = farmRecords.findIndex((r) => r.id === id)
  if (idx > -1) farmRecords.splice(idx, 1)
  return { success: true }
}

/* ---- 农资库存 ---- */
export async function getFarmMaterialsApi({ keyword = '', category = '', page = 1, pageSize = 10 } = {}) {
  await delay()
  const kw = keyword.trim()
  const list = farmMaterials
    .filter((m) => {
      if (category && m.category !== category) return false
      if (kw) {
        const text = `${m.name} ${m.spec} ${m.location}`
        if (!text.includes(kw)) return false
      }
      return true
    })
    .sort((a, b) => (a.stock - a.threshold) - (b.stock - b.threshold))
  const { list: rows } = farmPage(list, page, pageSize)
  return {
    list: rows,
    total: list.length,
    lowStockCount: farmMaterials.filter((m) => m.stock <= m.threshold).length,
  }
}

export async function saveFarmMaterialApi(payload) {
  await delay()
  const { id, ...data } = payload
  if (id) {
    const idx = farmMaterials.findIndex((m) => m.id === id)
    if (idx === -1) throw new Error('农资不存在')
    farmMaterials[idx] = { ...farmMaterials[idx], ...data, updateTime: farmStamp() }
    return { ...farmMaterials[idx] }
  }
  const record = { ...data, id: nextId(farmMaterials), updateTime: farmStamp() }
  farmMaterials.unshift(record)
  return { ...record }
}

export async function adjustFarmStockApi(id, { type, quantity }) {
  await delay()
  const m = farmMaterials.find((i) => i.id === id)
  if (!m) throw new Error('农资不存在')
  const qty = Number(quantity)
  if (!qty || qty <= 0) throw new Error('请输入正确数量')
  if (type === 'out' && qty > m.stock) throw new Error(`库存不足，当前库存 ${m.stock}${m.unit}`)
  m.stock = type === 'in' ? m.stock + qty : m.stock - qty
  m.updateTime = farmStamp()
  return { ...m }
}

export async function deleteFarmMaterialApi(id) {
  await delay()
  const idx = farmMaterials.findIndex((m) => m.id === id)
  if (idx > -1) farmMaterials.splice(idx, 1)
  return { success: true }
}

export async function getFarmPurchasesApi({ keyword = '', page = 1, pageSize = 10 } = {}) {
  await delay()
  const kw = keyword.trim()
  const list = farmPurchases
    .filter((p) => {
      if (kw) {
        const text = `${p.purchaseNo} ${p.material} ${p.supplier} ${p.purchaser}`
        if (!text.includes(kw)) return false
      }
      return true
    })
    .sort((a, b) => (a.purchaseTime > b.purchaseTime ? -1 : 1))
  const { list: rows, total } = farmPage(list, page, pageSize)
  return { list: rows, total, totalAmount: farmPurchases.reduce((s, p) => s + (Number(p.amount) || 0), 0) }
}

export async function saveFarmPurchaseApi(payload) {
  await delay()
  const { id, ...data } = payload
  if (id) {
    const idx = farmPurchases.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error('采购记录不存在')
    farmPurchases[idx] = { ...farmPurchases[idx], ...data }
    return { ...farmPurchases[idx] }
  }
  const record = { ...data, id: nextId(farmPurchases), purchaseTime: farmStamp() }
  farmPurchases.unshift(record)
  return { ...record }
}

export async function deleteFarmPurchaseApi(id) {
  await delay()
  const idx = farmPurchases.findIndex((p) => p.id === id)
  if (idx > -1) farmPurchases.splice(idx, 1)
  return { success: true }
}

/* ---- 采收与产量 ---- */
export async function getFarmHarvestApi({ keyword = '', crop = '', page = 1, pageSize = 10 } = {}) {
  await delay()
  const kw = keyword.trim()
  const list = farmHarvestBatches
    .filter((h) => {
      if (crop && h.crop !== crop) return false
      if (kw) {
        const text = `${h.batchNo} ${h.plot} ${h.crop}`
        if (!text.includes(kw)) return false
      }
      return true
    })
    .sort((a, b) => (a.harvestDate > b.harvestDate ? -1 : 1))
  const { list: rows, total } = farmPage(list, page, pageSize)
  const totalQty = farmHarvestBatches.reduce((s, h) => s + h.gradeA + h.gradeB + h.gradeC, 0)
  const gradeAQty = farmHarvestBatches.reduce((s, h) => s + h.gradeA, 0)
  return {
    list: rows,
    total,
    stats: {
      totalQuantity: totalQty,
      batchCount: farmHarvestBatches.length,
      gradeARate: totalQty ? Math.round((gradeAQty / totalQty) * 1000) / 10 : 0,
      plotCount: new Set(farmHarvestBatches.map((h) => h.plot)).size,
    },
  }
}

export async function saveFarmHarvestApi(payload) {
  await delay()
  const { id, ...data } = payload
  if (id) {
    const idx = farmHarvestBatches.findIndex((h) => h.id === id)
    if (idx === -1) throw new Error('采收批次不存在')
    farmHarvestBatches[idx] = { ...farmHarvestBatches[idx], ...data }
    return { ...farmHarvestBatches[idx] }
  }
  const record = { gradeA: 0, gradeB: 0, gradeC: 0, ...data, id: nextId(farmHarvestBatches), createTime: farmStamp() }
  farmHarvestBatches.unshift(record)
  return { ...record }
}

export async function deleteFarmHarvestApi(id) {
  await delay()
  const idx = farmHarvestBatches.findIndex((h) => h.id === id)
  if (idx > -1) farmHarvestBatches.splice(idx, 1)
  return { success: true }
}