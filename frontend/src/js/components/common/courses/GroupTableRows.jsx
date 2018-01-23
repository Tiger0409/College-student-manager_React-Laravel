import React, { PropTypes, Component } from 'react'
import GroupTableRow from './GroupTableRow.jsx'

export default class GroupTableRows extends Component {
    sortCourses(courses) {
        return courses.sort((courseA, courseB) => {
            const deptWeightA = parseInt(courseA.deptWeight)
            const deptWeightB = parseInt(courseB.deptWeight)

            if (deptWeightA < deptWeightB) {
                return -1
            } else if (deptWeightA > deptWeightB) {
                return 1
            } else {
                const courseWeightA = parseInt(courseA.weight)
                const courseWeightB = parseInt(courseB.weight)
                if (courseWeightA < courseWeightB) {
                    return -1
                } else if (courseWeightA > courseWeightB) {
                    return 1
                }
            }

            return 0
        })
    }

    render() {
        const { title, data, onRowCheck, checkedRows, onCoursesSwap } = this.props
        const groupId = this.props.groupId !== null ? parseInt(this.props.groupId) : 0

        const sortedCourses = this.sortCourses(data)

        return (
            <div>
            {
                sortedCourses.map((dataItem, i) => {
                    var {
                        classes,
                        courseTitle,
                        deptName,
                        id,
                        maleCount,
                        femaleCount,
                        weight,
                        feeForEmployed,
                        feeForUnemployed
                    } = dataItem

                    id = id ? parseInt(id) : null
                    weight = weight ? parseInt(weight) : null
                    const disabled = classes.length != 0
                    const odd = i % 2 == 0

                    return (
                        <GroupTableRow
                            groupId={groupId}
                            groupTitle={title}
                            weight={weight}
                            maleCount={maleCount}
                            femaleCount={femaleCount}
                            feeForEmployed={feeForEmployed}
                            feeForUnemployed={feeForUnemployed}
                            key={i}
                            title={courseTitle}
                            deptName={deptName}
                            id={id}
                            onCheck={checked => onRowCheck(id, checked)}
                            odd={odd}
                            classes={classes}
                            checked={checkedRows.indexOf(id) !== -1}
                            disabled={disabled}
                            onCoursesSwap={(courseA, courseB) => onCoursesSwap(courseA, courseB)}
                        />
                    )
                })
            }
            </div>
        )
    }
}

GroupTableRows.propTypes = {
    title: PropTypes.string,
    data: PropTypes.array.isRequired,
    onRowCheck: PropTypes.func,
    checkedRows: PropTypes.array,
    onCoursesSwap: PropTypes.func
}