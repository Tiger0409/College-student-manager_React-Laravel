import React, { Component, PropTypes } from 'react'
import Sh from './../../../../utils/StringHelper.js'
import { Link } from 'react-router'
import Table from '../../../common/Table'
import RoleFilter from '../../../common/RoleFilter'
import ObjHelper from './../../../../utils/ObjHelper.js'
import { ROLES } from '../../../../config/constants'

const get = ObjHelper.getIfExists

class PaymentsLog extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { logs: [] }
        this.load = this.load.bind(this)
        this.createRow = this.createRow.bind(this)
        this.createHead = this.createHead.bind(this)
    }

    load() {
        const { params } = this.props

        $.ajax({
            type: 'get',
            url: `/api/logs/payments`,
            data: {
                fields: ['id', 'user.userName', 'action', 'module', 'moduleId', 'actionTime', 'actionIp', 'loggingData'],
                params : params
            },
            success: data => this.setState({ logs: data }),
            error: () => {}
        })
    }

    componentDidMount() {
        this.load()
        setInterval(this.load, 10000)
    }

    createHead(headers) {
        var head = Table.createHeadBase(headers)
        head.push(<td key='controls'></td>)
        return head
    }

    createRow(rowObj) {
        var rowContent = []
        rowContent.push(
            <td key='username'>
                {Sh.ucWords(get(rowObj, 'user.userName', ''))}
            </td>
        )
        rowContent.push(<td key='action'>{Sh.ucWords(rowObj.action)}</td>)

        var module = Sh.ucWords(rowObj.module)

        rowContent.push(<td key='module'>{module}</td>)

        rowContent.push(<td key='actionTime'>{rowObj.actionTime}</td>)
        rowContent.push(<td key='actionIp'>{rowObj.actionIp}</td>)

        rowContent.push(<td key="loggingData">
            {get(rowObj, 'loggingData.isp', '') + ' / ' + get(rowObj, 'loggingData.city', '')}
        </td>)

        rowContent.push(<td key="userFullname">
            {get(rowObj, 'loggingData.Fullname', '')}
        </td>)

        rowContent.push(<td key='controls'><Link to={'/logs/' + rowObj.id}>Log</Link></td>)
        return rowContent
    }

    render() {

        const { logs } = this.state

        if (!logs || logs.length == 0) return <div></div>

        return (
            <div className="content-block">
                <h2 className='block-heading'>Payments log</h2>
                <hr />

                <Table
                    data={logs}
                    headers={[
                        'Staff Username',
                        'Action',
                        'Module',
                        'Action Time',
                        'Action IP Address',
                        'ISP',
                        'Student Name'
                    ]}
                    createHead={headers => this.createHead(headers)}
                    createRow={(rowObj, showingProps) => this.createRow(rowObj, showingProps)}
                />
            </div>
        )
    }
}

export default RoleFilter(PaymentsLog, [ROLES.ADMIN, ROLES.SUPER_ADMIN])