import React from 'react'
import _ from 'lodash'
import PieChart from '../../utils/chart/PieChart'
import BarChart from '../../utils/chart/BarChart'

class ComplaintStatItem extends React.Component {
  componentDidMount () {
    const { id, data } = this.props
    this.pieChart = new PieChart('#' + id + 'PieChartComplaint', data, {
      style: { width: 280, height: 280 },
      onMount: (chart) => {
        chart.labelType('percent')
      }
    })
    this.barChart = new BarChart('#' + id + 'BarChartComplaint', [{
      key: "Complaint",
      values: data
    }], {
      style: {
        width: this.refs.barChart.clientWidth - 40,
        height: 300,
        margin: { top: 10, right: 0, bottom: 100, left: 40 }
      },
    })
  }

  componentWillReceiveProps (nextProps) {
    if (!_.isEqual(this.props.data, nextProps.data)) {
      this.pieChart.update(nextProps.data)
      this.barChart.update([{
        key: "Complaint",
        values: nextProps.data
      }])
    }
  }

  render () {
    const { id, title, data, info } = this.props

    return (
      <div className='row' style={{ marginBottom: 15 }}>
        <div className='col-md-3'>
          <h4>{title}</h4>
          <ul className='list-unstyled'>
            {renderListOfData(data)}
          </ul>
          {info && <p>{info}</p>}
        </div>
        <div className='col-md-9'>
          <div className='row'>
            <div className='col-sm-5'>
              <div id={id + 'PieChartComplaint'} className='pie-chart'></div>
            </div>
            <div className='col-sm-7'>
              <div id={id + 'BarChartComplaint'} className='bar-chart' ref='barChart' style={{ marginTop: 50 }}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const renderListOfData = (data) => (
  data.map((data, index) => (
    <li key={index}>
      <strong>{data.label}</strong> {data.value}
    </li>
  ))
)

ComplaintStatItem.propTypes = {
  id: React.PropTypes.string.isRequired,
  title: React.PropTypes.string.isRequired,
  info: React.PropTypes.string.isRequired,
  data: React.PropTypes.arrayOf(React.PropTypes.object)
}

ComplaintStatItem.defaultProps = {
  data: []
}

export default ComplaintStatItem
