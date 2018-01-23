import React, { PropTypes, Component } from 'react'
import { ROLES } from '../../../../config/constants.js'
import PromiseHelper from '../../../../utils/PromiseHelper.js'
import Table from '../../../common/Table.jsx'
import { Link } from 'react-router'
import { Button } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'

export default class RegistrarList extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {isLoading: false, data: null}
        this.requestFields = ['id', 'userFullname', 'userEmailAddress']
        this.loadPromise = null
    }

    static allowedRoles () {
        return [ROLES.ADMIN, ROLES.SUPER_ADMIN]
    }

    componentWillMount() {
        this.load()
    }

    componentWillUnmount() {
        if (this.loadPromise) {
            this.loadPromise.cancel()
        }
    }

    load() {
        this.setState({isLoading: true})

        if (this.loadPromise) {
            this.loadPromise.cancel()
        }

        this.loadPromise = PromiseHelper.ajax({
            type: 'get',
            url: '/api/users/registrars',
            data: {fields: this.requestFields}
        })
        this.loadPromise.then(
            data => this.setState({isLoading: false, data: data.rows}),
            xhr => console.log(xhr)
        )
    }

    createRow(rowObj, showingProps) {
        var row = Table.createRowBase(rowObj, showingProps)
        row.push(<td key='controls'><Link to={'/users/' + rowObj.id + '/edit'}>Edit</Link></td>)
        return row
    }

    renderTable() {
        const { data } = this.state

        if (!data || data.length == 0)
            return <p>No registrars yet</p>

        return (
            <Table
                data={data}
                showingProps={['userFullname', 'userEmailAddress']}
                headers={['Name', 'Email Address', '']}
                createRow={this.createRow}
            />
        )
    }

    render() {
        const { isLoading } = this.state

        if (isLoading) {
            return <p>Loading...</p>
        }

        return (
            <div>
                {this.renderTable()}
                <LinkContainer to={{pathname: '/users/role/registrars/add'}}>
                    <Button bsStyle='success'>Add</Button>
                </LinkContainer>
            </div>
        )
    }
}