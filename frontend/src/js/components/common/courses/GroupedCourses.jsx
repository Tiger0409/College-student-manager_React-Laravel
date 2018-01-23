import React, { PropTypes } from 'react'
import { Button } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import ObjHelper from './../../../utils/ObjHelper.js'
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import GroupTable from './GroupTable.jsx'
import GroupTableRows from './GroupTableRows.jsx'
import ConfirmDeleteWnd from '../../common/ConfirmDeleteWnd.jsx'
import { ROLES } from '../../../config/constants'

let styles = {
    checkboxColumn: { alignSelf: 'center', display: 'flex', justifyContent: 'center', width: '12%', paddingLeft: '6%' },
    titleColumn: { alignSelf: 'center', width: '43%' },
    addButton: { marginLeft: '15px', marginTop: '30px', marginBottom: 10 },
    deleteButton: { marginTop: '30px', marginBottom: 10 }
}

if (window.innerWidth < 992) {
    styles = Object.assign({}, styles, {
        checkboxColumn: { alignSelf: 'center', display: 'flex', justifyContent: 'center', width: '5%', paddingLeft: 10 },
        titleColumn: { alignSelf: 'center', width: '50%' }
    })
}

if (window.innerWidth < 768) {
    styles = Object.assign({}, styles, {
        addButton: { marginTop: 10, marginBottom: 10, width: '100%' },
        deleteButton: { marginTop: '30px', marginBottom: 10, width: '100%' }
    })
}

class GroupedCourses extends React.Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            rowIds: [],
            groupTablesInfo: {},
            selectedAll: false,
            selectAllEventValue: null,
            data: {},
            sortedGroups: [],
            showConfirmDelete: false
        }
        this.add = this.add.bind(this)
        this.onCkeckedRowsChange = this.onCkeckedRowsChange.bind(this)
        this.handleSelectAllCheckBox = this.handleSelectAllCheckBox.bind(this)
        this.deleteChecked = this.deleteChecked.bind(this)
        this.onCoursesSwap = this.onCoursesSwap.bind(this)
    }

    add() {
        const { router } = this.context
        const { deptId } = this.props

        if (deptId) {
            router.push('/courses/dept/' + deptId + '/add')
        } else {
            router.push('/courses/add')
        }
    }

    render() {
        const { sortedGroups, showConfirmDelete } = this.state

        if (!this.props.data || Object.keys(this.props.data).length == 0)
            return (
                <div>
                    <p>No data.</p>
                    <Button
                        bsStyle='success'
                        style={{marginLeft: '15px', marginTop: '30px'}}
                        onClick={this.add}
                    >
                        Add
                    </Button>
                </div>
            )

        const role = ObjHelper.getIfExists(this, 'context.user.role.roleName', 'None')
        const admins = [ROLES.ADMIN, ROLES.SUPER_ADMIN]

        return (
            <div>
                <div style={{ overflow: 'auto' }}>
                    <div className='table-head' style={{ height: '50px', display: 'flex', justifyContent: 'flex-start', minWidth: 992 }}>
                        <div style={styles.checkboxColumn}>
                            <input
                                style={{ alignSelf: 'center' }}
                                type="checkbox"
                                checked={this.state.selectedAll}
                                onChange={this.handleSelectAllCheckBox}
                            />
                        </div>
                        <div style={{ display: 'inline-block', width: '5%', cursor: 'move', alignSelf: 'center' }} />
                        <div style={styles.titleColumn}>Title</div>
                        <div style={{ alignSelf: 'center', width: '40%' }}>Dept</div>
                    </div>

                    {sortedGroups.length === 1 ?
                        this.renderUngrouped() : this.renderGroupTables()
                    }
                </div>

                <div>
                    {!admins.includes(role) ? '' :
                        <Button
                            className='custom'
                            style={styles.deleteButton}
                            onClick={() => this.setState({ showConfirmDelete: true })}
                        >
                            Delete selected
                        </Button>
                    }

                    {!admins.includes(role) ? '' :
                        <Button
                            className='custom'
                            bsStyle='success'
                            style={styles.addButton}
                            onClick={this.add}
                        >
                            Add
                        </Button>
                    }

                    <ConfirmDeleteWnd
                        show={showConfirmDelete}
                        onConfirm={this.deleteChecked}
                        onClose={() => this.setState({ showConfirmDelete: false })}
                    />
                </div>
            </div>
        )
    }

    componentWillReceiveProps(newProps) {
        const { data } = newProps
        if (JSON.stringify(this.props.data) !== JSON.stringify(data)) {
            this.initGroupTablesInfo(data)
            this.setState({data: data, sortedGroups: this.sortGroups(data)})
        }
    }

    componentWillMount() {
        const { data } = this.props
        this.initGroupTablesInfo(data)
        this.setState({data: data, sortedGroups: this.sortGroups(data)})
    }

    sortGroups(data) {
        var keys = Object.keys(data)
        var sorted = keys.sort((groupNameA, groupNameB) => {
            let weightA = parseInt(data[groupNameA].weight)
            let weightB = parseInt(data[groupNameB].weight)
            if (isNaN(weightB) || weightA < weightB) return -1
            if (isNaN(weightA) || weightA > weightB) return 1
            return 0
        })
        return sorted
    }

    initGroupTablesInfo(groupsData) {
        if (groupsData) {
            var groupTablesInfo = {}
            var rowIds = []
            var prevGroupTablesInfo = null
            if (this.state.groupTablesInfo)
                prevGroupTablesInfo = this.state.groupTablesInfo
            for (let group in groupsData) {
                groupTablesInfo[group] = {id: groupsData[group].id, isExpanded: false}
                if (prevGroupTablesInfo !== null) {
                    groupTablesInfo[group].isExpanded =
                        ObjHelper.accessObjByPath(prevGroupTablesInfo, group + '.isExpanded')
                }
                groupsData[group].courses.forEach(course => {
                    if (course.studentsCount == 0)
                        rowIds.push(course.id)
                })
            }

            this.setState({
                groupTablesInfo: groupTablesInfo,
                rowIds: rowIds
            })
        }
    }

    renderUngrouped() {
        const { data, sortedGroups, groupTablesInfo } = this.state
        const group = sortedGroups[0]
        const { courses } = data[group]
        const info = groupTablesInfo[group]
        let checkedRows = info.checkedRows ? info.checkedRows : []

        const onRowCheck = (id, isChecked) => {
            const idIndex = checkedRows.indexOf(id)
            const rowIdExists = idIndex !== -1
            if (!rowIdExists && isChecked)
                checkedRows.push(id)
            if (rowIdExists && !isChecked)
                checkedRows.splice(idIndex, 1)

            this.onCkeckedRowsChange(group, checkedRows)
        }

        return (
            <div style={{ minWidth: 992 }}>
                <GroupTableRows
                    title={group}
                    data={courses}
                    checkedRows={checkedRows}
                    onRowCheck={onRowCheck}
                    onCoursesSwap={this.onCoursesSwap}
                />
            </div>
        )
    }

    renderGroupTables() {
        const groups = this.state.data
        const sortedGroups = this.state.sortedGroups
        if (!groups) return false

        var tables = []
        sortedGroups.forEach(group => {
            tables.push(
                <GroupTable
                    weight={groups[group].weight}
                    id={groups[group].id}
                    key={group}
                    title={group}
                    expanded={this.state.groupTablesInfo[group].isExpanded}
                    data={groups[group].courses}
                    onClick={
                        () => {
                            var groupTablesInfo = this.state.groupTablesInfo
                            groupTablesInfo[group].isExpanded = !groupTablesInfo[group].isExpanded
                            this.setState({groupTablesInfo: groupTablesInfo})
                        }
                    }
                    onCheckedRowsChange={checkedRows => this.onCkeckedRowsChange(group, checkedRows)}
                    selectAllEventValue={this.state.selectAllEventValue}
                    onCourseReplace={(course, targetGroupId) => this.onCourseReplace(course, targetGroupId)}
                    onCoursesSwap={(courseA, courseB) => this.onCoursesSwap(courseA, courseB)}
                    onGroupsSwap={(groupA, groupB) => this.onGroupsSwap(groupA, groupB)}/>
            )
        })

        return tables
    }

    onCourseReplace(course, targetGroupId) {
        var groups = this.state.data
        var sourceGroupId = course.groupId

        // removing course from old group
        for (let group in groups) {
            if (groups[group].id  == sourceGroupId) {
                for (let i = 0; i < groups[group].courses.length; i++) {
                    if (groups[group].courses[i].id == course.id) {
                        groups[group].courses.splice(i, 1)
                        break
                    }
                }
                break
            }
        }

        // adding course to new group
        for (let group in groups)
            if (groups[group].id == targetGroupId)
                groups[group].courses.push(course)

        this.setState({data: groups})

        if (this.props.onCourseReplace)
            this.props.onCourseReplace(course, targetGroupId)
    }

    onCoursesSwap(courseA, courseB) {
        var { data: groups } = this.state
        var weightA = courseA.weight !== null ? courseA.weight : 0
        var weightB = courseB.weight !== null ? courseB.weight : 0

        var move = (sourceId, sourceGroup, targetGroup, targetWeight) => {
            for (let i = 0; groups[sourceGroup].courses.length; i++) {
                let course = groups[sourceGroup].courses[i]
                if (course.id == sourceId) {
                    course.weight = targetWeight
                    if (sourceGroup != targetGroup) {
                        groups[sourceGroup].courses.splice(i, 1)
                        groups[targetGroup].courses.push(course)
                    } else {
                        groups[sourceGroup].courses[i] = course
                    }
                    break
                }
            }
        }

        move(courseA.id, courseA.groupTitle, courseB.groupTitle, weightB)
        move(courseB.id, courseB.groupTitle, courseA.groupTitle, weightA)

        this.setState({data: groups})

        if (this.props.onCoursesSwap)
            this.props.onCoursesSwap(courseA, courseB)
    }

    onGroupsSwap(groupA, groupB) {
        var { data: groups } = this.state
        var weightA = groupA.weight !== null ? groupA.weight : 0
        var weightB = groupB.weight !== null ? groupB.weight : 0

        groups[groupA.title].weight = weightB
        groups[groupB.title].weight = weightA

        this.setState({data: groups, sortedGroups: this.sortGroups(groups)})

        if (this.props.onGroupsSwap)
            this.props.onGroupsSwap(groupA, groupB)
    }

    onCkeckedRowsChange(changedGroup, checkedRows) {
        var groupTablesInfo = this.state.groupTablesInfo
        groupTablesInfo[changedGroup].checkedRows = checkedRows
        var totalChecked = 0
        for (let group in groupTablesInfo) {
            let checkedRows = groupTablesInfo[group].checkedRows
            if (checkedRows)
                totalChecked += checkedRows.length
        }
        this.setState({groupTablesInfo: groupTablesInfo})
        var selectedAll = totalChecked === this.state.rowIds.length
        if (this.state.selectedAll !== selectedAll && this.state.rowIds.length > 0)
            this.setState({selectedAll: selectedAll})

        this.setState({selectAllEventValue: null})
    }

    handleSelectAllCheckBox(e) {
        if (this.state.selectedAll)
            this.setState({selectAllEventValue: false})
        else
            this.setState({selectAllEventValue: true})
    }

    deleteChecked(reason) {
        var checkedIds = []
        var groupTablesInfo = this.state.groupTablesInfo
        for (let group in this.state.groupTablesInfo)
            if (groupTablesInfo[group].checkedRows)
                checkedIds = checkedIds.concat(groupTablesInfo[group].checkedRows)

        if (this.props.onDelete)
            this.props.onDelete(checkedIds, reason)
    }
}

GroupedCourses.contextTypes = {
    router: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired
}

export default DragDropContext(HTML5Backend)(GroupedCourses)