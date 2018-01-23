import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { Button } from 'react-bootstrap'
import Notifier from '../../../utils/Notifier.js'

export default class CourseClassTable extends Component {
    constructor(props, context) {
        super(props, context)
    }

    render() {
        const { classes } = this.props
        if (classes == null || classes.length === 0)
            return <p>No classes</p>

        return (<div>{this.renderClasses()}</div>)
    }

    sortClasses(classes) {
        return classes.sort((classA, classB) => {
            const weightA = parseInt(classA.classWeight)
            const weightB = parseInt(classB.classWeight)

            if (weightA > weightB) {
                return -1
            } else if (weightA < weightB) {
                return 1
            }

            return 0
        })
    }

    renderClasses() {
        var components = []
        const { classes } = this.props

        const sortedClasses = this.sortClasses(classes)

        for (let i = 0; i < sortedClasses.length; i++) {
            const { classId } = sortedClasses[i]

            components.push(
                <CourseClass key={classId} {...sortedClasses[i]} />
            )
        }
        return components
    }
}

CourseClassTable.PropTypes = {
    classes: PropTypes.array
}

class CourseClass extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { classRegOpen: props.classRegOpen }
        this.toggleRegPromise = null
        this.toggleReg = this.toggleReg.bind(this)
    }

    toggleReg() {
        const { classId } = this.props
        const { classRegOpen } = this.state

        let newClassRegOpen = classRegOpen == 'yes' ? 'no' : 'yes';

        this.setState({ classRegOpen: newClassRegOpen })

        $.ajax({
            type: 'put',
            url: `/api/classes/${classId}`,
            data: { courseClassRegistrationOpen: newClassRegOpen },
            success: () => Notifier.success('Updated'),
            error: xhr => { Notifier.error('Update failed'); console.log(xhr) }
        })
    }

    render() {
        const { classTime, classGender, classId } = this.props
        let { maleCount, femaleCount } = this.props
        const { classRegOpen } = this.state

        if (!maleCount) maleCount = 0
        if (!femaleCount) femaleCount = 0

        return (
            <div
                style={{
                    backgroundColor: '#EFEFEF',
                    marginBottom: '5px',
                    display: 'flex',
                    justifyContent: 'center',
                    height: '50px'
                }}
            >
                <div style={{ display: 'inline-block', width: '35%', alignSelf: 'center', textAlign: 'left' }}>
                    <p style={{ margin: '0' }}>
                        Class time: {classTime} (Male: {maleCount} Female: {femaleCount})
                    </p>
                </div>

                <div style={{ display: 'inline-block', width: '15%', alignSelf: 'center', textAlign: 'left' }}>
                    <p style={{ margin: '0' }}>Class gender: {classGender}</p>
                </div>

                <div style={{ display: 'inline-block', width: '35%', textAlign: 'center', alignSelf: 'center' }}>
                    <p style={{ margin: '0' }}>
                        <Link to={`classes/${classId}`}>Detail</Link>
                        <span> | Registers </span>
                        <Link to={`classes/${classId}/print/weekend-registers`}>Weekend</Link>
                        <span> </span>
                        <Link to={`classes/${classId}/print/weekday-registers`}>Weekday</Link>
                        <span> </span>
                        <Link to={`classes/${classId}/print/adults`}>Adults</Link>
                    </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                        onClick={this.toggleReg}
                        style={{ height: '40px', alignSelf: 'center' }}
                        bsStyle={classRegOpen == 'yes' ? 'success' : 'danger'}
                    >
                        Reg is open
                    </Button>
                </div>
            </div>
        )
    }
}

CourseClass.PropTypes = {
    classId: PropTypes.number.isRequired,
    gender: PropTypes.string.isRequired,
    classTime: PropTypes.string.isRequired,
    maleCount: PropTypes.number.isRequired,
    femaleCount: PropTypes.number.isRequired
}