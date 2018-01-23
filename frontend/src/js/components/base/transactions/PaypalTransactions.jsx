import React, { Component, PropTypes } from 'react'
import { ROLES } from '../../../config/constants.js'
import Table from './../../common/Table.jsx'
import PromiseHelper from './../../../utils/PromiseHelper.js'
import Paginator from './../../common/Paginator.jsx'
import FormGroup from './../../common/FormGroup.jsx'
import { Button, Row, Col } from 'react-bootstrap'
import FullDetailsWnd from './FullDetailsWnd.jsx'
import { Link } from 'react-router'
import Spinner from '../../common/Spinner.jsx'
import TxnFilter from './TxnFilter.jsx'
import Oh from '../../../utils/ObjHelper'

const get = Oh.getIfExists

export default class PaypalTransactions extends Component {
    render() {
        if (!this.props.appTypeKey || !PaypalTransactions.allowedRoles().includes(this.props.appTypeKey))
            return false

        return (
            <div>
                <TransactionTable />
            </div>
        )
    }

    static allowedRoles() {
        return [ROLES.ADMIN, ROLES.SUPER_ADMIN]
    }
}

class TransactionTable extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            isLoading: false,
            totalCount: 0,
            rows: null,
            showFullDetails: false,
            fullDetails: null
        }
        this.currentPage = 1
        this.rowsPerPage = 40
        this.loadPromise = null
/*        this.requestFields =  [
            'id',
            'lastUpdate',
            'user.id',
            'user.userFullname',
            'totalCalculatedPrice',
            'totalDiscount',
            'paymentStatus',
            'txnId',
            'fullDetails'
        ]*/
        this.filters = { txnId: '' }
        this.createRow = this.createRow.bind(this)
    }

    render() {
        const { showFullDetails, fullDetails } = this.state

        if (this.state.isLoading)
            return (<div><Spinner /></div>)

        return (
            <div>
                <div className="content-block">
                    <TxnFilter
                        onSubmit={
                            txnId => {
                                this.filters.txnId = txnId
                                this.currentPage = 1
                                this.loadData()
                            }
                        }
                    />
                </div>

                <div className="content-block">
                    <h2 className='block-heading'>Transactions</h2>
                    <hr />

                    {this.showTable()}

                    <Paginator
                        currentPage={this.currentPage}
                        totalCount={this.state.totalCount}
                        rowsPerPage={this.rowsPerPage}
                        onPageChange={pageNum => { this.currentPage = pageNum; this.loadData(); }}
                    />

                    <ExportAll />
                </div>

                <FullDetailsWnd
                    heading='Paypal transaction full details'
                    show={showFullDetails}
                    data={fullDetails}
                    onClose={() => this.setState({ showFullDetails: false })}
                />
            </div>
        )
    }

    showTable() {
        return (
            <Table
                data={this.state.rows}
                headers={['Last Update', 'Student Name', 'Total Price', 'Total Discount', 'Payment Status', 'TXN ID']}
                createHead={headers => this.createHead(headers)}
                createRow={this.createRow}
            />
        )
    }

    createHead(headers) {
        var head = []
        head = head.concat(Table.createHeadBase(headers))
        head.push(<td key='detail'></td>)

        return head
    }

    showDetail(id) {
        this.context.router.push(`/transactions/paypal/${id}`)
    }

    showFullDetails(details) {
        if (!details) {
            return
        }

        this.setState({ showFullDetails: true, fullDetails: details })
    }

    createRow(rowData) {
        let rowContent = []
        let i = 0
        const push = content => rowContent.push(<td key={i++}>{content}</td>)

        push(<p>{rowData.lastUpdate}</p>)
        push(<Link to={`/users/${rowData.userId}`}>{rowData.userFullname}</Link>)
        push(<p>{rowData.totalCalculatedPrice}</p>)
        push(<p>{rowData.totalDiscount}</p>)
        push(<p>{rowData.paymentStatus}</p>)
        push(
            <a
                onClick={() => this.showFullDetails(rowData.fullDetails)}
                style={{ cursor: 'pointer' }}
            >
                {rowData.txnId}
            </a>
        )
        push(<Button onClick={() => this.showDetail(rowData.id)}>Detail</Button>)


        return rowContent
    }

    loadData() {
        this.setState({isLoading: true})

        var requestParams = {
            page: this.currentPage,
            rowsPerPage: this.rowsPerPage,
            filters: this.filters
        }

        this.loadPromise = PromiseHelper.makeCancelableAjax(
            $.ajax({
                type: 'get',
                url: '/api/transactions/paypal',
                data: requestParams
            })
        )
        this.loadPromise.promise.then(
            data => {
                this.setState({
                    isLoading: false,
                    rows: data.rows,
                    totalCount: data.info.totalCount
                })
            },
            xhr => {
                this.setState({ isLoading: false })
                console.log(xhr.responseText)
            }
        )
    }

    componentDidMount() {
        this.loadData()
    }

    componentWillUnmount() {
        if (this.loadPromise)
            this.loadPromise.cancel()
    }
}

TransactionTable.contextTypes = {
    router: PropTypes.object.isRequired
}

const ExportAll = () => (
    <Row>
        <Col md={10} mdOffset={1} style={{ textAlign: 'center', paddingLeft: '30px' }}>
            <Link
                to={'transactions/print/paypal/filters/none'}
                target='_blank'
                style={{ marginRight: '15px', marginTop: '15px', display: 'inline-block', marginBottom: 10 }}
            >
                <Button className='custom' style={{ width: '185px' }}>Export all</Button>
            </Link>
        </Col>
    </Row>
)