import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login-center/Login.vue'),
    meta: { title: '登录', public: true },
  },
  {
    path: '/',
    component: () => import('@/views/login-center/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/login-center/Dashboard.vue'),
        meta: { title: '工作台', icon: 'House', permission: 'menu-dashboard' },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/login-center/Profile.vue'),
        meta: { title: '基本资料', icon: 'User', permission: 'menu-profile-info' },
      },
      {
        path: 'profile/password',
        name: 'ChangePassword',
        component: () => import('@/views/login-center/ChangePassword.vue'),
        meta: { title: '修改密码', icon: 'Key', permission: 'menu-profile-pwd' },
      },
      {
        path: 'profile/notifications',
        name: 'NotificationSettings',
        component: () => import('@/views/login-center/NotificationSettings.vue'),
        meta: { title: '消息通知设置', icon: 'Bell', permission: 'menu-profile-notify' },
      },
      {
        path: 'system/users',
        name: 'UserList',
        component: () => import('@/views/login-center/UserList.vue'),
        meta: { title: '用户管理', icon: 'UserFilled', permission: 'menu-system-user' },
      },
      {
        path: 'system/roles',
        name: 'RoleList',
        component: () => import('@/views/login-center/RoleList.vue'),
        meta: { title: '角色管理', icon: 'Avatar', permission: 'menu-system-role' },
      },
      {
        path: 'system/permission',
        name: 'RolePermission',
        component: () => import('@/views/login-center/RolePermission.vue'),
        meta: { title: '角色权限配置', icon: 'Lock', permission: 'btn-role-perm' },
      },
      {
        path: 'system/logs',
        name: 'LogAudit',
        component: () => import('@/views/login-center/LogAudit.vue'),
        meta: { title: '日志审计', icon: 'Document', permission: 'menu-system-log' },
      },
      {
        path: 'system/tenants',
        name: 'TenantManage',
        component: () => import('@/views/login-center/TenantManage.vue'),
        meta: { title: '租户管理', icon: 'OfficeBuilding', permission: 'menu-system-tenant' },
      },
      {
        path: 'data/overview',
        name: 'DataOverview',
        component: () => import('@/views/data-display/DataOverview.vue'),
        meta: { title: '平台数据总览', icon: 'DataAnalysis', permission: 'menu-data-overview' },
      },
      {
        path: 'data/gis-map',
        name: 'GisMap',
        component: () => import('@/views/data-display/GisMap.vue'),
        meta: { title: 'GIS园区地图', icon: 'MapLocation', permission: 'menu-data-gis' },
      },
      {
        path: 'data/realtime',
        name: 'RealtimeData',
        component: () => import('@/views/data-display/RealtimeData.vue'),
        meta: { title: '实时环境数据', icon: 'Odometer', permission: 'menu-data-realtime' },
      },
      {
        path: 'data/water-fertilizer',
        name: 'WaterFertilizerYield',
        component: () => import('@/views/data-display/WaterFertilizerYield.vue'),
        meta: { title: '水肥与产量统计', icon: 'Pouring', permission: 'menu-data-water' },
      },
      {
        path: 'data/device-dashboard',
        name: 'DeviceDashboard',
        component: () => import('@/views/data-display/DeviceDashboard.vue'),
        meta: { title: '设备运维大屏', icon: 'Monitor', permission: 'menu-data-device' },
      },
      {
        path: 'data/alarm-farm',
        name: 'AlarmFarmPanel',
        component: () => import('@/views/data-display/AlarmFarmPanel.vue'),
        meta: { title: '告警与农事进度', icon: 'BellFilled', permission: 'menu-data-alarm-farm' },
      },
      {
        path: 'iot-monitor/overview',
        name: 'EnvMonitor',
        component: () => import('@/views/iot-monitor/EnvMonitor.vue'),
        meta: { title: '环境监测总览', icon: 'DataAnalysis', permission: 'menu-iot-overview' },
      },
      {
        path: 'iot-monitor/weather',
        name: 'WeatherMonitor',
        component: () => import('@/views/iot-monitor/WeatherMonitor.vue'),
        meta: { title: '气象监测', icon: 'MostlyCloudy', permission: 'menu-iot-weather' },
      },
      {
        path: 'iot-monitor/soil',
        name: 'SoilMonitor',
        component: () => import('@/views/iot-monitor/SoilMonitor.vue'),
        meta: { title: '土壤墒情监测', icon: 'Crop', permission: 'menu-iot-soil' },
      },
      {
        path: 'iot-monitor/water',
        name: 'WaterQuality',
        component: () => import('@/views/iot-monitor/WaterQuality.vue'),
        meta: { title: '水质监测', icon: 'Pouring', permission: 'menu-iot-water' },
      },
      {
        path: 'iot-monitor/video',
        name: 'VideoMonitor',
        component: () => import('@/views/iot-monitor/VideoMonitor.vue'),
        meta: { title: '视频监控', icon: 'VideoCamera', permission: 'menu-iot-video' },
      },
      {
        path: 'iot-monitor/collection',
        name: 'CollectionManage',
        component: () => import('@/views/iot-monitor/CollectionManage.vue'),
        meta: { title: '采集管理', icon: 'SetUp', permission: 'menu-iot-collection' },
      },
      {
        path: 'control/manual',
        name: 'ManualControl',
        component: () => import('@/views/control-fertilizer/ManualControl.vue'),
        meta: { title: '设备手动控制台', icon: 'Switch', permission: 'menu-control-manual' },
      },
      {
        path: 'control/strategy',
        name: 'AutoStrategy',
        component: () => import('@/views/control-fertilizer/AutoStrategy.vue'),
        meta: { title: '自动联动策略配置', icon: 'SetUp', permission: 'menu-control-strategy' },
      },
      {
        path: 'control/group',
        name: 'GroupControl',
        component: () => import('@/views/control-fertilizer/GroupControl.vue'),
        meta: { title: '分组控制', icon: 'Grid', permission: 'menu-control-group' },
      },
      {
        path: 'control/fertilizer',
        name: 'FertilizerControl',
        component: () => import('@/views/control-fertilizer/FertilizerControl.vue'),
        meta: { title: '水肥配方与一体机控制', icon: 'Pouring', permission: 'menu-control-fertilizer' },
      },
      {
        path: 'control/logs',
        name: 'ControlLog',
        component: () => import('@/views/control-fertilizer/ControlLog.vue'),
        meta: { title: '控制日志与水电统计', icon: 'Document', permission: 'menu-control-logs' },
      },
      {
        path: 'alarm/realtime',
        name: 'AlarmRealtime',
        component: () => import('@/views/alarm-center/AlarmRealtime.vue'),
        meta: { title: '告警实时中心', icon: 'Bell', permission: 'menu-alarm-realtime' },
      },
      {
        path: 'alarm/process',
        name: 'AlarmProcess',
        component: () => import('@/views/alarm-center/AlarmProcess.vue'),
        meta: { title: '告警处理流程', icon: 'Connection', permission: 'menu-alarm-process' },
      },
      {
        path: 'alarm/rules',
        name: 'AlarmRule',
        component: () => import('@/views/alarm-center/AlarmRule.vue'),
        meta: { title: '告警规则配置', icon: 'SetUp', permission: 'menu-alarm-rules' },
      },
      {
        path: 'alarm/history',
        name: 'AlarmHistory',
        component: () => import('@/views/alarm-center/AlarmHistory.vue'),
        meta: { title: '告警历史查询', icon: 'Document', permission: 'menu-alarm-history' },
      },
      {
        path: 'alarm/statistics',
        name: 'AlarmStatistics',
        component: () => import('@/views/alarm-center/AlarmStats.vue'),
        meta: { title: '告警统计分析', icon: 'DataAnalysis', permission: 'menu-alarm-statistics' },
      },
      {
        path: 'sales/products',
        name: 'SalesProductManage',
        component: () => import('@/views/sales-center/ProductManage.vue'),
        meta: { title: '农产品上架管理', icon: 'Goods', permission: 'menu-sales-products' },
      },
      {
        path: 'sales/orders',
        name: 'SalesOrderManage',
        component: () => import('@/views/sales-center/OrderManage.vue'),
        meta: { title: '订单管理', icon: 'Tickets', permission: 'menu-sales-orders' },
      },
      {
        path: 'sales/shipments',
        name: 'SalesShipmentManage',
        component: () => import('@/views/sales-center/ShipmentManage.vue'),
        meta: { title: '发货与物流管理', icon: 'Van', permission: 'menu-sales-shipments' },
      },
      {
        path: 'sales/statistics',
        name: 'SalesStatistics',
        component: () => import('@/views/sales-center/SalesStatistics.vue'),
        meta: { title: '销售统计', icon: 'TrendCharts', permission: 'menu-sales-statistics' },
      },
      {
        path: 'sales/customers',
        name: 'SalesCustomerManage',
        component: () => import('@/views/sales-center/CustomerManage.vue'),
        meta: { title: '客户档案管理', icon: 'UserFilled', permission: 'menu-sales-customers' },
      },
      {
        path: 'farm/plot',
        name: 'FarmPlotArchive',
        component: () => import('@/views/farm-manage/PlotArchive.vue'),
        meta: { title: '地块档案管理', icon: 'Crop', permission: 'menu-farm-plot' },
      },
      {
        path: 'farm/gis',
        name: 'FarmPlotGis',
        component: () => import('@/views/farm-manage/PlotGis.vue'),
        meta: { title: '地块GIS地图', icon: 'MapLocation', permission: 'menu-farm-gis' },
      },
      {
        path: 'farm/plan',
        name: 'FarmPlantPlan',
        component: () => import('@/views/farm-manage/PlantPlan.vue'),
        meta: { title: '种植计划管理', icon: 'Tickets', permission: 'menu-farm-plan' },
      },
      {
        path: 'farm/order',
        name: 'FarmOrder',
        component: () => import('@/views/farm-manage/FarmOrder.vue'),
        meta: { title: '农事工单派单', icon: 'Promotion', permission: 'menu-farm-order' },
      },
      {
        path: 'farm/record',
        name: 'FarmRecord',
        component: () => import('@/views/farm-manage/FarmRecord.vue'),
        meta: { title: '农事执行打卡与台账', icon: 'EditPen', permission: 'menu-farm-record' },
      },
      {
        path: 'farm/stock',
        name: 'FarmMaterialStock',
        component: () => import('@/views/farm-manage/FertilizerStock.vue'),
        meta: { title: '农资库存管理', icon: 'Box', permission: 'menu-farm-stock' },
      },
      {
        path: 'farm/harvest',
        name: 'FarmHarvestYield',
        component: () => import('@/views/farm-manage/HarvestYield.vue'),
        meta: { title: '采收与产量管理', icon: 'DataAnalysis', permission: 'menu-farm-harvest' },
      },
      {
        path: 'knowledge/overview',
        name: 'KnowledgeOverview',
        component: () => import('@/views/knowledge-center/KnowledgeOverview.vue'),
        meta: { title: '农业专家知识库总览', icon: 'Reading', permission: 'menu-know-overview' },
      },
      {
        path: 'knowledge/pests',
        name: 'PestLibrary',
        component: () => import('@/views/knowledge-center/PestLibrary.vue'),
        meta: { title: '病虫害知识库', icon: 'Crop', permission: 'menu-know-pests' },
      },
      {
        path: 'knowledge/pest-plans',
        name: 'PestPlans',
        component: () => import('@/views/knowledge-center/PestPlans.vue'),
        meta: { title: '病虫害防治方案库', icon: 'FirstAidKit', permission: 'menu-know-pest-plans' },
      },
      {
        path: 'knowledge/manage',
        name: 'KnowledgeManage',
        component: () => import('@/views/knowledge-center/KnowledgeManage.vue'),
        meta: { title: '知识库内容管理', icon: 'Management', permission: 'menu-know-manage' },
      },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 在全部路由里找出当前用户有权限访问的第一个子页面路径（不含登录/404）
function firstPermittedPath(auth) {
  const stack = [...routes]
  while (stack.length) {
    const r = stack.shift()
    if (!r.meta?.public && !r.path.includes(':')) {
      const perm = r.meta?.permission
      if (!perm || auth.hasPermission(perm)) {
        const fullPath = r.path.startsWith('/') ? r.path : `/${r.path}`
        if (r.children?.length) {
          stack.unshift(...r.children.map((c) => ({ ...c, _parent: fullPath })))
        } else {
          return fullPath
        }
      }
    }
    if (r.children?.length) stack.unshift(...r.children)
  }
  return '/dashboard'
}

// 路由守卫：未登录跳转登录页，已登录访问登录页跳转工作台
router.beforeEach(async (to, from, next) => {
  document.title = to.meta.title
    ? `${to.meta.title} - 智慧农业综合管理平台`
    : '智慧农业综合管理平台'

  const auth = useAuthStore()
  if (to.meta.public) {
    if (to.path === '/login' && auth.isLoggedIn) return next('/dashboard')
    return next()
  }
  if (!auth.isLoggedIn) {
    return next({ path: '/login', query: { redirect: to.fullPath } })
  }
  // 每次进入后台页面校验账号是否仍为启用状态，被停用或删除则立即登出
  const valid = await auth.checkSession()
  if (!valid) {
    return next({ path: '/login', query: { redirect: to.fullPath } })
  }
  // 首次登录（仍是初始密码）只允许进入修改密码页，避免弱口令长期可用
  if (auth.userInfo?.mustChangePassword && to.path !== '/profile/password') {
    ElMessage.warning('请先修改初始密码后再使用系统')
    return next('/profile/password')
  }
  // 按角色权限点拦截越权访问，同时为菜单过滤准备好权限数据
  await auth.ensurePermissions()
  if (to.meta.permission && !auth.hasPermission(to.meta.permission)) {
    ElMessage.warning('无权限访问该页面')
    return next(firstPermittedPath(auth))
  }
  next()
})

export default router