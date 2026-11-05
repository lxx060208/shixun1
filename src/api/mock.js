// 智慧农业综合管理平台 - 模拟数据
// 说明：实训项目采用模拟数据，此处集中维护「登录与个人中心」模块所需的基础数据。

export const departments = [
  '平台运营部',
  '生产管理部',
  '设备运维部',
  '市场营销部',
  '农技中心',
  '财务部',
]

export const roles = [
  {
    id: 1,
    code: 'admin',
    name: '系统管理员',
    description: '拥有平台全部权限，管理租户、账号、角色与日志',
    createTime: '2026-09-01 09:00:00',
  },
  {
    id: 2,
    code: 'manager',
    name: '农场管理者',
    description: '统筹园区生产经营，维护地块、种植计划与订单',
    createTime: '2026-09-01 09:00:00',
  },
  {
    id: 3,
    code: 'operator',
    name: '运维人员',
    description: '负责设备环境监测与远程控制，处置异常告警',
    createTime: '2026-09-01 09:00:00',
  },
  {
    id: 4,
    code: 'sales',
    name: '产销业务员',
    description: '维护农产品信息，处理订单物流与客户档案',
    createTime: '2026-09-01 09:00:00',
  },
  {
    id: 5,
    code: 'agronomist',
    name: '农技人员',
    description: '维护农业知识库与病虫害防治方案',
    createTime: '2026-09-01 09:00:00',
  },
]

export const users = [
  {
    id: 1,
    username: 'admin',
    name: '兰东凤',
    phone: '13800000001',
    email: 'admin@samp.com',
    roleCode: 'admin',
    department: '平台运营部',
    position: '系统管理员',
    status: 1,
    createTime: '2026-09-01 09:00:00',
  },
  {
    id: 2,
    username: 'wangjg',
    name: '王建国',
    phone: '13800000002',
    email: 'wangjg@samp.com',
    roleCode: 'manager',
    department: '生产管理部',
    position: '农场经理',
    status: 1,
    createTime: '2026-09-02 10:20:00',
  },
  {
    id: 3,
    username: 'liyunwei',
    name: '李运维',
    phone: '13800000003',
    email: 'liyunwei@samp.com',
    roleCode: 'operator',
    department: '设备运维部',
    position: '运维工程师',
    status: 1,
    createTime: '2026-09-03 11:00:00',
  },
  {
    id: 4,
    username: 'zhaoxm',
    name: '赵小敏',
    phone: '13800000004',
    email: 'zhaoxm@samp.com',
    roleCode: 'sales',
    department: '市场营销部',
    position: '业务员',
    status: 1,
    createTime: '2026-09-04 14:30:00',
  },
  {
    id: 5,
    username: 'chenny',
    name: '陈农艺',
    phone: '13800000005',
    email: 'chenny@samp.com',
    roleCode: 'agronomist',
    department: '农技中心',
    position: '农技员',
    status: 1,
    createTime: '2026-09-05 09:10:00',
  },
  {
    id: 6,
    username: 'liuxin',
    name: '刘星鑫',
    phone: '13800000006',
    email: 'liuxin@samp.com',
    roleCode: 'manager',
    department: '生产管理部',
    position: '农场经理',
    status: 0,
    createTime: '2026-09-06 15:00:00',
  },
  {
    id: 7,
    username: 'zhouwei',
    name: '周运维',
    phone: '13800000007',
    email: 'zhouwei@samp.com',
    roleCode: 'operator',
    department: '设备运维部',
    position: '运维工程师',
    status: 1,
    createTime: '2026-09-07 16:40:00',
  },
]

export const tenants = [
  {
    id: 1,
    code: 'nanshan',
    name: '南山智慧农业示范园',
    contact: '王建国',
    phone: '13800000002',
    userQuota: 100,
    storageQuota: 500,
    plotQuota: 200,
    expireTime: '2027-12-31',
    status: 1,
    createTime: '2026-09-01 09:00:00',
  },
  {
    id: 2,
    code: 'qingshui',
    name: '清水有机蔬菜基地',
    contact: '刘星鑫',
    phone: '13800000006',
    userQuota: 50,
    storageQuota: 200,
    plotQuota: 80,
    expireTime: '2026-12-31',
    status: 1,
    createTime: '2026-09-01 09:00:00',
  },
  {
    id: 3,
    code: 'huaxi',
    name: '花溪生态果园',
    contact: '赵小敏',
    phone: '13800000004',
    userQuota: 30,
    storageQuota: 100,
    plotQuota: 50,
    expireTime: '2026-11-30',
    status: 0,
    createTime: '2026-09-01 09:00:00',
  },
]

export const loginLogs = [
  { id: 1, username: 'admin', name: '兰东凤', ip: '192.168.1.10', location: '重庆', browser: 'Chrome 126', os: 'Windows 11', status: 1, time: '2026-11-03 08:52:11' },
  { id: 2, username: 'wangjg', name: '王建国', ip: '192.168.1.22', location: '重庆', browser: 'Edge 125', os: 'Windows 10', status: 1, time: '2026-11-03 08:48:02' },
  { id: 3, username: 'liyunwei', name: '李运维', ip: '192.168.2.31', location: '重庆', browser: 'Chrome 126', os: 'Windows 11', status: 1, time: '2026-11-03 08:30:45' },
  { id: 4, username: 'zhaoxm', name: '赵小敏', ip: '192.168.3.14', location: '重庆', browser: 'Firefox 127', os: 'Windows 10', status: 0, time: '2026-11-02 21:15:33' },
  { id: 5, username: 'chenny', name: '陈农艺', ip: '192.168.4.19', location: '重庆', browser: 'Chrome 125', os: 'macOS 14', status: 1, time: '2026-11-02 18:22:10' },
  { id: 6, username: 'test', name: '匿名用户', ip: '45.130.10.2', location: '未知', browser: 'Chrome 124', os: 'Windows 10', status: 0, time: '2026-11-02 03:12:07' },
]

export const operationLogs = [
  { id: 1, username: 'admin', name: '兰东凤', module: '用户管理', operation: '新增用户', content: '新增用户「周运维」并分配运维人员角色', ip: '192.168.1.10', time: '2026-11-03 09:12:33' },
  { id: 2, username: 'admin', name: '兰东凤', module: '角色权限', operation: '修改权限', content: '调整「农场管理者」角色的菜单权限', ip: '192.168.1.10', time: '2026-11-03 09:40:18' },
  { id: 3, username: 'wangjg', name: '王建国', module: '地块档案', operation: '编辑地块', content: '修改「A-01 大田」种植作物为水稻', ip: '192.168.1.22', time: '2026-11-02 16:05:52' },
  { id: 4, username: 'liyunwei', name: '李运维', module: '设备控制', operation: '手动控制', content: '远程启动 3 号大棚水泵', ip: '192.168.2.31', time: '2026-11-02 15:30:09' },
  { id: 5, username: 'admin', name: '兰东凤', module: '租户管理', operation: '新增租户', content: '新增租户「花溪生态果园」', ip: '192.168.1.10', time: '2026-11-02 11:20:47' },
]

export const notificationsDefaults = {
  inSite: true,
  sms: true,
  wechat: false,
  email: true,
  quietEnabled: false,
  quietStart: '22:00:00',
  quietEnd: '07:00:00',
}

export const dashboardStats = {
  parkCount: 3,
  area: 1286,
  deviceOnlineRate: 96.4,
  alarmCount: 12,
  totalYield: 38500,
}

export const todos = [
  { id: 1, title: '审核「花溪生态果园」租户到期续费申请', level: 'high', time: '2026-11-03 10:00' },
  { id: 2, title: '处理设备「3 号大棚水泵」离线告警', level: 'high', time: '2026-11-03 09:30' },
  { id: 3, title: '确认 2026 年秋播种植计划', level: 'medium', time: '2026-11-03 14:00' },
  { id: 4, title: '补充病虫害「稻瘟病」防治方案图文', level: 'medium', time: '2026-11-04 09:00' },
  { id: 5, title: '生成 10 月农事工单完成率报表', level: 'low', time: '2026-11-04 16:00' },
]

export const latestAlarms = [
  { id: 1, device: '3 号大棚水泵', type: '设备离线', level: '严重', time: '2026-11-03 09:28:11', status: '待处置' },
  { id: 2, device: 'A-03 土壤传感器', type: '土壤湿度超标', level: '警告', time: '2026-11-03 08:55:40', status: '待处置' },
  { id: 3, device: '2 号大棚风机', type: '电流异常', level: '警告', time: '2026-11-03 08:12:02', status: '已确认' },
  { id: 4, device: 'B-01 水质传感器', type: '溶氧偏低', level: '提示', time: '2026-11-02 22:30:15', status: '已处置' },
]

export const permissionTree = [
  {
    id: 'menu-dashboard',
    label: '工作台首页',
    type: 'menu',
    children: [
      { id: 'btn-dashboard-view', label: '查看仪表盘', type: 'button' },
    ],
  },
  {
    id: 'menu-profile',
    label: '个人中心',
    type: 'menu',
    children: [
      { id: 'menu-profile-info', label: '基本资料', type: 'menu' },
      { id: 'menu-profile-pwd', label: '修改密码', type: 'menu' },
      { id: 'menu-profile-notify', label: '消息通知设置', type: 'menu' },
    ],
  },
  {
    id: 'menu-system',
    label: '系统管理',
    type: 'menu',
    children: [
      {
        id: 'menu-system-user',
        label: '用户管理',
        type: 'menu',
        children: [
          { id: 'btn-user-add', label: '新增用户', type: 'button' },
          { id: 'btn-user-edit', label: '编辑用户', type: 'button' },
          { id: 'btn-user-del', label: '删除用户', type: 'button' },
          { id: 'btn-user-role', label: '分配角色', type: 'button' },
        ],
      },
      {
        id: 'menu-system-role',
        label: '角色管理',
        type: 'menu',
        children: [
          { id: 'btn-role-add', label: '新增角色', type: 'button' },
          { id: 'btn-role-perm', label: '权限配置', type: 'button' },
        ],
      },
      { id: 'menu-system-log', label: '日志审计', type: 'menu' },
      { id: 'menu-system-tenant', label: '租户管理', type: 'menu' },
    ],
  },
  {
    id: 'menu-data',
    label: '数据展示',
    type: 'menu',
    children: [
      { id: 'menu-data-overview', label: '平台数据总览', type: 'menu' },
      { id: 'menu-data-gis', label: 'GIS 地图', type: 'menu' },
    ],
  },
  {
    id: 'data-scope',
    label: '数据权限',
    type: 'data',
    children: [
      { id: 'data-all', label: '全部数据', type: 'data' },
      { id: 'data-dept', label: '本部门数据', type: 'data' },
      { id: 'data-self', label: '仅本人数据', type: 'data' },
    ],
  },
]

export const rolePermissions = {
  admin: ['menu-dashboard', 'btn-dashboard-view', 'menu-profile', 'menu-profile-info', 'menu-profile-pwd', 'menu-profile-notify', 'menu-system', 'menu-system-user', 'btn-user-add', 'btn-user-edit', 'btn-user-del', 'btn-user-role', 'menu-system-role', 'btn-role-add', 'btn-role-perm', 'menu-system-log', 'menu-system-tenant', 'menu-data', 'menu-data-overview', 'menu-data-gis', 'data-scope', 'data-all'],
  manager: ['menu-dashboard', 'btn-dashboard-view', 'menu-profile', 'menu-profile-info', 'menu-profile-pwd', 'menu-profile-notify', 'menu-data', 'menu-data-overview', 'menu-data-gis', 'data-scope', 'data-dept'],
  operator: ['menu-dashboard', 'btn-dashboard-view', 'menu-profile', 'menu-profile-info', 'menu-profile-pwd', 'data-scope', 'data-dept'],
  sales: ['menu-dashboard', 'btn-dashboard-view', 'menu-profile', 'menu-profile-info', 'menu-profile-pwd', 'menu-profile-notify', 'data-scope', 'data-self'],
  agronomist: ['menu-dashboard', 'btn-dashboard-view', 'menu-profile', 'menu-profile-info', 'menu-profile-pwd', 'data-scope', 'data-self'],
}

/* ==================== 数据展示模块 ==================== */
// 口径与 dashboardStats 保持一致：3 个园区 / 1286 亩 / 在线率 96.4% / 今日告警 12 条 / 累计产量 38500kg
// 园区名称与租户档案一致：南山智慧农业示范园、清水有机蔬菜基地、花溪生态果园

// ---- 平台数据总览 ----
export const overviewStats = { ...dashboardStats }

export const parkSummaries = [
  { name: '南山智慧农业示范园', area: 620, yield: 18.6 },
  { name: '清水有机蔬菜基地', area: 426, yield: 12.9 },
  { name: '花溪生态果园', area: 240, yield: 7.0 },
]

export const alarmTrend7d = {
  dates: ['10-30', '10-31', '11-01', '11-02', '11-03', '11-04', '11-05'],
  values: [8, 10, 15, 9, 14, 10, 12],
}

// ---- GIS 园区地图 ----
export const gisParks = [
  {
    id: 1,
    name: '南山智慧农业示范园',
    plots: [
      { id: 'A-01', name: 'A-01 大田', points: '60,60 300,60 300,200 60,200', crop: '水稻', area: 120, color: '#d3f9d8' },
      { id: 'A-02', name: 'A-02 蔬菜大棚区', points: '320,60 560,60 560,200 320,200', crop: '番茄', area: 180, color: '#e7f5ff' },
      { id: 'B-01', name: 'B-01 葡萄园', points: '60,220 240,220 240,380 60,380', crop: '葡萄', area: 200, color: '#f3f0ff' },
      { id: 'B-02', name: 'B-02 草莓园', points: '260,220 560,220 560,380 260,380', crop: '草莓', area: 120, color: '#fff0f6' },
    ],
    greenhouses: [
      { id: 'G-1', name: '1 号大棚', x: 130, y: 120, plot: 'A-02 蔬菜大棚区' },
      { id: 'G-2', name: '2 号大棚', x: 420, y: 130, plot: 'A-02 蔬菜大棚区' },
      { id: 'G-3', name: '3 号大棚', x: 400, y: 300, plot: 'B-02 草莓园' },
    ],
    sensors: [
      { id: 'A-03', name: 'A-03 土壤传感器', type: '土壤', x: 100, y: 100, online: true, data: { '土壤温度': '19.8℃', '土壤湿度': '78%（偏高）', 'EC值': '1.6mS/cm', 'PH值': '6.8' } },
      { id: 'A-04', name: 'A-04 空气温湿度传感器', type: '空气', x: 260, y: 170, online: true, data: { '空气温度': '24.6℃', '空气湿度': '62%', 'CO₂浓度': '612ppm', '光照强度': '32klx' } },
      { id: 'B-01', name: 'B-01 水质传感器', type: '水体', x: 150, y: 330, online: true, data: { '水温': '17.2℃', '溶解氧': '4.6mg/L（偏低）', 'PH值': '7.1', '浊度': '2.4NTU' } },
      { id: 'B-03', name: 'B-03 土壤传感器', type: '土壤', x: 340, y: 330, online: true, data: { '土壤温度': '18.5℃', '土壤湿度': '44%', 'EC值': '1.4mS/cm', 'PH值': '6.6' } },
      { id: 'G-3-P', name: '3 号大棚水泵', type: '设备', x: 480, y: 300, online: false, data: { '状态': '离线', '最近告警': '设备离线（严重）', '上报时间': '2026-11-03 09:28:11' } },
    ],
  },
  {
    id: 2,
    name: '清水有机蔬菜基地',
    plots: [
      { id: 'Q-01', name: 'Q-01 叶菜区', points: '60,60 300,60 300,200 60,200', crop: '生菜', area: 126, color: '#d3f9d8' },
      { id: 'Q-02', name: 'Q-02 番茄区', points: '320,60 560,60 560,200 320,200', crop: '番茄', area: 110, color: '#fff0f6' },
      { id: 'Q-03', name: 'Q-03 黄瓜区', points: '60,220 240,220 240,380 60,380', crop: '黄瓜', area: 100, color: '#fff9db' },
      { id: 'Q-04', name: 'Q-04 育苗区', points: '260,220 560,220 560,380 260,380', crop: '育苗', area: 90, color: '#e7f5ff' },
    ],
    greenhouses: [
      { id: 'G-4', name: '4 号大棚', x: 130, y: 120, plot: 'Q-01 叶菜区' },
      { id: 'G-5', name: '5 号大棚', x: 420, y: 130, plot: 'Q-02 番茄区' },
      { id: 'G-6', name: '6 号大棚', x: 150, y: 300, plot: 'Q-03 黄瓜区' },
    ],
    sensors: [
      { id: 'Q-01-S', name: 'Q-01 土壤传感器', type: '土壤', x: 240, y: 150, online: true, data: { '土壤温度': '18.9℃', '土壤湿度': '46%', 'EC值': '1.2mS/cm', 'PH值': '6.5' } },
      { id: 'Q-02-A', name: 'Q-02 空气温湿度传感器', type: '空气', x: 480, y: 110, online: true, data: { '空气温度': '25.1℃', '空气湿度': '58%', 'CO₂浓度': '590ppm', '光照强度': '30klx' } },
      { id: 'Q-03-S', name: 'Q-03 土壤传感器', type: '土壤', x: 180, y: 340, online: true, data: { '土壤温度': '19.2℃', '土壤湿度': '43%', 'EC值': '1.3mS/cm', 'PH值': '6.7' } },
      { id: 'Q-04-W', name: 'Q-04 水质传感器', type: '水体', x: 400, y: 320, online: true, data: { '水温': '16.8℃', '溶解氧': '7.8mg/L', 'PH值': '7.0', '浊度': '1.8NTU' } },
    ],
  },
  {
    id: 3,
    name: '花溪生态果园',
    plots: [
      { id: 'H-01', name: 'H-01 柑橘园', points: '60,60 300,60 300,200 60,200', crop: '柑橘', area: 90, color: '#fff4e6' },
      { id: 'H-02', name: 'H-02 桃园', points: '320,60 560,60 560,200 320,200', crop: '桃', area: 60, color: '#fff0f6' },
      { id: 'H-03', name: 'H-03 李园', points: '60,220 240,220 240,380 60,380', crop: '李', area: 50, color: '#e7f5ff' },
      { id: 'H-04', name: 'H-04 葡萄园', points: '260,220 560,220 560,380 260,380', crop: '葡萄', area: 40, color: '#f3f0ff' },
    ],
    greenhouses: [],
    sensors: [
      { id: 'H-01-A', name: 'H-01 空气温湿度传感器', type: '空气', x: 130, y: 110, online: true, data: { '空气温度': '23.8℃', '空气湿度': '65%', 'CO₂浓度': '580ppm', '光照强度': '36klx' } },
      { id: 'H-01-S', name: 'H-01 土壤传感器', type: '土壤', x: 240, y: 160, online: true, data: { '土壤温度': '18.2℃', '土壤湿度': '40%', 'EC值': '1.1mS/cm', 'PH值': '6.4' } },
      { id: 'H-02-S', name: 'H-02 土壤传感器', type: '土壤', x: 440, y: 140, online: false, data: { '土壤温度': '--', '土壤湿度': '--', 'EC值': '--', 'PH值': '--' } },
      { id: 'H-04-W', name: 'H-04 水质传感器', type: '水体', x: 340, y: 320, online: true, data: { '水温': '16.5℃', '溶解氧': '8.2mg/L', 'PH值': '7.2', '浊度': '1.5NTU' } },
    ],
  },
]

// ---- 实时环境数据 ----
export const realtimeMetrics = {
  air: [
    { key: 'temp', label: '空气温度', value: 24.6, unit: '℃', min: 15, max: 35, icon: 'Sunny', color: '#e8590c' },
    { key: 'humidity', label: '空气湿度', value: 62, unit: '%', min: 40, max: 90, icon: 'Pouring', color: '#1c7ed6' },
    { key: 'co2', label: 'CO₂浓度', value: 612, unit: 'ppm', min: 400, max: 1200, icon: 'WindPower', color: '#7048e8' },
    { key: 'light', label: '光照强度', value: 32, unit: 'klx', min: 0, max: 80, icon: 'Sunrise', color: '#f59f00' },
  ],
  soil: [
    { key: 'soilTemp', label: '土壤温度', value: 19.8, unit: '℃', min: 10, max: 30, icon: 'Sunny', color: '#e8590c' },
    { key: 'soilHumidity', label: '土壤湿度', value: 41, unit: '%', min: 30, max: 70, icon: 'Pouring', color: '#1c7ed6' },
    { key: 'ec', label: 'EC值', value: 1.6, unit: 'mS/cm', min: 0.8, max: 3.0, icon: 'Odometer', color: '#2f9e44' },
    { key: 'ph', label: 'PH值', value: 6.8, unit: '', min: 5.5, max: 7.5, icon: 'ScaleToOriginal', color: '#0ca678' },
  ],
  water: [
    { key: 'waterTemp', label: '水温', value: 17.2, unit: '℃', min: 10, max: 28, icon: 'Sunny', color: '#e8590c' },
    { key: 'oxygen', label: '溶解氧', value: 7.8, unit: 'mg/L', min: 5, max: 12, icon: 'Ship', color: '#1c7ed6' },
    { key: 'waterPh', label: 'PH值', value: 7.1, unit: '', min: 6.5, max: 8.5, icon: 'ScaleToOriginal', color: '#0ca678' },
    { key: 'turbidity', label: '浊度', value: 2.4, unit: 'NTU', min: 0, max: 10, icon: 'Aim', color: '#7048e8' },
  ],
}

// ---- 水肥与产量统计 ----
export const waterFertilizerMonthly = {
  months: ['6月', '7月', '8月', '9月', '10月', '11月'],
  water: [980, 1260, 1520, 1380, 1240, 1160],
  fertilizer: [3.2, 4.1, 4.8, 4.3, 3.9, 3.6],
}

export const waterFertilizerSummary = {
  monthWater: 1160, // m³
  monthFertilizer: 3.6, // 吨
  coverage: 87, // 水肥一体化覆盖率 %
  seasonForecast: 12.6, // 本季预测产量 吨
}

export const yieldForecastPie = [
  { name: '水稻', value: 4.2 },
  { name: '番茄', value: 3.1 },
  { name: '黄瓜', value: 2.4 },
  { name: '草莓', value: 1.8 },
  { name: '其他果蔬', value: 1.1 },
]

export const yieldCompare = {
  months: ['6月', '7月', '8月', '9月', '10月', '11月'],
  actual: [5.2, 6.8, 7.5, 7.1, 8.4, null],
  forecast: [5.0, 6.5, 7.2, 7.4, 8.0, 8.8],
}

// ---- 设备运维大屏 ----
// 在线 162 / 总数 168 ≈ 96.4%，与 overviewStats.deviceOnlineRate 一致
export const deviceStats = { total: 168, online: 162, fault: 6, runningOrders: 5 }

export const deviceOnlineRate7d = {
  dates: ['10-30', '10-31', '11-01', '11-02', '11-03', '11-04', '11-05'],
  values: [95.8, 96.9, 97.0, 96.4, 95.2, 96.4, 96.4],
}

export const deviceFault7d = {
  dates: ['10-30', '10-31', '11-01', '11-02', '11-03', '11-04', '11-05'],
  added: [2, 3, 1, 4, 3, 2, 3],
  fixed: [1, 3, 2, 3, 4, 3, 2],
}

export const deviceTypeDist = [
  { name: '传感器', value: 72 },
  { name: '灌溉设备', value: 38 },
  { name: '环境调控', value: 34 },
  { name: '监控摄像', value: 16 },
  { name: '其他', value: 8 },
]

export const deviceWorkOrders = [
  { id: 'WO20261103001', device: '3 号大棚水泵', type: '故障维修', assignee: '李运维', progress: 60, status: '处理中' },
  { id: 'WO20261103002', device: '2 号大棚风机', type: '故障维修', assignee: '周运维', progress: 85, status: '处理中' },
  { id: 'WO20261102003', device: 'B-01 水质传感器', type: '校准维护', assignee: '李运维', progress: 100, status: '已完成' },
  { id: 'WO20261102004', device: 'A 区滴灌电磁阀组', type: '定期保养', assignee: '周运维', progress: 100, status: '已完成' },
  { id: 'WO20261101005', device: '园区气象站', type: '巡检', assignee: '李运维', progress: 100, status: '已完成' },
  { id: 'WO20261105006', device: 'H-02 土壤传感器', type: '故障维修', assignee: '周运维', progress: 0, status: '待接单' },
]

// ---- 告警与农事进度面板 ----
export const alarmPanelStats = { today: 12, severe: 2, farmOrderRate: 82, todayFarmTasks: 16 }

// 近14日报警趋势，11-05 当日 7+3+2 = 12 条，与 alarmCount 一致
export const alarmTrend14d = {
  dates: ['10-23', '10-24', '10-25', '10-26', '10-27', '10-28', '10-29', '10-30', '10-31', '11-01', '11-02', '11-03', '11-04', '11-05'],
  env: [6, 8, 5, 10, 7, 6, 9, 6, 8, 11, 7, 9, 6, 7],
  device: [3, 4, 3, 2, 4, 5, 3, 2, 4, 3, 5, 4, 3, 3],
  security: [1, 1, 2, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 2],
}

export const alarmLevelDist = [
  { name: '严重', value: 18 },
  { name: '警告', value: 62 },
  { name: '提示', value: 96 },
]

export const farmWeekly = {
  days: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  done: [5, 7, 6, 8, 9, 4, 3],
  undone: [2, 1, 3, 1, 2, 2, 1],
}

export const farmOrders = [
  { id: 'FM-1105-01', task: '水稻收割收尾', plot: '南山园区 A-01 大田', owner: '王建国', progress: 100, status: '已完成' },
  { id: 'FM-1105-02', task: '番茄整枝打杈', plot: '南山园区 A-02 蔬菜大棚区', owner: '陈农艺', progress: 75, status: '进行中' },
  { id: 'FM-1105-03', task: '草莓追肥', plot: '南山园区 B-02 草莓园', owner: '陈农艺', progress: 40, status: '进行中' },
  { id: 'FM-1105-04', task: '生菜定植', plot: '清水基地 Q-01 叶菜区', owner: '刘星鑫', progress: 0, status: '未开始' },
  { id: 'FM-1104-08', task: '果园病虫害巡查', plot: '花溪生态果园', owner: '陈农艺', progress: 100, status: '已完成' },
]