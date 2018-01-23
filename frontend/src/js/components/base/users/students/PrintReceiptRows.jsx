import React, { PropTypes, Component } from 'react'
import DataLoader from '../../../common/DataLoader.jsx'

const Receipt = DataLoader(
    ({ data }) => {
        setTimeout(window.print, 500)

        return (
            <div style={{ margin: '8px' }} dangerouslySetInnerHTML={{ __html: data }}></div>
        )
    }
)

export default class extends Component {
    render() {
        const { students } = this.props.params

        let urlParam = students.split(',').map(id => `studentsIds[]=${id}`).join('&')

        return (
            <div>
                <title>Receipt</title>
                <Receipt
                    ajaxOperations={{
                        load: { type: 'get', url: `/api/students/print-receipt-rows?${urlParam}`}
                    }}
                />
            </div>
        )
    }
}