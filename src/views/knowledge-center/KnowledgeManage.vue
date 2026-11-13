<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getKnowledgeArticlesApi,
  saveKnowledgeArticleApi,
  auditKnowledgeArticleApi,
  deleteKnowledgeArticleApi,
  getKnowledgeExpertsApi,
  saveKnowledgeExpertApi,
  auditKnowledgeExpertApi,
  deleteKnowledgeExpertApi,
  getKnowledgeCategoriesApi,
  saveKnowledgeCategoryApi,
  deleteKnowledgeCategoryApi,
} from '@/api'

const activeTab = ref('article')

/* ------------------------- 知识条目 ------------------------- */
const articleLoading = ref(false)
const articleList = ref([])
const articleTotal = ref(0)
const articlePage = ref(1)
const articlePageSize = ref(10)
const articleFilters = reactive({ keyword: '', category: '', status: '' })
const articleCategories = ref([])
const articleStats = reactive({ published: 0, pending: 0, draft: 0 })
const expertOptions = ref([])
const statusOptions = ['已发布', '待审核', '草稿']

const articleDialogVisible = ref(false)
const articleFormRef = ref(null)
const articleSaving = ref(false)
const articleForm = reactive({
  id: '',
  title: '',
  category: '',
  expertId: '',
  summary: '',
  content: '',
  tags: [],
  recommend: false,
})

const articleRules = {
  title: [{ required: true, message: '请输入文章标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择知识分类', trigger: 'change' }],
  expertId: [{ required: true, message: '请选择关联专家', trigger: 'change' }],
  content: [{ required: true, message: '请输入文章正文', trigger: 'blur' }],
}

function articleStatusTag(status) {
  return { 已发布: 'success', 待审核: 'warning', 草稿: 'info' }[status] || 'info'
}

async function loadArticles() {
  articleLoading.value = true
  try {
    const res = await getKnowledgeArticlesApi({
      ...articleFilters,
      page: articlePage.value,
      pageSize: articlePageSize.value,
    })
    articleList.value = res.list
    articleTotal.value = res.total
    articleCategories.value = res.categories
    Object.assign(articleStats, res.stats)
    const maxPage = Math.max(1, Math.ceil(res.total / articlePageSize.value))
    if (articlePage.value > maxPage) {
      articlePage.value = maxPage
      return loadArticles()
    }
  } catch (e) {
    ElMessage.error(e.message || '加载知识条目失败')
  } finally {
    articleLoading.value = false
  }
}

async function loadExpertOptions() {
  try {
    const res = await getKnowledgeExpertsApi({ page: 1, pageSize: 100 })
    expertOptions.value = res.list
  } catch {
    expertOptions.value = []
  }
}

function searchArticles() {
  articlePage.value = 1
  loadArticles()
}

function resetArticleFilters() {
  articleFilters.keyword = ''
  articleFilters.category = ''
  articleFilters.status = ''
  articlePage.value = 1
  loadArticles()
}

function handleArticlePageChange(p) {
  articlePage.value = p
  loadArticles()
}

function handleArticleSizeChange(s) {
  articlePageSize.value = s
  articlePage.value = 1
  loadArticles()
}

function resetArticleForm() {
  Object.assign(articleForm, {
    id: '',
    title: '',
    category: '',
    expertId: '',
    summary: '',
    content: '',
    tags: [],
    recommend: false,
  })
  articleFormRef.value?.clearValidate()
}

function openArticleDialog(row) {
  resetArticleForm()
  if (row) {
    Object.assign(articleForm, {
      id: row.id,
      title: row.title,
      category: row.category,
      expertId: row.expertId,
      summary: row.summary,
      content: row.content,
      tags: row.tags.slice(),
      recommend: row.recommend,
    })
  } else {
    articleForm.category = articleCategories.value[0] || ''
  }
  articleDialogVisible.value = true
}

async function submitArticle() {
  const ok = await articleFormRef.value.validate().catch(() => false)
  if (!ok) return
  articleSaving.value = true
  try {
    const payload = {
      id: articleForm.id,
      title: articleForm.title,
      category: articleForm.category,
      expertId: articleForm.expertId,
      summary: articleForm.summary || articleForm.content.slice(0, 80),
      content: articleForm.content,
      tags: articleForm.tags.filter((t) => t.trim()),
      recommend: articleForm.recommend,
    }
    await saveKnowledgeArticleApi(payload)
    ElMessage.success(articleForm.id ? '知识条目已更新' : '知识条目已创建，待审核后可发布')
    articleDialogVisible.value = false
    await loadArticles()
  } catch (e) {
    ElMessage.error(e.message || '保存知识条目失败')
  } finally {
    articleSaving.value = false
  }
}

async function submitArticleAudit(row) {
  try {
    await saveKnowledgeArticleApi({ id: row.id, status: '待审核' })
    ElMessage.success('已提交审核')
    loadArticles()
  } catch (e) {
    ElMessage.error(e.message || '提交审核失败')
  }
}

async function publishArticle(row) {
  try {
    await auditKnowledgeArticleApi(row.id, 'publish')
    ElMessage.success('审核通过，文章已发布')
    loadArticles()
  } catch (e) {
    ElMessage.error(e.message || '审核失败')
  }
}

async function rejectArticle(row) {
  try {
    const { value } = await ElMessageBox.prompt('请输入退回原因', '审核退回', {
      confirmButtonText: '确认退回',
      cancelButtonText: '取消',
      inputPlaceholder: '例如：防治用药剂量需补充安全间隔期说明',
      inputValidator: (v) => (v && v.trim() ? true : '退回原因不能为空'),
    })
    await auditKnowledgeArticleApi(row.id, 'reject', value.trim())
    ElMessage.success('已退回，条目转为草稿')
    loadArticles()
  } catch (e) {
    if (e !== 'cancel') ElMessage.error(e.message || '审核失败')
  }
}

async function removeArticle(row) {
  try {
    await ElMessageBox.confirm(`确认删除知识条目「${row.title}」？`, '删除确认', { type: 'warning' })
    await deleteKnowledgeArticleApi(row.id)
    ElMessage.success('已删除')
    if (articleList.value.length === 1 && articlePage.value > 1) articlePage.value -= 1
    loadArticles()
  } catch (e) {
    if (e !== 'cancel') ElMessage.error(e.message || '删除失败')
  }
}

/* ------------------------- 分类维护 ------------------------- */
const categoryLoading = ref(false)
const categories = ref([])
const categoryDialogVisible = ref(false)
const categoryFormRef = ref(null)
const categorySaving = ref(false)
const categoryForm = reactive({ id: '', name: '', description: '' })

const categoryRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
}

async function loadCategories() {
  categoryLoading.value = true
  try {
    categories.value = await getKnowledgeCategoriesApi()
  } catch (e) {
    ElMessage.error(e.message || '加载分类失败')
  } finally {
    categoryLoading.value = false
  }
}

function openCategoryDialog(row) {
  Object.assign(categoryForm, { id: '', name: '', description: '' })
  if (row) Object.assign(categoryForm, { id: row.id, name: row.name, description: row.description })
  categoryFormRef.value?.clearValidate()
  categoryDialogVisible.value = true
}

async function submitCategory() {
  const ok = await categoryFormRef.value.validate().catch(() => false)
  if (!ok) return
  categorySaving.value = true
  try {
    await saveKnowledgeCategoryApi({ ...categoryForm })
    ElMessage.success(categoryForm.id ? '分类已更新' : '分类已新增')
    categoryDialogVisible.value = false
    await Promise.all([loadCategories(), loadArticles()])
  } catch (e) {
    ElMessage.error(e.message || '保存分类失败')
  } finally {
    categorySaving.value = false
  }
}

async function removeCategory(row) {
  try {
    await ElMessageBox.confirm(`确认删除分类「${row.name}」？`, '删除确认', { type: 'warning' })
    await deleteKnowledgeCategoryApi(row.id)
    ElMessage.success('已删除')
    await Promise.all([loadCategories(), loadArticles()])
  } catch (e) {
    if (e !== 'cancel') ElMessage.error(e.message || '删除失败')
  }
}

/* ------------------------- 专家入驻 ------------------------- */
const expertLoading = ref(false)
const expertList = ref([])
const expertTotal = ref(0)
const expertPage = ref(1)
const expertPageSize = ref(10)
const expertFilters = reactive({ keyword: '', field: '', status: '' })
const expertFields = ref([])
const pendingExpertCount = ref(0)
const expertStatusOptions = ['已入驻', '待审核', '已驳回']

const expertDialogVisible = ref(false)
const expertFormRef = ref(null)
const expertSaving = ref(false)
const expertForm = reactive({
  id: '',
  name: '',
  title: '',
  field: '',
  organization: '',
  years: 10,
  specialty: '',
  intro: '',
  phone: '',
  email: '',
})

const expertRules = {
  name: [{ required: true, message: '请输入专家姓名', trigger: 'blur' }],
  title: [{ required: true, message: '请输入职称', trigger: 'blur' }],
  field: [{ required: true, message: '请选择所属领域', trigger: 'change' }],
  organization: [{ required: true, message: '请输入所在单位', trigger: 'blur' }],
  specialty: [{ required: true, message: '请输入擅长方向', trigger: 'blur' }],
}

function expertStatusTag(status) {
  return { 已入驻: 'success', 待审核: 'warning', 已驳回: 'danger' }[status] || 'info'
}

async function loadExperts() {
  expertLoading.value = true
  try {
    const res = await getKnowledgeExpertsApi({
      ...expertFilters,
      page: expertPage.value,
      pageSize: expertPageSize.value,
    })
    expertList.value = res.list
    expertTotal.value = res.total
    expertFields.value = res.fields
    pendingExpertCount.value = res.pendingCount
    const maxPage = Math.max(1, Math.ceil(res.total / expertPageSize.value))
    if (expertPage.value > maxPage) {
      expertPage.value = maxPage
      return loadExperts()
    }
  } catch (e) {
    ElMessage.error(e.message || '加载专家列表失败')
  } finally {
    expertLoading.value = false
  }
}

function searchExperts() {
  expertPage.value = 1
  loadExperts()
}

function resetExpertFilters() {
  expertFilters.keyword = ''
  expertFilters.field = ''
  expertFilters.status = ''
  expertPage.value = 1
  loadExperts()
}

function handleExpertPageChange(p) {
  expertPage.value = p
  loadExperts()
}

function handleExpertSizeChange(s) {
  expertPageSize.value = s
  expertPage.value = 1
  loadExperts()
}

function resetExpertForm() {
  Object.assign(expertForm, {
    id: '',
    name: '',
    title: '',
    field: '',
    organization: '',
    years: 10,
    specialty: '',
    intro: '',
    phone: '',
    email: '',
  })
  expertFormRef.value?.clearValidate()
}

function openExpertDialog(row) {
  resetExpertForm()
  if (row) {
    Object.assign(expertForm, {
      id: row.id,
      name: row.name,
      title: row.title,
      field: row.field,
      organization: row.organization,
      years: row.years,
      specialty: row.specialty,
      intro: row.intro,
      phone: row.phone,
      email: row.email,
    })
  }
  expertDialogVisible.value = true
}

async function submitExpert() {
  const ok = await expertFormRef.value.validate().catch(() => false)
  if (!ok) return
  expertSaving.value = true
  try {
    await saveKnowledgeExpertApi({ ...expertForm })
    ElMessage.success(expertForm.id ? '专家档案已更新' : '专家已提交入驻申请，待审核')
    expertDialogVisible.value = false
    await Promise.all([loadExperts(), loadExpertOptions()])
  } catch (e) {
    ElMessage.error(e.message || '保存专家档案失败')
  } finally {
    expertSaving.value = false
  }
}

async function approveExpert(row) {
  try {
    await auditKnowledgeExpertApi(row.id, 'approve')
    ElMessage.success(`「${row.name}」已通过入驻审核`)
    loadExperts()
  } catch (e) {
    ElMessage.error(e.message || '审核失败')
  }
}

async function rejectExpert(row) {
  try {
    await ElMessageBox.confirm(`确认驳回「${row.name}」的入驻申请？`, '驳回确认', { type: 'warning' })
    await auditKnowledgeExpertApi(row.id, 'reject')
    ElMessage.success('已驳回入驻申请')
    loadExperts()
  } catch (e) {
    if (e !== 'cancel') ElMessage.error(e.message || '审核失败')
  }
}

async function removeExpert(row) {
  try {
    await ElMessageBox.confirm(`确认删除专家「${row.name}」？`, '删除确认', { type: 'warning' })
    await deleteKnowledgeExpertApi(row.id)
    ElMessage.success('已删除')
    if (expertList.value.length === 1 && expertPage.value > 1) expertPage.value -= 1
    loadExperts()
  } catch (e) {
    if (e !== 'cancel') ElMessage.error(e.message || '删除失败')
  }
}

/* ------------------------- 页面初始化 ------------------------- */
function ensureTab(tab) {
  if (tab === 'category') loadCategories()
  if (tab === 'expert') loadExperts()
}

onMounted(() => {
  loadArticles()
  loadExperts()
  loadExpertOptions()
})
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">知识库内容管理</h2>
      <span class="page-desc">知识条目新增 / 编辑 / 审核、分类维护与专家入驻管理</span>
    </div>

    <el-card shadow="never" class="tab-card">
      <el-tabs v-model="activeTab" @tab-change="ensureTab">
        <el-tab-pane label="知识条目" name="article">
          <el-row :gutter="16" class="stat-row">
            <el-col :xs="24" :sm="8">
              <div class="mini-stat green">
                <span class="mini-label">已发布</span>
                <span class="mini-value">{{ articleStats.published }}<em>篇</em></span>
              </div>
            </el-col>
            <el-col :xs="24" :sm="8">
              <div class="mini-stat orange">
                <span class="mini-label">待审核</span>
                <span class="mini-value">{{ articleStats.pending }}<em>篇</em></span>
              </div>
            </el-col>
            <el-col :xs="24" :sm="8">
              <div class="mini-stat gray">
                <span class="mini-label">草稿</span>
                <span class="mini-value">{{ articleStats.draft }}<em>篇</em></span>
              </div>
            </el-col>
          </el-row>

          <div class="toolbar">
            <el-form :model="articleFilters" :inline="true" class="toolbar-form">
              <el-form-item label="关键字">
                <el-input
                  v-model="articleFilters.keyword"
                  placeholder="标题 / 作者 / 标签"
                  clearable
                  style="width: 200px"
                  @keyup.enter="searchArticles"
                />
              </el-form-item>
              <el-form-item label="分类">
                <el-select v-model="articleFilters.category" placeholder="全部分类" clearable style="width: 150px">
                  <el-option v-for="c in articleCategories" :key="c" :label="c" :value="c" />
                </el-select>
              </el-form-item>
              <el-form-item label="状态">
                <el-select v-model="articleFilters.status" placeholder="全部状态" clearable style="width: 130px">
                  <el-option v-for="s in statusOptions" :key="s" :label="s" :value="s" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="searchArticles">
                  <el-icon><Search /></el-icon>
                  查询
                </el-button>
                <el-button @click="resetArticleFilters">重置</el-button>
              </el-form-item>
            </el-form>
            <el-button type="primary" plain class="add-btn" @click="openArticleDialog()">
              <el-icon><Plus /></el-icon>
              新增知识条目
            </el-button>
          </div>

          <el-table v-loading="articleLoading" :data="articleList" stripe>
            <el-table-column prop="title" label="文章标题" min-width="240">
              <template #default="{ row }">
                <div class="article-title">
                  {{ row.title }}
                  <el-tag v-if="row.recommend" size="small" type="success" effect="plain" class="rec-tag">推荐</el-tag>
                </div>
                <div class="article-sub">{{ row.id }} · {{ row.tags.join(' / ') || '无标签' }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="category" label="分类" width="130" />
            <el-table-column prop="author" label="作者" width="110" />
            <el-table-column prop="publishTime" label="发布时间" width="165" />
            <el-table-column prop="views" label="阅读量" width="90" align="center" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tooltip v-if="row.auditRemark" :content="row.auditRemark" placement="top">
                  <el-tag :type="articleStatusTag(row.status)" size="small">{{ row.status }}</el-tag>
                </el-tooltip>
                <el-tag v-else :type="articleStatusTag(row.status)" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="openArticleDialog(row)">编辑</el-button>
                <template v-if="row.status === '待审核'">
                  <el-button link type="success" @click="publishArticle(row)">通过</el-button>
                  <el-button link type="warning" @click="rejectArticle(row)">退回</el-button>
                </template>
                <template v-else-if="row.status === '草稿'">
                  <el-button link type="primary" @click="submitArticleAudit(row)">提交审核</el-button>
                </template>
                <el-button link type="danger" @click="removeArticle(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-empty v-if="!articleLoading && !articleList.length" description="未找到匹配的知识条目" />

          <div v-if="articleTotal" class="pagination-wrap">
            <el-pagination
              background
              layout="total, sizes, prev, pager, next, jumper"
              :total="articleTotal"
              :current-page="articlePage"
              :page-size="articlePageSize"
              :page-sizes="[10, 20, 30]"
              @current-change="handleArticlePageChange"
              @size-change="handleArticleSizeChange"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane label="分类维护" name="category">
          <div class="toolbar">
            <span class="toolbar-tip">分类名称修改后会同步更新该分类下知识条目的分类归属</span>
            <el-button type="primary" plain class="add-btn" @click="openCategoryDialog()">
              <el-icon><Plus /></el-icon>
              新增分类
            </el-button>
          </div>

          <el-table v-loading="categoryLoading" :data="categories" stripe>
            <el-table-column prop="id" label="分类编号" width="110" />
            <el-table-column prop="name" label="分类名称" width="160">
              <template #default="{ row }">
                <span class="cat-name">{{ row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="分类说明" min-width="280" show-overflow-tooltip />
            <el-table-column label="知识条目" width="110" align="center">
              <template #default="{ row }">{{ row.articleCount }} 篇</template>
            </el-table-column>
            <el-table-column label="操作" width="140" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="openCategoryDialog(row)">编辑</el-button>
                <el-button link type="danger" @click="removeCategory(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane name="expert">
          <template #label>
            专家入驻
            <el-badge v-if="pendingExpertCount" :value="pendingExpertCount" type="warning" class="tab-badge" />
          </template>

          <div class="toolbar">
            <el-form :model="expertFilters" :inline="true" class="toolbar-form">
              <el-form-item label="关键字">
                <el-input
                  v-model="expertFilters.keyword"
                  placeholder="姓名 / 单位 / 擅长方向"
                  clearable
                  style="width: 200px"
                  @keyup.enter="searchExperts"
                />
              </el-form-item>
              <el-form-item label="领域">
                <el-select v-model="expertFilters.field" placeholder="全部领域" clearable style="width: 150px">
                  <el-option v-for="f in expertFields" :key="f" :label="f" :value="f" />
                </el-select>
              </el-form-item>
              <el-form-item label="状态">
                <el-select v-model="expertFilters.status" placeholder="全部状态" clearable style="width: 130px">
                  <el-option v-for="s in expertStatusOptions" :key="s" :label="s" :value="s" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="searchExperts">
                  <el-icon><Search /></el-icon>
                  查询
                </el-button>
                <el-button @click="resetExpertFilters">重置</el-button>
              </el-form-item>
            </el-form>
            <el-button type="primary" plain class="add-btn" @click="openExpertDialog()">
              <el-icon><Plus /></el-icon>
              专家入驻登记
            </el-button>
          </div>

          <el-table v-loading="expertLoading" :data="expertList" stripe>
            <el-table-column label="专家" min-width="160">
              <template #default="{ row }">
                <div class="expert-cell">
                  <span class="expert-avatar">{{ row.name.slice(0, 1) }}</span>
                  <div>
                    <div class="expert-name">{{ row.name }}</div>
                    <div class="expert-sub">{{ row.title }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="field" label="领域" width="130" />
            <el-table-column prop="organization" label="所在单位" min-width="200" show-overflow-tooltip />
            <el-table-column prop="years" label="从业年限" width="100" align="center">
              <template #default="{ row }">{{ row.years }} 年</template>
            </el-table-column>
            <el-table-column prop="specialty" label="擅长方向" min-width="200" show-overflow-tooltip />
            <el-table-column label="文章" width="80" align="center">
              <template #default="{ row }">{{ row.articleCount }} 篇</template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="expertStatusTag(row.status)" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="joinTime" label="入驻时间" width="165" />
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <template v-if="row.status === '待审核'">
                  <el-button link type="success" @click="approveExpert(row)">通过入驻</el-button>
                  <el-button link type="warning" @click="rejectExpert(row)">驳回</el-button>
                </template>
                <el-button link type="primary" @click="openExpertDialog(row)">编辑</el-button>
                <el-button link type="danger" @click="removeExpert(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-empty v-if="!expertLoading && !expertList.length" description="未找到匹配的专家" />

          <div v-if="expertTotal" class="pagination-wrap">
            <el-pagination
              background
              layout="total, sizes, prev, pager, next, jumper"
              :total="expertTotal"
              :current-page="expertPage"
              :page-size="expertPageSize"
              :page-sizes="[10, 20, 30]"
              @current-change="handleExpertPageChange"
              @size-change="handleExpertSizeChange"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 知识条目新增/编辑 -->
    <el-dialog v-model="articleDialogVisible" :title="articleForm.id ? '编辑知识条目' : '新增知识条目'" width="720px">
      <el-form ref="articleFormRef" :model="articleForm" :rules="articleRules" label-width="90px">
        <el-form-item label="文章标题" prop="title">
          <el-input v-model="articleForm.title" placeholder="请输入文章标题" maxlength="60" show-word-limit />
        </el-form-item>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="知识分类" prop="category">
              <el-select v-model="articleForm.category" placeholder="请选择分类" style="width: 100%">
                <el-option v-for="c in articleCategories" :key="c" :label="c" :value="c" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关联专家" prop="expertId">
              <el-select v-model="articleForm.expertId" placeholder="请选择专家" filterable style="width: 100%">
                <el-option
                  v-for="e in expertOptions"
                  :key="e.id"
                  :label="`${e.name}（${e.field}）`"
                  :value="e.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="文章摘要">
          <el-input v-model="articleForm.summary" type="textarea" :rows="2" placeholder="选填，不填则自动截取正文前 80 字" />
        </el-form-item>
        <el-form-item label="文章正文" prop="content">
          <el-input
            v-model="articleForm.content"
            type="textarea"
            :rows="7"
            placeholder="支持多段，使用换行分段"
          />
        </el-form-item>
        <el-form-item label="标签">
          <el-select
            v-model="articleForm.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="输入后回车创建标签，如：水稻、稻瘟病"
            style="width: 100%"
          >
            <el-option v-for="t in articleForm.tags" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="设为推荐">
          <el-switch v-model="articleForm.recommend" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="articleDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="articleSaving" @click="submitArticle">保存</el-button>
      </template>
    </el-dialog>

    <!-- 分类新增/编辑 -->
    <el-dialog v-model="categoryDialogVisible" :title="categoryForm.id ? '编辑分类' : '新增分类'" width="520px">
      <el-form ref="categoryFormRef" :model="categoryForm" :rules="categoryRules" label-width="90px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="分类说明">
          <el-input v-model="categoryForm.description" type="textarea" :rows="3" placeholder="简要说明该分类收录的知识方向" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="categorySaving" @click="submitCategory">保存</el-button>
      </template>
    </el-dialog>

    <!-- 专家入驻登记/编辑 -->
    <el-dialog v-model="expertDialogVisible" :title="expertForm.id ? '编辑专家档案' : '专家入驻登记'" width="680px">
      <el-form ref="expertFormRef" :model="expertForm" :rules="expertRules" label-width="90px">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="expertForm.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="职称" prop="title">
              <el-input v-model="expertForm.title" placeholder="如：高级农艺师" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属领域" prop="field">
              <el-select v-model="expertForm.field" placeholder="请选择领域" style="width: 100%">
                <el-option v-for="f in expertFields" :key="f" :label="f" :value="f" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="从业年限">
              <el-input-number v-model="expertForm.years" :min="1" :max="50" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="所在单位" prop="organization">
          <el-input v-model="expertForm.organization" placeholder="请输入专家所在单位" />
        </el-form-item>
        <el-form-item label="擅长方向" prop="specialty">
          <el-input v-model="expertForm.specialty" placeholder="如：稻瘟病、蔬菜灰霉病绿色防控" />
        </el-form-item>
        <el-form-item label="专家介绍">
          <el-input v-model="expertForm.intro" type="textarea" :rows="3" placeholder="简要介绍专家研究经历与服务方向" />
        </el-form-item>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="联系电话">
              <el-input v-model="expertForm.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电子邮箱">
              <el-input v-model="expertForm.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="expertDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="expertSaving" @click="submitExpert">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.page-desc {
  font-size: 13px;
  color: #868e96;
}

.tab-card {
  margin-bottom: 16px;
}

.tab-card :deep(.el-tabs__item) {
  font-size: 14px;
}

.tab-badge {
  margin-left: 4px;
}

.tab-badge :deep(.el-badge__content) {
  transform: translateY(-2px);
}

.stat-row {
  margin-bottom: 4px;
}

.mini-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  background: #f8f9fa;
  margin-bottom: 14px;
  border-left: 3px solid #adb5bd;
}

.mini-stat.green {
  border-left-color: #40c057;
}

.mini-stat.orange {
  border-left-color: #f59f00;
}

.mini-stat.gray {
  border-left-color: #adb5bd;
}

.mini-label {
  font-size: 13px;
  color: #868e96;
}

.mini-value {
  font-size: 20px;
  font-weight: 700;
  color: #1f2d3d;
}

.mini-value em {
  font-style: normal;
  font-size: 12px;
  font-weight: 400;
  color: #868e96;
  margin-left: 2px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 12px;
}

.toolbar-form {
  flex: 1;
}

.toolbar-tip {
  font-size: 13px;
  color: #868e96;
  line-height: 32px;
}

.add-btn {
  flex-shrink: 0;
}

.article-title {
  font-weight: 600;
  color: #1f2d3d;
}

.rec-tag {
  margin-left: 6px;
}

.article-sub {
  font-size: 12px;
  color: #adb5bd;
  margin-top: 4px;
}

.cat-name {
  font-weight: 600;
  color: #1f2d3d;
}

.expert-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.expert-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #40c057, #2b8a3e);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.expert-name {
  font-weight: 600;
  color: #1f2d3d;
}

.expert-sub {
  font-size: 12px;
  color: #868e96;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}
</style>
