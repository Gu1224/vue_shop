<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{path : '/home'}">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false" show-icon></el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader
            :options="categoryList"
            :props="opt_props"
            v-model="selectedKeys"
            @change="handleChange()"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- 标签页区域 -->
      <el-tabs v-model="activeName" @tab-click="handleClick()">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="showAddDialog()"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染标签 -->
                <el-tag
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  @close="deleteParam(i,scope.row)"
                  closable
                >{{item}}</el-tag>
                <!-- 文本输入框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" align="center"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name" align="center"></el-table-column>
            <el-table-column label="操作" align="center">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" @click="showEditDialog(scope.row)">
                  <i class="el-icon-edit"></i>修改
                </el-button>
                <el-button type="danger" size="mini" @click="deleteParams(scope.row)">
                  <i class="el-icon-delete"></i>删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性 按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="showAddDialog()"
          >添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染标签 -->
                <el-tag
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  @close="deleteParam(i,scope.row)"
                  closable
                >{{item}}</el-tag>
                <!-- 文本输入框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" align="center"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name" align="center"></el-table-column>
            <el-table-column label="操作" align="center">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" @click="showEditDialog(scope.row)">
                  <i class="el-icon-edit"></i>修改
                </el-button>
                <el-button type="danger" size="mini" @click="deleteParams(scope.row)">
                  <i class="el-icon-delete"></i>删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <!-- 添加对话框 -->
      <el-dialog
        :title="'添加' + this.text"
        :visible.sync="addFormVisible"
        width="50%"
        @close="closeAddDialog()"
      >
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="90px">
          <el-form-item :label="this.text" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部操作按钮 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addFormVisible=false">取消</el-button>
          <el-button type="primary" @click="addParams()">确定</el-button>
        </span>
      </el-dialog>
      <!-- 修改对话框 -->
      <el-dialog
        :title="'修改' + this.text"
        :visible.sync="editFormVisible"
        width="50%"
        @close="closeEditDialog()"
      >
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="90px">
          <el-form-item :label="this.text" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部操作按钮 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="editFormVisible=false">取消</el-button>
          <el-button type="primary" @click="editParams()">确定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 分类数据列表
      categoryList: [],
      // 级联选择框配置属性对象
      opt_props: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选择框选择内容
      selectedKeys: [],
      // 标签页当前激活页面
      activeName: 'many',
      // 动态参数列表数据
      manyTableData: [],
      // 静态属性列表数据
      onlyTableData: [],
      // 添加对话框可视化
      addFormVisible: false,
      // 添加表单
      addForm: {
        attr_name: '',
        attr_sel: 'many',
        attr_vals: ''
      },
      // 添加表单规则
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入值', trigger: 'blur' }
        ]
      },
      editFormVisible: false,
      // 编辑表单对象
      editForm: {
        catId: 0,
        attrId: 0,
        attr_name: '',
        attr_sel: '',
        attr_vals: ''
      },
      // 编辑表单规则
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入值', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCategoryList()
  },
  methods: {
    // 获取所有分类列表数据
    async getCategoryList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.categoryList = res.data
    },
    // 及联选择器监视
    handleChange () {
      this.getParamsData()
    },
    // 标签页监控
    handleClick () {
      this.getParamsData()
    },
    // 获取参数的列表数据
    async getParamsData () {
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
      }
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        item.inputVisible = false
        item.inputValue = ''
      })
      console.log(res.data)
      if (this.activeName === 'many') this.manyTableData = res.data
      else this.onlyTableData = res.data
    },
    // 显示添加动态参数对话框
    showAddDialog () {
      this.addFormVisible = true
    },
    // 添加动态参数
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.getParamsData()
        this.addFormVisible = false
      })
    },
    // 关闭添加对话框
    closeAddDialog () {
      this.$refs.addFormRef.resetFields()
    },
    // 显示编辑对话框
    showEditDialog (params) {
      this.editForm.attr_name = params.attr_name
      this.editForm.catId = params.cat_id
      this.editForm.attrId = params.attr_id
      this.editFormVisible = true
    },
    // 编辑参数
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.editForm.catId}/attributes/${this.editForm.attrId}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.getParamsData()
        this.editFormVisible = false
      })
    },
    // 关闭编辑对话框
    closeEditDialog () {
      this.$refs.editFormRef.resetFields()
    },
    // 删除参数
    async deleteParams (params) {
      const confirm = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirm !== 'confirm') return this.$message.info('已取消删除操作')
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/` + params.attr_id)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.getParamsData()
    },
    // 显示添加输入框
    showInput (row) {
      row.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 文本框失去焦点或按下enter时触发函数
    async handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 如果没有return，则证明有输入内容，需要处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrVals(row)
    },
    // 将 attr_vals 保存到数据库中
    async saveAttrVals (row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
    },
    // 删除参数
    deleteParam (i, row) {
      console.log(row)
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },
  computed: {
    // 计算已选分类框数组长度
    isBtnDisabled () {
      if (this.selectedKeys.length !== 3) return true
      return false
    },
    // 当前选中分类的三级id
    cateId () {
      if (this.selectedKeys.length === 3) return this.selectedKeys[2]
      return null
    },
    // 弹出框标题
    text () {
      if (this.activeName === 'many') return '动态参数'
      else return '静态属性'
    }
  }
}
</script>
<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.input-new-tag {
  width: 120px;
}
</style>
