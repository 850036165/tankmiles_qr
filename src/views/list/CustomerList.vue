<template>
  <page-header-wrapper

  >
    <template v-slot:content>
      <a-row :gutter="10">
        <a-col :span="3">
          <a-card style="display: flex;align-items: center">
            <a-statistic
              title="客户总数"
              :value="totalCustomer.totalCustomer"
              suffix="个"
            >
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="20">
          <div style="display: flex;flex-direction: row;gap: 10px">
            <a-card >
              <a-tooltip>
                <template slot="title">
                  下单总额：￥{{ totalCustomer.Top3Customer[0].totalPrice }}
                </template>
                <a-statistic
                  style="cursor: pointer"
                  title="TOP1"
                  :value="totalCustomer.Top3Customer[0].companyName"
                  valueStyle="font-size: 20px;justify-content: center;display: flex;"
                >
                  <template #prefix>
                    <metal style="width: 30px;height: 30px"></metal>
                  </template>
                </a-statistic>
              </a-tooltip>
            </a-card>
            <a-card >
              <a-tooltip>
                <template slot="title">
                  下单总额：￥{{ totalCustomer.Top3Customer[1].totalPrice }}
                </template>
                <a-statistic
                  style="cursor: pointer"
                  title="TOP1"
                  :value="totalCustomer.Top3Customer[1].companyName"
                  valueStyle="font-size: 20px;justify-content: center;display: flex;"
                >
                  <template #prefix>
                    <metal1 style="width: 30px;height: 30px"></metal1>
                  </template>
                </a-statistic>
              </a-tooltip>
            </a-card>
            <a-card>
              <a-tooltip>
                <template slot="title">
                  下单总额：￥{{ totalCustomer.Top3Customer[2].totalPrice }}
                </template>
                <a-statistic
                  style="cursor: pointer"
                  title="TOP1"
                  :value="totalCustomer.Top3Customer[2].companyName"
                  valueStyle="font-size: 20px;justify-content: center;display: flex;"
                >
                  <template #prefix>
                    <metal2 style="width: 30px;height: 30px"></metal2>
                  </template>
                </a-statistic>
              </a-tooltip>
            </a-card>
          </div>
        </a-col>
      </a-row>
    </template>
    <!--    <template v-slot:extraContent>-->
    <!--      <div style="width: 155px; margin-top: 10px;"><img style="width: 100%" :src="extraImage" /></div>-->
    <!--    </template>-->
    <!--    <template slot="extra">-->
    <!--      <a-button type="primary" >新增客户</a-button>-->
    <!--    </template>-->
    <a-card
      style="margin-top: 24px"
      :bordered="false">
      <div slot="title">
        <a-button type="primary" icon="plus" @click="add" style="color: white">新增客户</a-button>
      </div>

      <div slot="extra">
        <a-input-search style="margin-left: 16px; width: 272px;" v-model="searchValue" @search="onSearch" enter-button="搜索" />
      </div>
      <a-list
        :loading="loading"
        @change="handleTableChange"
        rowKey="id"
        :grid="{gutter: 24, lg: 3, md: 2, sm: 1, xs: 1}"
        :dataSource="dataSource"
        class="card-list"
        :pagination="listPagination"
      >
        <a-list-item slot="renderItem" slot-scope="item,index" style="height: 475px">
          <a-card :hoverable="true">
            <template slot="actions" class="ant-card-actions">
              <a-tooltip>
                <template slot="title">
                  发送邮件
                </template>
                <a-icon key="mail" type="mail" />
              </a-tooltip>
              <a-tooltip>
                <template slot="title">
                  复制
                </template>
                <a-icon key="copy" type="copy" @click="doCopy(item)"/>
              </a-tooltip>
              <a-tooltip>
                <template slot="title">
                  编辑
                </template>
                <a-icon key="edit" type="edit" />
              </a-tooltip>
            </template>
            <a-card-meta>
              <a-avatar
                slot="avatar"
                :src="item.url"
              />
              <p slot="title" style="font-size: 18px;margin:0 0 0 5px">
                {{ item.companyName }}
              </p>
            </a-card-meta>
            <a-tabs default-active-key="1" ref="tabs" @change="changeTab(index,$event)">
              <a-tab-pane key="1" tab="基本信息">
                <a-descriptions
                  size="small"
                  bordered
                  :column="1"
                >
                  <a-descriptions-item label="联系人">
                    {{ item.contactName }}
                  </a-descriptions-item>
                  <a-descriptions-item label="联系电话">
                    {{ item.phone }}
                  </a-descriptions-item>
                  <a-descriptions-item label="邮箱">
                    <a :href="`mailto:${item.email}`">{{ item.email }}</a>
                  </a-descriptions-item>
                  <a-descriptions-item label="下单总金额">
                    {{ item.totalPrice }} CNY
                  </a-descriptions-item>
                  <a-descriptions-item label="下单总数">
                    {{ item.totalCount }}单
                  </a-descriptions-item>
                  <a-descriptions-item label="备注">
                    <ellipsis :length="20" tooltip style="display: inline-block">
                      {{ item.remark }}
                    </ellipsis>
                  </a-descriptions-item>

                </a-descriptions>
              </a-tab-pane>
              <a-tab-pane key="2" tab="开票信息" force-render>
                <div>
                  <a-descriptions
                    size="small"
                    bordered
                    :column="1"
                  >
                    <a-descriptions-item label="公司名称">
                      {{ item.companyName }}
                    </a-descriptions-item>
                    <a-descriptions-item label="纳税人识别号">
                      {{ item.taxId }}
                    </a-descriptions-item>
                    <a-descriptions-item label="开户行">
                      {{ item.bank }}
                    </a-descriptions-item>
                    <a-descriptions-item label="银行账号">
                      {{ item.bankNumber }}
                    </a-descriptions-item>
                    <a-descriptions-item label="地址">
                      {{ item.address }}
                    </a-descriptions-item>
                    <a-descriptions-item label="固定电话">
                      {{ item.fixedPhone }}
                    </a-descriptions-item>
                  </a-descriptions>
                </div>
              </a-tab-pane>
            </a-tabs>

          </a-card>
        </a-list-item>
      </a-list></a-card>
  </page-header-wrapper>
</template>

<script>

import { Ellipsis, NumberInfo } from '@/components'
import metal from '@/assets/icons/jiangbei.svg?inline'
import metal1 from '@/assets/icons/jiangbei1.svg?inline'
import metal2 from '@/assets/icons/jiangbei2.svg?inline'
import { getTotalCustomer, getCustomerList } from '@/api/manage'
export default {
  name: 'CustomerList',
  components: {
    Ellipsis,
    NumberInfo,
    metal,
    metal1,
    metal2
  },
  data () {
    return {
      currentTab: '1',
      tabListNoTitle: [
        {
          key: 1,
          tab: '下单数据'
        },
        {
          key: 2,
          tab: '开票信息'
        }
      ],
      searchValue: '',
      loading: false,
      listPagination: {
        showSizeChanger: true,
        showTotal: function (total) {
          return `共${total}条记录`
        },
        pageSize: 5,
        pageSizeOptions: ['5', '10', '30', '40'],
        responsive: true,
        onShowSizeChange: this.handleSizeChange,
        onChange: this.handleTableChange },
      totalCustomer: {
        totalCustomer: 0,
        Top3Customer: [{
          companyName: '获取中...',
          totalPrice: 0
        }, {
          companyName: '获取中..',
          totalPrice: 0
        }, {
          companyName: '获取中..',
          totalPrice: 0
        }]
      },
      dataSource: []
    }
  },
  mounted () {
    getTotalCustomer().then(res => {
      this.totalCustomer = res
    })
   this.handleTableChange(1, 5)
  },
  methods: {
    changeTab (index, event) {
    this.dataSource[index].tab === '1' ? this.dataSource[index].tab = '2' : this.dataSource[index].tab = '1'
    },
    doCopy (value) {
      console.log('copy', value)
      let content = ''
      const text1 =
        `联系人:${value.contactName}
联系电话:${value.phone}
邮箱:${value.email}`
      const text2 =
        `公司名称:${value.companyName}
纳税人识别号:${value.taxId}
开户行:${value.bank}
银行账号:${value.bankNumber}
地址:${value.address}
固定电话:${value.fixedPhone}`
      if (value.tab === '1') {
        content = text1
      } else {
        content = text2
      }
      this.$copyText(content).then(message => {
        console.log('copy', message)
        this.$message.success('已复制')
      }).catch(err => {
        console.log('copy.err', err)
        this.$message.error('复制失败')
      })
    },
    add () {
      this.$router.push({
        path: '/form/create-customer'
      })
    },
    onSearch (value) {
      console.log(this.searchValue)
      this.handleTableChange(this.listPagination.current, this.listPagination.pageSize)
    },
    handleSizeChange (current, pageSize) {
      this.listPagination.pageSize = pageSize
      this.handleTableChange(current, pageSize)
    },
    handleTableChange (page, pageSize) {
      this.loading = true
      const queryParams = {
        pageNo: page,
        pageSize: pageSize,
        companyName: this.searchValue
      }
      if (this.searchValue === '') {
        delete queryParams.companyName
      }
      getCustomerList(queryParams).then(res => {
        this.dataSource = res.data
        this.dataSource.forEach(item => {
            item.tab = '1'
            return item
        })
        console.log(res)
        this.listPagination.current = res.paging.pageNo
        this.listPagination.pageSize = res.paging.pageSize
        this.listPagination.total = res.paging.total
        this.loading = false
      })
    }
  }
}
</script>

<style lang="less" scoped>
  @import "~@/components/index.less";

  .card-list {
    /deep/ .ant-card-body:hover {
      .ant-card-meta-title>a {
        color: @primary-color;
      }
    }

    /deep/ .ant-card-meta-title {
      margin-bottom: 12px;

      &>a {
        display: inline-block;
        max-width: 100%;
        color: rgba(0,0,0,.85);
      }
    }

  }

  .card-avatar {
    width: 48px;
    height: 48px;
    border-radius: 48px;
  }

  .ant-card-actions {
    background: #f7f9fa;

    li {
      float: left;
      text-align: center;
      margin: 12px 0;
      color: rgba(0, 0, 0, 0.45);
      width: 50%;

      &:not(:last-child) {
        border-right: 1px solid #e8e8e8;
      }

      a {
        color: rgba(0, 0, 0, .45);
        line-height: 22px;
        display: inline-block;
        width: 100%;
        &:hover {
          color: @primary-color;
        }
      }
    }
  }

  .new-btn {
    background-color: #fff;
    border-radius: 2px;
    width: 100%;
    height: 188px;
  }
  /deep/.ant-descriptions-bordered.ant-descriptions-small .ant-descriptions-item-label, .ant-descriptions-bordered.ant-descriptions-small .ant-descriptions-item-content {
    padding: 8px 9px;
  }
  /deep/.ant-descriptions-bordered.ant-descriptions-small .ant-descriptions-item-content {
    padding: 8px 9px;
  }
</style>
