import React, { Component } from 'react'
import { ROLES } from './../../../../config/constants.js'
import StudentSearchForm from './StudentSearchForm.jsx'
import StudentTable from './StudentTable.jsx'
import { Link } from 'react-router'
import { Row, Col, Button } from 'react-bootstrap'
import Ph from '../../../../utils/PromiseHelper.js'

export default class StudentList extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { filters: {}, uniqueUsersCount: null }
        this.updateFilters = this.updateFilters.bind(this)
    }

    componentDidMount() {
        this.updateUniqueUsersCount()
    }

    render() {
        const { filters } = this.state

        return (
            <div>
                <div id="notifications"></div>

                <div className='content-block'>
                    <StudentSearchForm onSubmit={this.updateFilters} />
                </div>

                <div className='content-block'>
                    <StudentTable
                        filters={filters}
                        rowsPerPage='150'
                        id='resultTable'
                    />
                </div>
            </div>
        )
    }

    static allowedRoles() {
        return [ROLES.SUPER_ADMIN, ROLES.ADMIN]
    }

    updateFilters(filters) {
        this.setState({ filters: filters })
        //this.updateUniqueUsersCount(filters)
    }

    updateUniqueUsersCount(filters) {
        if (!filters) filters = this.state.filters ? this.state.filters : {}
        filters = Object.assign({}, filters)
        filters.countOnly = true

        this.promise = Ph.ajax({
            type: 'get',
            url: `/api/users/search/students`,
            data: filters
        })
        this.promise.then(
            count => this.setState({ uniqueUsersCount: count })
        )
    }
}