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
			let currClass = classes[i],
				termName = get(currClass, 'term.name', 'Other'),
				classGender = currClass.classGender,
				currBranch = get(currClass, 'course.dept.branchAssociated'),
				currCourseType = get(currClass, 'course.isFullTime', '0') == '1' ? 'fullTime' : 'partTime',
				currDept = get(currClass, 'course.dept', {
					id: 0,
					deptName: 'Other',
					weight: '-1'
				}),
				currCourse = get(currClass, 'course');
			// creating term
			if (!terms[termName]) {
				terms[termName] = {
					branches: [],
					partTimeDescription: get(currClass, 'term.partTimeDescription', ''),
					fullTimeDescription: get(currClass, 'term.fullTimeDescription', '')
				}
			}

			let branches = terms[termName]['branches'];

			if (!branches[currBranch.id]) {
				branches[currBranch.id] = currBranch;
				branches[currBranch.id].depts = {fullTime: [], partTime: []};
			}

			let depts = branches[currBranch.id].depts;

			if (!depts[currCourseType][currDept.id]) {
				depts[currCourseType][currDept.id] = currDept;
				depts[currCourseType][currDept.id].courses = [];
			}

			let courses = depts[currCourseType][currDept.id].courses;
			
			if(!courses[currCourse.id]){
				courses[currCourse.id] = currCourse;
				courses[currCourse.id]['classes'] = [];
			}
			
			for (let prop in currClass) {
				if (typeof currClass[prop] === 'object') {
					delete currClass[prop]
				}
			}
			
			courses[currCourse.id]['classes'][currClass.id] = currClass;
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
			let branches = data[termName].branches;
			branches.sort((a, b) => weightSort('branchWeight', a, b));
	
			for (const i in branches) {
				let deptsGroups = branches[i].depts;
				for (let coursesType in deptsGroups) {
					let depts = deptsGroups[coursesType];
					depts.sort((a, b) => weightSort('weight', a, b));
			
					for (const j in depts) {
						let courses = depts[j].courses;
						courses.sort((a, b) => weightSort('weight', a, b));
				
						for (let k in courses) {
							let classes = courses[k].classes;
							classes.sort((a, b) => weightSort('classWeight', a, b));
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

        execute('loadClasses', { userId: O.getIfExists(user, 'id', '') },
            data => {
                this.setState({ isLoading: false, data: this.sortItemsByWeight(this.parseData(data)) });
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

        return <BranchesView
            gender='male'
            branches={data.branches}
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
		
        const { branches } = this.props;
		for (const branch of branches) {
            if (!branch) continue
			for (const groupType in branch.depts) {
                const depts = branch.depts[groupType]
				for (const dept of depts) {
                    if (!dept) continue
                    for (const course of dept.courses) {
                        if (typeof course == 'object' && course.id == hash) {
                            this.setState({ expandedDept: dept.id }, () => {
                                animateScroll(hash)
                            });
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
                term.fullTimeDescription : term.partTimeDescription;
            content.push(
                <div key={groupType}>
                    <p className='available-classes label'>
                        <b></b> courses
                    </p>

                    <p className='term-description' dangerouslySetInnerHTML={this.setHtml(description)}></p>

                    <div>
                        {depts.map(
                            (dept, i) => (
                                <Panel
                                    key={i}
                                    eventKey={dept.id}
                                    header={dept.deptName}
                                    collapsible
                                    expanded={expandedDept == dept.id}
                                    onSelect={(e, t) => this.onSelect(dept.id, e)}
                                    style={{ marginBottom: '0px' }}
                                >
                                    <CoursesView gender={gender} courses={dept.courses} />
                                </Panel>
                            )
                        )}
                    </div>
                </div>
            )
        }

        return <div>{content}</div>
    }

    render() {
        const { gender, branches, term } = this.props;

        return (
            <div>
                {branches.map(
                    (branch, i) => (
                        <div key={i}>
                            <h1 className={`available-classes header branch-${gender}`}>
                                <b>All courses </b>
                                {`registration & full info (${branch.branchName})`}
                            </h1>

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
        this.state = { showRegisterWindow: false, selectedCourse: null, selectedGender: null }
        this.registerOnline = this.registerOnline.bind(this)
    }

    registerOnline(e, course, gender) {
        e.preventDefault()

        const { router } = this.context
		this.setState({ showRegisterWindow: true, selectedCourse: course, selectedGender: gender })
    }

    handleAnchor(e, id) {
        e.preventDefault()
		animateScroll(id)
    }
    
    render() {
        const { showRegisterWindow, selectedCourse, selectedGender } = this.state
        const { courses, gender } = this.props;
        const { website } = this.context
        
		for (let i in courses) {
			let course = courses[i];
			let genderSplit = [];
			for (let j in course.classes) {
				const gender = course.classes[j].classGender;
			
				if (!genderSplit[gender]) {
					genderSplit[gender] = [];
					genderSplit[gender].classes = [];
					genderSplit[gender].label = ((gender) => {
						if (gender == 'both') return 'FOR BOTH';
						return gender == 'male' ? 'FOR MALE' : 'FOR FEMALE';
					})(gender);
					
				}
				genderSplit[gender].classes.push(course.classes[j]);
			}
			courses[i].genderSplit = genderSplit;
		}
		
		return (
            <div>
                {courses.map(
                    (course, i) => (
                        <div key={i} id={course.id} className='course-container'>
							<a
								href={`${window.location.pathname}#${course.id}`}
								onClick={(e) => this.handleAnchor(e, course.id)}
								className='available-classes course-label'
								id={course.id}
							>{course.courseTitle}</a>
                            <Row style={{ marginBottom: '10px' }}>
                                <Col md={6}>
                                    <div
                                        className='course-description'
                                        dangerouslySetInnerHTML={{__html: course.courseDescription}}
                                    >
                                    </div>

                                    <div className='button-sec'>
                                        <ul>
                                            <li>Fees</li>
                                            <li className={`${gender}`}>
                                                {`${website.paymentField1} £${course.feeForEmployed} / ${website.paymentField2} £${course.feeForUnemployed}`}
						
                                            </li>
                                        </ul>

                                        <div className='social-media-icon' style={{ display: 'none' }}>
                                            <a href="https://www.facebook.com/TayyibunUK/"><img src="/src/images/facebook-icon.png" /></a>
                                        </div>

                                        <div className='social-media-icon' style={{ display: 'none' }}>
                                            <a href="https://twitter.com/Tayyibun"><img src="/src/images/twitter-icon.png" /></a>
                                        </div>
                                    </div>

                                    <div className="donload-link" style={{ display: 'none' }} >
                                        <a href={course.courseSubtitle}>
                                            <img
                                                width="18"
                                                height="18"
                                                alt="letter-paper"
                                                src="/src/images/letter-paper.png"
                                                className="alignnone size-full wp-image-160"
                                            />
                                            Download Course Handbook
                                        </a>
                                    </div>
                                </Col>

                                <Col md={6}>
                                    <div>
                                        {course.classes.map(
                                            (courseClass, i) => (
                                                <div key={i} style={{marginBottom: '0px'}}>
                                                    <Html>{course.courseStructure}</Html>
                                                </div>
                                            )
                                        )}

                                        <div style={course.isFullTime == '1' ? { display: 'none' } : {}} >
                                            <p className='course-timing-label'>
                                                You may choose to study on one of the following days for the full duration of the full
                                                course.
                                            </p>

											<div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
												{Object.keys(course.genderSplit).map((gend, i) => (
													<div className="gender-split" style={{ position: 'relative', height: '200px', flexBasis: '220px', marginBottom: '20px'}}>
														<p className={`${gend}-bgr gend-title`}>{course.genderSplit[gend].label}</p>
														{course.genderSplit[gend].classes.map(
															(courseClass, j) => (
																<p key={j} className='course-timing-label'>
																	{j > 0 ? 'or' : ''} {courseClass.classTime}
																</p>
															)
														)}
														
														<div className="split"></div>
														
														<div className="register-btn">
															<ul>
																<li
																	className="golden-btn"
																	style={course.isFullTime == '1' ? { display: 'none' } : {}}
																>
																	<a
																		type='button'
																		className="reg_online"
																		onClick={e => this.registerOnline(e, course, gend)}
																		style={{ cursor: 'pointer' }}
																	>
																		<img
																			width="9"
																			height="19"
																			alt="mouse"
																			src="/src/images/mouse.png"
																			className="alignnone size-full wp-image-162"
																		/>
																		REGISTER ONLINE NOW
																	</a>
																</li>
															</ul>
															<a href="pages/Institute/register.html">REGISTER IN PERSON</a>
															
														
														</div>
													</div>
												))}
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                        </div>
                    )
                )}
				{showRegisterWindow ?
					<QuickRegisterWindow
                        onClose={() => this.setState({ showRegisterWindow: false })}
                        course={selectedCourse}
						gender={selectedGender}
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