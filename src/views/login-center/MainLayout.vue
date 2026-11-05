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
  { path: '/dashboard', title: '工作台', icon: 'House' },
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
        <el-icon :size="24"><Crop /></el-icon>
        <span v-show="!collapsed" class="logo-text">智慧农业管理平台</span>
      </div>
      <el-scrollbar class="menu-scroll">
        <el-menu
          :default-active="activeMenu"
          :collapse="collapsed"
          router
          unique-opened
          background-color="transparent"
          text-color="#c9d8ce"
          active-text-color="#ffffff"
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
    </aside>

    <div class="main">
      <header class="topbar">
        <div class="topbar-left">
          <el-icon class="collapse-btn" :size="20" @click="collapsed = !collapsed">
            <Expand v-if="collapsed" />
            <Fold v-else />
          </el-icon>
          <span class="page-title">{{ pageTitle }}</span>
        </div>
        <div class="topbar-right">
          <el-badge :value="3" class="bell">
            <el-icon :size="20"><Bell /></el-icon>
          </el-badge>
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="user-trigger">
              <el-avatar :size="32" class="avatar">{{ auth.userInfo?.name?.charAt(0) }}</el-avatar>
              <span class="user-name">{{ auth.userInfo?.name }}</span>
              <el-tag size="small" type="success" effect="plain">{{ roleName }}</el-tag>
              <el-icon><ArrowDown /></el-icon>
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
}

.sidebar {
  width: 220px;
  background: var(--samp-sidebar-bg);
  transition: width 0.2s;
  display: flex;
  flex-direction: column;
}

.sidebar.collapsed {
  width: 64px;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #fff;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
}

.logo-text {
  font-size: 16px;
}

.menu-scroll {
  flex: 1;
  overflow-y: auto;
}

.sidebar :deep(.el-menu) {
  border-right: none;
}

.sidebar :deep(.el-menu-item.is-active) {
  background: var(--samp-sidebar-active) !important;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.topbar {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e6ebe8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.collapse-btn {
  cursor: pointer;
  color: #5f6b63;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2d3d;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.bell {
  cursor: pointer;
  color: #5f6b63;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.avatar {
  background: var(--el-color-primary);
}

.user-name {
  font-size: 14px;
  color: #303133;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}
</style>