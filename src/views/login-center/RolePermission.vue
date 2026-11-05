<script setup>
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getPermissionTreeApi, getRolePermissionApi, saveRolePermissionApi } from '@/api'
import { roles } from '@/api/db'

const route = useRoute()

const treeRef = ref()
const treeData = ref([])
const loading = ref(false)
const saving = ref(false)
const selectedRole = ref('')

const typeMap = {
  menu: { label: '菜单', type: '' },
  button: { label: '按钮', type: 'success' },
  data: { label: '数据', type: 'warning' },
}

watch(selectedRole, async (val) => {
  if (!val) return
  await loadPermission(val)
})

async function loadPermission(roleCode) {
  loading.value = true
  try {
    const keys = await getRolePermissionApi(roleCode)
    await nextTick()
    treeRef.value?.setCheckedKeys(keys)
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  saving.value = true
  try {
    const checked = treeRef.value.getCheckedKeys(false).concat(treeRef.value.getHalfCheckedKeys())
    await saveRolePermissionApi(selectedRole.value, checked)
    ElMessage.success('权限配置已保存')
  } catch (err) {
    ElMessage.error(err.message || '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  treeData.value = await getPermissionTreeApi()
  selectedRole.value = String(route.query.roleCode || roles[0]?.code || '')
  if (selectedRole.value) {
    await loadPermission(selectedRole.value)
  }
})
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h3 class="page-title">角色权限配置</h3>
      <el-button type="primary" :loading="saving" @click="handleSave">保存配置</el-button>
    </div>

    <el-card shadow="never">
      <div class="role-select">
        <span class="role-select-label">选择角色：</span>
        <el-select v-model="selectedRole" placeholder="请选择角色" style="width: 240px">
          <el-option v-for="r in roles" :key="r.code" :label="r.name" :value="r.code" />
        </el-select>
        <span class="role-select-tip">勾选该角色可访问的菜单、按钮与数据权限</span>
      </div>

      <el-divider />

      <el-tree
        ref="treeRef"
        v-loading="loading"
        :data="treeData"
        show-checkbox
        node-key="id"
        default-expand-all
        :props="{ label: 'label', children: 'children' }"
      >
        <template #default="{ data }">
          <span class="tree-node">
            <span>{{ data.label }}</span>
            <el-tag :type="typeMap[data.type]?.type" size="small" effect="plain">
              {{ typeMap[data.type]?.label }}
            </el-tag>
          </span>
        </template>
      </el-tree>
    </el-card>
  </div>
</template>

<style scoped>
.role-select {
  display: flex;
  align-items: center;
  gap: 12px;
}

.role-select-label {
  font-weight: 600;
  color: #303133;
}

.role-select-tip {
  font-size: 12px;
  color: #a0aca5;
}

.tree-node {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
</style>