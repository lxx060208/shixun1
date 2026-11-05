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