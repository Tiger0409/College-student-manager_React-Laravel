import React, { PropTypes, Component } from 'react'
import Spinner from '../../common/Spinner.jsx'
import Ph from '../../../utils/PromiseHelper.js'
import Table from '../../common/Table.jsx'
import { Link } from 'react-router'
import { Row, Col, Button } from 'react-bootstrap'
import Paginator from '../../common/Paginator.jsx'
import FullDetailsWnd from './FullDetailsWnd.jsx'
import TxnFilter from './TxnFilter.jsx'
import Oh from '../../../utils/ObjHelper'

const get = Oh.getIfExists

export default class StripeTransactions extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            isLoading: false,
            totalCount: 0,
            rows: null,
            fullDetails: null,
            showFullDetails: false
        }
        this.filters = { txnId: '' }
        this.currentPage = 1
        this.rowsPerPage = 40
        this.loadPromise = null
        this.requestFields = [
            'id',
            'amount',
            'user.id',
            'user.userFullname',
            'userId',
            'cardOwnerName',
            'created',
            'status',
            'balanceTransaction',
            'fullDetails'
        ]

        this.createRow = this.createRow.bind(this)
        this.openTransaction = this.openTransaction.bind(this)
    }

    showFullDetails(details) {
        if (!details) {
            return
        }

        this.setState({ showFullDetails: true, fullDetails: details })
    }

    prepareData(data) {
        return data.map(item => {
            if (item.fullDetails && typeof item.fullDetails.created === 'object') {
                item.fullDetails.created = item.fullDetails.created.date
            }

            return item
        })
    }

    loadData() {
        this.setState({ isLoading: true })

        var requestParams = {
            page: this.currentPage,
            rowsPerPage: this.rowsPerPage,
            fields: this.requestFields,
            filters: this.filters
        }

        this.loadPromise = Ph.ajax({
            type: 'get',
            url: '/api/transactions/stripe',
            data: requestParams
        })
        this.loadPromise.promise.then(
            data => {
                this.setState({
                    isLoading: false,
                    rows: this.prepareData(data.rows),
                    totalCount: data.info.totalCount
                })
            },
            xhr => {
                this.setState({ isLoading: false })
                console.log(xhr.responseText)
            }
        )
    }

    openTransaction(id) {
        this.context.router.push(`/transactions/stripe/${id}`)
    }

    createRow(rowData) {
        let rowContent = []
        const push = (() => {
            var i = 0
            return content => rowContent.push(<td key={i++}>{content}</td>)
        })()

        push(<p>{rowData.created}</p>)
        push(<Link to={`/users/${get(rowData, 'user.id', 'deleted')}`}>{get(rowData, 'user.userFullname', 'deleted')}</Link>)
        push(<p>{parseFloat(rowData.amount).toFixed(2)}</p>)
        push(<p>{rowData.status}</p>)
        push(<p>{rowData.cardOwnerName}</p>)
        push(
            <a
                style={{ cursor: 'pointer' }}
                onClick={() => this.showFullDetails(rowData.fullDetails)}
            >
                {rowData.balanceTransaction}
            </a>
        )
        push(
            <Button onClick={() => this.openTransaction(rowData.id)}>Detail</Button>
        )

        return rowContent
    }

    componentDidMount() {
        this.loadData()
    }

    render() {
        const { isLoading, fullDetails, totalCount, showFullDetails, rows } = this.state

        if (isLoading) return <Spinner />

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

                <div className='content-block'>
                    <h2 className='block-heading'>Transactions</h2>
                    <hr />

                    <Table
                        data={rows}
                        headers={[
                            'Created At',
                            'Student Name',
                            'Total Amount',
                            'Payment Status',
                            'Card Owner Name',
                            'TXN ID',
                            ''
                        ]}
                        createRow={this.createRow}
                    />

                    <Paginator
                        currentPage={this.currentPage}
                        totalCount={totalCount}
                        rowsPerPage={this.rowsPerPage}
                        onPageChange={pageNum => { this.currentPage = pageNum; this.loadData(); }}
                    />

                    <ExportAll />

                    <FullDetailsWnd
                        heading='Stripe transaction full details'
                        show={showFullDetails}
                        data={fullDetails}
                        onClose={() => this.setState({ showFullDetails: false })}
                    />
                </div>
            </div>
        )
    }
}

StripeTransactions.contextTypes = {
    router: PropTypes.object.isRequired
}

const ExportAll = () => (
    <Row>
        <Col md={10} mdOffset={1} style={{ textAlign: 'center', paddingLeft: '30px' }}>
            <Link
                to={'transactions/print/stripe/filters/none'}
                target='_blank'
                style={{ marginRight: '15px', marginTop: '15px', display: 'inline-block', marginBottom: 10 }}
            >
                <Button className='custom' style={{ width: '185px' }}>Export all</Button>
            </Link>
        </Col>
    </Row>
)