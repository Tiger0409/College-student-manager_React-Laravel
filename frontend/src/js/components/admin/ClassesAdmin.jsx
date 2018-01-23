import React, { Component, PropTypes } from 'react'
import CourseHeaderAdmin from './CourseHeaderAdmin.jsx'
import { Row, Col, Tabs, Tab, Panel, Button } from 'react-bootstrap'
import FormGroup from './../common/FormGroup.jsx'
import SourceSelect from './../common/SourceSelect.jsx'
import PromiseHelper from './../../utils/PromiseHelper.js'
import Paginator from './../common/Paginator.jsx'
import ClassExams from '../base/courseClasses/ClassExams.jsx'
import { Link } from 'react-router'
import { LinkContainer } from 'react-router-bootstrap'
import TermView from '../common/TermView.jsx'
import Groups from '../common/Groups.jsx'
import DataLoader from '../common/DataLoader.jsx'
import Notifier from '../../utils/Notifier.js'
import ConfirmDeleteWnd from '../common/ConfirmDeleteWnd'
import Oh from '../../utils/ObjHelper.js'
import flow from 'lodash.flow'
import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { DRAG_ITEM_TYPES } from '../../config/constants.js'
import Spinner from '../common/Spinner.jsx'

const clone = (obj, additionalProps) => {
    let cloned = Object.assign({}, obj)
    if (additionalProps && typeof additionalProps === 'object') {
        Object.assign(cloned, additionalProps)
    }
    return cloned
}

const classSource = {
    beginDrag(props) {
        return {
            id: props.id,
            weight: props.weight,
            courseId: props.courseId,
            onDrop: props.onDrop
        }
    }
}

const classTarget = {
    drop(props, monitor) {
        let sourceClass = monitor.getItem()

        const { id: targetId } = props
        const courseId = sourceClass.id
        if (targetId != courseId) {
            sourceClass.onDrop(sourceClass, props)
        }
    },

    canDrop(props, monitor) {
        let sourceClass = monitor.getItem()
        return sourceClass.courseId == props.courseId
    }
}

function collectTarget(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
    }
}

function collectSource(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging()
    }
}

class ClassesAdmin extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { filters: {} }
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (this.context.branchId != nextContext.branchId) {
            var { filters } = this.state
            filters['courseSelect'] = null
            this.setState({ filters: filters })
        }
    }

    render() {

        return (
            <div>
                <CourseHeaderAdmin selectedTab='/classes' />

                <div id="notifications"></div>

                <div className="content-block">
                    <h2 className='block-heading'>All Classes</h2>
                    <hr/>

                    <ClassFilters
                        params={this.props.params}
                        onSubmit={
                            filters => {
                                this.setState({ filters: filters })
                            }
                        }
                    />
                </div>

                <div className='content-block'>
                    <h2 className='block-heading'>Class List</h2>
                    <hr/>
                    <ClassList filters={this.state.filters} />
                </div>

                <div className='content-block'>
                    <h2 className='block-heading'>Class Groups</h2>
                    <hr/>
                    <ClassGroups />
                </div>
            </div>
        )
    }
}

ClassesAdmin.contextTypes = {
    branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
}

export default DragDropContext(HTML5Backend)(ClassesAdmin)

let classFilterstyles = {
    filterButton: {}
}

if (window.innerWidth < 768) {
    classFilterstyles =  {
        filterButton: { width: '100%' }
    }
}

const ClassFilters = (() => {
    const ComponentClass = class extends Component {
        constructor(props, context) {
            super(props, context)

            const courseId = Oh.getIfExists(props, 'params.courseId', 'All')

            this.state = {
                filters: {
                    courseSelect: courseId,
                    classTime: '',
                    termId: props.data.id
                }
            }

            this.submit = this.submit.bind(this)
        }

        componentWillReceiveProps(nextProps) {
            const currCourseId = Oh.getIfExists(this.props, 'params.courseId', 'All')
            const newCourseId = Oh.getIfExists(nextProps, 'params.courseId', 'All')
            if (currCourseId != newCourseId) {
                let { filters } = this.state
                filters.courseSelect = newCourseId
                this.setState({ filters: filters })
                this.props.onSubmit(filters)
            }
        }

        componentDidMount() {
            this.submit()
        }

        render() {
            const { branchId } = this.context

            return (
                <div>
                    <h4>Filters</h4>

                    <form id='ClassFilterForm' onSubmit={this.submit}>
                        <Row>
                            <Col md={5}>
                                <FormGroup>
                                    <label htmlFor='courseSelect'>Course</label>
                                    <SourceSelect
                                        url='/api/courses/list'
                                        params={{ branchId: branchId }}
                                        className='form-control'
                                        name='courseSelect'
                                        id='courseSelect'
                                        value={this.state.filters.courseSelect}
                                        onChange={e => this.handleFieldChange(e)}>
                                        <option value='All'>All Courses</option>
                                    </SourceSelect>
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={5}>
                                <FormGroup>
                                    <label htmlFor="classTime">Class Time</label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        id="classTime"
                                        name="classTime"
                                        value={this.state.filters.classTime}
                                        onChange={e => this.handleFieldChange(e)}/>
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={5}>
                                <FormGroup>
                                    <label htmlFor='termId'>Term Name</label>
                                    <SourceSelect
                                        url='/api/terms/list'
                                        className='form-control'
                                        name='termId'
                                        id='termId'
                                        value={this.state.filters.termId}
                                        onChange={e => this.handleFieldChange(e)}>
                                        <option value='All'>All terms</option>
                                    </SourceSelect>
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={2}>
                                <FormGroup>
                                    <Button className='custom' bsStyle='success' type='submit' style={classFilterstyles.filterButton}>Filter</Button>
                                </FormGroup>
                            </Col>
                        </Row>
                    </form>
                </div>
            )
        }

        submit(e) {
            if (e) {
                e.preventDefault()
            }

            this.props.onSubmit(this.state.filters)
        }

        handleFieldChange(e, type = null) {
            type = type ? type : e.target.type

            var filters = this.state.filters
            var filterName = e.target.name
            switch (type) {
                case 'text':
                case 'select-one':
                case 'radio':
                    filters[filterName] = e.target.value
                    break
            }

            this.setState({ filters: filters })
        }
    }

    ComponentClass.contextTypes = {
        branchId: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    }

    return DataLoader(ComponentClass, {
        load: { type: 'get', url: '/api/terms/active' }
    })
})()

class ClassList extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            isLoading: false,
            selectedTab: 0,
            rows: null,
            totalCount: 0
        }
        this.rowsPerPage = 100
        this.page = 1
        this.loadPromise = null
        this.deleteData = this.deleteData.bind(this)
    }

    render() {
        const { termId } = this.props.filters

        var header = (
            <div>
                <TermView id={termId} />
            </div>
        )
        const { isLoading, rows } = this.state
        if (isLoading) return (
            <div>
                {header}
                <div><Spinner /></div>
            </div>
        )

        const addButton = (
            <LinkContainer to={{pathname: '/classes/add'}}>
                <Button
                    bsStyle='success'>
                    Add class
                </Button>
            </LinkContainer>
        )

        return (
            <div>
                {header}
                {this.renderRows()}
            </div>
        )
    }

    componentDidMount() {
        this.loadData(this.props, this.context)
    }

    componentWillUnmount() {
        if (this.loadPromise)
            this.loadPromise.cancel()
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.loadData(nextProps, nextContext)
    }

    loadData(props, context) {
        if (!context) {
            context = this.context
        }

        this.setState({isLoading: true})

        if (this.loadPromise)
            this.loadPromise.cancel()

        var filters = props.filters
        Object.assign(filters, {
            branchId: context.branchId
        })

        var requestParams = {
            rowsPerPage: filters.termId == 'All' ? this.rowsPerPage : null,
            page: this.page,
            filters: filters,
        }
        this.loadPromise = PromiseHelper.ajax({
            type: 'get',
            url: '/api/classes/grouped-list',
            data: requestParams
        })
        this.loadPromise.promise.then(
            data => {
                this.setState({isLoading: false, rows: data.rows, totalCount: data.info.totalCount})
            },
            xhr => { this.setState({isLoading: false}); console.log(xhr) }
        )
    }

    deleteData(ids, reason) {
        $.ajax({
            type: 'delete',
            url: '/api/classes',
            data: { ids: ids, reason: reason },
            success: response => {
                Notifier.success('Deleted successfully')
                console.log(response)
            },
            error: xhr => {
                Notifier.error(xhr.responseText.replace(/"/g, ''))
                console.log(xhr)
            }
        })
    }

    renderRows() {
        const { rows, selectedTab } = this.state
        var genderedRows = {both: [], male: [], female: []}
        rows && rows.forEach(row => {
            for (let currGender in genderedRows) {
                if (currGender == row.gender) {
                    genderedRows[currGender].push(row)
                }
            }
        })

        const { filters } = this.props

        return (
            <div>
                <Tabs className='content-tabs' activeKey={selectedTab} onSelect={key => {this.setState({selectedTab: key})}}>
                    <Tab eventKey={0} title={'Both (' + genderedRows.both.length + ')'}>
                        <ClassesTable filters={filters} rows={genderedRows.both} onDelete={this.deleteData}/>
                    </Tab>
                    <Tab eventKey={1} title={'Male (' + genderedRows.male.length + ')'}>
                        <ClassesTable filters={filters} rows={genderedRows.male} onDelete={this.deleteData}/>
                    </Tab>
                    <Tab eventKey={2} title={'Female (' + genderedRows.female.length + ')'}>
                        <ClassesTable filters={filters} rows={genderedRows.female} onDelete={this.deleteData}/>
                    </Tab>
                </Tabs>
                {this.showPaginator()}
            </div>
        )
    }

    showPaginator() {
        if (this.props.filters.termId != 'All') return false

        return (
            <Paginator
                totalCount={this.state.totalCount}
                rowsPerPage={this.rowsPerPage}
                currentPage={this.page}
                onPageChange={pageNum => {
                    this.page = pageNum
                    this.setState({isLoading: true})
                    this.loadData(this.props, this.context)
                }}
            />
        )
    }
}

ClassList.propTypes = {
    filters: PropTypes.object.isRequired
}

ClassList.contextTypes = {
    branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
}

let classesTableStyles = {
    tableButton: { marginLeft: 5 },
    buttonWrapper: { marginLeft: -5, marginRight: -5 },
    buttonAdd: { marginTop: '30px', float: 'right' }
}

if (window.innerWidth < 992) {
    classesTableStyles = { 
        tableButton: { width: 'calc(50% - 10px)', marginLeft: 5, marginRight: 5, marginBottom: 10 },
        buttonWrapper: { marginLeft: -5, marginRight: -5 },
        buttonAdd: { marginTop: 20 }
    }
}

if (window.innerWidth < 768) {
    classesTableStyles = { 
        tableButton: { width: '100%', marginBottom: 10 },
        buttonAdd: { marginTop: 20, width: '100%' }
    }
}

class ClassesTable extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {checkedIds: [], ids: [], rowGroups: {}, rowGroupsKeys: [], showConfrimDelete: false }
        this.goToClassAttendance = this.goToClassAttendance.bind(this)
        this.swapClasses = this.swapClasses.bind(this)
        this.toggleReg = this.toggleReg.bind(this)
        this.goToClassAttendance = this.goToClassAttendance.bind(this)
        this.onClassCheck = this.onClassCheck.bind(this)
        this.storeIdsForPtint = this.storeIdsForPtint.bind(this)
    }

    storeIdsForPtint() {
        localStorage.setItem('printableClassIds', this.props.rows.map(row => row.id))
    }

    componentWillMount() {
        this.init()
    }

    init() {
        var ids = []
        var rowGroups = {}
        const { rows } = this.props
        rows.forEach(row => {
            if (parseInt(row.maleStudents) + parseInt(row.femaleStudents) === 0) {
                ids.push(row.id)
            }

            let groupName = row.classGroupName !== null ? row.classGroupName : 'Other'
            if (rowGroups.hasOwnProperty(groupName)) {
                rowGroups[groupName].classes.push(row)
            } else {
                rowGroups[groupName] = {
                    classes: [row],
                    id: row.classGroupId,
                    name: groupName,
                    weight: row.classGroupWeight,
                    isExpanded: false
                }
            }
        })

        /*for (let groupName in rowGroups) {
            rowGroups[groupName].classes = this.sortClasses(rowGroups[groupName].classes)
        }*/

        this.setState({ids: ids, rowGroups: rowGroups, rowGroupsKeys: this.sortRowGroups(rowGroups)})
    }

    render() {
        const { rowGroups, ids, checkedIds, rowGroupsKeys, showConfirmDelete } = this.state
        const { filters } = this.props
        let classesBlock = ''

        if (!rowGroups || Object.keys(rowGroups).length == 0)
            classesBlock = null
        else {
            classesBlock = (
                <div>
                    <div style={{ overflow: 'auto' }}>
                        <div className='table-head' style={{ display: 'flex', justifyContent: 'center', minHeight: '58px', minWidth: 992 }}>
                            <div style={{ display: 'flex', justifyContent: 'center', width: '30px', paddingLeft: 10 }}>
                                <input
                                    style={{ alignSelf: 'center' }}
                                    type="checkbox"
                                    checked={ids.length == checkedIds.length}
                                    onChange={() => this.onSelectAll()}
                                />
                            </div>

                            <div style={{ width: '3%' }}></div>

                            <div style={{ display: 'inline-block', width: '25%', alignSelf: 'center' }}>Time</div>
                            <div style={{ display: 'inline-block', width: '20%', alignSelf: 'center' }}>Course</div>
                            <div style={{ display: 'inline-block', width: '15%', alignSelf: 'center' }}>Branch</div>
                            <div style={{ display: 'inline-block', width: '10%', alignSelf: 'center', textAlign: 'center' }}>Reg Open?</div>
                            <div style={{ width: '26%' }}></div>
                        </div>

                        <div style={{ minWidth: 992 }}>
                            {rowGroupsKeys.length > 1 ?
                                this.renderGroups() : this.renderClasses(rowGroups[rowGroupsKeys[0]].classes)
                            }
                        </div>
                    </div>

                    <ConfirmDeleteWnd
                        show={showConfirmDelete}
                        onConfirm={reason => (this.delete(checkedIds, reason))}
                        onClose={() => this.setState({ showConfirmDelete: false })}
                    />
                </div>
            )
        }

        return (
            <div>
                <div>
                    {classesBlock ? classesBlock : 'No classes'}
                </div>

                <div style={{ minHeight: '70px' }}>
                    <div style={{ marginTop: '30px' }}>
                        {classesBlock ?
                            <Button
                                className='custom'
                                style={classesTableStyles.tableButton}
                                onClick={() => this.setState({ showConfirmDelete: true }) }>
                                Delete selected
                            </Button>
                            : false
                        }

                        <div className={classesTableStyles.buttonWrapper}>
                            <Link
                                className='custom btn btn-default'
                                style={classesTableStyles.tableButton}
                                to={'/classes/print/weekend-registers'}
                                target='_blank'
                                onClick={this.storeIdsForPtint}
                            >
                                Weekend registers
                            </Link>

                            <Link
                                className='custom btn btn-default'
                                style={classesTableStyles.tableButton}
                                to={'/classes/print/weekday-registers'}
                                target='_blank'
                                onClick={this.storeIdsForPtint}
                            >
                                Weekday registers
                            </Link>

                            <Link
                                className='custom btn btn-default'
                                style={classesTableStyles.tableButton}
                                to={'/classes/print/adults'}
                                target='_blank'
                                onClick={this.storeIdsForPtint}
                            >
                                Adults
                            </Link>

                            <Link
                                className='custom btn btn-default'
                                style={classesTableStyles.tableButton}
                                to={`/classes/print/${filters.termId}/certificates-all`}
                                target='_blank'
                                onClick={this.storeIdsForPtint}
                            >
                                Print All classes Certificate
                            </Link>
                        </div>
                    </div>

                    <Button
                        className='custom'
                        bsStyle='success'
                        style={classesTableStyles.buttonAdd}
                        onClick={() => {
                            const courseId = this.props.filters.courseSelect
                            if (courseId && courseId != 'All') {
                                localStorage.setItem('targetCourseId', courseId)
                            }
                            this.context.router.push('/classes/add')
                        }}
                    >
                        Add
                    </Button>
                </div>

                {classesBlock ?
                    <ClassExams label='Exams (tick selected classes)' classesIds={checkedIds} />
                    : ''
                }
            </div>
        )
    }

    sortRowGroups(rowGroups) {
        var sortedKeys = Object.keys(rowGroups).sort((groupKeyA, groupKeyB) => {
            let weightA = parseInt(rowGroups[groupKeyA].weight)
            let weightB = parseInt(rowGroups[groupKeyB].weight)
            if (weightA > weightB) return -1
            if (weightA < weightB) return 1
            return 0
        })
        return sortedKeys
    }

    renderGroups() {
        var { rowGroups, rowGroupsKeys } = this.state
        var buttonColor = 'white'

        return rowGroupsKeys.map(groupKey => {
            let group = rowGroups[groupKey]
            let { isExpanded, name } = group
            return (
                <div key={group.name}>
                    <Button
                        style={{
                            textAlign: 'left',
                            paddingLeft: '2%',
                            backgroundColor: buttonColor
                        }}
                        onClick={() => {
                            rowGroups[name].isExpanded = !isExpanded
                            this.setState({rowGroups: rowGroups})
                        }}
                        vertical
                        block
                    >
                        {name}
                    </Button>
                    <Panel style={{marginBottom: '0px'}} collapsible expanded={isExpanded}>
                        {this.renderClasses(group.classes)}
                    </Panel>
                </div>
            )
        })
    }

    goToClassAttendance(e, id) {
        e.preventDefault()
        this.context.router.push({
            pathname: `/classes/${id}/students`,
            query: { tab: 'Attendance records' }
        })
    }

    sortClasses(classes) {
        return classes.sort((classA, classB) => {
            const courseWeightA = parseInt(classA.weight)
            const courseWeightB = parseInt(classB.weight)

            if (courseWeightA < courseWeightB) {
                return -1
            } else if (courseWeightA > courseWeightB) {
                return 1
            }

            if (classA.courseTitle < classB.courseTitle) {
                return -1
            } else if (classA.courseTitle > classB.courseTitle) {
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

    toggleReg(classId, classRegOpen) {
        let newClassRegOpen = classRegOpen == 'yes' ? 'no' : 'yes';

        let classFound = false
        let { rowGroups } = this.state
        for (let groupName in rowGroups) {
            if (classFound) break

            let { classes } = rowGroups[groupName]
            for (let i = 0; i < classes.length; i++) {
                if (classes[i].id == classId) {
                    classes[i].regOpen = newClassRegOpen
                    classFound = true
                    break
                }
            }
        }

        this.setState({ rowGroups: rowGroups })

        $.ajax({
            type: 'put',
            url: `/api/classes/${classId}`,
            data: { courseClassRegistrationOpen: newClassRegOpen },
            error: xhr => console.log(xhr)
        })
    }

    swapClasses(sourceClass, targetClass) {
        if (!sourceClass || !targetClass) return

        console.log(sourceClass, targetClass)

        let { rowGroups } = this.state
        let { weight: weightA } = sourceClass
        let { weight: weightB } = targetClass
        let weightsSwapped = false

        for (let groupName in rowGroups) {
            let { classes } = rowGroups[groupName]
            for (let i = 0; i < classes.length; i++) {
                if (weightA == weightB == null) {
                    weightsSwapped = true
                    break
                }

                if (classes[i].id == sourceClass.id) {
                    classes[i].classWeight = weightB
                    weightB = null
                    continue
                }

                if (classes[i].id == targetClass.id) {
                    classes[i].classeight = weightA
                    weightA = null
                    continue
                }
            }

            if (weightsSwapped) break
        }

        for (let groupName in rowGroups) {
            rowGroups[groupName].classes = this.sortClasses(rowGroups[groupName].classes)
        }

        this.setState({ rowGroups: rowGroups })

        $.ajax({
            type: 'put',
            url: '/api/classes/swap',
            data: { sourceClass: sourceClass, targetClass: targetClass },
            error: xhr => { Notifier.error('Error swapping classes'), console.error(xhr) }
        })
    }

    renderClasses(rows) {
        var { checkedIds } = this.state

        return rows.map((row, index) => {
            const { id, maleStudents, femaleStudents } = row
            const disabled = (parseInt(maleStudents) + parseInt(femaleStudents)) > 0
            const checked = checkedIds.indexOf(id) !== -1
            const baseTextStyle = { display: 'inline-block', textAlign: 'left', verticalAlign: 'middle' }

            return (
                <ClassView
                    key={id}
                    isOdd={index % 2 === 0}
                    {...row}
                    textStyle={baseTextStyle}
                    checked={checked}
                    disabled={disabled}
                    onDrop={this.swapClasses}
                    toggleReg={this.toggleReg}
                    goToClassAttendance={this.goToClassAttendance}
                    onClassCheck={this.onClassCheck}
                />
            )
        })
    }

    onClassCheck(id, isChecked) {
        var checkedIds = this.state.checkedIds
        const idIndex = checkedIds.indexOf(id)
        const rowIdExists = idIndex !== -1
        if (!rowIdExists && isChecked)
            checkedIds.push(id)
        if (rowIdExists && !isChecked)
            checkedIds.splice(idIndex, 1)
        this.setState({checkedIds: checkedIds})
    }

    onSelectAll() {
        var checkedIds = this.state.checkedIds
        const ids = this.state.ids
        if (checkedIds.length < ids.length)
            checkedIds = ids.slice()
        else
            checkedIds = []

        this.setState({checkedIds: checkedIds})
    }

    delete(selectedIds, reason) {
        var { rowGroups } = this.state
        var ids = selectedIds.slice()

        for (let groupKey in rowGroups) {
            rowGroups[groupKey].classes = rowGroups[groupKey].classes.filter(
                (classElem => {
                    let studentsCount = parseInt(classElem.maleStudents) + parseInt(classElem.femaleStudents)

                    for (let i = 0; i < ids.length; i++) {
                        if (classElem.id == ids[i] && studentsCount === 0)
                            return false
                    }
                    return true
                })
            )
        }

        this.setState({ rowGroups: rowGroups, showConfirmDelete: false })

        if (this.props.onDelete)
            this.props.onDelete(selectedIds, reason)
    }
}
ClassesTable.propTypes = {
    rows: PropTypes.array.isRequired,
    onDelete: PropTypes.func.isRequired
}

ClassesTable.contextTypes = {
    router: PropTypes.object.isRequired
}

const ClassGroups = () => {
    return (
        <div>
            <Groups
                ajaxOperations={{
                    load: {type: 'get', url: '/api/classes/groups'},
                    save: {type: 'put', url: '/api/classes/groups'}
                }}
            />
        </div>
    )
}

const ClassView = flow(
    DragSource(DRAG_ITEM_TYPES.CLASS, classSource, collectSource),
    DropTarget(DRAG_ITEM_TYPES.CLASS, classTarget, collectTarget)
)(
    ({
        id,
        isOdd,
        disabled,
        classTime,
        courseTitle,
        branch,
        regOpen,
        maleStudents,
        femaleStudents,
        textStyle,
        checked,
        isDragging,
        isOver,
        canDrop,
        connectDragPreview,
        connectDropTarget,
        connectDragSource,
        toggleReg,
        goToClassAttendance,
        onClassCheck
    }) => {

        const lineStyle = { alignSelf: 'middle', width: '8px' }

        return connectDragPreview(
            connectDropTarget(
                <div
                    style={{
                        minHeight: '58px',
                        display: 'flex',
                        justifyContent: 'center',
                        opacity: isDragging ? '0.5' : '1' ,
                        backgroundColor: isOver ? (canDrop ? '#7CE27C' : '#F5A6A6') : isOdd ? '#ededed' : ''
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'center', width: '30px', paddinLeft: 10 }}>
                        <input
                            style={{ alignSelf: 'center' }}
                            type="checkbox"
                            disabled={disabled}
                            onChange={e => onClassCheck(id, e.target.checked)}
                            checked={checked}
                        />
                    </div>

                    <div
                        style={{
                            display: 'inline-block',
                            width: '3%',
                            cursor: 'move',
                            textAlign: 'center',
                            alignSelf: 'center'
                        }}
                    >
                        {connectDragSource(<img src={"src/images/move_icon2.png"} alt="" width='20px' />)}
                    </div>

                    <div style={clone(textStyle, { width: '25%', alignSelf: 'center' })}>
                        {classTime} (Male:{maleStudents} Female:{femaleStudents})
                    </div>

                    <div style={clone(textStyle, { width: '20%', alignSelf: 'center' })}>
                        {courseTitle}
                    </div>

                    <div style={clone(textStyle, { width: '15%', alignSelf: 'center' })}>
                        {branch}
                    </div>

                    <div style={clone(textStyle, { width: '10%', alignSelf: 'center', display: 'flex', justifyContent: 'center' })}>
                        <Button
                            onClick={() => toggleReg(id, regOpen)}
                            style={{ width: '70px', alignSelf: 'center', textTransform: 'uppercase' }}
                            bsStyle={regOpen == 'yes' ? 'success' : 'danger'}
                        >
                            {regOpen}
                        </Button>
                    </div>

                    <div
                        style={{
                            width: '26%',
                            textAlign: 'center',
                            display: 'flex',
                            justifyContent: 'center'
                        }}
                    >
                        <p style={{ margin: '10px' }}>
                            <Link to={'/classes/' + id} style={{ verticalAlign: 'middle' }}>Detail</Link>
                            <span style={lineStyle}> | </span>
                            <Link
                                to={`/classes/${id}/students/`}
                                target='_blank'
                                style={{ verticalAlign: 'middle' }}
                            >
                                Results
                            </Link>
                            <span style={lineStyle}> | </span>
                            <Link
                                to={`/classes/${id}/students?tab=Attendance+records`}
                                target='_blank'
                                style={{ cursor: 'pointer', verticalAlign: 'middle' }}
                            >
                                Attendance
                            </Link>
                            <span style={lineStyle}> | </span>
                            <Link to={`/classes/${id}/print/weekend-registers`} target='_blank'>Weekend Registers</Link>
                            <span style={lineStyle}> | </span>
                            <Link to={`/classes/${id}/print/weekday-registers`} target='_blank'>Weekday</Link>
                            <span style={lineStyle}> | </span>
                            <Link to={`/classes/${id}/print/adults`} target='_blank'>Adults</Link> 
                            <span style={lineStyle}> | </span>
                            <Link to={`/classes/${id}/print/address-labels`} target='_blank'>Address</Link> 
                            <span style={lineStyle}> | </span>
                            <Link to={`/classes/${id}/print/phone-numbers`} target='_blank'>Telephone</Link> 
                        </p>
                    </div>
                </div>
            )
        )
    }
)