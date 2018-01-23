import React, { PropTypes, Component } from 'react'
import { Link } from 'react-router'
import { LinkContainer } from 'react-router-bootstrap'
import { ROLES, ROLE_IDS } from './../../../../config/constants.js'
import { FormField, EditableHTML, EditableValue, EditableValueInput, RadioInputs } from './../../../common/FormWidgets.jsx'
import PromiseHelper from '../../../../utils/PromiseHelper.js'
import { Button,ListGroup, ListGroupItem, Row, Col } from 'react-bootstrap'
import Notifier from '../../../../utils/Notifier.js'
import Table from './../../../common/Table.jsx'
import Spinner from '../../../common/Spinner.jsx'
import ObjHelper from './../../../../utils/ObjHelper.js'
import Switchable from '../../../common/Switchable.jsx'
import S from '../../../../utils/StringHelper.js'
import { Redirect } from 'react-router';



export default class TeacherPayName extends Component{
    constructor(props, context) {
        super(props, context)
        this.state = { isLoading: false, user: null ,error : false}
        this.promises = {
            load: null,
            save: null,
            loadTeacherTitles: null,
            loadTeacherStatus: null
        }
        this.onFieldChange = this.onFieldChange.bind(this)
        this.changeField = this.changeField.bind(this)
    }
    onFieldChange(name,value,id,data) {
        this.changeField(name,value,id,data)
    }
    changeField(name, value,id,weekId) {
        var { week1, week2, week3, week4, defaultTimeIn ,defaultTimeOut } = this.state
        switch(weekId) {
            case 1:
                ObjHelper.accessObjByPath(week1[id-1], name, () => value)
                this.setState({ week1: week1 })
                break;
            case 2:
                ObjHelper.accessObjByPath(week2[id-1], name, () => value)
                this.setState({ week2: week2 })
                break;
            case 3:
                ObjHelper.accessObjByPath(week3[id-1], name, () => value)
                this.setState({ week3: week3 })
                break;
            case 4:
                ObjHelper.accessObjByPath(week4[id-1], name, () => value)
                this.setState({ week4: week4 })
                break;
            case "defaultTimeIn":
                defaultTimeIn = value
                this.setState({
                    defaultTimeIn: defaultTimeIn,
                    changedDefault:true
                })
                break;
            case 'defaultTimeOut':
                defaultTimeOut = value
                this.setState({
                    defaultTimeOut:defaultTimeOut,
                    changedDefault:true
                })
        }
        this.updatePayName()
    }
    updatePayName(){
        const { week1,week2,week3,week4, defaultTimeIn, defaultTimeOut,changedDefault } = this.state
        if (changedDefault){
            var userId = this.props.params.id
        }else{
            var userId = ''
        }
        PromiseHelper.ajax({
            type:'post',
            url :'/api/updatePayName',
            data : {
                weekdays:{
                    w1 : week1,
                    w2 : week2,
                    w3 : week3,
                    w4 : week4
                },
                defaultTimeIn:defaultTimeIn,
                defaultTimeOut:defaultTimeOut,
                user_id :userId
            }
        }).then(
            data=>{
                Notifier.success('Updated successfully')
                this.componentDidMount()
            },
            xhr=>{
                Notifier.error('Error during update')
                console.log(xhr)
            }
        )

    }
    load(id,userid) {
        console.log(userid)
        this.setState({
            isLoading: true,
            changedDefault:false
        })
        if (localStorage.getItem('branchId') == ""){
            localStorage.setItem('branchId',0)
        }
        this.promises.load = PromiseHelper.ajax({
            type: 'get',
            url: 'backend/public/api/PayName/',
            data: {
                branchId :localStorage.getItem('branchId'),
                termId : localStorage.getItem('termId'),
                userId : userid,
                id : id
            }
        })
        this.promises.load.then(
            data => {
                if (data.error) {
                    this.setState({error:data.error})
                }else{
                    this.setState({
                        isLoading: false,
                        week1: data.rows[0].rows,
                        week2: data.rows[1].rows,
                        week3: data.rows[2].rows,
                        week4: data.rows[3].rows,
                        week1Total : data.rows[0].weekTotal,
                        week2Total : data.rows[1].weekTotal,
                        week3Total : data.rows[2].weekTotal,
                        week4Total : data.rows[3].weekTotal,
                        week1TotalLate : data.rows[0].totalWeekLate,
                        week2TotalLate : data.rows[1].totalWeekLate,
                        week3TotalLate : data.rows[2].totalWeekLate,
                        week4TotalLate : data.rows[3].totalWeekLate,
                        userName:data.rows[0].userFullName,
                        payName:data.rows[0].payName,
                        error:data.error,
                        defaultTimeOut:data.rows[0].defaultTimeOut,
                        defaultTimeIn:data.rows[0].defaultTimeIn
                    });
                }

            },
            xhr => console.log(xhr)
        )
    }

    componentDidMount() {
        this.load(this.props.params.PayNameId,this.props.params.id)
    }
    paynames(){
        const { isLoading, week1,week2,week3,week4 ,error,week1Total,week2Total,week3Total,week4Total,week1TotalLate,week2TotalLate,week3TotalLate,week4TotalLate} = this.state
        let name = this.state.userName;
        if (error) return(
            <div className='content-block'>
                <h1>the Pay Name Not Found In this Branch or Term</h1>
            </div>
        )
        if (isLoading) return (<Spinner />)

        return(
            <Row>
                <h2>
                    Teacher {name}
                </h2>
                <Col md={6}>
                    <table className="table">
                        <thead className="table-head">
                        <tr>
                            <td style={{width:'33%'}}>Week 1</td>
                            <td style={{width:'33%',textAlign:"right"}}>{week1Total}</td>
                            <td style={{width:'33%',textAlign:"right",color:'red'}}>{week1TotalLate}</td>
                        </tr>
                        </thead>
                    </table>
                    <Table
                        data={week1}
                        showingProps={['day']}
                        headers={['Day','In','Out','Total Late','Total Hours']}
                        createRow={(rowObj, showingProps) => this.createRow(rowObj, showingProps)}
                    />
                </Col>
                <Col md={6}>
                    <table className="table">
                        <thead className="table-head">
                        <tr>
                            <td style={{width:'33%'}}>Week 2</td>
                            <td style={{width:'33%',textAlign:"right"}}>{week2Total}</td>
                            <td style={{width:'33%',textAlign:"right",color:'red'}}>{week2TotalLate}</td>
                        </tr>
                        </thead>
                    </table>
                    <Table
                        data={week2}
                        showingProps={['day']}
                        headers={['Day','In','Out','Total Late','Total Hours']}
                        createRow={(rowObj, showingProps) => this.createRow(rowObj, showingProps)}
                    />
                </Col>
                <Col md={6}>
                    <table className="table">
                        <thead className=".table-head">
                        <tr>
                            <td style={{width:'33%'}}>Week 3</td>
                            <td style={{width:'33%',textAlign:"right"}}>{week3Total}</td>
                            <td style={{width:'33%',textAlign:"right",color:'red'}}>{week3TotalLate}</td>
                        </tr>
                        </thead>
                    </table>
                    <Table
                        data={week3}
                        showingProps={['day']}
                        headers={['Day','In','Out','Total Late','Total Hours']}
                        createRow={(rowObj, showingProps) => this.createRow(rowObj, showingProps)}
                    />
                </Col>
                <Col md={6}>
                    <table className="table">
                        <thead className=".table-head">
                        <tr>
                            <td style={{width:'33%'}}>Week 4</td>
                            <td style={{width:'33%',textAlign:"right"}}>{week4Total}</td>
                            <td style={{width:'33%',textAlign:"right",color:'red'}}>{week4TotalLate}</td>
                        </tr>
                        </thead>
                    </table>
                    <Table
                        data={week4}
                        showingProps={['day']}
                        headers={['Day','In','Out','Total Late','Total Hours']}
                        createRow={(rowObj, showingProps) => this.createRow(rowObj, showingProps)}
                    />
                </Col>
            </Row>
        )
    }
    createRow(rowObj,showingProps){

        var row = Table.createRowBase(rowObj, showingProps)
        row.push(
            <td key='timeIn'>
                <EditableValueInput
                    value={rowObj.timeIn}
                    onFieldChange={(name,value,id,data) => {
                        if (value == '') value = -1
                        this.onFieldChange(name,value,id,data)
                    }}
                    enableExternalUpdates
                >
                    <input type="time" className='form-control'  name='timeIn' id={rowObj.weekId} data={rowObj.week}/>
                </EditableValueInput>
            </td>
        )
        // row.push(
        //     <td key='lateCount'>
        //         <div style={{width: '75px'}}>
        //             {rowObj.lateCount}
        //         </div>
        //     </td>
        // )
        row.push(
            <td key='timeOut'>
                <EditableValueInput
                    value={rowObj.timeOut}
                    onFieldChange={(name,value,id,data) => {
                        if (value == '') value = -1
                        this.onFieldChange(name,value,id,data)
                    }}
                    enableExternalUpdates
                >
                    <input type="time" className='form-control'  name='timeOut' id={rowObj.weekId} data={rowObj.week}/>
                </EditableValueInput>
            </td>
        )
        row.push(
            <td key='lateTime'>
                <div style={{width: '100px'}}>
                    <p style={{color:'red',fontSize:"12px"}}>
                        {rowObj.weekLate}
                    </p>
                </div>
            </td>
        )
        row.push(
            <td key='totalHours'>
                <div style={{width: '100px'}}>
                    {rowObj.totalHours}
                </div>
            </td>
        )

        return row

    }


    render(){
        const { isLoading, user,payName,error,defaultTimeIn,defaultTimeOut} = this.state
        const { params: { id }, appTypeKey } = this.props
        if (error) return(
            <div className='content-block'>
                <h1>the Pay Name Not Found In this Branch or Term</h1>
            </div>
        )

        return (
            <div>
                <div className='content-block'>
                    <h1 className='block-heading' style={{display:'inline-block'}}>Pay Name : <h1 style={{color:'black'},{display:'inline-block'}}>&nbsp;{payName}</h1></h1>
                    <h3>Default Time In : {defaultTimeIn}</h3>
                    <hr/>
                    <EditableValueInput
                        value={defaultTimeIn}
                        onFieldChange={(name,value,id,data) => {
                            if (value == '') value = -1
                            this.onFieldChange(name,value,id,data)
                        }}
                        enableExternalUpdates
                    >
                        <input type="time" className='form-control'  name='defaultTimeIn' id="defaultTimeIn" data="defaultTimeIn" />
                    </EditableValueInput>
                    <h3>Default Time Out : {defaultTimeOut}</h3>
                    <EditableValueInput
                        value={defaultTimeOut}
                        onFieldChange={(name,value,id,data) => {
                            if (value == '') value = -1
                            this.onFieldChange(name,value,id,data)
                        }}
                        enableExternalUpdates
                    >
                        <input type="time" className='form-control'  name='defaultTimeOut' id="defaultTimeOut" data="defaultTimeOut" />
                    </EditableValueInput>
                    <hr />
                    <div style={{ margin: '0' }}>
                        {this.paynames()}
                    </div>
                </div>
            </div>
        )
    }
}