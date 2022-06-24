<template>
  <global-footer class="footer custom-render" style="margin: 0">
    <template v-slot:links>
      <a href="https://www.tankmiles.com" target="_blank">@Tankmiles.com</a>
    </template>
    <template v-slot:copyright>
      中集安瑞环科技股份有限公司
    </template>
  </global-footer>
</template>

<script>
import { GlobalFooter } from '@ant-design-vue/pro-layout'

export default {
  name: 'ProGlobalFooter',
  components: {
    GlobalFooter
  }
}
</script>
