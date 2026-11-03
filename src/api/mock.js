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