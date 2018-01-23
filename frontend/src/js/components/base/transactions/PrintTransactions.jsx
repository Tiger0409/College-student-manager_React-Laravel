import React, { PropTypes, Component } from 'react'
import DataLoader from '../../common/DataLoader.jsx'

const Print = DataLoader(
    ({ data }) => {
        return (
            <div style={{ margin: '8px' }} dangerouslySetInnerHTML={{ __html: data }}></div>
        )
    }
)

export default class extends Component {
    render() {
        const { role, type } = this.props.params
        let { filters } = this.props.params

        if (!filters) {
            filters = ''
        }

        return (
            <div>
                <Print
                    ajaxOperations={{
                        load: { type: 'get', url: `/api/transactions/print/${type}/filters/${filters}` },
                    }}
                    logEnabled
                />
            </div>
        )
    }
}