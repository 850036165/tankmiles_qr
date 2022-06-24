<template>
  <a-form @submit="handleSubmit" :form="form" :confirm-loading="confirmLoading">
    <a-form-item
      label="PhoneNo"
      :labelCol="labelCol"
      :wrapperCol="wrapperCol"
    >
      <a-input v-decorator="['phone']" />
    </a-form-item>
    <a-form-item
      label="IMEI"
      :labelCol="labelCol"
      :wrapperCol="wrapperCol"
    >
      <a-input v-decorator="['imei']" />
    </a-form-item>
    <a-form-item
      label="所属订单"
      :labelCol="labelCol"
      :wrapperCol="wrapperCol"
    >
      <a-select v-decorator="['orderId', {rules:[{required: this.record.orderId, message: ''}]}]">
        <a-select-option :value="item.id" v-for="item in orderList" :key="item.id">{{ item.name }}</a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item
      label="备注"
      :labelCol="labelCol"
      :wrapperCol="wrapperCol"
    >
      <a-textarea v-decorator="['remarks']"></a-textarea>
    </a-form-item>
  </a-form>
</template>

<script>
import pick from 'lodash.pick'
import { getOrderList } from '@/api/manage'

const fields = ['phone', 'imei', 'orderId', 'remarks']

export default {
  name: 'EditTaskForm',
  props: {
    record: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      formerRecord: {},
      confirmLoading: false,
      deviceId: '',
      orderList: [],
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 13 }
      },
      form: this.$form.createForm(this)
    }
  },
  mounted () {
    getOrderList({ isFinished: 0 }).then(res => {
      this.orderList = res.data
    })
    console.log(pick(this.record, fields))
    this.deviceId = this.record.id
    this.formerRecord = pick(this.record, fields)
    this.record && this.form.setFieldsValue(pick(this.record, fields))
  },
  methods: {
    onOk () {
      console.log('监听了 modal ok 事件')
      return new Promise((resolve, reject) => {
        this.confirmLoading = true
        this.form.validateFields((err, values) => {
          if (err) {
            return resolve(err)
          } else {
            // 比较原始记录是否改变
            const isChanged = Object.keys(this.formerRecord).some(key => this.formerRecord[key] !== values[key])
            if (isChanged) {
              console.log('inside', values)
              this.$http.get(`/api/device/${this.deviceId}/edit?${this.$qs.stringify(values)}`).then(res => {
                this.$message.success('修改成功')
                this.confirmLoading = false
                this.$emit('postDataToFather', values)
                resolve(true)
              }).catch(errors => {
                console.log(errors.response)
                this.$message.error(errors.response.data.msg)
              })
            } else {
              this.$message.info('未检测到修改')
              return resolve(true)
            }
          }
        })
      })
    },
    onCancel () {
      console.log('监听了 modal cancel 事件')
      return new Promise(resolve => {
        resolve(true)
      })
    },
    handleSubmit () {
      console.log('submit')
      const { form: { validateFields } } = this
      validateFields((errors, values) => {
        if (!errors) {

        }
      })
    }
  }
}
</script>
