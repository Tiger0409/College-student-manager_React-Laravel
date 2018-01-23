import React, { PropTypes, Component } from 'react'
import DataLoader from '../../common/DataLoader.jsx'
import RoleFilter from '../../common/RoleFilter.jsx'
import { ROLES } from '../../../config/constants.js'
import { FormField, EditableHTML, EditableItemList } from '../../common/FormWidgets.jsx'
import { Button, Row, Col, Tabs, Tab } from 'react-bootstrap'
import Notifier from '../../../utils/Notifier.js'
import ConfirmDeleteWnd from '../../common/ConfirmDeleteWnd.jsx'

class BranchDetail extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { data: props.data ? props.data : {}, termOptions: [], showConfirmDelete: false }
        this.onChange = this.onChange.bind(this)
        this.changeData = this.changeData.bind(this)
        this.save = this.save.bind(this)
        this.delete = this.delete.bind(this)
    }

    componentDidMount() {
        const { execute } = this.props
        execute(
            'loadTermOptions',
            null,
            options => this.setState({ termOptions: options })
        )
    }

    changeData(name, value) {
        var { data } = this.state
        data[name] = value
        this.setState({ name: value })
    }

    onChange(e) {
        const valueProp = e.target.type == 'checkbox' ? 'checked' : 'value'
        this.changeData(e.target.name, e.target[valueProp])
    }

    save() {
        const { save, params: { id } } = this.props
        const { data } = this.state

        save({ data: data }, () => {
            this.context.router.push('/settings/multi-branches')
        })
    }

    delete(reason) {
        const { params: { id }, execute } = this.props
        execute(
            'delete',
            { ids: [id], reason: reason },
            () => {
                Notifier.success('Deleted successfully')
                this.context.router.push('/settings/multi-branches')
            },
            xhr => {
                Notifier.error(xhr.responseText.replace(/"/g, ''))
            }
        )
    }

    render() {
        const { data, termOptions, showConfirmDelete } = this.state
        const { id } = this.props.params
        const Label = ({ style, children }) => (<p style={style} className='detail-field-label'>{children}</p>)

        return (
            <div className='content-block' style={{ paddingTop: '35px' }}>
                <h2 className='block-heading'>{
                    id ?
                        'Branch Edit' : 'New Branch'
                }</h2>
                <hr />

                <Row style={{ marginBottom: '10px' }}>
                    <Col md={6}>
                        <input
                            type='checkbox'
                            className='form-control'
                            name='isListed'
                            checked={data.isListed == '1'}
                            style={{
                                display: 'inline-block',
                                marginRight: '10px',
                                marginBottom: '1px'
                            }}
                            onChange={() => this.changeData('isListed', data.isListed == '1' ? '0' : '1')}
                        />

                        <Label style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                            Listed in students closest branches
                        </Label>
                    </Col>
                </Row>

                <Row style={{ marginBottom: '10px' }}>
                    <Col md={6}>
                        <Label>Branch name</Label>
                        <input
                            name='branchName'
                            type='text'
                            className='form-control'
                            value={data.branchName}
                            onChange={this.onChange}
                        />
                    </Col>

                    <Col md={6}>
                        <Label>Branch weight</Label>
                        <input
                            name='branchWeight'
                            type='text'
                            className='form-control'
                            value={data.branchWeight}
                            onChange={this.onChange}
                        />
                    </Col>
                </Row>

                <Row>
                    <FormField label='Terms' width={4}>
                        <EditableItemList
                            passiveProps={{
                                items: data.terms,
                                showingProp: 'name'
                            }}
                            activeProps={{
                                items: data.terms,
                                name: 'terms',
                                labelProp: 'name',
                                onChange: this.changeData,
                                options: termOptions
                            }}
                        />
                    </FormField>
                </Row>

                <div style={{ marginBottom: '10px' }}></div>

                <Tabs
                    className='content-tabs'
                    activeKey={this.state.selectedTab}
                    onSelect={key => this.setState({ selectedTab: key })}
                >
                    <Tab eventKey={0} title='Emailed Invoice Template' style={{ paddingTop: '20px' }}>
                        <FormField width={12}>
                            <p><b>Required variables: </b></p>
                            <p>%INVOICE_NO%</p>
                            <p>%REG_DATE%</p>
                            <p>%PAYMENT_STATUS%</p>
                            <p>%NAME%</p>
                            <p>%ADDRESS%</p>
                            <p>%EMAIL%</p>
                            <p>%TELEPHONE%</p>
                            <p>%TOTAL_PRICE%</p>
                            <p>%ROW%</p>
                        </FormField>

                        <div style={{ marginBottom: '20px' }}></div>

                        <textarea
                            className='form-control'
                            name={'invoiceEmailTemplate'}
                            id={'invoiceEmailTemplate'}
                            style={{ height: '100%', marginBottom: '20px', overflowY: 'scroll !important' }}
                            value={data.invoiceEmailTemplate}
                            onChange={this.onChange}
                        ></textarea>
                    </Tab>

                    <Tab eventKey={1} title='Print Receipt Template' style={{ paddingTop: '20px' }}>
                        <FormField width={12}>
                            <p><b>Required variables: </b></p>
                            <p>%INVOICE_NO%</p>
                            <p>%REG_DATE%</p>
                            <p>%PAYMENT_STATUS%</p>
                            <p>%NAME%</p>
                            <p>%ADDRESS%</p>
                            <p>%EMAIL%</p>
                            <p>%TELEPHONE%</p>
                            <p>%TOTAL_PRICE%</p>
                            <p>%TABLE_PAYMENT_LIST%</p>
                        </FormField>

                        <textarea
                            className='form-control'
                            name={'printReceiptTemplate'}
                            id={'printReceiptTemplate'}
                            style={{ height: '100%', marginBottom: '20px', overflowY: 'scroll !important' }}
                            value={data.printReceiptTemplate}
                            onChange={this.onChange}
                        ></textarea>
                    </Tab>
                </Tabs>

                <Button
                    className='custom btn-success'
                    style={{ marginRight: '15px' }}
                    onClick={this.save}
                >
                    Save
                </Button>
                {id ?
                    (
                        <Button
                            className='custom btn-danger'
                            onClick={() => this.setState({ showConfirmDelete: true })}
                        >
                            Delete
                        </Button>
                    ) : ''
                }

                <ConfirmDeleteWnd
                    show={showConfirmDelete}
                    onConfirm={this.delete}
                    onClose={() => this.setState({ showConfirmDelete: false })}
                />
            </div>
        )
    }
}

BranchDetail.contextTypes = {
    router: PropTypes.object.isRequired
}

const Wrapper = RoleFilter(
    DataLoader(BranchDetail),
    [ROLES.ADMIN, ROLES.SUPER_ADMIN]
)

export default props => {
    const { id } = props.params

    var ajaxOperations = {
        loadTermOptions: { type: 'get', url: '/api/terms' },
    }

    if (id) {
        Object.assign(ajaxOperations, {
            load: { type: 'get', url: `/api/branches-associated/${id}` },
            save: { type: 'put', url: `/api/branches-associated/${id}` },
            delete: { type: 'delete', url: `/api/branches-associated` }
        })

    } else {
        ajaxOperations.save = { type: 'post', url: `/api/branches-associated` }
    }

    return (
        <Wrapper ajaxOperations={ajaxOperations} {...props} />
    )
}