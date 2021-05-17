<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{path : '/home'}">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加分类按钮 -->
      <el-button type="primary" size="medium" @click="showAddDialog()">添加分类</el-button>
      <!-- 列表数据 -->
      <tree-table
        :data="categoryList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-index="true"
        border
      >
        <!-- 是否有效模板列 -->
        <template slot="isOk" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color:lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>
        <!-- 排序 -->
        <template slot="sort" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0" size="mini">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level === 1" type="success" size="mini">二级</el-tag>
          <el-tag v-else type="warning" size="mini">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="operate" slot-scope="scope">
          <el-button type="primary" size="mini" @click="showEditDialog(scope.row)">
            <i class="el-icon-edit"></i>
          </el-button>
          <el-button type="danger" size="mini" @click="deleteCate(scope.row)">
            <i class="el-icon-delete"></i>
          </el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 50]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addDialogVisible" width="50%" @close="closeAddDialog()">
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="90px"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="propValue"
            expandTrigger="hover"
            clearable
            change-on-select
            @change="parentCateChange()"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <!-- 底部操作按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCategory()">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改分类对话框 -->
    <el-dialog
      title="修改分类"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="closeEditDialog()"
    >
      <el-form
        :model="editCateForm"
        :rules="editCateFormRules"
        ref="editCateFormRef"
        label-width="90px"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部操作按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 商品分类数据列表
      categoryList: [],
      // 商品信息查询条件
      queryInfo: {
        type: 3,
        // 当前页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 6
      },
      // 分类列表数量
      total: 0,
      // tree-table列数据
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name',
          headerAlign: 'center'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isOk',
          align: 'center',
          headerAlign: 'center'
        },
        {
          label: '排序',
          type: 'template',
          template: 'sort',
          align: 'center',
          headerAlign: 'center'
        },
        {
          label: '操作',
          type: 'template',
          template: 'operate',
          align: 'center',
          headerAlign: 'center'
        }
      ],
      // 控制添加分类对话框显示隐藏
      addDialogVisible: false,
      // 控制修改分类对话框显示隐藏
      editDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加的分类的父级id
        cat_pid: 0,
        // 将要添加的分类名称
        cat_name: '',
        // 将要添加的分类层级
        cat_level: 0
      },
      // 添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入需要添加的分类名称', trigger: 'blur' }
        ]
      },
      editCateForm: {
        cat_name: '',
        cat_id: 0
      },
      editCateFormRules: {
        cat_name: [
          { required: true, message: '请输入需要添加的分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类列表
      parentCateList: [],
      // 级联选择器值
      propValue: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级分类的id数组
      selectedKeys: []
    }
  },
  created () {
    this.getCategoryList()
  },
  methods: {
    // 获取分类列表数据
    async getCategoryList () {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.categoryList = res.data.result
      this.total = res.data.total
    },
    // 监听pagesize改变事件
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCategoryList()
    },
    // 监听页码值改变事件
    handleCurrentChange (newNum) {
      this.queryInfo.pagenum = newNum
      this.getCategoryList()
    },
    // 展示添加分类对话框
    showAddDialog () {
      this.getParentCateList()
      this.addDialogVisible = true
    },
    // 关闭添加分类对话框
    closeAddDialog () {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
    },
    // 获取父级分类的分类列表
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.parentCateList = res.data
    },
    // 选择项发生改变时触发函数
    parentCateChange () {
      // 如果所选中的父级分类的id数组长度小于 1 ，则为一级分类
      if (this.selectedKeys.length < 1) this.addCateForm.cat_level = 0
      else this.addCateForm.cat_level = this.selectedKeys.length
      this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
    },
    // 添加分类
    addCategory () {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.addDialogVisible = false
        this.getCategoryList()
        this.$message.success(res.meta.msg)
      })
    },
    // 删除分类
    async deleteCate (category) {
      const confirm = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirm !== 'confirm') return this.$message.info('已取消删除操作')
      const { data: res } = await this.$http.delete('categories/' + category.cat_id)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.getCategoryList()
      this.$message.success(res.meta.msg)
    },
    // 显示编辑分类对话框
    showEditDialog (category) {
      this.editCateForm.cat_name = category.cat_name
      this.editCateForm.cat_id = category.cat_id
      this.editDialogVisible = true
    },
    // 编辑分类
    async editCate () {
      const { data: res } = await this.$http.put(`categories/${this.editCateForm.cat_id}`, { cat_name: this.editCateForm.cat_name })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.getCategoryList()
      this.editDialogVisible = false
    },
    // 关闭编辑对话框
    closeEditDialog () {
      this.$refs.editFormRef.resetFields()
    }
  }
}
</script>
<style lang="less" scoped>
.zk-table {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
