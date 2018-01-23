import React, { Component, PropTypes } from 'react'
import { Button, Row, Col } from 'react-bootstrap'
import FormGroup from './../../../common/FormGroup.jsx'
import SourceSelect from './../../../common/SourceSelect.jsx'
import $ from 'jquery'
import _ from 'underscore'
import CheckedListBox from './../../../common/CheckedListBox.jsx'
import Term from '../../../../classes/Term.js'
import BranchSelector from '../../../common/BranchSelector.jsx'
import { DatePicker } from '../../../common/FormWidgets.jsx'
import MergeBranch from './MergeBranch.jsx'

let styles = {
    mergeBranchWrapper: { marginLeft: '20px', display: 'inline-block' }
}

if (window.innerWidth < 768) {
    styles = {}
}

export default class StudentSearchForm extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            filters: {
                genderSelect: 'All',
                coursesCount: '',
                postcodeBeginning: '',
                city: '',
                advancedSearch: false,
                fromTerm: 'All',
                ageFrom : 4,
                departmentsMode: 'include',
                departmentsSelect: [],
                courseSelect: null,
                courseClassSelect: null,
                invoiceId: '',
                transactionBetweenStart: '',
                transactionBetweenEnd: '',
                gradeBetweenStart: '',
                gradeBetweenEnd: '',
                currentTermActivePaid: false,
                notCurrentTermActivePaid: false,
                paymentStatusSelect: 'All',
                regStatusSelect: 'All',
                paymentMethodSelect: 'All',
                employmentTypeSelect: 'All',
                amountBetweenStart: '',
                amountBetweenEnd: '',
                branches: [],
                linkedBranches: [],
                withCartItems: false
            }
        }
        this.promises = {}
        this.handleFieldChange = this.handleFieldChange.bind(this)
        this.submitFilters = this.submitFilters.bind(this)
        this.changeFilters = this.changeFilters.bind(this)
    }

    changeFilters(name, value) {
        let { filters } = this.state
        filters[name] = value
        this.setState({ filters: filters })
    }

    updateDatePickers() {
        DatePicker.init(this.changeFilters)
    }

    componentDidMount() {
        $(() => {
            this.$advancedSearchObj = $('#onAdvancedSearch')
            this.$departmentsSelect = $('#departmentsSelect')
            this.$activePaidCheckBoxes = $('#activePaidCheckBoxes input[type="checkbox"]')
            this.$regPaymentStatusesObj = $('#regPaymentStatuses')
        })

        this.promises['activeTerm'] = Term.getActive(
            term => {
                let { filters } = this.state
                filters.fromTerm = term.id
                this.setState({ filters: filters })
            }
        )

        this.updateDatePickers()
    }

    componentDidUpdate() {
        this.updateDatePickers()
    }

    componenWillUnmount() {
        for (const key in this.promises) {
            if (this.promises[key]) this.promises[key].cancel()
        }
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (this.context.branchId != nextContext.branchId) {
            var { filters } = this.state
            filters.courseSelect = null
            filters.courseClassSelect = null
            filters.departmentsSelect = []
            this.setState({ filters: filters })
        }
    }

    render() {
        const { branchId } = this.context
        const { filters } = this.state

        return (
            <div>
                <h2 className='block-heading'>Filters</h2>
                <hr />

                <form method='post' id='searchForm' onSubmit={this.submitFilters}>
                    <Row>
                        <Col md={5}>
                            <FormGroup>
                                <label htmlFor='genderSelect'>Gender</label>
                                <select
                                    className='form-control'
                                    name='genderSelect'
                                    id='genderSelect'
                                    value={this.state.filters.genderSelect}
                                    onChange={this.handleFieldChange}>
                                    <option value='All'>All</option>
                                    <option value='Male'>Male</option>
                                    <option value='Female'>Female</option>
                                </select>
                            </FormGroup>

                            <FormGroup>
                                <label htmlFor='coursesCount'>Users with x number of courses</label>
                                <input
                                    className='form-control'
                                    type='text'
                                    name='coursesCount'
                                    id='coursesCount'
                                    value={this.state.filters.coursesCount}
                                    onChange={this.handleFieldChange}/>
                            </FormGroup>
                        </Col>
                        <Col md={5} mdOffset={2}>
                            <FormGroup>
                                <label htmlFor="age">User Age from {filters.ageFrom ? filters.ageFrom : 4} to {filters.ageTo  ? filters.ageTo : 80}</label>
                                <input
                                    type="range"
                                    className="form-control"
                                    id="ageFrom"
                                    name="ageFrom"
                                    min={4}
                                    max={80}
                                    value={filters.ageFrom ? filters.ageFrom : 4}
                                    onChange={this.handleFieldChange}
                                />
                                <input
                                    type="range"
                                    className="form-control"
                                    id="ageTo"
                                    name="ageTo"
                                    min={4}
                                    max={80}
                                    value={filters.ageTo ? filters.ageTo : 80}
                                    onChange={this.handleFieldChange}
                                />
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={5}>
                            <FormGroup>
                                <label htmlFor='postcodeBeginning'>Users with postcode beginning XXX</label>
                                <input
                                    className='form-control'
                                    type='text'
                                    name='postcodeBeginning'
                                    id='postcodeBeginning'
                                    value={this.state.filters.postcodeBeginning}
                                    onChange={this.handleFieldChange}/>
                            </FormGroup>
                        </Col>

                        <Col md={5} mdOffset={2}>
                            <FormGroup>
                                <label htmlFor='city'>Users with town/city</label>
                                <input
                                    className='form-control'
                                    type='text'
                                    name='city'
                                    id='city'
                                    value={this.state.filters.city}
                                    onChange={this.handleFieldChange}/>
                            </FormGroup>

                        </Col>
                    </Row>

                    <Row>
                        <Col md={5}>
                            <FormGroup>
                                <BranchSelector
                                    name='linkedBranhches'
                                    value={this.state.filters.linkedBranches}
                                    label='Students profile linked to branch'
                                    onChange={e => this.handleFieldChange(e, 'select')}
                                />
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={5}>
                            <FormGroup>
                                <label
                                    htmlFor='advancedSearch'
                                    style={{ marginRight: 8, marginTop: 2, verticalAlign: 'top' }}
                                >
                                    Show Grade/Courses
                                </label>
                                <input
                                    type='checkbox'
                                    id='advancedSearch'
                                    name='advancedSearch'
                                    value={this.state.filters.advancedSearch}
                                    onChange={
                                        e => {
                                            this.handleFieldChange(e)
                                            this.$advancedSearchObj.slideToggle('slow')
                                        }
                                    }/>
                            </FormGroup>
                        </Col>
                    </Row>

                    <div id='onAdvancedSearch' style={{ display: 'none' }}>
                        <Row>
                            <Col md={5}>
                                <FormGroup>
                                    <label htmlFor='fromTerm'>From term</label>
                                    <SourceSelect
                                        url='/api/terms/list'
                                        className='form-control'
                                        name='fromTerm'
                                        id='fromTerm'
                                        value={this.state.filters.fromTerm}
                                        onChange={this.handleFieldChange}>
                                        <option value='All'>All terms</option>
                                    </SourceSelect>
                                </FormGroup>
                            </Col>
                        </Row>

                        <FormGroup>
                            <label
                                htmlFor='includeDepartments'
                                style={{ marginRight: '5px' }}
                            >
                                Include these departments
                            </label>
                            <input
                                type='radio'
                                name='departmentsMode'
                                id='includeDepartments'
                                value='include'
                                checked={this.state.filters.departmentsMode === 'include'}
                                onChange={this.handleFieldChange}
                                style={{ marginRight: '15px' }}
                            />

                            <label
                                htmlFor='excludeDepartments'
                                style={{ marginRight: '5px' }}
                            >
                                Exclude these departments
                            </label>
                            <input
                                type='radio'
                                name='departmentsMode'
                                id='excludeDepartments'
                                value='exclude'
                                checked={this.state.filters.departmentsMode === 'exclude'}
                                onChange={this.handleFieldChange}/>
                        </FormGroup>

                        <FormGroup>
                            <CheckedListBox
                                url='/api/depts/list'
                                params={{ branchId: branchId }}
                                id='departmentsSelect'
                                className='list-box'
                                selectedItemClass='list-box-item-selected'
                                onChange={this.handleListBoxSelectionChange.bind(this)}/>
                        </FormGroup>

                        <Row>
                            <Col md={5}>
                                <FormGroup>
                                    <label htmlFor='courseSelect'>Course</label>
                                    <SourceSelect
                                        url='/api/courses/list'
                                        params={{ branchId: branchId }}
                                        className='form-control'
                                        name='courseSelect'
                                        id='courseSelect'
                                        value={this.state.filters.courseSelect}
                                        onChange={this.handleFieldChange}>
                                        <option value='All'>All Courses</option>
                                    </SourceSelect>
                                </FormGroup>
                            </Col>

                            <Col md={5} mdOffset={2}>
                                <FormGroup>
                                    <label htmlFor='courseClassSelect'>Class</label>
                                    <SourceSelect
                                        url='/api/classes/list'
                                        params={{
                                            courseId: this.state.filters.courseSelect,
                                            termId: this.state.filters.fromTerm,
                                            branchId: branchId
                                        }}
                                        className='form-control'
                                        name='courseClassSelect'
                                        id='courseClassSelect'
                                        value={this.state.filters.courseClassSelect}
                                        onChange={this.handleFieldChange}>
                                        <option value='All'>All Classes</option>
                                    </SourceSelect>
                                </FormGroup>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={5}>
                                <FormGroup>
                                    <label htmlFor="invoiceId">Transaction No Like</label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        id="invoiceId"
                                        name="invoiceId"
                                        value={this.state.filters.invoiceId}
                                        onChange={this.handleFieldChange}/>
                                </FormGroup>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={12}>
                                <label>Transaction between</label>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={5}>
                                <FormGroup>
                                    <input
                                        className="form-control datepicker"
                                        type="text"
                                        id="transactionBetweenStart"
                                        name="transactionBetweenStart"
                                        value={this.state.filters.transactionBetweenStart}
                                        onChange={this.handleFieldChange}/>
                                </FormGroup>
                            </Col>
                            <Col md={2}>
                                <FormGroup>
                                    <p className="filter-form-centered-text">Until</p>
                                </FormGroup>
                            </Col>
                            <Col md={5}>
                                <FormGroup>
                                    <input
                                        className="form-control datepicker"
                                        type="text"
                                        id="transactionBetweenEnd"
                                        name="transactionBetweenEnd"
                                        value={this.state.filters.transactionBetweenEnd}
                                        onChange={this.handleFieldChange}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={12}>
                                <label>Grade between</label>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={5}>
                                <FormGroup>
                                    <input
                                        className="form-control"
                                        type="text"
                                        id="gradeBetweenStart"
                                        name="gradeBetweenStart"
                                        value={this.state.filters.gradeBetweenStart}
                                        onChange={this.handleFieldChange}/>
                                </FormGroup>
                            </Col>
                            <Col md={2}>
                                <FormGroup>
                                    <p className="filter-form-centered-text">Until</p>
                                </FormGroup>
                            </Col>
                            <Col md={5}>
                                <FormGroup>
                                    <input
                                        className="form-control"
                                        type="text"
                                        id="gradeBetweenEnd"
                                        name="gradeBetweenEnd"
                                        value={this.state.filters.gradeBetweenEnd}
                                        onChange={this.handleFieldChange}/>
                                </FormGroup>
                            </Col>
                        </Row>

                        <FormGroup id='activePaidCheckBoxes'>
                            <label
                                htmlFor="currentTermActivePaid"
                                style={{ marginRight: '5px' }}
                            >
                                Who have courses in this term (active/paid)
                            </label>
                            <input
                                type="checkBox"
                                name="currentTermActivePaid"
                                id="currentTermActivePaid"
                                value={this.state.filters.currentTermActivePaid}
                                onChange={
                                    e => {
                                        this.handleFieldChange(e)
                                        this.activePaidCheckBoxChanged(e)
                                    }
                                }
                                style={{ marginRight: '10px' }}
                            />

                            <label
                                htmlFor="notCurrentTermActivePaid"
                                style={{ marginRight: '5px' }}
                            >
                                Who did not attend this term
                            </label>
                            <input
                                type="checkBox"
                                name="notCurrentTermActivePaid"
                                id="notCurrentTermActivePaid"
                                value={this.state.filters.notCurrentTermActivePaid}
                                onChange={
                                    e => {
                                        this.handleFieldChange(e)
                                        this.activePaidCheckBoxChanged(e)
                                    }
                                }
                            />
                        </FormGroup>

                        <div id="regPaymentStatuses">
                            <Row>
                                <Col md={5}>
                                    <FormGroup>
                                        <label htmlFor="paymentStatusSelect">Payment Status</label>
                                        <SourceSelect
                                            url='/api/students/get-reg-payment-status-enum'
                                            className="form-control"
                                            name="paymentStatusSelect"
                                            id="paymentStatusSelect"
                                            value={this.state.filters.paymentStatusSelect}
                                            onChange={this.handleFieldChange}>
                                            <option value='All'>All Statuses</option>
                                        </SourceSelect>
                                    </FormGroup>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={5}>
                                    <FormGroup>
                                        <label htmlFor="regStatusSelect">Registration Status</label>
                                        <SourceSelect
                                            url='/api/students/get-reg-status-enum'
                                            className="form-control"
                                            name="regStatusSelect"
                                            id="regStatusSelect"
                                            value={this.state.filters.regStatusSelect}
                                            onChange={this.handleFieldChange}>
                                            <option value='All'>All Statuses</option>
                                        </SourceSelect>
                                    </FormGroup>
                                </Col>
                            </Row>
                        </div>

                        <Row>
                            <Col md={5}>
                                <FormGroup>
                                    <label htmlFor="paymentMethodSelect">Payment method</label>
                                    <SourceSelect
                                        url='/api/students/get-reg-payment-method-enum'
                                        className="form-control"
                                        name="paymentMethodSelect"
                                        id="paymentMethodSelect"
                                        value={this.state.filters.paymentMethodSelect}
                                        onChange={this.handleFieldChange}>
                                        <option value='All'>All Methods</option>
                                    </SourceSelect>
                                </FormGroup>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={5}>
                                <FormGroup>
                                    <label htmlFor="employmentTypeSelect">Employment Type</label>
                                    <SourceSelect
                                        url='/api/students/get-student-status-enum'
                                        className="form-control"
                                        name="employmentTypeSelect"
                                        id="employmentTypeSelect"
                                        value={this.state.filters.employmentTypeSelect}
                                        onChange={this.handleFieldChange}>
                                        <option value='All'>All Types</option>
                                    </SourceSelect>
                                </FormGroup>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={12}>
                                <label>Amount Between</label>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={5}>
                                <FormGroup>
                                    <input
                                        className="form-control"
                                        type="text"
                                        id="amountBetweenStart"
                                        name="amountBetweenStart"
                                        value={this.state.filters.amountBetweenStart}
                                        onChange={this.handleFieldChange}/>
                                </FormGroup>
                            </Col>
                            <Col md={2}>
                                <FormGroup>
                                    <p className="filter-form-centered-text">Until</p>
                                </FormGroup>
                            </Col>
                            <Col md={5}>
                                <FormGroup>
                                    <input
                                        className="form-control"
                                        type="text"
                                        id="amountBetweenEnd"
                                        name="amountBetweenEnd"
                                        value={this.state.filters.amountBetweenEnd}
                                        onChange={this.handleFieldChange}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={5}>
                                <BranchSelector
                                    name='branches'
                                    value={this.state.filters.branches}
                                    label='From the following branches'
                                    onChange={e => this.handleFieldChange(e, 'select')}
                                />
                            </Col>
                        </Row>

                        <Row>
                            <Col md={5}>
                                <FormGroup>
                                    <label
                                        htmlFor='withCartItems'
                                        style={{ marginRight: '5px' }}
                                    >
                                        Show with items in cart
                                    </label>

                                    <input
                                        type='checkbox'
                                        id='withCartItems'
                                        name='withCartItems'
                                        value={this.state.filters.withCartItems}
                                        onChange={this.handleFieldChange}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                    </div>

                    <FormGroup>
                        <Button className='custom' bsStyle='success' type='submit'>Filter</Button>
                        <div style={styles.mergeBranchWrapper}>
                            <MergeBranch filters={this.state.filters} />
                        </div>
                    </FormGroup>

                    <FormGroup>
                    </FormGroup>
                </form>
            </div>
        )
    }

    handleFieldChange(e, type = null) {
        type = type ? type : e.target.type

        var filters = this.state.filters
        var filterName = e.target.name
        switch (type) {
            case 'multi-checkbox':
                filterName = filterName.replace(/\[]/g, '')
                if (e.target.checked)
                    filters[filterName] = filters[filterName].concat(e.target.value)
                else
                    filters[filterName] = _.without(filters[filterName], e.target.value)
                break
            case 'checkbox':
                filters[filterName] = e.target.checked
                break
            default:
                console.log(filterName, e.target.value)
                filters[filterName] = e.target.value
                break
        }

        this.setState({filters: filters})
    }

    handleListBoxSelectionChange(selectedItems, listBoxId) {
        var filters = this.state.filters
        filters[listBoxId] = selectedItems
        this.setState({ filters: filters })
    }

    activePaidCheckBoxChanged(e) {
        var $checkBox = $(e.target)
        var i = this.$activePaidCheckBoxes.index($checkBox)
        if ($checkBox.prop('checked')) {
            this.$activePaidCheckBoxes.each((j, checkBox) => {
                var $anotherCheckBox = $(checkBox)
                if (j !== i)
                    $anotherCheckBox.prop('checked', false)
            })
            if (this.$regPaymentStatusesObj.css('display') != 'none')
                this.$regPaymentStatusesObj.slideToggle('slow')
        } else
            this.$regPaymentStatusesObj.slideToggle('slow')
    }

    submitFilters(e) {
        e.preventDefault()
        this.props.onSubmit(this.state.filters)
    }
}

StudentSearchForm.contextTypes = {
    branchId: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
}
