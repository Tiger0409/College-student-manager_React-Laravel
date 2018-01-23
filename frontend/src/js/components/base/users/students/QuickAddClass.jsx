import React, { PropTypes, Component } from 'react'
import { FormField } from '../../../common/FormWidgets.jsx'
import DataLoader from '../../../common/DataLoader.jsx'
import { Button, Row, Col } from 'react-bootstrap'
import O from '../../../../utils/ObjHelper.js'
import Notifier from '../../../../utils/Notifier.js'
import ConfirmDialog from '../../../common/ConfirmDialog.jsx'
import Spinner from '../../../common/Spinner.jsx'

class QuickAddClass extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { classes: [], isLoading: false, showAddClass: false, toCart: false }
        this.load = this.load.bind(this)
        this.addClass = this.addClass.bind(this)
        this.removeClass = this.removeClass.bind(this)
        this.requestFields = [
            'id',
            'course.courseTitle',
            'classTime',
            'term.name',
            'courseClassRegistrationOpen',
            'classGender',
            'classWeight',
            'course.weight',
            'course.dept.weight',
            'course.dept.id',
            'course.dept.branchAssociated.branchName'
        ]
    }

    componentDidMount() {
        //this.load({ limit: 40 })
    }

    sortClasses(classes) {
        const get = O.getIfExists

        return classes.sort((classA, classB) => {
            const courseDeptWeightA = parseInt(get(classA, 'course.dept.weight', 0))
            const courseDeptWeightB = parseInt(get(classB, 'course.dept.weight', 0))

            if (courseDeptWeightA < courseDeptWeightB) {
                return -1
            } else if (courseDeptWeightA > courseDeptWeightB) {
                return 1
            }

            const courseWeightA = parseInt(get(classA, 'course.weight', 0))
            const courseWeightB = parseInt(get(classB, 'course.weight', 0))

            if (courseWeightA < courseWeightB) {
                return -1
            } else if (courseWeightA > courseWeightB) {
                return 1
            }

            const weightA = parseInt(classA.classWeight)
            const weightB = parseInt(classB.classWeight)
            if (weightA < weightB) {
                return -1
            } else if (weightA > weightB) {
                return 1
            }

            return 0
        })
    }

    load(filters) {
        this.setState({ isLoading: true })
        const { execute, id } = this.props

        let newFilters = Object.assign({}, filters)
        Object.assign(newFilters , { targetUser: id })

        execute('loadClasses', { filters: newFilters , fields: this.requestFields }, classes => {
            const sortedClasses = this.sortClasses(classes.rows)
            this.setState({ classes: sortedClasses, isLoading: false })
        })
    }

    removeClass(id) {
        var { classes } = this.state

        for (let i = 0; i < classes.length; i++) {
            if (classes[i].id == id) {
                classes.splice(i, 1)
                break
            }
        }

        this.setState({ classes: classes })
    }

    addClass() {
        const { classId, toCart } = this.state
        const { execute, id: studentId } = this.props
        const { router } = this.context

        const action = toCart ? 'addClassToCart' : 'addClass'

        execute(action, { studentId: studentId, classId: classId, studentStatus: 'employed' },
            newStudent => {
                Notifier.success('Class added successfully')
                if (toCart && this.props.onBasketUpdate) {
                    this.props.onBasketUpdate()
                } else {
                    router.push(`/students/${newStudent.id}`)
                }
                this.removeClass(classId)
            },
            () => Notifier.error('Error adding class')
        )
    }

    render() {
        const { classes, isLoading, showAddClass } = this.state

        return (
            <div>
                <FilterForm onSubmit={this.load} />

                <ClassesTable
                    classes={classes}
                    isLoading={isLoading}
                    onAdd={(classId, toCart) => this.setState({ showAddClass: true, classId: classId, toCart: toCart })}
                />

                <ConfirmDialog
                    headerText='Class registration'
                    confirmText='Are you sure?'
                    onYes={() => { this.addClass(); this.setState({ showAddClass: false }) }}
                    onNo={() => this.setState({ showAddClass: false })}
                    show={showAddClass}
                />
            </div>
        )
    }
}

QuickAddClass.propTypes = {
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
}

QuickAddClass.contextTypes = {
    router: PropTypes.object.isRequired
}

export default DataLoader(QuickAddClass, {
    loadClasses: { type: 'get', url: '/api/classes' },
    addClassToCart: { type: 'post', url: '/api/cart/add' },
    addClass: { type: 'post', url: '/api/students' },
})

const FilterForm = (() => {
    class InnerComponent extends Component {
        constructor(props, context) {
            super(props, context)
            this.state = {
                termOptions: [],
                courseOptions: [],
                filters: { term: null, course: null, regIsOpen: '', limit: 100, branchId: this.context.branchId }
            }

            this.submit = this.submit.bind(this)
            this.onChange = this.onChange.bind(this)
        }

        componentDidMount() {
            this.load()
        }

        componentWillReceiveProps(nextProps, nextContext) {
            if (this.context.branchId !== nextContext.branchId) {
                this.loadCourses(nextProps, nextContext)
                let { filters } = this.state
                filters.branchId = nextContext.branchId
                this.setState({ filters: filters }, this.submit)
            }
        }

        loadCourses(props, context) {
            const { branchId } = context ? context : this.context
            const { execute } = props ? props : this.props

            execute('loadCourseOptions', { branchId: branchId }, data => {
                let { filters } = this.state
                this.setState({ courseOptions: data, filters: filters })
            })
        }

        load() {
            const { execute } = this.props

            execute('loadTermOptions', null, data => {
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

                var { filters } = this.state
                filters.term = selectedTerm
                this.setState({ termOptions: data, filters: filters })
                this.submit(null, filters)
            })

            this.loadCourses()
        }

        submit(e, filters) {
            if (e) {
                e.preventDefault()
            }

            if (typeof filters !== 'object') {
                filters = this.state.filters
            }

            this.props.onSubmit(filters)
        }

        onChange(e) {
            const { name, value } = e.target
            var { filters } = this.state
            filters[name] = value
            this.setState({ filters: filters })
        }

        renderFormItem(name, label, options) {
            const { filters } = this.state

            if (!options || options.length === 0) {
                return ''
            }

            return (
                <FormField width={5} label={label}>
                    <select
                        className='form-control'
                        value={filters[name]}
                        name={name}
                        onChange={this.onChange}
                    >
                        {
                            options.map(option =>
                                <option
                                    key={option.value != '' ? option.value : '-1'}
                                    value={option.value}
                                >
                                    {option.label}
                                </option>
                            )
                        }
                    </select>
                </FormField>
            )
        }

        render() {
            let { termOptions, filters, courseOptions } = this.state

            if (courseOptions && courseOptions.length === 0) {
                return <p>No classes for this branch</p>
            }

            courseOptions.unshift({ value: '', label: 'All courses' })

            return (
                <div style={{ marginBottom: '10px' }}>
                    <h3>Class filter</h3>

                    <form onSubmit={this.submit}>
                        <Row>
                            {this.renderFormItem('course', 'Course', courseOptions)}

                            {this.renderFormItem('term', 'Term', termOptions)}

                            <FormField width={5} label='Registration is open?'>
                                <select
                                    name='regIsOpen'
                                    value={filters.regIsOpen}
                                    onChange={this.onChange}
                                    className='form-control'
                                >
                                    <option value=''>Any status</option>
                                    <option value='yes'>Yes</option>
                                    <option value='no'>No</option>
                                </select>
                            </FormField>
                            <Col md={5}>
                                <Button className='custom btn-success' style={{ marginTop: window.innerWidth < 768 ? 0 : 24 }} type='submit'>Filter</Button>
                            </Col>
                        </Row>
                    </form>
                </div>
            )
        }
    }

    InnerComponent.contextTypes = {
        branchId: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    }

    return DataLoader(InnerComponent, {
        loadTermOptions: { type: 'get', url: '/api/terms/list' },
        loadCourseOptions: { type: 'get', url: '/api/courses/list' }
    })
})()

class ClassesTable extends Component {
    renderRows() {
        const { classes, onAdd } = this.props
        const get = O.accessObjByPath

        return classes.map((classItem, i) => {
            let regStatus = classItem.courseClassRegistrationOpen === 'yes' ?
                <span style={{ color: '#00FF00' }}>open</span> :
                <span style={{ color: '#FF0000' }}>closed</span>

            return (
                <tr key={i}>
                    <td>{get(classItem, 'course.courseTitle')}</td>
                    <td><span>{classItem.classTime} (</span>{regStatus}<span>)</span></td>
                    <td>{get(classItem, 'term.name')}</td>
                    <td>{classItem.classGender}</td>
                    <td>{get(classItem, 'course.dept.branchAssociated.branchName')}</td>
                    <td><Button onClick={() => onAdd(classItem.id, false)}>Register</Button></td>
                    <td><Button onClick={() => onAdd(classItem.id, true)}>ADD TO CART</Button></td>
                </tr>
            )
        })
    }

    render() {
        const { classes, isLoading } = this.props

        if (isLoading) {
            return <Spinner />
        }

        if (!classes || classes.length === 0) {
            return false
        }

        return (
            <div className='table-responsive'>
                <table className='table table-striped results-table' style={{ minWidth: 1024 }}>
                    <thead>
                        <tr>
                            <th>Course Title</th>
                            <th>Time</th>
                            <th>Term</th>
                            <th>Gender</th>
                            <th>Branch</th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.renderRows()}
                    </tbody>
                </table>
            </div>
        )
    }
}