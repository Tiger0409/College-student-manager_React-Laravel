import React, { PropTypes, Component } from 'react'
import DataLoader from '../../common/DataLoader.jsx'
import RoleFilter from '../../common/RoleFilter.jsx'
import { ROLES } from '../../../config/constants.js'
import { FormField, EditableHTML, EditableItemList } from '../../common/FormWidgets.jsx'
import { Button, Row, Col } from 'react-bootstrap'
import ConfirmDeleteWnd from '../../common/ConfirmDeleteWnd.jsx'
import autosize from '../../../libs/autosize.js'

class TermEdit extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { data: props.data ? props.data : {}, showConfirmDelete: false }
        this.onChange = this.onChange.bind(this)
        this.changeData = this.changeData.bind(this)
        this.save = this.save.bind(this)
        this.delete = this.delete.bind(this)
    }

    changeData(name, value) {
        var { data } = this.state
        data[name] = value
        this.setState({ name: value })
    }

    onChange(e) {
        this.changeData(e.target.name, e.target.value)
    }

    save() {
        const { save, params: { id } } = this.props
        const { data } = this.state

        save({ data: data }, () => {
            this.context.router.push('/settings/terms')
        })
    }

    delete(reason) {
        const { params: { id }, execute } = this.props
        execute('delete', { ids: [id], reason: reason }, () => {
            this.context.router.push('/settings/terms')
        })
    }

    componentDidMount() {
        $(() => autosize($('textarea')))
    }

    render() {
        const { data, showConfirmDelete } = this.state
        const { id } = this.props.params

        return (
            <div className='content-block' style={{ paddingTop: '35px' }}>
                <Row>
                    <Col md={4} style={{ marginBottom: '10px' }}>
                        <Label>Name</Label>
                        <input
                            name='name'
                            type='text'
                            className='form-control'
                            value={data.name}
                            onChange={this.onChange}
                        />
                    </Col>

                    <Col md={4} style={{ marginBottom: '10px' }}>
                        <Label>Semester</Label>
                        <select
                            name='term'
                            type='text'
                            className='form-control'
                            value={data.term}
                            onChange={this.onChange}
                            >
                            <option value="0">-- Select semester --</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                        </select>
                    </Col>

                    <Col md={4} style={{ marginBottom: '10px' }}>
                        <Label>Year</Label>
                        <input
                            name='year'
                            type='text'
                            className='form-control'
                            value={data.year}
                            onChange={this.onChange}
                        />
                    </Col>
                </Row>

                <Row>
                    <Col md={6} style={{ marginBottom: '10px' }}>
                        <Label>Full Time Description</Label>
                        <textarea
                            name='fullTimeDescription'
                            type='text'
                            rows="2"
                            className='form-control'
                            value={data.fullTimeDescription}
                            onChange={this.onChange}
                        ></textarea>
                    </Col>

                    <Col md={6} style={{ marginBottom: '10px' }}>
                        <Label>Part Time Description</Label>
                        <textarea
                            name='partTimeDescription'
                            type='text'
                            rows="2"
                            className='form-control'
                            value={data.partTimeDescription}
                            onChange={this.onChange}
                        ></textarea>
                    </Col>
                </Row>

                <div style={{ marginTop: '20px' }}>
                    <Button
                        className='custom btn-success'
                        style={{ marginRight: '15px' }}
                        onClick={this.save}
                    >
                        Save
                    </Button>

                    {id ?
                        (<Button
                            className='custom btn-danger'
                            onClick={() => this.setState({ showConfirmDelete: true })}
                        >
                            Delete
                        </Button>)
                        : ''
                    }
                </div>

                <ConfirmDeleteWnd
                    show={showConfirmDelete}
                    onConfirm={this.delete}
                    onClose={() => this.setState({ showConfirmDelete: false })}
                />
            </div>
        )
    }
}

TermEdit.contextTypes = {
    router: PropTypes.object.isRequired
}

const Wrapper = RoleFilter(
    DataLoader(TermEdit),
    [ROLES.ADMIN, ROLES.SUPER_ADMIN]
)

export default props => {
    const { id } = props.params

    var ajaxOperations = {}

    if (id) {
        ajaxOperations.load = { type: 'get', url: `/api/terms/${id}` }
        ajaxOperations.save = { type: 'put', url: `/api/terms/${id}` }
        ajaxOperations.delete = { type: 'delete', url: `/api/terms` }
    } else {
        ajaxOperations.save = { type: 'post', url: `/api/terms` }
    }

    return (
        <Wrapper ajaxOperations={ajaxOperations} logEnabled {...props} />
    )
}

const Label = ({ children }) => (<p className='detail-field-label'>{children}</p>)