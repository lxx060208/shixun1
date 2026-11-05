// 智慧农业综合管理平台「登录与个人中心」模块 - 本地持久化「数据库」层
// 设计说明：
//   本项目为纯前端实训（暂无后端），这里用 localStorage 承载关系型数据，充当“数据库”。
//   数据表结构如下：
//     users             用户表（含 password 字段，初始默认 123456）
//     roles             角色表
//     tenants           租户表
//     loginLogs         登录日志表
//     operationLogs     操作日志表
//     notifications     消息通知设置
//     rolePermissions   角色权限映射（roleCode -> 权限 key 数组）
//   首次启动以 mock.js 的种子数据建库；之后的增删改均即时落盘，
//   关闭页面或重启服务后再次打开，数据仍然保留（同一源 localStorage 持久化）。
import {
  users as seedUsers,
  roles as seedRoles,
  tenants as seedTenants,
  loginLogs as seedLoginLogs,
  operationLogs as seedOperationLogs,
  notificationsDefaults as seedNotifications,
  rolePermissions as seedRolePermissions,
} from './mock'

export const DB_KEY = 'samp_db_v1'

// 归一化：确保每个用户都具备密码与头像字段（兼容历史数据）
const normalizeUsers = (list) =>
  list.map((u) => ({ password: '123456', avatar: '', ...u }))

const buildSeedDB = () => ({
  users: normalizeUsers(JSON.parse(JSON.stringify(seedUsers))),
  roles: JSON.parse(JSON.stringify(seedRoles)),
  tenants: JSON.parse(JSON.stringify(seedTenants)),
  loginLogs: JSON.parse(JSON.stringify(seedLoginLogs)),
  operationLogs: JSON.parse(JSON.stringify(seedOperationLogs)),
  notifications: JSON.parse(JSON.stringify(seedNotifications)),
  rolePermissions: JSON.parse(JSON.stringify(seedRolePermissions)),
})

function loadDB() {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      const seed = buildSeedDB()
      // 兼容旧版本：缺失的表用种子兜底，密码字段补全
      return {
        users: normalizeUsers(data.users || seed.users),
        roles: data.roles || seed.roles,
        tenants: data.tenants || seed.tenants,
        loginLogs: data.loginLogs || seed.loginLogs,
        operationLogs: data.operationLogs || seed.operationLogs,
        notifications: { ...seed.notifications, ...(data.notifications || {}) },
        rolePermissions: data.rolePermissions || seed.rolePermissions,
      }
    }
  } catch (e) {
    console.warn('[db] 数据库数据解析失败，已重建', e)
  }
  return buildSeedDB()
}

export const db = loadDB()

export const users = db.users
export const roles = db.roles
export const tenants = db.tenants
export const loginLogs = db.loginLogs
export const operationLogs = db.operationLogs
export const notifications = db.notifications
export const rolePermissions = db.rolePermissions

// 整库落盘（每个写操作后调用）
export function persist() {
  localStorage.setItem(DB_KEY, JSON.stringify(db))
}

// 首次加载即落盘，确保数据库在本地被物化（后续读取由持久化结果承担）
persist()

// 重置数据库：清空本地数据并刷新，下次启动以种子数据重新建库
export function resetDB() {
  localStorage.removeItem(DB_KEY)
  window.location.reload()
}