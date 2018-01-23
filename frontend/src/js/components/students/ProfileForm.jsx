import React, { Component, PropTypes } from 'react'
import ObjHelper from '../../utils/ObjHelper.js'
import Ph from '../../utils/PromiseHelper.js'
import { Row, Col, Button, Panel } from 'react-bootstrap'
import PostcodeSelect from '../common/PostcodeSelect.jsx'
import SourceSelect from '../common/SourceSelect.jsx'
import { DatePicker, Select } from '../common/FormWidgets.jsx'
import BranchSelector from '../common/BranchSelector.jsx'

export default class ProfileForm extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { postcodeAddresses: null, postcodeTown: null, hearPlaces: [] }
        this.getPostcodePromise = null
        this.changeField = this.changeField.bind(this)
        this.onChange = this.onChange.bind(this)
        this.searchAddress = this.searchAddress.bind(this)
    }

    searchAddress() {
        const { user } = this.props
        const postcode = ObjHelper.getIfExists(user, 'profile.profilePostcode', '')
        if (postcode.length === 0) {
            return
        }

        if (this.getPostcodePromise) {
            this.getPostcodePromise.cancel()
        }

        this.getPostcodePromise = Ph.ajax({
            type: 'get',
            url: '/api/users/get-postcode-data',
            data: { postcode: postcode }
        })

        this.getPostcodePromise.then(
            data => {
                const get = ObjHelper.getIfExists
                const parsed = JSON.parse(data)
                this.setState({
                    postcodeAddresses: get(parsed, 'line1', null),
                    postcodeTown: get(parsed, 'town', null)
                })
            },
            xhr => console.error(xhr)
        )
    }

    renderPostcodeAddressSelect() {
        const { user } = this.props
        const { postcodeAddresses, postcodeTown } = this.state
        const get = ObjHelper.getIfExists

        if (!postcodeAddresses || postcodeAddresses.length === 0) {
            return ''
        }

        return (
            <div style={{ marginTop: '10px' }}>
                <select
                    className='form-control'
                    type='text'
                    name='profile.profileAddress'
                    onChange={e => {
                        this.onChange(e)
                        const town = ObjHelper.concatProps(postcodeTown, ' ')
                        if (town && town.length > 0) {
                            this.changeField('profile.city', town)
                        }
                    }}
                    value={get(user, 'profile.profileAddress', '')}
                >
                    <option value=''>Select address</option>
                    {
                        postcodeAddresses.map(
                            (address, i) => {
                                address = ObjHelper.concatProps(address, ' ')
                                return (
                                    <option key={i} value={address}>{address}</option>
                                )
                            }
                        )
                    }
                </select>
            </div>
        )
    }

    changeField(name, value) {
        var { user, onChange } = this.props
        var valueChanged = false
        ObjHelper.accessObjByPath(user, name, currValue => {
            if (currValue !== value)
                valueChanged = true
            return value
        })

        if (valueChanged && onChange) {
            onChange(user)
        }
    }

    nameFilter(value) {
        if (!value || value.length === 0) return value
        return value[0].toUpperCase() + value.slice(1).toLowerCase()
    }

    onChange(e, filter) {
        const { name, value } = e.target
        this.changeField(name, filter ? filter(value) : value)
    }

    loadHearPlaces() {
        $.ajax({
            type: 'get',
            url: '/api/hear-places/list',
            success: data => {
                this.setState({ hearPlaces: data })

                let { user } = this.props
                if (!user.hearPlaceId) return

                for (const i in data) {
                    if (data[i].value == user.hearPlaceId) {
                        if (data[i].isVisible) break

                        $('#otherHearPlaceInput').slideToggle('fast')
                        $('#otherHearPlaceInput input').val(data[i].label)
                        this.changeField('hearPlaceId', -1)
                        break
                    }
                }
            }
        })
    }

    componentDidMount() {
        DatePicker.init(this.changeField)
        this.loadHearPlaces()
    }

    render() {
        const { hearPlaces } = this.state
        const { user, excludePasswords } = this.props
        const get = ObjHelper.getIfExists
        const isset = val => typeof val !== 'undefined' && val !== null
        const colWidth = isset(this.props.colWidth) ? this.props.colWidth : 3
        const colOffset = isset(this.props.colOffset)  ? this.props.colOffset : 1

        return (
            <div>
                <Row>
                    <Col md={8}>
                        <Row style={{ margin: '0 0 10px 0' }}>
                            <Col md={6} xs={6} style={{ padding: '0 5px 0 0' }}>
                                <input
                                    className='form-control'
                                    type='text'
                                    name='profile.profileForname'
                                    onChange={e => this.onChange(e, this.nameFilter)}
                                    value={get(user, 'profile.profileForname', '')}
                                    placeholder='First Name'
                                />
                            </Col>

                            <Col md={6} xs={6} style={{ padding: '0 0 0 5px', float: 'right' }}>
                                <input
                                    className='form-control'
                                    type='text'
                                    name='profile.profileSurname'
                                    onChange={e => this.onChange(e, this.nameFilter)}
                                    value={get(user, 'profile.profileSurname', '')}
                                    placeholder='Last Name'
                                />
                            </Col>
                        </Row>

                        <Row style={{ margin: '0 0 10px 0' }}>
                            <input
                                className='form-control'
                                type='email'
                                name='userEmailAddress'
                                onChange={this.onChange}
                                value={get(user, 'userEmailAddress', '')}
                                placeholder='Email'
                                style={{ width: '100%' }}
                            />
                        </Row>

                        <Row style={{ margin: '0 0 10px 0' }}>
                            <Col md={6} xs={6} style={{ padding: '0 5px 0 0' }}>
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

                            <Col md={6} xs={6} style={{ padding: '0 0 0 5px', float: 'right' }}>
                                <input
                                    className='form-control datepicker'
                                    name='age'
                                    value={get(user, 'age', '')}
                                    onChange={this.onChange}
                                    placeholder='Birth date'
                                />
                            </Col>
                        </Row>

                        {!excludePasswords ?
                            <Row style={{ margin: '0 0 10px 0' }}>
                                <Col md={6} xs={6} style={{ padding: '0 5px 0 0' }}>
                                    <input
                                        className='form-control'
                                        type='password'
                                        name='userPassword'
                                        value={get(user, 'userPassword', '')}
                                        onChange={this.onChange}
                                        placeholder='Password'
                                    />
                                </Col>

                                <Col md={6} xs={6} style={{ padding: '0 0 0 5px', float: 'right' }}>
                                    <input
                                        className='form-control'
                                        type='password'
                                        name='userPasswordConfirm'
                                        value={get(user, 'userPasswordConfirm', '')}
                                        onChange={this.onChange}
                                        placeholder='Re-enter password'
                                    />
                                </Col>
                            </Row>
                            : ''
                        }

                        <Row style={{ margin: '0 0 10px 0' }}>
                            <Col md={6} xs={6} style={{ padding: '0 5px 0 0' }}>
                                <input
                                    className='form-control'
                                    type='text'
                                    name='profile.profileTelephone'
                                    value={get(user, 'profile.profileTelephone', '')}
                                    onChange={this.onChange}
                                    placeholder='Telephone'
                                />
                            </Col>

                            <Col md={6} xs={6} style={{ padding: '0 0 0 5px', float: 'right' }}>
                                <input
                                    className='form-control'
                                    type='text'
                                    name='profile.profileMobile'
                                    value={get(user, 'profile.profileMobile', '')}
                                    onChange={this.onChange}
                                    placeholder='Mobile'
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
                                value={get(user, 'profile.profilePostcode', '')}
                            />
                        </div>

                        <div style={{ marginBottom: '10px' }}>
                            <input
                                className='form-control'
                                type='text'
                                name='profile.profileAddress'
                                value={get(user, 'profile.profileAddress', '')}
                                onChange={this.onChange}
                                placeholder='Building name/No'
                            />
                        </div>

                        <div style={{ marginBottom: '10px' }}>
                            <input
                                className='form-control'
                                type='text'
                                name='profile.profileAddress2'
                                value={get(user, 'profile.profileAddress2', '')}
                                onChange={this.onChange}
                                placeholder='Street Name'
                            />
                        </div>

                        <div style={{ marginBottom: '10px' }}>
                            <input
                                className='form-control'
                                type='text'
                                name='profile.city'
                                value={get(user, 'profile.city', '')}
                                onChange={this.onChange}
                                placeholder='City or town'
                            />
                        </div>

                        <Row>
                            <Col md={12}>
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
                                    <option value=''>
                                        Where did {this.context.user && (this.context.user.id == user.id) ? 'you' : 'he/she'} hear about us?
                                    </option>
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

                        <Row style={{ marginTop: '10px', display: 'none' }}>
                            <Col md={12}>
                                <Button
                                    className='custom'
                                    onClick={() => this.setState({ showBranchSelector: !this.state.showBranchSelector })}
                                    style={{ width: '100%' }}
                                >
                                    Select Closest Branches
                                </Button>

                                <Panel style={{ width: '100%' }} collapsible expanded={this.state.showBranchSelector}>
                                </Panel>
                            </Col>
                        </Row>
                    </Col>

                    <Col md={4}>
                        <div>
                            <BranchSelector
                                name='closestBranches'
                                value={user.closestBranches}
                                label='Select Closest Branches'
                                onChange={e => this.onChange(e)}
                            />
                        </div>
                    </Col>
                </Row>
            </div>
        )
    }
}

ProfileForm.propTypes = {
    user: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    colWidth: PropTypes.number,
    colOffset: PropTypes.number,
    excludePasswords: PropTypes.bool
}

ProfileForm.contextTypes = {
    user: PropTypes.object.isRequired
}