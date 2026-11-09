import { createRouter, createWebHistory } from 'vue-router'
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
        meta: { title: '工作台', icon: 'House' },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/login-center/Profile.vue'),
        meta: { title: '基本资料', icon: 'User' },
      },
      {
        path: 'profile/password',
        name: 'ChangePassword',
        component: () => import('@/views/login-center/ChangePassword.vue'),
        meta: { title: '修改密码', icon: 'Key' },
      },
      {
        path: 'profile/notifications',
        name: 'NotificationSettings',
        component: () => import('@/views/login-center/NotificationSettings.vue'),
        meta: { title: '消息通知设置', icon: 'Bell' },
      },
      {
        path: 'system/users',
        name: 'UserList',
        component: () => import('@/views/login-center/UserList.vue'),
        meta: { title: '用户管理', icon: 'UserFilled' },
      },
      {
        path: 'system/roles',
        name: 'RoleList',
        component: () => import('@/views/login-center/RoleList.vue'),
        meta: { title: '角色管理', icon: 'Avatar' },
      },
      {
        path: 'system/permission',
        name: 'RolePermission',
        component: () => import('@/views/login-center/RolePermission.vue'),
        meta: { title: '角色权限配置', icon: 'Lock' },
      },
      {
        path: 'system/logs',
        name: 'LogAudit',
        component: () => import('@/views/login-center/LogAudit.vue'),
        meta: { title: '日志审计', icon: 'Document' },
      },
      {
        path: 'system/tenants',
        name: 'TenantManage',
        component: () => import('@/views/login-center/TenantManage.vue'),
        meta: { title: '租户管理', icon: 'OfficeBuilding' },
      },
      {
        path: 'data/overview',
        name: 'DataOverview',
        component: () => import('@/views/data-display/DataOverview.vue'),
        meta: { title: '平台数据总览', icon: 'DataAnalysis' },
      },
      {
        path: 'data/gis-map',
        name: 'GisMap',
        component: () => import('@/views/data-display/GisMap.vue'),
        meta: { title: 'GIS园区地图', icon: 'MapLocation' },
      },
      {
        path: 'data/realtime',
        name: 'RealtimeData',
        component: () => import('@/views/data-display/RealtimeData.vue'),
        meta: { title: '实时环境数据', icon: 'Odometer' },
      },
      {
        path: 'data/water-fertilizer',
        name: 'WaterFertilizerYield',
        component: () => import('@/views/data-display/WaterFertilizerYield.vue'),
        meta: { title: '水肥与产量统计', icon: 'Pouring' },
      },
      {
        path: 'data/device-dashboard',
        name: 'DeviceDashboard',
        component: () => import('@/views/data-display/DeviceDashboard.vue'),
        meta: { title: '设备运维大屏', icon: 'Monitor' },
      },
      {
        path: 'data/alarm-farm',
        name: 'AlarmFarmPanel',
        component: () => import('@/views/data-display/AlarmFarmPanel.vue'),
        meta: { title: '告警与农事进度', icon: 'BellFilled' },
      },
      {
        path: 'iot-monitor/overview',
        name: 'EnvMonitor',
        component: () => import('@/views/iot-monitor/EnvMonitor.vue'),
        meta: { title: '环境监测总览', icon: 'DataAnalysis' },
      },
      {
        path: 'iot-monitor/weather',
        name: 'WeatherMonitor',
        component: () => import('@/views/iot-monitor/WeatherMonitor.vue'),
        meta: { title: '气象监测', icon: 'MostlyCloudy' },
      },
      {
        path: 'iot-monitor/soil',
        name: 'SoilMonitor',
        component: () => import('@/views/iot-monitor/SoilMonitor.vue'),
        meta: { title: '土壤墒情监测', icon: 'Crop' },
      },
      {
        path: 'iot-monitor/water',
        name: 'WaterQuality',
        component: () => import('@/views/iot-monitor/WaterQuality.vue'),
        meta: { title: '水质监测', icon: 'Pouring' },
      },
      {
        path: 'iot-monitor/video',
        name: 'VideoMonitor',
        component: () => import('@/views/iot-monitor/VideoMonitor.vue'),
        meta: { title: '视频监控', icon: 'VideoCamera' },
      },
      {
        path: 'iot-monitor/collection',
        name: 'CollectionManage',
        component: () => import('@/views/iot-monitor/CollectionManage.vue'),
        meta: { title: '采集管理', icon: 'SetUp' },
      },
      {
        path: 'control/manual',
        name: 'ManualControl',
        component: () => import('@/views/control-fertilizer/ManualControl.vue'),
        meta: { title: '设备手动控制台', icon: 'Switch' },
      },
      {
        path: 'control/strategy',
        name: 'AutoStrategy',
        component: () => import('@/views/control-fertilizer/AutoStrategy.vue'),
        meta: { title: '自动联动策略配置', icon: 'SetUp' },
      },
      {
        path: 'control/group',
        name: 'GroupControl',
        component: () => import('@/views/control-fertilizer/GroupControl.vue'),
        meta: { title: '分组控制', icon: 'Grid' },
      },
      {
        path: 'control/fertilizer',
        name: 'FertilizerControl',
        component: () => import('@/views/control-fertilizer/FertilizerControl.vue'),
        meta: { title: '水肥配方与一体机控制', icon: 'Pouring' },
      },
      {
        path: 'control/logs',
        name: 'ControlLog',
        component: () => import('@/views/control-fertilizer/ControlLog.vue'),
        meta: { title: '控制日志与水电统计', icon: 'Document' },
      },
      {
        path: 'alarm/realtime',
        name: 'AlarmRealtime',
        component: () => import('@/views/alarm-center/AlarmRealtime.vue'),
        meta: { title: '告警实时中心', icon: 'Bell' },
      },
      {
        path: 'alarm/process',
        name: 'AlarmProcess',
        component: () => import('@/views/alarm-center/AlarmProcess.vue'),
        meta: { title: '告警处理流程', icon: 'Connection' },
      },
      {
        path: 'alarm/rules',
        name: 'AlarmRule',
        component: () => import('@/views/alarm-center/AlarmRule.vue'),
        meta: { title: '告警规则配置', icon: 'SetUp' },
      },
      {
        path: 'alarm/history',
        name: 'AlarmHistory',
        component: () => import('@/views/alarm-center/AlarmHistory.vue'),
        meta: { title: '告警历史查询', icon: 'Document' },
      },
      {
        path: 'alarm/statistics',
        name: 'AlarmStatistics',
        component: () => import('@/views/alarm-center/AlarmStats.vue'),
        meta: { title: '告警统计分析', icon: 'DataAnalysis' },
      },
      {
        path: 'sales/products',
        name: 'SalesProductManage',
        component: () => import('@/views/sales-center/ProductManage.vue'),
        meta: { title: '农产品上架管理', icon: 'Goods' },
      },
      {
        path: 'sales/orders',
        name: 'SalesOrderManage',
        component: () => import('@/views/sales-center/OrderManage.vue'),
        meta: { title: '订单管理', icon: 'Tickets' },
      },
      {
        path: 'sales/shipments',
        name: 'SalesShipmentManage',
        component: () => import('@/views/sales-center/ShipmentManage.vue'),
        meta: { title: '发货与物流管理', icon: 'Van' },
      },
      {
        path: 'sales/statistics',
        name: 'SalesStatistics',
        component: () => import('@/views/sales-center/SalesStatistics.vue'),
        meta: { title: '销售统计', icon: 'TrendCharts' },
      },
      {
        path: 'sales/customers',
        name: 'SalesCustomerManage',
        component: () => import('@/views/sales-center/CustomerManage.vue'),
        meta: { title: '客户档案管理', icon: 'UserFilled' },
      },
      {
        path: 'farm/plot',
        name: 'FarmPlotArchive',
        component: () => import('@/views/farm-manage/PlotArchive.vue'),
        meta: { title: '地块档案管理', icon: 'Crop' },
      },
      {
        path: 'farm/gis',
        name: 'FarmPlotGis',
        component: () => import('@/views/farm-manage/PlotGis.vue'),
        meta: { title: '地块GIS地图', icon: 'MapLocation' },
      },
      {
        path: 'farm/plan',
        name: 'FarmPlantPlan',
        component: () => import('@/views/farm-manage/PlantPlan.vue'),
        meta: { title: '种植计划管理', icon: 'Tickets' },
      },
      {
        path: 'farm/order',
        name: 'FarmOrder',
        component: () => import('@/views/farm-manage/FarmOrder.vue'),
        meta: { title: '农事工单派单', icon: 'Promotion' },
      },
      {
        path: 'farm/record',
        name: 'FarmRecord',
        component: () => import('@/views/farm-manage/FarmRecord.vue'),
        meta: { title: '农事执行打卡与台账', icon: 'EditPen' },
      },
      {
        path: 'farm/stock',
        name: 'FarmMaterialStock',
        component: () => import('@/views/farm-manage/FertilizerStock.vue'),
        meta: { title: '农资库存管理', icon: 'Box' },
      },
      {
        path: 'farm/harvest',
        name: 'FarmHarvestYield',
        component: () => import('@/views/farm-manage/HarvestYield.vue'),
        meta: { title: '采收与产量管理', icon: 'DataAnalysis' },
      },
      {
        path: 'knowledge/overview',
        name: 'KnowledgeOverview',
        component: () => import('@/views/knowledge-center/KnowledgeOverview.vue'),
        meta: { title: '农业专家知识库总览', icon: 'Reading' },
      },
      {
        path: 'knowledge/pests',
        name: 'PestLibrary',
        component: () => import('@/views/knowledge-center/PestLibrary.vue'),
        meta: { title: '病虫害知识库', icon: 'Crop' },
      },
      {
        path: 'knowledge/pest-plans',
        name: 'PestPlans',
        component: () => import('@/views/knowledge-center/PestPlans.vue'),
        meta: { title: '病虫害防治方案库', icon: 'FirstAidKit' },
      },
      {
        path: 'knowledge/manage',
        name: 'KnowledgeManage',
        component: () => import('@/views/knowledge-center/KnowledgeManage.vue'),
        meta: { title: '知识库内容管理', icon: 'Management' },
      },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 路由守卫：未登录跳转登录页，已登录访问登录页跳转工作台
router.beforeEach((to, from, next) => {
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
  next()
})

export default router