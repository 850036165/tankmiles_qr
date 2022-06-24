<template>
  <page-header-wrapper>
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="6" :sm="24">
              <a-form-item label="设备号">
                <a-input v-model="queryParam.deviceSn" placeholder=""/>
              </a-form-item>
            </a-col>
            <a-col :md="6" :sm="24">
              <a-form-item label="设备种类">
                <a-select v-model="queryParam.typeId" placeholder="请选择" default-value="0">
                  <a-select-option :value="item.id" v-for="item in deviceType" :key="item.id">{{ item.deviceType }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <template v-if="advanced">
              <a-col :md="6" :sm="24">
                <a-form-item label="状态">
                  <a-select v-model="queryParam.step" placeholder="请选择" default-value="0">
                    <a-select-option value="0">未绑定</a-select-option>
                    <a-select-option value="1">未出厂</a-select-option>
                    <a-select-option value="2">已交付</a-select-option>
                    <a-select-option value="3">残次品</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :md="6" :sm="24">
                <a-form-item label="报修状态">
                  <a-select v-model="queryParam.status" placeholder="请选择" default-value="0">
                    <a-select-option value="0">正常</a-select-option>
                    <a-select-option value="1">报修中</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </template>
            <a-col :md="!advanced && 8 || 24" :sm="24">
              <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
                <a-button type="primary" @click="$refs.table.refresh(true)">查询</a-button>
                <a-button style="margin-left: 8px" @click="() => this.queryParam = {}">重置</a-button>
                <a @click="toggleAdvanced" style="margin-left: 8px">
                  {{ advanced ? '收起' : '展开' }}
                  <a-icon :type="advanced ? 'up' : 'down'"/>
                </a>
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <div class="table-operator">
        <a-button type="primary" icon="plus" @click="handleAdd">新建设备</a-button>
        <a-dropdown :trigger="['click']">
          <a-menu slot="overlay">
            <a-menu-item key="1"><a-button type="primary" icon="export">导出列表</a-button></a-menu-item>
            <a-menu-item key="2"> <a-button type="primary" icon="import">导入IMEI</a-button></a-menu-item>
            <a-menu-item key="3"><a-button type="primary" icon="file">下载模板</a-button></a-menu-item>
          </a-menu>
          <a-button style="margin-left: 8px">
            文件操作 <a-icon type="down" />
          </a-button>
        </a-dropdown>
        <a-dropdown v-if="selectedRowKeys.length > 0">
          <a-menu slot="overlay">
            <a-menu-item key="1"><a-icon type="delete" />分配至订单</a-menu-item>
            <!-- lock | unlock -->
            <a-menu-item key="2"><a-icon type="lock" /></a-menu-item>
          </a-menu>
          <a-button style="margin-left: 8px">
            批量操作 <a-icon type="down" />
          </a-button>
        </a-dropdown>
      </div>

      <s-table
        class="ant-table-striped"
        :rowClassName="(record, index) => (index % 2 === 1 ? 'table-striped' : null)"
        :pagination="pagination"
        bordered
        ref="table"
        size="small"
        rowKey="id"
        :columns="columns"
        :data="loadData"
        :alert="false"
        :rowSelection="rowSelection"
        showPagination="auto"
      >
        <span slot="step" slot-scope="text">
          <a-badge :status="text | statusTypeFilter" :text="text | statusFilter" />
        </span>
        <span slot="status" slot-scope="text">
          <a-tag color="#004190" v-if="!text">
            <a-icon type="check-circle" /> 正常
          </a-tag>
          <a-tag color="#f50" v-if="text">
            <a-icon type="exclamation-circle" /> 报修中
          </a-tag>
        </span>
        <span slot="description" slot-scope="text">
          <ellipsis :length="4" tooltip>{{ text }}</ellipsis>
        </span>
        <span slot="types" slot-scope="text">
          <span>{{ text.deviceType }}</span>
        </span>
        <span slot="orders" slot-scope="text">
          <span>{{ text|orderFilter }}</span>
        </span>
        <!--        展开行-->
        <!--        <template slot="expandedRowRender" slot-scope="record">-->
        <!--          <p style="margin: 0">-->
        <!--            {{ record }}-->
        <!--          </p>-->
        <!--        </template>-->
        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="goDetail(record)">详细信息</a>
          </template>
        </span>
      </s-table>

      <step-by-step-modal :visible="visible" :typeList="deviceType" ref="modal" @ok="handleOk" @cancel="handleCancel"/>
    </a-card>
  </page-header-wrapper>
</template>

<script>

import { STable, Ellipsis } from '@/components'
import { getDeviceList, getDeviceType, getOrderList } from '@/api/manage'

import StepByStepModal from './modules/StepByStepModal'
import CreateForm from './modules/CreateForm'

const columns = [
  {
    title: 'ID',
    dataIndex: 'id'
  },
  {
    title: '设备号',
    sorter: true,
    needTotal: false,
    dataIndex: 'deviceSn'
  },
  {
    title: '设备类型',
    dataIndex: 'types',
    scopedSlots: { customRender: 'types' }
  },
  {
    title: '状态',
    dataIndex: 'step',
    scopedSlots: { customRender: 'step' }
  },
  {
    title: '关联订单',
    dataIndex: 'orders',
    scopedSlots: { customRender: 'orders' }
  },
  {
    title: '报修状态',
    dataIndex: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: '150px',
    scopedSlots: { customRender: 'action' }
  }
]

const statusMap = {
  0: {
    status: 'default',
    text: '未绑定'
  },
  1: {
    status: 'processing',
    text: '未出厂'
  },
  2: {
    status: 'success',
    text: '已交付'
  },
  3: {
    status: 'error',
    text: '残次品'
  }
}
let that
export default {
  name: 'TableList',
  components: {
    STable,
    Ellipsis,
    CreateForm,
    StepByStepModal
  },
  data () {
    this.columns = columns
    return {
      orderList: [],
      deviceType: [],
      pagination: {
        size: 'large',
        showTotal: function (total) {
        return `共${total}台`
        }
      },
      // create model
      visible: false,
      confirmLoading: false,
      mdl: null,
      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {},
      // 加载数据方法 必须为 Promise 对象
      loadData: parameter => {
        const requestParameters = Object.assign({}, parameter, this.queryParam)
        console.log('loadData request parameters:', requestParameters)
        return getDeviceList(requestParameters)
          .then(res => {
            return res
          }).catch(err => {
            this.$message.error(`请求错误@${err}`)
          })
      },
      selectedRowKeys: [],
      selectedRows: []
    }
  },
  filters: {
    statusFilter (type) {
      return statusMap[type].text
    },
    statusTypeFilter (type) {
      return statusMap[type].status
    },
    deviceTypeFilter (type) {
        for (const item of that.deviceType) {
          if (item.id === type) {
            return item.deviceType
          }
        }
    },
    orderFilter (value) {
     if (value !== null) {
       return value.name
     } else {
       return '未分配订单'
     }
    }
  },
  beforeCreate () {
    that = this
  },
  created () {
    getDeviceType().then(res => {
      this.deviceType = res.data
    }).catch(err => {
      this.$message.error(`请求类型错误@${err}`)
    })
    getOrderList({ isFinished: 0 }).then(res => {
      this.orderList = res.data
    }).catch(err => {
      this.$message.error(`请求订单错误@${err}`)
    })
  },
  computed: {
    rowSelection () {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange
      }
    }
  },
  methods: {
    handleAdd () {
      this.mdl = null
      this.visible = true
    },
    handleOk () {
      const form = this.$refs.modal.form
      this.confirmLoading = true
      form.validateFields((errors, values) => {
        if (!errors) {
          console.log('values', values)
          this.visible = false
          this.confirmLoading = false
          // 重置表单数据
          form.resetFields()
          // 刷新表格
          this.$refs.table.refresh()
          this.$message.success('创建成功')
        } else {
          this.confirmLoading = false
        }
      })
    },
    handleCancel () {
      this.visible = false
      const form = this.$refs.modal.form
      form.resetFields() // 清理表单数据（可不做）
    },
    goDetail (record) {
     console.log(record)
      this.$router.push({ path: '/profile/device', query: { deviceId: record.id } })
    },
    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    toggleAdvanced () {
      this.advanced = !this.advanced
    },
    resetSearchForm () {
      this.queryParam = {}
    }
  }
}
</script>
<style scoped>
/deep/.ant-table-striped .table-striped td {
  background-color: #fafafa;
}
</style>
