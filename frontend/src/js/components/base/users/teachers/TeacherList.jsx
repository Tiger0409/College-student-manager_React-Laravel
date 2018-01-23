import React, { PropTypes, Component } from 'react'
import { ROLES } from './../../../../config/constants.js'
import { Button } from 'react-bootstrap'
import PromiseHelper from './../../../../utils/PromiseHelper.js'
import Table from './../../../common/Table.jsx'
import { Link } from 'react-router'
import Paginator from './../../../common/Paginator.jsx'
import FormGroup from './../../../common/FormGroup.jsx'
import { browserHistory  } from 'react-router'
import { LinkContainer } from 'react-router-bootstrap'
import { FormField } from '../../../common/FormWidgets.jsx'
import Spinner from '../../../common/Spinner.jsx'
import { Row, Modal,Col } from 'react-bootstrap'
import BranchFilter from '../../BranchFilter.jsx'
import Notifier from './../../../../utils/Notifier.js'

export default class TeacherList extends Component {
    static allowedRoles() {
        return [ROLES.SUPER_ADMIN, ROLES.ADMIN]
    }

    constructor(props, context) {
        super(props, context)
        this.state = {
            activeTab: 0,
            isLoading: false,
            totalCount: 0,
            teachers: [],
            paynames: [],
            termOptions: [],
            payNameOptions: [],
            selectedTerm: 0,
            selectedPayName:0,
            modal: false,
            editPayName : false,
            selectedTeacher:0,
            newPayname:{
                name:'',
                description:'',
                branch_id:null,
                selected_term:null,
                time_in:null,
                time_out:null
            }
        }
        this.requestFields = [
            'id',
            'userStatus',
            'userFullname',
            'branchName',
            'branchId',
            'profile.teacherCrb',
            'teacherHourlyRate',
            'userDefaultTimeIn',
            'userDefaultTimeOut',
            'teacherCourseClasses'
        ]
        this.rowsPerPage = 20
        this.page = 1
        this.promises = { load: null, loadTermOptions: null, loadPayNameOptions:null }

        /*this.showMore = this.showMore.bind(this)*/
        this.load = this.load.bind(this)
    }

    componentWillMount() {
        this.load(this.props, this.context)
    }
    getByPayName(id){
        this.setState({ isLoading: true })
        if (id ==='Select Pay name'){
            this.setState({ isLoading: false })
            return false
        }
        PromiseHelper.ajax({
            type: 'get',
            url: `api/users/getbypayname/${id}`,
        })
            .then(
                data => {
                    this.setState({isLoading: false, teachers: data.rows, totalCount: data.info.totalCount})
                    this.renderTermSelection()
                },
                xhr => {
                    console.log(xhr)
                }
            )
    }
    showPopup(edit = false){
        const { selectedPayName } = this.state
        if (edit){
            this.setState({
                editPayName : true
            })
            PromiseHelper.ajax({
                type: 'get',
                url : 'api/payname/get/'+selectedPayName
            })
                .then(
                    data=>{
                        this.setState({newPayname:data});
                    },
                    xhr=>{
                        console.log(xhr)
                    }
                )

        }
        this.setState({ modal:true })
    }
    componentWillUnmount() {
        for (let key in this.promises) {
            if (this.promises[key]) {
                this.promises[key].cancel()
            }
        }
    }
    changeTerm(term){
        localStorage.setItem("termId",term);
        this.setState({ isLoading: true })
        this.promises.load = PromiseHelper.ajax({
            type: 'get',
            url: '/api/users/teachers',
            data: {
                page: this.page,
                rowsPerPage: this.rowsPerPage,
                fields: this.requestFields,
                branchId:localStorage.getItem('branchId'),
                termId:term
            }
        })
        this.promises.load.then(
            data => {
                this.setState({ isLoading: false, teachers: data.rows, totalCount: data.info.totalCount })
            },
            xhr => console.log(xhr)
        )
        this.promises.loadPayNameOptions = PromiseHelper.ajax({
            type: 'get',
            url: '/api/PayName/list',
            data: {
                selected_term:localStorage.getItem('termId'),
                branch_id:localStorage.getItem('branchId')
            }
        })
        this.promises.loadPayNameOptions.then(
            data =>{
                if (data.length <=0) {
                    this.setState({payNameOptions: [], selectedPayName: 0})
                }else{
                    this.setState({ payNameOptions: data, selectedPayName: 0 })
                }
            },
            xhr =>console.log(xhr)
        )
        PromiseHelper.ajax({
            type: 'get',
            url: '/api/payname/totallist',
            data: {
                branchId: localStorage.getItem('branchId'),
                termId:localStorage.getItem('termId')
            }
        })
            .then(
                data=>{
                    if (data.length <=0) {
                        this.setState({paynames: []})
                    }else{
                        this.setState({ paynames: data})
                    }
                },
                xhr=>console.log(xhr)
            )
    }
    load(props, context) {
        this.setState({ isLoading: true })
        var { branchId } = this.context
        if (branchId){
            branchId = localStorage.getItem('branchId')
            if (branchId == ""){
                branchId = 0
            }
        }
        const {editPayName} = this.state
        if (this.promises.load) this.promises.load.cancel()
        this.promises.load = PromiseHelper.ajax({
            type: 'get',
            url: '/api/users/teachers',
            data: {
                page: this.page,
                rowsPerPage: this.rowsPerPage,
                fields: this.requestFields,
                branchId: branchId,
                termId:localStorage.getItem('termId')

            }
        })
        this.promises.load.then(
            data => {
                this.setState({ isLoading: false, teachers: data.rows, totalCount: data.info.totalCount })
            },
            xhr => console.log(xhr)
        )
        if (this.promises.loadTermOptions) this.promises.loadTermOptions.cancel()
        this.promises.loadTermOptions = PromiseHelper.ajax({
            type: 'get',
            url: '/api/terms/list'
        })
        this.promises.loadTermOptions.then(
            data => {
                let selectedTerm = null
                for (let i = 0; i < data.length; i++) {
                    if (data[i].isActive == '1') {
                        selectedTerm = data[i].value
                        break
                    }
                }

                if (selectedTerm === null && data.length > 0) {
                    selectedTerm = data[0].value
                }

                this.setState({ termOptions: data, selectedTerm: selectedTerm })
                localStorage.setItem('termId',selectedTerm)
            },
            xhr => console.log(xhr)
        )
        if (this.promises.loadPayNameOptions) this.promises.loadPayNameOptions.cancel()
        this.promises.loadPayNameOptions = PromiseHelper.ajax({
            type: 'get',
            url: '/api/PayName/list',
            data:{selected_term:localStorage.getItem('termId')}
        })
        this.promises.loadPayNameOptions.then(
            data =>{
                if (data.length <=0) {
                    this.setState({payNameOptions: [], selectedPayName: 0})
                }else{
                    this.setState({ payNameOptions: data, selectedPayName: 0 })
                }
            },
            xhr =>console.log(xhr)
        )

    }
    updatePayname(newPayName){
        this.state.newPayname.selected_term=this.state.selectedTerm;
        PromiseHelper.ajax({
            type : "post",
            url : 'api/payname/update/'+newPayName.id,
            data : newPayName
        }).then(
            data =>{
                Notifier.success('Updated successfully')
                this.setState({
                    modal:false,
                    newPayname:{
                        name:'',
                        description:'',
                        branch_id:null,
                        selected_term:null,
                        time_in:null,
                        time_out:null
                    }
                })
            },
            xhr =>{
                Notifier.error('Update Has failed')
                this.setState({modal:false})
            }
        )
    }
    addPayName() {
        this.state.newPayname.selected_term=this.state.selectedTerm;
        PromiseHelper.ajax({
            type: 'post',
            url: 'api/addpayname',
            data: this.state.newPayname,
        })
            .then(
                data =>{
                    Notifier.success('Created successfully')
                    this.setState({
                        modal:false,
                        payNameOptions :data ,
                        selectedPayName: 0,
                        newPayname:{
                            name:'',
                            description:'',
                            branch_id:null,
                            selected_term:null,
                            time_in:null,
                            time_out:null
                        }
                    })
                },
                xhr =>{
                    Notifier.error('Creat failed')
                    this.setState({modal:false})
                }
            )
    }
    componentWillReceiveProps(nextProps, nextContext) {

        let updated = {}
        let filters = null

        this.context =  { branchId: localStorage.getItem('branchId') }
        if (this.context.branchId != nextContext.branchId) {
            filters = { branchId: this.context.branchId }
            Object.assign(updated, { data: [], offset: 0 })
        }

        if (this.props.termId != nextProps.termId) {
            updated.termId = nextProps.termId
        }
        if (Object.keys(updated).length > 0) {
            this.setState(updated, () => this.load(filters))
        }
    }
    renderTable() {
        const { isLoading, teachers, selectedTerm,paynames, selectedPayName,payNameOptions } = this.state
        if (isLoading) return (<Spinner />)

        return (
            <TeachersTable teachers={teachers} selectedTerm={selectedTerm} payNameOptions={payNameOptions} selectedPaynName={selectedPayName} paynames={paynames} />
        )
    }
    renderPaginator() {
        const { totalCount } = this.state

        return (
            <Paginator totalCount={totalCount} rowsPerPage={this.rowsPerPage}
                       currentPage={this.page} onPageChange={pageNum => {this.page = pageNum; this.load()}}/>
        )
    }

    renderControls() {
        const { selectedPayName ,payNameOptions} = this.state
        let buttonStyle = {
            marginLeft: 20,
            marginBottom: 10
        }
        if (window.innerWidth < 768) {
            buttonStyle = { marginBottom: 10 }
        }
        let branchId =  localStorage.getItem('branchId') ;
        if (branchId=="") {
            branchId = 0;
        }
        if(payNameOptions.length > 0){
            return (
                <div>
                    <Button className='custom' style={{ marginBottom: 10 }} onClick={e=>{e.preventDefault();this.showPopup()}} >
                        Add New Pay Name
                    </Button>
                    <LinkContainer to={{pathname: '/users/role/teachers/add/'}}>
                        <Button className='custom' style={buttonStyle} bsStyle='success'>Add New Teacher</Button>
                    </LinkContainer>
                    <Link className='custom' target="_blank" style={{color:'white'}} to={'payname/'+selectedPayName+"/"+branchId}>
                        <Button className='custom' style={buttonStyle}>
                            Print Pay Name
                        </Button>
                    </Link>
                </div>
            )
        }
        return (
            <div>
                <Button className='custom' style={{ marginBottom: 10 }} onClick={e=>{e.preventDefault();this.showPopup()}} >
                    Add New Pay Name
                </Button>
                <LinkContainer to={{pathname: '/users/role/teachers/add/'}}>
                    <Button className='custom' style={buttonStyle} bsStyle='success'>Add New Teacher</Button>
                </LinkContainer>
            </div>
        )

    }

    renderTermSelection() {
        const { termOptions, selectedTerm, selectedPayName,payNameOptions } = this.state
        localStorage.setItem("termId", selectedTerm);
        let payname ;
        for (var i = 0; i < payNameOptions.length; i++) {
            if (payNameOptions[i].value === parseInt(selectedPayName)) {
                payname = payNameOptions[i];
                return (
                    <Row>
                        <FormField width={4} label='Selected term' style={{marginTop: '20px'}}>
                            <select
                                className='form-control'
                                value={selectedTerm}
                                onChange={e => {
                                    e.preventDefault();
                                    this.setState({selectedTerm: e.target.value});
                                    this.changeTerm(e.target.value)
                                }}
                            >
                                {
                                    termOptions.map(
                                        term => <option key={term.value} value={term.value}>{term.label}</option>
                                    )
                                }
                            </select>
                        </FormField>
                        <FormField width={4} label='Pay Name' style={{marginTop: '20px'}}>
                            <select
                                className='form-control'
                                value={selectedPayName}
                                onChange={e => {
                                    e.preventDefault();
                                    this.setState({selectedPayName: e.target.value});
                                    this.getByPayName(e.target.value)
                                }}
                            >
                                <option selected="true">Select Pay name</option>
                                {
                                    payNameOptions.map(
                                        payName => <option key={payName.value}
                                                           value={payName.value}>{payName.label}</option>
                                    )
                                }
                            </select>
                        </FormField>
                        <Col md={4}>
                            <Button style={{marginTop: '45px'}} className='custom' onClick={e => {
                                e.preventDefault();
                                this.showPopup(true)
                            }}>
                                Edit Pay Name
                            </Button>
                        </Col>
                        <Col md={12}>
                            <h3>
                                {payname.label} Term {payname.termName} (Hours {payname.timeIn}
                                - {payname.timeOut}) {payname.branchName}
                                This Month Includes week so and so {payname.description}
                            </h3>
                        </Col>
                    </Row>
                )
            }
        }
        return (
            <Row style={{ marginTop: '10px' }}>
                <FormField width={4} label='Selected term' style={{marginTop : '20px'}}>
                    <select
                        className='form-control'
                        value={selectedTerm}
                        onChange={e => {this.setState({ selectedTerm: e.target.value });this.changeTerm(e.target.value)}}
                    >
                        {
                            termOptions.map(
                                term => <option key={term.value} value={term.value}>{term.label}</option>
                            )
                        }
                    </select>
                </FormField>
                <FormField width={4} label='Pay Name' style={{marginTop : '20px'}}>
                    <select
                        className='form-control'
                        value={selectedPayName}
                        onChange={e => {
                            e.preventDefault();
                            this.setState({ selectedPayName: e.target.value })
                            this.getByPayName(e.target.value)
                        }}
                    >
                        <option selected="true">Select Pay name</option>
                        {
                            payNameOptions.map(
                                payName => <option key={payName.value} value={payName.value}>{payName.label}</option>
                            )
                        }
                    </select>
                </FormField>
            </Row>
        )
    }
    renderModal() {
        const {modal, termOptions, selectedTerm, selectedPayName, editPayName} = this.state
        let {newPayname} = this.state
        let close = () => {
            this.setState({
                modal: false,
                editPayName: false
            })
        }
        let createNew = (e) => {
            e.preventDefault();
            this.addPayName();
        }
        let updateNew = (e, newPayName) => {
            e.preventDefault();
            this.updatePayname(newPayName);
        }
        if (editPayName) {
            let {newPayname} = this.state
            return (
                <Modal
                    show={modal}
                    onHide={close}
                    container={this}
                    bsSize="large"
                    aria-labelledby="contained-modal-title-lg"
                    bsClass="modal"
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title">Update Pay Name</Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{overflowY: 'auto'}}>
                        <Row>
                            <Col md={12}>
                                <label className="detail-field-label">Name : <p
                                    style={{color: "black", display: 'inline-block'}}>{newPayname.name}</p></label>
                                <input className="form-control" type="text" placeholder="Write New Name of Pay Name"
                                       onChange={e => {
                                           e.preventDefault();
                                           newPayname.name = e.target.value;
                                       }}/>
                                <label className="detail-field-label">Description : <p
                                    style={{color: "black", display: 'inline-block'}}>{newPayname.description}</p>
                                </label>
                                <textarea style={{marginTop: '10px'}} className="form-control"
                                          placeholder="Write a New Description" cols="30" rows="10" onChange={e => {
                                    e.preventDefault();
                                    newPayname.description = e.target.value
                                }}></textarea>
                                <Row>
                                    <FormField width={6} label='Term' style={{marginTop: '10px'}}>
                                        <select
                                            className='form-control'
                                            value={newPayname.selected_term}
                                            onChange={e => {
                                                this.setState({selectedTerm: e.target.value});
                                                newPayname.selected_term = e.target.value;
                                            }}
                                        >
                                            <option></option>
                                            {
                                                termOptions.map(
                                                    term => <option key={term.value}
                                                                    value={term.value}>{term.label}</option>
                                                )
                                            }
                                        </select>
                                    </FormField>
                                    <Col md={6} sm={6} xs={12} style={{marginTop: '10px'}}>
                                        <div className="form-group">
                                            <label className="detail-field-label">Select Branch</label>
                                            <BranchFilter value={newPayname.branch_id} onChange={id => {
                                                newPayname.branch_id = id
                                            }}/>
                                        </div>
                                    </Col>
                                    <Col md={6} sm={6} xs={12}>
                                        <div className="form-group">
                                            <label htmlFor="timeIn" className="detail-field-label">Time In : <p style={{
                                                color: "black",
                                                display: 'inline-block'
                                            }}>{newPayname.time_in}</p></label>
                                            <input type="time" id="timeIn" className="form-control" onChange={e => {
                                                e.preventDefault();
                                                newPayname.time_in = e.target.value
                                            }}/>
                                        </div>
                                    </Col>
                                    <Col md={6} sm={6} xs={12}>
                                        <div className="form-group">
                                            <label htmlFor="timeOut" className="detail-field-label">Time Out : <p
                                                style={{
                                                    color: "black",
                                                    display: 'inline-block'
                                                }}>{newPayname.time_out}</p></label>
                                            <input type="time" id="timeOut" className="form-control" onChange={e => {
                                                e.preventDefault();
                                                newPayname.time_out = e.target.value
                                            }}/>
                                        </div>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer style={{padding:"6px 15px"}}>
                        <Button className='custom' onClick={e => {
                            e.preventDefault();
                            updateNew(e, newPayname);
                        }}>Update</Button>
                    </Modal.Footer>
                </Modal>
            )
        }
        return (
            <Modal
                show={modal}
                onHide={close}
                container={this}
                bsSize="large"
                aria-labelledby="contained-modal-title-lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title">Create New Pay Name</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{overflowY: 'auto'}}>
                    <Row>
                        <Col md={12}>
                            <input className="form-control" type="text" placeholder="Write Name of Pay Name"
                                   onChange={e => {
                                       e.preventDefault();
                                       newPayname.name = e.target.value;
                                   }}/>
                            <textarea style={{marginTop: '10px'}} className="form-control"
                                      placeholder="Write a Description" cols="30" rows="10" onChange={e => {
                                e.preventDefault();
                                newPayname.description = e.target.value
                            }}></textarea>
                            <FormField width={6} label='Term' style={{marginTop: '20px'}}>
                                <select
                                    className='form-control'
                                    value={selectedTerm}
                                    onChange={e => {
                                        this.setState({selectedTerm: e.target.value});
                                        newPayname.selected_term = e.target.value
                                    }}
                                >
                                    <option></option>
                                    {
                                        termOptions.map(
                                            term => <option key={term.value}
                                                            value={term.value}>{term.label}</option>
                                        )
                                    }
                                </select>
                            </FormField>
                            <Col md={6} sm={6} xs={12} style={{marginTop: '20px'}}>
                                <div className="form-group">
                                    <label className="detail-field-label">Select Branch</label>
                                    <BranchFilter onChange={id => {
                                        newPayname.branch_id = id
                                    }}/>
                                </div>
                            </Col>
                            <Col md={6} sm={6} xs={12}>
                                <div className="form-group">
                                    <label htmlFor="timeIn" className="detail-field-label">Time In</label>
                                    <input type="time" id="timeIn" className="form-control"
                                           style={{marginTop: "15px"}} onChange={e => {
                                        e.preventDefault();
                                        newPayname.time_in = e.target.value
                                    }}/>
                                </div>
                            </Col>
                            <Col md={6} sm={6} xs={12}>
                                <div className="form-group">
                                    <label htmlFor="timeOut" className="detail-field-label">Time Out</label>
                                    <input type="time" id="timeOut" className="form-control"
                                           style={{marginTop: "15px"}} onChange={e => {
                                        e.preventDefault();
                                        newPayname.time_out = e.target.value
                                    }}/>
                                </div>
                            </Col>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button className='custom' onClick={e => {
                        e.preventDefault();
                        createNew(e);
                    }}>Create</Button>
                </Modal.Footer>
            </Modal>

        )

    }
    render() {
        return (
            <div className='content-block' style={{ paddingTop: '35px' }} >
                {this.renderTermSelection()}
                {this.renderTable()}
                {this.renderPaginator()}
                {this.renderControls()}
                {this.renderModal()}
            </div>
        )
    }
}

class TeachersTable extends Component {
    render() {
        const { teachers ,paynames ,selectedPayName} = this.props
        if (!teachers || teachers.length == 0) return (<p>No teachers found!</p>)

        return (
            <div>
                <Table
                    name={selectedPayName}
                    data={teachers}
                    showingProps={[]}
                    headers={['Name','Branch' ,'Classes', 'Week 1','Week 2','Week 3','Week 4','Total','Pay','','']}
                    createRow={(rowObj, showingProps) => this.createRow(rowObj, showingProps)}
                />
                {/*<DashboardFilterForm*/}
                {/*initialFilters={{ term: this.props.data.id }}*/}
                {/*onFiltersSubmit={this.load}*/}
                {/*visible={showForm}*/}
                {/*/>*/}
            </div>

        )
    }

    createRow(rowObj, showingProps) {

        var courseClasses = rowObj.teacherCourseClasses
        var totalPayName = rowObj.totalPayName
        var teacherHourlyRate = rowObj.teacherHourlyRate

        if (!courseClasses) {
            courseClasses = []
        }

        const { selectedTerm } = this.props
        const { branchId } = this.context
        const { selectedPaynName } = this.props
        const { payNameOptions } = this.props
        var classOptions = []
        courseClasses.forEach((item, i) => {
            if (
                item.termId == selectedTerm
            ) {
                classOptions.push(
                    <option key={i} value={item.id}>
                        {`${item.classTime} (${item.courseTitle})`}
                    </option>
                )
            }
        })

        let { router } = this.context

        var row = Table.createRowBase(rowObj, showingProps)
        row.push(
            <td key='userFullname'>
                <Link to={`/users/${rowObj.id}`}>
                    {rowObj.userFullname}
                </Link>
            </td>
        )
        row.push(
            <td key='branchName'>
                {rowObj.branchName}
            </td>
        )
        row.push(
            <td key='classes'>
                <div style={{ width: '200px' }}>
                    <select
                        value={-1}
                        className='form-control'
                        onChange={e => {
                            let id = e.target.value
                            if (id !== -1) {
                                router.push(`/classes/${e.target.value}`)
                            }
                        }}
                    >
                        <option value="-1">{`Classes (${classOptions.length})`}</option>
                        {classOptions}
                    </select>
                </div>
            </td>
        )
        for(let i =0;i<payNameOptions.length;i++) {
            if (selectedPaynName != 0 && selectedPaynName==payNameOptions[i].value && rowObj.branchId==payNameOptions[i].branchId) {
                var rate = teacherHourlyRate * (parseInt(rowObj.totalPayName.rateHours / 60))
                row.push(
                    <td key='week1'>
                        <p style={{fontSize:'18px'}}>{totalPayName.week1}</p>
                        <p style={{color: 'red',fontSize:'12px'}}>{rowObj.totalPayName.weekLate1}</p>
                    </td>
                )
                row.push(
                    <td key='week2'>
                        <p style={{fontSize:'18px'}}>{totalPayName.week2}</p>
                        <p style={{color: 'red',fontSize:'12px'}}>{rowObj.totalPayName.weekLate2}</p>
                    </td>
                )
                row.push(
                    <td key='week3'>
                        <p style={{fontSize:'18px'}}>{totalPayName.week3}</p>
                        <p style={{color: 'red',fontSize:'12px'}}>{rowObj.totalPayName.weekLate3}</p>
                    </td>
                )
                row.push(
                    <td key='week4'>
                        <p style={{fontSize:'18px'}}>{totalPayName.week4}</p>
                        <p style={{color: 'red',fontSize:'12px'}}>{rowObj.totalPayName.weekLate4}</p>
                    </td>
                )
                row.push(
                    <td key='Total'>
                        <p style={{fontSize:'18px'}}>{totalPayName.Total}</p>
                        <p style={{color: 'red',fontSize:'12px'}}>{rowObj.totalPayName.totalLate}</p>
                    </td>
                )
                row.push(
                    <td key='pay'>
                        <p>{rate} &pound;</p>
                    </td>
                )
                row.push(
                    <td key='hours'>
                        <Button
                            onClick={() =>{
                                if($.isNumeric(selectedPaynName)){
                                    router.push(`/addpay/${selectedPaynName}/${rowObj.id}`)
                                }else{
                                    return false
                                }
                            }}
                        >
                            Hours
                        </Button>
                    </td>
                )
                break;
            } else {
                continue;
            }
            row.push(
                <td key='week1'>
                    <p>Select Pay Name</p>
                </td>
            )
            row.push(
                <td key='week2'>
                    <p>Select Pay Name</p>
                </td>
            )
            row.push(
                <td key='week3'>
                    <p>Select Pay Name</p>
                </td>
            )
            row.push(
                <td key='week4'>
                    <p>Select Pay Name</p>
                </td>
            )
            row.push(
                <td key='Total'>
                    <p>Select Pay Name</p>
                </td>
            )
        }
        return row
    }
}
TeachersTable.PropTypes = {
    teachers: PropTypes.arrayOf(PropTypes.object)
}

TeachersTable.contextTypes = {
    router: PropTypes.func.isRequired,
    branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
}