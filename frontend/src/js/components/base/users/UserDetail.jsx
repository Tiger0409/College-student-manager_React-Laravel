import React, { Component } from 'react'
import User from './../../../classes/User.js'
import { ROLES } from './../../../config/constants.js'
import StudentDetail from './students/StudentDetail.jsx'
import TeacherDetail from './teachers/TeacherDetail.jsx'
import SuperAdminEdit from './superAdmins/SuperAdminEdit'
import AdminEdit from './admins/AdminEdit'
import RegistrarEdit from './registrars/RegistrarEdit'
import Spinner from '../../common/Spinner.jsx'

export default class UserDetail extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { isLoading: false, user: null }
        this.childTypes = {
            [ROLES.STUDENT]: StudentDetail,
            [ROLES.TEACHER]: TeacherDetail,
            [ROLES.SUPER_ADMIN]: SuperAdminEdit,
            [ROLES.ADMIN]: AdminEdit,
            [ROLES.REGISTRAR]: RegistrarEdit,
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.params.id !== nextProps.params.id) {
            this.load(nextProps.params.id)
        }
    }

    load(id) {
        this.setState({ isLoading: true })

        User.findById(
            id,
            ['role.roleName'],
                user => {
                this.setState({isLoading: false, user: user})
            },
            () => {
                console.error('User by id ' + id + ' was not found')
                this.setState({isLoading: false})
            }
        )
    }

    componentDidMount() {
        this.load(this.props.params.id)
    }

    render() {
        const { isLoading, user } = this.state
        const { params: { id }, appTypeKey } = this.props

        if (isLoading) {
            return <Spinner />
        }

        if (user === null) {
            return <p>User was not found</p>
        }

        var role = this.state.user.role.roleName

        if (role in this.childTypes) {
            var ConcreteComponent = this.childTypes[role]
            if (ConcreteComponent) {
                return (
                    <div>
                        <ConcreteComponent id={id} appTypeKey={appTypeKey} />
                    </div>
                )
            }
        }

        return false
    }
}

