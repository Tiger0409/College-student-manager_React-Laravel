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
        const { id, type } = this.props.params

        return (
            <div>
                <Print
                    ajaxOperations={{
                        load: { type: 'get', url: `/api/classes/${id}/print/${type}` }
                    }}
                    logEnabled
                />
            </div>
        )
    }
}