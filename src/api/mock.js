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

/* ==================== 远程智能控制与水肥模块 ==================== */
// 可控设备命名与 GIS/告警模块一致：1-6 号大棚、B-01/Q-04/H-04 水质点、3 号大棚水泵离线
// status: running 运行 / stopped 停止 / offline 离线

// ---- 设备手动控制台 ----
export const controlDeviceGroups = [
  {
    park: '南山智慧农业示范园',
    devices: [
      { id: 'D-NS-101', name: '1 号大棚水泵', type: '水泵', location: '1 号大棚', status: 'running', power: 3.5, icon: 'Pouring' },
      { id: 'D-NS-102', name: '1 号大棚风机', type: '风机', location: '1 号大棚', status: 'stopped', power: 1.8, icon: 'WindPower' },
      { id: 'D-NS-103', name: '1 号大棚卷帘', type: '卷帘', location: '1 号大棚', status: 'running', power: 0.8, icon: 'Switch' },
      { id: 'D-NS-104', name: '1 号大棚补光灯', type: '补光灯', location: '1 号大棚', status: 'stopped', power: 2.0, icon: 'Sunny' },
      { id: 'D-NS-201', name: '2 号大棚水泵', type: '水泵', location: '2 号大棚', status: 'stopped', power: 3.5, icon: 'Pouring' },
      { id: 'D-NS-202', name: '2 号大棚风机', type: '风机', location: '2 号大棚', status: 'running', power: 1.8, icon: 'WindPower', alarm: '电流异常' },
      { id: 'D-NS-203', name: '2 号大棚卷帘', type: '卷帘', location: '2 号大棚', status: 'running', power: 0.8, icon: 'Switch' },
      { id: 'D-NS-204', name: '2 号大棚补光灯', type: '补光灯', location: '2 号大棚', status: 'running', power: 2.0, icon: 'Sunny' },
      { id: 'D-NS-301', name: '3 号大棚水泵', type: '水泵', location: '3 号大棚', status: 'offline', power: 3.5, icon: 'Pouring', alarm: '设备离线' },
      { id: 'D-NS-302', name: '3 号大棚风机', type: '风机', location: '3 号大棚', status: 'stopped', power: 1.8, icon: 'WindPower' },
      { id: 'D-NS-303', name: '3 号大棚卷帘', type: '卷帘', location: '3 号大棚', status: 'stopped', power: 0.8, icon: 'Switch' },
      { id: 'D-NS-304', name: '3 号大棚补光灯', type: '补光灯', location: '3 号大棚', status: 'stopped', power: 2.0, icon: 'Sunny' },
      { id: 'D-NS-B01', name: 'B-01 增氧机', type: '增氧机', location: 'B-01 水产区', status: 'running', power: 2.2, icon: 'Ship' },
    ],
  },
  {
    park: '清水有机蔬菜基地',
    devices: [
      { id: 'D-QS-401', name: '4 号大棚水泵', type: '水泵', location: '4 号大棚', status: 'running', power: 3.5, icon: 'Pouring' },
      { id: 'D-QS-402', name: '4 号大棚风机', type: '风机', location: '4 号大棚', status: 'running', power: 1.8, icon: 'WindPower' },
      { id: 'D-QS-403', name: '4 号大棚卷帘', type: '卷帘', location: '4 号大棚', status: 'running', power: 0.8, icon: 'Switch' },
      { id: 'D-QS-404', name: '4 号大棚补光灯', type: '补光灯', location: '4 号大棚', status: 'stopped', power: 2.0, icon: 'Sunny' },
      { id: 'D-QS-501', name: '5 号大棚水泵', type: '水泵', location: '5 号大棚', status: 'stopped', power: 3.5, icon: 'Pouring' },
      { id: 'D-QS-502', name: '5 号大棚风机', type: '风机', location: '5 号大棚', status: 'stopped', power: 1.8, icon: 'WindPower' },
      { id: 'D-QS-503', name: '5 号大棚卷帘', type: '卷帘', location: '5 号大棚', status: 'stopped', power: 0.8, icon: 'Switch' },
      { id: 'D-QS-504', name: '5 号大棚补光灯', type: '补光灯', location: '5 号大棚', status: 'running', power: 2.0, icon: 'Sunny' },
      { id: 'D-QS-601', name: '6 号大棚水泵', type: '水泵', location: '6 号大棚', status: 'running', power: 3.5, icon: 'Pouring' },
      { id: 'D-QS-602', name: '6 号大棚风机', type: '风机', location: '6 号大棚', status: 'stopped', power: 1.8, icon: 'WindPower' },
      { id: 'D-QS-603', name: '6 号大棚卷帘', type: '卷帘', location: '6 号大棚', status: 'running', power: 0.8, icon: 'Switch' },
      { id: 'D-QS-604', name: '6 号大棚补光灯', type: '补光灯', location: '6 号大棚', status: 'stopped', power: 2.0, icon: 'Sunny' },
      { id: 'D-QS-Q04', name: 'Q-04 增氧机', type: '增氧机', location: 'Q-04 育苗区', status: 'stopped', power: 2.2, icon: 'Ship' },
    ],
  },
  {
    park: '花溪生态果园',
    devices: [
      { id: 'D-HX-H01', name: 'H-01 灌溉水泵', type: '水泵', location: 'H-01 柑橘园', status: 'stopped', power: 3.5, icon: 'Pouring' },
      { id: 'D-HX-H04', name: 'H-04 增氧机', type: '增氧机', location: 'H-04 葡萄园', status: 'running', power: 2.2, icon: 'Ship' },
    ],
  },
]

export const controlDeviceSummary = { total: 29, running: 13, stopped: 15, offline: 1 }

// ---- 自动联动策略配置 ----
export const linkageStrategies = [
  {
    id: 'LS-001',
    name: '高温自动通风',
    target: '2 号大棚风机 + 卷帘',
    enabled: true,
    logic: 'AND',
    conditions: [
      { metric: '空气温度', operator: '>', value: 30, unit: '℃' },
      { metric: '空气湿度', operator: '>', value: 75, unit: '%' },
    ],
    action: '开启风机与卷帘通风降温',
    lastTrigger: '2026-11-04 13:22:10',
  },
  {
    id: 'LS-002',
    name: '低湿自动灌溉',
    target: '1 号大棚水泵',
    enabled: true,
    logic: 'OR',
    conditions: [
      { metric: '土壤湿度', operator: '<', value: 40, unit: '%' },
      { metric: '土壤湿度变化率', operator: '<', value: -5, unit: '%/h' },
    ],
    action: '启动水泵滴灌 20 分钟',
    lastTrigger: '2026-11-05 06:10:33',
  },
  {
    id: 'LS-003',
    name: '弱光自动补光',
    target: '2 号大棚补光灯',
    enabled: true,
    logic: 'AND',
    conditions: [
      { metric: '光照强度', operator: '<', value: 20, unit: 'klx' },
      { metric: '时段', operator: '在', value: '06:00-18:00', unit: '' },
    ],
    action: '开启补光灯',
    lastTrigger: '2026-11-05 07:02:18',
  },
  {
    id: 'LS-004',
    name: '低溶氧增氧保护',
    target: 'B-01 增氧机',
    enabled: true,
    logic: 'OR',
    conditions: [
      { metric: '溶解氧', operator: '<', value: 5, unit: 'mg/L' },
      { metric: '水温', operator: '>', value: 26, unit: '℃' },
    ],
    action: '开启增氧机并推送告警',
    lastTrigger: '2026-11-02 22:30:15',
  },
  {
    id: 'LS-005',
    name: '定时晨灌',
    target: '4 号大棚水泵 + 6 号大棚水泵',
    enabled: false,
    logic: '定时',
    conditions: [
      { metric: '定时', operator: '每天', value: '06:00', unit: '' },
    ],
    action: '启动水泵灌溉 30 分钟',
    lastTrigger: '2026-11-04 06:00:00',
  },
]

export const sceneTemplates = [
  { id: 'ST-01', name: '夏季降温模式', description: '温度>30℃ 开风机+卷帘，光照>60klx 半开遮阳', devices: '风机 / 卷帘 / 水泵', enabled: false },
  { id: 'ST-02', name: '冬季保温模式', description: '温度<8℃ 关闭卷帘，夜间补光灯定时补温', devices: '卷帘 / 补光灯', enabled: false },
  { id: 'ST-03', name: '育苗专用模式', description: '湿度维持 70-80%，弱光自动补光，晨昏各灌溉一次', devices: '水泵 / 补光灯 / 风机', enabled: true },
  { id: 'ST-04', name: '水产增氧模式', description: '溶氧<5mg/L 或夜间 00:00-05:00 增氧机常开', devices: '增氧机', enabled: true },
]

// ---- 分组控制 ----
export const controlGroups = [
  {
    id: 'CG-01',
    name: '南山园区 1 号大棚组',
    type: '大棚',
    deviceCount: 4,
    locked: false,
    devices: ['1 号大棚水泵', '1 号大棚风机', '1 号大棚卷帘', '1 号大棚补光灯'],
  },
  {
    id: 'CG-02',
    name: '南山园区 2 号大棚组',
    type: '大棚',
    deviceCount: 4,
    locked: false,
    devices: ['2 号大棚水泵', '2 号大棚风机', '2 号大棚卷帘', '2 号大棚补光灯'],
  },
  {
    id: 'CG-03',
    name: '南山园区 3 号大棚组',
    type: '大棚',
    deviceCount: 4,
    locked: true,
    lockReason: '水泵故障检修中（WO20261103001），禁止批量操作',
    devices: ['3 号大棚水泵', '3 号大棚风机', '3 号大棚卷帘', '3 号大棚补光灯'],
  },
  {
    id: 'CG-04',
    name: '清水基地 4 号大棚组',
    type: '大棚',
    deviceCount: 4,
    locked: false,
    devices: ['4 号大棚水泵', '4 号大棚风机', '4 号大棚卷帘', '4 号大棚补光灯'],
  },
  {
    id: 'CG-05',
    name: '清水基地 5 号大棚组',
    type: '大棚',
    deviceCount: 4,
    locked: false,
    devices: ['5 号大棚水泵', '5 号大棚风机', '5 号大棚卷帘', '5 号大棚补光灯'],
  },
  {
    id: 'CG-06',
    name: '清水基地 6 号大棚组',
    type: '大棚',
    deviceCount: 4,
    locked: false,
    devices: ['6 号大棚水泵', '6 号大棚风机', '6 号大棚卷帘', '6 号大棚补光灯'],
  },
  {
    id: 'CG-07',
    name: 'A-02 蔬菜大棚区地块组',
    type: '地块',
    deviceCount: 8,
    locked: false,
    devices: ['1 号大棚水泵', '1 号大棚风机', '1 号大棚卷帘', '1 号大棚补光灯', '2 号大棚水泵', '2 号大棚风机', '2 号大棚卷帘', '2 号大棚补光灯'],
  },
  {
    id: 'CG-08',
    name: 'B-01 水产区增氧组',
    type: '地块',
    deviceCount: 1,
    locked: false,
    devices: ['B-01 增氧机'],
  },
]

// ---- 水肥配方与一体机 ----
export const fertilizerFormulas = [
  { id: 'FF-01', name: '番茄膨果期配方', crop: '番茄', stage: '膨果期', n: 15, p: 5, k: 30, ec: 2.2, ph: 6.0, usage: 'A-02 蔬菜大棚区' },
  { id: 'FF-02', name: '黄瓜结果期配方', crop: '黄瓜', stage: '结果期', n: 20, p: 10, k: 20, ec: 2.0, ph: 6.2, usage: 'Q-03 黄瓜区' },
  { id: 'FF-03', name: '叶菜通用配方', crop: '生菜', stage: '全生育期', n: 18, p: 6, k: 12, ec: 1.6, ph: 6.3, usage: 'Q-01 叶菜区' },
  { id: 'FF-04', name: '草莓花期配方', crop: '草莓', stage: '花期', n: 10, p: 30, k: 20, ec: 1.4, ph: 5.8, usage: 'B-02 草莓园' },
  { id: 'FF-05', name: '葡萄转色期配方', crop: '葡萄', stage: '转色期', n: 8, p: 15, k: 35, ec: 1.8, ph: 6.1, usage: 'B-01 / H-04 葡萄园' },
  { id: 'FF-06', name: '水稻分蘖期配方', crop: '水稻', stage: '分蘖期', n: 25, p: 8, k: 10, ec: 1.5, ph: 6.5, usage: 'A-01 大田' },
]

export const fertilizerMachines = [
  {
    id: 'FM-NS-01',
    name: '南山园区 1 号水肥一体机',
    location: '1 号大棚',
    status: 'running',
    mode: '自动',
    currentFormula: '番茄膨果期配方',
    flowRate: 2.4,
    tankLevel: 68,
    todayWater: 36.5,
    todayFertilizer: 118,
  },
  {
    id: 'FM-NS-02',
    name: '南山园区 2 号水肥一体机',
    location: '2 号大棚',
    status: 'stopped',
    mode: '手动',
    currentFormula: '草莓花期配方',
    flowRate: 0,
    tankLevel: 45,
    todayWater: 22.0,
    todayFertilizer: 76,
  },
  {
    id: 'FM-QS-01',
    name: '清水基地水肥一体机',
    location: '4 号大棚',
    status: 'running',
    mode: '自动',
    currentFormula: '叶菜通用配方',
    flowRate: 2.8,
    tankLevel: 82,
    todayWater: 41.2,
    todayFertilizer: 132,
  },
]

// ---- 控制日志 ----
export const controlLogs = [
  { id: 1, operator: '李运维', role: '运维人员', device: '1 号大棚水泵', action: '远程启动', channel: '手动控制', result: '成功', time: '2026-11-05 09:42:18' },
  { id: 2, operator: '系统联动', role: '自动策略', device: '2 号大棚补光灯', action: '开启（弱光自动补光）', channel: '联动策略', result: '成功', time: '2026-11-05 07:02:18' },
  { id: 3, operator: '系统联动', role: '自动策略', device: '1 号大棚水泵', action: '启动滴灌 20 分钟（低湿自动灌溉）', channel: '联动策略', result: '成功', time: '2026-11-05 06:10:33' },
  { id: 4, operator: '王建国', role: '农场管理者', device: '南山园区 1 号水肥一体机', action: '下发配方「番茄膨果期配方」', channel: '水肥控制', result: '成功', time: '2026-11-04 17:25:40' },
  { id: 5, operator: '周运维', role: '运维人员', device: '4 号大棚风机', action: '远程启动', channel: '分组控制', result: '成功', time: '2026-11-04 15:38:02' },
  { id: 6, operator: '李运维', role: '运维人员', device: '3 号大棚水泵', action: '远程启动', channel: '手动控制', result: '失败：设备离线', time: '2026-11-04 11:12:55' },
  { id: 7, operator: '系统联动', role: '自动策略', device: '2 号大棚风机 + 卷帘', action: '开启通风（高温自动通风）', channel: '联动策略', result: '成功', time: '2026-11-04 13:22:10' },
  { id: 8, operator: '陈农艺', role: '农技人员', device: '清水基地水肥一体机', action: '下发配方「叶菜通用配方」', channel: '水肥控制', result: '成功', time: '2026-11-04 08:46:21' },
  { id: 9, operator: '兰东凤', role: '系统管理员', device: '南山园区 3 号大棚组', action: '上锁（检修保护）', channel: '分组控制', result: '成功', time: '2026-11-03 10:05:30' },
  { id: 10, operator: '系统联动', role: '自动策略', device: 'B-01 增氧机', action: '开启增氧（低溶氧增氧保护）', channel: '联动策略', result: '成功', time: '2026-11-02 22:30:15' },
  { id: 11, operator: '李运维', role: '运维人员', device: 'B-01 增氧机', action: '远程停止', channel: '手动控制', result: '成功', time: '2026-11-02 20:15:44' },
  { id: 12, operator: '王建国', role: '农场管理者', device: 'A-02 蔬菜大棚区地块组', action: '批量开启卷帘', channel: '分组控制', result: '成功', time: '2026-11-02 08:30:12' },
]

// ---- 水电统计 ----
export const utilityDaily7d = {
  dates: ['10-30', '10-31', '11-01', '11-02', '11-03', '11-04', '11-05'],
  water: [152, 168, 145, 178, 162, 155, 99.7], // m³，11-05 为当日累计
  electricity: [286, 302, 274, 318, 296, 288, 173], // kWh
}

export const utilityByPark = [
  { name: '南山智慧农业示范园', water: 58, electricity: 96 },
  { name: '清水有机蔬菜基地', water: 30, electricity: 52 },
  { name: '花溪生态果园', water: 11.7, electricity: 25 },
]

export const utilitySummary = {
  todayWater: 99.7, // m³，与 utilityDaily7d 11-05 一致
  todayElectricity: 173, // kWh
  monthWater: 1160, // 与水肥统计口径一致
  monthElectricity: 4260,
}

/* ==================== 告警消息中心模块 ==================== */
// 口径与「告警与农事进度面板」保持一致：今日 12 条（环境 7 / 设备 3 / 安防 2）、严重 2 条；
// 本月告警 176 条（严重 18 / 警告 62 / 提示 96）；近 14 日趋势沿用 alarmTrend14d。
// 设备、地块与园区命名与远程控制、GIS 模块一致。

// 告警状态流转：待处置 → 已确认 → 已处置 → 已归档

// ---- 实时告警（2026-11-05 当日 12 条）----
const makeRealtimeAlarm = (seq, data) => ({
  id: `A20261105${seq}`,
  confirmedBy: '',
  confirmedAt: '',
  handledBy: '',
  handledAt: '',
  handleNote: '',
  archivedBy: '',
  archivedAt: '',
  ...data,
})

export const alarmRealtimeList = [
  makeRealtimeAlarm('001', {
    device: '3 号大棚水泵',
    park: '南山智慧农业示范园',
    plot: '3 号大棚',
    source: '设备告警',
    type: '设备离线',
    level: '严重',
    value: '—',
    threshold: '心跳在线',
    time: '2026-11-05 09:28:11',
    status: '待处置',
    desc: '设备心跳丢失超过 5 分钟，远程控制已自动锁定，需现场排查供电与网络。',
    ruleName: '设备离线告警',
  }),
  makeRealtimeAlarm('002', {
    device: 'A-03 土壤传感器',
    park: '南山智慧农业示范园',
    plot: 'A-03 蔬菜地块',
    source: '环境告警',
    type: '土壤湿度过低',
    level: '警告',
    value: '31.2 %',
    threshold: '< 35 %',
    time: '2026-11-05 08:55:40',
    status: '待处置',
    desc: '土壤含水率连续 30 分钟低于阈值，作物存在缺水风险，建议启动滴灌。',
    ruleName: '土壤湿度过低告警',
  }),
  makeRealtimeAlarm('003', {
    device: '2 号大棚风机',
    park: '南山智慧农业示范园',
    plot: '2 号大棚',
    source: '设备告警',
    type: '电流异常',
    level: '警告',
    value: '9.4 A',
    threshold: '≤ 8 A',
    time: '2026-11-05 08:12:02',
    status: '已确认',
    confirmedBy: '李运维',
    confirmedAt: '2026-11-05 08:20:16',
    desc: '风机运行电流高于额定值，疑似轴承磨损导致负载升高。',
    ruleName: '风机电流异常告警',
  }),
  makeRealtimeAlarm('004', {
    device: 'B-01 水质传感器',
    park: '清水有机蔬菜基地',
    plot: 'B-01 鱼菜共生池',
    source: '环境告警',
    type: '溶氧偏低',
    level: '提示',
    value: '3.6 mg/L',
    threshold: '≥ 4 mg/L',
    time: '2026-11-05 07:30:15',
    status: '已处置',
    handledBy: '周运维',
    handledAt: '2026-11-05 07:45:20',
    handleNote: '已联动增氧机运行 30 分钟，溶氧恢复至 5.2 mg/L。',
    desc: '鱼菜共生池溶解氧低于阈值，增氧机已自动启动。',
    ruleName: '水体溶氧偏低告警',
  }),
  makeRealtimeAlarm('005', {
    device: 'B-02 草莓园周界红外',
    park: '南山智慧农业示范园',
    plot: 'B-02 草莓园',
    source: '安防告警',
    type: '夜间非法闯入',
    level: '严重',
    value: '触发 2 次',
    threshold: '触发即报',
    time: '2026-11-05 06:48:33',
    status: '待处置',
    desc: '周界红外 3 分钟内连续触发，监控画面出现人员活动，需立即核实。',
    ruleName: '夜间非法闯入告警',
  }),
  makeRealtimeAlarm('006', {
    device: '1 号大棚温度传感器',
    park: '南山智慧农业示范园',
    plot: '1 号大棚',
    source: '环境告警',
    type: '空气温度过高',
    level: '警告',
    value: '36.8 ℃',
    threshold: '> 35 ℃',
    time: '2026-11-05 10:15:27',
    status: '待处置',
    desc: '棚内温度持续高于 35 ℃，建议开启风机并展开卷帘通风。',
    ruleName: '大棚温度过高告警',
  }),
  makeRealtimeAlarm('007', {
    device: '4 号大棚卷帘',
    park: '南山智慧农业示范园',
    plot: '4 号大棚',
    source: '设备告警',
    type: '卷帘响应超时',
    level: '提示',
    value: '12 s',
    threshold: '≤ 8 s',
    time: '2026-11-05 10:42:18',
    status: '已确认',
    confirmedBy: '周运维',
    confirmedAt: '2026-11-05 10:50:03',
    desc: '卷帘执行指令后响应时间超过阈值，电机疑似卡顿。',
    ruleName: '卷帘响应超时告警',
  }),
  makeRealtimeAlarm('008', {
    device: 'H-02 土壤传感器',
    park: '花溪生态果园',
    plot: 'H-02 果园地块',
    source: '环境告警',
    type: '土壤 EC 值偏低',
    level: '提示',
    value: '0.62 mS/cm',
    threshold: '≥ 0.8 mS/cm',
    time: '2026-11-05 11:08:52',
    status: '已处置',
    handledBy: '陈农艺',
    handledAt: '2026-11-05 11:30:12',
    handleNote: '已补施水溶肥 2 kg/亩，安排 3 日后复测。',
    desc: '果园土壤电导率偏低，养分供应不足。',
    ruleName: '土壤 EC 值偏低告警',
  }),
  makeRealtimeAlarm('009', {
    device: 'H-01 果园周界摄像头',
    park: '花溪生态果园',
    plot: 'H-01 果园周界',
    source: '安防告警',
    type: '非授权时段移动侦测',
    level: '提示',
    value: '侦测 1 次',
    threshold: '触发即报',
    time: '2026-11-05 11:36:09',
    status: '已确认',
    confirmedBy: '李运维',
    confirmedAt: '2026-11-05 11:42:25',
    desc: '非授权时段检测到移动目标，需核实是否为园区巡查人员。',
    ruleName: '夜间非法闯入告警',
  }),
  makeRealtimeAlarm('010', {
    device: 'A-01 大田空气湿度传感器',
    park: '南山智慧农业示范园',
    plot: 'A-01 大田',
    source: '环境告警',
    type: '空气湿度偏高',
    level: '警告',
    value: '91 %',
    threshold: '> 85 %',
    time: '2026-11-05 12:03:44',
    status: '已处置',
    handledBy: '李运维',
    handledAt: '2026-11-05 12:18:30',
    handleNote: '已开启通风设备，湿度降至 82 %。',
    desc: '大田空气湿度偏高，易诱发病害。',
    ruleName: '空气湿度偏高告警',
  }),
  makeRealtimeAlarm('011', {
    device: 'Q-01 叶菜区光照传感器',
    park: '清水有机蔬菜基地',
    plot: 'Q-01 叶菜区',
    source: '环境告警',
    type: '光照不足',
    level: '提示',
    value: '620 lux',
    threshold: '≥ 800 lux',
    time: '2026-11-05 13:20:05',
    status: '已处置',
    handledBy: '周运维',
    handledAt: '2026-11-05 13:32:41',
    handleNote: '已开启补光灯，光照恢复至 1050 lux。',
    desc: '叶菜区光照强度低于阈值，已自动开启补光灯。',
    ruleName: '光照不足告警',
  }),
  makeRealtimeAlarm('012', {
    device: 'H-03 果园土壤温度传感器',
    park: '花溪生态果园',
    plot: 'H-03 果园地块',
    source: '环境告警',
    type: '土壤温度偏低',
    level: '提示',
    value: '12.4 ℃',
    threshold: '≥ 15 ℃',
    time: '2026-11-05 14:05:31',
    status: '已处置',
    handledBy: '陈农艺',
    handledAt: '2026-11-05 14:20:08',
    handleNote: '已覆盖地膜保温，持续观察土壤温度变化。',
    desc: '果园土壤温度偏低，可能影响根系吸收。',
    ruleName: '土壤温度偏低告警',
  }),
]

// ---- 告警规则配置 ----
// operator：> / < / >= / <= / =
export const alarmRules = [
  {
    id: 1,
    name: '大棚温度过高告警',
    target: '1-6 号大棚温度传感器',
    metric: '空气温度',
    operator: '>',
    threshold: '35',
    unit: '℃',
    duration: 5,
    level: '严重',
    notify: ['站内消息', '短信', '微信', '邮件'],
    scope: '南山智慧农业示范园 1-6 号大棚',
    enabled: true,
    creator: '王建国',
    createTime: '2026-09-12 10:00:00',
    lastTriggerTime: '2026-11-05 10:15:27',
  },
  {
    id: 2,
    name: '土壤湿度过低告警',
    target: '全部园区土壤传感器',
    metric: '土壤湿度',
    operator: '<',
    threshold: '35',
    unit: '%',
    duration: 30,
    level: '警告',
    notify: ['站内消息', '短信'],
    scope: '全部园区地块',
    enabled: true,
    creator: '王建国',
    createTime: '2026-09-12 10:10:00',
    lastTriggerTime: '2026-11-05 08:55:40',
  },
  {
    id: 3,
    name: '设备离线告警',
    target: '全部远程控制设备',
    metric: '心跳状态',
    operator: '=',
    threshold: '离线',
    unit: '',
    duration: 5,
    level: '严重',
    notify: ['站内消息', '短信', '微信', '邮件'],
    scope: '全部园区设备',
    enabled: true,
    creator: '兰东凤',
    createTime: '2026-09-15 09:30:00',
    lastTriggerTime: '2026-11-05 09:28:11',
  },
  {
    id: 4,
    name: '风机电流异常告警',
    target: '1-6 号大棚风机',
    metric: '运行电流',
    operator: '>',
    threshold: '8',
    unit: 'A',
    duration: 3,
    level: '警告',
    notify: ['站内消息', '短信'],
    scope: '南山智慧农业示范园 1-6 号大棚',
    enabled: true,
    creator: '李运维',
    createTime: '2026-09-20 14:20:00',
    lastTriggerTime: '2026-11-05 08:12:02',
  },
  {
    id: 5,
    name: '水体溶氧偏低告警',
    target: 'B-01 / Q-04 / H-04 水质传感器',
    metric: '溶解氧',
    operator: '<',
    threshold: '4',
    unit: 'mg/L',
    duration: 10,
    level: '提示',
    notify: ['站内消息'],
    scope: '清水基地 B-01、花溪果园 H-04',
    enabled: true,
    creator: '陈农艺',
    createTime: '2026-09-22 16:00:00',
    lastTriggerTime: '2026-11-05 07:30:15',
  },
  {
    id: 6,
    name: '光照不足告警',
    target: 'Q-01 叶菜区光照传感器',
    metric: '光照强度',
    operator: '<',
    threshold: '800',
    unit: 'lux',
    duration: 20,
    level: '提示',
    notify: ['站内消息'],
    scope: '清水基地 Q-01 叶菜区',
    enabled: false,
    creator: '陈农艺',
    createTime: '2026-10-08 09:15:00',
    lastTriggerTime: '2026-11-04 09:20:10',
  },
  {
    id: 7,
    name: '夜间非法闯入告警',
    target: '全部园区周界红外与摄像头',
    metric: '移动侦测',
    operator: '=',
    threshold: '触发',
    unit: '次',
    duration: 0,
    level: '严重',
    notify: ['站内消息', '短信', '微信', '邮件'],
    scope: '全部园区周界',
    enabled: true,
    creator: '兰东凤',
    createTime: '2026-09-25 11:00:00',
    lastTriggerTime: '2026-11-05 11:36:09',
  },
  {
    id: 8,
    name: '空气湿度偏高告警',
    target: 'A-01 大田空气湿度传感器',
    metric: '空气湿度',
    operator: '>',
    threshold: '85',
    unit: '%',
    duration: 15,
    level: '警告',
    notify: ['站内消息', '微信'],
    scope: '南山园区 A-01 大田',
    enabled: true,
    creator: '王建国',
    createTime: '2026-10-02 08:40:00',
    lastTriggerTime: '2026-11-05 12:03:44',
  },
  {
    id: 9,
    name: '土壤 EC 值偏低告警',
    target: '全部园区土壤传感器',
    metric: '土壤 EC 值',
    operator: '<',
    threshold: '0.8',
    unit: 'mS/cm',
    duration: 30,
    level: '提示',
    notify: ['站内消息'],
    scope: '花溪果园 H-02、清水基地 Q-04',
    enabled: true,
    creator: '陈农艺',
    createTime: '2026-10-10 09:00:00',
    lastTriggerTime: '2026-11-05 11:08:52',
  },
  {
    id: 10,
    name: '土壤温度偏低告警',
    target: '花溪果园土壤温度传感器',
    metric: '土壤温度',
    operator: '<',
    threshold: '15',
    unit: '℃',
    duration: 30,
    level: '提示',
    notify: ['站内消息'],
    scope: '花溪生态果园 H-03、H-04',
    enabled: true,
    creator: '陈农艺',
    createTime: '2026-10-12 10:20:00',
    lastTriggerTime: '2026-11-05 14:05:31',
  },
  {
    id: 11,
    name: '卷帘响应超时告警',
    target: '1-6 号大棚卷帘电机',
    metric: '响应时长',
    operator: '>',
    threshold: '8',
    unit: 's',
    duration: 0,
    level: '提示',
    notify: ['站内消息'],
    scope: '南山智慧农业示范园 1-6 号大棚',
    enabled: true,
    creator: '李运维',
    createTime: '2026-10-15 15:30:00',
    lastTriggerTime: '2026-11-05 10:42:18',
  },
]

// ---- 历史告警 ----
// 依据 alarmTrend14d 的逐日条数（环境 / 设备 / 安防）生成 10-23 至 11-04 的明细，
// 11-05 当日明细直接复用 alarmRealtimeList，保证与实时中心、趋势图口径一致。
const alarmHistorySeeds = {
  env: [
    { type: '土壤湿度过低', device: 'A-03 土壤传感器', park: '南山智慧农业示范园', plot: 'A-03 蔬菜地块', level: '警告', value: '31.2 %', threshold: '< 35 %' },
    { type: '空气温度过高', device: '1 号大棚温度传感器', park: '南山智慧农业示范园', plot: '1 号大棚', level: '警告', value: '36.5 ℃', threshold: '> 35 ℃' },
    { type: '空气湿度偏高', device: 'A-01 大田空气湿度传感器', park: '南山智慧农业示范园', plot: 'A-01 大田', level: '警告', value: '90 %', threshold: '> 85 %' },
    { type: '土壤 EC 值偏低', device: 'H-02 土壤传感器', park: '花溪生态果园', plot: 'H-02 果园地块', level: '提示', value: '0.58 mS/cm', threshold: '≥ 0.8 mS/cm' },
    { type: '光照不足', device: 'Q-01 叶菜区光照传感器', park: '清水有机蔬菜基地', plot: 'Q-01 叶菜区', level: '提示', value: '640 lux', threshold: '≥ 800 lux' },
    { type: '溶氧偏低', device: 'B-01 水质传感器', park: '清水有机蔬菜基地', plot: 'B-01 鱼菜共生池', level: '提示', value: '3.7 mg/L', threshold: '≥ 4 mg/L' },
    { type: '土壤温度偏低', device: 'H-03 果园土壤温度传感器', park: '花溪生态果园', plot: 'H-03 果园地块', level: '提示', value: '12.8 ℃', threshold: '≥ 15 ℃' },
    { type: '空气温度过高', device: '3 号大棚温度传感器', park: '南山智慧农业示范园', plot: '3 号大棚', level: '警告', value: '35.9 ℃', threshold: '> 35 ℃' },
  ],
  device: [
    { type: '设备离线', device: '3 号大棚水泵', park: '南山智慧农业示范园', plot: '3 号大棚', level: '严重', value: '—', threshold: '心跳在线' },
    { type: '设备离线', device: '5 号大棚补光灯', park: '南山智慧农业示范园', plot: '5 号大棚', level: '严重', value: '—', threshold: '心跳在线' },
    { type: '电流异常', device: '2 号大棚风机', park: '南山智慧农业示范园', plot: '2 号大棚', level: '警告', value: '9.6 A', threshold: '≤ 8 A' },
    { type: '卷帘响应超时', device: '4 号大棚卷帘', park: '南山智慧农业示范园', plot: '4 号大棚', level: '提示', value: '12 s', threshold: '≤ 8 s' },
  ],
  security: [
    { type: '夜间非法闯入', device: 'B-02 草莓园周界红外', park: '南山智慧农业示范园', plot: 'B-02 草莓园', level: '严重', value: '触发 2 次', threshold: '触发即报' },
    { type: '非授权时段移动侦测', device: 'H-01 果园周界摄像头', park: '花溪生态果园', plot: 'H-01 果园周界', level: '提示', value: '侦测 1 次', threshold: '触发即报' },
  ],
}

const alarmSourceLabel = { env: '环境告警', device: '设备告警', security: '安防告警' }
const pad2 = (n) => String(n).padStart(2, '0')

const buildAlarmHistory = () => {
  const list = []
  alarmTrend14d.dates.forEach((date, di) => {
    // 当日（11-05）由实时告警列表提供，不再重复生成
    if (di === alarmTrend14d.dates.length - 1) return
    const mmdd = date.replace('-', '')
    const plan = [
      ['env', alarmTrend14d.env[di]],
      ['device', alarmTrend14d.device[di]],
      ['security', alarmTrend14d.security[di]],
    ]
    let daySeq = 0
    plan.forEach(([source, count]) => {
      const seeds = alarmHistorySeeds[source]
      for (let i = 0; i < count; i += 1) {
        const seed = seeds[i % seeds.length]
        daySeq += 1
        const hour = 6 + ((daySeq * 3 + di) % 16)
        const minute = (daySeq * 7 + di * 11) % 60
        const second = (daySeq * 13 + 5) % 60
        const status = di === alarmTrend14d.dates.length - 2 ? '已处置' : '已归档'
        list.push({
          id: `A2026${mmdd}${pad2(daySeq)}`,
          device: seed.device,
          park: seed.park,
          plot: seed.plot,
          source: alarmSourceLabel[source],
          type: seed.type,
          level: seed.level,
          value: seed.value,
          threshold: seed.threshold,
          time: `2026-${date} ${pad2(hour)}:${pad2(minute)}:${pad2(second)}`,
          status,
          handler: status === '已处置' || status === '已归档' ? ['李运维', '周运维', '陈农艺'][daySeq % 3] : '',
          durationMin: 12 + ((daySeq * 9) % 55),
        })
      }
    })
  })
  return list
}

export const alarmHistoryList = [
  ...buildAlarmHistory(),
  ...alarmRealtimeList.map((a) => ({
    id: a.id,
    device: a.device,
    park: a.park,
    plot: a.plot,
    source: a.source,
    type: a.type,
    level: a.level,
    value: a.value,
    threshold: a.threshold,
    time: a.time,
    status: a.status,
    handler: a.handledBy || a.confirmedBy || '',
    durationMin: a.status === '已处置' ? 25 : 0,
  })),
]

// ---- 告警统计分析 ----
const sumArr = (arr) => arr.reduce((sum, n) => sum + n, 0)

// 告警类型归类，用于「高发告警类型」统计
const alarmTypeCategory = {
  土壤湿度过低: '土壤指标异常',
  '土壤 EC 值偏低': '土壤指标异常',
  土壤温度偏低: '土壤指标异常',
  空气温度过高: '空气温度超标',
  空气湿度偏高: '空气湿度异常',
  光照不足: '光照不足',
  溶氧偏低: '水体溶氧偏低',
  设备离线: '设备离线',
  电流异常: '电流 / 电压异常',
  卷帘响应超时: '设备响应超时',
  夜间非法闯入: '安防入侵告警',
  非授权时段移动侦测: '安防入侵告警',
}

const handledRecords = alarmHistoryList.filter((a) => a.durationMin > 0)

export const alarmStatisticsSummary = {
  total14d: alarmHistoryList.length,
  today: alarmRealtimeList.length,
  severeToday: alarmRealtimeList.filter((a) => a.level === '严重').length,
  pendingToday: alarmRealtimeList.filter((a) => a.status === '待处置').length,
  monthTotal: 176,
  severeMonth: 18,
  avgHandleMinutes: handledRecords.length
    ? Math.round(sumArr(handledRecords.map((a) => a.durationMin)) / handledRecords.length)
    : 0,
  timelyRate: handledRecords.length
    ? Math.round((handledRecords.filter((a) => a.durationMin <= 60).length / handledRecords.length) * 1000) / 10
    : 0,
  archiveRate: Math.round((alarmHistoryList.filter((a) => a.status === '已归档').length / alarmHistoryList.length) * 1000) / 10,
}

export const alarmTypeDist = Object.entries(
  alarmHistoryList.reduce((acc, a) => {
    const name = alarmTypeCategory[a.type] || '其他'
    acc[name] = (acc[name] || 0) + 1
    return acc
  }, {}),
)
  .map(([name, value]) => ({ name, value }))
  .sort((a, b) => b.value - a.value)

export const alarmParkDist = Object.entries(
  alarmHistoryList.reduce((acc, a) => {
    acc[a.park] = (acc[a.park] || 0) + 1
    return acc
  }, {}),
)
  .map(([name, value]) => ({ name, value }))
  .sort((a, b) => b.value - a.value)

const durationCount = (min, max) => handledRecords.filter((a) => a.durationMin >= min && a.durationMin <= max).length

export const alarmHandleDurationDist = {
  ranges: ['≤15 分钟', '16-30 分钟', '31-60 分钟', '>60 分钟'],
  values: [durationCount(0, 15), durationCount(16, 30), durationCount(31, 60), durationCount(61, Infinity)],
}

/* ==================== 产销对接与订单管理模块 ==================== */
// 口径说明：
// 1. 园区名称沿用租户档案：南山智慧农业示范园 / 清水有机蔬菜基地 / 花溪生态果园；
// 2. 订单覆盖 2026-10-23 至 2026-11-05，销售统计中的销售额、销量、热销排行均由订单明细汇总；
// 3. 客户的采购次数、累计采购额、最近采购时间、复购率均由订单实时计算，不单独维护静态字段；
// 4. 只有「已发货 / 已完成」订单计入销售额，待支付订单不计入，与真实业务口径一致。

const salesPad = (n, len = 2) => String(n).padStart(len, '0')

const salesAddMinutes = (dt, minutes) => {
  const [datePart, timePart] = dt.split(' ')
  const [y, m, d] = datePart.split('-').map(Number)
  const [hh, mm] = timePart.split(':').map(Number)
  const stamp = new Date(y, m - 1, d, hh, mm + minutes)
  return `${stamp.getFullYear()}-${salesPad(stamp.getMonth() + 1)}-${salesPad(stamp.getDate())} ${salesPad(stamp.getHours())}:${salesPad(stamp.getMinutes())}`
}

// ---- 农产品档案 ----
export const salesProducts = [
  {
    id: 'P001', name: '南山有机番茄', category: '蔬菜', variety: '番茄', grade: 'A级',
    spec: '5kg/箱', unit: 'kg', price: 12.8, stock: 860, park: '南山智慧农业示范园',
    status: '上架', image: '',
    description: '大棚有机种植，果形圆整、糖度稳定，适合商超与餐饮直供。',
    updateTime: '2026-11-04 16:20:00',
  },
  {
    id: 'P002', name: '清水奶油生菜', category: '蔬菜', variety: '生菜', grade: 'A级',
    spec: '500g/袋', unit: 'kg', price: 6.5, stock: 1200, park: '清水有机蔬菜基地',
    status: '上架', image: '',
    description: '水培种植，叶片鲜嫩无农残，冷链配送后仍保持脆度。',
    updateTime: '2026-11-03 10:45:00',
  },
  {
    id: 'P003', name: '清水水果黄瓜', category: '蔬菜', variety: '黄瓜', grade: 'B级',
    spec: '5kg/箱', unit: 'kg', price: 8.8, stock: 640, park: '清水有机蔬菜基地',
    status: '上架', image: '',
    description: '口感清甜、皮薄无刺，适合净菜加工与社区团购。',
    updateTime: '2026-11-02 14:30:00',
  },
  {
    id: 'P004', name: '花溪红富士苹果', category: '水果', variety: '苹果', grade: 'A级',
    spec: '10kg/箱', unit: 'kg', price: 9.6, stock: 1500, park: '花溪生态果园',
    status: '上架', image: '',
    description: '山地果园自然成熟，果径 80mm 以上，耐储运。',
    updateTime: '2026-11-01 09:15:00',
  },
  {
    id: 'P005', name: '花溪阳光玫瑰葡萄', category: '水果', variety: '葡萄', grade: 'A级',
    spec: '4kg/箱', unit: 'kg', price: 24, stock: 320, park: '花溪生态果园',
    status: '上架', image: '',
    description: '无籽脆甜，糖度 18° 以上，需泡沫箱加冰袋冷链发货。',
    updateTime: '2026-11-05 08:40:00',
  },
  {
    id: 'P006', name: '南山稻香米', category: '粮食', variety: '水稻', grade: 'A级',
    spec: '25kg/袋', unit: 'kg', price: 6.8, stock: 2600, park: '南山智慧农业示范园',
    status: '上架', image: '',
    description: '当季新米，米粒饱满，出饭率高，支持批量食堂配送。',
    updateTime: '2026-10-30 15:00:00',
  },
  {
    id: 'P007', name: '清水小香葱', category: '蔬菜', variety: '香葱', grade: 'B级',
    spec: '2kg/捆', unit: 'kg', price: 7.2, stock: 180, park: '清水有机蔬菜基地',
    status: '上架', image: '',
    description: '当日采割、当日发货，适合餐饮配料与农贸市场批发。',
    updateTime: '2026-10-29 11:20:00',
  },
  {
    id: 'P008', name: '花溪秋月梨', category: '水果', variety: '梨', grade: 'B级',
    spec: '8kg/箱', unit: 'kg', price: 8.4, stock: 760, park: '花溪生态果园',
    status: '上架', image: '',
    description: '汁多脆甜，单果重 400g 左右，礼盒与散装均可供应。',
    updateTime: '2026-10-28 16:10:00',
  },
  {
    id: 'P009', name: '南山大棚草莓', category: '水果', variety: '草莓', grade: 'A级',
    spec: '2kg/盒', unit: 'kg', price: 36, stock: 90, park: '南山智慧农业示范园',
    status: '上架', image: '',
    description: '红颜品种，现摘现发，仅支持同城次日达配送。',
    updateTime: '2026-11-05 07:50:00',
  },
  {
    id: 'P010', name: '清水西兰花', category: '蔬菜', variety: '西兰花', grade: 'A级',
    spec: '5kg/箱', unit: 'kg', price: 7.6, stock: 420, park: '清水有机蔬菜基地',
    status: '上架', image: '',
    description: '花球紧实、色泽翠绿，适合团餐与商超净菜渠道。',
    updateTime: '2026-10-27 10:05:00',
  },
  {
    id: 'P011', name: '花溪生态土鸡蛋', category: '禽蛋', variety: '鸡蛋', grade: 'A级',
    spec: '30枚/盒', unit: '盒', price: 48, stock: 260, park: '花溪生态果园',
    status: '上架', image: '',
    description: '散养土鸡蛋，蛋黄色泽深，按盒销售，支持周配。',
    updateTime: '2026-11-03 17:35:00',
  },
  {
    id: 'P012', name: '南山有机紫薯', category: '粮食', variety: '甘薯', grade: 'B级',
    spec: '10kg/箱', unit: 'kg', price: 5.4, stock: 0, park: '南山智慧农业示范园',
    status: '下架', image: '',
    description: '当季货源已售罄，待新薯上市后重新上架。',
    updateTime: '2026-11-02 09:00:00',
  },
]

// ---- 客户档案 ----
export const salesCustomers = [
  {
    id: 'C001', name: '重庆绿源食品有限公司', type: '企业', contact: '张世成', phone: '13900001001',
    level: 'A', address: '重庆市渝北区食品工业园 3 栋', remark: '长期合作商超供应商，月均采购 2 次以上',
    createTime: '2026-03-12 09:20:00',
  },
  {
    id: 'C002', name: '渝北区鲜果合作社', type: '合作社', contact: '刘敏', phone: '13900001002',
    level: 'A', address: '重庆市渝北区统景镇鲜果集散中心', remark: '以水果采购为主，偏好礼盒装',
    createTime: '2026-04-08 14:00:00',
  },
  {
    id: 'C003', name: '沙坪坝鲜生连锁超市', type: '企业', contact: '何伟', phone: '13900001003',
    level: 'B', address: '重庆市沙坪坝区三峡广场配送仓', remark: '门店 6 家，每周二、周五集中补货',
    createTime: '2026-05-16 10:30:00',
  },
  {
    id: 'C004', name: '南岸区机关食堂', type: '企业', contact: '周晓', phone: '13900001004',
    level: 'B', address: '重庆市南岸区行政中心食堂', remark: '蔬菜类固定供应商，需提供检测报告',
    createTime: '2026-06-02 08:50:00',
  },
  {
    id: 'C005', name: '九龙坡蔬菜批发商行', type: '企业', contact: '王强', phone: '13900001005',
    level: 'B', address: '重庆市九龙坡区盘溪农贸批发市场', remark: '走量客户，对价格较敏感',
    createTime: '2026-06-20 15:10:00',
  },
  {
    id: 'C006', name: '巴南区龙洲湾社区团购', type: '合作社', contact: '陈丽', phone: '13900001006',
    level: 'C', address: '重庆市巴南区龙洲湾街道社区服务中心', remark: '以社区拼团为主，单次采购量中等',
    createTime: '2026-07-11 11:40:00',
  },
  {
    id: 'C007', name: '江北区果品经销商', type: '企业', contact: '赵鹏', phone: '13900001007',
    level: 'B', address: '重庆市江北区观音桥农产品配送站', remark: '专注苹果、葡萄等水果分销',
    createTime: '2026-07-28 09:05:00',
  },
  {
    id: 'C008', name: '重庆山城餐饮管理公司', type: '企业', contact: '孙浩', phone: '13900001008',
    level: 'A', address: '重庆市渝中区解放碑中央厨房', remark: '连锁餐饮中央厨房，蔬菜与禽蛋周配',
    createTime: '2026-08-05 16:25:00',
  },
  {
    id: 'C009', name: '个人客户-李女士', type: '个人', contact: '李娟', phone: '13900001009',
    level: 'C', address: '重庆市渝北区金开大道 88 号', remark: '社区自提点常客，偏好草莓与葡萄',
    createTime: '2026-09-15 13:30:00',
  },
  {
    id: 'C010', name: '个人客户-张先生', type: '个人', contact: '张涛', phone: '13900001010',
    level: 'C', address: '重庆市南岸区南滨路 26 号', remark: '家庭采购为主，单次金额较小',
    createTime: '2026-09-27 18:00:00',
  },
  {
    id: 'C011', name: '长寿区家庭农场联盟', type: '合作社', contact: '杨平', phone: '13900001011',
    level: 'C', address: '重庆市长寿区双龙镇农业服务中心', remark: '新拓客户，首次合作水果采购',
    createTime: '2026-10-20 10:15:00',
  },
  {
    id: 'C012', name: '个人客户-刘女士', type: '个人', contact: '刘洋', phone: '13900001012',
    level: 'B', address: '重庆市江北区北滨路 199 号', remark: '新客户，关注苹果与梨类',
    createTime: '2026-10-24 09:00:00',
  },
]

// ---- 销售订单 ----
// 订单主键与订单号固定，便于物流单、发货单关联；金额 = 单价 × 数量，不使用手写金额。
const salesOrderSeeds = [
  { id: 1, time: '2026-11-05 10:20', customerId: 'C001', productId: 'P001', qty: 120, status: '待支付', remark: '要求次日达，优先安排冷链' },
  { id: 2, time: '2026-11-05 09:40', customerId: 'C003', productId: 'P004', qty: 80, status: '待支付', remark: '' },
  { id: 3, time: '2026-11-05 08:55', customerId: 'C008', productId: 'P011', qty: 60, status: '已发货', remark: '食堂周配，分两批送达' },
  { id: 4, time: '2026-11-04 16:10', customerId: 'C002', productId: 'P005', qty: 45, status: '已发货', remark: '葡萄需泡沫箱加冰袋' },
  { id: 5, time: '2026-11-04 14:30', customerId: 'C007', productId: 'P004', qty: 100, status: '已发货', remark: '受降雨影响物流延误，已与客户沟通' },
  { id: 6, time: '2026-11-04 09:15', customerId: 'C001', productId: 'P006', qty: 200, status: '已完成', remark: '25kg 袋装，需提供质检报告' },
  { id: 7, time: '2026-11-03 17:20', customerId: 'C005', productId: 'P003', qty: 150, status: '已发货', remark: '' },
  { id: 8, time: '2026-11-03 11:05', customerId: 'C009', productId: 'P009', qty: 12, status: '已完成', remark: '个人自提转同城配送' },
  { id: 9, time: '2026-11-02 15:40', customerId: 'C004', productId: 'P002', qty: 90, status: '已发货', remark: '' },
  { id: 10, time: '2026-11-02 10:25', customerId: 'C008', productId: 'P001', qty: 160, status: '已完成', remark: '连锁餐饮周供' },
  { id: 11, time: '2026-11-01 16:05', customerId: 'C006', productId: 'P010', qty: 70, status: '已完成', remark: '' },
  { id: 12, time: '2026-11-01 09:50', customerId: 'C003', productId: 'P008', qty: 120, status: '已完成', remark: '' },
  { id: 13, time: '2026-10-31 15:10', customerId: 'C011', productId: 'P004', qty: 150, status: '已完成', remark: '新客户首单，安排样品随车' },
  { id: 14, time: '2026-10-31 09:30', customerId: 'C010', productId: 'P009', qty: 8, status: '已完成', remark: '' },
  { id: 15, time: '2026-10-30 14:20', customerId: 'C001', productId: 'P011', qty: 40, status: '已完成', remark: '' },
  { id: 16, time: '2026-10-30 08:45', customerId: 'C007', productId: 'P005', qty: 60, status: '已完成', remark: '' },
  { id: 17, time: '2026-10-29 16:35', customerId: 'C005', productId: 'P002', qty: 200, status: '已完成', remark: '分两车发运' },
  { id: 18, time: '2026-10-28 15:00', customerId: 'C004', productId: 'P003', qty: 110, status: '已完成', remark: '' },
  { id: 19, time: '2026-10-28 09:20', customerId: 'C009', productId: 'P005', qty: 10, status: '已完成', remark: '' },
  { id: 20, time: '2026-10-27 13:40', customerId: 'C008', productId: 'P006', qty: 150, status: '已完成', remark: '' },
  { id: 21, time: '2026-10-26 16:10', customerId: 'C003', productId: 'P001', qty: 180, status: '已完成', remark: '' },
  { id: 22, time: '2026-10-26 10:05', customerId: 'C006', productId: 'P007', qty: 60, status: '已完成', remark: '' },
  { id: 23, time: '2026-10-25 14:50', customerId: 'C012', productId: 'P004', qty: 30, status: '已完成', remark: '新客户首单，安排同城配送' },
  { id: 24, time: '2026-10-24 09:35', customerId: 'C001', productId: 'P001', qty: 220, status: '已完成', remark: '商超备货，整批发出' },
]

const salesLogisticsOptions = [
  { company: '顺丰速运', prefix: 'SF' },
  { company: '京东物流', prefix: 'JDVA' },
  { company: '德邦快递', prefix: 'DP' },
  { company: '中通快递', prefix: 'ZT' },
]

export const salesOrders = salesOrderSeeds.map((seed) => {
  const product = salesProducts.find((p) => p.id === seed.productId)
  const customer = salesCustomers.find((c) => c.id === seed.customerId)
  const dateCompact = seed.time.slice(0, 10).replace(/-/g, '')
  const paid = seed.status !== '待支付'
  const logistics = salesLogisticsOptions[seed.id % salesLogisticsOptions.length]
  return {
    id: seed.id,
    orderNo: `SO${dateCompact}${salesPad(seed.id, 3)}`,
    customerId: customer.id,
    customer: customer.name,
    customerLevel: customer.level,
    productId: product.id,
    product: product.name,
    productSpec: product.spec,
    unit: product.unit,
    unitPrice: product.price,
    qty: seed.qty,
    amount: Math.round(product.price * seed.qty * 100) / 100,
    park: product.park,
    status: seed.status,
    createTime: seed.time,
    payTime: paid ? salesAddMinutes(seed.time, 12) : '',
    shipTime: paid ? salesAddMinutes(seed.time, 110) : '',
    finishTime: seed.status === '已完成' ? salesAddMinutes(seed.time, 110 + 1440) : '',
    logisticsCompany: paid ? logistics.company : '',
    logisticsNo: paid ? `${logistics.prefix}${dateCompact}${salesPad(seed.id, 3)}` : '',
    remark: seed.remark || '',
  }
})

// ---- 发货单与物流轨迹 ----
const buildSalesTracking = (order, status) => {
  const nodes = [
    { time: order.shipTime, location: '重庆渝北揽收点', desc: '快件已揽收，发往转运中心' },
    { time: salesAddMinutes(order.shipTime, 180), location: '重庆转运中心', desc: '已到达重庆转运中心，开始分拨' },
  ]
  if (status === '异常') {
    nodes.push({
      time: salesAddMinutes(order.shipTime, 600),
      location: '遵义中转场',
      desc: '物流异常：暴雨导致中转延误，预计延迟 1 天送达',
    })
  } else {
    nodes.push({ time: salesAddMinutes(order.shipTime, 540), location: '重庆主城区配送站', desc: '快件已到达配送站，等待派送' })
    if (status === '已签收') {
      nodes.push({ time: order.finishTime, location: '客户收货地址', desc: '快件已签收，签收人：客户本人' })
    }
  }
  return nodes.reverse()
}

const buildSalesShipment = (order) => {
  const customer = salesCustomers.find((c) => c.id === order.customerId)
  const status = order.id === 5 ? '异常' : order.status === '已完成' ? '已签收' : '运输中'
  return {
    id: `SH${order.orderNo.slice(2)}`,
    orderId: order.id,
    orderNo: order.orderNo,
    customer: order.customer,
    product: order.product,
    qty: order.qty,
    unit: order.unit,
    logisticsCompany: order.logisticsCompany,
    logisticsNo: order.logisticsNo,
    shipTime: order.shipTime,
    status,
    receiver: customer ? customer.contact : order.customer,
    address: customer ? customer.address : '',
    tracking: buildSalesTracking(order, status),
  }
}

export const salesShipments = salesOrders.filter((o) => o.logisticsNo).map(buildSalesShipment)