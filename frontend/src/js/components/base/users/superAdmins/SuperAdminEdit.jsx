import React, { PropTypes, Component } from 'react'
import { ROLES, ROLE_IDS } from './../../../../config/constants.js'
import { FormField, EditableHTML, LabeledValue } from './../../../common/FormWidgets.jsx'
import FormGroup from './../../../common/FormGroup.jsx'
import PromiseHelper from './../../../../utils/PromiseHelper.js'
import ObjHelper from './../../../../utils/ObjHelper.js'
import SourceSelect from './../../../common/SourceSelect.jsx'
import { Button, Row, Col } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import AllowedBranches from '../../../base/AllowedBranches.jsx'
import Notifier from '../../../../utils/Notifier.js'
import ConfirmDeleteWnd from '../../../common/ConfirmDeleteWnd.jsx'

let styles = {
    buttonAfter: { marginLeft: 20 }
}

if (window.innerWidth < 768) {
    styles = {
        buttonAfter: {}
    }
}

export default class SuperAdminEdit extends Component {
    static allowedRoles() {
        return [ROLES.SUPER_ADMIN]
    }

    constructor(props, context) {
        super(props, context)
        this.state = { user: {}, userPasswordRepeat: '', id: this.props.id, isLoading: false, showConfirmDelete: false }
        this.promises = {load: null, save: null}
        this.requestFields = [
            'id',
            'userName',
            'userEmailAddress',
            'userFullname',
            'allowedBranches'
        ]
        this.submit = this.submit.bind(this)
        this.onFieldChange = this.onFieldChange.bind(this)
        this.save = this.save.bind(this)
        this.deleteUser = this.deleteUser.bind(this)
        this.back = this.back.bind(this)
    }

    componentWillMount() {
        this.load()
    }

    componentWillUnmount() {
        for (let key in this.promises) {
            if (this.promises[key]) {
                this.promises[key].cancel()
            }
        }
    }

    submit(e) {
        e.preventDefault()
    }

    load() {
        const { id } = this.props

        if (!id) return

        this.setState({isLoading: true})

        if (this.promises.load)
            this.promises.load.cancel()

        this.promises.load = PromiseHelper.ajax({
            type: 'get',
            url: '/api/users/' + id,
            data: {
                fields: this.requestFields
            }
        })
        this.promises.load.then(
            data => {
                console.log(data)
                this.setState({isLoading: false, user: data})
            },
            xhr => console.log(xhr)
        )
    }

    beforeSave() {
        var { id, user } = this.state
        if (!id) {
            user.userMainRole = ROLE_IDS[ROLES.SUPER_ADMIN]
        }
    }

    save() {
        this.beforeSave()

        var { id, user, userPasswordRepeat } = this.state

        if (user.userPassword && user.userPassword != userPasswordRepeat) {
            alert('passwords should match')
            return
        }

        var ajaxParams = {}
        if (id) {
            if (!user.userPassword || user.userPassword.length == 0)
                delete user.userPassword

            ajaxParams = {
                type: 'put',
                url: '/api/users/' + id,
                data: user
            }
        } else {
            ajaxParams = {
                type: 'post',
                url: '/api/users',
                data: user
            }
        }

        this.promises.save = PromiseHelper.ajax(ajaxParams)
        this.promises.save.then(
            data => {
                Notifier.success('Saved successfully')
                this.back()
            },
            xhr => {
                Notifier.error('Save failed')
                console.log(xhr)
            }
        )
    }

    deleteUser(reason) {
        const { id } = this.state
        if (!id) return

        $.ajax({
            type: 'delete',
            url: '/api/users/' + id,
            data: { reason: reason },
            success: response => {
                Notifier.success('Deleted successfully')
                this.back()
            },
            error: error => {
                Notifier.error('Deletion failed')
                console.log(error)
            }
        })
    }

    back() {
        this.context.router.push('/users/role/staff')
    }

    onFieldChange(e) {
        var { user } = this.state
        ObjHelper.accessObjByPath(user, e.target.name, value => e.target.value)
        this.setState({user: user})
    }

    renderFormButtons() {
        const { id } = this.state
        var deleteBtn = false
        if (id) {
            deleteBtn = (
                <Button
                    className='custom btn-danger'
                    onClick={() => this.setState({ showConfirmDelete: true })}
                    style={styles.buttonAfter}
                >
                    Delete user
                </Button>
            )
        }

        return (
            <div style={{ marginTop: '20px' }}>
                <FormGroup>
                    <Button className='custom btn-success' onClick={this.save}>Save</Button>
                    <Button className='custom' style={styles.buttonAfter} onClick={this.back}>Cancel</Button>
                    {deleteBtn}
                </FormGroup>
            </div>
        )
    }

    render() {
        const { isLoading, user, userPasswordRepeat, showConfirmDelete } = this.state
        const formComment = { color: 'grey' }

        const Label = ({ style, children }) => (<p className='detail-field-label' style={style}>{children}</p>)

        if (isLoading) return <p>Loading...</p>

        return (
            <div className='content-block'>
                <h2 className='block-heading'>Super Admin Profile</h2>
                <hr />

                <form onSubmit={this.submit}>

                    <Row>
                        <Col md={6}>
                        {
                            user.id ?
                                <LabeledValue width={12} label='Username' value={user.userName} />
                                :
                                <div>
                                    <Label>Username</Label>
                                    <input
                                        type='text'
                                        name='userName'
                                        className='form-control'
                                        value={user.userName}
                                        onChange={this.onFieldChange}
                                    />
                                </div>
                        }
                        </Col>

                        <Col md={6}>
                        {
                            user.id ?
                                <LabeledValue width={12} label='Email Address' value={user.userEmailAddress} />
                                :
                                <div>
                                    <Label>Email address</Label>
                                    <input
                                        type='text'
                                        name='userEmailAddress'
                                        className='form-control'
                                        value={user.userEmailAddress}
                                        onChange={this.onFieldChange}
                                    />
                                    <p style={formComment}>(optional)</p>
                                </div>
                        }
                        </Col>
                    </Row>


                    <Row>
                        <Col md={6}>
                            <Label>Password</Label>
                            <input
                                type='text'
                                name='userPassword'
                                className='form-control'
                                value={user.userPassword}
                                onChange={this.onFieldChange}
                            />
                            {user.id ? <p style={formComment}>Leave blank to keep old password!</p> : ''}

                            <Label style={{ marginTop: '5px' }}>Confirm Password</Label>
                            <input
                                type='text'
                                name='userPasswordRepeat'
                                className='form-control'
                                value={userPasswordRepeat}
                                onChange={e => this.setState({userPasswordRepeat: e.target.value})}
                            />
                        </Col>

                        <Col md={6}>
                            <Label>Fullname</Label>
                            <input
                                type='text'
                                name='userFullname'
                                className='form-control'
                                value={user.userFullname}
                                onChange={this.onFieldChange}
                            />
                        </Col>

                    </Row>

                    {this.renderFormButtons()}
                </form>

                <ConfirmDeleteWnd
                    show={showConfirmDelete}
                    onConfirm={this.deleteUser}
                    onClose={() => this.setState({ showConfirmDelete: false })}
                />
            </div>
        )
    }
}
SuperAdminEdit.propTypes = {
    id: PropTypes.number
}
SuperAdminEdit.contextTypes = {
    router: React.PropTypes.object.isRequired
}