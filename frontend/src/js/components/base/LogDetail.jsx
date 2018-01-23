import React from 'react'
import { ROLES } from './../../config/constants.js'
import PromiseHelper from './../../utils/PromiseHelper.js'
import ObjHelper from './../../utils/ObjHelper.js'
import { LabeledValue } from './../common/FormWidgets.jsx'
import $ from 'jquery'
import { Row, Col } from 'react-bootstrap'
import Spinner from '../common/Spinner.jsx'

export default class LogDetail extends React.Component {
    constructor(props, context) {
        super(props, context)
        this.state = {isLoading: false, data: null}
        this.allowedRoles = [ROLES.SUPER_ADMIN]
        this.requestFields = [
            'user.userFullname',
            'action',
            'module',
            'moduleId',
            'confirmText',
            'loggingData',
            'actionTime',
            'actionIp'
        ]
        this.labels = [
            'Stuff username',
            'Action',
            'Module',
            'Module ID',
            'Reason',
            'Logging Data',
            'Action Time',
            'Action IP Address'
        ]
        this.loadPromise = null
    }

    isAllowed() {
        const { appTypeKey } = this.props

        return this.allowedRoles.includes(appTypeKey)
    }

    componentWillUnmount() {
        if (this.loadPromise)
            this.loadPromise.cancel()
    }

    componentDidMount() {
        if (!this.isAllowed()) return

        this.loadData()
    }

    render() {
        if (!this.isAllowed()) return false

        var header = (<h2 style={{marginBottom: '30px'}}>Log Detail</h2>)

        if (this.state.isLoading) {
            return (
                <div>
                    {header}
                    <div><Spinner /></div>
                </div>
            )
        }

        if (!this.state.data)
            return (
                <div>
                    {header}
                    <p>No data.</p>
                </div>
            )

        return (
            <div className="content-block">
                {header}
                {this.showData()}
            </div>
        )
    }

    loadData() {
        this.setState({isLoading: true})

        var requestParams = {
            fields: this.requestFields
        }

        this.loadPromise = PromiseHelper.makeCancelableAjax(
            $.ajax({
                type: 'get',
                url: '/api/logs/' + this.props.params.id,
                data: requestParams
            })
        )
        this.loadPromise.promise.then(
            data => this.setState({isLoading: false, data: data}),
            xhr => console.log(xhr)
        )
    }


    showData() {
        var content = []
        for (let i = 0; i < this.requestFields.length && i < this.labels.length; i++) {
            var key = this.requestFields[i]
            var label = this.labels[i]
            var value = ObjHelper.accessObjByPath(this.state.data, key)

            content.push(
                <Row key={i}>
                    <Col md={5}>
                        <LabeledValue
                            label={label}
                            value={value}
                        />
                    </Col>
                </Row>
            )
        }

        return content
    }
}