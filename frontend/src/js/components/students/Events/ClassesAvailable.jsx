import React, { PropTypes, Component } from 'react'
import DataLoader from '../../common/DataLoader.jsx'
import Notifier from '../../../utils/Notifier.js'
import O from '../../../utils/ObjHelper.js'
import ArrH from '../../../utils/ArrayHelper.js'
import S from '../../../utils/StringHelper.js'
import { Button, Tabs, Tab, Accordion, Panel, Row, Col, PanelGroup } from 'react-bootstrap'
import QuickRegisterWindow from '../QuickRegisterWindow.jsx'
import { Html } from '../../common/FormWidgets.jsx'
import Scrollchor from 'react-scrollchor';
import animateScroll from '../../common/animatescroll.js';
import PromiseHelper from '../../../utils/PromiseHelper.js'


class ClassesAvailable extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { isLoading: false, data: {}, tabsActiveKey: 0 }
    }

    parseData(classes) {
        // structures array of classes by this way:
        /**
         * term -> gender -> branches -> depts -> course -> classes
         **/

        let get = O.getIfExists

        let terms = {}
        for (let i in classes) {
            let currClass = classes[i]

            let termName = get(currClass, 'term.name', 'Other')

            // creating term
            if (!terms[termName]) {
                terms[termName] = {}
            }

            let classGender = currClass.classGender

            if (!terms[termName][classGender]) {
                terms[termName][classGender] = {
                    branches: [],
                    partTimeDescription: get(currClass, 'term.partTimeDescription', ''),
                    fullTimeDescription: get(currClass, 'term.fullTimeDescription', '')
                }
            }

            let branches = terms[termName][classGender].branches
            let currBranch = get(currClass, 'course.dept.branchAssociated')
            ArrH.createIfNotExists(branches, currBranch)

            for (let i in branches) {
                if (branches[i].id != currBranch.id) {
                    continue
                }

                if (!branches[i].depts) {
                    branches[i].depts = { fullTime: [], partTime: [] }
                }

                let currCourseType = get(currClass, 'course.isFullTime', '0') == '1' ?
                    'fullTime' : 'partTime'

                let depts = branches[i].depts[currCourseType]

                let currDept = get(currClass, 'course.dept', {
                    id: 0,
                    deptName: 'Other',
                    weight: '-1'
                })

                ArrH.createIfNotExists(depts, currDept)

                for (let j in depts) {
                    if (depts[j].id != currDept.id) {
                        continue
                    }

                    if (!depts[j].courses) {
                        depts[j].courses = []
                    }

                    let courses = depts[j].courses
                    let currCourse = get(currClass, 'course')

                    for (let prop in currCourse) {
                        if (typeof currCourse[prop] === 'object') {
                            delete currCourse[prop]
                        }
                    }

                    ArrH.createIfNotExists(courses, currCourse)

                    for (let k in courses) {
                        if (courses[k].id != currCourse.id) {
                            continue
                        }

                        if (!courses[k].classes) {
                            courses[k].classes = []
                        }

                        let classes = courses[k].classes

                        for (let prop in currClass) {
                            if (typeof currClass[prop] === 'object') {
                                delete currClass[prop]
                            }
                        }

                        ArrH.createIfNotExists(classes, currClass)
                    }
                }
            }
        }

        return terms
    }

    sortItemsByWeight(data) {
        const weightSort = (weightPropName, a, b) => {
            const weightA = parseInt(a[weightPropName])
            const weightB = parseInt(b[weightPropName])

            if (weightA > weightB) return 1
            return -1
        }

        for (let termName in data) {
            for (let gender in data[termName]) {
                let branches = data[termName][gender].branches
                branches.sort((a, b) => weightSort('branchWeight', a, b))

                for (const i in branches) {
                    let deptsGroups = branches[i].depts
                    for (let coursesType in deptsGroups) {
                        let depts = deptsGroups[coursesType]
                        depts.sort((a, b) => weightSort('weight', a, b))

                        for (const j in depts) {
                            let courses = depts[j].courses
                            courses.sort((a, b) => weightSort('weight', a, b))

                            for (let k in courses) {
                                let classes = courses[k].classes
                                classes.sort((a, b) => weightSort('classWeight', a, b))
                            }
                        }
                    }
                }
            }
        }

        return data
    }

    loadClasses(context) {
        this.setState({ isLoading: true })

        if (!context) {
            context = this.context
        }

        const { user } = context
        const { execute } = this.props

        execute('loadClasses', { userId: O.getIfExists(user, 'id', ''), allClasses: true },
            data => {
                this.setState({ isLoading: false, data: this.sortItemsByWeight(this.parseData(data)) })
            },
            xhr => {
                Notifier.error('Error loading available classes')
                this.setState({ isLoading: false })
            }
        )
    }

    componentWillMount() {
        this.loadClasses()
    }

    componentWillReceiveProps(nextProps, nextContext) {
        const { user } = this.context
        if (JSON.stringify(user) !== JSON.stringify(nextContext.user)) {
            this.loadClasses(nextContext)
        }
    }

    renderBranchesView(data) {
        let notEmptyGenderCourses = false
        let drawGenderTabs = false
        let genderWithNotEmptyCourses = null
        for (let gender in data) {
            if (data[gender].branches.length > 0) {
                if (!notEmptyGenderCourses) {
                    notEmptyGenderCourses = true
                    genderWithNotEmptyCourses = gender
                } else {
                    drawGenderTabs = true
                    break
                }
            }
        }
        // console.log(data[genderWithNotEmptyCourses].branches)
        return drawGenderTabs ?
            <GenderedBranchesView termData={data} /> :
            <BranchesView
                gender={genderWithNotEmptyCourses}
                branches={data[genderWithNotEmptyCourses].branches}
                term={data}
            />
    }

    renderTabs() {
        const { data } = this.state
        let tabs = []
        let i = 0
        for (let termName in data) {
            tabs.push(
                <Tab key={i} eventKey={i} title={termName}>
                    {this.renderBranchesView(data[termName])}
                </Tab>
            )
            i++
        }

        return tabs
    }

    render() {
        const { isLoading, data, tabsActiveKey } = this.state
        const terms = Object.keys(data)

        if (isLoading) {
            return <p>Loading...</p>
        }

        if (terms.length === 0) {
            return <h1>No classes available yet</h1>
        }

        if (terms.length === 1) {
            return this.renderBranchesView(data[terms[0]])
        }

        return (
            <Tabs
                activeKey={tabsActiveKey}
                onSelect={key => this.setState({ tabsActiveKey: key })}
            >
                {this.renderTabs()}
            </Tabs>
        )
    }
}

ClassesAvailable.contextTypes = {
    user: PropTypes.object
}

export default DataLoader(ClassesAvailable, {
    loadClasses: { type: 'get', url: '/api/classes/available' }
})

class GenderedBranchesView extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { tabActiveKey: 'male' }
    }

    renderTabs() {
        const { termData } = this.props
        let tabs = []

        for (let gender in termData) {
            if (termData[gender].branches.length > 0) {
                tabs.push(
                    <Tab
                        key={gender}
                        eventKey={gender}
                        title={gender}

                        id={`${gender}-courses-tab`}
                        className={`${gender}-courses-tab`}
                    >
                        <BranchesView gender={gender} branches={termData[gender].branches} term={termData} />
                    </Tab>
                )
            }
        }

        return tabs
    }

    render() {
        const { tabActiveKey } = this.state
        return (
            <Tabs
                activeKey={tabActiveKey}
                onSelect={key => this.setState({ tabActiveKey: key })}
                id='tabnav'
            >
                {this.renderTabs()}
            </Tabs>
        )
    }
}

GenderedBranchesView.propTypes = {
    termData: PropTypes.object.isRequired
}

class BranchesView extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { expandedDept: null }
        this.onSelect = this.onSelect.bind(this)
    }

    onSelect(key, e) {
        if (this.state.expandedDept == key) {
            key = null
        }

        this.setState({ expandedDept: key })

        if (e) {
            e.preventDefault()
        }

        return false
    }

    scrollToSelected() {
        let { hash } = window.location
        if (hash && hash.length > 0)  {
            hash = hash.slice(1)
        }

        const { branches } = this.props

        for (const branch of branches) {
            if (!branch) continue
            for (const groupType in branch.depts) {
                const depts = branch.depts[groupType]
                for (const dept of depts) {
                    if (!dept) continue
                    for (const course of dept.courses) {
                        if (course.id == hash) {
                            this.setState({ expandedDept: dept.id }, () => {
                                animateScroll(hash)
                            })
                            return
                        }
                    }
                }
            }
        }
    }

    componentDidMount() {
        this.scrollToSelected()
    }
    setHtml(text){
        return {__html: text};
    }
    renderDepts(gender, branch, term) {
        const { expandedDept } = this.state
        const content = []
        for (let groupType in branch.depts) {

            const depts = branch.depts[groupType]

            if (depts.length === 0) {
                continue
            }
            const description = groupType == 'fullTime' ?
                term[gender].fullTimeDescription : term[gender].partTimeDescription
                content.push(
                <div key={groupType}>
                    

                    <center><h3 className='term-description' dangerouslySetInnerHTML={this.setHtml(description)}></h3></center>

                    
                        <div>
                            {depts.map(
                                (dept, i) => (
                                    <CoursesView gender={gender} courses={dept.courses} />
                                )
                            )}
                        </div>
                    </div>
                )
        }
        return <div>{content}</div>
    }

    render() {
        const { gender, branches, term } = this.props
        const description = branches[0].depts.fullTime.length > 0 ?
            term[gender].fullTimeDescription : term[gender].partTimeDescription
        return (
            <div>

                {branches.map(
                    (branch, i) => (
                        <div key={i}>
                            {this.renderDepts(gender, branch, term)}
                        </div>
                    )
                )}
            </div>
        )
    }
}

BranchesView.propTypes = {
    gender: PropTypes.string.isRequired,
    branches: PropTypes.array.isRequired,
    term: PropTypes.object.isRequired
}

class CoursesView extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { selectedCourse: null }
        this.registerOnline = this.registerOnline.bind(this)
    }

    registerOnline(e, course) {
        e.preventDefault()

        const { router, user } = this.context
        let classId = e.target.id
        let studentStatus = 'unemployed'
        if (!user) {
            let registeredClasses = localStorage.getItem('registeredClasses')
            if (registeredClasses == null) {
                registeredClasses = []
            } else {
                registeredClasses = JSON.parse(registeredClasses)
            }

            registeredClasses.push({ classId: classId, studentStatus: studentStatus })

            localStorage.setItem('registeredClasses', JSON.stringify(registeredClasses))

            router.push('/login')

            return
        }
        PromiseHelper.ajax({
            type : "post",
            url : "/api/cart/add",
            data : {
                classId : classId,
                studentStatus : studentStatus
            }
        }).then(
            data=>{
                Notifier.success('Class added to cart')
                router.push('/cart')
            },
            xhr=>{
                Notifier.error(xhr.responseText.replace(/"/g, ''))
                console.error(xhr)
            }
        )
    }

    handleAnchor(e, id) {
        e.preventDefault()
        animateScroll(id)
    }


render() {
        const { showRegisterWindow, selectedCourse } = this.state
        const { courses, gender } = this.props
        const { website } = this.context

        return (
            <div>
                {courses.map(
                    (course, i) => (
                        <div key={i}><p
                                className='available-classes course-label'
                                id={course.id}
                            >
                                <h3>{course.courseTitle}</h3>
                            </p>
                            

                            <Row style={{ marginBottom: '10px' }}>
 

                               
                                        {course.classes.map(
                                            (courseClass, i) => (
                   <Col lg={2}>
                   
                                  
                   <div className={course.id == '216' ? 'btn btn-sq-lg btn-success' : 'btn btn-sq-lg btn-warning'}  style={{width:'100%', height:'210px',padding:'0' }} key={i}>
                                    <h3
                                        key={i}
                                        className='course-timing-label'
                                    ></h3>

                                        <span style={{width:'100px',height:'50px'}}>
                                            <img id="icon_co" src="http://icons.iconarchive.com/icons/iconsmind/outline/96/Cow-icon.png"/><br/>
                                            {courseClass.classTime}<br/>�{courseClass.feeForEmployed}
                                        </span>
<br/>
                                    <button
                                        className="button-reg"
                                        id={courseClass.id}
                                        onClick={e => this.registerOnline(e, course)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        Purchase
                                    </button>
                               </div> </Col>
                                            )
                                        )}




                                 
                            </Row>

                        </div>
                    )
                )}

                {showRegisterWindow ?
                    <QuickRegisterWindow
                        onClose={() => this.setState({ showRegisterWindow: false })}
                        course={selectedCourse}
                    /> : ''
                }
            </div>
        )
    }

}

CoursesView.contextTypes = {
    user: PropTypes.object,
    router: PropTypes.object.isRequired,
    website: PropTypes.object.isRequired
}