import React, { Component, PropTypes } from 'react'
import { ROLES } from './../../../config/constants.js'
import StudentEdit from './students/StudentEdit.jsx'
import SuperAdminEdit from './superAdmins/SuperAdminEdit.jsx'
import AdminEdit from './admins/AdminEdit.jsx'
import RegistrarEdit from './registrars/RegistrarEdit.jsx'
import TeacherDetail from './teachers/TeacherDetail.jsx'
import User from './../../../classes/User.js'
import Spinner from '../../common/Spinner.jsx'

export default class UserEdit extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {isLoading: false, user: null}
        this.childTypes = {
            [ROLES.STUDENT]: StudentEdit,
            [ROLES.SUPER_ADMIN]: SuperAdminEdit,
            [ROLES.ADMIN]: AdminEdit,
            [ROLES.REGISTRAR]: RegistrarEdit,
            [ROLES.TEACHER]: TeacherDetail,
            'students': StudentEdit,
            'super-admins': SuperAdminEdit,
            'admins': AdminEdit,
            'registrars': RegistrarEdit,
            'teachers': TeacherDetail
        }
    }

    componentWillMount() {
        const { id } = this.props.params

        if (id) {
            this.setState({isLoading: true})
            User.findById(
                id,
                ['role.roleName'],
                user => this.setState({ isLoading: false, user: user }),
                () => console.error('User by id ' + id + ' was not found')
            )
        }
    }

    getChildComponent() {
        const { user } = this.state

        var role = null
        if (user !== null) {
            role = user.role.roleName
        } else {
            role = this.props.params.role
        }

        return this.childTypes[role]
    }

    render() {
        const { appTypeKey, params: { id } }  = this.props
        const { isLoading } = this.state

        if (isLoading) return (<div><Spinner /></div>)

        var ConcreteComponent = this.getChildComponent()

        if (!ConcreteComponent) {
            return <p>Invalid role.</p>
        }

        const { user: loggedUser } = this.context
        const { user } = this.state
        var childProps = { appTypeKey: appTypeKey }
        if (user) {
            childProps.id = id
        }

        if (!ConcreteComponent.allowedRoles().includes(appTypeKey) && (id ? loggedUser.id != id : true)) {
            return <p>Access not allowed.</p>
        }

        return (
            <div>
                <ConcreteComponent {...childProps} />
            </div>
        )
    }
}

UserEdit.propTypes = {
    appTypeKey: PropTypes.string
}

UserEdit.contextTypes = {
    user: PropTypes.object
}
