// 物联网环境监测 - 数据层（模拟传感器数据 + 设备配置持久化）

const DEVICE_KEY = 'samp_iot_devices_v1'

// ---------- 小型确定性随机序列（保证历史数据刷新后稳定） ----------
function seededSeries(base, amp, count, seed = 0) {
  const out = []
  let t = seed + 1
  for (let i = 0; i < count; i++) {
    // 线性同余 + 正弦，产生围绕 base 的平滑波动
    t = (t * 1103515245 + 12345) % 2147483648
    const noise = (t / 2147483648 - 0.5) * 2
    const wave = Math.sin(i / 2.4 + seed) * 0.6
    out.push(+(base + (wave + noise * 0.6) * amp).toFixed(1))
  }
  return out
}

function timeLabels(count = 24) {
  const labels = []
  const now = new Date()
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 60 * 60 * 1000)
    labels.push(`${String(d.getHours()).padStart(2, '0')}:00`)
  }
  return labels
}

// ---------- 设备管理（持久化） ----------
const seedDevices = [
  { id: 1001, name: '空气站-A1', type: 'air', typeName: '空气', location: '1号温室', park: 'qs', frequency: 30, status: 'online', lastOnline: '2026-11-05 09:30' },
  { id: 1002, name: '土壤墒情-S02', type: 'soil', typeName: '土壤', location: '东区大田', park: 'qs', frequency: 60, status: 'online', lastOnline: '2026-11-05 09:28' },
  { id: 1003, name: '水质-W3', type: 'water', typeName: '水质', location: '灌溉蓄水池', park: 'qs', frequency: 120, status: 'offline', lastOnline: '2026-11-04 18:12' },
  { id: 1004, name: '气象站-M1', type: 'weather', typeName: '气象', location: '园区中心', park: 'qs', frequency: 60, status: 'online', lastOnline: '2026-11-05 09:31' },
  { id: 1005, name: '高清摄像头-C1', type: 'camera', typeName: '视频', location: '1号温室', park: 'qs', frequency: 0, status: 'online', lastOnline: '2026-11-05 09:31' },
  { id: 1006, name: '空气站-B1', type: 'air', typeName: '空气', location: '2号温室', park: 'st', frequency: 30, status: 'online', lastOnline: '2026-11-05 09:25' },
  { id: 1007, name: '土壤墒情-S12', type: 'soil', typeName: '土壤', location: '西区果园', park: 'st', frequency: 60, status: 'online', lastOnline: '2026-11-05 09:22' },
  { id: 1008, name: '气象站-M2', type: 'weather', typeName: '气象', location: '果园中心', park: 'st', frequency: 60, status: 'online', lastOnline: '2026-11-05 09:20' },
  { id: 1009, name: '水质-W8', type: 'water', typeName: '水质', location: '稻田蓄水', park: 'dy', frequency: 120, status: 'offline', lastOnline: '2026-11-04 17:40' },
  { id: 1010, name: '气象站-M3', type: 'weather', typeName: '气象', location: '稻渔片区', park: 'dy', frequency: 60, status: 'online', lastOnline: '2026-11-05 09:18' },
  { id: 1011, name: '高清摄像头-C2', type: 'camera', typeName: '视频', location: '鱼塘周界', park: 'dy', frequency: 0, status: 'online', lastOnline: '2026-11-05 09:18' },
]

function loadDevices() {
  try {
    const raw = localStorage.getItem(DEVICE_KEY)
    if (raw) {
      // 老数据没有园区字段，回填到「清水有机蔬菜基地」
      return JSON.parse(raw).map((d) => ({ park: 'qs', ...d }))
    }
  } catch (e) {
    /* ignore */
  }
  return seedDevices
}

let devices = loadDevices()

function persistDevices() {
  localStorage.setItem(DEVICE_KEY, JSON.stringify(devices))
}

// ---------- 实时指标 ----------
export const airMetrics = [
  { label: 'PM2.5', value: 32, unit: 'μg/m³', status: 'normal' },
  { label: 'PM10', value: 58, unit: 'μg/m³', status: 'normal' },
  { label: 'CO₂', value: 486, unit: 'ppm', status: 'warn' },
  { label: 'O₂', value: 20.8, unit: '%', status: 'normal' },
  { label: '温度', value: 24.6, unit: '°C', status: 'normal' },
  { label: '湿度', value: 62, unit: '%', status: 'normal' },
]

export const soilMetrics = [
  { label: '土壤湿度', value: 28, unit: '%', status: 'warn' },
  { label: '土壤温度', value: 19.4, unit: '°C', status: 'normal' },
  { label: 'pH 值', value: 6.8, unit: '', status: 'normal' },
  { label: 'EC 电导率', value: 1.4, unit: 'mS/cm', status: 'normal' },
  { label: '氮 (N)', value: 86, unit: 'mg/kg', status: 'normal' },
  { label: '磷 (P)', value: 34, unit: 'mg/kg', status: 'normal' },
  { label: '钾 (K)', value: 152, unit: 'mg/kg', status: 'normal' },
]

export const waterMetrics = [
  { label: '水温', value: 22.1, unit: '°C', status: 'normal' },
  { label: '溶解氧', value: 6.4, unit: 'mg/L', status: 'normal' },
  { label: '氨氮', value: 0.28, unit: 'mg/L', status: 'warn' },
  { label: '亚硝酸盐', value: 0.06, unit: 'mg/L', status: 'normal' },
  { label: '浊度', value: 12.5, unit: 'NTU', status: 'normal' },
  { label: 'pH 值', value: 7.2, unit: '', status: 'normal' },
]

export const weatherMetrics = [
  { label: '气温', value: 24.6, unit: '°C', status: 'normal' },
  { label: '相对湿度', value: 62, unit: '%', status: 'normal' },
  { label: '风速', value: 3.2, unit: 'm/s', status: 'normal' },
  { label: '风向', value: 135, unit: '°东南', status: 'normal' },
  { label: '降雨量', value: 4.8, unit: 'mm', status: 'normal' },
  { label: '日照时数', value: 6.5, unit: 'h', status: 'normal' },
  { label: '气压', value: 1008, unit: 'hPa', status: 'normal' },
]

const COLORS = {
  air: '#16a34a',
  soil: '#b45309',
  water: '#0284c7',
  weather: '#2563eb',
}

// ---------- 园区（基地）与监测类别映射 ----------
export const parks = [
  { id: 'all', name: '全部园区' },
  { id: 'qs', name: '清水有机蔬菜基地' },
  { id: 'st', name: '生态果品种植基地' },
  { id: 'dy', name: '智慧稻渔综合基地' },
]

const parkNameMap = {
  qs: '清水有机蔬菜基地',
  st: '生态果品种植基地',
  dy: '智慧稻渔综合基地',
}

// 各园区拥有的监测类别
const parkCategories = {
  qs: ['air', 'soil', 'water', 'weather'],
  st: ['air', 'soil', 'weather'],
  dy: ['water', 'weather'],
}

// 各园区监测指标差异量（基于基准园区 qs 的增量），保证不同园区数据明显不一致
const parkMetricDelta = {
  qs: {},
  st: {
    'PM2.5': -9, 'PM10': -14, 'CO₂': -55, 'O₂': 0.4, '温度': 2.2, '湿度': 7,
    '土壤湿度': 9, '土壤温度': 1.9, 'pH 值': -0.3, 'EC 电导率': 0.5, '氮 (N)': 13, '磷 (P)': -7, '钾 (K)': 20,
    '气温': 2.5, '相对湿度': 8, '风速': 1.7, '风向': 62, '降雨量': 2.6, '日照时数': 1.2, '气压': -7,
  },
  dy: {
    '水温': -3.6, '溶解氧': -1.2, '氨氮': 0.34, '亚硝酸盐': 0.05, '浊度': 19.6, 'pH 值': -0.4,
    '气温': -1.3, '相对湿度': 11, '风速': -0.9, '风向': -48, '降雨量': 6.4, '日照时数': -1.0, '气压': 5,
  },
}

// 各园区趋势曲线种子偏移，保证不同园区历史曲线不同
const parkTrendSeed = { qs: 0, st: 37, dy: 73 }

// 各园区待处置告警数
const alarmByPark = { qs: 3, st: 1, dy: 2 }

function metricForPark(m, park) {
  const delta = (parkMetricDelta[park] || {})[m.label] ?? 0
  if (!delta) return { ...m }
  const decimals = String(m.value).includes('.') ? 1 : 0
  return { ...m, value: +(m.value + delta).toFixed(decimals) }
}

// ---------- API ----------
const CATEGORY_DEFS = [
  { key: 'air', name: '空气环境', icon: 'WindPower', color: COLORS.air, metrics: airMetrics },
  { key: 'soil', name: '土壤墒情', icon: 'Crop', color: COLORS.soil, metrics: soilMetrics },
  { key: 'water', name: '水体水质', icon: 'Pouring', color: COLORS.water, metrics: waterMetrics },
  { key: 'weather', name: '气象条件', icon: 'PartlyCloudy', color: COLORS.weather, metrics: weatherMetrics },
]

// 园区总览结果缓存：设备/指标未变化时避免重复计算
const overviewCache = new Map()

function clearOverviewCache() {
  overviewCache.clear()
}

export async function getOverviewApi(park = 'all') {
  const key = park || 'all'
  if (overviewCache.has(key)) return overviewCache.get(key)

  const scope = park === 'all' ? null : park
  const scopedDevices = scope ? devices.filter((d) => d.park === scope) : devices
  const online = scopedDevices.filter((d) => d.status === 'online').length

  const categories = CATEGORY_DEFS.filter((c) => !scope || (parkCategories[scope] || []).includes(c.key)).map(
    (c) => ({ ...c, metrics: c.metrics.map((m) => metricForPark(m, scope)) }),
  )

  const seedBase = parkTrendSeed[park] || 0
  const trendSeries = [
    { key: 'air', name: '空气温度', data: seededSeries(24, 4, 24, 1 + seedBase), color: COLORS.air },
    { key: 'soil', name: '土壤湿度', data: seededSeries(28, 6, 24, 2 + seedBase), color: COLORS.soil },
    { key: 'water', name: '水温', data: seededSeries(22, 3, 24, 5 + seedBase), color: COLORS.water },
    { key: 'weather', name: '气温', data: seededSeries(24, 5, 24, 6 + seedBase), color: COLORS.weather },
  ].filter((s) => !scope || (parkCategories[scope] || []).includes(s.key))

  const result = {
    park: scope || 'all',
    categories,
    devices: scopedDevices.map((d) => ({ ...d, parkName: parkNameMap[d.park] || d.park })),
    stats: {
      totalDevices: scopedDevices.length,
      online,
      offline: scopedDevices.length - online,
      onlineRate: scopedDevices.length ? Math.round((online / scopedDevices.length) * 100) : 0,
      alarmCount: scope ? alarmByPark[scope] || 0 : Object.values(alarmByPark).reduce((a, b) => a + b, 0),
    },
    trend: {
      labels: timeLabels(24),
      series: trendSeries,
    },
  }
  overviewCache.set(key, result)
  return result
}

export async function getWeatherApi() {
  return {
    metrics: weatherMetrics,
    labels: timeLabels(24),
    temp: seededSeries(24, 5, 24, 1),
    humidity: seededSeries(62, 12, 24, 2),
    rainfall: seededSeries(3, 4, 8, 3).map((v) => Math.max(0, v)),
    rainLabels: ['5-04', '5-05', '5-06', '5-07', '5-08', '5-09', '5-10', '5-11'],
    sunHours: [3.2, 4.1, 2.8, 5.6, 6.8, 6.5, 4.2, 2.1],
    wind: [
      { dir: '北', val: 2.1 },
      { dir: '东北', val: 3.4 },
      { dir: '东', val: 4.6 },
      { dir: '东南', val: 3.2 },
      { dir: '南', val: 2.8 },
      { dir: '西南', val: 2.3 },
      { dir: '西', val: 1.9 },
      { dir: '西北', val: 2.6 },
    ],
  }
}

// 土壤墒情曲线时间范围配置
const SOIL_RANGES = {
  '1h': { count: 12, stepMin: 5, seed: 20 },
  '6h': { count: 12, stepMin: 30, seed: 10 },
  '24h': { count: 24, stepMin: 60, seed: 2 },
}

function soilRangeLabels(range) {
  const cfg = SOIL_RANGES[range] || SOIL_RANGES['24h']
  const now = new Date()
  return Array.from({ length: cfg.count }, (_, i) => {
    const d = new Date(now.getTime() - (cfg.count - 1 - i) * cfg.stepMin * 60 * 1000)
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    return cfg.stepMin < 60 ? `${hh}:${mm}` : `${hh}:00`
  })
}

function soilTrend(range = '24h') {
  const cfg = SOIL_RANGES[range] || SOIL_RANGES['24h']
  const seed = cfg.seed
  return {
    labels: soilRangeLabels(range),
    series: [
      { name: '土壤湿度(%)', data: seededSeries(28, 7, cfg.count, seed), color: '#b45309' },
      { name: 'pH 值', data: seededSeries(6.8, 0.4, cfg.count, seed + 1), color: '#16a34a' },
      { name: 'EC(mS/cm)', data: seededSeries(1.4, 0.3, cfg.count, seed + 2), color: '#0284c7' },
    ],
  }
}

export async function getSoilApi(range = '24h') {
  const trend = soilTrend(range)
  return {
    metrics: soilMetrics,
    labels: trend.labels,
    series: trend.series,
    npk: [
      { label: '氮 (N)', value: 86, color: '#16a34a' },
      { label: '磷 (P)', value: 34, color: '#f59e0b' },
      { label: '钾 (K)', value: 152, color: '#7c3aed' },
    ],
    history: Array.from({ length: 12 }, (_, i) => ({
      time: timeLabels(12)[i],
      humidity: seededSeries(28, 7, 12, 2)[i],
      ph: seededSeries(6.8, 0.4, 12, 3)[i],
      ec: seededSeries(1.4, 0.3, 12, 4)[i],
      n: seededSeries(86, 6, 12, 5)[i],
      p: seededSeries(34, 4, 12, 6)[i],
      k: seededSeries(152, 10, 12, 7)[i],
    })),
  }
}

export async function getSoilTrendApi(range = '24h') {
  return soilTrend(range)
}

// ---------- 水质监测点与溶解氧阈值 ----------
export const DO_THRESHOLD = 5.0

export const waterPoints = [
  { id: 'P1', name: '灌溉蓄水池', location: '清水基地 · 东区', do: 6.4, temp: 22.1, nh3: 0.28, no2: 0.06, turbidity: 12.5, ph: 7.2, grade: 'Ⅱ', gradeDesc: '水体综合状态良好。', tag: '状态良好', tagType: 'success' },
  { id: 'P2', name: '稻田蓄水', location: '智慧稻渔 · 西区', do: 4.8, temp: 19.8, nh3: 0.62, no2: 0.11, turbidity: 32.1, ph: 6.8, grade: 'Ⅲ', gradeDesc: '溶解氧偏低、氨氮偏高，建议增氧并控制施肥排水。', tag: '溶解氧超标', tagType: 'danger' },
  { id: 'P3', name: '养殖鱼塘', location: '智慧稻渔 · 南塘', do: 3.9, temp: 18.5, nh3: 0.74, no2: 0.14, turbidity: 28.4, ph: 6.5, grade: 'Ⅳ', gradeDesc: '溶解氧严重不足，氨氮超标，需立即增氧并暂停投饵。', tag: '溶解氧严重超标', tagType: 'danger' },
]

function waterPointMetrics(p) {
  const doAlarm = p.do < DO_THRESHOLD
  return [
    { label: '水温', value: p.temp, unit: '°C', status: 'normal', alarm: false },
    { label: '溶解氧', value: p.do, unit: 'mg/L', status: doAlarm ? 'warn' : 'normal', alarm: doAlarm, threshold: DO_THRESHOLD },
    { label: '氨氮', value: p.nh3, unit: 'mg/L', status: p.nh3 > 0.5 ? 'warn' : 'normal', alarm: p.nh3 > 0.5 },
    { label: '亚硝酸盐', value: p.no2, unit: 'mg/L', status: p.no2 > 0.1 ? 'warn' : 'normal', alarm: p.no2 > 0.1 },
    { label: '浊度', value: p.turbidity, unit: 'NTU', status: p.turbidity > 30 ? 'warn' : 'normal', alarm: p.turbidity > 30 },
    { label: 'pH 值', value: p.ph, unit: '', status: 'normal', alarm: false },
  ]
}

// 水质数据缓存：避免重复请求
let waterPointsCache = null
const waterCache = new Map()

export async function getWaterPointsApi() {
  if (!waterPointsCache) {
    waterPointsCache = waterPoints.map((p) => ({
      id: p.id,
      name: p.name,
      location: p.location,
      do: p.do,
      overAlarm: p.do < DO_THRESHOLD,
    }))
  }
  return waterPointsCache
}

export async function getWaterApi(pointId = 'P1') {
  const key = pointId || 'P1'
  if (waterCache.has(key)) return waterCache.get(key)

  const p = waterPoints.find((x) => x.id === pointId) || waterPoints[0]
  const doAlarm = p.do < DO_THRESHOLD
  const seed = p.id === 'P1' ? 1 : p.id === 'P2' ? 8 : 15
  const result = {
    point: { id: p.id, name: p.name, location: p.location },
    threshold: DO_THRESHOLD,
    doAlarm,
    metrics: waterPointMetrics(p),
    labels: timeLabels(24),
    series: [
      { name: '水温(°C)', data: seededSeries(p.temp, 2, 24, seed), color: '#0ea5e9' },
      { name: '溶解氧(mg/L)', data: seededSeries(p.do, 0.8, 24, seed + 1), color: doAlarm ? '#e11d48' : '#16a34a' },
      { name: '氨氮(mg/L)', data: seededSeries(p.nh3, 0.1, 24, seed + 2), color: '#e8590c' },
    ],
    turbidity: seededSeries(p.turbidity, 5, 24, seed + 3).map((v) => Math.max(0, v)),
    grade: { num: p.grade, desc: p.gradeDesc, tag: p.tag, tagType: p.tagType },
  }
  waterCache.set(key, result)
  return result
}

export async function getVideoApi() {
  return {
    channels: [
      { id: 'C1', name: '1号温室·全景', location: '东区', status: 'online', cover: '' },
      { id: 'C2', name: '2号温室·育苗区', location: '东区', status: 'online' },
      { id: 'C3', name: '大田·灌溉区', location: '西区', status: 'offline' },
      { id: 'C4', name: '蓄水池·监控', location: '中区', status: 'online' },
      { id: 'C5', name: '仓储·入口', location: '北区', status: 'online' },
      { id: 'C6', name: '大门·周界', location: '园区', status: 'online' },
    ],
  }
}

export async function getDevicesApi() {
  return devices
}

const TYPE_NAMES = { air: '空气', soil: '土壤', water: '水质', weather: '气象', camera: '视频' }

export async function saveDeviceApi(data) {
  const typeName = TYPE_NAMES[data.type] || data.typeName || '空气'
  if (data.id) {
    const idx = devices.findIndex((d) => d.id === data.id)
    if (idx >= 0) devices[idx] = { ...devices[idx], ...data, typeName }
  } else {
    devices.push({
      id: Date.now() % 100000,
      status: 'online',
      lastOnline: '2026-11-05 09:31',
      ...data,
      typeName,
      park: data.park || 'qs',
    })
  }
  persistDevices()
  clearOverviewCache()
  return devices
}

export async function deleteDeviceApi(id) {
  devices = devices.filter((d) => d.id !== id)
  persistDevices()
  clearOverviewCache()
  return devices
}

export async function toggleDeviceApi(id) {
  const d = devices.find((x) => x.id === id)
  if (d) d.status = d.status === 'online' ? 'offline' : 'online'
  persistDevices()
  clearOverviewCache()
  return devices
}

// 分页历史数据查询
export async function getHistoryApi({ type = 'all', keyword = '', page = 1, pageSize = 10 } = {}) {
  const typeMap = { air: 'airMetrics', soil: 'soilMetrics', water: 'waterMetrics', weather: 'weatherMetrics' }
  if (!typeMap[type]) {
    // 全部类型：合并生成
    const rows = []
    for (let i = 0; i < 46; i++) {
      const t = ['空气', '土壤', '水质', '气象'][i % 4]
      rows.push(buildHistoryRow(i, t))
    }
    return doFilter(rows, keyword, page, pageSize)
  }
  const rows = []
  const typeName = ['空气', '土壤', '水质', '气象'][['air', 'soil', 'water', 'weather'].indexOf(type)]
  for (let i = 0; i < 46; i++) rows.push(buildHistoryRow(i, typeName))
  return doFilter(rows, keyword, page, pageSize)
}

function buildHistoryRow(i, typeName) {
  const now = new Date()
  const d = new Date(now.getTime() - i * 30 * 60 * 1000)
  const time = `${d.toLocaleDateString('zh-CN')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  const sensors = {
    空气: { id: 'AQ-1001', name: '空气站-A1', param: 'PM2.5', value: 32, unit: 'μg/m³', status: 'normal' },
    土壤: { id: 'SO-2002', name: '土壤墒情-S02', param: '土壤湿度', value: 28, unit: '%', status: 'warn' },
    水质: { id: 'WQ-3003', name: '水质-W3', param: '溶解氧', value: 6.4, unit: 'mg/L', status: 'normal' },
    气象: { id: 'WS-4004', name: '气象站-M1', param: '气温', value: 24.6, unit: '°C', status: 'normal' },
  }
  const s = sensors[typeName]
  const jitter = seededSeries(0, 1, 47, i)[i] ?? 0
  return {
    time,
    deviceId: s.id,
    deviceName: s.name,
    type: typeName,
    param: s.param,
    value: +(s.value + jitter * (s.unit === '%' ? 3 : 0.5)).toFixed(1),
    unit: s.unit,
    status: ['normal', 'normal', 'normal', 'warn'][i % 4] === 'warn' ? 'warn' : 'normal',
  }
}

function doFilter(rows, keyword, page, pageSize) {
  let list = rows
  if (keyword) list = list.filter((r) => r.deviceName.includes(keyword) || r.param.includes(keyword) || r.type.includes(keyword))
  const total = list.length
  const start = (page - 1) * pageSize
  return { rows: list.slice(start, start + pageSize), total }
}