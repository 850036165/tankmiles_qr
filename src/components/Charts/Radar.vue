<template>
  <v-chart :forceFit="true" height="400" :data="data" :padding="[20, 20, 95, 20]" :scale="scale">
    <v-tooltip></v-tooltip>
    <v-axis :label="axis1Opts.label" :dataKey="axis1Opts.dataKey" :line="axis1Opts.line" :tickLine="axis1Opts.tickLine" :grid="axis1Opts.grid" />
    <v-axis :dataKey="axis2Opts.dataKey" :line="axis2Opts.line" :tickLine="axis2Opts.tickLine" :grid="axis2Opts.grid" />
    <v-legend dataKey="status" marker="circle" :offset="30" />
    <v-coord type="polar" radius="0.8" />
    <v-line position="type*count" color="status" :size="2" />
    <v-point position="type*count" color="status" :size="4" shape="circle" />
    <!--    <v-area position="type*count" color="status" />-->
  </v-chart>
</template>

<script>
const axis1Opts = {
  label: {
    rotate: '0',
    textStyle: {
    }
  },
  dataKey: 'type',
  line: null,
  tickLine: null,
  grid: {
    lineStyle: {
      lineDash: null
    },
    hideFirstLine: false
  }
}
const axis2Opts = {
  dataKey: 'count',
  line: null,
  tickLine: null,
  grid: {
    type: 'polygon',
    lineStyle: {
      lineDash: null
    }
  }
}

const scale = [
  {
    dataKey: 'count'
  }, {
    dataKey: 'status',
    alias: '类型'
  }
]

export default {
  name: 'Radar',
  props: {
    data: {
      type: Array,
      default: null
    }
  },
  data () {
    return {
      axis1Opts,
      axis2Opts,
      scale
    }
  }
}
</script>

<style scoped>

</style>
