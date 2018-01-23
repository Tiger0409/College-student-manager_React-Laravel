import React, { PropTypes } from 'react'
import { Row, Col, Button, Panel } from 'react-bootstrap'
import GroupTableRows from './GroupTableRows.jsx'
import ObjHelper from './../../../utils/ObjHelper.js'
import { ItemTypes } from './../../../config/constants.js';
import { DropTarget, DragSource } from 'react-dnd';
import { DRAG_ITEM_TYPES } from './../../../config/constants.js'
import flow from 'lodash.flow'

const groupSource = {
    beginDrag(props) {
        return {
            id: props.id,
            weight: props.weight,
            title: props.title
        }
    },

    canDrag(props) {
        return props.id !== null && props.weight !== null
    }
}

const groupTarget = {
    canDrop(props) {
        return props.id !== null && props.weight !== null
    },

    drop(props, monitor) {
        var item = monitor.getItem()
        var groupA = {id: props.id, weight: props.weight, title: props.title}
        var groupB = {id: item.id, weight: item.weight, title: item.title}
        if (groupA.id != groupB.id)
            props.onGroupsSwap(groupA, groupB)
    }
}

const courseTarget = {
    drop(props, monitor) {
        const course = monitor.getItem()
        props.onCourseReplace(course, props.id)
    }
}

function collectCourseTarget(connect, monitor) {
    return {
        connectCourseDropTarget: connect.dropTarget(),
        isCourseOver: monitor.isOver()
    }
}

function collectGroupTarget(connect, monitor) {
    return {
        connectGroupDropTarget: connect.dropTarget(),
        isGroupOver: monitor.isOver(),
        canDropGroup: monitor.canDrop()
    }
}

function collectSource(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging()
    }
}

export class GroupTable extends React.Component {
    constructor(props, context) {
        super(props, context)
        this.state = {checkedRows: [], data: []}
        this.rowIds = this.getRowIds()
        this.onCoursesSwap = this.onCoursesSwap.bind(this)
        this.onRowCheck = this.onRowCheck.bind(this)
    }

    componentWillReceiveProps(newProps) {
        if (newProps.hasOwnProperty('selectAllEventValue') && newProps.selectAllEventValue !== null) {
            this.handleSelectAll(newProps.selectAllEventValue)
        }

        this.sortAndSetData(newProps.data)
    }

    componentWillMount() {
        this.sortAndSetData(this.props.data)
    }

    sortAndSetData(data) {
        data = data.sort((courseA, courseB) => {
            let weightA = parseInt(courseA.weight)
            let weightB = parseInt(courseB.weight)
            if (weightA > weightB) return -1
            if (weightA < weightB) return 1
            return 0
        })

        this.setState({ data: data })
    }

    render() {
        const {
            title, expanded, onClick, isCourseOver, isGroupOver, connectGroupDropTarget,
            connectCourseDropTarget, connectDragSource, connectDragPreview, canDropGroup
        } = this.props

        const { data, checkedRows } = this.state

        var buttonColor = '#e1eafb'
        if (isCourseOver)
            buttonColor = '#FFFF80'
        if (isGroupOver) {
            buttonColor = canDropGroup ? '#FFFF80' : '#F5A6A6'
        }

        return connectDragPreview(
            <div>
                <Row>
                    <Col md={12}>
                        {connectCourseDropTarget(connectGroupDropTarget(
                            <div>
                                <Button
                                    style={{
                                        height: '50px',
                                        textAlign: 'left',
                                        paddingLeft: '2%',
                                        backgroundColor: buttonColor,
                                        borderBottom: '1px solid #b6ccf3'
                                    }}
                                    onClick={() => onClick(title)}
                                    vertical
                                    block
                                >
                                    {connectDragSource(<img src={"src/images/move_icon2.png"} alt="" width='20px'/>)}
                                    {title}
                                </Button>
                            </div>
                        ))}
                        <Panel
                            className='courses-panel'
                            collapsible
                            expanded={expanded}
                        >
                            <GroupTableRows
                                title={title}
                                data={data}
                                checkedRows={checkedRows}
                                onRowCheck={this.onRowCheck}
                                onCoursesSwap={this.onCoursesSwap}
                            />
                        </Panel>
                    </Col>
                </Row>
            </div>
        )
    }

    getRowIds() {
        var ids = []
        this.props.data.forEach(dataItem => {
            var id = dataItem.id ? parseInt(dataItem.id) : null
            if (id !== null && dataItem.studentsCount == 0) ids.push(id)
        })
        return ids
    }

    onRowCheck(id, isChecked) {
        var checkedRows = this.state.checkedRows
        const idIndex = checkedRows.indexOf(id)
        const rowIdExists = idIndex !== -1
        if (!rowIdExists && isChecked)
            checkedRows.push(id)
        if (rowIdExists && !isChecked)
            checkedRows.splice(idIndex, 1)
        this.props.onCheckedRowsChange(checkedRows)
        this.setState({checkedRows: checkedRows})
    }

    onCoursesSwap(courseA, courseB) {
        if (this.props.onCoursesSwap(courseA, courseB))
            this.props.onCoursesSwap(courseA, courseB)
    }

    handleSelectAll(isChecked) {
        var checkedRows
        if (isChecked)
            checkedRows = this.rowIds
        else
            checkedRows = []

        this.props.onCheckedRowsChange(checkedRows)
        this.setState({checkedRows: checkedRows})
    }
}


GroupTable.propTypes = {
    isCourseOver: PropTypes.bool.isRequired,
    isGroupOver: PropTypes.bool.isRequired
}

export default flow(
    DropTarget(DRAG_ITEM_TYPES.COURSE, courseTarget, collectCourseTarget),
    DropTarget(DRAG_ITEM_TYPES.GROUP, groupTarget, collectGroupTarget),
    DragSource(DRAG_ITEM_TYPES.GROUP, groupSource, collectSource)
)(GroupTable)