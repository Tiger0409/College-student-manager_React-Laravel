import React from 'react'
import StudentList from './students/StudentList.jsx'
import TeacherList from './teachers/TeacherList.jsx'
import StaffList from './staff/StaffList.jsx'

export default class UserList extends React.Component {
    constructor(props, context) {
        super(props, context)

        this.state = {childTypeKey: null}
        this.childTypes = {
            'students': StudentList,
            'teachers': TeacherList,
            'staff': StaffList
        }
    }

    render() {
        var role = this.props.params.role
        if (role in this.childTypes) {
            var ConcreteComponent = this.childTypes[role]
            if (ConcreteComponent.allowedRoles().includes(this.props.appTypeKey)) {
                return (
                    <div>
                        <ConcreteComponent appTypeKey={this.props.appTypeKey} />
                    </div>
                )
            }
        }

        return false
    }
}