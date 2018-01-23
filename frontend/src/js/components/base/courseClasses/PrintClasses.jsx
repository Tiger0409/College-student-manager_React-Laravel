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
        const { type } = this.props.params
        const { term } = this.props.params
        let classIds = localStorage.getItem('printableClassIds')
        if (!classIds) {
            return <p>None of the classes has been selected for printing</p>
        } else {
            classIds = classIds.split(',')
        }
        if (term){
            return (
                <div>
                    <Print
                        ajaxOperations={{
                            load: { type: 'post', url: `/api/classes/print/${term}/${type}`, data: { classIds: classIds } }
                        }}
                        logEnabled
                    />
                </div>
            )
        }
        return (
            <div>
                <Print
                    ajaxOperations={{
                        load: { type: 'post', url: `/api/classes/print/${type}`, data: { classIds: classIds } }
                    }}
                    logEnabled
                />
            </div>
        )
    }
}