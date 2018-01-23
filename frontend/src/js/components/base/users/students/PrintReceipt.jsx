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
        const { id, branchId } = this.props.params

        return (
            <div>
                <title>Invoice</title>
                <Receipt
                    ajaxOperations={{
                        load: { type: 'get', url: `/api/students/${id}/print-receipt/${branchId}`}
                    }}
                />
            </div>
        )
    }
}