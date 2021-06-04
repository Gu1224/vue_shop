<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{path:'/home'}">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="添加商品信息！" center show-icon :closable="false"></el-alert>
      <!-- 步骤条 -->
      <el-steps :space="200" :active="activeIndex" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 标签页 -->
      <el-form label-position="top" :model="addForm" :rules="addFormRules" ref="addFormRef">
        <el-tabs
          tab-position="left"
          style="margin-top:10px"
          @tab-click="tabClick"
          :before-leave="beforeLeave"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="categoryList"
                :props="propValue"
                @change="categoryChange"
                clearable
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item v-for="item in manyTableData" :label="item.attr_name" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  v-for="(item1,id) in item.attr_vals"
                  :label="item1"
                  :key="id"
                  border
                  size="medium"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in onlyTableData" :label="item.attr_name" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              :before-remove="beforeRemove"
              :headers="headerObj"
              list-type="picture"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加按钮 -->
            <el-button type="primary" class="btnAdd" @click="add()">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>

      <!-- 图片预览对话框 -->
      <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
        <img :src="previewPath" width="100%" />
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  created () {
    this.getCategories()
  },
  data () {
    return {
      // 商品分类列表
      categoryList: [],
      // 级联选择器值
      propValue: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        // 次级菜单的展开方式
        expandTrigger: 'hover',
        // 是否严格的遵守父子节点不互相关联
        checkStrictly: true
      },
      // 进度条当前步骤
      activeIndex: 0,
      // 当前选中的标签页
      activeValue: '',
      // 添加表单
      addForm: {
        goods_name: '',
        goods_cat: [],
        goods_price: '',
        goods_number: '',
        goods_weight: '',
        goods_introduce: '',
        pics: [],
        attrs: []
      },
      // 添加表单验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 动态参数数据
      manyTableData: [],
      // 静态属性数据
      onlyTableData: [],
      // 请求头
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 上传图片路径
      uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 预览路径
      previewPath: '',
      previewVisible: false
    }
  },
  methods: {
    // 获取所有的商品分类
    async getCategories () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.categoryList = res.data
    },
    // 商品分类选择,将选择的分类value赋值给addForm
    categoryChange (val) {
      if (this.addForm.goods_cat.length !== 3) this.addForm.goods_cat = []
    },
    // 标签页点击触发事件
    async tabClick (tab, event) {
      if (this.addForm.goods_cat.length !== 3) return
      this.activeIndex = Number(tab.index)
      // 获取商品参数
      if (this.activeIndex === 1) {
        this.getManyTableData()
      }
      // 获取商品属性
      if (this.activeIndex === 2) {
        this.getOnlyTabsleData()
      }
    },
    // 切换标签
    beforeLeave (activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类!')
        return false
      }
    },
    // 获取商品参数
    async getManyTableData () {
      const { data: res } = await this.$http.get(`categories/${this.catId}/attributes`, { params: { sel: 'many' } })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
      })
      this.manyTableData = res.data
    },
    // 获取商品属性
    async getOnlyTabsleData () {
      const { data: res } = await this.$http.get(`categories/${this.catId}/attributes`, { params: { sel: 'only' } })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.onlyTableData = res.data
    },
    // 处理图片预览效果
    handlePreview (file) {
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    // 处理移除图片的操作
    handleRemove (file, fileList) {
      const filePath = file.response.data.tmp_path
      const i = this.addForm.pics.indexOf(x =>
        x.pic === filePath
      )
      this.addForm.pics.splice(i, 1)
    },
    // 上传成功后操作
    handleSuccess (response, file, fileList) {
      if (response.meta.status !== 200) return this.$message.error(response.meta.msg)
      this.$message.success(response.meta.msg)
      const object = {
        pic: response.data.tmp_path
      }
      this.addForm.pics.push(object)
    },
    // 处理移除图片之前的操作
    beforeRemove (file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`)
    },
    // 设置addform
    setFormData () {
      // 将动态参数的value值赋值给addform
      this.manyTableData.forEach(item => {
        item.attr_vals.forEach(i => {
          const obj = {
            attr_id: item.attr_id,
            attr_value: i
          }
          this.addForm.attrs.push(obj)
        })
      })
      // 将动态参数的value值赋值给addform
      this.onlyTableData.forEach(item => {
        const obj = {
          attr_id: item.attr_id,
          attr_value: item.attr_vals
        }
        this.addForm.attrs.push(obj)
      })
      // 将分类转换成字符串
      this.addForm.goods_cat = this.addForm.goods_cat.join(',')
    },
    // 添加商品
    add () {
      // 设置addform
      this.setFormData()
      console.log('addForm', this.addForm)
      this.$refs.addFormRef.validate(async valid => {
        console.log(valid)
        if (!valid) return this.$message.error('请输入必要的数据项')
        const { data: res } = await this.$http.post('goods', this.addForm)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    catId () {
      return this.addForm.goods_cat.length === 3 ? this.addForm.goods_cat[2] : null
    }
  }
}
</script>

<style lang="less" scoped>
.btnAdd {
  margin-top: 10px;
}
</style>
