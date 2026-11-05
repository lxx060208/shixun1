<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const collapsed = ref(false)

const menus = [
  { path: '/dashboard', title: '工作台', icon: 'HomeFilled' },
  {
    title: '个人中心',
    icon: 'User',
    children: [
      { path: '/profile', title: '基本资料', icon: 'User' },
      { path: '/profile/password', title: '修改密码', icon: 'Key' },
      { path: '/profile/notifications', title: '消息通知设置', icon: 'Bell' },
    ],
  },
  {
    title: '数据展示',
    icon: 'DataAnalysis',
    children: [
      { path: '/data/overview', title: '平台数据总览', icon: 'DataAnalysis' },
      { path: '/data/gis-map', title: 'GIS园区地图', icon: 'MapLocation' },
      { path: '/data/realtime', title: '实时环境数据', icon: 'Odometer' },
      { path: '/data/water-fertilizer', title: '水肥与产量统计', icon: 'Pouring' },
      { path: '/data/device-dashboard', title: '设备运维大屏', icon: 'Monitor' },
      { path: '/data/alarm-farm', title: '告警与农事进度', icon: 'BellFilled' },
    ],
  },
  {
    title: '系统管理',
    icon: 'Setting',
    children: [
      { path: '/system/users', title: '用户管理', icon: 'UserFilled' },
      { path: '/system/roles', title: '角色管理', icon: 'Avatar' },
      { path: '/system/permission', title: '角色权限配置', icon: 'Lock' },
      { path: '/system/logs', title: '日志审计', icon: 'Document' },
      { path: '/system/tenants', title: '租户管理', icon: 'OfficeBuilding' },
    ],
  },
  {
    title: '物联网环境监测',
    icon: 'Odometer',
    children: [
      { path: '/iot-monitor/overview', title: '环境监测总览', icon: 'DataAnalysis' },
      { path: '/iot-monitor/weather', title: '气象监测', icon: 'MostlyCloudy' },
      { path: '/iot-monitor/soil', title: '土壤墒情监测', icon: 'Crop' },
      { path: '/iot-monitor/water', title: '水质监测', icon: 'Pouring' },
      { path: '/iot-monitor/video', title: '视频监控', icon: 'VideoCamera' },
      { path: '/iot-monitor/collection', title: '采集管理', icon: 'SetUp' },
    ],
  },
]

const activeMenu = computed(() => route.path)
const pageTitle = computed(() => route.meta.title || '')

const roleNameMap = {
  admin: '系统管理员',
  manager: '农场管理者',
  operator: '运维人员',
  sales: '产销业务员',
  agronomist: '农技人员',
}
const roleName = computed(() => (auth.userInfo ? roleNameMap[auth.userInfo.roleCode] || auth.userInfo.roleCode : ''))

function handleCommand(command) {
  if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'password') {
    router.push('/profile/password')
  } else if (command === 'logout') {
    handleLogout()
  }
}

async function handleLogout() {
  await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '退出',
    cancelButtonText: '取消',
    type: 'warning',
  })
  auth.logout()
  ElMessage.success('已退出登录')
  router.replace('/login')
}
</script>

<template>
  <div class="layout">
    <aside class="sidebar" :class="{ collapsed }">
      <div class="logo">
        <div class="logo-badge">
          <el-icon :size="20"><Crop /></el-icon>
        </div>
        <div v-show="!collapsed" class="logo-text">
          <span class="logo-title">智慧农业管理平台</span>
          <span class="logo-sub">Smart Agriculture</span>
        </div>
      </div>

      <el-scrollbar class="menu-scroll">
        <el-menu
          :default-active="activeMenu"
          :collapse="collapsed"
          :collapse-transition="false"
          router
          unique-opened
          background-color="transparent"
          text-color="var(--samp-sidebar-text)"
          active-text-color="var(--samp-sidebar-active-text)"
        >
          <template v-for="menu in menus" :key="menu.title">
            <el-sub-menu v-if="menu.children" :index="menu.title">
              <template #title>
                <el-icon><component :is="menu.icon" /></el-icon>
                <span>{{ menu.title }}</span>
              </template>
              <el-menu-item v-for="child in menu.children" :key="child.path" :index="child.path">
                <el-icon><component :is="child.icon" /></el-icon>
                <span>{{ child.title }}</span>
              </el-menu-item>
            </el-sub-menu>
            <el-menu-item v-else :index="menu.path">
              <el-icon><component :is="menu.icon" /></el-icon>
              <span>{{ menu.title }}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </el-scrollbar>

      <div v-show="!collapsed" class="sidebar-foot">
        <div class="foot-tip">
          <el-icon><Sunny /></el-icon>
          <span>智慧农业 · 绿色生产</span>
        </div>
      </div>
    </aside>

    <div class="main">
      <header class="topbar">
        <div class="topbar-left">
          <el-icon class="collapse-btn" :size="18" @click="collapsed = !collapsed">
            <Expand v-if="collapsed" />
            <Fold v-else />
          </el-icon>
          <div class="page-heading">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item>首页</el-breadcrumb-item>
              <el-breadcrumb-item>{{ pageTitle }}</el-breadcrumb-item>
            </el-breadcrumb>
            <span class="page-title-top">{{ pageTitle }}</span>
          </div>
        </div>

        <div class="topbar-right">
          <el-tooltip content="消息通知" placement="bottom">
            <el-badge :value="3" class="bell">
              <el-icon :size="18"><Bell /></el-icon>
            </el-badge>
          </el-tooltip>

          <el-dropdown trigger="click" @command="handleCommand">
            <div class="user-trigger">
              <el-avatar :size="34" class="avatar">
                <img v-if="auth.userInfo?.avatar" :src="auth.userInfo.avatar" alt="用户头像" />
                <span v-else>{{ auth.userInfo?.name?.charAt(0) }}</span>
              </el-avatar>
              <div class="user-meta">
                <span class="user-name">{{ auth.userInfo?.name }}</span>
                <span class="user-role">{{ roleName }}</span>
              </div>
              <el-icon class="arrow"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile"><el-icon><User /></el-icon>基本资料</el-dropdown-item>
                <el-dropdown-item command="password"><el-icon><Key /></el-icon>修改密码</el-dropdown-item>
                <el-dropdown-item command="logout" divided><el-icon><SwitchButton /></el-icon>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--samp-bg);
}

/* ---------------- 侧边栏 ---------------- */
.sidebar {
  width: 232px;
  background: var(--samp-sidebar-bg);
  border-right: 1px solid var(--samp-border);
  transition: width 0.2s;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar.collapsed {
  width: 64px;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  border-bottom: 1px solid var(--samp-border);
  white-space: nowrap;
  overflow: hidden;
}

.logo-badge {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, #16a34a, #0f7b38);
  box-shadow: 0 6px 14px rgba(22, 163, 74, 0.28);
  flex-shrink: 0;
}

.logo-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.logo-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--samp-text-main);
}

.logo-sub {
  font-size: 10px;
  color: var(--samp-text-secondary);
  letter-spacing: 0.4px;
}

.menu-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 10px 8px;
}

.sidebar :deep(.el-menu) {
  border-right: none;
}

.sidebar :deep(.el-menu-item),
.sidebar :deep(.el-sub-menu__title) {
  height: 44px;
  line-height: 44px;
  margin: 4px 0;
  border-radius: 10px;
}

.sidebar :deep(.el-menu-item:hover),
.sidebar :deep(.el-sub-menu__title:hover) {
  background-color: #f3f5f8;
}

.sidebar :deep(.el-menu-item.is-active) {
  background: var(--samp-sidebar-active-bg) !important;
  font-weight: 600;
}

.sidebar-foot {
  padding: 12px 16px;
  border-top: 1px solid var(--samp-border);
}

.foot-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 12px;
  color: var(--samp-text-secondary);
  background: #f7f9fb;
}

.foot-tip .el-icon {
  color: var(--el-color-primary);
}

/* ---------------- 主区域 ---------------- */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.topbar {
  height: 64px;
  background: #fff;
  border-bottom: 1px solid var(--samp-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  flex-shrink: 0;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.collapse-btn {
  cursor: pointer;
  color: #5c6470;
  padding: 6px;
  border-radius: 8px;
}

.collapse-btn:hover {
  background: #f3f5f8;
}

.page-heading {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.page-heading :deep(.el-breadcrumb) {
  font-size: 12px;
  line-height: 1;
  margin-bottom: 2px;
}

.page-heading :deep(.el-breadcrumb__inner) {
  color: #9aa1ad;
  font-weight: 400;
}

.page-title-top {
  font-size: 16px;
  font-weight: 700;
  color: var(--samp-text-main);
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 18px;
}

.bell {
  cursor: pointer;
  color: #5c6470;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 10px;
}

.user-trigger:hover {
  background: #f7f9fb;
}

.avatar {
  background: linear-gradient(135deg, #34d399, #16a34a);
  color: #fff;
  font-weight: 600;
  flex-shrink: 0;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--samp-text-main);
}

.user-role {
  font-size: 11px;
  color: var(--samp-text-secondary);
}

.arrow {
  color: #9aa1ad;
  font-size: 12px;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}
</style>