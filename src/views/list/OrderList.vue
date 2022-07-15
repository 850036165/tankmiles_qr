<template>
  <page-header-wrapper>
    <a-card :bordered="false" :loading="cardLoading">
      <a-row>
        <a-col :sm="8" :xs="24">
          <info title="订单总量 (单)" :value="totalOrder.total+'单'" :bordered="true" />
        </a-col>
        <a-col :sm="8" :xs="24">
          <info title="订单完成率 (%)" :value="(totalOrder.finished/totalOrder.total*100).toFixed(1)+'%'" :bordered="true"/>
        </a-col>
        <a-col :sm="8" :xs="24">
          <info title="总成交额 (￥)" :value="totalOrder.totalMoney" :precision="2" />

        </a-col>
      </a-row>
    </a-card>

    <a-card
      style="margin-top: 24px"
      :bordered="false">
      <div slot="title">
        <a-button type="primary" icon="plus" @click="add" :value="searchValue">新增订单</a-button>
      </div>

      <div slot="extra">
        <a-radio-group v-model="status" @change="filterFinished">
          <a-radio-button value="all">全部</a-radio-button>
          <a-radio-button :value="0">进行中</a-radio-button>
          <a-radio-button :value="1">已完成</a-radio-button>
        </a-radio-group>
        <a-input-search style="margin-left: 16px; width: 272px;" v-model="searchValue" @search="onSearch" enter-button="搜索" />
      </div>

      <a-list
        @change="handleTableChange"
        size="default"
        :pagination="pagination"
        :loading="loading"
        @showSizeChange="handleSizeChange">
        <!--        <a-list-item :key="index" v-for="(item, index) in data">-->
        <!--          {{ item }}-->
        <!--        </a-list-item>-->
        <a-list-item :key="index" v-for="(item, index) in data">
          <a-list-item-meta :description="item.customerName">
            <a-avatar slot="avatar" size="large" shape="square" :src="item.URL">{{ item.name.slice(0,1) }}</a-avatar>
            <div slot="title" >
              <a style="font-size: 15px;font-weight: bold">{{ item.name }}</a> <a-tag color="#108ee9" v-if="item.orderType===1">
                服务单</a-tag>
            </div>
          </a-list-item-meta>
          <div slot="actions">
            <a-button type="link" :disabled="item.isFinished===1?true:false" @click="finishOrder(item)">交付</a-button>
          </div>
          <div slot="actions">
            <a-button @click="goOrderDetail(item.id)">编辑</a-button>
          </div>
          <div class="list-content">

            <div class="list-content-item" >
              <a-statistic style="width: 150px" title="Total" :precision="1" :value="item.price||0" suffix="CNY" ></a-statistic>
            </div>
            <div class="list-content-item">
              <span>创建日期</span>
              <p>{{ item.createTime }}</p>
            </div>
            <div class="list-content-item">
              <a-statistic style="width: 70px;display: flex;justify-content: center" :value="item.finishedNum||0">
                <template #suffix>
                  <span> / {{ item.quantity }}</span>
                </template></a-statistic>
            </div>
            <div class="list-content-item" v-if="item.orderType===1" style="width: 180px" >
              <span>订单备注</span>
              <ellipsis :length="100" tooltip style="display: inline-block">
                {{ item.remark }}
              </ellipsis>
            </div>
            <div class="list-content-item" v-if="item.orderType===0">
              <a-progress :percent="parseFloat((item.finishedNum/item.quantity*100).toFixed(2))" :status="item.isFinished?'success':'active'" style="width: 180px" />
            </div>
          </div>
        </a-list-item>
      </a-list>
      <a-modal
        layout="horizontal"
        v-model="finishOrderVisible"
        title="项目交付"
        @ok="handleOk"
        @cancel="handleCancel"
        :ok-button-props="{ props: { title: '确认交付' } }">
        <div style="margin: 0 10px">
          <a-form-model ref="form" :model="form" :label-col="labelCol" :wrapper-col="wrapperCol" :rules="rules">
            <a-form-model-item label="运单号" prop="trackingNo">
              <a-input v-model="form.trackingNo" />
            </a-form-model-item>
            <a-form-model-item label="交付时间" prop="date">
              <a-date-picker
                valueFormat="YYYY-MM-DD"
                v-model="form.date"
                format="YYYY-MM-DD"
                type="date"
                placeholder="选择时间"
                style="width: 100%;"
              />
            </a-form-model-item>
            <a-form-model-item label="备注" prop="desc">
              <a-input v-model="form.desc" type="textarea" />
            </a-form-model-item>
            <a-form-model-item label="交付设备">
              <a-table
                :rowClassName="(record, index) => (record.step !== 1 ? 'table-OK' : null)"
                rowKey="id"
                bordered
                tableLayout="auto"
                :columns="columns"
                :data-source="deviceData"
                :pagination="devicePagination"
                @change="handleTableChange1"
                size="small">
                <span slot="title" style="color: #004190;font-weight: bold">即将交付：{{ devicePagination.total+"/"+toBeFinishedOrder.quantity }}</span>
              </a-table>
            </a-form-model-item></a-form-model>
        </div>
      </a-modal>
    </a-card>
  </page-header-wrapper>
</template>

<script>
// 演示如何使用 this.$dialog 封装 modal 组件
import { Ellipsis } from '@/components'
import TaskForm from './modules/TaskForm'
import Info from './components/Info'
import { getDeviceList, getOrderList } from '@/api/manage'
import { formatTime } from '@/utils/util'
const columns = [
  {
    title: '设备号',
    dataIndex: 'deviceSn'
  },
  {
    title: '状态',
    dataIndex: 'step',
    customRender: (text) => {
      switch (text) {
        case 0:
          return '未绑定'
        case 1:
          return '待交付'
        case 2:
          return '已交付'
        case 3:
          return '已报废'
        default:
          return '未知'
      }
    }
  }
]
export default {
  name: 'OrderList',
  components: {
    TaskForm,
    Info,
    Ellipsis
  },
  data () {
    return {
      toBeFinishedOrder: {},
      labelCol: { span: 4 },
      wrapperCol: { span: 14 },
      form: {
        trackingNo: '',
        date: '',
        desc: ''
      },
      trackingNumber: '',
      deviceData: [],
      columns,
      finishOrderVisible: false,
      searchValue: '',
      loading: false,
      devicePagination: {
        current: 1,
        pageSize: 5,
        total: 0
      },
      pagination: {
        showSizeChanger: true,
        showTotal: function (total) {
          return `共${total}条记录`
        },
        pageSize: 5,
        pageSizeOptions: ['5', '10', '30', '40'],
        responsive: true,
        onShowSizeChange: this.handleSizeChange,
        onChange: this.handleTableChange },
      cardLoading: false,
      totalOrder: {},
      data: [],
      status: 'all',
      rules: {
        trackingNo: [
          { required: true, message: '请输入运单号', trigger: 'change' }
        ],
        date: [
          { required: true, message: '请选择交付时间', trigger: 'change' }
        ],
        desc: []
      }
    }
  },
  mounted () {
    this.getTotalOrder()
    this.handleTableChange(1, 5)
  },
  methods: {
    handleTableChange1 (pagination, filters, sorter) {
      console.log('change', pagination)
      const pager = { ...this.pagination }
      pager.current = pagination.current
      this.pagination = pager
      getDeviceList({
        pageSize: pagination.pageSize,
        pageNo: pagination.current,
        orderId: this.toBeFinishedOrder.id
      }).then(res => {
        console.log(res)
        this.deviceData = res.data
        this.devicePagination.total = res.paging.total
        this.devicePagination.current = res.paging.pageNo
        this.devicePagination.pageSize = res.paging.pageSize
      })
},
    getDeviceList (id, pageNo, pageSize) {
      getDeviceList({ orderId: id, pageNo, pageSize }).then(res => {
        this.deviceData = res.data
         this.devicePagination.total = res.paging.total
        this.devicePagination.current = res.paging.pageNo
        this.devicePagination.pageSize = res.paging.pageSize
        console.log('page', res.paging)
        console.log('pagination', this.devicePagination)
      })
    },
    handleCancel () {
      console.log('取消交付')
      this.finishOrderVisible = false
      this.$refs.form.resetFields()
    },
    handleOk () {
      console.log(this.form)
      // 检查表单是否通过验证
      this.$refs.form.validate(valid => {
        if (valid) {
          // 检查是否有设备未交付
          let isFinished = true
          this.deviceData.forEach(item => {
            if (item.step !== 1) {
              isFinished = false
            }
          })
          if (!isFinished) {
            this.$message.error('请检查订单内所有设备状态')
          } else {
            // 检查订单数量是否已满
            if (this.devicePagination.total < this.toBeFinishedOrder.quantity) {
              this.$message.warn('待交付设备数量与订单数量不符')
            } else {
              this.$message.success('提交成功')
            }
          }
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    finishOrder (item) {
      if (item.orderType === 0) {
        this.getDeviceList(item.id, 1, 5)
        this.toBeFinishedOrder = item
        this.finishOrderVisible = true
      } else {
        this.$confirm({
          title: '订单交付',
          content: '确认交付该订单？',
          onOk () {
            console.log('OK')
          }
        })
      }
    },
    goOrderDetail (id) {
      this.$router.push({ path: '/profile/order', query: { orderId: id } })
    },
    onSearch (value) {
      console.log(this.searchValue)
      this.handleTableChange(this.pagination.current, this.pagination.pageSize)
    },
    handleSizeChange (current, pageSize) {
     this.pagination.pageSize = pageSize
      this.handleTableChange(current, pageSize)
    },
    filterFinished () {
      this.handleTableChange(this.pagination.current, this.pagination.pageSize)
    },
    handleTableChange (page, pageSize) {
      this.loading = true
      const queryParams = {
        isFinished: this.status,
        pageNo: page,
        pageSize: pageSize,
        name: this.searchValue
      }
      if (this.status === 'all') {
        delete queryParams.isFinished
      }
      if (this.searchValue === '') {
        delete queryParams.name
      }
      getOrderList(queryParams).then(res => {
        this.data = res.data
        console.log(res)
        res.data.forEach(item => {
          item.createTime = formatTime(item.createTime, 'YYYY-MM-DD')
          item.customerName = item.customer.companyName
        })
        console.log(this.data)
        this.pagination.current = res.paging.pageNo
        this.pagination.pageSize = res.paging.pageSize
        this.pagination.total = res.paging.total
        this.loading = false
      })
    },
    getTotalOrder () {
      this.cardLoading = true
      this.$http.get('/api/total_order').then(res => {
        this.totalOrder = res.data
        setTimeout(() => {
          this.cardLoading = false
        }, 500)
      })
    },
    add () {
      this.$dialog(TaskForm,
        // component props
        {
          record: {},
          on: {
            ok () {
              console.log('ok 回调')
            },
            cancel () {
              console.log('cancel 回调')
            },
            close () {
              console.log('modal close 回调')
            }
          }
        },
        // modal props
        {
          title: '新增',
          width: 700,
          centered: true,
          maskClosable: false
        })
    },
    edit (record) {
      console.log('record', record)
      this.$dialog(TaskForm,
        // component props
        {
          record,
          on: {
            ok () {
              console.log('ok 回调')
            },
            cancel () {
              console.log('cancel 回调')
            },
            close () {
              console.log('modal close 回调')
            }
          }
        },
        // modal props
        {
          title: '操作',
          width: 700,
          centered: true,
          maskClosable: false
        })
    }
  }
}
</script>

<style lang="less" scoped>
/deep/ .table-OK td {
  color: #fa4807;
}
.ant-avatar-lg {
    width: 48px;
    height: 48px;
    line-height: 48px;
}

.list-content-item {
    color: rgba(0, 0, 0, .45);
    display: inline-block;
    vertical-align: middle;
    font-size: 14px;
    margin-left: 40px;
    span {
        line-height: 20px;
    }
    p {
        margin-top: 4px;
        margin-bottom: 0;
        line-height: 22px;
    }
}
</style>
