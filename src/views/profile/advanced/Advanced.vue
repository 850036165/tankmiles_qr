<template>
  <page-header-wrapper
    :title="`设备号：${deviceProfile.deviceSn}`"
    @tabChange="handleTabChange"
  >
    <template v-slot:content>
      <a-descriptions size="small" :column="isMobile ? 1 : 2">
        <a-descriptions-item label="ID">{{ deviceProfile.id }}</a-descriptions-item>
        <a-descriptions-item label="报修状态">
          <a-tag color="#004190" v-if="!deviceProfile.status">
            <a-icon type="check-circle" /> 正常
          </a-tag>
          <a-tag color="#f50" style="cursor: pointer" v-if="deviceProfile.status" @click="goHandleProblems">
            <a-icon type="exclamation-circle" /> 报修中
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="设备类型">{{ type.deviceType }}</a-descriptions-item>
        <a-descriptions-item label="关联订单">
          <a href="">{{ order.name||'暂未分配订单' }}</a>
        </a-descriptions-item>
        <a-descriptions-item label="SIM卡号">{{ deviceProfile.phone||'暂无' }}</a-descriptions-item>
        <a-descriptions-item label="IMEI">{{ deviceProfile.imei||'暂无' }}</a-descriptions-item>
        <a-descriptions-item label="备注">{{ deviceProfile.remarks||'暂无' }}</a-descriptions-item>
      </a-descriptions>
    </template>

    <!-- actions -->
    <template v-slot:extra>
      <a-button-group style="margin-right: 4px;" size="default">
        <a-button ghost type="primary" @click="assignDevice">分配订单</a-button>
        <a-button ghost type="primary" @click="edit">修改信息</a-button>
        <a-popconfirm
          placement="bottomRight"
          title="是否报废此设备？"
          ok-text="是"
          cancel-text="否"
          :disabled="deviceProfile.step===3"
          @confirm="disableDevice"
        >
          <a-button type="danger" ghost :disabled="deviceProfile.step===3">报废设备</a-button>
        </a-popconfirm>
      </a-button-group>
    </template>

    <template v-slot:extraContent>
      <a-row class="status-list">
        <a-col :xs="12" :sm="12">
          <div class="text" v-if="!deviceProfile.qrcode">二维码</div>
          <div class="heading">
            <span v-if="!deviceProfile.qrcode">未绑定</span>
            <img style="width: 120px" :src="qrData" :alt="deviceProfile.qrcode" />
          </div>
        </a-col>
        <a-col :xs="12" :sm="12">
          <div class="text">扫码次数</div>
          <div class="heading">{{ deviceProfile.scanTimes }}</div>
        </a-col>
      </a-row>
    </template>

    <a-card :bordered="false" title="状态节点">
      <a-steps :direction="isMobile && 'vertical' || 'horizontal'" :current="currentStep" :status="currentStep===3?'error':'process'" >
        <a-step v-for="(item,index) in stepName" :key="index">
          <template v-slot:title>
            <span>{{ item }}</span>
          </template>
          <template v-slot:description >
            <div class="antd-pro-pages-profile-advanced-style-stepDescription" v-if="deviceStep.length>0">
              操作人： {{ getValue(index) }}
              <div>{{ getValue1(index) }}</div>
            </div>
          </template>
        </a-step>
      </a-steps>
    </a-card>

    <a-card
      style="margin-top: 24px"
      :bordered="false"
      :tabList="operationTabList"
      :activeTabKey="operationActiveTabKey"
      @tabChange="(key) => {this.operationActiveTabKey = key}"
    >
      <a-table
        size="middle"
        bordered
        rowKey="id"
        v-if="operationActiveTabKey === '1'"
        :columns="reportColumns"
        :dataSource="reportData"
        :pagination="false"
      >
        <template
          slot="status"
          slot-scope="status">
          <a-badge :status="status===1?'error':'success'"/>
          {{ status===1?'未处理':'已处理' }}
        </template>
      </a-table>
      <a-table
        rowKey="id"
        size="middle"
        v-if="operationActiveTabKey === '2'"
        :columns="operationColumns"
        :dataSource="deviceStepTable"
        :pagination="false"
      >
        <template
          slot="step"
          slot-scope="step">
          <span>{{ step |stepFilter }}</span>
        </template>
      </a-table>
    </a-card>
    <a-modal
      title="分配订单"
      :visible="assignDeviceVisible"
      @ok="chooseOrder"
      @cancel="()=>{this.assignDeviceVisible = false; this.selectedOrder= {} }"
    >
      <div style="display: flex;justify-content: center;align-items: center">
        项目：
        <a-select labelInValue v-model="selectedOrder" size="default" style="width: 120px">
          <a-select-option v-for="item in orderList" :key="item.id">
            {{ item.name }}
          </a-select-option>
        </a-select>
      </div>
    </a-modal>
    <!--    创建修改设备信息modal-->
  </page-header-wrapper>
</template>

<script>
import { baseMixin } from '@/store/app-mixin'
import EditTaskForm from '@/views/list/modules/EditTaskForm'
import {
  getDeviceDetail,
  getDeviceStepBySn,
  getDeviceTypeById,
  getOrderById,
  getOrderList,
  getReportByDeviceId
} from '@/api/manage'
import { formatTime } from '@/utils/util'
export default {
  name: 'Advanced',
  components: {
    EditTaskForm
  },
  mixins: [baseMixin],
  data () {
    return {
      selectedOrder: {},
      orderList: [],
      assignDeviceVisible: false,
      reportData: [],
      deviceStepTable: [],
      currentStep: 0,
      stepName: [
        '创建设备',
        '绑定设备',
        '交付设备',
        '报废设备'
      ],
      deviceStep: [],
      qrData: '',
      type: {},
      order: {},
      deviceId: '',
      deviceProfile: {},
      tabActiveKey: 'detail',
      operationTabList: [
        {
          key: '1',
          tab: '报修日志'
        },
        {
          key: '2',
          tab: '操作日志'
        }
      ],
      operationActiveTabKey: '1',
      reportColumns: [
        {
          title: 'id',
          dataIndex: 'id',
          key: 'id'
        },
        {
          title: '当前状态',
          dataIndex: 'status',
          key: 'status',
          scopedSlots: { customRender: 'status' }
        },
        {
          title: '报修人',
          dataIndex: 'clientName',
          key: 'clientName'
        },
        {
          title: '联系方式',
          dataIndex: 'phone',
          key: 'phone'
        },
        {
          title: '故障',
          dataIndex: 'problem',
          key: 'problem'
        },
        {
          title: '报修时间',
          dataIndex: 'time',
          key: 'time',
          customRender: (text) => formatTime(text)
        },
        {
          title: '处理人',
          dataIndex: 'repairedBy',
          key: 'repairedBy'
        },
        {
          title: '处理时间',
          dataIndex: 'repairTime',
          key: 'repairTime',
          customRender: (text) => {
            if (text) {
              formatTime(text)
            }
          }
        },
        {
          title: '解决方案',
          dataIndex: 'solution',
          key: 'solution'
        }
      ],
      operationColumns: [
        {
          title: 'id',
          dataIndex: 'id',
          key: 'id'
        },
        {
          title: '操作人',
          dataIndex: 'operator',
          key: 'operator'
        },
        {
          title: '操作',
          dataIndex: 'step',
          key: 'step',
          scopedSlots: { customRender: 'step' }
        },
        {
          title: '操作时间',
          dataIndex: 'stepTime',
          key: 'stepTime',
          customRender: (text) => formatTime(text)
        }
      ]
    }
  },
  filters: {
    ifempty (values) {
      if (values) {
        return values
      } else return ''
},
  stepFilter (value) {
      let result
      switch (parseInt(value)) {
        case 0:result = '创建设备'
        break
        case 1:result = '绑定设备'
          break
        case 2:result = '交付设备'
          break
        case 3:result = '报废设备'
          break
      }
      return result
    }
  },
  methods: {
    edit () {
      const that = this
      console.log('deviceProfile', this.deviceProfile)
      const record = this.deviceProfile
      this.$dialog(EditTaskForm,
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
            postDataToFather (data) {
              console.log('handel 回调', data)
              that.getDeviceDetail()
            }
          }
        },
        // modal props
        {
          title: '修改信息',
          width: 700,
          centered: true,
          maskClosable: false
        })
    },
    chooseOrder () {
      console.log(this.selectedOrder)
    if (JSON.stringify(this.selectedOrder) === '{}') {
      this.$message.error('请选择要分配的项目')
    } else {
      this.$http.get(`/api/assignDevice?orderId=${this.selectedOrder.key}&deviceSn=${this.deviceProfile.deviceSn}`).then(res => {
        console.log(res)
        this.$message.success('分配成功')
        this.assignDeviceVisible = false
        this.deviceProfile.orderId = this.selectedOrder.key
        this.order.name = this.selectedOrder.label
        this.selectedOrder = {}
      }).catch((error) => {
        console.log(error.response)
        this.$message.error(`error@${error.response.data.msg}`)
      })
    }
    },
    goHandleProblems () {
      this.$router.push('/report')
    },
    assignDevice () {
      if (this.deviceProfile.step === 3) {
        this.$message.error('报废设备无法分配至订单')
        return
      }
      if (this.deviceProfile.orderId !== null) {
        this.$message.warn('该设备已分配订单，请修改信息')
        return
      }
      this.assignDeviceVisible = true
      getOrderList({ isFinished: 0 }).then(res => {
        this.orderList = res.data
      })
    },
    disableDevice () {
      console.log(this.deviceProfile.id)
      this.$http.get(`/api/disableDevice?deviceId=${this.deviceProfile.id}&deviceSn=${this.deviceProfile.deviceSn}`).then(res => {
        this.$message.success('操作成功')
        this.deviceProfile.step = 3
        getDeviceStepBySn({ deviceSn: this.deviceProfile.deviceSn }).then(res => {
          console.log('step', res)
          this.deviceStepTable = res.data
          if (res.data.length > 0) {
            this.deviceStep = res.data.sort((a, b) => {
              return a.step - b.step
            })
          }
          this.deviceStep = this.deviceStep.map(item => {
            item.stepTime = formatTime(item.stepTime)
            return item
          })
          if (this.deviceStep.length === 0) {
            this.currentStep = 0
          } else {
            this.currentStep = this.deviceStep[this.deviceStep.length - 1].step
          }
        })
      }).catch(() => this.$message.error('操作失败'))
    },
    getValue (index) {
      for (const item of this.deviceStep) {
        if (item.step === index) {
          return item.operator
        }
      }
    },
    getValue1 (index) {
      for (const item of this.deviceStep) {
        if (item.step === index) {
          return item.stepTime
        }
      }
    },
    getDeviceDetail () {
      getDeviceDetail(this.deviceId).then(res => {
        console.log(res)
        this.deviceProfile = res.data
        getReportByDeviceId({ deviceId: res.data.id }).then(res => {
          this.reportData = res.data
        })
        getDeviceTypeById(res.data.typeId).then(res => {
          this.type = res.data
        })
        getDeviceStepBySn({ deviceSn: res.data.deviceSn }).then(res => {
          console.log('step', res)
          this.deviceStepTable = res.data
          if (res.data.length > 0) {
          this.deviceStep = res.data.sort((a, b) => {
           return a.step - b.step
          })
}
          this.deviceStep = this.deviceStep.map(item => {
            item.stepTime = formatTime(item.stepTime)
            return item
          })
          if (this.deviceStep.length === 0) {
            this.currentStep = 0
          } else {
            this.currentStep = this.deviceStep[this.deviceStep.length - 1].step
          }
        })
        if (res.data.orderId) {
          getOrderById(res.data.orderId).then(res => {
          this.order = res.data
        })
         }
        if (res.data.qrcode) {
         this.$http.get(`/qrcode/create?code=${res.data.qrcode}`).then(res => {
          this.qrData = res.data
         })
        }
      }).catch(err => {
        console.log(err)
        this.$message.error(`发生错误`)
      })
    },
    handleTabChange (key) {
      this.tabActiveKey = key
    }
  },
  mounted () {
    this.getDeviceDetail()
  },
  created () {
    console.log(this.$route.query.deviceId)
    console.log(this.$route.params.pageNo)
    this.deviceId = this.$route.query.deviceId
  }
}
</script>

<style lang='less' scoped>

.detail-layout {
  margin-left: 44px;
}

.text {
  color: rgba(0, 0, 0, .45);
}

.heading {
  color: rgba(0, 0, 0, .85);
  font-size: 20px;
}

.no-data {
  color: rgba(0, 0, 0, .25);
  text-align: center;
  line-height: 64px;
  font-size: 16px;

  i {
    font-size: 24px;
    margin-right: 16px;
    position: relative;
    top: 3px;
  }
}

.mobile {
  .detail-layout {
    margin-left: unset;
  }

  .text {

  }

  .status-list {
    text-align: left;
  }
}
</style>
