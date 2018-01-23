import React, { PropTypes, Component } from 'react'
import DataLoader from '../../common/DataLoader.jsx'
import RoleFilter from '../../common/RoleFilter.jsx'
import { ROLES, TEMPLATE_FOLDERS } from '../../../config/constants.js'
import { EditableValue, CheckableItemList, EditableHTML, FormField } from '../../common/FormWidgets.jsx'
import { Button, Row, Col } from 'react-bootstrap'
import Oh from '../../../utils/ObjHelper.js'
import Sh from '../../../utils/StringHelper.js'

class WebsitesEdit extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { data: {}, branchOptions: null }
        this.setField = this.setField.bind(this)
        this.onChange = this.onChange.bind(this)
        this.save = this.save.bind(this)
        this.submit = this.submit.bind(this)
    }

    setField(name, value) {
        var { data } = this.state
        data[name] = value
        this.setState({ data: data })
    }

    onChange(e) {
        this.setField(e.target.name, e.target.value)
    }

    loadOptions() {
        const { execute } = this.props

        execute('loadBranchOptions', null, options =>
            this.setState({ branchOptions: options })
        )
    }

    componentDidMount() {
        this.loadOptions()
    }

    save() {
        const { data } = this.state
        const { save } = this.props
        save({ data: data }, () => {
            this.context.router.push('/settings/multi-branches')
        })
    }

    submit(e) {
        e.preventDefault()
        this.save()
    }

    render() {
        const { data, branchOptions } = this.state
        const get = Oh.getIfExists

        const Label = ({ style, children }) => (<p style={style} className='detail-field-label'>{children}</p>)

        return (
            <div className='content-block'>
                <h2 className='block-heading'>Website Edit</h2>
                <hr />

                <form onSubmit={this.submit}>
                    <Row style={{ marginBottom: '10px' }}>
                        <Col md={6}>
                            <div>
                                <Label>Name</Label>
                                <input
                                    type='text'
                                    className='form-control'
                                    name='name'
                                    onChange={this.onChange}
                                    value={data.name}
                                    style={{ marginBottom: '10px' }}
                                />
                            </div>

                            <div>
                                <Label>Select templates folder</Label>
                                <select
                                    name='folder'
                                    value={data.folder}
                                    className='form-control'
                                    onChange={this.onChange}
                                    style={{ marginBottom: '10px' }}
                                    >
                                    <option value="0"> -- Select Folder -- </option>
                                    {
                                        TEMPLATE_FOLDERS.map((folder, i) => (
                                            <option key={i} value={folder.value}>{folder.label}</option>
                                        ))
                                    }
                                </select>
                            </div>

                            <div>
                                <Label>Main Site</Label>
                                <input
                                    type='text'
                                    className='form-control'
                                    name='mainSiteUrl'
                                    value={data.mainSiteUrl}
                                    onChange={this.onChange}
                                    style={{ marginBottom: '10px' }}
                                />
                            </div>
                        </Col>

                        <Col md={6}>
                            <Label>Branches</Label>
                            <CheckableItemList
                                items={get(data, 'branchesAssociated', [])}
                                name='branchesAssociated'
                                labelProp='branchName'
                                onChange={this.setField}
                                options={branchOptions}
                                style={{ marginBottom: '10px' }}
                            />
                        </Col>
                    </Row>

                    <Row style={{ marginBottom: '10px' }}>
                        <Col md={4}>
                            <Label>Payment Heading</Label>
                            <input
                                name='paymentHeading'
                                type='text'
                                className='form-control'
                                onChange={this.onChange}
                                value={data.paymentHeading}
                            />
                        </Col>

                        <Col md={4}>
                            <Label>Payment Field 1</Label>
                            <input
                                name='paymentField1'
                                type='text'
                                className='form-control'
                                onChange={this.onChange}
                                value={data.paymentField1}
                            />
                        </Col>

                        <Col md={4}>
                            <Label>Payment Field 2</Label>
                            <input
                                name='paymentField2'
                                type='text'
                                className='form-control'
                                onChange={this.onChange}
                                value={data.paymentField2}
                            />
                        </Col>
                        <Col md={4}>
                            <Label>PayPal</Label>
                            <input
                                name='payPal'
                                type='text'
                                className='form-control'
                                onChange={this.onChange}
                                value={data.payPal}
                            />
                        </Col>
                    </Row>

                    <Label>Header</Label>
                    <EditableHTML
                        name='header'
                        value={data.header}
                        onChange={this.onChange}
                        onlyEdit
                    />

                    <Label>Footer</Label>
                    <EditableHTML
                        name='footer'
                        value={data.footer}
                        onChange={this.onChange}
                        onlyEdit
                    />

                    <Label>Terms And Condition</Label>
                    <EditableHTML
                        name='toc'
                        value={data.toc}
                        onChange={this.onChange}
                        onlyEdit
                    />

                    <Button className='custom btn-success' type='submit'>Save</Button>
                </form>
            </div>
        )
    }
}

WebsitesEdit.contextTypes = {
    router: PropTypes.object.isRequired
}

export default RoleFilter(
    DataLoader(
        WebsitesEdit,
        {
            loadBranchOptions: { type: 'get', url: '/api/branches-associated' },
            save: { type: 'post', url: '/api/websites' }
        }
    ),
    [ROLES.ADMIN, ROLES.SUPER_ADMIN]
)

const FormItem = ({ width, children }) => (
    <Row>
        <Col md={width}>{children}</Col>
    </Row>
)