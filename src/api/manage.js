import request from '@/utils/request'

const api = {
  deviceList: '/api/device',
  deviceType: '/wechat/device/type',
  orderList: '/api/order',
  deviceDetail: '/api/device/',
  findOrder: '/api/order/',
  findDeviceType: '/api/deviceType/',
  findDeviceStep: '/api/deviceStep',
  findDeviceReport: '/api/report'
}

export default api

export function getDeviceList (parameter) {
  return request({
    url: api.deviceList,
    method: 'get',
    params: parameter
  })
}
export function getDeviceDetail (deviceId, parameter) {
  return request({
    url: api.deviceDetail + deviceId,
    method: 'get',
    params: parameter
  })
}

export function getDeviceType (parameter) {
  return request({
    url: api.deviceType,
    method: 'get',
    params: parameter
  })
}

export function getOrderList (parameter) {
  return request({
    url: api.orderList,
    method: 'get',
    params: parameter
  })
}
export function getOrderById (orderId) {
  return request({
    url: api.findOrder + orderId,
    method: 'get'
  })
}
export function getDeviceTypeById (typeId) {
  return request({
    url: api.findDeviceType + typeId,
    method: 'get'
  })
}
export function getDeviceStepBySn (parameter) {
  return request({
    url: api.findDeviceStep,
    method: 'get',
    params: parameter
  })
}
export function getReportByDeviceId (parameter) {
  return request({
    url: api.findDeviceReport,
    method: 'get',
    params: parameter
  })
}
// id == 0 add     post
// id != 0 update  put
export function saveService (parameter) {
  return request({
    url: api.service,
    method: parameter.id === 0 ? 'post' : 'put',
    data: parameter
  })
}

export function saveSub (sub) {
  return request({
    url: '/sub',
    method: sub.id === 0 ? 'post' : 'put',
    data: sub
  })
}
