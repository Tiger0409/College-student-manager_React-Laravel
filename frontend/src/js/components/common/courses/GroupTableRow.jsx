import React, { PropTypes } from 'react'
import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { Link } from 'react-router'
import { DRAG_ITEM_TYPES } from './../../../config/constants.js'
import { Button, Panel } from 'react-bootstrap'
import CourseClassTable from './CourseClassTable.jsx'
import QuickAddClassWnd from './QuickAddClassWnd.jsx'
import flow from 'lodash.flow'

let styles = {
    checkboxColumn: { display: 'inline-block', width: '12%', paddingLeft: '6%', alignSelf: 'center' },
    titleColumn: {display: 'inline-block', width: '43%', textAlign: 'left', alignSelf: 'center' },
    innerTable: { padding: '15px' }
}

if (window.innerWidth < 992) {
    styles = {
        checkboxColumn: { display: 'inline-block', width: '5%', paddingLeft: 10, alignSelf: 'center' },
        titleColumn: {display: 'inline-block', width: '50%', textAlign: 'left', alignSelf: 'center' }
    }
}

if (window.innerWidth < 768) {
    styles = {
        checkboxColumn: { display: 'inline-block', width: '5%', paddingLeft: 10, alignSelf: 'center' },
        titleColumn: {display: 'inline-block', width: '50%', textAlign: 'left', alignSelf: 'center' }
    }
}

const courseSource = {
    beginDrag(props) {
        return {
            id: props.id,
            courseTitle: props.title,
            deptName: props.deptName,
            studentsCount: props.disabled ? 1 : 0,
            groupId: props.groupId,
            groupTitle: props.groupTitle,
            weight: props.weight
        }
    }
};

const courseTarget = {
    drop(props, monitor) {
        var sourceCourse = monitor.getItem()
        const { id: targetId } = props
        const sourceId = sourceCourse
        if (targetId !== sourceId) {
            var courseA = {
                id: props.id,
                groupId: props.groupId,
                groupTitle: props.groupTitle,
                weight: props.weight
            }
            var courseB = {
                id: sourceCourse.id,
                groupId: sourceCourse.groupId,
                groupTitle: sourceCourse.groupTitle,
                weight: sourceCourse.weight
            }

            props.onCoursesSwap(courseA, courseB)
        }
    }
};

function collectTarget(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver()
    }
}

function collectSource(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging()
    }
}

class GroupTableRow extends React.Component {
    constructor(props, context) {
        super(props, context)
        this.state = { classesExpanded: false, showAddClass: false, classes: props.classes }
        this.onAddClass = this.onAddClass.bind(this)
    }

    onAddClass(classObj) {
        let { classes } = this.state
        classes.push({
            classTime: classObj.classTime,
            classId: classObj.id,
            classGender: classObj.classGender,
            maleCount: 0,
            femaleCount: 0,
            classRegOpen: 'no'
        })
        
        this.setState({ classes: classes })
    }

    render() {
        const {
            connectDragSource, connectDragPreview, connectDropTarget, checked,
            disabled, id, onCheck, isDragging, odd, title, deptName, isOver, feeForEmployed, feeForUnemployed
        } = this.props
        let { maleCount, femaleCount } = this.props
        const { showAddClass, classesExpanded, classes } = this.state

        if (!maleCount) maleCount = 0
        if (!femaleCount) femaleCount = 0

        var buttonColor = 'white'
        if (odd) buttonColor = 'whiteSmoke'
        if (isOver) buttonColor = '#7CE27C'
        return connectDragPreview(
            connectDropTarget(
                <div style={{ opacity: isDragging ? '0.5' : '1' }}>
                    <div
                        className='btn'
                        style={{
                            padding: '10px 0px',
                            width: '100%',
                            height: '50px',
                            backgroundColor: buttonColor,
                            display: 'flex',
                            justifyContent: 'flex-start',
                            borderBottom: 0,
                            borderTop: 0
                        }}
                        onClick={e => this.setState({ classesExpanded: !classesExpanded })}
                    >
                        <div style={styles.checkboxColumn}>
                            <input
                                type="checkbox"
                                onClick={e => e.stopPropagation() }
                                onChange={e => onCheck(e.target.checked)}
                                checked={checked}
                                disabled={disabled}
                            />
                        </div>

                        <div style={{ display: 'inline-block', width: '5%', cursor: 'move', alignSelf: 'center' }}>
                            {connectDragSource(<img src={"src/images/move_icon2.png"} alt="" width='20px'/>)}
                        </div>
                        <div style={styles.titleColumn}>
                            {`${title} (Male: ${maleCount} Female: ${femaleCount})`}
                        </div>
                        <div style={{ display: 'inline-block', width: '30%', textAlign: 'left', alignSelf: 'center' }}>
                            {deptName}
                        </div>
                        <div style={{ display: 'inline-block', width: '10%', alignSelf: 'center', paddingRight: 10 }}>
                            <Link onClick={e => e.stopPropagation() } to={`/courses/${id}/classes`}>Detail</Link>
                            <span> | </span>
                            <Link onClick={e => e.stopPropagation() } to={`/courses/${id}`}>Edit</Link>
                        </div>
                    </div>

                    <Panel
                        style={{ marginBottom: '0px', borderTop: 0, borderBottom: 0 }}
                        collapsible
                        expanded={classesExpanded}
                    >
                        <div style={styles.innerTable}>
                            <CourseClassTable classes={classes} />

                            <Button
                                style={{ marginTop: '15px', float: 'right', marginBottom: '15px' }}
                                className='custom'
                                bsStyle='success'
                                onClick={() => this.setState({ showAddClass: true })}
                            >
                                Add class
                            </Button>
                        </div>
                    </Panel>

                    <QuickAddClassWnd
                        courseTitle={title}
                        courseId={id}
                        show={showAddClass}
                        feeForEmployed={feeForEmployed}
                        feeForUnemployed={feeForUnemployed}
                        onClose={() => this.setState({ showAddClass: false })}
                        onAdd={this.onAddClass}
                    />
                </div>
            )
        )
    }
}

GroupTableRow.propTypes = {
    title: PropTypes.string.isRequired,
    groupId: PropTypes.number.isRequired,
    groupTitle: PropTypes.string.isRequired,
    deptName: PropTypes.string,
    id: PropTypes.number,
    weight: PropTypes.number,
    onCheck: PropTypes.func.isRequired,
    checked: PropTypes.bool.isRequired,
    disabled: PropTypes.bool,
    connectDragSource: PropTypes.func.isRequired,
    connectDragPreview: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
    isOver: PropTypes.bool.isRequired,
    odd: PropTypes.bool,
    style: PropTypes.object
}

export default flow(
    DragSource(DRAG_ITEM_TYPES.COURSE, courseSource, collectSource),
    DropTarget(DRAG_ITEM_TYPES.COURSE, courseTarget, collectTarget)
)(GroupTableRow)