<template>
  <a-modal
    :keyboard="false"
    title="创建设备"
    :width="640"
    :visible="visible"
    :closable="false"
    :confirmLoading="confirmLoading"
  >
    <a-spin :spinning="confirmLoading">
      <a-steps :current="currentStep" :style="{ marginBottom: '28px' }" size="small">
        <a-step title="选择创建模式" />
        <a-step :title="form.getFieldValue('method')===2?'输入设备起始编号':'选择设备类型'" />
        <a-step title="预分配订单" />
      </a-steps>
      <a-form :form="form">
        <!-- step1 -->
        <div v-show="currentStep === 0" style="display: flex;justify-content: center;">
          <a-form-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
          >
            <a-radio-group @change="()=>form.resetFields()" v-decorator="['method', { initialValue: 1 ,rules: [{required: true,message: '请选择创建模式' }]}]">
              <a-radio :style="radioStyle" :value="item.id" v-for="item in createMethod" :key="item.id">
                {{ item.method }}
              </a-radio>
            </a-radio-group>
          </a-form-item>
        </div>
        <div v-show="currentStep === 1">
          <a-form-item
            v-if="form.getFieldValue('method')===1"
            label="设备类型"
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
          >
            <a-select v-decorator="['prefix', { rules: [{required: true,message: '请选择设备类型' }]}]" style="width: 100%">
              <a-select-option v-for="item in typeList" :key="item.id" :value="item.prefix+'-'+item.id">{{ item.deviceType }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item
            v-if="form.getFieldValue('method')===2"
            label="设备编号"
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
          >
            <a-input v-decorator="['startSn', { rules: [{required: true,message: '请输入起始序列号' },{pattern: /^\d{4}\-\d{6}$/,message: '格式不正确'}]}]" placeholder="格式XXXX-XXXXXX" />
          </a-form-item>
          <a-form-item
            label="生成数量"
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
          >
            <a-input-number
              v-decorator="['quantity', { rules: [{required: true,message: '请输入数量' }]}]"
              id="inputNumber"
              :min="1"
              :max="100" />
          </a-form-item>
        </div>

        <div v-show="currentStep === 2">
          <a-form-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
          >
            <a-radio-group v-model="ifOrder" @change="getOrders">
              <a-radio :style="radioStyle" :value="1">
                不分配订单
              </a-radio>
              <a-radio :style="radioStyle" :value="2">
                选择订单
              </a-radio>
            </a-radio-group>
            <a-select v-if="ifOrder === 2" v-decorator="['orderId' ,{initialValue:1}]" style="margin-left: 10px;width: 120px">
              <a-select-option :value="item.id" v-for="item in order" :key="item.id">{{ item.name }}</a-select-option></a-select>
          </a-form-item>
        </div>
        <!-- step1 end -->
      </a-form>
    </a-spin>
    <template slot="footer">
      <a-button key="back" @click="backward" v-if="currentStep > 0" :style="{ float: 'left' }">上一步</a-button>
      <a-button key="cancel" @click="handleCancel">取消</a-button>
      <a-button key="forward" :loading="confirmLoading" type="primary" @click="handleNext(currentStep)">
        {{ currentStep === 2 && '创建' || '下一步' }}
      </a-button>
    </template>
  </a-modal>
</template>

<script>

import { getOrderList } from '@/api/manage'

const stepForms = [
  ['method'],
  ['prefix', 'startSn', 'quantity'],
  ['orderId']
]
export default {
  name: 'StepByStepModal',
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    // eslint-disable-next-line vue/require-default-prop
    typeList: {
      type: Array,
      required: false
    }
  },
  data () {
    return {
      ifOrder: 1,
      order: null,
      createMethod: [
        { id: 1, method: '自动创建设备' },
        { id: 2, method: '手动创建设备' }
      ],
      createMethodResult: 1,
      radioStyle: {
        display: 'block',
        height: '30px',
        margin: '10px',
        lineHeight: '30px'
      },
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 13 }
      },
      confirmLoading: false,
      currentStep: 0,
      mdl: {},
      form: this.$form.createForm(this)
    }
  },
  methods: {
    getOrders () {
      getOrderList().then(res => {
        this.order = res.data
      })
    },
    handleNext (step) {
      const { form: { validateFields } } = this
      const currentStep = step + 1
      if (currentStep <= 2) {
        // stepForms
        validateFields(stepForms[this.currentStep], (errors, values) => {
          if (!errors) {
            this.currentStep = currentStep
          }
        })
        return
      }
      // last step
      this.confirmLoading = true
      validateFields((errors, values) => {
        console.log('errors:', errors, 'val:', values)
        if (!errors) {
          console.log('values:', values)
            this.confirmLoading = false
            // this.$emit('ok', values)
          let url
           if (values.method === 1) {
          console.log('create auto')
              url = `/api/device_generate/auto?prefix=${values.prefix}&quantity=${values.quantity}`
           } else if (values.method === 2) {
             console.log('create manual')
              url = `/api/device_generate/manual?startSn=${values.startSn}&quantity=${values.quantity}`
           }
          if (values.orderId) {
            url = url.concat(`&orderId=${values.orderId}`)
            console.log('url', url)
          }
          // eslint-disable-next-line
          this.$http.get(url).then(res => {
            this.$emit('ok')
            this.currentStep = 0
            this.ifOrder = 1
          }).catch(err => {
            console.log(err)
            this.$message.error(`创建失败@${err?.response?.data?.msg || '未知错误'}`)
            // this.handleCancel()
          })
        } else {
          this.confirmLoading = false
        }
      })
    },
    backward () {
      this.currentStep--
    },
    handleCancel () {
      // clear form & currentStep
      this.$emit('cancel')
      this.currentStep = 0
    }
  }
}
</script>
