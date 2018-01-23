import React, { PropTypes, Component } from 'react'
import { Button, Tabs, Tab ,Accordion,Panel,Row,Col} from 'react-bootstrap'
import Table from './../../../common/Table.jsx'
import { Link } from 'react-router'
import $ from 'jquery'
import { ROLES } from './../../../../config/constants.js'
import O from './../../../../utils/ObjHelper.js'
import PromiseHelper from './../../../../utils/PromiseHelper.js'
import S from '../../../../utils/StringHelper.js'
import Notifier from '../../../../utils/Notifier.js'
import ConfirmDeleteWnd from '../../../common/ConfirmDeleteWnd.jsx'
import Spinner from '../../../common/Spinner.jsx'
import DataLoader from '../../../common/DataLoader.jsx'
import StudentPaymentForm from './StudentPaymentForm.jsx'
import ConfirmDialog from '../../../common/ConfirmDialog.jsx'
import StripePaymentWnd from '../../../common/StripePaymentWnd.jsx'
import { FormField, LabeledValue, EditableHTML, DatePicker, EditableSourceSelected } from './../../../common/FormWidgets.jsx'


const get = O.getIfExists

// TODO: refactor
export default class CourseRegistrationHistory extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            selectedTab: 0,
            confirmText:0,
            tabHeaders: [
                'Active',
                'Basket',
                'Paid Donations',
                'Deleted Classes'
              /*'Pending Donations',
                'Pending',
                'Created Donations'*/
            ]
        }

        this.listeners = {}
        this.addListeners = this.addListeners.bind(this)
    }

    componentDidMount() {
        const { eventController } = this.props

        const notify = event => {
            this.listeners[event] && this.listeners[event].forEach(listener => listener())
        }

        eventController.on('basketUpdate', () => {
            notify('basketUpdate')
            this.setState({ selectedTab: 1 })
        })
    }

    componentWillUnmount() {
        const { eventController } = this.props
        eventController.off('basketUpdate')
    }

    render() {
        var regHistoryTabs = this.createRegHistoryTabs()
        // var deletedRegHistory = this.deletedRegHistory()
        return (
            <div>
                <h2 className='block-heading'>Course Registration History</h2>

                <hr />
                
                <div style={{ position: 'relative', paddingBottom: 40, marginBottom: 10 }}>
                    <div style={{ overflow: 'auto' }}>
                        <div style={{ minWidth: 1024 }}>
                            <Tabs
                                activeKey={this.state.selectedTab}
                                onSelect={key => this.handleTabSelect(key)}
                                className='content-tabs'
                            >
                            {regHistoryTabs}
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    addListeners(listeners) {
        for (let event in listeners) {
            if (!this.listeners[event]) this.listeners[event] = []
            this.listeners[event].push(listeners[event])
        }
    }
    // deletedRegHistory(){
    //     var user = this.props.user
    //     return (
    //
    //     )
    // }
    createRegHistoryTabs() {
        var user = this.props.user
        var tabComponents = [
            (
                <RegHistoryDispatcher
                    resourceUrl={'/api/users/' + user.id + '/classes'}
                    requestParams={{
                        fields: [
                            'id',
                            'classId',
                            'registerDate',
                            'studentStatus',
                            'reducedAmount',
                            'course.courseTitle',
                            'courseClass.classTime',
                            'courseClass.feeForEmployed',
                            'courseClass.feeForUnemployed',
                            'courseClass.classroom.classroomName',
                            'courseClass.teacher.userFullname',
                            'course.dept.branchIdAssociate',
                            'course.dept.deptBranchId',
                            'regPaymentStatus',
                            'transaction',
                            'score',
                            'isDeletable'
                        ],
                        regStatus: 'active'
                    }}
                    noDataMsg='No active course registration data yet!'
                >
                    <ClassesInfoTable user={user} deleted={false} />

                </RegHistoryDispatcher>
            ),
            (
                <Basket userId={user.id} onSubscribe={this.addListeners} />
            ),
            (
                <RegHistoryDispatcher
                    resourceUrl={'/api/users/' + user.id + '/donationRecords'}
                    noDataMsg='No paid donations data yet!'
                    requestParams={{
                        isReceived: 1,
                        fields: [
                            'donation.title',
                            'donation.targetAmount',
                            'donationAmount',
                            'createdAt',
                            'stripeTransaction',
                            'paypalTransaction'
                        ]
                    }}
                >
                    <DonationRecordsInfoTable />
                </RegHistoryDispatcher>
            ),
            (
                <RegHistoryDispatcher
                    resourceUrl={'/api/users/' + user.id + '/classes/deleted'}
                    requestParams={{
                        fields: [
                            'id',
                            'classId',
                            'registerDate',
                            'studentStatus',
                            'reducedAmount',
                            'course.courseTitle',
                            'courseClass.classTime',
                            'courseClass.feeForEmployed',
                            'courseClass.feeForUnemployed',
                            'courseClass.classroom.classroomName',
                            'courseClass.teacher.userFullname',
                            'course.dept.branchIdAssociate',
                            'course.dept.deptBranchId',
                            'regPaymentStatus',
                            'transaction',
                            'score',
                            'isDeletable',
                            'reason'
                        ],
                        regStatus: 'active'
                    }}
                    noDataMsg='No Deleted course registration data!'
                >
                    <ClassesInfoTable selectedTab={this.state.selectedTab}  user={user} deleted={true} confirmText={this.state.confirmText}/>

                </RegHistoryDispatcher>
            ),
            // (
            //     <RegHistoryDispatcher
            //         resourceUrl={'/api/logs/' + user.id}
            //         noDataMsg='No paid donations data yet!'
            //         requestParams={{
            //             fields: [
            //                 'id',
            //                 'userId',
            //                 'action',
            //                 'module',
            //                 'modulId',
            //                 'confirmText',
            //                 'actionIp',
            //                 'actionTime'
            //             ]
            //         }}
            //     >
            //         <ClassesInfoTable selectedTab={this.state.selectedTab}  user={user} deleted={true} />
            //     </RegHistoryDispatcher>
            // )
        ];

        var tabs = [];
        for (let i = 0; i < tabComponents.length; i++) {
            tabs.push(
                <Tab eventKey={i} key={i} title={this.state.tabHeaders[i]}>
                    {React.cloneElement(
                        tabComponents[i],
                        {
                            onGetCount: count => this.tableRowsChanged(i, count)
                        }
                    )}
                </Tab>
            )
        }

        return tabs
    }

    handleTabSelect(key) {
        this.setState({ selectedTab: key })
    }

    tableRowsChanged(tableNumber, rowsCount) {
        var pattern = /(\s\()([0-9]*)(\))$/
        var header = this.state.tabHeaders[tableNumber]

        if (header.search(pattern) > 0)
            header = header.replace(pattern, '$1' + rowsCount + '$3')
        else
            header = header + ' (' + rowsCount + ')'

        var tabHeaders = this.state.tabHeaders
        tabHeaders[tableNumber] = header
        this.setState({tabHeaders: tabHeaders})
    }
}

class RegHistoryDispatcher extends React.Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            currentPage: 1,
            tableData: null,
            checkedRows: [],
            isLoading: false
        }
        this.rowsPerPage = 150
        this.promises = {
            loadPromise: null,
            deletePromise: null,
            editPromise: null
        }

        this.deleteData = this.deleteData.bind(this)
        this.loadData = this.loadData.bind(this)

        if (props.onSubscribe) {
            props.onSubscribe({ [props.updateEventName ? props.updateEventName : 'update']: this.loadData })
        }
    }

    render() {
        const { tableData, showConfirmDelete, isLoading } = this.state
        const { noDataMsg, children: propsChildren } = this.props
        var { checkedRows }= this.state
        if (isLoading) {
            return (
                <div>
                    <Spinner />
                </div>
            )
        }

        if (tableData && tableData.length > 0) {
            var children = React.cloneElement(propsChildren, {
                data: tableData,
                onClick: e => {
                    if (e.target.checked){
                        checkedRows.push(e.target.id);
                    }else{
                        for (let i = 0; i < checkedRows.length; i++){
                            if (checkedRows[i] === e.target.id){
                                checkedRows.splice(i,1)
                            }else{
                                continue
                            }
                        }
                    }
                },
                onFieldChange: (id, name, value) => this.onFieldChange(id, name, value)
            })
            return (
                <div>
                    {children}

                    <DispatcherControls
                        onDelete={() => this.setState({ showConfirmDelete: true })}
                    />

                    <ConfirmDeleteWnd
                        show={showConfirmDelete}
                        onConfirm={this.deleteData}
                        onClose={() => this.setState({ showConfirmDelete: false })}
                    />
                </div>
            )
        }

        return (
            <div>
                {noDataMsg}
            </div>
        )
    }

    loadData() {
        if (!this.props.resourceUrl) return

        this.setState({ isLoading: true })

        var requestParams = {
            page: this.state.currentPage,
            rowsPerPage: this.rowsPerPage
        }
        if (this.props.requestParams)
            Object.assign(requestParams, this.props.requestParams)

        this.promises.loadPromise = PromiseHelper.ajax({
            type: 'get',
            url: this.props.resourceUrl,
            data: requestParams
        })
        this.promises.loadPromise.promise.then(
            result => {
                if (result) {
                    this.setState({ tableData: result.rows, isLoading: false })
                    if (this.props.onGetCount)
                        this.props.onGetCount(result.info.totalCount)
                } else {
                    this.props.onGetCount(0)
                }
            },
            xhr => { console.error(xhr); this.setState({ isLoading: false }) }
        )

    }

    deleteData(reason) {
        if (!this.props.resourceUrl) return

        const { deleteParams, resourceDeleteUrl, resourceUrl }  = this.props
        let { tableData, checkedRows } = this.state
        tableData = tableData.filter(row => !checkedRows.includes(row.id.toString()))
        this.setState({ tableData: tableData })

        if (checkedRows.length > 0) {
            let data = { ids: checkedRows, reason: reason }
            if (deleteParams) Object.assign(data, deleteParams)

            this.promises.deletePromise = PromiseHelper.makeCancelableAjax(
                $.ajax({
                    type: 'delete',
                    url: resourceDeleteUrl ? resourceDeleteUrl : resourceUrl,
                    data: data,
                })
            )
            this.promises.deletePromise.promise.then(
                () => {
                    Notifier.success('Deleted successfully')
                    this.loadData()
                    this.setState({ checkedRows: [] })
                },
                xhr => {
                    Notifier.error('Deletion failed')
                    console.log(xhr, status, error)
                }
            )
        }
    }

    onFieldChange(id, name, value) {
        var tableData = this.state.tableData
        for (let i = 0; i < tableData.length; i++) {
            if (tableData[i].id == id) {
                var valueChanged = false
                O.accessObjByPath(tableData[i], name, currValue => {
                    if (currValue !== value)
                        valueChanged = true
                    return value
                })

                if (valueChanged) this.editRow(tableData[i])
                break
            }
        }
    }

    editRow(row) {

        var tableData = this.state.tableData
        for (let i = 0; i < tableData.length; i++)
            if (tableData[i].id === row.id)
                tableData[i] = row
        this.setState({tableData: tableData})

        this.promises.editPromise = PromiseHelper.makeCancelableAjax(
            $.ajax({
                type: 'put',
                url: this.props.resourceUrl + '/' + row.id,
                data: row
            })
        )
        this.promises.editPromise.promise.then(
            response => {
                Notifier.success('Updated')
                this.loadData()
            },
            xhr => {
                Notifier.error('Update failed')
                console.log(xhr)
            }
        )
    }

    componentDidMount() {
        this.loadData()
    }

    componentWillUnmount() {
        for (let promiseKey in this.promises)
            if (this.promises[promiseKey])
                this.promises[promiseKey].cancel()
    }
}

class ClassesInfoTable extends React.Component {
    constructor(props, context) {
        super(props, context)
        this.sendEmail = this.sendEmail.bind(this)
        this.onPaymentsChange = this.onPaymentsChange.bind(this)
        this.state = {
            data : props.data,
            showPayments : {},
            deletedTable : this.props.deleted,
            feeForUnemployed:''
        }
    }

    sendEmail(studentId, branchId) {
        $.ajax({
            type: 'get',
            url: `/api/students/${studentId}/send-invoice/${branchId}`,
            success: () => Notifier.success('Invoice sent successfully'),
            error: xhr => {
                console.log(xhr)
                Notifier.error('Invoice sending failed')
            }
        })
    }
    componentDidMount() {
        const { data } = this.props
        let obj = {}
        for (let i = 0;i<data.length;i++) {
            for (var k in data) {
                if (!obj.hasOwnProperty(k)) {
                    obj[data[i].id] = false;
                }
            }
        }
    }
    onPaymentsChange(payments) {
        var { data } = this.state
        this.saved = false
        this.setState({ data: data })
        for (let i = 0;i<data.length;i++){
            for (let j = 0 ;j<payments.length;j++){
                if (data[i].id == payments[j].course_student_id){
                    data[i].payments = payments;
                    this.setState({data : data})
                    break
                }
            }
        }
    }
    render() {
        const {deletedTable} = this.state
        let rows = [];
        let test = []
        const { data } = this.state;
        var { showPayments } = this.state
        let obj = {}
        for (let i = 0;i<data.length;i++) {
            var branchId = O.accessObjByPath(data[i], 'course.dept.deptBranchId')
            rows.push(data[i])
            let rowObj = data[i]
            let classroom = []
            let id = data[i].id
            let payments = []
            let totalFee;
            let fee = 0;
            switch (data[i].studentStatus) {
                case 'employed':
                    totalFee = parseFloat(data[i].courseClass.feeForEmployed)
                    break;


                case 'unemployed':
                    if (data[i].courseClass !== undefined) {
                        totalFee = parseFloat(data[i].courseClass.feeForUnemployed)
                    }
                    else {
                        totalFee = 1;
                    }

                    break;
                case 'reduced':
                    totalFee = parseFloat(data[i].reducedAmount)
                    break;
            }
            if (data[i].payments.length > 0) {
                payments = data[i].payments
                for (var j = 0; j < payments.length; j++) {
                    fee += parseFloat(payments[j].amount)
                }
            }
            if (rowObj.courseClass!==undefined && rowObj.courseClass.teacher!==undefined)
            {
                if (rowObj.courseClass.teacher && rowObj.courseClass.classroom) {
                    classroom.push(
                        <span>
                            {rowObj.courseClass.teacher.userFullname}/
                            <br/>
                            {rowObj.courseClass.classroom.classroomName}
                        </span>
                    )
                } else if (rowObj.courseClass.teacher && !rowObj.courseClass.classroom) {
                    classroom.push(
                        <span>
                            {rowObj.courseClass.teacher.userFullname}
                            <br/>
                        </span>
                    )
                }
                else if (!rowObj.courseClass.teacher && rowObj.courseClass.classroom) {
                    classroom.push(
                        <span>
                            {rowObj.courseClass.classroom.classroomName}
                            <br/>
                        </span>
                    )
                } else {
                    classroom.push(
                        <span></span>
                    )
                }
            }
            if (!deletedTable && data[i].courseClass!==undefined && data[i].courseClass.classTime!==undefined){
                test.push(
                    <div>
                        <div
                            style={{
                                padding: '10px',
                                display: 'flex',
                                justifyContent: 'flex-start',
                                borderTop: 0,
                                textAlign: 'left',
                                paddingLeft: '2%',
                                backgroundColor: '#e1eafb',
                                borderBottom: '1px solid #b6ccf3',
                                cursor: 'pointer'
                            }}
                            onClick={e => {
                                showPayments[id] = !showPayments[id];
                                this.setState({ showPayments : showPayments})
                            }}
                        >
                            <div style={{ display: 'inline-block', alignSelf: 'center' }}>
                                <input
                                    id={data[i].id}
                                    type="checkbox"
                                    onClick={e => {
                                        e.stopPropagation()
                                        this.props.onClick(e)
                                    }}
                                />
                            </div>
                            <div className="col-md-2" style={{ display: 'inline-block',alignSelf: 'center' }}>
                                <Link to={`/classes/${data[i].classId}`}>
                                    {data[i].registerDate.slice(0, 10)}
                                </Link>
                            </div>
                            <div className="col-md-3" style={{display: 'inline-block', textAlign: 'left', alignSelf: 'center' }}>
                                {data[i].course.courseTitle}/<br/>{data[i].courseClass.classTime}
                            </div>

                            <div className="col-md-3" style={{ display: 'inline-block', textAlign: 'left', alignSelf: 'center' }}>
                                {classroom}
                            </div>
                            <div className="col-md-3">
                                {data[i].course.dept.branchIdAssociate}
                            </div>
                            <div className="col-md-2">
                                {totalFee}/{parseFloat(totalFee - fee)}
                            </div>
                            <div className="col-md-6" style={{ display: 'inline-block', alignSelf: 'center' }}>
                                <div style={{width : "100%"}}>
                                    <Link to={`/students/${data[i].id}`}>Edit</Link>
                                    <span> | </span>
                                    <Link to={`/students/${data[i].id}/print-receipt/${branchId}`} target='_blank'>Print
                                        Receipt</Link>
                                    <span> | </span>
                                    <Link to={`/students/${data[i].id}/print-report`} target='_blank'>Report</Link>
                                    <span> | </span>
                                    <a
                                        style={{cursor: 'pointer'}}
                                        onClick={() => this.sendEmail(data[i].id, branchId)}
                                    >
                                        Send invoice
                                    </a>
                                    <span> | </span>
                                    {typeof data[i].transaction !== 'undefined' ?
                                        <span>
                        <Link to={`/transactions/${data[i].transaction.method}/${data[i].transaction.id}`}
                              target='_blank'>
                            {`${S.ucFirst(data[i].transaction.method)} Detail`}
                        </Link>
                        <span> | </span>
                        </span> :
                                        false
                                    }
                                    <Link to={`/students/${data[i].id}/grades`}>
                                        Grade: {data[i].score ? ` ${data[i].score}` : ''}
                                    </Link>
                                    <span> | </span>
                                    <Link to={`/students/${data[i].id}/print-cert`}>
                                        Print Cert
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <Panel
                            style={{ marginBottom: '0px', borderTop: 0, borderBottom: 0 }}
                            collapsible
                            expanded={showPayments[id]}
                        >
                            <StudentPayments
                                student={this.props.user}
                                payments={payments}
                                onChange={this.onPaymentsChange}
                                courseId={data[i].id}
                            />
                        </Panel>
                    </div>
                )
            } else if(deletedTable && data[i].courseClass!==undefined && data[i].courseClass.classTime!==undefined)
                {
                test.push(

                    <div>
                        <div
                            style={{
                                padding: '10px',
                                display: 'flex',
                                justifyContent: 'flex-start',
                                borderTop: 0,
                                textAlign: 'left',
                                paddingLeft: '2%',
                                backgroundColor: '#e1eafb',
                                borderBottom: '1px solid #b6ccf3',
                                cursor: 'pointer'
                            }}
                            onClick={e => {
                                showPayments[id] = !showPayments[id];
                                this.setState({ showPayments : showPayments})
                            }}
                        >
                            <div style={{ display: 'inline-block', alignSelf: 'center' }}>
                                <input
                                    id={data[i].id}
                                    type="checkbox"
                                    onClick={e => {
                                        e.stopPropagation()
                                        this.props.onClick(e)
                                    }}
                                />
                            </div>
                            <div className="col-md-2" style={{ display: 'inline-block',alignSelf: 'center' }}>
                                <Link to={`/classes/${data[i].classId}`}>
                                    {data[i].registerDate.slice(0, 10)}
                                </Link>
                            </div>
                            <div className="col-md-3" style={{display: 'inline-block', textAlign: 'left', alignSelf: 'center' }}>
                                {data[i].course.courseTitle}/<br/>{data[i].courseClass.classTime}
                            </div>

                            <div className="col-md-3" style={{ display: 'inline-block', textAlign: 'left', alignSelf: 'center' }}>
                                {classroom}
                            </div>
                            <div className="col-md-3">
                                {data[i].course.dept.branchIdAssociate}
                            </div>
                            <div className="col-md-2">
                                {totalFee}/{parseFloat(totalFee - fee)}
                            </div>
                            <div className="col-md-2">
                                {data[i].reason}
                            </div>
                        </div>
                        <Panel
                            style={{ marginBottom: '0px', borderTop: 0, borderBottom: 0 }}
                            collapsible
                            expanded={showPayments[id]}
                        >
                            <StudentPayments
                                student={this.props.user}
                                payments={payments}
                                onChange={this.onPaymentsChange}
                                courseId={data[i].id}
                            />
                        </Panel>
                    </div>
                )
            }

            if (data[i].payments.length > 0){
                rows.push(data[i].payments)
            }
            else{
                continue
            }
        }
        if (this.props.selectedTab===3)
        {
            return (
                <div>
                    {/*<Table*/}
                    {/*showingProps={[*/}
                    {/*'registerDate',*/}
                    {/*'course.courseTitle',*/}
                    {/*'courseClass.classTime',*/}
                    {/*'course.dept.branchIdAssociate',*/}
                    {/*'regPaymentStatus'*/}
                    {/*]}*/}
                    {/*headers={['Registration Time', 'Course Title', 'Teacher/ClassRoom', 'Branch', 'Payment Status']}*/}
                    {/*data={rows}*/}
                    {/*createHead={headers => this.createHead(headers)}*/}
                    {/*createRow={(rowObj, showingProps) => this.createRow(rowObj, showingProps)}*/}
                    {/*checkableRows*/}
                    {/*checkableRowCondition={rowObj => typeof rowObj.isDeletable !== 'undefined' ? rowObj.isDeletable : true}*/}
                    {/*onCheckedRowsChange={checkedRows => this.props.onCheckedRowsChange(checkedRows)}*/}
                    {/*/>*/}
                    <div>
                        {/*<Table*/}
                        {/*headers={['Registration Time', 'Course Title', 'Teacher/ClassRoom', 'Branch', 'Payment Status']}*/}
                        {/*createHead={headers => this.createHead(headers)}*/}
                        {/*/>*/}
                        <Col md={12} style={{padding:'0'}}>
                            <div
                                className="table-head"
                                style={{
                                    minHeight: '50px',
                                    display: 'flex',
                                    justifyContent: 'flex-start'
                                }}
                            >
                                <div style={{ display: 'inline-block', alignSelf: 'center' ,width:"75px",height:"27px"}}>
                                </div>
                                <div className="col-md-2">
                                    <span style={{ paddingTop: 10, paddingBottom: 10, display: 'inline-block' }}>Registration Time</span>
                                </div>
                                <div className="col-md-3">
                                    <span style={{ paddingTop: 10, paddingBottom: 10, display: 'inline-block' }}>Course Title/Class Time</span>
                                </div>
                                <div className="col-md-3">
                                    <span style={{ paddingTop: 10, paddingBottom: 10, display: 'inline-block' }}>Teacher/ClassRoom</span>
                                </div>
                                <div className="col-md-3">
                                    <span style={{ paddingTop: 10, paddingBottom: 10, display: 'inline-block' }}>Branch</span>
                                </div>
                                <div className="col-md-2">
                                    <span style={{ paddingTop: 10, paddingBottom: 10, display: 'inline-block' }}>Total/Remaining</span>
                                </div>
                                <div className="col-md-6">
                                    <span style={{ paddingTop: 10, paddingBottom: 10, display: 'inline-block' }}>Payment Status</span>
                                </div>
                                <div className="col-md-4">
                                    <span style={{ paddingTop: 10, paddingBottom: 10, display: 'inline-block' }}>Reason</span>
                                </div>
                            </div>
                        </Col>
                        <Col md={12} style={{padding:'0'}}>
                            {test}
                        </Col>
                    </div>
                </div>
            )
        }
        else
        {
            return (
                <div>
                    {/*<Table*/}
                    {/*showingProps={[*/}
                    {/*'registerDate',*/}
                    {/*'course.courseTitle',*/}
                    {/*'courseClass.classTime',*/}
                    {/*'course.dept.branchIdAssociate',*/}
                    {/*'regPaymentStatus'*/}
                    {/*]}*/}
                    {/*headers={['Registration Time', 'Course Title', 'Teacher/ClassRoom', 'Branch', 'Payment Status']}*/}
                    {/*data={rows}*/}
                    {/*createHead={headers => this.createHead(headers)}*/}
                    {/*createRow={(rowObj, showingProps) => this.createRow(rowObj, showingProps)}*/}
                    {/*checkableRows*/}
                    {/*checkableRowCondition={rowObj => typeof rowObj.isDeletable !== 'undefined' ? rowObj.isDeletable : true}*/}
                    {/*onCheckedRowsChange={checkedRows => this.props.onCheckedRowsChange(checkedRows)}*/}
                    {/*/>*/}
                    <div>
                        {/*<Table*/}
                        {/*headers={['Registration Time', 'Course Title', 'Teacher/ClassRoom', 'Branch', 'Payment Status']}*/}
                        {/*createHead={headers => this.createHead(headers)}*/}
                        {/*/>*/}
                        <Col md={12} style={{padding:'0'}}>
                            <div
                                className="table-head"
                                style={{
                                    minHeight: '50px',
                                    display: 'flex',
                                    justifyContent: 'flex-start'
                                }}
                            >
                                <div style={{ display: 'inline-block', alignSelf: 'center' ,width:"75px",minHeight:"27px"}}>
                                </div>
                                <div className="col-md-2">
                                    <span style={{ paddingTop: 10, paddingBottom: 10, display: 'inline-block' }}>Registration Time</span>
                                </div>
                                <div className="col-md-3">
                                    <span style={{ paddingTop: 10, paddingBottom: 10, display: 'inline-block' }}>Course Title/Class Time</span>
                                </div>
                                <div className="col-md-3">
                                    <span style={{ paddingTop: 10, paddingBottom: 10, display: 'inline-block' }}>Teacher/ClassRoom</span>
                                </div>
                                <div className="col-md-3">
                                    <span style={{ paddingTop: 10, paddingBottom: 10, display: 'inline-block' }}>Branch</span>
                                </div>
                                <div className="col-md-2">
                                    <span style={{ paddingTop: 10, paddingBottom: 10, display: 'inline-block' }}>Total/Remaining</span>
                                </div>
                                <div className="col-md-6">
                                    <span style={{ paddingTop: 10, paddingBottom: 10, display: 'inline-block' }}>Payment Status</span>
                                </div>


                            </div>
                        </Col>
                        <Col md={12} style={{padding:'0'}}>
                            {test}
                        </Col>
                    </div>
                </div>
            )
        }


    }

    createHead(headers) {
        var head = Table.createHeadBase(headers)
        head.push(<td key='buttons'></td>)
        return head
    }

    createRow(rowObj, showingProps) {
        let { showPayments, showPayment } = this.state
        let payments
        var tds = []
        if(rowObj.length){
            if (rowObj.length > 0){
                let id = rowObj[0].course_student_id
                showPayment = showPayments[id]
            }
            payments = rowObj
            tds.push(
                <td key="payemnts" colSpan={6}>
                    <Panel
                        style={{ marginBottom: '0px', borderTop: 0, borderBottom: 0 }}
                        collapsible
                        expanded={showPayment}
                    >
                        <StudentPayments
                            student={this.props.user}
                            payments={payments}
                            onChange={this.onPaymentsChange}
                        />
                    </Panel>
                </td>
            )
        }else{
            var rowContent = Table.createRowBase(rowObj, showingProps)
            var branchId = O.accessObjByPath(rowObj, 'course.dept.deptBranchId')
            // rowContent[0] = (
            //     <td key='link'><Link to={`/classes/${rowObj.classId}`}>{rowObj.registerDate.slice(0, 10)}</Link></td>
            // )
            tds.push(
                <td key='link'
                    onClick={e =>{
                        showPayments[id] = showPayment;
                        this.setState({ showPayment : !showPayment})
                    }}
                >
                        <Link to={`/classes/${rowObj.classId}`}>
                            {rowObj.registerDate.slice(0, 10)}
                        </Link>
                </td>
            )
            tds.push(
                <td key='title'
                    onClick={e =>{
                        showPayments[id] = showPayment;
                        this.setState({ showPayment : !showPayment})
                    }}
                >
                        {rowObj.course.courseTitle}
                </td>
            )
            if (rowObj.courseClass.teacher && rowObj.courseClass.classroom){
                tds.push(
                    <td key='teacherClassRoom'
                        onClick={e =>{
                            showPayments[id] = showPayment;
                            this.setState({ showPayment : !showPayment})
                        }}
                        >
                            {rowObj.courseClass.teacher.userFullname}/
                            <br/>
                            {rowObj.courseClass.classroom.classroomName}
                    </td>
                )
            }else if(rowObj.courseClass.teacher && !rowObj.courseClass.classroom){
                tds.push(
                    <td key='teacherClassRoom'
                        onClick={e =>{
                            showPayments[id] = showPayment;
                            this.setState({ showPayment : !showPayment})
                        }}
                    >
                            {rowObj.courseClass.teacher.userFullname}
                        <br/>
                    </td>
                )
            }
            else if(!rowObj.courseClass.teacher && rowObj.courseClass.classroom){
                tds.push(
                    <td key='teacherClassRoom'
                        onClick={e =>{
                            showPayments[id] = showPayment;
                            this.setState({ showPayment : !showPayment})
                        }}
                    >

                            {rowObj.courseClass.classroom.classroomName}
                        <br/>
                    </td>
                )
            }else{
                tds.push(
                    <td key='teacherClassRoom'
                        onClick={e =>{
                            showPayments[id] = showPayment;
                            this.setState({ showPayment : !showPayment})
                        }}
                    >
                    </td>
                )
            }
            tds.push(
                <td key='branch'
                    onClick={e =>{
                        showPayments[id] = showPayment;
                        this.setState({ showPayment : !showPayment})
                    }}
                >

                        {rowObj.course.dept.branchIdAssociate}
                </td>
            )
            let id = rowObj.id
            tds.push(
                <td key='controls'>
                        <Link to={`/students/${rowObj.id}`}>Edit</Link>
                        <span> | </span>
                        <Link to={`/students/${rowObj.id}/print-receipt/${branchId}`} target='_blank'>Print
                            Receipt</Link>
                        <span> | </span>
                        <Link to={`/students/${rowObj.id}/print-report`} target='_blank'>Report</Link>
                        <span> | </span>
                        <a
                            style={{cursor: 'pointer'}}
                            onClick={() => this.sendEmail(rowObj.id, branchId)}
                        >
                            Send invoice
                        </a>
                        <span> | </span>
                        {typeof rowObj.transaction !== 'undefined' ?
                            <span>
                        <Link to={`/transactions/${rowObj.transaction.method}/${rowObj.transaction.id}`}
                              target='_blank'>
                            {`${S.ucFirst(rowObj.transaction.method)} Detail`}
                        </Link>
                        <span> | </span>
                        </span> :
                            false
                        }
                        <Link to={`/students/${rowObj.id}/grades`}>
                            Grade: {rowObj.score ? ` ${rowObj.score}` : ''}
                        </Link>
                        <span> | </span>
                        <Link to={`/students/${rowObj.id}/print-cert`}>
                            Print Cert
                        </Link>
                </td>
            )
        }


        return tds
    }
}

class DonationRecordsInfoTable extends React.Component {
    render() {
        return (
            <div>
                <Table
                    showingProps={['donation.title', 'donation.targetAmount', 'donationAmount', 'createdAt']}
                    headers={['Donation Title', 'Target Amount', 'Payment Amount', 'Payment Date']}
                    data={this.props.data}
                    createHead={this.createHead}
                    createRow={this.createRow}/>
            </div>
        )
    }

    createHead(headers) {
        var head = Table.createHeadBase(headers)
        head.push(<td key='buttons'></td>)
        return head
    }

    createRow(rowObj, showingProps) {
        var rowContent = Table.createRowBase(rowObj, showingProps)

        let link = ''
        if (rowObj.stripeTransaction) {
            link = `/transactions/stripe/${rowObj.stripeTransaction.id}`
        } else if (rowObj.paypalTransaction) {
            link = `/transactions/paypal/${rowObj.paypalTransaction.id}`
        }

        rowContent.push(<td key='buttons'><Link to={link}>Detail</Link></td>)
        return rowContent
    }
}

class DonationsInfoTable extends React.Component {
    render() {
        return (
            <div>
                <Table
                    headers={[
                        'Title',
                        'Type',
                        'Show on Front?',
                        'Open / Closed',
                        'Total Received',
                        'Total Pledged'
                    ]}
                    data={this.props.data}
                    createHead={headers => this.createHead(headers)}
                    createRow={(rowObj, showingProps) => this.createRow(rowObj, showingProps)}
                    checkableRows={true}
                    checkableRowCondition={rowObj => rowObj.isRemovable}
                    onCheckedRowsChange={checkedRows => this.props.onCheckedRowsChange(checkedRows)}/>
            </div>
        )
    }

    createHead(headers) {
        var head = Table.createHeadBase(headers)
        head.push(<td key='buttons'></td>)
        return head
    }

    createRow(rowObj, showingProps) {
        var rowContent = []
        rowContent.push(<td key='title'>{rowObj.title}</td>)

        rowContent.push(<td key='type'>{rowObj.donationType.type}</td>)

        rowContent.push(<td key='showOnFront'>
            <input
                type='checkbox'
                id={'toggle_show_' + rowObj.id}
                onChange={e => this.onFieldChange(rowObj.id, 'isShown', e.target.checked)}
                checked={rowObj.isShown}/>
        </td>)

        rowContent.push(<td key='openOrClosed'>
            <input
                type='checkbox'
                id={'toggle_closed_' + rowObj.id}
                onChange={e => this.onFieldChange(rowObj.id, 'isClosed', e.target.checked)}
                checked={rowObj.isClosed}
            />
        </td>)

        rowContent.push(<td key='totalAmountReceived'>{rowObj.totalAmountReceived}</td>)
        rowContent.push(<td key='targetAmount'>{rowObj.targetAmount}</td>)

        return rowContent
    }

    onFieldChange(id, name, value) {
        if (this.props.setField)
            this.props.setField(id, name, value)
    }
}

class DispatcherControls extends React.Component {
    render() {
        return (
            <div style={{ position: 'absolute', left: 0, bottom: 0, right: window.innerWidth < 768 ? 0 : 'auto' }}>
                <Button
                    onClick={this.props.onDelete}
                    className='custom'
                >
                    Delete selected
                </Button>
            </div>
        )
    }
}
const StudentPayments = DataLoader(
    class extends Component {
        constructor(props, context) {
            super(props, context)
            this.state = {
                payments: props.payments,
                paymentMethods: props.data,
                showDeletePayment: false,
                idToDelete: null,
                showStripeForm: false,
                clicked : 1
            }
            this.add = this.add.bind(this)
            this.change = this.change.bind(this)
            this.update = this.update.bind(this)
        }

        render() {
            const { showStripeForm } = this.state
            var {clicked} = this.state
            const { student } = this.props

            return (
                <div style={{ marginBottom: '20px' }}>
                    {this.renderTable()}
                    <Button
                        className='custom btn-success'
                        onClick={this.add}
                        style={{ marginRight: '15px' }}
                    >
                        Add New Payment
                    </Button>
                    <Button
                        style={{ marginRight: '15px' }}
                        className='custom btn-success'
                        onClick={
                            e=>{
                                e.preventDefault();
                                this.update();
                                clicked++;
                                this.setState({clicked : clicked});
                            }
                        }
                    >
                        Save
                    </Button>
                    {/*<StripePaymentWnd*/}
                        {/*show={showStripeForm}*/}
                        {/*onClose={update => {*/}
                            {/*this.setState({ showStripeForm: false })*/}
                            {/*if (update) {*/}
                                {/*this.props.onLoadData()*/}
                            {/*}*/}
                        {/*}}*/}
                        {/*studentId={student.id}*/}
                    {/*/>*/}
                </div>
            )
        }

        getPaymentsCount() {
            const { payments } = this.state
            var count = 0
            payments.forEach(item => {
                if (!item.isDeleted) count++
            })
            return count
        }

        renderTable() {
            const { payments, showDeletePayment } = this.state
            const { student } = this.props
            if (!payments || this.getPaymentsCount() === 0) {
                return <h3>No payments yet</h3>
            }

            return (
                <div>
                    <table className='table table-striped results-table'>
                        <thead>
                        <tr>
                            <td>Received by</td>
                            <td>Payment Method</td>
                            <td>Date</td>
                            <td>Amount</td>
                            <td>Staff</td>
                            <td></td>
                        </tr>
                        </thead>
                        <tbody>
                        {this.renderRows()}
                        </tbody>
                    </table>

                    <ConfirmDialog
                        headerText='Delete payment'
                        confirmText='Are you sure?'
                        onYes={() => { this.delete(); this.setState({ showDeletePayment: false }) }}
                        onNo={() => this.setState({ showDeletePayment: false })}
                        show={showDeletePayment}
                    />
                </div>
            )
        }

        renderRows() {
            const { payments, paymentMethods } = this.state
            const { student, appTypeKey } = this.props

            let rows = []

            // unneeded now, because of initial payments
            if (parseInt(student.totalAmount) > 0) {
                rows.push(
                    <StudentPaymentRow
                        key='initial'
                        paymentMethods={paymentMethods}
                        payment={{
                            received_by: student.payment_method,
                            payment_method: student.payment_method,
                            date: Dh.dateToStr(new Date()),
                            amount: student.totalAmount,
                            staff: student.invoiceId ? 'paypal' : 'cash'
                        }}
                        disabled
                    />
                )
            }
            if (payments) {
                rows = rows.concat(payments.map((payment, i) => {
                    if (payment.isDeleted) return false

                    const isSavedStripePayment =
                        ((payment.payment_method == 'stripe') && payment.id && (appTypeKey != ROLES.SUPER_ADMIN))

                    return (
                        <StudentPaymentRow
                            key={i}
                            index={i}
                            payment={payment}
                            onDelete={() => this.setState({ idToDelete: i, showDeletePayment: true })}
                            onChange={(name, value) => this.change(i, name, value)}
                            paymentMethods={paymentMethods}
                            disabled={isSavedStripePayment}
                            undeletable={isSavedStripePayment}
                        />
                    )
                }))
            }

            return rows
        }

        add() {
            var { payments, paymentMethods } = this.state
            const { remainingFee, student,courseId} = this.props
            var studentId = courseId;
            payments.push({
                instalmentId: 0,
                date: null,
                amount: '',
                staff: '',
                course_student_id: studentId,
                payment_method: ''
            })
            this.setState({ payments: payments ,clicked:1})
            this.props.onChange(payments)
        }

        delete() {
            var { payments, idToDelete: index } = this.state
            if (payments[index].id) {
                payments[index].isDeleted = true
            } else {
                payments.splice(index, 1)
            }
            this.setState({ payments: payments,clicked : 1 })
            this.props.onChange(payments)
        }
        update() {
            var { payments,clicked } = this.state
            if (clicked > 1) {
                return
            }
            $.ajax({
                type: 'post',
                url: '/api/students/updateStudentPayments',
                data : {
                    studentPayments: payments
                },
                success: data => {
                    Notifier.success('Successful!')
                },
                error: xhr => {
                    Notifier.error('Something Went Wrong!')
                }
            })
        }
        change(index, name, value) {
            var { payments } = this.state
            payments[index][name] = value
            this.setState({ payments: payments, clicked : 1 })
            this.props.onChange(payments)
        }
    },
    { load: { type: 'get', url: '/api/student-payments/get-payment-method-enum' } }
)

StudentPayments.PropTypes = {
    remainingFee: PropTypes.number,
    student: PropTypes.object,
    payments: PropTypes.arrayOf(PropTypes.object),
    onChange: PropTypes.func.isRequired
}
class StudentPaymentRow extends Component {
    constructor(props, context) {
        super(props, context)
        this.onChange = this.onChange.bind(this)
        this.delete = this.delete.bind(this)
        this.handleDateChange = this.handleDateChange.bind(this)
    }

    componentDidMount() {
        const { index } = this.props
        DatePicker.init(
            this.handleDateChange,
            { selector: `#payment-datepicker-${index}` }
        )
    }

    handleDateChange() {
        let name, value

        switch (arguments.length) {
            case 1:
                const e = arguments[0]
                name = e.target.name
                value = e.target.value
                break
            case 2:
                name = arguments[0]
                value = arguments[1]
                break
        }

        this.onChange(name, this.formatDate(value, 'yyyy-mm-dd'))
    }

    formatDate(date, format) {
        if (!date) return date
        var parts = date.split('-')
        switch (format) {
            case 'dd-mm-yyyy':
                if (parts[0].length === 4) {
                    parts.reverse()
                }
                break
            case 'yyyy-mm-dd':
                if (parts[2].length === 4) {
                    parts.reverse()
                }
                break
        }

        return parts.join('-')
    }

    render() {
        const { instalmentId, id, received_by, payment_method, date, amount, staff } = this.props.payment
        const { paymentMethods, disabled, undeletable, index } = this.props

        return (
            <tr>
                <td>
                    <input
                        type='text' value={received_by} name='received_by'
                        className='form-control' onChange={this.onChange} disabled={disabled}
                    />
                </td>

                <td>
                    <select
                        className='form-control'
                        name='payment_method'
                        id='payment_method'
                        value={payment_method}
                        onChange={this.onChange}
                        disabled={disabled}
                    >
                        <option value="">Select method</option>
                        {
                            paymentMethods ? paymentMethods.map(
                                (item, i) => (
                                    <option key={i} value={item.value}>{item.label}</option>
                                )
                            ) : ''
                        }
                    </select>
                </td>

                <td>
                    <input
                        value={this.formatDate(date, 'dd-mm-yyyy')}
                        name='date'
                        id={`payment-datepicker-${index}`}
                        className='form-control datepicker'
                        onChange={this.handleDateChange}
                        disabled={disabled}

                    />
                </td>

                <td>
                    <input
                        type='text' value={amount} name='amount'
                        className='form-control' onChange={this.onChange}
                        disabled={disabled}
                    />
                </td>

                <td>
                    <input
                        type='text' value={staff} name='staff'
                        className='form-control' onChange={this.onChange}
                        disabled={(payment_method != 'stripe') && disabled}
                    />
                </td>

                <td>
                    {(!disabled && !undeletable) ?
                        <Button bsStyle='danger' onClick={this.delete}>Delete</Button>
                        : ''
                    }
                </td>
            </tr>
        )
    }

    delete() {
        this.props.onDelete()
    }

    onChange() {
        let name, value

        switch (arguments.length) {
            case 1:
                const e = arguments[0]
                name = e.target.name
                value = e.target.value
                break
            case 2:
                name = arguments[0]
                value = arguments[1]
                break
        }

        this.props.onChange(name, value)
    }
}
StudentPaymentRow.PropTypes = {
    payment: PropTypes.shape({
        id: PropTypes.number,
        instalmentId: PropTypes.number,
        date: PropTypes.string.isRequired,
        amount: PropTypes.number.isRequired,
        staff: PropTypes.string.isRequired
    }).isRequired,
    onDelete: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired
}
class BasketInnerClass extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { data: [], showConfirmDelete: false, checkedRows: [] }
        this.delays = {}
        this.loadData = this.loadData.bind(this)
        this.deleteData = this.deleteData.bind(this)
        this.createRow = this.createRow.bind(this)
        this.onChangeStudentStatus = this.onChangeStudentStatus.bind(this)

        props.onSubscribe({ basketUpdate: this.loadData })
    }

    loadData() {
        const { execute, onGetCount } = this.props
        execute('load', null,
                data => { this.setState({ data: data }); onGetCount(O.getIfExists(data, 'info.totalCount', 0)) },
                xhr => console.error(xhr)
        )
    }

    deleteData(reason) {
        const { execute } = this.props
        const { checkedRows } = this.state

        if (checkedRows.length === 0) return

        execute('remove', {
                ids: checkedRows,
                reason: reason
            },
            () => {
                this.setState({ checkedRows: [] })
                this.loadData()
                Notifier.success('Deleted successfully')
            },
                xhr => { console.error(xhr); Notifier.error('Deletion failed') }
        )
    }

    onChangeStudentStatus(e, cartItemId, delay) {
        var parts = cartItemId.split('|')
        const cartId = parts[0]
        const classId = parts[1]

        const { name, value } = e.target

        let { data, data: { rows } } = this.state

        for (let i = 0; i < rows.length; i++) {
            if (rows[i].id == cartItemId) {
                rows[i][name] = value
                break
            }
        }

        data.rows = rows

        this.setState({ data: data })

        let input = { [name]: value }
        if (name == 'studentStatus') {
            input.originalStudentStatus = value;
        }

        let ajaxData = {
            type: 'put',
            url: `/api/cart/${cartId}/${classId}`,
            data: input,
            success: data => {
                if (value !== 'reduced') {
                    this.loadData(data)
                }
            },
            error(xhr) {
                Notifier.error('Error updating cart item')
                console.error(xhr)
            }
        }

        if (delay && delay > 0) {
            if (this.delays[cartItemId]) clearTimeout(this.delays[cartItemId])
            this.delays[cartItemId] = setTimeout(() => $.ajax(ajaxData), delay)
        } else {
            $.ajax(ajaxData)
        }
    }

    createRow(rowObj) {
        const { website } = this.context
        let rowData = []
        let i = 0
        const push = item => rowData.push(<td key={i++}>{item}</td>)

        push(<p>{rowObj.createdAt}</p>)
        push(<p>{rowObj.className}</p>)
        push(
            <select
                className='form-control'
                value={rowObj.studentStatus}
                name='studentStatus'
                onChange={e => this.onChangeStudentStatus(e, rowObj.id)}
            >
                <option value='employed'>{O.getIfExists(website, 'paymentField1', 'employed')}</option>
                <option value='unemployed'>{O.getIfExists(website, 'paymentField2', 'unemployed')}</option>
                <option value='reduced'>reduced</option>
            </select>
        )

        if (rowObj.studentStatus !== 'reduced') {
            push(<p>{parseFloat(rowObj.calculatedPrice).toFixed(2)}</p>)
        } else {
            push(
                <input
                    className='form-control'
                    name='calculatedPrice'
                    type="text"
                    value={rowObj.calculatedPrice}
                    onChange={e => {
                        this.onChangeStudentStatus(e, rowObj.id, 2500)
                    }}
                />
            )
        }
        return rowData
    }

    getPrices() {
        const { rows } = this.state.data
        if (!rows || rows.length === 0) return 0

        let prices = rows.map(item => {
            return { price: item.calculatedPrice, priceWithSurcharge: item.priceWithSurcharge }
        })

        return prices
    }

    componentDidMount() {
        this.loadData()
    }

    render() {
        const { showConfirmDelete, data, showPaymentForm } = this.state
        const { userId } = this.props

        if (showPaymentForm) {
            return (
                <div>
                    <StudentPaymentForm
                        params={{ userId: userId }}
                        url='/api/cart/checkout'
                        type='get'
                        prices={this.getPrices()}
                        onClose={() => {this.setState({ showPaymentForm: false })}}
                        onComplete={() => this.loadData()}
                    />
                </div>
            )
        }

        if (O.getIfExists(data, 'rows.length', 0) === 0) {
            return <p>No items in basket</p>
        }

        return (
            <div>
                <Table
                    data={data.rows}
                    showingProps={['createdAt', 'className', 'studentStatus', 'priceWithSurcharge']}
                    createRow={this.createRow}
                    headers={['Add Time', 'Class Name', 'Student Status', 'Fee']}
                    checkableRows
                    onCheckedRowsChange={checkedRows => { this.setState({ checkedRows: checkedRows }) }}
                />

                <div>
                    <Button
                        className='custom'
                        onClick={() => this.setState({ showConfirmDelete: true })}
                    >
                        Delete Selected
                    </Button>

                    <Button
                        className='custom'
                        style={{ marginLeft: '10px' }}
                        onClick={() => this.setState({ showPaymentForm: true })}
                    >
                        Process Payment
                    </Button>
                </div>

                <ConfirmDeleteWnd
                    show={showConfirmDelete}
                    onConfirm={this.deleteData}
                    onClose={() => this.setState({ showConfirmDelete: false })}
                />
            </div>
        )
    }
}

BasketInnerClass.contextTypes = {
    website: PropTypes.object.isRequired
}

const BasketComposed = DataLoader(BasketInnerClass)

const Basket = (props) => {
    return (
        <BasketComposed
            {...props}
            ajaxOperations={{
                load: { type: 'get', url: `/api/users/${props.userId}/basket` },
                remove: { type: 'delete', url: '/api/cart/delete' },
            }}
        />
    )
}