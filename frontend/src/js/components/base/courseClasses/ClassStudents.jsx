import React, { PropTypes, Component } from 'react'
import ClassExamResults from './ClassExamResults.jsx'
import ClassAttendance from './ClassAttendance.jsx'
import { Tabs, Tab } from 'react-bootstrap'
import { ROLES } from '../../../config/constants.js'
import CourseHeaderAdmin from '../../admin/CourseHeaderAdmin.jsx'

export default class ClassStudents extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { selectedTab: 0 }
        this.headerTypes = { [ROLES.ADMIN]: CourseHeaderAdmin }
        this.allowedRoles = [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.TEACHER, ROLES.REGISTRAR]
        this.appTypeKey = props.appTypeKey ? props.appTypeKey : ROLES.SUPER_ADMIN
    }

    isAllowed() {
        return this.allowedRoles.includes(this.appTypeKey)
    }

    getSelectedTabFromQuery() {
        const { tab } = this.props.location.query
        if (!tab) return

        var tabLabelsToIds = {
            'Exam results': 0,
            'Attendance records': 1
        }

        if (tab in tabLabelsToIds) {
            this.setState({ selectedTab: tabLabelsToIds[tab] })
        }
    }

    componentWillMount() {
        this.getSelectedTabFromQuery()
    }

    renderHeader() {
        const { appTypeKey } = this.props

        if (!(appTypeKey in this.headerTypes)) {
            return false
        }

        var ConcreteHeader = this.headerTypes[appTypeKey]

        return (
            <div>
                <ConcreteHeader />
            </div>
        )
    }

    render() {
        if (!this.isAllowed()) {
            console.error('You are not allowed to view this page.')
            return <div>You are not allowed to view this page.</div>
        }

        const { selectedTab } = this.state
        let { params: { id } } = this.props

        return (
            <div className='admin'>
                {this.renderHeader()}

                <Tabs
                    className='content-tabs'
                    activeKey={selectedTab}
                    onSelect={key => this.setState({ selectedTab: key })}
                >
                    <Tab eventKey={0} title='Exam results'>
                        <ClassExamResults id={id} appTypeKey={this.appTypeKey} />
                    </Tab>

                    <Tab eventKey={1} title='Attendance records'>
                        <ClassAttendance id={id} appTypeKey={this.appTypeKey} />
                    </Tab>
                </Tabs>
            </div>
        )
    }
}