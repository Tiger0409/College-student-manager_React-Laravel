import React, { PropTypes, Component } from 'react'
import PromiseHelper from '../../../utils/PromiseHelper.js'
import DataLoader from '../../common/DataLoader.jsx'
import O from '../../../utils/ObjHelper.js'
import Table from '../../common/Table.jsx'
import { Link } from 'react-router'
import Sh from '../../../utils/StringHelper.js'
import {Accordion,Panel,Col,Row,Button} from 'react-bootstrap'
import { FormField, EditableHTML, EditableValue, EditableValueInput, EditableValueInlineBlock, RadioInputs } from '../../common/FormWidgets.jsx'
import Notifier from '../../../utils/Notifier.js'
import PaymentForm from '../../common/PaymentForm.jsx'
import { browserHistory } from 'react-router'



class MyCourses extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            termToStudents: {}
        }
    }
    onFieldChange(name,value) {
        this.changeField(name,value)
    }
    parseData(data) {
        let termToStudents = {}
        for (let i in data) {
            const student = data[i]
            const termName = O.getIfExists(student, 'courseClass.term.name', 'Other')

            if (!termToStudents[termName]) {
                termToStudents[termName] = []
            }

            termToStudents[termName].push(student)
        }

        this.setState({ termToStudents: termToStudents })
    }

    componentWillMount() {
        this.parseData(this.props.data.rows)
    }

    renderClasses() {
        const { termToStudents } = this.state

        let classesTables = []
        for (let term in termToStudents) {
            const students = termToStudents[term]
            classesTables.push(
                <ClassesTable key={term} title={term} data={students} />
            )
        }


        return (
            <div>
                {classesTables}
            </div>
        )
    }
    render() {
        return (
            <div>
                <h2>All Course Registration</h2>
                {this.renderClasses()}
            </div>
        )
    }

}

export default DataLoader(MyCourses, {
    load: {
        type: 'get',
        url: '/api/classes/my',
        data: {
            fields: [
                'registerDate',
                'regStatus',
                'studentStatus',
                'reducedAmount',
                'totalAmount',
                'score',
                'feedback',
                'studentAbsent',
                'course.courseTitle',
                'course.feeForEmployed',
                'course.feeForUnemployed',
                'course.courseTitle',
                'courseClass.exams',
                'courseClass.classWorks',
                'courseClass.classDescription',
                'courseClass.feeForEmployed',
                'courseClass.feeForUnemployed',
                'courseClass.term.name',
                'courseClass.classTime',
                'courseClass.teacher.userFullname',
                'payments'
            ]
        }
    }
})
const setHtml = function(text){
    return {__html: text};
}
const ClassesTable = ({ data, title,key }) => {
    const get = O.getIfExists
    const classView = (studentData,id) => {
        let rowData = []
        let contentData =[]
        let contentTitle =[]
        let contentTeacher =[]
        let contentClassDescription =[]
        let contentAttendance =[]
        let i = 0
        const push = (content, style) => rowData.push(
            <Col md={style} sm={style} xs={style} className="colTable" style={{lineHeight:'44px'}} key={i++}>
                <p>{content}</p>
            </Col>
        )
        const pushAmount = (amount,id,paid,price)=>rowData.push(
            <Col md={5} sm={8} xs={12} className="colTablePayment">
                <span style={{color: 'black',fontWeight: 'normal',fontSize:'11pt',marginRight: '5px'}}>&pound; {paid} Paid, Remaining &pound;</span>
                <EditableValueInlineBlock
                    style={{display:"inline-block"}}
                    value={price}
                    onFieldChange={(name,value) => {
                        if (value == '') value = -1
                        localStorage.setItem(`pay-${id}`,value)
                    }}
                    enableExternalUpdates
                >
                    <input type="number" min={0} className='form-control'  name={id} />
                </EditableValueInlineBlock>
                <div style={{display:'inline-block'}}>
                    <a
                        style={{color:'#337ab7',cursor:"pointer"}}
                        onClick={e=>{
                            e.preventDefault();
                            let amount = localStorage.getItem('pay-'+id)
                            browserHistory.push(`/pay-student/${amount}/${id}`)
                        }}
                    >
                        Pay Online
                    </a>
                </div>
            </Col>
        )
        const pushContentAttendance = (content, img) => contentAttendance.push(
            <Col md={3} sm={3} xs={3} className="colTable" style={{height:'100px'}}>
                <span dangerouslySetInnerHTML={setHtml(img)}></span>
                <p>{content}</p>
            </Col>
        )
        const pushContent = (content,style)=>contentData.push(
            <span> {content}</span>
        )
        const pushContentTitle = (title,score,comment)=>contentTitle.push(
            <span> {title} {score} {comment}</span>
        )
        const pushContentTeracher = (content,style)=>contentTeacher.push(
            <span> {content}</span>
        )
        const pushContentClassDescription = (content,style)=>contentClassDescription.push(
            <span dangerouslySetInnerHTML={setHtml(content)}></span>
        )
        push(studentData.registerDate, 3)
        // push(get(studentData, 'course.courseTitle', 'none'), { width: '25%' })
        push(get(studentData, 'courseClass.classTime', 'none'), 2)
        // push(studentData.regStatus, { wi dth: '5%' })
        push(get(studentData, 'courseClass.teacher.userFullname', 'none'),2)
        pushContentTeracher(get(studentData, 'courseClass.teacher.userFullname', 'none', { width: '20%' }))
        let fee = 0
        switch (get(studentData, 'studentStatus', 'unemployed')) {
            case 'employed':
            case 'unemployed':
                let prop = 'feeFor' + Sh.ucFirst(get(studentData, 'studentStatus', 'unemployed'))
                fee = parseFloat(parseFloat(studentData.courseClass[prop]) >= 0 ?
                    studentData.courseClass[prop] : studentData.course[prop]).toFixed(2)
                break

            case 'reduced':
                fee = parseFloat(studentData.reducedAmount).toFixed(2)
                break
        }

        let totalAmount = studentData.totalAmount ?
            parseFloat(studentData.totalAmount).toFixed(2) : 0.00
        if (studentData.payments.length > 0){
            let row = studentData.payments
            let Total = 0;
            for (var j = 0 ; j < row.length ; j++){
                Total+=row[j].amount
            }
            let payAmount = parseInt(studentData.payments[0].courseStudentId);
            fee = parseInt(fee) - Total
            localStorage.setItem(`pay-${payAmount}`,fee)
            pushAmount(0,`${studentData.payments[0].courseStudentId}`,`${Total}`,`${fee}`)
        }
        pushContent(get(studentData,'score',''),{color:'black'})
        pushContent(get(studentData,'feedback',''),{color:'black'})
        if (studentData.courseClass.exams.length > 0){
            let row = studentData.courseClass.exams;
            for(var j = 0;j<row.length;j++){
                pushContentTitle(get(row[j],'title','No Title'),get(row[j].scores[0],'score','')+'%',get(row[j].scores[0],'comment',''))
            }
        }else{
            pushContentTitle('','','')
        }
        pushContentClassDescription(get(studentData.courseClass,'classDescription',''),{color:'black'})
        if (studentData.studentAbsent){
            if (studentData.studentAbsent.length > 0 && studentData.courseClass.classWorks.length > 0){
                let row = studentData.studentAbsent;
                let index = 0;
                for(var j = 0;j<row.length;j++){
                    if (row[j].attendance=='present'){
                        if (!studentData.courseClass.classWorks[j]){
                            continue;
                        }else{
                            if ((i+2)%2==0){
                                pushContentAttendance(get(studentData.studentAbsent[j],'date',''),'<img src="src/images/check.gif" width="60" height="45"/>')
                                pushContentAttendance(get(studentData.courseClass.classWorks[j],'done_work',''),'')
                                pushContentAttendance(get(studentData.courseClass.classWorks[j],'home_work',''),'')
                                pushContentAttendance(get(studentData.studentAbsent[j],'comment',''),'')
                            }else{
                                pushContentAttendance(get(studentData.studentAbsent[j],'date',''),'<img src="src/images/check.gif" width="60" height="45"/>')
                                pushContentAttendance(get(studentData.courseClass.classWorks[j],'done_work',''),'')
                                pushContentAttendance(get(studentData.courseClass.classWorks[j],'home_work',''),'')
                                pushContentAttendance(get(studentData.studentAbsent[j],'comment',''),'')
                            }

                        }
                    }else{
                        pushContentAttendance(get(studentData.studentAbsent[j],'date',''),'<img src="src/images/cross.gif" width="60" height="55"/>')
                        pushContentAttendance(get(studentData.courseClass.classWorks[j],'done_work',''),'')
                        pushContentAttendance(get(studentData.courseClass.classWorks[j],'home_work',''),'')
                        pushContentAttendance(get(studentData.studentAbsent[j],'comment',''),'')
                    }
                }
            }
        }

        id++;
        return (
            <Panel eventKey={id} header={studentData.course.courseTitle[0]}>
                <Row className="headingTableText">
                    {rowData}
                </Row>
                <Col lg={12} md={12} sm={12} xs={12} className="bodyPart">
                    <Row>
                        <Col md={12}>
                            <h3>{contentClassDescription}</h3>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            <p>Final Exam: {contentData}</p>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            {
                                contentTitle.map(
                                    title => <p>{title}</p>
                                )
                            }
                        </Col>
                    </Row>
                    <Row>
                        <Col md={3} sm={3} xs={3}>
                            <h4 className="headingText">Attendance</h4>
                        </Col>
                        <Col md={3} sm={3} xs={3}>
                            <h4 className="workDone headingText">Work Done</h4>
                        </Col>
                        <Col md={3} sm={3} xs={3}>
                            <h4 className="headingText">Homework</h4>
                        </Col>
                        <Col md={3} sm={3} xs={3}>
                            <h4 className="headingText">Notes</h4>
                        </Col>
                        {contentAttendance}
                    </Row>
                </Col>
            </Panel>
        )
    }
    var arr = [];
    for(var i=0;i<data.length;i++){
        arr.push(classView(data[i],i))
    }
    return (
        <div>
            <Accordion>
                <Panel eventKey={key} header={title}>
                    {/*<Row>*/}
                    {/*<Col md={2}>*/}
                    {/*<p>Registration Time</p>*/}
                    {/*</Col>*/}
                    {/*<Col md={2}>*/}
                    {/*<p>Course Title</p>*/}
                    {/*</Col>*/}
                    {/*<Col md={2}>*/}
                    {/*<p>Class Time</p>*/}
                    {/*</Col>*/}
                    {/*<Col md={2}>*/}
                    {/*<p>Status</p>*/}
                    {/*</Col>*/}
                    {/*<Col md={2}>*/}
                    {/*<p>Teacher Name</p>*/}
                    {/*</Col>*/}
                    {/*<Col md={2}>*/}
                    {/*<p>Total Fee</p>*/}
                    {/*</Col>*/}
                    {/*</Row>*/}
                    <Accordion>
                        {arr}
                    </Accordion>
                </Panel>
            </Accordion>
        </div>
    )
}