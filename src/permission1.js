import router from '@/router'
import NProgress from 'nprogress' // progress bar
import '@/components/NProgress/nprogress.less' // progress bar custom style
import notification from 'ant-design-vue/es/notification'
function getCookie (name) {
  const arr = document.cookie.match(new RegExp('(^| )' + name + '=([^;]*)(;|$)'))
  if (arr != null) {
    return unescape(arr[2])
  } else {
    return null
  }
}
const allowList = ['/user/login', 'register', 'registerResult']
try {
  router.beforeEach((to, from, next) => {
    // 如果跳转的页面不存在，跳转到404页面
    NProgress.start()
    if (to.matched.length === 0) {
      next('/exception/404')
    }
    console.log(allowList.includes(to.name))
    if (allowList.includes(to.name)) {
      // 在免登录名单，直接进入
      next()
      return
}
    if (getCookie('session_tankmiles')) {
      if (to.path === '/user/login') {
        next('/dashboard/workplace')
      }
      next()
      NProgress.done()
    } else {
      if (to.path === '/user/login') {
        next()
      } else {
        notification.error({
          message: '错误',
          description: '获取用户信息失败，请重试'
        })
        NProgress.done()
        next('/user/login')
      }
    }
  })
} catch (err) {
  console.log(err)
}

router.afterEach(() => {
  NProgress.done() // finish progress bar
})
