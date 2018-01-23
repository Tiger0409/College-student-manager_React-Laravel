import React, { Component, PropTypes } from 'react'
import { Button, Row, Col, Panel } from 'react-bootstrap'
import FormGroup from './../common/FormGroup.jsx'
import ObjHelper from './../../utils/ObjHelper.js'
import Ph from './../../utils/PromiseHelper.js'
import SourceSelect from './../common/SourceSelect.jsx'
import { LabeledValue, EditableValue, FormField } from './../common/FormWidgets.jsx'
import DataLoader from '../common/DataLoader.jsx'
import RoleFilter from '../common/RoleFilter.jsx'
import ProfileForm from './ProfileForm.jsx'
import Notifier from '../../utils/Notifier.js'

class Profile extends React.Component {
    constructor(props, context) {
        super(props, context)

        // dirty hack, should be reworked
        let data = props.data
        data.userPassword = ''

        this.state = { user: data, showConfirmWnd: false }
        this.onToggle = this.onToggle.bind(this)
        this.onChange = this.onChange.bind(this)
        this.submit = this.submit.bind(this)
    }

    onChange(user) {
        this.setState({ user: user })
    }

    validate(user) {
        if (user.userPassword && user.userPassword !== user.userPasswordConfirm) {
            alert('Passwords should match')
            return false
        }

        return true
    }

    submit() {
        const { user } = this.state

        if (!this.validate(user)) {
            return
        }

        const get = ObjHelper.getIfExists
        user.userFullname = get(user, 'profile.profileForname', '') + ' ' + get(user, 'profile.profileSurname', '')

        $.ajax({
            type: 'put',
            url: '/api/users/' + user.id,
            data: user,
            success: () => Notifier.success('Profile Updated'),
            error: xhr => {
                Notifier.error('Error updating profile');
                console.error(xhr)
            }
        })
    }

    onToggle(e) {
        const { value: stateProp } = e.target
        this.setState({ [stateProp]: !this.state[stateProp] })
    }

    render() {
        const { user } = this.state

        return (
            <div>
                <Row>
                    <Col md={8} mdOffset={2}>
                        <h2>Profile</h2>
                        <div id="notifications"></div>

                        <ProfileForm
                            user={user}
                            onChange={this.onChange}
                        />
                    </Col>
                </Row>

                <Row>
                    <Col md={2} mdOffset={5}>
                        <Button style={{ marginTop: '15px' }} onClick={this.submit} bsStyle='primary'>Save</Button>
                    </Col>
                </Row>
            </div>
        )
    }
}

const AutoLoadedProfile = DataLoader(Profile)

export default class MainWrapper extends Component {
    render() {
        const { user, router } = this.context

        if (!user) {
            router.push('/login')
            return <div></div>
        }

        const { id } = user

        return (
            <AutoLoadedProfile
                ajaxOperations={{
                    load: { type: 'get', url: `/api/users/${id}` },
                    save: { type: 'put', url: `/api/users/${id}` }
                }}
            />
        )
    }
}

MainWrapper.contextTypes = {
    user: PropTypes.object,
    router: PropTypes.object.isRequired
}