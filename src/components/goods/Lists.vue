<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{path: '/home'}">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 顶部搜索与添加区域 -->
      <el-row :gutter="20">
        <!-- 顶部搜索 -->
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" @clear="getGoodsList()" clearable>
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList()"></el-button>
          </el-input>
        </el-col>
        <!-- 添加 -->
        <el-col :span="4">
          <el-button type="primary" @click="toAddPage()">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 主体数据区域 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index" align="center"></el-table-column>
        <el-table-column align="center" prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column align="center" prop="goods_price" label="商品价格（元）" width="75px"></el-table-column>
        <el-table-column align="center" prop="goods_weight" label="商品重量" width="70px"></el-table-column>
        <el-table-column align="center" prop="add_time" label="创建时间" width="120px">
          <template slot-scope="scope">{{scope.row.add_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="140px">
          <template slot-scope="scope">
            <!-- 编辑商品信息 -->
            <el-button class="el-icon-edit" type="primary" size="mini"></el-button>
            <!-- 删除商品信息 -->
            <el-button
              class="el-icon-delete"
              type="danger"
              size="mini"
              @click="deleteGoods(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
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
  </div>
</template>
<script>
export default {
  created () {
    this.getGoodsList()
  },
  data () {
    return {
      // 查询条件
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      // 商品列表
      goodsList: [],
      // 商品数目
      total: 0
    }
  },
  methods: {
    // 获取商品列表
    async getGoodsList () {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    // 监听pagesize改变事件
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 监听页码值改变事件
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    // 添加商品
    toAddPage () {
      this.$router.push('/goods/add')
    },
    // 删除商品
    async deleteGoods (id) {
      const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.delete(`goods/${id}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.getGoodsList()
      this.$message.success(res.meta.msg)
    }
  },
  computes () {

  }
}
</script>
<style lang="less" scoped>
.el-button {
  margin-left: 15px;
}
</style>
