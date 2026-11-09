<script setup>
import { computed, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getKnowledgeOverviewApi } from '@/api'

const loading = ref(true)
const data = ref(null)
const activeField = ref('')
const articleVisible = ref(false)
const currentArticle = ref(null)
const expertVisible = ref(false)
const currentExpert = ref(null)

const filteredExperts = computed(() => {
  if (!data.value) return []
  if (!activeField.value) return data.value.experts
  return data.value.experts.filter((e) => e.field === activeField.value)
})

const articleParagraphs = computed(() => {
  if (!currentArticle.value) return []
  return currentArticle.value.content.split('\n').filter((p) => p.trim())
})

function openArticle(article) {
  currentArticle.value = article
  articleVisible.value = true
}

function openExpert(expert) {
  currentExpert.value = expert
  expertVisible.value = true
}

onMounted(async () => {
  try {
    data.value = await getKnowledgeOverviewApi()
  } catch (e) {
    ElMessage.error(e.message || '加载知识库总览失败')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div v-loading="loading" class="page-container">
    <div class="page-header">
      <h2 class="page-title">农业专家知识库总览</h2>
      <span class="page-desc">按领域展示入驻专家与权威农业知识文章，覆盖种植、植保、土肥、设施与质量安全</span>
    </div>

    <template v-if="data">
      <el-row :gutter="16" class="stat-row">
        <el-col :xs="12" :sm="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-icon green"><el-icon :size="22" color="#fff"><User /></el-icon></div>
            <div class="stat-info">
              <div class="stat-label">入驻专家</div>
              <div class="stat-value">{{ data.stats.expertCount }}<span>位</span></div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-icon blue"><el-icon :size="22" color="#fff"><Document /></el-icon></div>
            <div class="stat-info">
              <div class="stat-label">权威知识文章</div>
              <div class="stat-value">{{ data.stats.articleCount }}<span>篇</span></div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-icon orange"><el-icon :size="22" color="#fff"><Crop /></el-icon></div>
            <div class="stat-info">
              <div class="stat-label">病虫害图鉴</div>
              <div class="stat-value">{{ data.stats.pestCount }}<span>种</span></div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-icon purple"><el-icon :size="22" color="#fff"><FirstAidKit /></el-icon></div>
            <div class="stat-info">
              <div class="stat-label">防治方案</div>
              <div class="stat-value">{{ data.stats.planCount }}<span>套</span></div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :xs="24" :lg="16">
          <el-card shadow="never" class="section-card">
            <template #header>
              <div class="card-header">
                <span class="table-title">专家团队</span>
                <span class="record-count">累计文章阅读 {{ data.stats.totalViews }} 次</span>
              </div>
            </template>

            <div class="field-tabs">
              <el-check-tag :checked="activeField === ''" @change="activeField = ''">全部领域</el-check-tag>
              <el-check-tag
                v-for="f in data.fields"
                :key="f.name"
                :checked="activeField === f.name"
                @change="activeField = f.name"
              >
                {{ f.name }}（{{ f.count }}）
              </el-check-tag>
            </div>

            <el-row :gutter="14">
              <el-col v-for="expert in filteredExperts" :key="expert.id" :xs="24" :sm="12">
                <div class="expert-card" @click="openExpert(expert)">
                  <div class="expert-avatar">{{ expert.name.slice(0, 1) }}</div>
                  <div class="expert-main">
                    <div class="expert-name">
                      {{ expert.name }}
                      <el-tag size="small" effect="plain">{{ expert.title }}</el-tag>
                    </div>
                    <div class="expert-org">{{ expert.organization }}</div>
                    <div class="expert-specialty">{{ expert.field }} · {{ expert.specialty }}</div>
                    <div class="expert-meta">
                      <span>从业 {{ expert.years }} 年</span>
                      <span>文章 {{ expert.articleCount }} 篇</span>
                      <span>阅读 {{ expert.totalViews }}</span>
                    </div>
                  </div>
                </div>
              </el-col>
            </el-row>
            <el-empty v-if="!filteredExperts.length" description="该领域暂无入驻专家" />
          </el-card>
        </el-col>

        <el-col :xs="24" :lg="8">
          <el-card shadow="never" class="section-card">
            <template #header><span class="table-title">知识分类</span></template>
            <div class="category-list">
              <div v-for="c in data.categories" :key="c.id" class="category-item">
                <div class="category-head">
                  <span class="category-name">{{ c.name }}</span>
                  <span class="category-count">{{ c.count }} 篇</span>
                </div>
                <div class="category-desc">{{ c.description }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :xs="24" :md="12">
          <el-card shadow="never" class="section-card">
            <template #header>
              <div class="card-header">
                <span class="table-title">最新发布</span>
                <el-tag size="small" effect="plain">权威知识</el-tag>
              </div>
            </template>
            <div v-for="article in data.latestArticles" :key="article.id" class="article-item" @click="openArticle(article)">
              <div class="article-main">
                <div class="article-title">{{ article.title }}</div>
                <div class="article-summary">{{ article.summary }}</div>
                <div class="article-meta">
                  <el-tag size="small" effect="plain">{{ article.category }}</el-tag>
                  <span>{{ article.author }} · {{ article.authorOrg }}</span>
                  <span>{{ article.publishTime.slice(0, 10) }}</span>
                </div>
              </div>
              <div class="article-views">{{ article.views }}<span>阅读</span></div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :md="12">
          <el-card shadow="never" class="section-card">
            <template #header>
              <div class="card-header">
                <span class="table-title">热门阅读</span>
                <el-tag size="small" type="warning" effect="plain">TOP 5</el-tag>
              </div>
            </template>
            <div
              v-for="(article, idx) in data.hotArticles"
              :key="article.id"
              class="article-item compact"
              @click="openArticle(article)"
            >
              <div class="rank" :class="{ top: idx < 3 }">{{ idx + 1 }}</div>
              <div class="article-main">
                <div class="article-title">{{ article.title }}</div>
                <div class="article-meta">
                  <span>{{ article.author }}</span>
                  <span>{{ article.category }}</span>
                  <span>{{ article.views }} 次阅读</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </template>

    <el-drawer v-model="articleVisible" title="知识文章详情" size="520px">
      <template v-if="currentArticle">
        <div class="detail-title">{{ currentArticle.title }}</div>
        <div class="detail-meta">
          <el-tag size="small" effect="plain">{{ currentArticle.category }}</el-tag>
          <span>{{ currentArticle.author }}（{{ currentArticle.authorTitle }}）</span>
          <span>{{ currentArticle.authorOrg }}</span>
          <span>{{ currentArticle.publishTime }}</span>
          <span>{{ currentArticle.views }} 次阅读</span>
        </div>
        <div class="tag-row">
          <el-tag v-for="tag in currentArticle.tags" :key="tag" size="small" type="success" effect="plain">#{{ tag }}</el-tag>
        </div>
        <div class="detail-content">
          <p v-for="(p, idx) in articleParagraphs" :key="idx">{{ p }}</p>
        </div>
      </template>
    </el-drawer>

    <el-drawer v-model="expertVisible" title="专家介绍" size="440px">
      <template v-if="currentExpert">
        <div class="expert-detail-head">
          <div class="expert-avatar large">{{ currentExpert.name.slice(0, 1) }}</div>
          <div>
            <div class="detail-title">{{ currentExpert.name }}</div>
            <div class="detail-sub">{{ currentExpert.title }} · {{ currentExpert.field }}</div>
          </div>
        </div>
        <el-descriptions :column="1" border size="small" class="expert-desc">
          <el-descriptions-item label="所在单位">{{ currentExpert.organization }}</el-descriptions-item>
          <el-descriptions-item label="从业年限">{{ currentExpert.years }} 年</el-descriptions-item>
          <el-descriptions-item label="擅长方向">{{ currentExpert.specialty }}</el-descriptions-item>
          <el-descriptions-item label="发布文章">{{ currentExpert.articleCount }} 篇</el-descriptions-item>
          <el-descriptions-item label="文章阅读">{{ currentExpert.totalViews }} 次</el-descriptions-item>
          <el-descriptions-item label="入驻时间">{{ currentExpert.joinTime.slice(0, 10) }}</el-descriptions-item>
        </el-descriptions>
        <div class="detail-content">{{ currentExpert.intro }}</div>
      </template>
    </el-drawer>
  </div>
</template>

<style scoped>
.page-desc {
  font-size: 13px;
  color: #868e96;
}

.stat-row {
  margin-bottom: 16px;
}

.stat-card {
  margin-bottom: 16px;
}

.stat-card :deep(.el-card__body) {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.green {
  background: #2f9e44;
}

.stat-icon.blue {
  background: #1c7ed6;
}

.stat-icon.orange {
  background: #e8590c;
}

.stat-icon.purple {
  background: #7048e8;
}

.stat-label {
  font-size: 13px;
  color: #868e96;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #1f2d3d;
}

.stat-value span {
  font-size: 12px;
  color: #868e96;
  margin-left: 4px;
  font-weight: 400;
}

.section-card {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-title {
  font-weight: 600;
}

.record-count {
  font-size: 12px;
  color: #868e96;
  font-weight: 400;
}

.field-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.expert-card {
  display: flex;
  gap: 12px;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.expert-card:hover {
  border-color: #40c057;
  box-shadow: 0 4px 12px rgba(47, 158, 68, 0.12);
  transform: translateY(-1px);
}

.expert-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #40c057, #2f9e44);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
  flex-shrink: 0;
}

.expert-avatar.large {
  width: 60px;
  height: 60px;
  font-size: 24px;
}

.expert-main {
  flex: 1;
  min-width: 0;
}

.expert-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #1f2d3d;
}

.expert-org {
  font-size: 12px;
  color: #868e96;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.expert-specialty {
  font-size: 12px;
  color: #495057;
  margin-top: 6px;
  line-height: 1.5;
}

.expert-meta {
  display: flex;
  gap: 14px;
  font-size: 12px;
  color: #adb5bd;
  margin-top: 6px;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-item {
  border-left: 3px solid #40c057;
  padding: 6px 0 6px 12px;
}

.category-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-name {
  font-weight: 600;
  color: #1f2d3d;
}

.category-count {
  font-size: 12px;
  color: #2f9e44;
}

.category-desc {
  font-size: 12px;
  color: #868e96;
  margin-top: 4px;
  line-height: 1.5;
}

.article-item {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding: 12px 0;
  border-bottom: 1px dashed #e9ecef;
  cursor: pointer;
}

.article-item:last-child {
  border-bottom: none;
}

.article-item:hover .article-title {
  color: #2f9e44;
}

.article-main {
  flex: 1;
  min-width: 0;
}

.article-title {
  font-weight: 600;
  color: #1f2d3d;
  margin-bottom: 5px;
  transition: color 0.2s;
}

.article-summary {
  font-size: 12px;
  color: #868e96;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 12px;
  color: #adb5bd;
  margin-top: 8px;
  align-items: center;
}

.article-views {
  font-size: 18px;
  font-weight: 700;
  color: #2f9e44;
  text-align: center;
  flex-shrink: 0;
}

.article-views span {
  display: block;
  font-size: 11px;
  color: #adb5bd;
  font-weight: 400;
}

.article-item.compact {
  align-items: center;
}

.rank {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #f1f3f5;
  color: #868e96;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.rank.top {
  background: #ffd8a8;
  color: #e8590c;
}

.detail-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2d3d;
  line-height: 1.5;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  font-size: 12px;
  color: #868e96;
  margin-top: 10px;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.detail-content {
  margin-top: 18px;
  font-size: 14px;
  line-height: 1.9;
  color: #495057;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.detail-content p {
  margin: 0 0 10px;
}

.expert-detail-head {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.detail-sub {
  font-size: 12px;
  color: #868e96;
  margin-top: 4px;
}

.expert-desc {
  margin-bottom: 16px;
}
</style>
