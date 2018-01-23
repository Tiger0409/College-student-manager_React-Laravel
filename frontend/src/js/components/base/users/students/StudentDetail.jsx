import React, { Component, PropTypes } from 'react'
import User from './../../../../classes/User.js'
import { Button, Row, Col, Panel } from 'react-bootstrap'
import { ROLES } from './../../../../config/constants.js'
import FormGroup from './../../../common/FormGroup.jsx'
import CourseRegistrationHistory from './CourseRegistrationHistory.jsx'
import ObjHelper from './../../../../utils/ObjHelper.js'
import SourceSelect from './../../../common/SourceSelect.jsx'
import { LabeledValue, EditableValue, FormField, Select } from './../../../common/FormWidgets.jsx'
import DataLoader from '../../../common/DataLoader.jsx'
import RoleFilter from '../../../common/RoleFilter.jsx'
import QuickAddClass from './QuickAddClass.jsx'
import AddDonationWindow from './AddDonationWindow.jsx'
import Ph from '../../../../utils/PromiseHelper.js'
import { Link } from 'react-router'
import autosize from '../../../../libs/autosize.js'
import moment from 'moment'
import ChangePassWnd from './../ChangePassWnd.jsx'
import PostcodeSelect from '../../../common/PostcodeSelect.jsx'
import Notifier from '../../../../utils/Notifier.js'
import ConfirmDeleteWnd from '../../../common/ConfirmDeleteWnd.jsx'
import Spinner from '../../../common/Spinner.jsx'
import BranchSelector from '../../../common/BranchSelector.jsx'
import Dh from '../../../../utils/DateHelper.js'
import CopyUserWnd from './CopyUserWnd.jsx'
import Logs from '../../../superAdmin/Logs'
import PaymentsLog from './PaymentsLog'
import Sh from '../../../../utils/StringHelper'
class StudentDetail extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            user: props.data,
            showQuickAddClass: false,
            showAddDonation: false,
            newSerial :''
        }
        this.onToggle = this.onToggle.bind(this)
        this.onChange = this.onChange.bind(this)
        this.delete = this.delete.bind(this)
        this.eventController = $({})
    }

    onChange(user, optimisticUpdate, afterSave, delay) {
        if (typeof optimisticUpdate === 'undefined') {
            optimisticUpdate = true
        }

        if (optimisticUpdate) {
            this.setState({ user: user })
        }

        const { save } = this.props

        const get = ObjHelper.getIfExists
        user.userFullname = (get(user, 'profile.profileForname', '') + ' ' + get(user, 'profile.profileSurname', '')).trim()

        const callSave = () => {
            delete user.userPassword
            save({ data: user },
                newUser => {
                    this.setState({ user: newUser })
                    afterSave && afterSave(newUser)
                },
                error => {
                    console.error('test', error)
                    Notifier.error(error.responseText)
                }
            )
        }

        if (delay) {
            if (delay < 0) return

            if (this.saveTimeout) {
                clearTimeout(this.saveTimeout)
            }

            this.saveTimeout = setTimeout(callSave, delay)
        } else {
            callSave()
        }
    }

    delete(reason) {
        const { user } = this.state
        const { router } = this.context

        if (this.deletePromise) {
            return
        }

        this.deletePromise = Ph.ajax({
            type: 'delete',
            url: `/api/users/${user.id}`,
            data: { reason: reason }
        })

        this.deletePromise.then(
            () => {
                router.push('/users/role/students')
                Notifier.success('User deleted')
            },
            xhr => Notifier.error(xhr.responseText)
        )
    }

    onToggle(e) {
        const { value: stateProp } = e.target
        this.setState({ [stateProp]: !this.state[stateProp] })
    }

    render() {
        const { user, newSerial, showQuickAddClass, showAddDonation } = this.state
        return (

            <div>

                <div id="notifications"></div>

                <div className='content-block'>
                    <Detail user={user} newSerial={newSerial} onChange={this.onChange} onDelete={this.delete} />
                </div>

                <div className="content-block">
                    <CourseRegistrationHistory appTypeKey={this.props.appTypeKey} user={user} eventController={this.eventController} />
                    <div style={{ float: window.innerWidth < 768 ? 'none' : 'right', marginTop: '10px' }}>
                        <Button
                            bsStyle='success'
                            className='custom'
                            style={{ marginRight: '20px', marginBottom: 10 }}
                            value='showAddDonation'
                            onClick={this.onToggle}
                        >
                            Add Donation
                        </Button>
                        <Button
                            bsStyle='success'
                            value='showQuickAddClass'
                            style={{ marginBottom: 10 }}
                            onClick={this.onToggle}
                            className='custom'
                        >
                            Add Class
                        </Button>
                    </div>

                    <div style={{ marginTop: '60px' }}>
                        <Panel style={{ border: '0' }} collapsible expanded={showQuickAddClass}>
                            <QuickAddClass
                                id={user.id}
                                onBasketUpdate={() => this.eventController.trigger('basketUpdate')}
                            />
                        </Panel>
                    </div>

                    <AddDonationWindow
                        show={showAddDonation}
                        userId={user.id}
                        onClose={() => this.setState({ showAddDonation: false })}
                        style={{
                            height: '300px',
                            overflowY: 'auto'
                        }}
                    />
                </div>

                <UserLogs appTypeKey={this.props.appTypeKey} id={user.id} />

                <PaymentsLog appTypeKey={this.props.appTypeKey}  params={{ userId: user.id }} />
            </div>
        )
    }
}

StudentDetail.contextTypes = {
    router: PropTypes.object.isRequired
}

let detailStyles = {
    detailButton: { marginLeft: 10, marginRight: 10 },
    buttonWrapper: { float: 'right', marginTop: '20px', marginBottom: '20px' }
}

if (window.innerWidth < 1024) {
    detailStyles = {
        detailButton: { marginLeft: 10, marginRight: 10 },
        buttonWrapper: { marginTop: '20px', marginBottom: '20px' }
    }   
}

if (window.innerWidth < 768) {
    detailStyles = {
        detailButton: { marginLeft: 10, marginRight: 10, marginBottom: 10 },
        buttonWrapper: { marginTop: '20px', marginBottom: '20px' }
    }   
}

class Detail extends React.Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            relativesSearchQuery: '',
            showResults: false,
            searchResults: null,
            searchBarFocused: false,
            possibleRelatives: null,
            user: props.user,
            newSerial : props.newSerial,
            deleteableSerial : "",
            showConfirmDelete: false,
            showConfirmDeleteSerial: false,
            showCopyUserWnd: false,
            hearPlaces: null,
            isLoading: true,
        }
        this.relativesResultsPromise = null
        this.possibleRelativesPromise = null
        this.onQueryChange = this.onQueryChange.bind(this)
        this.onFocus = this.onFocus.bind(this)
        this.onBlur = this.onBlur.bind(this)
        this.onRelativeSelect = this.onRelativeSelect.bind(this)
        this.onFieldChange = this.onFieldChange.bind(this)
        this.onChange = this.onChange.bind(this)
        this.onTextChange = this.onTextChange.bind(this)
        this.onOff = this.onOff.bind(this)
        this.addSerial = this.addSerial.bind(this)
        this.deleteSerial = this.deleteSerial.bind(this)
        this.deleteSerialConform = this.deleteSerialConform.bind(this)
    }

    onRelativeSelect(id) {
        let { user } = this.state
        const { onChange } = this.props

        if (!user.relatives) {
            user.relatives = []
        }

        user.relatives.push(id)

        $.ajax({
            type: 'post',
            url: `/api/users/${user.id}/add-relative/${id}`,
            success: () => {
                onChange(user, false, newUser => {
                    user.relatives = newUser.relatives
                    this.setState({ user: user })
                })
            },
            error: xhr => {
                Notifier.error('Error adding relative')
                console.error(xhr)
            }
        })
    }

    onRelativeRemove(id) {
        let { user } = this.state
        const { onChange } = this.props

        if (!user.relatives) {
            return
        }

        for (let i = 0; i < user.relatives.length; i++) {
            if (user.relatives[i].id == id) {
                user.relatives[i].isDeleted = true
                break
            }
        }

        this.setState({ user: user })

        $.ajax({
            type: 'delete',
            url: `/api/users/${user.id}/remove-relative/${id}`,
            success: () => onChange(user),
            error: xhr => {
                Notifier.error('Error removing relative')
                console.error(xhr)
            }
        })
    }

    onQueryChange(e) {
        const { value: newQuery } = e.target
        const { possibleRelatives, searchBarFocused, user } = this.state

        this.setState({ relativesSearchQuery: newQuery, searchResults: null })

        if (!possibleRelatives || possibleRelatives.length === 0) {
            this.setState({ showResults: false })
        }

        if (this.relativesResultsPromise) {
            this.relativesResultsPromise.cancel()
        }

        if (newQuery && newQuery.length > 0) {
            this.relativesResultsPromise = Ph.ajax({
                type: 'get',
                url: '/api/users/find-relatives',
                data: { query: newQuery, excludeUserId: user.id }
            })


            this.relativesResultsPromise.then(
                results => {
                    this.setState({ searchResults: results })

                    const count = array => array ? array.length : 0

                    if (searchBarFocused && count(results) + count(possibleRelatives) > 0) {
                        this.setState({ showResults: true })
                    }

                    this.relativesResultsPromise = null
                },
                xhr => {
                    console.error(xhr)
                    this.relativesResultsPromise = null
                }
            )
        }
    }

    onFocus() {
        const { searchResults, possibleRelatives } = this.state

        this.setState({ searchBarFocused: true })

        const getCount = array => array ? array.length : 0

        if (getCount(searchResults) + getCount(possibleRelatives) > 0) {
            this.setState({ showResults: true })
        }
    }

    onBlur() {
        this.setState({ showResults: false, searchBarFocused: false })
    }

    loadPossibleRelatives() {
        const { user } = this.state

        this.possibleRelativesPromise = Ph.ajax({
            type: 'get',
            url: '/api/users/find-relatives',
            data: {
                postcode: ObjHelper.getIfExists(user, 'profile.profilePostcode', ''),
                excludeUserId: user.id
            }
        })

        this.possibleRelativesPromise.then(
            results => this.setState({ possibleRelatives: results }),
            xhr => console.error(xhr.responseText)
        )
    }

    loadHearPlaces() {
        $.ajax({
            type: 'get',
            url: '/api/hear-places/list',
            success: data => {
                this.setState({ hearPlaces: data, isLoading: false })

                let { user } = this.state
                for (const i in data) {
                    if (data[i].value == user.hearPlaceId) {
                        if (data[i].isVisible) break

                        $('#otherHearPlaceInput').slideToggle('fast')
                        $('#otherHearPlaceInput input').val(data[i].label)
                        user.hearPlaceId = -1
                        this.setState({ user: user })
                        break
                    }
                }
            }
        })
    }

    componentDidMount() {
        $(() => {
            autosize($('textarea'))
        })

        this.loadPossibleRelatives()
        this.loadHearPlaces()
    }

    renderRelatives() {
        const { relatives } = this.state.user

        if (!relatives) {
            return ''
        }

        let items = []

        for (let i = 0; i < relatives.length; i++) {
            if (relatives[i].isDeleted) continue

            const relatedUser = relatives[i]

            items.push(
                <div key={i}>
                    <Link to={`/users/${relatedUser.id}`}>{relatedUser.userFullname}</Link>
                    <a
                        style={{ display: 'inline-block', marginLeft: '15px', cursor: 'pointer' }}
                        onClick={e => { e.preventDefault(); this.onRelativeRemove(relatedUser.id) }}
                    >
                        (remove)
                    </a>
                </div>
            )
        }

        if (items.length === 0) {
            return ''
        }

        return (
            <Col md={4}>
                <div>
                    <p className='detail-field-label'>Relatives</p>
                    <div>
                        {items}
                    </div>
                </div>
            </Col>
        )
    }
    onOff(e){
        e.preventDefault();
        var { user } = this.state
        // console.log(user.profile)
        const { classId } = this.props
        const { classRegOpen } = this.state

        let complete = user.profile.complete == 'yes' ? 'no' : 'yes';
        this.state.user.profile.complete = complete
        this.setState({ user: user })
        let id = user.id
        $.ajax({
            type: 'put',
            url: `/api/users/${id}`,
            data: { data: user},
            success: () => Notifier.success('Saved Successfuly'),
            error: xhr => { Notifier.error('save failed'); console.log(xhr) }
        })
    }
    addSerial(e){
        e.preventDefault();
        var { user ,newSerial} = this.state
        var { onChange } = this.props
        user.serialNumber += `,${newSerial}`;
        let serialNumbers = user.serialNumber.split(',');
        for (let i = 0;i<serialNumbers.length;i++){
            if (serialNumbers[i]==""){
                serialNumbers.splice(i, 1);
            }
        }
        user.serialNumber = serialNumbers.join(',');
        this.setState({user : user,newSerial : ''});
        onChange(user, true, null,null)
    }
    deleteSerialConform(e){
        e.preventDefault();
        let {showConfirmDeleteSerial,deleteableSerial} = this.state
        deleteableSerial = e.target.id,
        this.setState({
            showConfirmDeleteSerial : true,
            deleteableSerial : deleteableSerial
        })
    }
    deleteSerial(){
        var { user ,deleteableSerial} = this.state
        var { onChange } = this.props
        let serialNumbers = user.serialNumber.split(',');
        serialNumbers.splice(serialNumbers.indexOf(deleteableSerial), 1);
        for (let i = 0;i<serialNumbers.length;i++){
            if (serialNumbers[i]==""){
                serialNumbers.splice(i, 1);
            }
        }
        user.serialNumber = serialNumbers.join(',');
        this.setState({user : user,deleteableSerial:''});
        onChange(user, true, null,null)
    }
    render() {
        var { user ,newSerial} = this.state
        let serialNumber = []
        if (user.serialNumber !== null){
            serialNumber = user.serialNumber.split(',');
            for (let i = 0;i<serialNumber.length;i++){
                if (serialNumber[i]==""){
                    serialNumber.splice(i, 1);
                }
            }
        }
        const {
            relativesSearchQuery,
            showResults,
            searchResults,
            possibleRelatives,
            showChangePass,
            showConfirmDelete,
            showCopyUserWnd,
            hearPlaces,
            isLoading,
            showConfirmDeleteSerial
        } = this.state
        const get = ObjHelper.getIfExists

        const dateFormats = [
            //"MM-DD-YYYY",
            "DD-MM-YYYY",
            //"MM/DD/YYYY",
            "DD/MM/YYYY",
            "YYYY-MM-DD",
            "YYYY-MM-DD",
            "YYYY/DD/MM",
            "YYYY/DD/MM",
        ]

        return (
            <div>
                <ChangePassWnd
                    show={showChangePass}
                    userId={user.id}
                    onClose={() => this.setState({ showChangePass: false })}
                />

                <ConfirmDeleteWnd
                    show={showConfirmDelete}
                    onConfirm={this.props.onDelete}
                    onClose={() => this.setState({ showConfirmDelete: false })}
                />

                <ConfirmDeleteWnd
                    show={showConfirmDeleteSerial}
                    onConfirm={this.deleteSerial}
                    noReason="true"
                    onClose={() => this.setState({ showConfirmDeleteSerial: false })}
                />

                <CopyUserWnd
                    show={showCopyUserWnd}
                    originUserId={user.id}
                    onCopy={userId => this.context.router.push(`/users/${userId}`)}
                    onClose={() => this.setState({ showCopyUserWnd: false })}
                />

                <h2 className='block-heading'>
                    Student Detail
                </h2>

                <div style={detailStyles.buttonWrapper}>
                    <Button
                        style={detailStyles.detailButton}
                        onClick={() => this.setState({ showChangePass: true })}
                    >
                        Change password
                    </Button>

                    <Button
                        style={detailStyles.detailButton}
                        onClick={() => { this.setState({ showConfirmDelete: true }) }}
                    >
                        Delete user
                    </Button>

                    <Button
                        style={detailStyles.detailButton}
                        onClick={() => { this.setState({ showCopyUserWnd: true }) }}
                    >
                        Create Copy
                    </Button>
                    <Button
                        onClick={e=>{this.onOff(e)}}
                        style={detailStyles.detailButton}
                        bsStyle={user.profile.complete == 'yes' ? 'success' : 'danger'}
                    >
                        Profile Complete
                    </Button>
                    <p className="detail-field-label" style={{ display: 'inline', marginRight: '15px' }}>
                    Unique id
                    </p>
                    <p className="detail-field-value" style={{ display: 'inline' }}>
                        {user.userUniqueId}
                    </p>
                </div>

                <hr/>

                <Row>
                    <Col md={7}>
                        <Row>
                            <Col md={12}>
                                <EditableValue
                                    label='Email Address'
                                    value={user.userEmailAddress}
                                    rawHTML={true}
                                    onFieldChange={this.onFieldChange}>
                                    <input type='text' name='userEmailAddress' className="form-control" />
                                </EditableValue>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={3}>
                                <EditableValue
                                    label='Forname'
                                    value={user.profile.profileForname}
                                    rawHTML={true}
                                    onFieldChange={this.onFieldChange}>
                                    <input type='text' name='profile.profileForname' className="form-control" />
                                </EditableValue>
                            </Col>

                            <Col md={3} mdOffset={1}>
                                <EditableValue
                                    label='Surname'
                                    value={user.profile.profileSurname}
                                    rawHTML={true}
                                    onFieldChange={this.onFieldChange}>
                                    <input type='text' name='profile.profileSurname' className="form-control"/>
                                </EditableValue>
                            </Col>
                        </Row>

                        <Row style={{ marginBottom: '15px' }}>
                            <Col md={7}>
                                <p className="detail-field-label">Postcode</p>

                                <PostcodeSelect
                                    value={user.profile.profilePostcode}
                                    onSelect={item => {
                                        const get = value => value ? value : ''
                                        this.onFieldChange('profile.profileAddress', get(item.line1))
                                        this.onFieldChange('profile.profileAddress2', get(item.line2), true)
                                        this.onFieldChange('profile.profilePostcode', get(item.postcode))
                                        this.onFieldChange('profile.city', get(item.town))
                                    }}
                                />
                            </Col>
                        </Row>

                        <Row>
                            <Col md={4}>
                                <p className="detail-field-label">Addresses</p>
                                
                                <EditableValue
                                    value={user.profile.profileAddress}
                                    rawHTML={true}
                                    onFieldChange={this.onFieldChange}
                                    noValueText="Address line 1"
                                    enableExternalUpdates
                                >
                                    <input type='text' name='profile.profileAddress' className='form-control' />
                                </EditableValue>

                                <EditableValue
                                    value={user.profile.profileAddress2}
                                    rawHTML={true}
                                    onFieldChange={this.onFieldChange}
                                    noValueText="Address line 2"
                                    enableExternalUpdates
                                >
                                    <input type='text' name='profile.profileAddress2' className="form-control" />
                                </EditableValue>
                            </Col>

                            <Col md={3}>
                                <p className="detail-field-label">City</p>

                                <EditableValue
                                    value={user.profile.city}
                                    rawHTML={true}
                                    onFieldChange={this.onFieldChange}
                                    noValueText="Address line 1"
                                    enableExternalUpdates
                                >
                                    <input type='text' name='profile.city' className='form-control' />
                                </EditableValue>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={3}>
                                <EditableValue
                                    label='Male/female'
                                    value={user.profile.profileGender}
                                    rawHTML={true}
                                    onFieldChange={this.onFieldChange}>
                                    <select
                                        className='form-control'
                                        name='profile.profileGender'
                                        id='profile.profileGender'>
                                        <option value='male'>Male</option>
                                        <option value='female'>Female</option>
                                    </select>
                                </EditableValue>
                            </Col>

                            <Col md={4} mdOffset={1}>
                                <EditableValue
                                    label='Age'
                                    value={user.age}
                                    valueView={
                                        value => Dh.years(value)
                                    }
                                    formatValue={value => {
                                        return moment(value, dateFormats).format('DD-MM-YYYY')}
                                    }
                                    rawHTML={true}
                                    onFieldChange={this.onFieldChange}
                                >
                                    <input name='age' className="form-control" />
                                </EditableValue>
                            </Col>

                            <Col md={3}>
                                <EditableValue
                                    label='Status'
                                    value={user.userStatus}
                                    onFieldChange={this.onFieldChange}>
                                    <SourceSelect
                                        url='/api/users/get-user-status-enum'
                                        className='form-control'
                                        name='userStatus'
                                        id='userStatus'
                                    >
                                    </SourceSelect>
                                </EditableValue>
                            </Col>
                        </Row>

                        <Row>
                            {this.renderRelatives()}

                            <Col md={4}>
                                {/*<EditableValue*/}
                                    {/*label='Serial Number'*/}
                                    {/*value={user.serialNumber}*/}
                                    {/*rawHTML={true}*/}
                                    {/*onFieldChange={this.onFieldChange}*/}
                                    {/*noValueText="Serial Number"*/}
                                {/*>*/}
                                    {/*<input type='text' name='serialNumber' className="form-control" />*/}
                                {/*</EditableValue>*/}
                                <Row>
                                    <Col md={12}>
                                        <p className='detail-field-label'>Serial Numbers</p>
                                        <Row style={{ margin: 0 }}>
                                            <Col xs={9} style={{ padding:0 }}>
                                                <input type='text' name='serialNumber' value={newSerial} onChange={e=>{
                                                    e.preventDefault;
                                                    this.setState({newSerial : e.target.value})
                                                }} className="form-control" />
                                            </Col>
                                            <Col xs={3} style={{ padding:0 }}>
                                                <input type="button" className="btn btn-success" style={{ width: '100%' }} value='Add' onClick={this.addSerial}/>
                                            </Col>
                                        </Row>
                                    </Col>
                                    
                                    <Col md={12}>
                                    {

                                        serialNumber.map(
                                            number=>
                                            number=="" ?<div className="row"></div> :
                                                <div className="row">
                                                    <Col md={2}>
                                                        <span onClick={this.deleteSerialConform} style={{marginTop:"13px",color:'red',cursor:'pointer'}} id={number} className="glyphicon glyphicon-remove" aria-hidden="true"></span>
                                                    </Col>
                                                    <Col md={9} style={{paddingTop:'8px'}}>
                                                        <p name='serialNumber' className="detail-field-value highlighted">{number}</p>
                                                    </Col>
                                                </div>
                                        )
                                    }
                                    </Col>
                                </Row>
                            </Col>
                            <FormField label='Add relative' width={6}>
                                <input
                                    type='text'
                                    className='form-control'
                                    name='relativesSearchQuery'
                                    onChange={this.onQueryChange}
                                    onFocus={this.onFocus}
                                    onBlur={this.onBlur}
                                    value={relativesSearchQuery}
                                />
                                <SearchResults
                                    isShown={showResults}
                                    data={{ possibleRelatives: possibleRelatives, searchResults: searchResults }}
                                    query={relativesSearchQuery}
                                    onClick={this.onRelativeSelect}
                                />
                            </FormField>
                        </Row>
                    </Col>

                    <Col md={5}>
                        <div style={{ marginBottom: '25px' }}>
                            <p style={{ display: 'inline-block' }} className="detail-field-label">Student Notes</p>
                            <img
                                src="src/images/admin/pencil.png"
                                style={{
                                    display: 'inline-block',
                                    marginBottom: '4.5px',
                                    marginLeft: '4px'
                                }}
                            />
                            <textarea
                                rows="2"
                                id='studentNotes'
                                name='profile.studentNotes'
                                className="form-control"
                                onChange={this.onTextChange}
                                value={user.profile.studentNotes}
                            ></textarea>
                        </div>

                        <div style={{ marginBottom: '25px' }}>
                            <p style={{ display: 'inline-block' }} className="detail-field-label">Teacher Notes</p>
                            <img
                                src="src/images/admin/pencil.png"
                                style={{
                                    display: 'inline-block',
                                    marginBottom: '4.5px',
                                    marginLeft: '4px'
                                }}
                                />
                            <textarea
                                rows="2"
                                id='studentNotes'
                                name='profile.teacherNotes'
                                className="form-control"
                                onChange={this.onTextChange}
                                value={user.profile.teacherNotes}
                                ></textarea>
                        </div>
                        <div style={{ marginBottom: '25px' }}>
                            <p className="detail-field-label">PRIMARY CONTACT</p>
                            <div style={{ marginBottom: '-15px' }}>
                                <EditableValue
                                    value={user.profile.profileMobile}
                                    rawHTML={true}
                                    onFieldChange={this.onFieldChange}
                                    noValueText="Mobile Number"
                                >
                                    <input type='text' name='profile.profileMobile' className='form-control' />
                                </EditableValue>
                            </div>
                            <div style={{ marginBottom: '-15px' }}>
                                <EditableValue
                                    value={user.profile.profileTelephone}
                                    rawHTML={true}
                                    onFieldChange={this.onFieldChange}
                                    noValueText="Landline Number"
                                >
                                    <input type='text' name='profile.profileTelephone' className="form-control" />
                                </EditableValue>
                            </div>
                            <div style={{ marginBottom: '-15px' }}>
                                <EditableValue
                                    value={user.profile.parentName}
                                    rawHTML={true}
                                    onFieldChange={this.onFieldChange}
                                    noValueText="Parent Name"
                                >
                                    <input type='text' name='profile.parentName' className="form-control" />
                                </EditableValue>
                            </div>
                        </div>

                        <div style={{ marginBottom: '59px' }}>
                            <p className="detail-field-label">SECONDARY CONTACT</p>

                            <div style={{ marginBottom: '-15px' }}>
                                <EditableValue
                                    value={user.profile.emergencyContact_1Name}
                                    rawHTML={true}
                                    onFieldChange={this.onFieldChange}
                                    noValueText="Name"
                                >
                                    <input type='text' name='profile.emergencyContact_1Name' className="form-control" />
                                </EditableValue>
                            </div>

                            <div style={{ marginBottom: '-15px' }}>
                                <EditableValue
                                    value={user.profile.emergencyContact_1Address}
                                    rawHTML={true}
                                    onFieldChange={this.onFieldChange}
                                    noValueText="Address"
                                >
                                    <input type='text' name='profile.emergencyContact_1Address' className="form-control" />
                                </EditableValue>
                            </div>

                            <div style={{ marginBottom: '-15px' }}>
                                <EditableValue
                                    value={user.profile.emergencyContact_1Contact}
                                    rawHTML={true}
                                    onFieldChange={this.onFieldChange}
                                    noValueText="Number"
                                >
                                    <input type='text' name='profile.emergencyContact_1Contact' className="form-control" />
                                </EditableValue>
                            </div>
                        </div>
                        <div style={{ marginBottom: '59px' }}>
                            <p className="detail-field-label">EMERGENCY CONTACT</p>
                            <div style={{ marginBottom: '-15px' }}>
                                <EditableValue
                                    value={user.profile.emergencyContact_2Name}
                                    rawHTML={true}
                                    onFieldChange={this.onFieldChange}
                                    noValueText="Name"
                                >
                                    <input type='text' name='profile.emergencyContact_2Name' className="form-control" />
                                </EditableValue>
                            </div>

                            <div style={{ marginBottom: '-15px' }}>
                                <EditableValue
                                    value={user.profile.emergencyContact_2Address}
                                    rawHTML={true}
                                    onFieldChange={this.onFieldChange}
                                    noValueText="Address"
                                >
                                    <input type='text' name='profile.emergencyContact_2Address' className="form-control" />
                                </EditableValue>
                            </div>

                            <div style={{ marginBottom: '-15px' }}>
                                <EditableValue
                                    value={user.profile.emergencyContact_2Contact}
                                    rawHTML={true}
                                    onFieldChange={this.onFieldChange}
                                    noValueText="Number"
                                >
                                    <input type='text' name='profile.emergencyContact_2Contact' className="form-control" />
                                </EditableValue>
                            </div>
                        </div>

                        <div>
                            <p className='detail-field-label'>
                                {`Where ${get(user, 'profile.profileGender', 'male') == 'male' ? 'he' : 'she' } heard about us`}
                            </p>

                            <Select
                                name='hearPlaceId'
                                options={hearPlaces ? hearPlaces.filter(item => item.isVisible) : []}
                                className='form-control'
                                style={{ width: '190px' }}
                                value={user.hearPlaceId}
                                onChange={e => {
                                    const { value: newValue } = e.target
                                    if ((get(user, 'hearPlaceId', '') == '-1') != (newValue == '-1')) {
                                        $('#otherHearPlaceInput').slideToggle('fast')
                                    }

                                    this.onChange(e, 3000)
                                }}
                            />
                        </div>

                        <div id='otherHearPlaceInput' style={{ display: 'none' }}>
                            <input
                                type='text'
                                className='form-control'
                                name='otherHearPlace'
                                onChange={e => this.onChange(e, 3000)}
                                style={{ width: '190px' }}
                            />
                        </div>
                        <Row style={{marginTop : "25px"}}>
                            <Col md={6} style={{height:"80px"}}>
                                <p className="detail-field-label">School</p>
                                <EditableValue
                                    value={user.profile.school}
                                    rawHTML={true}
                                    onFieldChange={this.onFieldChange}
                                    noValueText="School"
                                >
                                    <input type='text' name='profile.school' className="form-control" />
                                </EditableValue>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                <Row>
                    <Col md={6}>
                        <BranchSelector
                            name='closestBranches'
                            value={user.closestBranches}
                            label='Closest Branches'
                            onChange={e => this.onChange(e, -1)}
                        />
                    </Col>

                    {user.complaints && user.complaints.length > 0 ?
                        <Col md={6}>
                            <p className='detail-field-label'>Complaints</p>

                            <ul>
                                {user.complaints.map(complaint => (
                                    <li><Link to={`/complaints/${complaint.id}`}>
                                        {
                                            [
                                                complaint.type,
                                                complaint.createdAt.split(' ')[0],
                                                Sh.removeHtml(complaint.text.length > 30 ?
                                                    complaint.text.slice(0, 30) + '...' : complaint.text
                                                )
                                            ].join(' ')
                                        }
                                    </Link></li>
                                ))}
                            </ul>
                        </Col> : ''
                    }

                </Row>

                <Button
                    className='custom btn-success'
                    onClick={() => {
                        this.setState({ showBranchSelector: false })
                        this.props.onChange(user, true, null)
                    }}
                >
                    Save
                </Button>
            </div>
        )
    }

    onFieldChange(name, value, delay) {
        var { user } = this.state
        var { onChange } = this.props
        var valueChanged = false
        ObjHelper.accessObjByPath(user, name, currValue => {
            if (currValue !== value) {
                valueChanged = true
            }

            return value
        })

        if (valueChanged && onChange) {
            onChange(user, true, null, delay)
        }
    }

    onChange(e, delay) {
        const { name, value } = e.target
        this.onFieldChange(name, value, delay)
    }

    onTextChange(e) {
        const { onChange } = this.props
        const { name, value } = e.target
        let user = Object.assign({}, this.state.user)
        var valueChanged = false
        ObjHelper.accessObjByPath(user, name, (currValue) => {
            if (currValue !== value) {
                valueChanged = true
            }

            return value
        })
        this.setState({ user: user })

        if (this.updateTimeout) clearTimeout(this.updateTimeout)
        this.updateTimeout = setTimeout(() => {
            if (valueChanged && onChange) {
                onChange(user)
            }
        }, 5000)
    }
}

Detail.contextTypes = {
    router: PropTypes.object.isRequired
}

const AttendanceWrapper = DataLoader(
    class extends Component {
        constructor(props, context) {
            super(props, context)
        }

        render() {
            const { data: info } = this.props

            return (
                <div>
                    <h2>Student attendance</h2>
                    <Row>
                        <Col md={3}>
                            <LabeledValue label='Attended' value={info.attended} />
                        </Col>
                    </Row>
                    <Row>
                        <Col md={3}>
                            <LabeledValue label='Absent' value={info.absentDays} />
                        </Col>
                    </Row>
                    <Row>
                        <Col md={3}>
                            <LabeledValue
                                label='Absent in the last two weeks'
                                value={info.absentDaysInTwoWeeks}
                            />
                        </Col>
                    </Row>
                </div>
            )
        }
    }
)

const Attendance = ({ id }) => (
    <AttendanceWrapper
        ajaxOperations={{ load: { type: 'get', url: `/api/users/${id}/attendance` } }}
    />
)

const MainWrapper = RoleFilter(DataLoader(StudentDetail), [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.REGISTRAR])

export default props => (
    <MainWrapper
        ajaxOperations={{
            load: { type: 'get', url: `/api/users/${props.id}` },
            save: { type: 'put', url: `/api/users/${props.id}` }
        }}
        {...props}
    />
)

class SearchResults extends Component {
    constructor(props, context) {
        super(props, context)
        this.textStyle = {
            width: '90%',
            paddingLeft: '10%',
            textAlign: 'center',
            wordBreak: 'break-word'
        }
        this.id = 'relativesSearch'
        this.onClick = this.onClick.bind(this)
    }

    onClick(e) {
        this.props.onClick(e.target.value)
    }

    getRowsCount() {
        const { data } = this.props
        return data.searchResults ? data.searchResults.length : 0
    }

    componentDidMount() {
        $(() => {
            this.$searchResults = $('#' + this.id)
        })
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.isShown !== nextProps.isShown) {
            this.$searchResults.slideToggle('500')
        }
    }

    renderList(label, rows) {
        if (!rows || rows.length === 0) {
            return ''
        }

        var style = {
            wordBreak: 'break-word',
            width: '90%'
        }


        let listItems = []

        for (let i = 0; i < rows.length; i++) {
            if (i === 500) {
                break
            }

            listItems.push(
                <li
                    key={i}
                    value={rows[i].id}
                    onClick={this.onClick}
                    className='highlighted'
                    style={style}
                >
                    {rows[i].userData}
                </li>
            )
        }

        return (
            <div>
                {label && label.length > 0 ?
                    <p>{label}</p> : ''
                }

                <ul>
                    {listItems}
                </ul>
            </div>
        )
    }

    renderResults() {
        const { query, data: { possibleRelatives, searchResults } } = this.props

        const count = this.getRowsCount()

        return (
            <div>

                {searchResults ?
                    <div>
                        <h5 style={this.textStyle}>
                            Search results for "{query}"
                        </h5>

                        <h4 style={this.textStyle}>
                            Found {count} records
                            {count > 500 ? (<p><br/> Showing first 500+</p>) : ''}
                        </h4>
                    </div> : ''
                }

                {!searchResults || searchResults.length == 0 ?
                    this.renderList('Possible relatives', possibleRelatives) : ''}

                {this.renderList('Found records', searchResults)}
            </div>
        )
    }

    render() {
        return (
            <div
                style={{
                    display: 'none',
                    width: '92%',
                    height: '300px',
                    position: 'absolute',
                    zIndex: '2',
                    border: '1px solid #A9A9A9',
                    borderWidth: '0 1px 1px 1px',
                    WebkitBoxShadow: '5px 5px 5px rgba(0, 0, 0, 0.3)',
                    MozBoxShadow: '5px 5px 5px rgba(0, 0, 0, 0.3)',
                    boxShadow: '5px 5px 5px rgba(0, 0, 0, 0.3)',
                    backgroundColor: '#fff',
                    overflow: 'auto'
                }}
                id={this.id}
            >
                {this.renderResults()}
            </div>
        )
    }
}

SearchResults.contextTypes = {
    router: PropTypes.object.isRequired
}

const UserLogs = props => <Logs appTypeKey={props.appTypeKey} params={{ userId: props.id }} noFilterForm />