<template>
  <page-header-wrapper>
    <template v-slot:content>
      <div class="page-header-content">
        <div class="avatar">
          <a-avatar size="large" :src="user.headImgUrl" />
        </div>
        <div class="content">
          <div class="content-title">
            {{ timeFix }}！{{ user.nickname }}<span class="welcome-text">，{{ welcome }}</span>
          </div>
          <div>{{ user.job }} | 中集集团 - 中集安瑞环科技股份有限公司 - 智能业务部</div>
        </div>
      </div>
    </template>
    <template v-slot:extraContent>
      <div class="extra-content">
        <div class="stat-item">
          <a-statistic title="设备总数" :value="totalList.total" />
        </div>
        <div class="stat-item">
          <a-statistic title="已完成订单" :value="totalOrder.finished">
            <template slot="suffix" >
              <span>/ {{ totalOrder.total }}</span>
            </template>
          </a-statistic>
        </div>
        <div class="stat-item">
          <a-statistic title="已交付数量" :value="totalList.step3" />
        </div>
      </div>
    </template>

    <div>
      <a-row :gutter="24">
        <a-col :xl="16" :lg="24" :md="24" :sm="24" :xs="24">
          <a-card
            class="project-list"
            :loading="loading"
            style="margin-bottom: 24px;"
            :bordered="false"
            title="进行中的订单"
            :body-style="{ padding: 0 }"
          >
            <a slot="extra" @click="goOrderList">全部订单</a>
            <div>
              <a-card-grid class="project-card-grid" :key="i" v-for="(item, i) in orders">
                <a-card :bordered="false" :body-style="{ padding: 0 }">
                  <a-card-meta>
                    <div slot="title" class="card-title">
                      <a-avatar size="small" :style="{'color':'#ffffff', 'backgroundColor': '#004190'}">{{ item.name.slice(0,1) }}</a-avatar>
                      <a>{{ item.name }}<span v-if="item.orderType===0">-{{ item.quantity }}台</span>
                        <a-tag color="#108ee9" v-if="item.orderType===1" style="margin: 0 10px">服务单</a-tag>
                      </a>
                    </div>
                    <div slot="description" class="card-description">
                      预计交付时间：{{ item.finishDate }}
                      <a-progress :percent="parseFloat((item.finishedNum/item.quantity*100).toFixed(2))" :status="item.isFinished?'success':'active'" size="small" style="width: 80%" />
                    </div>
                  </a-card-meta>
                  <div class="project-item">
                    <a >创建人：{{ item.creator }}</a >
                    <span class="datetime">{{ calculateTime(item.updateTime) }}小时前</span>
                  </div>
                </a-card>
              </a-card-grid>
            </div>
          </a-card>

          <a-card :loading="loading" title="项目动态" :bordered="false">
            <a-list>
              <a-list-item :key="index" v-for="(item, index) in activities">
                <a-list-item-meta>
                  <a-avatar slot="avatar" size="small" style="color: #ffffff; background-color: #006ef5">{{ item.operator.slice(0,1) }}</a-avatar>
                  <div slot="title">
                    <span>{{ item.operator }}</span> <span>{{ item.step|formatRequest }}</span>设备
                    <router-link to="/list/device-list">{{ item.deviceSn }}</router-link>
                  </div>
                  <div slot="description">{{ item.stepTime }}</div>
                </a-list-item-meta>
              </a-list-item>
            </a-list>
          </a-card>
        </a-col>
        <a-col
          style="padding: 0 12px"
          :xl="8"
          :lg="24"
          :md="24"
          :sm="24"
          :xs="24">
          <a-card
            title="快速开始"
            style="margin-bottom: 24px"
            :bordered="false"
            :body-style="{ padding: 0 }"
          >
            <div class="item-group">
              <a>监控平台</a>
              <a>savvy平台</a>
              <a>新增订单</a>
              <a>新增设备</a>
              <a>客户管理</a>
              <a>查看报修</a>
            </div>
          </a-card>
          <a-card
            title="设备占比"
            style="margin-bottom: 24px"
            :loading="radarLoading"
            :bordered="false"
            :body-style="{ padding: 0 }"
          >
            <div style="min-height: 400px;">
              <!-- :scale="scale" :axis1Opts="axis1Opts" :axis2Opts="axis2Opts"  -->
              <radar :data="radarData" />
            </div>
          </a-card>
          <a-card :loading="loading" title="团队成员" :bordered="false">
            <div>
              <a-list item-layout="horizontal" :data-source="teams">
                <a-list-item slot="renderItem" slot-scope="item">
                  <a-list-item-meta
                    :description="item.email"
                  >
                    <a slot="title" href="">
                      {{ item.nickname }}-{{ item.job }}
                    </a>
                    <template #avatar>
                      <a-avatar :src="item.headImgUrl"> <template #icon><a-icon type="user"/></template></a-avatar>
                    </template>
                  </a-list-item-meta>
                </a-list-item>
              </a-list>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </page-header-wrapper>
</template>

<script>
import { timeFix, welcome } from '@/utils/util'
import { PageHeaderWrapper } from '@ant-design-vue/pro-layout'
import { Radar } from '@/components'
import moment from 'moment'
// const DataSet = require('@antv/data-set')

export default {
  name: 'Workplace',
  components: {
    PageHeaderWrapper,
    Radar
  },
filters: {
  formatRequest (value) {
    let name = null
    switch (value) {
      case 0 : name = '创建'
        break
      case 1 : name = '绑定'
        break
      case 2 : name = '交付'
        break
      case 3 : name = '报废'
        break
      default: name = '未知'
        break
    }
    return name
  }
},
  data () {
    return {
      welcome: welcome(),
      timeFix: timeFix(),
      avatar: '',
      user: {},
      orders: [],
      loading: true,
      radarLoading: true,
      activities: [],
      teams: [],
      radarData: [],
      totalList: [],
      totalOrder: []
    }
  },
  computed: {
  },
  created () {
   this.user = JSON.parse(window.localStorage.getItem('userInfo'))
  },
  mounted () {
    this.getOrders()
    this.getActivity()
    this.getTeams()
    this.initRadar()
    this.getTotalList()
    this.getTotalOrder()
  },
  methods: {
    goOrderList () {
      this.$router.push('/list/order-list')
    },
 randomColor () {
  let col = '#'
  for (let i = 0; i < 6; i++) col += parseInt(Math.random() * 16).toString(16)
  return col
},
    calculateTime (time) {
      const date1 = time // 开始时间
      const date2 = new Date() // 结束时间
      const date3 = date2.getTime() - new Date(date1).getTime()
      // 计算出相差天数
      // const days = Math.floor(date3 / (24 * 3600 * 1000))
      // 计算出小时数
      // const leave1 = date3 % (24 * 3600 * 1000) // 计算天数后剩余的毫秒数
      const hours = Math.floor(date3 / (3600 * 1000))

      return hours < 100 ? hours : '100+'
    },
    getOrders () {
      this.$http.get('/api/order?isFinished=0').then(res => {
        this.orders = res.data
        this.loading = false
      })
    },
    getTotalList () {
      this.$http.get('/api/device_list/getTotalDevice').then(res => {
        this.totalList.total = res.data.map(item => item.count).reduce((total, num) => { return total + num })
        this.totalList.step3 = res.data.find(item => item.step === 3).count
      })
    },
    getTotalOrder () {
      this.$http.get('/api/total_order').then(res => {
        this.totalOrder = res.data
      })
    },
    getActivity () {
      this.$http.get('/api/deviceStep?limit=10&orderColum=stepTime').then(res => {
        // this.activities = res.data
        this.activities = res.data.map(item => {
          item.stepTime = moment(item.stepTime).format('YYYY-MM-DD HH:mm:ss')
          return item
        })
      })
    },
    getTeams () {
      this.$http.post('/user/list', { currentPage: 1, pageSize: 20, orderBy: 'DESC' }).then(res => {
        this.teams = res.data.rows
      })
    },
    initRadar () {
      this.radarLoading = true
      this.$http.get('/api/device_list/getDeviceListRadar').then(res => {
        this.radarData = res.data
        this.radarLoading = false
      })
    }
  }
}
</script>

<style lang="less" scoped>
@import './Workplace.less';

.project-list {
  .card-title {
    font-size: 0;

    a {
      color: rgba(0, 0, 0, 0.85);
      margin-left: 12px;
      line-height: 24px;
      height: 24px;
      display: inline-block;
      vertical-align: top;
      font-size: 14px;

      &:hover {
        color: #004190;
      }
    }
  }

  .card-description {
    color: rgba(0, 0, 0, 0.45);
    height: 44px;
    line-height: 22px;
    overflow: hidden;
  }

  .project-item {
    display: flex;
    margin-top: 8px;
    overflow: hidden;
    font-size: 12px;
    height: 20px;
    line-height: 20px;

    a {
      color: rgba(0, 0, 0, 0.45);
      display: inline-block;
      flex: 1 1 0;

      &:hover {
        color: #004190;
      }
    }

    .datetime {
      color: rgba(0, 0, 0, 0.25);
      flex: 0 0 auto;
      float: right;
    }
  }

  .ant-card-meta-description {
    color: rgba(0, 0, 0, 0.45);
    height: 44px;
    line-height: 22px;
    overflow: hidden;
  }
}

.item-group {
  padding: 20px 0 8px 24px;
  font-size: 0;

  a {
    color: rgba(0, 0, 0, 0.65);
    display: inline-block;
    font-size: 14px;
    margin-bottom: 13px;
    width: 25%;
  }
  a:hover{

      color: #004190;

  }
}

.members {
  a {
    display: block;
    margin: 12px 0;
    line-height: 24px;
    height: 24px;

    .member {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.65);
      line-height: 24px;
      max-width: 100px;
      vertical-align: top;
      margin-left: 12px;
      transition: all 0.3s;
      display: inline-block;
    }

    &:hover {
      span {
        color: #004190;
      }
    }
  }
}

.mobile {
  .project-list {
    .project-card-grid {
      width: 100%;
    }
  }

  .more-info {
    border: 0;
    padding-top: 16px;
    margin: 16px 0 16px;
  }

  .headerContent .title .welcome-text {
    display: none;
  }
}
</style>
