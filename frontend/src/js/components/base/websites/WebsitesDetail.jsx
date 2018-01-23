import React, { PropTypes, Component } from 'react'
import DataLoader from '../../common/DataLoader.jsx'
import RoleFilter from '../../common/RoleFilter.jsx'
import { ROLES, TEMPLATE_FOLDERS } from '../../../config/constants.js'
import { EditableValue, EditableItemList, EditableHTML, FormField } from '../../common/FormWidgets.jsx'
import { Button, Row, Col } from 'react-bootstrap'
import Oh from '../../../utils/ObjHelper.js'
import Sh from '../../../utils/StringHelper.js'
import Switchable from '../../common/Switchable.jsx'

class WebsitesDetail extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { data: props.data, branchOptions: null }
        this.onFieldChange = this.onFieldChange.bind(this)
        this.onChange = this.onChange.bind(this)
        this.save = this.save.bind(this)
        this.submit = this.submit.bind(this)
    }

    onFieldChange(name, value) {
        var { data } = this.state
        data[name] = value
        this.setState({ data: data })
    }

    onChange(e) {
        const { name, value } = e.target
        this.onFieldChange(name, value)
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
        let { data } = this.state
        const { save } = this.props

        if (data.branchesAssociated) {
            data.branchesAssociated = data.branchesAssociated.map(branch => { return { id: branch.id } })
        }

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
        const get = Oh.accessObjByPath
        
        return (
            <div className='content-block'>
                <h2 className='block-heading'>Website Detail</h2>
                <hr />

                <Row style={{ marginBottom: '10px' }}>
                    <Col md={3}>
                        <EditableValue
                            label='Name'
                            value={data.name}
                            onFieldChange={this.onFieldChange}
                        >
                            <input type='text' className='form-control' name='name' />
                        </EditableValue>

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

                        <EditableValue
                            label='Main Site'
                            value={data.mainSiteUrl}
                            onFieldChange={this.onFieldChange}
                        >
                            <input type='text' className='form-control' name='mainSiteUrl' />
                        </EditableValue>
                    </Col>

                    <Col md={6} mdOffset={3}>
                        <Label>Branches</Label>
                        <EditableItemList
                            passiveProps={{
                            items: data.branchesAssociated,
                            showingProp: 'branchName'
                        }}
                            activeProps={{
                            items: data.branchesAssociated,
                            name: 'branchesAssociated',
                            labelProp: 'branchName',
                            onChange: this.onFieldChange,
                            options: branchOptions
                        }}
                            />
                    </Col>
                </Row>

                <Row style={{ marginBottom: '10px' }}>
                    <Col md={3}>
                        <EditableValue
                            label='Payment heading'
                            value={data.paymentHeading}
                            onFieldChange={this.onFieldChange}
                        >
                            <input type='text' className='form-control' name='paymentHeading' />
                        </EditableValue>
                    </Col>

                    <Col md={3} mdOffset={3}>
                        <EditableValue
                            label='Payment Field 1'
                            value={data.paymentField1}
                            onFieldChange={this.onFieldChange}
                        >
                            <input type='text' className='form-control' name='paymentField1' />
                        </EditableValue>

                        <EditableValue
                            label='Payment field 2'
                            value={data.paymentField2}
                            onFieldChange={this.onFieldChange}
                        >
                            <input type='text' className='form-control' name='paymentField2' />
                        </EditableValue>
                        <EditableValue
                            label='Pay Pal'
                            value={data.payPal}
                            onFieldChange={this.onFieldChange}
                        >
                            <input type='text' className='form-control' name='payPal' />
                        </EditableValue>
                    </Col>
                </Row>

                <form onSubmit={this.submit}>
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

WebsitesDetail.contextTypes = {
    router: PropTypes.object.isRequired
}

const WebsitesDetailWrapper =  RoleFilter(
    DataLoader(
        WebsitesDetail,
        {
            loadBranchOptions: { type: 'get', url: '/api/branches-associated' },
        }
    ),
    [ROLES.ADMIN, ROLES.SUPER_ADMIN]
)

export default props => {
    const { id } = props.params

    return (
        <WebsitesDetailWrapper
            ajaxOperations={{
                load: {
                    type: 'get',
                    url: '/api/websites/' + id,
                    data: {
                        fields: [
                            'name',
                            'slug',
                            'city.name',
                            'branchesAssociated',
                            'folder',
                            'mainSiteUrl',
                            'header',
                            'footer',
                            'toc',
                            'paymentHeading',
                            'paymentField1',
                            'paymentField2',
                            'payPal'
                        ]
                    }
                },
                save: { type: 'put', url: '/api/websites/' + id }
            }}
            {...props}
        />
    )
}

const Label = ({ style, children }) => (<p style={style} className='detail-field-label'>{children}</p>)