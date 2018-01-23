import React, { PropTypes, Component } from 'react'
import DataLoader from '../../../common/DataLoader.jsx'
import O from '../../../../utils/ObjHelper.js'
import AssetManager from '../../../../utils/AssetManager.js'

const get = O.getIfExists

const StudentReport = DataLoader(
    class extends Component {
        constructor(props, context) {
            super(props, context)
            this.assetManager = new AssetManager()
        }

        componentDidMount() {
            this.assetManager.loadCss('src/style/printings/certificate.css')
        }

        componentWillUnount() {
            this.assetManager.unloadAll()
        }


        render() {
            const { data } = this.props

            return (
                <div>
                    <div className='cert-container'>
                        <p>{get(data, 'user.userFullname', '')}</p>
                        <p>
                            <span>
                                <br /><br />
                                {get(data, 'course.courseTitle', '')}
                            </span>
                            <span> - </span>
                            <span>{data.score}</span>
                        </p>
                        <p>{get(data, 'courseClass.term.name')}</p>
                        <p style={{ pageBreakAfter: 'always' }}></p>
                    </div>
                </div>
            )
        }
    }
)

export default class extends Component {
    render() {
        const { id } = this.props.params

        return (
            <StudentReport
                ajaxOperations={{
                    load: {
                        type: 'get',
                        url: `/api/students/${id}`,
                        data: { fields: ['user.userFullname', 'course.courseTitle', 'courseClass.term.name', 'score'] }
                    }
                }}
                logEnabled
            />
        )
    }
}