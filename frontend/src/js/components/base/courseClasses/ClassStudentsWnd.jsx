import React, { PropTypes, Component } from 'react'
import ClassExamResults from './ClassExamResults.jsx'
import ClassAttendance from './ClassAttendance.jsx'
import { Modal, Button, Tabs, Tab } from 'react-bootstrap'
import { ROLES } from '../../../config/constants.js'
import CourseHeaderAdmin from '../../admin/CourseHeaderAdmin.jsx'
import Oh from '../../../utils/ObjHelper'

const get = Oh.getIfExists

export default class ClassStudents extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { selectedTab: props.selectedTab ? props.selectedTab : 0 }
        this.headerTypes = { [ROLES.ADMIN]: CourseHeaderAdmin }
        this.allowedRoles = [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.TEACHER, ROLES.REGISTRAR]
        this.close = this.close.bind(this)
    }

    isAllowed() {
        return this.allowedRoles.includes(this.props.appTypeKey)
    }

    getSelectedTabFromQuery() {
        const tab = get(this.props, 'location.query.tab', null)
        if (!tab) return

        var tabLabelsToIds = {
            'Exam results': 0,
            'Attendance records': 1
        }

        if (tab in tabLabelsToIds) {
            this.setState({ selectedTab: tabLabelsToIds[tab] })
        }
    }

    close() {
        const { onClose } = this.props
        this.setState({ reason: '' })
        onClose()
    }

    componentWillMount() {
        this.getSelectedTabFromQuery()
    }

    render() {
        if (!this.isAllowed()) {
            console.error('You are not allowed to view this page.')
            return <div>You are not allowed to view this page.</div>
        }

        const { selectedTab } = this.state
        const { appTypeKey, params: { id }, show } = this.props

        return (
            <div>
                <Modal show={show} onHide={this.close} dialogClassName="big-modal">
                    <Modal.Header closeButton>
                        <p style={{ textAlign: 'center', fontSize: '14pt' }}>
                            Class Students
                        </p>
                    </Modal.Header>

                    <Modal.Body style={{ height: '500px', overflowY: 'auto' }}>
                        <Tabs
                            className='content-tabs'
                            activeKey={selectedTab}
                            onSelect={key => this.setState({ selectedTab: key })}
                        >
                            <Tab eventKey={0} title='Exam results'>
                                <ClassExamResults id={id} appTypeKey={appTypeKey} />
                            </Tab>

                            <Tab eventKey={1} title='Attendance records'>
                                <ClassAttendance id={id} appTypeKey={appTypeKey} />
                            </Tab>
                        </Tabs>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button onClick={this.close}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}