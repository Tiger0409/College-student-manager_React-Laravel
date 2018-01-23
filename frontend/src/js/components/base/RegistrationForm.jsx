import React, { PropTypes, Component } from 'react'
import { Button, Row, Col, Panel } from 'react-bootstrap'
import Notifier from '../../utils/Notifier.js'
import Oh from '../../utils/ObjHelper.js'
import Ph from '../../utils/PromiseHelper.js'
import { FormField, DatePicker,  Select } from '../common/FormWidgets.jsx'
import PostcodeSelect from '../common/PostcodeSelect.jsx'
import SourceSelect from '../common/SourceSelect.jsx'
import BranchSelector from '../common/BranchSelector.jsx'

function setWidth(width) {
    return { md: width, sm: width, xs: width }
}

function setOffset(width) {
    return { mdOffset: width, smOffset: width, xsOffset: width }
}

export default class RegistrationForm extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            user: {},
            username: localStorage.getItem('username'),
            usernameSelected: localStorage.getItem('username') !== null,
            hearPlaces: []
        }
        this.onChange = this.onChange.bind(this)
        this.register = this.register.bind(this)
        this.next = this.next.bind(this)
        this.save = this.save.bind(this)
        this.setPlaceHolder = this.setPlaceHolder.bind(this)
        this.removePlaceholder = this.removePlaceholder.bind(this)
        this.changeField = this.changeField.bind(this)
    }

    componentWillMount() {
        if (this.state.username) {
            this.changeField('userEmailAddress', this.state.username)
        }
    }

    componentDidMount() {
        DatePicker.init(this.changeField)
        this.loadHearPlaces()
    }

    loadHearPlaces() {
        $.ajax({
            type: 'get',
            url: '/api/hear-places/list',
            success: data => {
                this.setState({ hearPlaces: data })

                let { user } = this.props
                if (!user || !user.hearPlaceId) return

                for (const i in data) {
                    if (data[i].value == user.hearPlaceId) {
                        if (data[i].isVisible) break

                        $('#otherHearPlaceInput').slideToggle('fast')
                        $('#otherHearPlaceInput input').val(data[i].label)
                        user.hearPlaceId = -1
                        this.changeField('hearPlaceId', -1)
                        break
                    }
                }
            }
        })
    }

    changeField(name, value, filter) {
        let { user } = this.state
        let valueChanged = false

        if (filter) value = filter(value)

        Oh.accessObjByPath(user, name, currValue => {
            if (currValue !== value)
                valueChanged = true
            return value
        })

        this.setState({ user: user })
    }

    onChange(e, filter) {
        const { name, value } = e.target
        this.changeField(name, value, filter)
    }

    validate() {
        const { user } = this.state
        const get = field => Oh.getIfExists(user, field, null)

        const notEmpty = fields => {
            let result = true
            for (let i = 0; i < fields.length; i++) {
                const value = get(fields[i][0])
                const label = fields[i].length > 1 ? fields[i][1] : fields[i][0]
                if (!value) {
                    Notifier.error('\"' + label + '\" should not be empty')
                    result = false
                }
            }

            return result
        }

        const checkPassword = () => {
            if (user.userPassword && user.userPassword != user.userPasswordRepeat) {
                Notifier.error('Passwords should match')
                return false
            }

            return true
        }

        let isValid = true

        isValid &= notEmpty([
            ['profile.profileGender', 'Gender'],
            ['userPassword', 'Password'],
            ['profile.profileForname', 'First Name'],
            ['profile.profileSurname', 'Last Name']
        ])

        isValid &= checkPassword()

        return isValid
    }

    save() {
        let { user } = this.state

        const get = Oh.getIfExists
        user.userFullname = get(user, 'profile.profileForname', '') + ' ' + get(user, 'profile.profileSurname', '')

        if (this.savePm) this.savePm.cancel()

        this.savePm = Ph.ajax({
            type: 'post',
            url: '/api/users',
            data: user
        })

        this.savePm.then(
            () => {
                this.setState({ user: {} })
                this.context.router.push('/registration-success')
            },
            xhr => {
                Notifier.error('Save failed')
                console.error(xhr)
            }
        )
    }

    register() {
        if (!this.validate()) return
        this.emailUnique(this.save)
    }

    emailUnique(after) {
        const { user } = this.state

        $.ajax({
            type: 'get',
            url: '/api/auth/check-username',
            data: { username: user.userEmailAddress, fields: ['userEmailAddress'] },
            success: () => Notifier.error('Email is already in use'),
            error: () => { after() }
        })
    }

    next() {
        if (this.usernameCheckPm) {
            this.usernameCheckPm.cancel()
        }

        const { username } = this.state

        this.usernameCheckPm = Ph.ajax({
            type: 'get',
            url: '/api/auth/check-username',
            data: { username: username }
        })
        this.usernameCheckPm.then(
            () => {
                localStorage.setItem('forgotEmail', username)
                this.context.router.push('/forgot-password')
            },
            xhr => {
                this.changeField('userEmailAddress', username)
                this.setState({ usernameSelected: true })
            }
        )
    }

    removePlaceholder(e) {
        if ($(e.target).attr('placeholder') == e.target.value) {
            e.target.value = ''
        }
    }

    setPlaceHolder(e) {
        if (e.target.value == '') {
            e.target.value = $(e.target).attr('placeholder')
        }
    }

    nameFilter(value) {
        if (!value || value.length === 0) return value
        return value[0].toUpperCase() + value.slice(1).toLowerCase()
    }

    renderForm() {
        const { user, hearPlaces } = this.state
        const get = Oh.getIfExists

        return (
            <div>
                <Row style={{ marginBottom: 10 }}>
                    <Col md={8}>
                        <Row className='row-10'>
                            <Col xs={6} style={{ marginBottom: '10px' }}>
                                <input
                                    className='form-control'
                                    type='text'
                                    name='profile.profileForname'
                                    onFocus={this.removePlaceholder}
                                    onBlur={this.setPlaceHolder}
                                    onChange={e => this.onChange(e, this.nameFilter)}
                                    value={get(user, 'profile.profileForname', 'First Name')}
                                    placeholder='First Name'
                                    style={{
                                        color: get(user, 'profile.profileForname', '') ? 'black' : '#A8A8A8'
                                    }}
                                />
                            </Col>

                            <Col xs={6} style={{ marginBottom: '10px' }}>
                                <input
                                    className='form-control'
                                    type='text'
                                    name='profile.profileSurname'
                                    onFocus={this.removePlaceholder}
                                    onBlur={this.setPlaceHolder}
                                    onChange={e => this.onChange(e, this.nameFilter)}
                                    value={get(user, 'profile.profileSurname', 'Last Name')}
                                    placeholder='Last Name'
                                    style={{
                                        color: get(user, 'profile.profileSurname', '') ? 'black' : '#A8A8A8'
                                    }}
                                />
                            </Col>
                        </Row>

                        <div style={{ marginBottom: '10px' }}>
                            <input
                                className='form-control'
                                type='email'
                                name='userEmailAddress'
                                onFocus={this.removePlaceholder}
                                onBlur={this.setPlaceHolder}
                                onChange={this.onChange}
                                value={get(user, 'userEmailAddress', 'Email')}
                                placeholder='Email'
                                style={{
                                    width: '100%',
                                    marginBottom: '10px',
                                    color: get(user, 'userEmailAddress', '') ? 'black' : '#A8A8A8'
                                }}
                            />
                        </div>

                        <Row className='row-10'>
                            <Col xs={6} style={{ marginBottom: 10 }}>
                                <select
                                    className='form-control'
                                    name='profile.profileGender'
                                    id='profile.profileGender'
                                    value={get(user, 'profile.profileGender', '')}
                                    onChange={this.onChange}
                                >
                                    <option value=''>Select Gender</option>
                                    <option value='male'>Male</option>
                                    <option value='female'>Female</option>
                                </select>
                            </Col>

                            <Col xs={6} style={{ marginBottom: 10 }}>
                                <input
                                    className='form-control datepicker'
                                    name='age'
                                    value={get(user, 'age', 'Birth date')}
                                    onChange={this.onChange}
                                    onFocus={this.removePlaceholder}
                                    onBlur={this.setPlaceHolder}
                                    placeholder='Birth date'
                                    style={{
                                        color: get(user, 'age', '') ? 'black' : '#A8A8A8'
                                    }}
                                />
                            </Col>
                        </Row>

                        <Row className='row-10'>
                            <Col xs={6} style={{ marginBottom: 10 }}>
                                <input
                                    className='form-control'
                                    type={get(user, 'userPassword', '') ? 'password' : 'text'}
                                    name='userPassword'
                                    onFocus={this.removePlaceholder}
                                    onBlur={this.setPlaceHolder}
                                    value={get(user, 'userPassword', 'Password')}
                                    onChange={this.onChange}
                                    placeholder='Password'
                                    style={{
                                        color: get(user, 'userPassword', '') ? 'black' : '#A8A8A8'
                                    }}
                                />
                            </Col>

                            <Col xs={6} style={{ marginBottom: 10 }}>
                                <input
                                    className='form-control'
                                    type={get(user, 'userPasswordRepeat', '') ? 'password' : 'text'}
                                    name='userPasswordRepeat'
                                    onFocus={this.removePlaceholder}
                                    onBlur={this.setPlaceHolder}
                                    value={get(user, 'userPasswordRepeat', 'Re-enter password')}
                                    onChange={this.onChange}
                                    placeholder='Re-enter password'
                                    style={{
                                        color: get(user, 'userPasswordRepeat', '') ? 'black' : '#A8A8A8'
                                    }}
                                />
                            </Col>
                        </Row>

                        <Row className='row-10'>
                            <Col xs={6} style={{ marginBottom: 10 }}>
                                <input
                                    className='form-control'
                                    type='text'
                                    name='profile.profileTelephone'
                                    onFocus={this.removePlaceholder}
                                    onBlur={this.setPlaceHolder}
                                    value={get(user, 'profile.profileTelephone', 'Telephone')}
                                    onChange={this.onChange}
                                    placeholder='Telephone'
                                    style={{
                                        color: get(user, 'profile.profileTelephone', '') ? 'black' : '#A8A8A8'
                                    }}
                                />
                            </Col>

                            <Col xs={6} style={{ marginBottom: 10 }}>
                                <input
                                    className='form-control'
                                    type='text'
                                    name='profile.profileMobile'
                                    onFocus={this.removePlaceholder}
                                    onBlur={this.setPlaceHolder}
                                    value={get(user, 'profile.profileMobile', 'Mobile')}
                                    onChange={this.onChange}
                                    placeholder='Mobile'
                                    style={{
                                        color: get(user, 'profile.profileMobile', '') ? 'black' : '#A8A8A8'
                                    }}
                                />
                            </Col>
                        </Row>

                        <div style={{ marginBottom: '10px' }}>
                            <PostcodeSelect
                                onSelect={item => {
                                    this.changeField('profile.profileAddress', item.line1)
                                    this.changeField('profile.profileAddress2', item.line2)
                                    this.changeField('profile.profilePostcode', item.postcode)
                                    this.changeField('profile.city', item.town)
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '10px' }}>
                            <input
                                className='form-control'
                                type='text'
                                name='profile.profileAddress'
                                onFocus={this.removePlaceholder}
                                onBlur={this.setPlaceHolder}
                                value={get(user, 'profile.profileAddress', 'Building name/No')}
                                onChange={this.onChange}
                                placeholder='Building name/No'
                                style={{ color: get(user, 'profile.profileAddress', '') ? 'black' : '#A8A8A8' }}
                            />
                        </div>

                        <div style={{ marginBottom: '10px' }}>
                            <input
                                className='form-control'
                                type='text'
                                name='profile.profileAddress2'
                                onFocus={this.removePlaceholder}
                                onBlur={this.setPlaceHolder}
                                value={get(user, 'profile.profileAddress2', 'Street Name')}
                                onChange={this.onChange}
                                placeholder='Street Name'
                                style={{ color: get(user, 'profile.profileAddress2', '') ? 'black' : '#A8A8A8' }}
                            />
                        </div>

                        <div style={{ marginBottom: '10px' }}>
                            <input
                                className='form-control'
                                type='text'
                                name='profile.city'
                                onFocus={this.removePlaceholder}
                                onBlur={this.setPlaceHolder}
                                value={get(user, 'profile.city', 'City or town')}
                                onChange={this.onChange}
                                placeholder='City or town'
                                style={{ color: get(user, 'profile.city', '') ? 'black' : '#A8A8A8' }}
                            />
                        </div>

                        <Row>
                            <Col md={12} style={{ marginBottom: 10 }}>
                                <Select
                                    options={hearPlaces ? hearPlaces.filter(item => item.isVisible) : []}
                                    className='form-control'
                                    name='hearPlaceId'
                                    value={get(user, 'hearPlaceId', '')}
                                    onChange={e => {
                                        const { value: newValue } = e.target
                                        if ((get(user, 'hearPlaceId', '') == '-1') != (newValue == '-1')) {
                                            $('#otherHearPlaceInput').slideToggle('fast')
                                        }
                                        this.onChange(e)
                                    }}
                                >
                                    <option value=''>Where did you hear about us?</option>
                                </Select>
                            </Col>
                        </Row>

                        <Row id='otherHearPlaceInput' style={{ display: 'none' }}>
                            <Col md={12}>
                                <input
                                    type='text'
                                    className='form-control'
                                    name='otherHearPlace'
                                    onChange={this.onChange}
                                />
                            </Col>
                        </Row>
                    </Col>

                    <Col md={4}>
                        <div style={{ display: 'none' }}>
                            <BranchSelector
                                name='closestBranches'
                                value={user.closestBranches}
                                listedOnly
                                label='Select Closest Branches'
                                onChange={e => this.onChange(e)}
                            />
                        </div>
                    </Col>
                </Row>

                <Row style={{ marginTop: 10, marginBottom: 10 }}>
                    <Col md={4} mdOffset={4}>
                        <Button
                            style={{ textTransform: 'uppercase', width: '100%' }}
                            bsStyle='success'
                            onClick={this.register}
                        >
                            Register
                        </Button>
                    </Col>
                </Row>
            </div>
        )
    }

    renderUsernameSelect() {
        const { userName } = this.state

        return (
            <div>
                <FormField width={12} label='Username / Email'>
                    <input
                        type='text'
                        className='form-control'
                        name='userName'
                        onChange={e => this.setState({ username: e.target.value })}
                        value={userName}
                    />
                </FormField>

                <Row>
                    <Col md={12}>
                        <Button onClick={this.next} bsStyle='primary' style={{ marginRight: '15px' }}>
                            Next
                        </Button>
                    </Col>
                </Row>
            </div>
        )
    }

    render() {
        const { usernameSelected } = this.state

        return (
            <div style={{ marginTop: '40px' }}>
                <Row>
                    <Col md={8} mdOffset={2} sm={8} smOffset={2}>
                        <div id="notifications"></div>

                        <h2>Registration</h2>

                        {usernameSelected ?
                            this.renderForm() :
                            this.renderUsernameSelect()
                        }
                    </Col>
                </Row>
            </div>
        )
    }
}

RegistrationForm.contextTypes = {
    router: PropTypes.object.isRequired
}