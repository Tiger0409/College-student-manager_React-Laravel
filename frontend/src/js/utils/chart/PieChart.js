
const { d3, nv } = window

const defaultSettings = {
  animationDuration: 350,
  onMount: (chart) => {},
  style: {}
}

class PieChart {
  constructor (selector, data, options) {
    this.settings = Object.assign({}, defaultSettings, options)
    this.selector = selector
    this.data = data
    this.chart = nv.models.pieChart()

    this.chart
      .x((d) => (d.label))
      .y((d) => (d.value))
      // .color((d) => (d.color))
      .width(this.settings.style.width)
      .height(this.settings.style.height)
      .valueFormat(d3.format('.0'))
      .showLegend(false)
      .showLabels(true)
      .labelType('value')

    this.settings.onMount(this.chart)

    this.initialized = false

    nv.utils.windowResize(this.chart.update)
    nv.addGraph(() => {
      this.loadGraph()
    })
  }

  loadGraph () {
    const { selector, data, chart, animationDuration } = this

    this.svg = d3.select(selector).append('svg').datum(data)
    this.svg.attr('width', this.settings.style.width)
    this.svg.attr('height', this.settings.style.height)
    this.svg.attr('class', 'pie-chart')
    this.svg.transition().duration(animationDuration).call(chart)
    this.initialized = true

    return chart
  }

  update (newData) {
    const { svg, chart, animationDuration } = this
    if (newData) {
      this.data = newData && newData
    }
    if (this.initialized && svg) {
      svg.datum(this.data).transition().duration(animationDuration).call(chart)
      nv.utils.windowResize(chart.update)
    }
  }
}

export default PieChart
