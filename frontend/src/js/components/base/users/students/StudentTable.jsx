import React, { Component, PropTypes } from 'react'
import $ from 'jquery'
import HtmlHelper from './../../../../utils/HtmlHelper.js'
import ObjHelper from './../../../../utils/ObjHelper.js'
import { Link } from 'react-router'
import { Pager, PageItem, Button, Row, Col } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import { Html } from './../../../common/FormWidgets.jsx'

export default class StudentTable extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { currentPage: 1, foundData: {} }
        this.filters = {}
        this.lastQueryNumber = 0
    }

    render() {
        var tableRows = this.prepareTableRows()
        var pagination = this.createPagination()

        const filtersJson = JSON.stringify(this.filters)
        let buttonWrapperStyle = { marginRight: '15px', marginBottom: '15px', display: 'inline-block' }
        let buttonStyle = {}

        if (window.innerWidth < 768) {
            buttonWrapperStyle = { width: '100%' }
            buttonStyle = { width: '100%', marginBottom: 10 }
        }

        let renderLinkBtn = (url, label) => (
            <Link
                to={url}
                target='_blank'
                style={buttonWrapperStyle}
            >
                <Button className='custom' style={buttonStyle}>{label}</Button>
            </Link>
        )
        const uniqueUsersCount = ObjHelper.getIfExists(this.state, 'foundData.info.totalCount', 0)

        return (
            <div>
                <h2 className='block-heading'>Results</h2>
                <hr/>

                <div className='table-responsive'>
                    <table className='table table-striped results-table' id={this.props.id} style={{display: 'none'}}>
                        <thead id='tableHead'>
                        <tr>
                            <th style={{ width: '40% '}}>Full name</th>
                            <th>Email Address</th>
                            <th></th>
                        </tr>
                        </thead>

                        <thead id='tableAdvancedHead'>
                        <tr>
                            <th style={{ width: '25%' }}>Full name</th>
                            <th>Email Address</th>
                            <th>Course Title</th>
                            <th>Class Term</th>
                            <th>Grade Register Date</th>
                            <th></th>
                        </tr>
                        </thead>

                        <tbody>
                        {tableRows}
                        </tbody>
                    </table>
                </div>

                <div id="pagination">
                    {pagination}
                </div>

                <Row style={{ fontSize: '12pt' }}>
                    <Col md={4} mdOffset={1} sm={5} smOffset={0} style={{ textAlign: window.innerWidth < 768 ? 'left': 'right', marginBottom: 15 }}>
                        <Link
                            to={`/users/students/print/addresses/filters/${filtersJson}`}
                            target='_blank'
                            style={{ color: '#f0a300' }}
                        >
                            {'Export Addresses' + (uniqueUsersCount ? ` - ${uniqueUsersCount} unique users` : '')}
                        </Link>
                    </Col>

                    <Col sm={2} className='hidden-xs' style={{ textAlign: 'center' }}>|</Col>

                    <Col md={4} sm={5} style={{ textAlign: 'left', marginBottom: 15 }}>
                        <Link
                            to={`/users/students/print/addresses-xls/filters/${filtersJson}`}
                            target='_blank'
                            style={{ color: '#f0a300' }}
                        >
                            {'Export Addresses XLS' + (uniqueUsersCount ? ` - ${uniqueUsersCount} unique users` : '')}
                        </Link>
                    </Col>
                </Row>

                <Row>
                    <Col md={10} mdOffset={1} style={{ textAlign: 'center', paddingLeft: '30px' }}>
                        {renderLinkBtn(
                            `/users/students/print/numbers/filters/${filtersJson}`,
                            'Export Numbers'
                        )}

                        {renderLinkBtn(
                            `/users/students/print/emails/filters/${filtersJson}`,
                            'Export Emails'
                        )}

                        {renderLinkBtn(
                            `/users/students/print/grades-table/filters/${filtersJson}`,
                            'Export Grades'
                        )}

                        {renderLinkBtn(
                            `/users/students/print/grades/filters/${filtersJson}`,
                            'Export Grades Print'
                        )}
                    </Col>
                </Row>

                <Row>
                    <Col mdOffset={1} md={10} style={{ textAlign: 'center', paddingLeft: '30px' }}>
                        {renderLinkBtn(
                            `/users/students/print/details/filters/${filtersJson}`,
                            'Export List of Details'
                        )}

                        {renderLinkBtn(
                            `/users/students/print/transactions/filters/${filtersJson}`,
                            'Export Transactions'
                        )}

                        {renderLinkBtn(
                            `/users/students/print/card/filters/${filtersJson}`,
                            'Export Card'
                        )}

                        {renderLinkBtn(
                            `/users/students/print/class-details/filters/${filtersJson}`,
                            'Export Class Details'
                        )}
                    </Col>
                </Row>
            </div>
        )
    }

    componentWillReceiveProps(nextProps, nextContext) {
        const contextChanged = JSON.stringify(this.context) != JSON.stringify(nextContext)
        if (nextProps && nextProps.filters && !contextChanged) {
            this.filters = Object.assign({}, nextProps.filters)
            this.filters.page = 1
            this.loadData()
        }
    }

    componentDidMount() {
        $(() => {
            this.$table = $('#' + this.props.id)
            this.$head = this.$table.find('#tableHead')
            this.$advancedHead = this.$table.find('#tableAdvancedHead')
            this.$paginationContainer = $('#pagination')
        })
    }

    loadData() {
        var queryNumber = ++this.lastQueryNumber
        $.ajax({
            type: 'post',
            url: '/api/users/search/students',
            data: this.filters,
            success: data => {
                console.log(data)
                if (queryNumber === this.lastQueryNumber)
                    this.setState({ foundData: data })

                if (this.props.onLoad) {
                    this.props.onLoad(data)
                }
            }
        })
    }

    prepareTableRows() {
        var tablerows = []

        if (this.state.foundData && Object.keys(this.state.foundData).length > 0) {
            this.$table.css('display', 'table')

            var properties = ['fullName', 'emailAddress']
            if (this.filters.advancedSearch) {
                this.$head.css('display', 'none')
                this.$advancedHead.css('display', 'table-header-group')
                properties = properties.concat(['courseTitle', 'term', 'registerDate']);
            } else {
                this.$head.css('display', 'table-header-group')
                this.$advancedHead.css('display', 'none')
            }

            if (this.state.foundData.rows) {

                var rows = this.state.foundData.rows
                for (var i in rows) {
                    let row = rows[i]

                    var rowId = i

                    var tds = properties.map((property) => {
                        if (row.hasOwnProperty(property)) {
                            var tdKey = property
                            return (
                                <td
                                    onClick={() => { this.showUser(row.profileId) }}
                                    key={tdKey}
                                >
                                    <Html>{row[property]}</Html>
                                </td>
                            )
                        }
                    })

                    if (row.hasOwnProperty('profileId')) {
                        tds.push(
                            <td key='profileId'>
                                <Link to={'/users/' + row.profileId}>Edit</Link>
                            </td>
                        )
                    }

                    var trKey = rowId

                    tablerows.push(
                        <tr key={trKey}>
                            {tds}
                        </tr>
                    )
                }
            }
        }

        return tablerows
    }

    createPagination() {
        if (ObjHelper.checkNestedProps(this.state, 'foundData', 'info', 'totalCount')) {
            var totalCount = this.state.foundData.info.totalCount
            var pageCount = Math.ceil(totalCount / parseInt(this.props.rowsPerPage))
            var currentPage = 1
            if (this.filters.page)
                currentPage = this.filters.page

            if (pageCount == 0) return <div></div>

            return (
                <Pager>
                    <PageItem
                        onClick={() => this.turnPage(currentPage - 1)}
                        disabled={currentPage == 1}
                    >
                        &larr; Prev
                    </PageItem>
                    {' '}
                    <PageItem
                        onClick={() => this.turnPage(currentPage + 1)}
                        disabled={currentPage == pageCount}
                    >
                        Next &rarr;
                    </PageItem>

                    <p style={{ marginTop: '10px' }}>{currentPage} / {pageCount}</p>
                </Pager>
            )
        }
    }

    showUser(id) {
        this.context.router.push('/users/' + id)
    }

    turnPage(pageNum) {
        this.filters.page = parseInt(pageNum)
        this.loadData()
    }
}

StudentTable.contextTypes = {
    router: PropTypes.object.isRequired,
    branchId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    onLoad: PropTypes.func
}