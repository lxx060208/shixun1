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
  { id: 1001, name: '空气站-A1', type: 'air', typeName: '空气', location: '1号温室', frequency: 30, status: 'online', lastOnline: '2026-11-05 09:30' },
  { id: 1002, name: '土壤墒情-S02', type: 'soil', typeName: '土壤', location: '东区大田', frequency: 60, status: 'online', lastOnline: '2026-11-05 09:28' },
  { id: 1003, name: '水质-W3', type: 'water', typeName: '水质', location: '灌溉蓄水池', frequency: 120, status: 'offline', lastOnline: '2026-11-04 18:12' },
  { id: 1004, name: '气象站-M1', type: 'weather', typeName: '气象', location: '园区中心', frequency: 60, status: 'online', lastOnline: '2026-11-05 09:31' },
  { id: 1005, name: '高清摄像头-C1', type: 'camera', typeName: '视频', location: '1号温室', frequency: 0, status: 'online', lastOnline: '2026-11-05 09:31' },
]

function loadDevices() {
  try {
    const raw = localStorage.getItem(DEVICE_KEY)
    if (raw) return JSON.parse(raw)
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

// ---------- API ----------
export async function getOverviewApi() {
  const online = devices.filter((d) => d.status === 'online').length
  return {
    categories: [
      { key: 'air', name: '空气环境', icon: 'WindPower', color: COLORS.air, metrics: airMetrics },
      { key: 'soil', name: '土壤墒情', icon: 'Crop', color: COLORS.soil, metrics: soilMetrics },
      { key: 'water', name: '水体水质', icon: 'Pouring', color: COLORS.water, metrics: waterMetrics },
      { key: 'weather', name: '气象条件', icon: 'PartlyCloudy', color: COLORS.weather, metrics: weatherMetrics },
    ],
    stats: {
      totalDevices: devices.length,
      online,
      offline: devices.length - online,
      onlineRate: Math.round((online / devices.length) * 100),
      alarmCount: 3,
    },
    trend: {
      labels: timeLabels(24),
      series: [
        { name: '空气温度', data: seededSeries(24, 4, 24, 1), color: COLORS.air },
        { name: '土壤湿度', data: seededSeries(28, 6, 24, 2), color: COLORS.soil },
      ],
    },
  }
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

export async function getSoilApi() {
  const labels = timeLabels(24)
  return {
    metrics: soilMetrics,
    labels,
    series: [
      { name: '土壤湿度(%)', data: seededSeries(28, 7, 24, 2), color: '#b45309' },
      { name: 'pH 值', data: seededSeries(6.8, 0.4, 24, 3), color: '#16a34a' },
      { name: 'EC(mS/cm)', data: seededSeries(1.4, 0.3, 24, 4), color: '#0284c7' },
    ],
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

export async function getWaterApi() {
  const labels = timeLabels(24)
  return {
    metrics: waterMetrics,
    labels,
    series: [
      { name: '水温(°C)', data: seededSeries(22, 3, 24, 1), color: '#0ea5e9' },
      { name: '溶解氧(mg/L)', data: seededSeries(6.4, 1.2, 24, 2), color: '#16a34a' },
      { name: '氨氮(mg/L)', data: seededSeries(0.28, 0.12, 24, 3), color: '#e8590c' },
    ],
    turbidity: seededSeries(12, 6, 24, 4).map((v) => Math.max(0, v)),
  }
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

export async function saveDeviceApi(data) {
  if (data.id) {
    const idx = devices.findIndex((d) => d.id === data.id)
    if (idx >= 0) devices[idx] = { ...devices[idx], ...data }
  } else {
    devices.push({
      id: Date.now() % 100000,
      status: 'online',
      lastOnline: '2026-11-05 09:31',
      ...data,
    })
  }
  persistDevices()
  return devices
}

export async function deleteDeviceApi(id) {
  devices = devices.filter((d) => d.id !== id)
  persistDevices()
  return devices
}

export async function toggleDeviceApi(id) {
  const d = devices.find((x) => x.id === id)
  if (d) d.status = d.status === 'online' ? 'offline' : 'online'
  persistDevices()
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