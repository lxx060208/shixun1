<script setup>
import { reactive, ref, watch } from 'vue'
import { departments } from '@/api/mock'
import { roles } from '@/api/db'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  user: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'save'])

const formRef = ref()

const defaultForm = () => ({
  id: null,
  username: '',
  name: '',
  phone: '',
  email: '',
  roleCode: 'operator',
  department: '生产管理部',
  position: '',
  status: 1,
  password: '',
})

const form = reactive(defaultForm())
const isEdit = ref(false)

// 新增用户必须设置初始密码：8-20 位且同时包含字母和数字
const validatePassword = (rule, value, callback) => {
  if (isEdit.value) return callback()
  if (!value) return callback(new Error('请输入初始密码'))
  if (!/^(?=.*[A-Za-z])(?=.*\d)[\w!@#$%^&*]{8,20}$/.test(value)) {
    return callback(new Error('8-20 位，需同时包含字母和数字'))
  }
  callback()
}

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  password: [{ validator: validatePassword, trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  email: [{ type: 'email', message: '邮箱格式不正确', trigger: 'blur' }],
  roleCode: [{ required: true, message: '请选择角色', trigger: 'change' }],
  department: [{ required: true, message: '请选择部门', trigger: 'change' }],
}

watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      isEdit.value = !!props.user
      Object.assign(form, defaultForm(), props.user || {})
    }
  },
)

function handleVisible(val) {
  emit('update:modelValue', val)
}

async function handleSubmit() {
  await formRef.value.validate((valid) => {
    if (!valid) return
    emit('save', { ...form })
  })
}

function handleClosed() {
  formRef.value?.resetFields()
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :title="isEdit ? '编辑用户' : '新增用户'"
    width="560px"
    :close-on-click-modal="false"
    @update:model-value="handleVisible"
    @closed="handleClosed"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" :disabled="isEdit" placeholder="请输入用户名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="姓名" prop="name">
            <el-input v-model="form.name" placeholder="请输入姓名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号码" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入手机号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" placeholder="请输入邮箱" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="角色" prop="roleCode">
            <el-select v-model="form.roleCode" placeholder="请选择角色" style="width: 100%">
              <el-option v-for="r in roles" :key="r.code" :label="r.name" :value="r.code" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="部门" prop="department">
            <el-select v-model="form.department" placeholder="请选择部门" style="width: 100%">
              <el-option v-for="d in departments" :key="d" :label="d" :value="d" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="职位">
            <el-input v-model="form.position" placeholder="请输入职位" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item v-if="!isEdit" label="初始密码" prop="password">
            <el-input v-model="form.password" type="password" show-password autocomplete="new-password" placeholder="8-20 位，含字母和数字" />
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="!isEdit">
          <el-alert type="info" :closable="false" show-icon title="用户首次登录时须修改初始密码后才能进入系统" />
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态">
            <el-radio-group v-model="form.status">
              <el-radio :value="1">启用</el-radio>
              <el-radio :value="0">停用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="handleVisible(false)">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>