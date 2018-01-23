const { d3, nv } = window

const defaultSettings = {
  animationDuration: 350,
  onMount: (chart) => {},
  style: { width: 400, height: 200, margin: { top: 10, right: 0, bottom: 50, left: 10 } }
}

class BarChart {
  constructor (selector, data, options) {
    this.settings = Object.assign({}, defaultSettings, options)
    this.selector = selector
    this.data = data
    this.chart = nv.models.discreteBarChart()

    this.chart
      .x((d) => (d.label))
      .y((d) => (d.value))
      // .color((d) => (d.color))

    this.chart
      .width(this.settings.style.width)
      .height(this.settings.style.height)
      .margin(this.settings.style.margin)

    this.chart.staggerLabels(true)
    this.chart.showValues(false)

    this.settings.onMount(this.chart)

    this.initialized = false

    nv.utils.windowResize(this.chart.update)
    nv.addGraph(() => {
      this.loadGraph()
    })
  }

  loadGraph () {
    const { selector, data, chart } = this
    
    this.svg = d3.select(selector).append('svg').datum(data)
    this.svg.attr('width', this.settings.style.width)
    this.svg.attr('height', this.settings.style.height)
    this.svg.attr('class', 'bar-chart')
    this.svg.transition().duration(this.settings.animationDuration).call(chart)
    this.initialized = true
    this.rotateLabel()
  }

  rotateLabel () {
    // rotate labels
    var $text = this.svg.selectAll('.nv-x.nv-axis > g').selectAll('g').selectAll('text')
    $text.attr('transform', 'translate(-8, 10) scale(0.8) rotate(-40)')
    $text.style('text-anchor', 'end')
  }

  update (newData) {
    const { svg, chart, settings } = this
    if (newData) {
      this.data = newData && newData
    }
    if (this.initialized && svg) {
      svg.datum(this.data).transition().duration(settings.animationDuration).call(chart)
      nv.utils.windowResize(chart.update)
      this.rotateLabel()
    }
  }
}

export default BarChart
