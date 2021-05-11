<template>
  <div>
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>

<script>
export default {
  data () {
    return {

    }
  },
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$message.success('登出成功')
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="less" scoped>
</style>
