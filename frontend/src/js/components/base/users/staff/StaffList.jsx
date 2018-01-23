import React, { PropTypes, Component } from 'react'
import { ROLES } from '../../../../config/constants.js'
import PromiseHelper from '../../../../utils/PromiseHelper.js'
import Table from '../../../common/Table.jsx'
import { Link } from 'react-router'
import { Button } from 'react-bootstrap'
import S from '../../../../utils/StringHelper.js'

let styles = {
    roleDropdownWrapper: { width: 200, display: 'inline-block', marginRight: '10px', marginBottom: 15 }
}

if (window.innerWidth < 768) {
    styles = {
        roleDropdownWrapper: { width: '100%', marginBottom: 15 }
    }
}

export default class StaffList extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { isLoading: false, data: null, selectedRole: 0 }
        this.roles = ['admins', 'registrars']
        if (props.appTypeKey == ROLES.SUPER_ADMIN) {
            this.roles.push('super-admins')
        }
        this.requestFields = ['id', 'userFullname', 'userEmailAddress', 'role.roleName']
        this.loadPromise = null
        this.addUser = this.addUser.bind(this)
        this.onRoleSelect = this.onRoleSelect.bind(this)
    }

    static allowedRoles () {
        return [ROLES.ADMIN, ROLES.SUPER_ADMIN]
    }

    load() {
        this.setState({ isLoading: true })

        if (this.loadPromise) {
            this.loadPromise.cancel()
        }

        this.loadPromise = PromiseHelper.ajax({
            type: 'get',
            url: '/api/users',
            data: { fields: this.requestFields, roles: this.roles }
        })
        this.loadPromise.then(
            data => this.setState({isLoading: false, data: data.rows}),
            xhr => console.log(xhr)
        )
    }

    createRow(rowObj, showingProps) {
        var row = Table.createRowBase(rowObj, showingProps)
        row.push(<td key='controls'><Link to={'/users/' + rowObj.id + '/edit'}>Edit</Link></td>)
        return row
    }

    onRoleSelect(e) {
        this.setState({ selectedRole: e.target.value })
    }

    addUser() {
        const { selectedRole } = this.state
        if (!this.roles.includes(selectedRole)) {
            console.log(selectedRole, this.roles)
            return
        }

        this.context.router.push(`/users/role/${selectedRole}/add`)
    }

    componentWillMount() {
        this.load()
    }

    componentWillUnmount() {
        if (this.loadPromise) {
            this.loadPromise.cancel()
        }
    }

    renderTable() {
        const { data } = this.state

        if (!data || data.length == 0)
            return <p>No super admins yet</p>

        return (
            <Table
                data={data}
                showingProps={['userFullname', 'role.roleName', 'userEmailAddress']}
                headers={['Name', 'Role', 'Email Address', '']}
                createRow={this.createRow}
            />
        )
    }

    render() {
        const { isLoading, selectedRole } = this.state

        if (isLoading) {
            return <p>Loading...</p>
        }

        return (
            <div className='content-block' style={{ paddingTop: '35px' }}>
                {this.renderTable()}
                <div style={styles.roleDropdownWrapper}>
                    <select
                        name='selectedRole'
                        className='form-control'
                        onChange={this.onRoleSelect}
                        value={selectedRole}
                    >
                        <option value='0'>-- Select role --</option>
                        {
                            this.roles.map(
                                (role, i) => <option key={i} value={role}>{S.ucFirst(role)}</option>
                            )
                        }
                    </select>
                </div>

                <Button onClick={this.addUser} className='custom btn-success'>Add</Button>
            </div>
        )
    }
}

StaffList.contextTypes = {
    router: PropTypes.object.isRequired
}

