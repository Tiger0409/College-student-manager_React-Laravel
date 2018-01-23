import React, { Component } from 'react'
import Spinner from '../../common/Spinner'
import Oh from '../../../utils/ObjHelper'
import Dh from '../../../utils/DateHelper'
import AssetManager from '../../../utils/AssetManager'
import { Col } from 'react-bootstrap'
import { Html } from '../../common/FormWidgets'

const get = Oh.getIfExists

export default class ComplaintPrint extends Component {
    constructor(props, context) {
        super(props, context)

        this.state = {
            isLoading: false,
            data: [],
            styles: {
                container: {
                    border: '0px solid #94acca',
                    borderRadius: '15px',
                    margin: '15px',
                    padding: '30px 50px 20px 50px'
                },
                logoContainer: {
                    backgroundCollor: 'white',
                    width: '110px',
                    height: '90px',
                    position: 'absolute',
                    left: '78%',
                    top: '15px',
                    borderLeft: '0px solid #94acca',
                    borderRight: '0px solid #94acca',
                    borderBottom: '0px solid #94acca',
                    borderBottomLeftRadius: '15px',
                    borderBottomRightRadius: '15px',
                    textAlign: 'center'
                },
                table : {
                    marginTop: '10px'
                },
                tableHeader: {
                    width: '100%',
                    height: '30px',
                    backgroundColor: '#c7c7c7 !important',
                    fontWeight: 'bold',
                    WebkitPrintColorAdjust: 'exact'
                },
                cell: {
                    height: '30px',
                    borderLeft: '1px solid #c7c7c7',
                },
                row: {
                    border: '1px solid #c7c7c7',
                    borderTop: '0px',
                    borderLeft: '0px',
                    height: '30px'
                }
            },
            firstProfile: null,
            activeClasses: []
        }

        this.assetManager = new AssetManager()
        this.loadProfile = this.loadProfile.bind(this)
        this.loadClasses = this.loadClasses.bind(this)
    }

    loadProfile(user) {
        $.ajax({
            type: 'get',
            url: `/api/users/${user.id}`,
            data: { fields: ['profile'] },
            success: data => this.setState({ firstProfile: data.profile }),
            error: xhr => console.error(xhr.responseText)
        })
    }

    loadComplaint(onEnd) {
        this.setState({ isLoading: true })

        const { id } = this.props.params

        $.ajax({
            type: 'get',
            url: `/api/complaints/${id}`,
            success: complaint => {
                if (complaint.users && complaint.users.length > 0) {
                    this.loadProfile(complaint.users[0])
                }
                this.setState({ complaint: complaint, isLoading: false })
                onEnd()
            },
            error: xhr => { this.setState({ isLoading: false }); console.error(xhr.responseText) }
        })
    }

    loadClasses() {
        console.log(this.state)

        const userIds = get(this.state, 'complaint.users', []).map(u => u.id)

        console.log('complaint : ', this.state.complaint.users)
        console.log('userIds : ', userIds)

        $.ajax({
            type: 'get',
            url: '/api/classes',
            data: {
                filters: {
                    userIds: userIds,
                    term: userIds.length == 0 ? 'active' : this.state.complaint.termId,
                },
                fields: ['course.courseTitle', 'classTime', 'teacher.userFullname', 'classroom.classroomName', 'id', 'courseClassTermId']
            },
            success: data => this.setState({ activeClasses: data.rows }),
            error: xhr => console.error(xhr)
        })
    }

    load() {
        this.loadComplaint(this.loadClasses)
    }

    componentWillUnmount() {
        this.assetManager.unloadAll()
    }

    componentWillMount() {
        //this.assetManager.loadCss('/src/style/admin/styles.css')

        this.load()
    }

    renderActiveClasses(visible) {
        const { activeClasses } = this.state

        return (
            <ul style={{ listStyle: 'none', paddingLeft: '0', visibility: visible ? 'visible' : 'hidden', marginBottom: '0' }}>
                {activeClasses.map(item => (
                    <li key={item.id}>
                        {[
                            item.course.courseTitle,
                            '/',
                            item.classTime,
                            get(item, 'teacher.userFullname', ''),
                            get(item, 'classroom.classroomName', '')
                        ].join(' ')}
                    </li>
                ))}
            </ul>
        )
    }

    render() {
        const { isLoading, complaint, styles, firstProfile, activeClasses } = this.state

        const merge = (obj1, obj2) => Object.assign(Object.assign({}, obj1), obj2)

        if (isLoading) return <Spinner />

        const setWidth = x => ({ md: x, sm: x, xs: x })

        const Row = ({ style, children }) => <div style={merge(styles.row, style)}>{children}</div>

        const Cell = ({ width, children, style, textStyle }) => (
            <Col style={ style ? style : styles.cell } {...setWidth(width)}>
                <div style={ textStyle ? textStyle : { marginBottom: '0px', lineHeight: styles.cell.height, fontSize: '12px' } }>{children}</div>
            </Col>
        )

        const Table = ({ children }) => <div style={styles.table}>{children}</div>

        const user = (complaint.users && complaint.users.length) > 0 ? complaint.users[0] : null
        let age = user ? Dh.years(user.age) : ''
        let userFullname = user ? user.userFullname.split(' ') : null
        userFullname = userFullname ? userFullname[0] + (userFullname.length > 1 ? ' ' + userFullname[1] : '') : ''

        const removeTime = date => date.split(' ')[0]

        let complaintText = complaint.text.split('')
        let complaintTextSplited = []
        while (complaintText.length > 41) {
            complaintTextSplited.push(complaintText.splice(0, 41).join(''))
        }
        complaintTextSplited.push(complaintText.join(''))

        return (
            <div style={styles.container}>

                <div style={styles.logoContainer}>
                    <img src="/src/images/ftr_logo.jpg" />
                </div>

                <h3>TAYYIBUN</h3>
                <h2 style={{ marginBottom: '10px' }}>Complaint Record</h2>

                <Table>
                    <div style={styles.tableHeader}></div>

                    <Row>
                        <Cell width={4}>
                            {`Student name + age: ${user ? userFullname + ' ' + age : ''}`}
                        </Cell>

                        <Cell width={4}>
                            {`Date of complaint: ${removeTime(complaint.createdAt)}`}
                        </Cell>

                        <Cell width={4}>
                            {`Mode of complaint: ${complaint.types.map(type => type.name).join(', ')}`}
                        </Cell>
                    </Row>

                    <Row>
                        <Cell width={4}>
                            {`Name of complainant: ${complaint.name}`}
                        </Cell>

                        <Cell width={4}>
                            {`Post code: ${firstProfile ? firstProfile.profile_postcode : ''}`}
                        </Cell>

                        <Cell width={4}>
                            {`Status of complaint: ${complaint.completionDate == '0000-00-00 00:00:00' ? 'open' : 'closed'}`}
                        </Cell>
                    </Row>

                    <Row style={{ height: `auto` }}>
                        <Cell style={{ borderLeft: '1px solid #c7c7c7' }} width={4}>
                            Date of alleged incident:
                            {this.renderActiveClasses(false)}
                        </Cell>

                        <Cell style={{ borderLeft: '1px solid #c7c7c7' }} width={4}>
                            {`Branch: ${complaint.branchAssociated ? complaint.branchAssociated.branchName : ''}`}
                            {this.renderActiveClasses(false)}
                        </Cell>

                        <Cell style={{ float: 'none', borderLeft: '1px solid #c7c7c7', display: 'inline-block' }} width={4}>
                            <p style={{ marginBottom: '0' }}>Weekday/weekend:</p>
                            {this.renderActiveClasses(true)}
                        </Cell>
                    </Row>

                    <Row>
                        <Cell width={4}>
                            Completion Date: {complaint.completionDate != '0000-00-00 00:00:00' ? complaint.completionDate.split(' ')[0] : ''}
                        </Cell>

                        <Cell width={4}>
                            {`Contact no: ${firstProfile ? (firstProfile.profile_telephone ? firstProfile.profile_telephone : (firstProfile.profile_mobile ? firstProfile.profile_mobile : '')) : ''}`}
                        </Cell>

                        <Cell width={4}>
                            {`Priority/seriousness: ${complaint.priority}`}
                        </Cell>
                    </Row>

                    <Row>
                        <Cell width={12}>
                            {`Person handling complaint: ${complaint.handlerFullname}`}
                        </Cell>
                    </Row>
                </Table>

                <Table>
                    <div style={styles.tableHeader}>
                        <Cell width={6}>
                            2. Description/Issue of concern/ Complaint
                        </Cell>

                        <Cell width={6}>
                            3.  Suggestions/Disposition
                        </Cell>
                    </div>

                    <div style={{ border: '1px solid #c7c7c7', borderTop: '0px' }}>
                        <Col {...setWidth(6)} style={{ borderRight: '1px solid #c7c7c7', display: 'inline-block', float: 'none' }}>
                            <Html style={{ margin: '0', padding: '5px 0 5px 0'}}>
                                {complaint.text}
                            </Html>
                        </Col>

                        <Col {...setWidth(6)} style={{ borderRight: '1px solid #c7c7c7', display: 'inline-block', float: 'right' }}>
                            <Html style={{ margin: '0', padding: '5px 0 5px 0'}}>
                                {complaint.suggestions}
                            </Html>
                        </Col>
                    </div>
                </Table>

                <Table>
                    <div style={styles.tableHeader}>
                        <Cell width={12}>4. Follow up/other comments</Cell>
                    </div>

                    <Col {...setWidth(12)} style={{ border: '1px solid #c7c7c7', float: 'none' }}>
                        <Html style={{ margin: '0', padding: '5px 0 5px 0'}}>
                            {complaint.otherComments}
                        </Html>
                    </Col>
                </Table>
            </div>
        )
    }
}
