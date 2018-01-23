import React, { PropTypes, Component } from 'react'
import DataLoader from '../../common/DataLoader.jsx'
import RoleFilter from '../../common/RoleFilter.jsx'
import FormGroup from '../../common/FormGroup.jsx'
import { ROLES } from '../../../config/constants.js'
import Table from '../../common/Table.jsx'
import { Link } from 'react-router'
import { Tabs, Tab, Button } from 'react-bootstrap'
import { FormField, EditableItemList } from '../../common/FormWidgets.jsx'
import Notifier from '../../../utils/Notifier.js'
import ConfirmDeleteWnd from '../../common/ConfirmDeleteWnd'

class SettingsTerms extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { selectedTab: 0, showConfirmDelete: false }
    }

    render() {
        const { selectedTab } = this.state

        return (
            <div className='content-block'>
                <Tabs
                    className='content-tabs'
                    activeKey={selectedTab}
                    onSelect={key => this.setState({ selectedTab: key })}
                    style={{ paddingTop: '35px' }}
                >
                    <Tab eventKey={0} title='Backend' style={{ paddingTop: '20px' }}>
                        <TermsBackend />
                    </Tab>

                    <Tab eventKey={1} title='Frontend' style={{ paddingTop: '20px' }}>
                        <TermsFrontend logEnabled />
                    </Tab>
                </Tabs>
            </div>
        )
    }
}


class TermsBackendInnerClass extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { data: this.props.data, checkedRows: [], settingsData: null }
        this.createRow = this.createRow.bind(this)
        this.delete = this.delete.bind(this)
        this.onRowClick = this.onRowClick.bind(this)
        this.activateTerm = this.activateTerm.bind(this)
        this.addTerm = this.addTerm.bind(this)
    }

    edit(id) {
        this.context.router.push('/terms/' + id)
    }

    activateTerm(id) {
        var { data } = this.state
        const { execute } = this.props
        const { website } = this.context

        website.set('activeTermId', id)

        execute(
            'setActive',
            { id: id },
            () => Notifier.success('Active term changed'),
            () => Notifier.error('Active term was not changed')
        )

        this.setState({ data: data })
    }

    createRow(rowObj) {
        const { website } = this.context

        var row = []

        var i = 0
        const pushRow = content => row.push(<td key={i++}>{content}</td>)
        const isActive = rowObj.id == website.activeTermId

        pushRow(
            <p>{rowObj.name}</p>
        )
        pushRow(
            <p>{rowObj.term}</p>
        )
        pushRow(
            <p>{rowObj.year}</p>
        )
        pushRow(
            <p style={{ whiteSpace: 'normal', maxWidth: '350px' }}>{rowObj.fullTimeDescription}</p>
        )
        pushRow(
            <p style={{ whiteSpace: 'normal', maxWidth: '350px' }}>{rowObj.partTimeDescription}</p>
        )
        pushRow(
            <div style={{ margin: 'auto' }}>
                {isActive ?
                    <Button
                        style={{ width: '90px', textTransform: 'uppercase' }}
                        bsStyle='success'
                        onClick={e => e.stopPropagation()}
                    >
                        Active
                    </Button>
                    :
                    <Button
                        style={{ width: '90px', textTransform: 'uppercase' }}
                        bsStyle='danger'
                        onClick={e => { e.stopPropagation(); this.activateTerm(rowObj.id) }}
                    >
                        Inactive
                    </Button>
                }
            </div>
        )

        return row
    }

    delete(reason) {
        var { checkedRows, data } = this.state
        const { execute } = this.props

        execute(
            'delete',
            { ids: checkedRows, reason: reason },
            () => Notifier.success('Deleted successfully'),
            () => Notifier.error('Deletion failed')
        )
        data = data.filter(item => !checkedRows.includes(item.id.toString()))

        this.setState({ data: data, checkedRows: [], showConfirmDelete: false })
    }

    onRowClick(e, item) {
        this.edit(item.id)
    }

    addTerm(e) {
        e.stopPropagation()
        this.context.router.push('/terms/add')
    }

    renderTable() {
        const { data } = this.state

        if (!data || data.length === 0) {
            return <p>No pages yet.</p>
        }

        return (
            <div style={{ overflow: 'auto' }}>
                <div style={{ minWidth: 1076 }}>
                <Table
                    data={data}
                    className='table table-striped results-table table-hover'
                    headers={['Name', 'Term', 'Year', 'Full Time Description', 'Part Time Description',  '']}
                    createRow={this.createRow}
                    onRowClick={this.onRowClick}
                    rowStyle={{ cursor: 'pointer' }}
                    checkableRows
                    onCheckedRowsChange={checkedRows => this.setState({checkedRows: checkedRows})}
                />
                </div>
            </div>
        )
    }

    render() {
        const { showConfirmDelete } = this.state

        return (
            <div>
                {this.renderTable()}

                <FormGroup>
                    <Button
                        className='custom btn-success'
                        style={{ marginRight: '15px' }}
                        onClick={this.addTerm}
                    >
                        Add
                    </Button>

                    <Button
                        className='custom btn-danger'
                        onClick={() => this.setState({ showConfirmDelete: true })}
                    >
                        Delete
                    </Button>
                </FormGroup>

                <ConfirmDeleteWnd
                    show={showConfirmDelete}
                    onConfirm={this.delete}
                    onClose={() => this.setState({ showConfirmDelete: false })}
                />
            </div>
        )
    }
}

TermsBackendInnerClass.contextTypes = {
    router: PropTypes.object.isRequired,
    website: PropTypes.object.isRequired
}

const TermsBackend = DataLoader(
    TermsBackendInnerClass,
    {
        load: { type: 'get', url: '/api/terms' },
        delete: { type: 'delete', url: '/api/terms', },
        setActive: { type: 'put', url: '/api/terms/set-active'}
    }
)

class TermsFrontendInnerClass extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { branches: props.data, termOptions: [] }
        this.save = this.save.bind(this)
        this.changeData = this.changeData.bind(this)
    }

    changeData(name, value, i) {
        var { branches } = this.state
        if (branches[i]) {
            branches[i][name] = value.length > 0 ? value : null
        }

        this.setState({ branches: branches })
    }

    save() {
        this.props.save({ data: this.state.branches })
    }

    componentWillMount() {
        const { execute } = this.props
        execute(
            'loadTermOptions',
            null,
                options => this.setState({ termOptions: options })
        )
    }

    renderRows() {
        const { branches, termOptions } = this.state
        const { website } = this.context

        var rows = []
        branches.forEach((branch, i) => {
            let isActive = false
            for (let i in website.branchesAssociated) {
                if (website.branchesAssociated[i].id == branch.id) {
                    isActive = true
                    break
                }
            }

            rows.push(
                <tr key={i}>
                    <td>{branch.branchName} {isActive ? '[active]' : ''}</td>
                    <td>
                        <EditableItemList
                            passiveProps={{
                                    items: branch.terms,
                                    showingProp: 'name',
                                    width: 12
                                }}
                            activeProps={{
                                    items: branch.terms,
                                    name: 'terms',
                                    labelProp: 'name',
                                    onChange: (name, value) => this.changeData(name, value, i),
                                    options: termOptions
                                }}
                            />
                    </td>
                </tr>
            )
        })

        return rows
    }

    renderTable() {
        return (
            <table className='table table-striped results-table' style={{ tableLayout: 'fixed' }}>
                <thead>
                <tr>
                    <th style={{ width: '50%' }}>Branch</th>
                    <th style={{ width: '50%' }}>Terms</th>
                </tr>
                </thead>

                <tbody>
                {this.renderRows()}
                </tbody>
            </table>
        )
    }

    render() {
        return (
            <div>
                {this.renderTable()}

                <Button className='custom btn-success' onClick={this.save}>Save</Button>
            </div>
        )
    }
}

TermsFrontendInnerClass.contextTypes = {
    website: PropTypes.object.isRequired
}

const TermsFrontend = DataLoader(TermsFrontendInnerClass,
    {
        load: { type: 'get', url: '/api/branches-associated/frontend', data: {
            fields: ['id', 'branchName', 'terms']
        } },
        save: { type: 'put', url: '/api/branches-associated' },
        loadTermOptions: { type: 'get', url: '/api/terms' },
    }
)

export default RoleFilter(SettingsTerms, [ROLES.ADMIN, ROLES.SUPER_ADMIN])