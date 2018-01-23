import React, { PropTypes } from 'react'
import CourseHeaderAdmin from './CourseHeaderAdmin.jsx'
import FormGroup from './../common/FormGroup.jsx'
import SourceSelect from './../common/SourceSelect.jsx'
import GroupedCourses from './../common/courses/GroupedCourses.jsx'
import Groups from './../common/Groups.jsx'
import { Button, Row, Col, Tabs, Tab } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import PromiseHelper from './../../utils/PromiseHelper.js'
import { Link } from 'react-router'
import ObjHelper from './../../utils/ObjHelper.js'
import Notifier from '../../utils/Notifier.js'
import Spinner from '../common/Spinner.jsx'

let styles = {}

if (window.innerWidth < 768) {
    styles = {
        deptFilterButton: { width: '100%' }
    }
}

export default class CoursesAdmin extends React.Component {
    constructor(props, context) {
        super(props, context)
        const { params } = this.props
        this.state = { dept: params ? params.deptId : null }
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (this.context.branchId != nextContext.branchId) {
            this.setState({ dept: null })
        }
    }

    render() {
        return (
            <div>
                <CourseHeaderAdmin />

                <div id="notifications"></div>

                <div className='content-block'>
                    <h2 className='block-heading'>Course List</h2>
                    <hr/>

                    <DeptFilter onSubmit={dept => this.setState({ dept: dept })} />
                    <CourseList dept={this.state.dept} />
                </div>

                <div className='content-block'>
                    <h2 className='block-heading'>Course Groups</h2>
                    <hr/>
                    <CourseGroups />
                </div>
            </div>
        )
    }
}

CoursesAdmin.propTypes = {
    params: PropTypes.object
}

CoursesAdmin.contextTypes = {
    branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
}

class DeptFilter extends React.Component {
    constructor(props, context) {
        super(props, context)
        this.state = { dept: '' }
        this.submit = this.submit.bind(this)
    }

    render() {
        const { branchId } = this.context

        return (
            <div>
                <h4>Filter</h4>
                <form id='DeptFilterForm' onSubmit={this.submit}>
                    <Row>
                        <Col md={5}>
                            <FormGroup>
                                <label htmlFor='dept'>Dept</label>
                                <SourceSelect
                                    url='/api/depts/list'
                                    className='form-control'
                                    name='dept'
                                    id='dept'
                                    value={this.state.dept}
                                    onChange={e => this.setState({dept: e.target.value})}
                                    optionPredicate={option => {
                                        return !branchId || option.branchId == branchId
                                    }}
                                >
                                    <option value='All'>All Depts</option>
                                </SourceSelect>
                            </FormGroup>
                            <FormGroup>
                                <Button className='custom btn-success' type='submit' style={styles.deptFilterButton}>Filter</Button>
                            </FormGroup>
                        </Col>
                    </Row>
                </form>
            </div>
        )
    }

    submit(e) {
        e.preventDefault()
        if (this.props.onSubmit)
            this.props.onSubmit(this.state.dept)
    }
}

DeptFilter.contextTypes = {
    branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

class CourseList extends React.Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            isLoading: false,
            selectedTab: 1,
            data: null
        }
        this.loadPromise = null
        this.delete = this.delete.bind(this)
        this.replaceCourse = this.replaceCourse.bind(this)
        this.swapCourses = this.swapCourses.bind(this)
    }

    render() {
        if (this.state.isLoading) return (
            <div>
                <Spinner />
            </div>
        )

        var sorted = this.sortData()
        const { dept } = this.props

        return (
            <Tabs
                className='content-tabs'
                activeKey={this.state.selectedTab}
                onSelect={key => this.setState({selectedTab: key})}
            >
                <Tab eventKey={1} title='Class'>
                    <GroupedCourses
                        deptId={dept}
                        data={sorted.withClasses}
                        onDelete={this.delete}
                        onCourseReplace={this.replaceCourse}
                        onCoursesSwap={this.swapCourses}
                        onGroupsSwap={this.swapGroups}
                    />
                </Tab>

                <Tab eventKey={2} title='No Class'>
                    <GroupedCourses
                        deptId={dept}
                        data={sorted.withoutClasses}
                        onDelete={this.delete}
                        onCourseReplace={this.replaceCourse}
                        onCoursesSwap={this.swapCourses}
                        onGroupsSwap={this.swapGroups}
                    />
                </Tab>
            </Tabs>
        )
    }

    sortData() {
        var sorted = {withClasses: {}, withoutClasses: {}}

        var groups = this.state.data
        for (let group in groups) {
            let courses = groups[group].courses
            for (let i = 0; i < courses.length; i++) {
                var courseObj = {id: groups[group].id, courses: [], weight: groups[group].weight}
                if (courses[i].classes.length > 0) {
                    if (!sorted.withClasses[group])
                        sorted.withClasses[group] = courseObj
                    sorted.withClasses[group].courses.push(courses[i])
                } else {
                    if (!sorted.withoutClasses[group])
                        sorted.withoutClasses[group] = courseObj
                    sorted.withoutClasses[group].courses.push(courses[i])
                }
            }
        }

        return sorted
    }

    loadData(props, context) {
        const { branchId } = context
        this.setState({ isLoading: true })

        if (this.loadPromise)
            this.loadPromise.cancel()

        this.loadPromise = PromiseHelper.makeCancelableAjax(
            $.ajax({
                type: 'get',
                url: '/api/courses/grouped-list',
                data: { deptId: props.dept, branchId : branchId }
            })
        )
        this.loadPromise.promise.then(
            data => { this.setState({ isLoading: false, data: data }) },
            xhr => { this.setState({ isLoading: false }); console.log(xhr) }
        )
    }

    delete(ids, reason) {
        if (!ids || ids.length === 0) return

        $.ajax({
            type: 'delete',
            url: '/api/courses',
            data: { ids: ids, reason: reason },
            success: () => {
                Notifier.success('Deleted successfully')
                var data = this.state.data
                if (data) {
                    for (let group in data) {
                        data[group].courses = data[group].courses.filter(course => ids.indexOf(parseInt(course.id)) === -1)
                    }
                }

                this.setState({ data: data })
                if (this.props.onUpdate) this.props.onUpdate()
            },
            error: xhr => {
                Notifier.error(xhr.responseText.replace(/"/g, ''))
                console.log(xhr)
            }
        })
    }

    replaceCourse(course, targetGroupId) {
        $.ajax({
            type: 'put',
            url: '/api/courses/' + course.id,
            data: { courseGroupId: targetGroupId },
            error: xhr => console.log(xhr)
        })
    }

    swapCourses(courseA, courseB) {
        $.ajax({
            type: 'put',
            url: '/api/courses/swap',
            data: { courseA: courseA, courseB: courseB },
            error: xhr => console.log(xhr)
        })
    }

    swapGroups(groupA, groupB) {
        $.ajax({
            type: 'put',
            url: '/api/courses/groups/swap',
            data: { groupA: groupA, groupB: groupB },
            error: xhr => console.log(xhr)
        })
    }

    componentDidMount() {
        this.loadData(this.props, this.context)
    }

    componentWillUnmount() {
        this.loadPromise.cancel()
    }

    componentWillReceiveProps(newProps, newContext) {
        this.loadData(newProps, newContext)
    }
}

CourseList.contextTypes = {
    branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
}

const CourseGroups = () => {
    return (
        <div>
            <Groups
                ajaxOperations={{
                    load: {type: 'get', url: '/api/courses/groups'},
                    save: {type: 'put', url: '/api/courses/groups'}
                }}
            />
        </div>
    )
}