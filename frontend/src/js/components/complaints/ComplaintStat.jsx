import React from 'react'
import ComplaintStatItem from './ComplaintStatItem'

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingRight: 50 },
  title: { color: 'inherit' }
}

export default class ComplaintStat extends React.Component {
  get printHandler () {
    return () => {
      var mywindow = window.open('', 'PRINT', 'height=400,width=600');
      
      mywindow.document.write('<html><head><title>' + document.title  + '</title>')
      mywindow.document.write('</head><body >')
      mywindow.document.write('<h1>' + document.title  + '</h1>')
      mywindow.document.write(this.refs.statContent.innerHTML)
      mywindow.document.write('</body></html>')
      mywindow.document.close() // necessary for IE >= 10
      mywindow.focus() // necessary for IE >= 10*/

      mywindow.print()
      mywindow.close()

      return true
    }
  }

  render () {
    const { branches, complaintTypes, teachers, months, stats } = this.props
    
    return (
      <div>
        <div style={styles.header}>
          <h2 className='block-heading' style={styles.title}>Stats</h2>
          <p style={{ cursor: 'pointer' }} onClick={this.printHandler}>Print</p>
        </div>
        <hr/>
        <div ref='statContent'>
          <ComplaintStatItem id='branch' title='Branch' info='Branch Statistics' data={stats && stats.branches ? stats.branches : branches} />
          <ComplaintStatItem id='complaint' title='Complaint Types' info='Complaint Type Statistics' data={stats && stats.complaintTypes ? stats.complaintTypes : complaintTypes} />
          <ComplaintStatItem id='teacher' title='Teacher' info='Teacher' data={stats && stats.teachers ? stats.teachers : teachers} />
          <ComplaintStatItem id='month' title='Month' info='Month' data={stats && stats.months ? stats.months : months} />
        </div>
      </div>
    )
  }
}

ComplaintStat.propTypes = {
  branches: React.PropTypes.array,
  complaintTypes: React.PropTypes.array,
  teachers: React.PropTypes.array
}

ComplaintStat.defaultProps = {
  branches: [],
  complaintTypes: [],
  teachers: [],
  months: []
}
