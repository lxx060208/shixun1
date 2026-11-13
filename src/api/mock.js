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
      { id: 'menu-data-realtime', label: '实时环境数据', type: 'menu' },
      { id: 'menu-data-water', label: '水肥与产量统计', type: 'menu' },
      { id: 'menu-data-device', label: '设备运维大屏', type: 'menu' },
      { id: 'menu-data-alarm-farm', label: '告警与农事进度', type: 'menu' },
    ],
  },
  {
    id: 'menu-iot',
    label: '物联网环境监测',
    type: 'menu',
    children: [
      { id: 'menu-iot-overview', label: '环境监测总览', type: 'menu' },
      { id: 'menu-iot-weather', label: '气象监测', type: 'menu' },
      { id: 'menu-iot-soil', label: '土壤墒情监测', type: 'menu' },
      { id: 'menu-iot-water', label: '水质监测', type: 'menu' },
      { id: 'menu-iot-video', label: '视频监控', type: 'menu' },
      { id: 'menu-iot-collection', label: '采集管理', type: 'menu' },
    ],
  },
  {
    id: 'menu-control',
    label: '远程智能控制',
    type: 'menu',
    children: [
      { id: 'menu-control-manual', label: '设备手动控制台', type: 'menu' },
      { id: 'menu-control-strategy', label: '自动联动策略配置', type: 'menu' },
      { id: 'menu-control-group', label: '分组控制', type: 'menu' },
      { id: 'menu-control-fertilizer', label: '水肥配方控制', type: 'menu' },
      { id: 'menu-control-logs', label: '控制日志与水电', type: 'menu' },
    ],
  },
  {
    id: 'menu-alarm',
    label: '告警消息中心',
    type: 'menu',
    children: [
      { id: 'menu-alarm-realtime', label: '告警实时中心', type: 'menu' },
      { id: 'menu-alarm-process', label: '告警处理流程', type: 'menu' },
      { id: 'menu-alarm-rules', label: '告警规则配置', type: 'menu' },
      { id: 'menu-alarm-history', label: '告警历史查询', type: 'menu' },
      { id: 'menu-alarm-statistics', label: '告警统计分析', type: 'menu' },
    ],
  },
  {
    id: 'menu-farm',
    label: '生产农事管理',
    type: 'menu',
    children: [
      { id: 'menu-farm-plot', label: '地块档案管理', type: 'menu' },
      { id: 'menu-farm-gis', label: '地块GIS地图', type: 'menu' },
      { id: 'menu-farm-plan', label: '种植计划管理', type: 'menu' },
      { id: 'menu-farm-order', label: '农事工单派单', type: 'menu' },
      { id: 'menu-farm-record', label: '农事执行打卡与台账', type: 'menu' },
      { id: 'menu-farm-stock', label: '农资库存管理', type: 'menu' },
      { id: 'menu-farm-harvest', label: '采收与产量管理', type: 'menu' },
    ],
  },
  {
    id: 'menu-sales',
    label: '产销对接与订单管理',
    type: 'menu',
    children: [
      { id: 'menu-sales-products', label: '农产品上架管理', type: 'menu' },
      { id: 'menu-sales-orders', label: '订单管理', type: 'menu' },
      { id: 'menu-sales-shipments', label: '发货与物流管理', type: 'menu' },
      { id: 'menu-sales-statistics', label: '销售统计', type: 'menu' },
      { id: 'menu-sales-customers', label: '客户档案管理', type: 'menu' },
    ],
  },
  {
    id: 'menu-knowledge',
    label: '农业专家与病虫害知识库',
    type: 'menu',
    children: [
      { id: 'menu-know-overview', label: '知识库总览', type: 'menu' },
      { id: 'menu-know-pests', label: '病虫害知识库', type: 'menu' },
      { id: 'menu-know-pest-plans', label: '病虫害防治方案库', type: 'menu' },
      { id: 'menu-know-manage', label: '知识库内容管理', type: 'menu' },
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
  // admin 全部权限
  admin: [
    'menu-dashboard', 'btn-dashboard-view',
    'menu-profile', 'menu-profile-info', 'menu-profile-pwd', 'menu-profile-notify',
    'menu-system', 'menu-system-user', 'btn-user-add', 'btn-user-edit', 'btn-user-del', 'btn-user-role',
    'menu-system-role', 'btn-role-add', 'btn-role-perm',
    'menu-system-log', 'menu-system-tenant',
    'menu-data', 'menu-data-overview', 'menu-data-gis', 'menu-data-realtime', 'menu-data-water', 'menu-data-device', 'menu-data-alarm-farm',
    'menu-iot', 'menu-iot-overview', 'menu-iot-weather', 'menu-iot-soil', 'menu-iot-water', 'menu-iot-video', 'menu-iot-collection',
    'menu-control', 'menu-control-manual', 'menu-control-strategy', 'menu-control-group', 'menu-control-fertilizer', 'menu-control-logs',
    'menu-alarm', 'menu-alarm-realtime', 'menu-alarm-process', 'menu-alarm-rules', 'menu-alarm-history', 'menu-alarm-statistics',
    'menu-farm', 'menu-farm-plot', 'menu-farm-gis', 'menu-farm-plan', 'menu-farm-order', 'menu-farm-record', 'menu-farm-stock', 'menu-farm-harvest',
    'menu-sales', 'menu-sales-products', 'menu-sales-orders', 'menu-sales-shipments', 'menu-sales-statistics', 'menu-sales-customers',
    'menu-knowledge', 'menu-know-overview', 'menu-know-pests', 'menu-know-pest-plans', 'menu-know-manage',
    'data-scope', 'data-all',
  ],
  // 农场管理者：核心业务全模块
  manager: [
    'menu-dashboard', 'btn-dashboard-view',
    'menu-profile', 'menu-profile-info', 'menu-profile-pwd', 'menu-profile-notify',
    'menu-data', 'menu-data-overview', 'menu-data-gis', 'menu-data-realtime', 'menu-data-water', 'menu-data-device', 'menu-data-alarm-farm',
    'menu-iot', 'menu-iot-overview', 'menu-iot-weather', 'menu-iot-soil', 'menu-iot-water', 'menu-iot-video',
    'menu-control', 'menu-control-manual', 'menu-control-group', 'menu-control-logs',
    'menu-alarm', 'menu-alarm-realtime', 'menu-alarm-process', 'menu-alarm-history', 'menu-alarm-statistics',
    'menu-farm', 'menu-farm-plot', 'menu-farm-gis', 'menu-farm-plan', 'menu-farm-order', 'menu-farm-record', 'menu-farm-stock', 'menu-farm-harvest',
    'menu-sales', 'menu-sales-products', 'menu-sales-orders', 'menu-sales-shipments',
    'menu-knowledge', 'menu-know-overview', 'menu-know-pests', 'menu-know-pest-plans',
    'data-scope', 'data-dept',
  ],
  // 运维人员：IoT + 远程控制 + 告警 + 部分农事
  operator: [
    'menu-dashboard', 'btn-dashboard-view',
    'menu-profile', 'menu-profile-info', 'menu-profile-pwd',
    'menu-data', 'menu-data-device', 'menu-data-alarm-farm',
    'menu-iot', 'menu-iot-overview', 'menu-iot-weather', 'menu-iot-soil', 'menu-iot-water', 'menu-iot-video', 'menu-iot-collection',
    'menu-control', 'menu-control-manual', 'menu-control-group', 'menu-control-fertilizer', 'menu-control-logs',
    'menu-alarm', 'menu-alarm-realtime', 'menu-alarm-process', 'menu-alarm-rules', 'menu-alarm-history',
    'menu-farm', 'menu-farm-record', 'menu-farm-stock',
    'data-scope', 'data-dept',
  ],
  // 产销业务员：销售 + 数据总览
  sales: [
    'menu-dashboard', 'btn-dashboard-view',
    'menu-profile', 'menu-profile-info', 'menu-profile-pwd', 'menu-profile-notify',
    'menu-data', 'menu-data-overview', 'menu-data-water',
    'menu-sales', 'menu-sales-products', 'menu-sales-orders', 'menu-sales-shipments', 'menu-sales-statistics', 'menu-sales-customers',
    'menu-alarm', 'menu-alarm-history',
    'data-scope', 'data-self',
  ],
  // 农技人员：农事 + 知识库 + 数据
  agronomist: [
    'menu-dashboard', 'btn-dashboard-view',
    'menu-profile', 'menu-profile-info', 'menu-profile-pwd',
    'menu-data', 'menu-data-overview', 'menu-data-water', 'menu-data-alarm-farm',
    'menu-farm', 'menu-farm-plot', 'menu-farm-gis', 'menu-farm-plan', 'menu-farm-record', 'menu-farm-harvest',
    'menu-knowledge', 'menu-know-overview', 'menu-know-pests', 'menu-know-pest-plans', 'menu-know-manage',
    'menu-alarm', 'menu-alarm-history', 'menu-alarm-statistics',
    'data-scope', 'data-self',
  ],
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

/* ==================== 生产农事管理模块 ==================== */
// 口径说明：
// 1. 园区与面积沿用租户/总览口径：南山智慧农业示范园 620 亩、清水有机蔬菜基地 426 亩、花溪生态果园 240 亩，合计 1286 亩；
// 2. 南山地块 A-01/A-02/B-01/B-02 与「地块 GIS 地图」页面保持一致（120+180+200+120=620 亩）；
// 3. 采收批次产量合计 38500kg，与 dashboardStats.totalYield 保持一致；
// 4. 业务时间落在 2026-09-01 至 2026-11-09 之间，与系统当前日期一致。

export const farmCrops = ['水稻', '番茄', '黄瓜', '生菜', '草莓', '苹果', '葡萄', '西兰花']

export const farmSoilTypes = ['壤土', '砂壤土', '黏土', '红壤']

export const farmOperationTypes = ['整地', '播种', '施肥', '灌溉', '打药', '除草', '采收', '巡田']

// 农事人员复用系统用户档案（姓名一致），按园区分配
export const farmers = [
  { id: 1, name: '王建国', park: '南山智慧农业示范园' },
  { id: 2, name: '李运维', park: '南山智慧农业示范园' },
  { id: 3, name: '陈农艺', park: '清水有机蔬菜基地' },
  { id: 4, name: '刘星鑫', park: '清水有机蔬菜基地' },
  { id: 5, name: '赵小敏', park: '花溪生态果园' },
  { id: 6, name: '周运维', park: '花溪生态果园' },
]

// ---- 地块档案：15 块，面积合计 1286 亩 ----
export const farmPlots = [
  {
    id: 1, plotCode: 'A-01', name: 'A-01 大田', area: 120, crop: '水稻',
    location: '南山智慧农业示范园', soilType: '壤土', owner: '王建国', coverImage: '', status: 1,
    createTime: '2026-09-01 09:10:00', updateTime: '2026-11-02 10:30:00',
  },
  {
    id: 2, plotCode: 'A-02', name: 'A-02 蔬菜大棚区', area: 180, crop: '番茄',
    location: '南山智慧农业示范园', soilType: '壤土', owner: '陈农艺', coverImage: '', status: 1,
    createTime: '2026-09-01 09:20:00', updateTime: '2026-11-04 15:20:00',
  },
  {
    id: 3, plotCode: 'B-01', name: 'B-01 葡萄园', area: 200, crop: '葡萄',
    location: '南山智慧农业示范园', soilType: '砂壤土', owner: '刘星鑫', coverImage: '', status: 1,
    createTime: '2026-09-01 09:30:00', updateTime: '2026-10-28 09:45:00',
  },
  {
    id: 4, plotCode: 'B-02', name: 'B-02 草莓园', area: 120, crop: '草莓',
    location: '南山智慧农业示范园', soilType: '砂壤土', owner: '赵小敏', coverImage: '', status: 1,
    createTime: '2026-09-01 09:40:00', updateTime: '2026-11-05 08:10:00',
  },
  {
    id: 5, plotCode: 'Q-01', name: 'Q-01 叶菜区', area: 96, crop: '生菜',
    location: '清水有机蔬菜基地', soilType: '壤土', owner: '刘星鑫', coverImage: '', status: 1,
    createTime: '2026-09-02 10:00:00', updateTime: '2026-10-30 16:00:00',
  },
  {
    id: 6, plotCode: 'Q-02', name: 'Q-02 番茄区', area: 80, crop: '番茄',
    location: '清水有机蔬菜基地', soilType: '壤土', owner: '陈农艺', coverImage: '', status: 1,
    createTime: '2026-09-02 10:10:00', updateTime: '2026-10-26 11:30:00',
  },
  {
    id: 7, plotCode: 'Q-03', name: 'Q-03 黄瓜区', area: 70, crop: '黄瓜',
    location: '清水有机蔬菜基地', soilType: '砂壤土', owner: '陈农艺', coverImage: '', status: 1,
    createTime: '2026-09-02 10:20:00', updateTime: '2026-10-22 14:00:00',
  },
  {
    id: 8, plotCode: 'Q-04', name: 'Q-04 西兰花区', area: 60, crop: '西兰花',
    location: '清水有机蔬菜基地', soilType: '壤土', owner: '刘星鑫', coverImage: '', status: 1,
    createTime: '2026-09-02 10:30:00', updateTime: '2026-11-01 09:00:00',
  },
  {
    id: 9, plotCode: 'Q-05', name: 'Q-05 叶菜二号区', area: 60, crop: '生菜',
    location: '清水有机蔬菜基地', soilType: '黏土', owner: '刘星鑫', coverImage: '', status: 1,
    createTime: '2026-09-02 10:40:00', updateTime: '2026-11-06 10:15:00',
  },
  {
    id: 10, plotCode: 'Q-06', name: 'Q-06 番茄二号区', area: 60, crop: '番茄',
    location: '清水有机蔬菜基地', soilType: '壤土', owner: '陈农艺', coverImage: '', status: 1,
    createTime: '2026-09-02 10:50:00', updateTime: '2026-11-04 10:40:00',
  },
  {
    id: 11, plotCode: 'H-01', name: 'H-01 苹果园', area: 70, crop: '苹果',
    location: '花溪生态果园', soilType: '红壤', owner: '赵小敏', coverImage: '', status: 1,
    createTime: '2026-09-03 11:00:00', updateTime: '2026-11-02 15:00:00',
  },
  {
    id: 12, plotCode: 'H-02', name: 'H-02 苹果二号园', area: 50, crop: '苹果',
    location: '花溪生态果园', soilType: '红壤', owner: '周运维', coverImage: '', status: 1,
    createTime: '2026-09-03 11:10:00', updateTime: '2026-11-06 09:30:00',
  },
  {
    id: 13, plotCode: 'H-03', name: 'H-03 葡萄园', area: 45, crop: '葡萄',
    location: '花溪生态果园', soilType: '砂壤土', owner: '周运维', coverImage: '', status: 1,
    createTime: '2026-09-03 11:20:00', updateTime: '2026-11-09 08:00:00',
  },
  {
    id: 14, plotCode: 'H-04', name: 'H-04 草莓园', area: 40, crop: '草莓',
    location: '花溪生态果园', soilType: '壤土', owner: '赵小敏', coverImage: '', status: 1,
    createTime: '2026-09-03 11:30:00', updateTime: '2026-11-07 10:20:00',
  },
  {
    id: 15, plotCode: 'H-05', name: 'H-05 蔬菜试验园', area: 35, crop: '西兰花',
    location: '花溪生态果园', soilType: '黏土', owner: '陈农艺', coverImage: '', status: 0,
    createTime: '2026-09-03 11:40:00', updateTime: '2026-10-20 16:50:00',
  },
]

// 地块名称下拉列表（与地块档案 name 保持一致）
export const farmPlotNameList = farmPlots.map((p) => p.name)

// ---- 农资库存：13 项，其中 5 项低库存 ----
export const farmMaterials = [
  { id: 1, name: '复合肥（15-15-15）', category: '肥料', spec: '50kg/袋', unit: '袋', stock: 120, threshold: 30, location: '南山农资库', updateTime: '2026-11-03 16:30:00' },
  { id: 2, name: '有机水溶肥', category: '肥料', spec: '20kg/桶', unit: '桶', stock: 18, threshold: 20, location: '南山农资库', updateTime: '2026-10-05 11:00:00' },
  { id: 3, name: '草莓专用水溶肥', category: '肥料', spec: '5kg/袋', unit: '袋', stock: 36, threshold: 10, location: '南山农资库', updateTime: '2026-09-15 14:10:00' },
  { id: 4, name: '尿素', category: '肥料', spec: '25kg/袋', unit: '袋', stock: 8, threshold: 15, location: '清水农资库', updateTime: '2026-11-03 16:30:00' },
  { id: 5, name: '45% 代森锰锌可湿性粉剂', category: '农药', spec: '500g/袋', unit: '袋', stock: 42, threshold: 20, location: '清水农资库', updateTime: '2026-09-22 09:30:00' },
  { id: 6, name: '25% 吡虫啉可湿性粉剂', category: '农药', spec: '100g/袋', unit: '袋', stock: 15, threshold: 25, location: '清水农资库', updateTime: '2026-10-12 15:20:00' },
  { id: 7, name: '72% 霜脲·锰锌', category: '农药', spec: '200g/袋', unit: '袋', stock: 64, threshold: 15, location: '花溪农资库', updateTime: '2026-11-01 09:05:00' },
  { id: 8, name: '水稻种子（宜香优）', category: '种子', spec: '5kg/袋', unit: '袋', stock: 22, threshold: 10, location: '南山农资库', updateTime: '2026-09-08 10:40:00' },
  { id: 9, name: '番茄种子（红宝石）', category: '种子', spec: '100g/罐', unit: '罐', stock: 6, threshold: 10, location: '清水农资库', updateTime: '2026-10-19 10:15:00' },
  { id: 10, name: '水果黄瓜种子', category: '种子', spec: '50g/罐', unit: '罐', stock: 28, threshold: 8, location: '清水农资库', updateTime: '2026-11-08 11:40:00' },
  { id: 11, name: '生菜种子（奶油生菜）', category: '种子', spec: '250g/袋', unit: '袋', stock: 14, threshold: 5, location: '清水农资库', updateTime: '2026-10-07 16:50:00' },
  { id: 12, name: '育苗基质', category: '其他', spec: '50L/袋', unit: '袋', stock: 46, threshold: 20, location: '清水农资库', updateTime: '2026-10-26 14:45:00' },
  { id: 13, name: '灌溉滴灌带', category: '其他', spec: '500m/卷', unit: '卷', stock: 12, threshold: 15, location: '南山农资库', updateTime: '2026-11-05 10:20:00' },
]

// ---- 种植计划：14 条 ----
export const farmPlans = [
  { id: 1, planName: '水稻秋收后整地作业', plot: 'A-01 大田', crop: '水稻', operationType: '整地', startDate: '2026-09-10', endDate: '2026-09-14', executor: '王建国', status: '已完成', createTime: '2026-09-05 09:00:00' },
  { id: 2, planName: 'A-01 水稻收割采收', plot: 'A-01 大田', crop: '水稻', operationType: '采收', startDate: '2026-09-20', endDate: '2026-09-26', executor: '王建国', status: '已完成', createTime: '2026-09-12 10:20:00' },
  { id: 3, planName: 'A-02 番茄苗期施肥', plot: 'A-02 蔬菜大棚区', crop: '番茄', operationType: '施肥', startDate: '2026-09-18', endDate: '2026-09-20', executor: '陈农艺', status: '已完成', createTime: '2026-09-10 14:00:00' },
  { id: 4, planName: 'A-02 番茄整枝打药', plot: 'A-02 蔬菜大棚区', crop: '番茄', operationType: '打药', startDate: '2026-10-08', endDate: '2026-10-10', executor: '陈农艺', status: '已完成', createTime: '2026-10-01 09:30:00' },
  { id: 5, planName: 'B-01 葡萄秋季施肥', plot: 'B-01 葡萄园', crop: '葡萄', operationType: '施肥', startDate: '2026-09-25', endDate: '2026-09-28', executor: '刘星鑫', status: '已完成', createTime: '2026-09-18 11:10:00' },
  { id: 6, planName: 'B-02 草莓定植播种', plot: 'B-02 草莓园', crop: '草莓', operationType: '播种', startDate: '2026-10-01', endDate: '2026-10-03', executor: '赵小敏', status: '已完成', createTime: '2026-09-25 15:40:00' },
  { id: 7, planName: 'B-02 草莓滴灌灌溉', plot: 'B-02 草莓园', crop: '草莓', operationType: '灌溉', startDate: '2026-10-15', endDate: '2026-10-18', executor: '李运维', status: '已完成', createTime: '2026-10-08 10:00:00' },
  { id: 8, planName: 'Q-01 生菜整地播种', plot: 'Q-01 叶菜区', crop: '生菜', operationType: '播种', startDate: '2026-10-05', endDate: '2026-10-07', executor: '刘星鑫', status: '已完成', createTime: '2026-09-28 09:20:00' },
  { id: 9, planName: 'Q-03 黄瓜大棚除草', plot: 'Q-03 黄瓜区', crop: '黄瓜', operationType: '除草', startDate: '2026-10-20', endDate: '2026-10-22', executor: '陈农艺', status: '已完成', createTime: '2026-10-12 16:30:00' },
  { id: 10, planName: 'Q-04 西兰花追肥', plot: 'Q-04 西兰花区', crop: '西兰花', operationType: '施肥', startDate: '2026-11-01', endDate: '2026-11-03', executor: '陈农艺', status: '进行中', createTime: '2026-10-25 08:50:00' },
  { id: 11, planName: 'H-01 苹果园巡田', plot: 'H-01 苹果园', crop: '苹果', operationType: '巡田', startDate: '2026-11-02', endDate: '2026-11-04', executor: '赵小敏', status: '进行中', createTime: '2026-10-28 14:20:00' },
  { id: 12, planName: 'H-03 葡萄采收', plot: 'H-03 葡萄园', crop: '葡萄', operationType: '采收', startDate: '2026-11-06', endDate: '2026-11-09', executor: '周运维', status: '进行中', createTime: '2026-10-30 09:00:00' },
  { id: 13, planName: 'H-04 草莓园打药防治', plot: 'H-04 草莓园', crop: '草莓', operationType: '打药', startDate: '2026-11-10', endDate: '2026-11-12', executor: '赵小敏', status: '未开始', createTime: '2026-11-01 10:30:00' },
  { id: 14, planName: 'Q-05 叶菜二号区播种', plot: 'Q-05 叶菜二号区', crop: '生菜', operationType: '播种', startDate: '2026-11-12', endDate: '2026-11-15', executor: '刘星鑫', status: '未开始', createTime: '2026-11-02 15:10:00' },
]

// ---- 农事工单：18 单（WO-2026xxxx），覆盖派单/流转各状态 ----
export const farmWorkOrders = [
  { id: 1, orderNo: 'WO-20260901', title: '水稻秋收后整地', plot: 'A-01 大田', taskType: '整地', assignee: '王建国', deadline: '2026-09-14', status: '已完成', createTime: '2026-09-05 09:10:00', updateTime: '2026-09-14 16:20:00' },
  { id: 2, orderNo: 'WO-20260903', title: 'A-01 水稻收割', plot: 'A-01 大田', taskType: '采收', assignee: '王建国', deadline: '2026-09-26', status: '已完成', createTime: '2026-09-12 10:30:00', updateTime: '2026-09-26 18:10:00' },
  { id: 3, orderNo: 'WO-20260905', title: 'A-02 番茄苗期施肥', plot: 'A-02 蔬菜大棚区', taskType: '施肥', assignee: '陈农艺', deadline: '2026-09-20', status: '已完成', createTime: '2026-09-10 14:10:00', updateTime: '2026-09-20 10:30:00' },
  { id: 4, orderNo: 'WO-20260910', title: 'B-01 葡萄秋季施肥', plot: 'B-01 葡萄园', taskType: '施肥', assignee: '刘星鑫', deadline: '2026-09-28', status: '已完成', createTime: '2026-09-18 11:20:00', updateTime: '2026-09-28 15:40:00' },
  { id: 5, orderNo: 'WO-20260915', title: 'B-02 草莓定植', plot: 'B-02 草莓园', taskType: '播种', assignee: '赵小敏', deadline: '2026-10-03', status: '已完成', createTime: '2026-09-25 15:50:00', updateTime: '2026-10-03 17:05:00' },
  { id: 6, orderNo: 'WO-20260920', title: 'Q-01 叶菜整地播种', plot: 'Q-01 叶菜区', taskType: '播种', assignee: '刘星鑫', deadline: '2026-10-07', status: '已完成', createTime: '2026-09-28 09:30:00', updateTime: '2026-10-07 16:50:00' },
  { id: 7, orderNo: 'WO-20261002', title: 'A-02 番茄棚打药', plot: 'A-02 蔬菜大棚区', taskType: '打药', assignee: '陈农艺', deadline: '2026-10-10', status: '已完成', createTime: '2026-10-01 09:40:00', updateTime: '2026-10-10 09:45:00' },
  { id: 8, orderNo: 'WO-20261008', title: 'Q-03 黄瓜棚除草', plot: 'Q-03 黄瓜区', taskType: '除草', assignee: '陈农艺', deadline: '2026-10-22', status: '已完成', createTime: '2026-10-12 16:40:00', updateTime: '2026-10-22 11:20:00' },
  { id: 9, orderNo: 'WO-20261012', title: 'B-02 草莓滴灌', plot: 'B-02 草莓园', taskType: '灌溉', assignee: '李运维', deadline: '2026-10-18', status: '已完成', createTime: '2026-10-08 10:10:00', updateTime: '2026-10-18 14:30:00' },
  { id: 10, orderNo: 'WO-20261018', title: 'Q-04 西兰花追肥', plot: 'Q-04 西兰花区', taskType: '施肥', assignee: '陈农艺', deadline: '2026-11-03', status: '已完成', createTime: '2026-10-25 09:00:00', updateTime: '2026-11-03 10:10:00' },
  { id: 11, orderNo: 'WO-20261022', title: 'H-01 苹果园巡田', plot: 'H-01 苹果园', taskType: '巡田', assignee: '赵小敏', deadline: '2026-11-04', status: '已完成', createTime: '2026-10-28 14:30:00', updateTime: '2026-11-04 16:15:00' },
  { id: 12, orderNo: 'WO-20261026', title: 'H-02 苹果园除草', plot: 'H-02 苹果二号园', taskType: '除草', assignee: '周运维', deadline: '2026-11-06', status: '进行中', createTime: '2026-10-30 09:10:00', updateTime: '2026-11-05 09:20:00' },
  { id: 13, orderNo: 'WO-20261030', title: 'Q-05 叶菜二号区播种', plot: 'Q-05 叶菜二号区', taskType: '播种', assignee: '刘星鑫', deadline: '2026-11-08', status: '进行中', createTime: '2026-11-02 15:20:00', updateTime: '2026-11-06 10:15:00' },
  { id: 14, orderNo: 'WO-20261101', title: 'H-03 葡萄采收', plot: 'H-03 葡萄园', taskType: '采收', assignee: '周运维', deadline: '2026-11-09', status: '进行中', createTime: '2026-10-30 09:20:00', updateTime: '2026-11-08 08:30:00' },
  { id: 15, orderNo: 'WO-20261102', title: '花溪草莓园打药防治', plot: 'H-04 草莓园', taskType: '打药', assignee: '赵小敏', deadline: '2026-11-12', status: '已派单', createTime: '2026-11-01 10:40:00', updateTime: '2026-11-01 10:40:00' },
  { id: 16, orderNo: 'WO-20261104', title: 'Q-06 番茄二号区灌溉', plot: 'Q-06 番茄二号区', taskType: '灌溉', assignee: '李运维', deadline: '2026-11-10', status: '已派单', createTime: '2026-11-03 09:00:00', updateTime: '2026-11-03 09:00:00' },
  { id: 17, orderNo: 'WO-20261106', title: 'H-05 蔬菜试验园整地', plot: 'H-05 蔬菜试验园', taskType: '整地', assignee: '', deadline: '2026-11-15', status: '待派单', createTime: '2026-11-04 16:50:00', updateTime: '2026-11-04 16:50:00' },
  { id: 18, orderNo: 'WO-20261108', title: 'Q-02 番茄区巡检', plot: 'Q-02 番茄区', taskType: '巡田', assignee: '', deadline: '2026-11-18', status: '待派单', createTime: '2026-11-08 11:20:00', updateTime: '2026-11-08 11:20:00' },
]

// ---- 农事执行台账：18 条 ----
export const farmRecords = [
  { id: 1, orderNo: 'WO-20260901', plot: 'A-01 大田', taskType: '整地', worker: '王建国', workHours: 6.0, materials: '旋耕机 1 台班，平整土地 120 亩', images: [], recordTime: '2026-09-14 16:20:00', createTime: '2026-09-14 16:20:00' },
  { id: 2, orderNo: 'WO-20260903', plot: 'A-01 大田', taskType: '采收', worker: '王建国', workHours: 8.0, materials: '联合收割机 1 台班，运输车 2 趟', images: [], recordTime: '2026-09-26 18:10:00', createTime: '2026-09-26 18:10:00' },
  { id: 3, orderNo: 'WO-20260905', plot: 'A-02 蔬菜大棚区', taskType: '施肥', worker: '陈农艺', workHours: 3.5, materials: '复合肥 45kg，有机水溶肥 12kg', images: [], recordTime: '2026-09-20 10:30:00', createTime: '2026-09-20 10:30:00' },
  { id: 4, orderNo: 'WO-20260910', plot: 'B-01 葡萄园', taskType: '施肥', worker: '刘星鑫', workHours: 4.0, materials: '葡萄专用复合肥 60kg', images: [], recordTime: '2026-09-28 15:40:00', createTime: '2026-09-28 15:40:00' },
  { id: 5, orderNo: 'WO-20260915', plot: 'B-02 草莓园', taskType: '播种', worker: '赵小敏', workHours: 5.5, materials: '草莓种苗 3200 株，育苗基质 18 袋', images: [], recordTime: '2026-10-03 17:05:00', createTime: '2026-10-03 17:05:00' },
  { id: 6, orderNo: 'WO-20260920', plot: 'Q-01 叶菜区', taskType: '播种', worker: '刘星鑫', workHours: 4.5, materials: '生菜种子 6kg，育苗基质 20 袋', images: [], recordTime: '2026-10-07 16:50:00', createTime: '2026-10-07 16:50:00' },
  { id: 7, orderNo: 'WO-20261002', plot: 'A-02 蔬菜大棚区', taskType: '打药', worker: '陈农艺', workHours: 2.5, materials: '45% 代森锰锌 1.8kg，喷雾机 1 台', images: [], recordTime: '2026-10-10 09:45:00', createTime: '2026-10-10 09:45:00' },
  { id: 8, orderNo: 'WO-20261008', plot: 'Q-03 黄瓜区', taskType: '除草', worker: '陈农艺', workHours: 3.0, materials: '人工除草，清运杂草 6 车', images: [], recordTime: '2026-10-22 11:20:00', createTime: '2026-10-22 11:20:00' },
  { id: 9, orderNo: 'WO-20261012', plot: 'B-02 草莓园', taskType: '灌溉', worker: '李运维', workHours: 2.0, materials: '水肥一体机滴灌 2 小时，用水 18m³', images: [], recordTime: '2026-10-18 14:30:00', createTime: '2026-10-18 14:30:00' },
  { id: 10, orderNo: 'WO-20261018', plot: 'Q-04 西兰花区', taskType: '施肥', worker: '陈农艺', workHours: 3.5, materials: '尿素 25kg，有机水溶肥 10kg', images: [], recordTime: '2026-11-03 10:10:00', createTime: '2026-11-03 10:10:00' },
  { id: 11, orderNo: 'WO-20261022', plot: 'H-01 苹果园', taskType: '巡田', worker: '赵小敏', workHours: 2.0, materials: '巡田记录，发现少量蚜虫', images: [], recordTime: '2026-11-04 16:15:00', createTime: '2026-11-04 16:15:00' },
  { id: 12, orderNo: 'WO-20261026', plot: 'H-02 苹果二号园', taskType: '除草', worker: '周运维', workHours: 4.0, materials: '割草机 1 台班，清运杂草 4 车', images: [], recordTime: '2026-11-06 17:30:00', createTime: '2026-11-06 17:30:00' },
  { id: 13, orderNo: 'WO-20261030', plot: 'Q-05 叶菜二号区', taskType: '播种', worker: '刘星鑫', workHours: 4.0, materials: '生菜种子 5kg，育苗基质 16 袋', images: [], recordTime: '2026-11-08 15:25:00', createTime: '2026-11-08 15:25:00' },
  { id: 14, orderNo: 'WO-20261101', plot: 'H-03 葡萄园', taskType: '采收', worker: '周运维', workHours: 6.5, materials: '采收筐 120 个，运输车 3 趟', images: [], recordTime: '2026-11-09 08:40:00', createTime: '2026-11-09 08:40:00' },
  { id: 15, orderNo: 'WO-20260905', plot: 'Q-02 番茄区', taskType: '灌溉', worker: '李运维', workHours: 1.5, materials: '滴灌 1.5 小时，用水 12m³', images: [], recordTime: '2026-09-22 09:10:00', createTime: '2026-09-22 09:10:00' },
  { id: 16, orderNo: 'WO-20260920', plot: 'H-04 草莓园', taskType: '打药', worker: '赵小敏', workHours: 2.0, materials: '25% 吡虫啉 0.5kg', images: [], recordTime: '2026-09-29 10:00:00', createTime: '2026-09-29 10:00:00' },
  { id: 17, orderNo: 'WO-20261008', plot: 'Q-06 番茄二号区', taskType: '整地', worker: '刘星鑫', workHours: 3.0, materials: '微耕机 1 台班', images: [], recordTime: '2026-10-09 14:20:00', createTime: '2026-10-09 14:20:00' },
  { id: 18, orderNo: 'WO-20261018', plot: 'H-05 蔬菜试验园', taskType: '巡田', worker: '陈农艺', workHours: 1.5, materials: '巡田记录，土壤墒情正常', images: [], recordTime: '2026-11-07 09:35:00', createTime: '2026-11-07 09:35:00' },
]

// ---- 农资采购：12 条，累计采购额 43630 元 ----
export const farmPurchases = [
  { id: 1, purchaseNo: 'CG-20260903', material: '复合肥（15-15-15）', supplier: '重庆沃土农资有限公司', quantity: 60, unit: '袋', unitPrice: 128, amount: 7680, purchaser: '王建国', purchaseTime: '2026-09-03 09:20:00', createTime: '2026-09-03 09:20:00' },
  { id: 2, purchaseNo: 'CG-20260908', material: '水稻种子（宜香优）', supplier: '川渝种业有限公司', quantity: 30, unit: '袋', unitPrice: 96, amount: 2880, purchaser: '王建国', purchaseTime: '2026-09-08 10:40:00', createTime: '2026-09-08 10:40:00' },
  { id: 3, purchaseNo: 'CG-20260915', material: '草莓专用水溶肥', supplier: '重庆沃土农资有限公司', quantity: 40, unit: '袋', unitPrice: 68, amount: 2720, purchaser: '陈农艺', purchaseTime: '2026-09-15 14:10:00', createTime: '2026-09-15 14:10:00' },
  { id: 4, purchaseNo: 'CG-20260922', material: '45% 代森锰锌可湿性粉剂', supplier: '渝北植保物资站', quantity: 50, unit: '袋', unitPrice: 22, amount: 1100, purchaser: '陈农艺', purchaseTime: '2026-09-22 09:30:00', createTime: '2026-09-22 09:30:00' },
  { id: 5, purchaseNo: 'CG-20261005', material: '有机水溶肥', supplier: '重庆沃土农资有限公司', quantity: 35, unit: '桶', unitPrice: 156, amount: 5460, purchaser: '刘星鑫', purchaseTime: '2026-10-05 11:00:00', createTime: '2026-10-05 11:00:00' },
  { id: 6, purchaseNo: 'CG-20261012', material: '25% 吡虫啉可湿性粉剂', supplier: '渝北植保物资站', quantity: 60, unit: '袋', unitPrice: 18, amount: 1080, purchaser: '李运维', purchaseTime: '2026-10-12 15:20:00', createTime: '2026-10-12 15:20:00' },
  { id: 7, purchaseNo: 'CG-20261019', material: '番茄种子（红宝石）', supplier: '川渝种业有限公司', quantity: 20, unit: '罐', unitPrice: 210, amount: 4200, purchaser: '陈农艺', purchaseTime: '2026-10-19 10:15:00', createTime: '2026-10-19 10:15:00' },
  { id: 8, purchaseNo: 'CG-20261026', material: '育苗基质', supplier: '重庆沃土农资有限公司', quantity: 80, unit: '袋', unitPrice: 32, amount: 2560, purchaser: '刘星鑫', purchaseTime: '2026-10-26 14:45:00', createTime: '2026-10-26 14:45:00' },
  { id: 9, purchaseNo: 'CG-20261101', material: '72% 霜脲·锰锌', supplier: '渝北植保物资站', quantity: 40, unit: '袋', unitPrice: 38, amount: 1520, purchaser: '周运维', purchaseTime: '2026-11-01 09:05:00', createTime: '2026-11-01 09:05:00' },
  { id: 10, purchaseNo: 'CG-20261103', material: '尿素', supplier: '重庆沃土农资有限公司', quantity: 50, unit: '袋', unitPrice: 115, amount: 5750, purchaser: '王建国', purchaseTime: '2026-11-03 16:30:00', createTime: '2026-11-03 16:30:00' },
  { id: 11, purchaseNo: 'CG-20261105', material: '灌溉滴灌带', supplier: '渝北节水灌溉工程部', quantity: 20, unit: '卷', unitPrice: 260, amount: 5200, purchaser: '李运维', purchaseTime: '2026-11-05 10:20:00', createTime: '2026-11-05 10:20:00' },
  { id: 12, purchaseNo: 'CG-20261108', material: '水果黄瓜种子', supplier: '川渝种业有限公司', quantity: 24, unit: '罐', unitPrice: 145, amount: 3480, purchaser: '赵小敏', purchaseTime: '2026-11-08 11:40:00', createTime: '2026-11-08 11:40:00' },
]

// ---- 采收批次：14 批，产量合计 38500kg（与 dashboardStats.totalYield 一致） ----
export const farmHarvest = [
  { id: 1, batchNo: 'HV-20260901', plot: 'A-01 大田', crop: '水稻', harvestDate: '2026-09-02', gradeA: 2300, gradeB: 800, gradeC: 200, createTime: '2026-09-02 18:30:00' },
  { id: 2, batchNo: 'HV-20260908', plot: 'A-01 大田', crop: '水稻', harvestDate: '2026-09-08', gradeA: 2100, gradeB: 700, gradeC: 200, createTime: '2026-09-08 17:20:00' },
  { id: 3, batchNo: 'HV-20260915', plot: 'A-02 蔬菜大棚区', crop: '番茄', harvestDate: '2026-09-15', gradeA: 1600, gradeB: 750, gradeC: 250, createTime: '2026-09-15 16:40:00' },
  { id: 4, batchNo: 'HV-20260922', plot: 'A-02 蔬菜大棚区', crop: '番茄', harvestDate: '2026-09-22', gradeA: 1450, gradeB: 700, gradeC: 250, createTime: '2026-09-22 15:10:00' },
  { id: 5, batchNo: 'HV-20260928', plot: 'B-01 葡萄园', crop: '葡萄', harvestDate: '2026-09-28', gradeA: 1300, gradeB: 650, gradeC: 250, createTime: '2026-09-28 18:00:00' },
  { id: 6, batchNo: 'HV-20261003', plot: 'B-01 葡萄园', crop: '葡萄', harvestDate: '2026-10-03', gradeA: 1150, gradeB: 600, gradeC: 250, createTime: '2026-10-03 17:30:00' },
  { id: 7, batchNo: 'HV-20261008', plot: 'B-02 草莓园', crop: '草莓', harvestDate: '2026-10-08', gradeA: 1050, gradeB: 550, gradeC: 200, createTime: '2026-10-08 16:10:00' },
  { id: 8, batchNo: 'HV-20261012', plot: 'B-02 草莓园', crop: '草莓', harvestDate: '2026-10-12', gradeA: 980, gradeB: 520, gradeC: 200, createTime: '2026-10-12 17:50:00' },
  { id: 9, batchNo: 'HV-20261018', plot: 'Q-01 叶菜区', crop: '生菜', harvestDate: '2026-10-18', gradeA: 1250, gradeB: 650, gradeC: 200, createTime: '2026-10-18 15:40:00' },
  { id: 10, batchNo: 'HV-20261022', plot: 'Q-03 黄瓜区', crop: '黄瓜', harvestDate: '2026-10-22', gradeA: 1500, gradeB: 800, gradeC: 300, createTime: '2026-10-22 16:20:00' },
  { id: 11, batchNo: 'HV-20261028', plot: 'Q-04 西兰花区', crop: '西兰花', harvestDate: '2026-10-28', gradeA: 1300, gradeB: 750, gradeC: 250, createTime: '2026-10-28 15:50:00' },
  { id: 12, batchNo: 'HV-20261102', plot: 'H-01 苹果园', crop: '苹果', harvestDate: '2026-11-02', gradeA: 1900, gradeB: 950, gradeC: 350, createTime: '2026-11-02 17:10:00' },
  { id: 13, batchNo: 'HV-20261105', plot: 'H-02 苹果二号园', crop: '苹果', harvestDate: '2026-11-05', gradeA: 2200, gradeB: 1100, gradeC: 500, createTime: '2026-11-05 16:30:00' },
  { id: 14, batchNo: 'HV-20261109', plot: 'H-03 葡萄园', crop: '葡萄', harvestDate: '2026-11-09', gradeA: 3300, gradeB: 1600, gradeC: 600, createTime: '2026-11-09 08:50:00' },
]

/* ==================== 农业专家与病虫害知识库模块 ==================== */
// 口径说明：
// 1. 专家、文章、病虫害均围绕平台已有的三大园区作物（水稻、番茄、黄瓜、生菜、草莓、苹果、葡萄、西兰花）组织；
// 2. 陈农艺与系统用户档案中的「陈农艺（农技中心 · 农技人员）」为同一人；
// 3. 每篇知识文章关联一位专家，专家的文章数、总阅读量由文章数据实时汇总；
// 4. 每种病虫害内置一套防治方案，方案库页面的方案总数与病虫害数量保持一致。

export const knowledgeFields = ['植物保护', '土壤肥料', '设施园艺', '智慧农业', '农技推广', '农产品质量安全']

export const knowledgeCategories = [
  { id: 'K01', name: '种植技术', description: '粮食、蔬菜、果树的栽培与田间管理技术' },
  { id: 'K02', name: '病虫害防治', description: '病虫害识别、监测预警与绿色防控方案' },
  { id: 'K03', name: '水肥管理', description: '水肥一体化、灌溉施肥与节水节肥技术' },
  { id: 'K04', name: '土壤改良', description: '土壤培肥、酸化治理与有机肥替代技术' },
  { id: 'K05', name: '设施园艺', description: '大棚、温室环境调控与设施栽培技术' },
  { id: 'K06', name: '农产品质量安全', description: '农残检测、质量追溯与安全生产规范' },
]

export const knowledgeExperts = [
  {
    id: 'E001', name: '陈农艺', title: '高级农艺师', field: '植物保护',
    organization: '重庆市农业技术推广总站', years: 20,
    specialty: '稻瘟病、蔬菜灰霉病绿色防控',
    intro: '长期从事农作物病虫害监测预警与绿色防控技术推广，主持编制多项水稻、蔬菜病虫害防治技术方案，常年服务基层种植户。',
    phone: '13800000005', email: 'chenny@samp.com',
    status: '已入驻', joinTime: '2026-03-18 09:30:00', avatar: '',
  },
  {
    id: 'E002', name: '周明远', title: '研究员', field: '土壤肥料',
    organization: '西南大学资源环境学院', years: 26,
    specialty: '土壤酸化改良、有机肥替代化肥',
    intro: '研究方向为农业资源利用与土壤质量提升，承担多项耕地质量保护项目，在丘陵山区土壤培肥方面经验丰富。',
    phone: '13900002002', email: 'zhoumy@swu.edu.cn',
    status: '已入驻', joinTime: '2026-04-10 14:20:00', avatar: '',
  },
  {
    id: 'E003', name: '李慧芳', title: '副教授', field: '设施园艺',
    organization: '重庆农业大学园艺学院', years: 18,
    specialty: '设施蔬菜环境调控、草莓设施栽培',
    intro: '专注设施园艺教学与科研，擅长大棚温湿度调控、冬季补光与设施草莓优质高产栽培技术。',
    phone: '13900002003', email: 'lihf@cqau.edu.cn',
    status: '已入驻', joinTime: '2026-05-06 10:00:00', avatar: '',
  },
  {
    id: 'E004', name: '张国强', title: '高级工程师', field: '智慧农业',
    organization: '重庆市农业信息中心', years: 15,
    specialty: '农业物联网、水肥一体化系统集成',
    intro: '负责农业物联网平台建设与设备集成，熟悉环境传感器、智能控制与水肥一体化系统的部署与运维。',
    phone: '13900002004', email: 'zhanggq@cqagri.cn',
    status: '已入驻', joinTime: '2026-06-12 09:15:00', avatar: '',
  },
  {
    id: 'E005', name: '王秀兰', title: '研究员', field: '农产品质量安全',
    organization: '重庆市农产品质量安全检测中心', years: 22,
    specialty: '农残快速检测、质量追溯体系',
    intro: '长期从事农产品质量安全检测与风险评估，参与制定蔬菜农残快检操作规程与追溯管理规范。',
    phone: '13900002005', email: 'wangxl@cqaqs.cn',
    status: '已入驻', joinTime: '2026-07-01 15:40:00', avatar: '',
  },
  {
    id: 'E006', name: '刘志刚', title: '推广研究员', field: '农技推广',
    organization: '渝北区农业技术推广站', years: 24,
    specialty: '水稻机械化种植、丘陵山区农技推广',
    intro: '扎根基层农技推广一线，熟悉水稻集中育秧、机械化插秧与丘陵山区轻简化栽培技术。',
    phone: '13900002006', email: 'liuzg@ybny.cn',
    status: '已入驻', joinTime: '2026-08-09 11:10:00', avatar: '',
  },
  {
    id: 'E007', name: '赵敏', title: '副研究员', field: '植物保护',
    organization: '重庆市植物保护站', years: 14,
    specialty: '果树病虫害、科学安全用药',
    intro: '从事果树及蔬菜病虫害测报与防治指导，主推生物农药与理化诱控相结合的绿色防控模式。',
    phone: '13900002007', email: 'zhaomin@cqpp.cn',
    status: '已入驻', joinTime: '2026-09-02 08:50:00', avatar: '',
  },
  {
    id: 'E008', name: '孙立新', title: '高级农艺师', field: '土壤肥料',
    organization: '重庆土壤肥料工作站', years: 19,
    specialty: '测土配方施肥、有机肥资源化利用',
    intro: '负责测土配方施肥技术推广，擅长根据土壤检测结果制定差异化施肥方案。',
    phone: '13900002008', email: 'sunlx@cqtf.cn',
    status: '已入驻', joinTime: '2026-09-20 16:30:00', avatar: '',
  },
  {
    id: 'E009', name: '何晓梅', title: '高级农艺师', field: '设施园艺',
    organization: '巴南区农业技术推广中心', years: 16,
    specialty: '设施蔬菜栽培、病虫害绿色防控',
    intro: '从事设施蔬菜栽培技术指导，擅长番茄、黄瓜大棚生产管理与病虫害综合防控。',
    phone: '13900002009', email: 'hexm@bnny.cn',
    status: '待审核', joinTime: '2026-11-02 10:20:00', avatar: '',
  },
  {
    id: 'E010', name: '邓文博', title: '工程师', field: '智慧农业',
    organization: '花溪生态果园', years: 9,
    specialty: '果园物联网监测、水肥一体化运维',
    intro: '负责花溪生态果园物联网设备与水肥一体化系统运维，熟悉果园环境监测与远程控制。',
    phone: '13900002010', email: 'dengwb@hxgy.cn',
    status: '待审核', joinTime: '2026-11-04 15:00:00', avatar: '',
  },
]

export const knowledgeArticles = [
  {
    id: 'A001', title: '水稻稻瘟病识别与综合防治技术', category: '病虫害防治', expertId: 'E001',
    summary: '从苗瘟、叶瘟、穗颈瘟的田间症状入手，讲解稻瘟病发生规律与「选用抗病品种 + 科学水肥 + 关键期用药」的综合防治思路。',
    content: '稻瘟病是水稻生产上危害最重的真菌性病害之一，按发病部位分为苗瘟、叶瘟、节瘟、穗颈瘟和谷粒瘟。叶瘟典型症状为梭形病斑，中央灰白色、边缘褐色，外围有黄色晕圈；穗颈瘟则造成穗颈变褐、白穗甚至绝收。\n防治上应优先选用抗病品种，避免偏施氮肥，浅水勤灌、适时晒田；在分蘖期和破口抽穗期两个关键节点，可选用三环唑、稻瘟灵等药剂预防，阴雨天气前后及时补防。',
    tags: ['水稻', '稻瘟病', '真菌病害'], publishTime: '2026-10-28 09:40:00', views: 1286,
    status: '已发布', recommend: true, auditRemark: '内容完整，可作为病虫害防治专题的首篇推荐。',
  },
  {
    id: 'A002', title: '大棚番茄灰霉病的发生规律与绿色防控', category: '病虫害防治', expertId: 'E007',
    summary: '针对设施番茄低温高湿环境，梳理灰霉病的侵染循环，给出控温控湿、清除病残体与生物农药交替使用的防控组合。',
    content: '灰霉病在设施番茄上多发于冬春季节，低温高湿、通风不良时最易流行。病菌从残花、伤口侵入，果实受害后出现水渍状灰褐色病斑，表面覆盖灰霉层并迅速腐烂。\n防控核心是「降湿、控温、除残花」：晴天上午及时通风排湿，采用膜下滴灌避免大水漫灌；及时摘除病果、病叶和残留花瓣；发病初期可选用木霉菌、啶酰菌胺等药剂，注意轮换用药以延缓抗性。',
    tags: ['番茄', '灰霉病', '设施栽培'], publishTime: '2026-10-26 14:10:00', views: 986,
    status: '已发布', recommend: true, auditRemark: '',
  },
  {
    id: 'A003', title: '设施草莓白粉病防治要点', category: '病虫害防治', expertId: 'E001',
    summary: '结合南山大棚草莓生产实际，介绍白粉病的症状识别、发病条件以及硫磺熏蒸、生物防治等绿色防控措施。',
    content: '草莓白粉病主要危害叶片、叶柄和果实。叶片受害后叶背出现白色粉状霉层，叶片向上卷曲；果实受害后表面覆白粉，失去商品价值。\n大棚内温度 15-25℃、湿度 80% 以上时发病迅速。防治上应控制氮肥用量、增施磷钾肥，及时摘除老叶病叶；可选用硫磺熏蒸器夜间处理，发病初期使用枯草芽孢杆菌、醚菌酯等药剂交替喷雾。',
    tags: ['草莓', '白粉病', '绿色防控'], publishTime: '2026-10-22 10:30:00', views: 1120,
    status: '已发布', recommend: true, auditRemark: '',
  },
  {
    id: 'A004', title: '果园蚜虫综合防治与科学用药', category: '病虫害防治', expertId: 'E007',
    summary: '总结苹果、葡萄园蚜虫的发生规律，介绍黄板诱杀、天敌保护和低毒药剂轮换使用的综合防治方案。',
    content: '蚜虫喜聚集在果树新梢、嫩叶背面吸食汁液，受害叶片卷曲变形，同时诱发煤污病并传播病毒病。春季 3-5 月和秋季 9-11 月为发生高峰。\n防治上可在果园悬挂黄色粘虫板诱杀有翅蚜，保护瓢虫、草蛉等天敌；化学防治应选择吡虫啉、啶虫脒等低毒药剂，避免单一药剂连续使用。',
    tags: ['苹果', '葡萄', '蚜虫'], publishTime: '2026-10-18 15:20:00', views: 742,
    status: '已发布', recommend: false, auditRemark: '',
  },
  {
    id: 'A005', title: '水肥一体化滴灌系统运行与维护', category: '水肥管理', expertId: 'E004',
    summary: '从首部过滤、施肥泵、田间管网三个环节讲清滴灌系统的日常巡检、清洗与故障排查方法。',
    content: '水肥一体化系统由水源、过滤设备、施肥泵、主管网和滴灌带组成。日常运行需重点关注过滤器的压差，压差超过 0.1MPa 时应及时反冲洗。\n每次施肥结束后用清水冲洗管网 20-30 分钟，防止肥料残留堵塞滴头；冬季停用前应排空管道积水，检查滴灌带是否存在堵塞、破损。',
    tags: ['水肥一体化', '滴灌', '设备维护'], publishTime: '2026-10-15 09:00:00', views: 658,
    status: '已发布', recommend: false, auditRemark: '',
  },
  {
    id: 'A006', title: '土壤酸化改良与有机肥施用技术', category: '土壤改良', expertId: 'E002',
    summary: '针对长期过量施肥导致的土壤酸化，给出石灰调酸、有机肥替代与绿肥轮作的技术组合。',
    content: '土壤 pH 值低于 5.5 时，作物根系吸收能力下降，重金属活性增强。酸化改良应根据土壤检测结果确定石灰用量，一般每亩施用生石灰 50-100kg，配合深翻整地。\n有机肥替代方面，可在基肥中按 20%-30% 的比例用商品有机肥替代化肥，并与绿肥轮作、秸秆还田结合，逐步提升土壤有机质含量。',
    tags: ['土壤酸化', '有机肥', '测土配方'], publishTime: '2026-10-12 11:00:00', views: 534,
    status: '已发布', recommend: false, auditRemark: '',
  },
  {
    id: 'A007', title: '冬季大棚温湿度调控与病害预防', category: '设施园艺', expertId: 'E003',
    summary: '讲解冬季大棚保温、通风、补光的协调策略，以及低温高湿环境下常见病害的预防要点。',
    content: '冬季大棚管理的关键是「保温不闷棚、通风不降温」。晴天上午棚温升至 25℃左右时开始通风，下午棚温降至 20℃前关闭风口，保持夜间温度不低于 8℃。\n连续阴雨天气可使用补光灯，并在中午短时通风排湿；避免傍晚浇水，减少夜间棚内湿度，可显著降低灰霉病、霜霉病发生概率。',
    tags: ['大棚', '温湿度', '冬季管理'], publishTime: '2026-10-09 08:30:00', views: 893,
    status: '已发布', recommend: false, auditRemark: '',
  },
  {
    id: 'A008', title: '蔬菜农残快检与质量安全控制', category: '农产品质量安全', expertId: 'E005',
    summary: '介绍上市前农残快检的抽样方法、结果判定与不合格处置流程，帮助园区建立质量安全闭环。',
    content: '蔬菜上市前应按批次抽样，重点检测有机磷类、氨基甲酸酯类农药残留。快检结果呈阳性的批次应暂停采收，复检确认后按不合格品处置。\n园区应建立投入品采购、用药记录、采收检测三级台账，做到「批批检、可追溯」，并将检测结果与销售订单绑定。',
    tags: ['农残检测', '质量追溯', '蔬菜'], publishTime: '2026-10-05 16:00:00', views: 466,
    status: '已发布', recommend: false, auditRemark: '',
  },
  {
    id: 'A009', title: '丘陵山区水稻机械化插秧技术要点', category: '种植技术', expertId: 'E006',
    summary: '总结集中育秧、适龄移栽、机插参数调整等关键环节，适用于重庆丘陵山区水稻生产。',
    content: '丘陵山区田块小、落差大，机插前应做好田面平整与泥浆沉淀，沉淀时间一般 1-2 天。秧苗以 3-4 叶龄、苗高 15-18cm 为宜。\n机插时根据田块泥脚深度调整插秧深度，一般控制在 2-3cm，避免漂秧或深插；插后保持浅水层促进返青。',
    tags: ['水稻', '机械化插秧', '丘陵山区'], publishTime: '2026-09-28 10:15:00', views: 389,
    status: '已发布', recommend: false, auditRemark: '',
  },
  {
    id: 'A010', title: '有机肥替代化肥的配比与效果评估', category: '土壤改良', expertId: 'E008',
    summary: '给出不同作物的有机肥替代比例建议，并介绍土壤有机质、产量与品质三类评估指标。',
    content: '有机肥替代化肥的比例应结合作物需肥规律与土壤肥力确定，蔬菜类一般可替代 20%-30% 的氮肥用量，果树可适当提高至 30%-40%。\n效果评估可从土壤有机质提升、产量稳定性、果实品质三个方面开展，建议每季采集土壤样品检测，连续跟踪 2-3 年。',
    tags: ['有机肥', '化肥减量', '土壤培肥'], publishTime: '2026-09-20 14:40:00', views: 418,
    status: '已发布', recommend: false, auditRemark: '',
  },
  {
    id: 'A011', title: '农业物联网设备选型与部署指南', category: '种植技术', expertId: 'E004',
    summary: '从监测参数、通信方式、供电条件三方面给出园区物联网设备选型建议与部署注意事项。',
    content: '园区部署环境监测设备时，应根据作物类型确定监测参数。蔬菜大棚重点监测空气温湿度、二氧化碳浓度和土壤墒情；果园重点监测气温、降雨量和光照。\n通信方式可根据现场条件选择 4G、LoRa 或以太网，供电优先采用太阳能加蓄电池组合，设备安装应避开强电磁干扰源。',
    tags: ['物联网', '传感器', '设备选型'], publishTime: '2026-11-03 11:30:00', views: 0,
    status: '待审核', recommend: false, auditRemark: '',
  },
  {
    id: 'A012', title: '花溪果园病虫害绿色防控年度方案', category: '病虫害防治', expertId: 'E009',
    summary: '结合花溪生态果园苹果、葡萄、梨的物候期，编制全年绿色防控节点与用药计划。',
    content: '方案按休眠期、萌芽期、花期、幼果期、采收后五个阶段安排防控重点：休眠期做好清园与枝干涂白，萌芽期重点防治腐烂病，花期保护天敌避免用药，幼果期以套袋与理化诱控为主。\n全年优先采用性诱剂、黄板、杀虫灯等物理措施，化学防治严格遵循安全间隔期，采收前 30 天停止使用化学农药。',
    tags: ['苹果', '葡萄', '绿色防控'], publishTime: '2026-11-05 09:20:00', views: 0,
    status: '待审核', recommend: false, auditRemark: '',
  },
  {
    id: 'A013', title: '春季番茄育苗与壮苗培育技术', category: '种植技术', expertId: 'E003',
    summary: '围绕播期确定、基质配比、温光管理和苗期病害预防，介绍春季番茄壮苗培育的关键措施。',
    content: '春季番茄育苗应根据定植期倒推播期，苗龄一般 45-55 天。基质可按草炭、蛭石、珍珠岩 2:1:1 配制，播前浇透底水。\n出苗后白天温度控制在 22-25℃，夜间 13-15℃，保证充足光照，避免徒长；苗期注意预防猝倒病与立枯病。',
    tags: ['番茄', '育苗', '壮苗'], publishTime: '2026-11-06 10:00:00', views: 0,
    status: '草稿', recommend: false, auditRemark: '',
  },
]

// ---- 病虫害图库与防治方案 ----
// 每条病虫害内置一套防治方案，plan.drugs 为推荐用药清单（剂量与安全间隔期）
export const pestLibrary = [
  {
    id: 'PST001', name: '稻瘟病', type: '病害', alias: '稻热病', crops: '水稻',
    severity: '高', season: '6-9 月', region: '南山智慧农业示范园、清水有机蔬菜基地稻田',
    feature: '病原为稻梨孢菌。叶瘟病斑呈梭形，中央灰白色、边缘褐色，外围有黄色晕圈；穗颈瘟病部变褐，易折断。',
    symptom: '叶片出现梭形病斑并连片枯死，严重时全叶枯黄；穗颈受害后形成白穗，籽粒瘪谷率显著上升，一般减产 10%-30%。',
    rule: '病菌以菌丝或分生孢子在病稻草、病谷上越冬，翌年随气流传播。分蘖期至抽穗期遇连续阴雨、日照不足、氮肥偏多时易暴发流行。',
    plan: {
      principle: '坚持「预防为主、综合防治」，以抗病品种和栽培管理为基础，关键生育期精准用药。',
      agri: '选用抗病品种；合理密植，避免偏施氮肥，增施磷钾肥；浅水勤灌、适时晒田，降低田间湿度。',
      physical: '及时清除病稻草和病残体，集中处理；种子播前用清水选种、温汤浸种，减少初侵染源。',
      biological: '使用枯草芽孢杆菌、春雷霉素等生物制剂预防；保护田间有益微生物群落，减少化学药剂依赖。',
      drugs: [
        { name: '75% 三环唑可湿性粉剂', dosage: '每亩 20-30g，兑水 50kg 均匀喷雾', interval: '安全间隔期 21 天' },
        { name: '40% 稻瘟灵乳油', dosage: '每亩 100-150ml，兑水 50kg 喷雾', interval: '安全间隔期 28 天' },
      ],
      note: '破口抽穗期是防治关键窗口，阴雨前后应及时补防；同一药剂每季使用不超过 2 次。',
    },
  },
  {
    id: 'PST002', name: '番茄灰霉病', type: '病害', alias: '灰霉', crops: '番茄',
    severity: '高', season: '12 月-次年 4 月', region: '南山智慧农业示范园番茄大棚',
    feature: '病原为灰葡萄孢菌。病部表面覆盖灰褐色霉层，霉层由大量分生孢子梗和分生孢子组成。',
    symptom: '果实受害后出现水渍状灰褐色病斑并迅速腐烂，表面生灰霉；叶片病斑呈 V 形扩展，花器受害后干枯脱落。',
    rule: '病菌在病残体和土壤中越冬，低温高湿、通风不良时易流行。大棚内相对湿度 85% 以上、温度 15-23℃ 时发病最快。',
    plan: {
      principle: '以控温降湿、清除病残体为核心，发病初期优先使用生物农药，化学防治注意轮换。',
      agri: '选用无病壮苗；膜下滴灌，避免大水漫灌；及时摘除残花、病果、病叶并带出棚外处理。',
      physical: '晴天上午及时通风排湿，棚温保持 25℃ 左右；地面覆盖地膜减少水分蒸发。',
      biological: '使用木霉菌、枯草芽孢杆菌等生物制剂喷雾，发病初期每 7-10 天一次，连续 2-3 次。',
      drugs: [
        { name: '50% 啶酰菌胺水分散粒剂', dosage: '每亩 30-40g，兑水 45kg 喷雾', interval: '安全间隔期 7 天' },
        { name: '40% 嘧霉胺悬浮剂', dosage: '每亩 60-80ml，兑水 45kg 喷雾', interval: '安全间隔期 10 天' },
      ],
      note: '灰霉病菌易产生抗药性，应交替使用不同作用机理的药剂，每季同一药剂不超过 2 次。',
    },
  },
  {
    id: 'PST003', name: '草莓白粉病', type: '病害', alias: '白粉', crops: '草莓',
    severity: '中', season: '11 月-次年 4 月', region: '南山智慧农业示范园草莓大棚',
    feature: '病原为羽衣草单囊壳菌。叶背及果实表面产生白色粉状霉层，后期霉层中形成黑色闭囊壳。',
    symptom: '叶片受害后向上卷曲，叶背覆白粉；花器受害影响坐果，果实表面覆白粉后失去商品价值。',
    rule: '病菌以菌丝在病叶越冬，靠气流传播。棚内温度 15-25℃、湿度 80% 以上、光照不足时发病迅速。',
    plan: {
      principle: '以农业防治和物理调控为基础，发病初期使用生物制剂与低毒药剂交替控制。',
      agri: '控制氮肥用量，增施磷钾肥增强抗性；及时摘除老叶、病叶，保持棚内通风透光。',
      physical: '夜间使用硫磺熏蒸器处理，每次 2-3 小时；控制棚内湿度，避免夜间叶面结露。',
      biological: '喷施枯草芽孢杆菌、多抗霉素等生物农药，保护花器与幼果。',
      drugs: [
        { name: '25% 醚菌酯悬浮剂', dosage: '每亩 40-60ml，兑水 45kg 喷雾', interval: '安全间隔期 7 天' },
        { name: '50% 硫磺悬浮剂', dosage: '每亩 150-200g，兑水 50kg 喷雾', interval: '安全间隔期 10 天' },
      ],
      note: '草莓花期慎用化学药剂，优先在花前花后用药，采收期严格执行安全间隔期。',
    },
  },
  {
    id: 'PST004', name: '黄瓜霜霉病', type: '病害', alias: '跑马干', crops: '黄瓜',
    severity: '高', season: '3-5 月、9-11 月', region: '清水有机蔬菜基地黄瓜大棚',
    feature: '病原为古巴假霜霉菌。叶背病斑处长出灰黑色霉层，叶面病斑受叶脉限制呈多角形。',
    symptom: '叶片出现黄绿色多角形病斑，后期变褐干枯，严重时全叶枯死，植株提早拉秧。',
    rule: '病菌靠气流和雨水传播，适宜温度 16-24℃。昼夜温差大、夜间结露时间长、通风不良时易流行。',
    plan: {
      principle: '以调控棚内温湿度为核心，结合清除病叶和关键期用药。',
      agri: '选用抗病品种；起垄覆膜栽培，膜下滴灌；及时摘除下部病叶，改善通风条件。',
      physical: '晴天上午高温闷棚至 30-32℃ 维持 2 小时，随后逐步通风降温，抑制病菌扩展。',
      biological: '使用哈茨木霉菌、氨基寡糖素等诱导抗性，减少化学药剂使用次数。',
      drugs: [
        { name: '72% 霜脲·锰锌可湿性粉剂', dosage: '每亩 100-150g，兑水 50kg 喷雾', interval: '安全间隔期 7 天' },
        { name: '68% 精甲霜·锰锌水分散粒剂', dosage: '每亩 80-100g，兑水 50kg 喷雾', interval: '安全间隔期 10 天' },
      ],
      note: '重点喷施叶背，每隔 7 天一次，连续 2-3 次，注意轮换用药。',
    },
  },
  {
    id: 'PST005', name: '苹果腐烂病', type: '病害', alias: '烂皮病', crops: '苹果',
    severity: '中', season: '3-5 月、9-10 月', region: '花溪生态果园',
    feature: '病原为苹果黑腐皮壳菌。枝干病斑呈红褐色水渍状，皮层腐烂并带有酒糟味，后期病部干缩凹陷。',
    symptom: '枝干皮层腐烂，病斑绕干一周后上部枝条枯死；果实受害出现褐色腐烂斑，影响储藏与销售。',
    rule: '病菌在病树皮和病残体越冬，通过伤口侵入。树势衰弱、冻害、修剪伤口多时发病严重。',
    plan: {
      principle: '以增强树势、保护伤口为重点，刮治病斑与药剂涂抹相结合。',
      agri: '增施有机肥，合理负载，避免大小年；修剪后及时涂抹伤口保护剂。',
      physical: '及时刮除病斑至健康组织，刮下的病皮集中烧毁；冬季树干涂白防冻。',
      biological: '使用木霉菌制剂涂抹病斑，促进伤口愈合，抑制病菌扩展。',
      drugs: [
        { name: '43% 戊唑醇悬浮剂', dosage: '稀释 300 倍液涂抹病斑', interval: '安全间隔期 21 天' },
        { name: '1.2% 辛菌胺醋酸盐涂抹剂', dosage: '原液直接涂抹刮治病斑', interval: '修剪期使用' },
      ],
      note: '刮治后 7-10 天复查，发现病斑扩展需二次涂药；药剂涂抹应超出病斑边缘 2cm。',
    },
  },
  {
    id: 'PST006', name: '葡萄霜霉病', type: '病害', alias: '霜霉', crops: '葡萄',
    severity: '高', season: '6-9 月', region: '花溪生态果园',
    feature: '病原为葡萄生单轴霉。叶背病斑处长出白色霜状霉层，叶片正面出现黄色角斑。',
    symptom: '叶片黄褐色多角形病斑，叶背霜霉层明显；新梢、花序受害后扭曲枯死，果实受害后变褐脱落。',
    rule: '病菌以卵孢子在病残体越冬，借风雨传播。多雨高湿、架面郁闭、通风不良时易流行。',
    plan: {
      principle: '以清园、改善架面通风为基础，雨前雨后关键期用药保护。',
      agri: '及时绑蔓摘心，保持架面通风透光；控制氮肥，增施磷钾肥与钙肥。',
      physical: '秋后彻底清园，清除病叶病果并集中处理；雨季注意排水，降低园区湿度。',
      biological: '使用枯草芽孢杆菌、低聚糖素等生物制剂，提高叶片抗病能力。',
      drugs: [
        { name: '25% 吡唑醚菌酯悬浮剂', dosage: '每亩 30-40ml，兑水 50kg 喷雾', interval: '安全间隔期 14 天' },
        { name: '50% 烯酰吗啉水分散粒剂', dosage: '每亩 40-50g，兑水 50kg 喷雾', interval: '安全间隔期 10 天' },
      ],
      note: '重点保护幼叶和花序，雨前 1-2 天用药效果最佳，雨后及时补喷。',
    },
  },
  {
    id: 'PST007', name: '稻飞虱', type: '虫害', alias: '褐飞虱、白背飞虱', crops: '水稻',
    severity: '高', season: '6-9 月', region: '南山智慧农业示范园、清水有机蔬菜基地稻田',
    feature: '成虫体长 4-5mm，褐色或黄白色，善跳跃；若虫形似成虫，无翅或翅短；群集于稻株基部刺吸汁液。',
    symptom: '稻株基部出现大量虫体，叶片自下而上发黄枯萎，严重时形成「冒穿」枯死团，常伴随煤污病。',
    rule: '成虫具迁飞性，随季风由南向北迁入。高温高湿、偏施氮肥、田间郁闭时虫口密度快速上升，7-9 月为危害高峰。',
    plan: {
      principle: '以监测预警为前提，保护天敌，达标用药、压前控后。',
      agri: '合理密植，避免偏施氮肥；浅水勤灌，适时晒田，降低田间湿度。',
      physical: '稻田安装频振式杀虫灯诱杀成虫；设置黄板监测虫口动态。',
      biological: '保护蜘蛛、青蛙等天敌；可释放赤眼蜂控制虫卵，使用苦参碱等植物源农药。',
      drugs: [
        { name: '25% 吡蚜酮可湿性粉剂', dosage: '每亩 20-30g，兑水 50kg 喷施稻株基部', interval: '安全间隔期 14 天' },
        { name: '10% 烯啶虫胺水剂', dosage: '每亩 30-40ml，兑水 50kg 喷施', interval: '安全间隔期 14 天' },
      ],
      note: '施药时对准稻株中下部，保持田间浅水层 3-5 天以提高防效。',
    },
  },
  {
    id: 'PST008', name: '蚜虫', type: '虫害', alias: '腻虫', crops: '苹果、葡萄、黄瓜、西兰花',
    severity: '中', season: '3-5 月、9-11 月', region: '三大园区均有发生',
    feature: '成虫体长 1.5-3mm，有翅蚜或无翅蚜，绿色、黑色或黄色；群集于嫩梢、嫩叶背面吸食汁液。',
    symptom: '嫩叶卷曲变形，新梢生长受阻；虫体排泄蜜露诱发煤污病，同时传播多种病毒病。',
    rule: '以卵或成蚜在枝干、杂草越冬，春季气温回升后快速繁殖。干旱少雨、天敌数量少时易暴发。',
    plan: {
      principle: '综合治理，优先采用物理诱杀与天敌保护，化学防治达标用药。',
      agri: '清除果园杂草与残枝；合理修剪，改善通风透光；增施钾肥提高植株抗性。',
      physical: '悬挂黄色粘虫板诱杀有翅蚜，每亩 20-30 张；果园安装杀虫灯。',
      biological: '保护瓢虫、草蛉、蚜茧蜂等天敌；使用苦参碱、印楝素等植物源农药。',
      drugs: [
        { name: '10% 吡虫啉可湿性粉剂', dosage: '每亩 20-30g，兑水 50kg 喷雾', interval: '安全间隔期 10 天' },
        { name: '20% 啶虫脒可湿性粉剂', dosage: '每亩 15-20g，兑水 50kg 喷雾', interval: '安全间隔期 7 天' },
      ],
      note: '蚜虫易产生抗性，避免连续使用同一药剂；花期慎用，保护授粉昆虫。',
    },
  },
  {
    id: 'PST009', name: '小菜蛾', type: '虫害', alias: '吊丝虫', crops: '西兰花、生菜、香葱',
    severity: '高', season: '4-6 月、9-11 月', region: '清水有机蔬菜基地',
    feature: '成虫体长 5-7mm，灰褐色，翅面有黄白色波浪状纹；幼虫体长 10-12mm，淡绿色，受惊后吐丝下垂。',
    symptom: '幼虫取食叶片造成孔洞，严重时仅留叶脉；粪便污染菜心，降低商品价值。',
    rule: '成虫具迁飞性，卵产于叶背。气温 20-25℃、干旱少雨时繁殖快，春秋两季为发生高峰。',
    plan: {
      principle: '以理化诱控和生物防治为主，化学防治选择低毒低残留药剂。',
      agri: '合理轮作，避免十字花科蔬菜连作；及时清除残株败叶。',
      physical: '安装性诱剂诱捕器，每亩 3-5 个；覆盖防虫网阻隔成虫产卵。',
      biological: '释放菜蛾盘绒茧蜂；使用苏云金杆菌（Bt）、多角体病毒等生物农药。',
      drugs: [
        { name: '5% 氯虫苯甲酰胺悬浮剂', dosage: '每亩 10-15ml，兑水 45kg 喷雾', interval: '安全间隔期 14 天' },
        { name: '15% 茚虫威悬浮剂', dosage: '每亩 15-20ml，兑水 45kg 喷雾', interval: '安全间隔期 7 天' },
      ],
      note: '幼虫 2-3 龄期是防治最佳时期；喷药重点为叶背和菜心部位。',
    },
  },
  {
    id: 'PST010', name: '红蜘蛛', type: '虫害', alias: '朱砂叶螨', crops: '草莓、黄瓜',
    severity: '中', season: '5-8 月', region: '南山智慧农业示范园、清水有机蔬菜基地',
    feature: '成螨体长约 0.5mm，红褐色，椭圆形；群集叶背刺吸汁液并结丝网，需借助放大镜观察。',
    symptom: '叶片正面出现密集黄白色小点，后期叶片褪绿变黄、干枯脱落；结网明显时影响光合作用。',
    rule: '高温干旱条件下繁殖极快，一年可发生 10 余代；棚内温度 25-30℃、湿度低于 60% 时易暴发。',
    plan: {
      principle: '以环境调控和天敌保护为基础，点片发生时及早挑治。',
      agri: '增施有机肥与钾肥；及时灌溉保持适宜湿度，避免棚内过度干旱。',
      physical: '及时摘除下部受害老叶，集中处理；高温季节适当喷水增湿抑制螨类繁殖。',
      biological: '释放捕食螨（智利小植绥螨）；使用矿物油、苦参碱等低毒制剂。',
      drugs: [
        { name: '24% 螺螨酯悬浮剂', dosage: '每亩 20-30ml，兑水 45kg 喷雾', interval: '安全间隔期 14 天' },
        { name: '5% 阿维菌素乳油', dosage: '每亩 30-40ml，兑水 45kg 喷雾', interval: '安全间隔期 14 天' },
      ],
      note: '重点喷施叶背，药液需覆盖均匀；红蜘蛛抗性上升快，应交替使用不同作用机理药剂。',
    },
  },
]
