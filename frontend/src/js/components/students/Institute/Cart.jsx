import React, { PropTypes, Component } from 'react'
import { Row, Col } from 'react-bootstrap'
import DataLoader from '../../common/DataLoader.jsx'
import Table from '../../common/Table.jsx'
import O from '../../../utils/ObjHelper.js'
import { Button } from 'react-bootstrap'
import ConfirmDialog from '../../common/ConfirmDialog.jsx'
import Notifier from '../../../utils/Notifier.js'
import PaymentForm from '../../common/PaymentForm.jsx'

class Cart extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            checkedRows: [],
            cartItems: [],
            paypalSurcharge: 0,
            showConfirmDialog: false,
            showPaymentForm: false,
            showTocDialog: false,
            toc: null
        }
        this.removeSelected = this.removeSelected.bind(this)
        this.showTocDialog = this.showTocDialog.bind(this)
        this.onTocConfirm = this.onTocConfirm.bind(this)
        this.parseData = this.parseData.bind(this)
        this.load = this.load.bind(this)
    }

    parseData(data) {
        let cartItems = []
        const get = O.getIfExists

        for (let i in data.rows) {
            let row = data.rows[i]

            cartItems.push({
                id: `${row.cartId}|${row.classId}`,
                courseTitle: get(row, 'courseClass.course.courseTitle', 'none'),
                classTime: get(row, 'courseClass.classTime'),
                priceWithSurcharge: row.priceWithSurcharge,
                studentStatus: row.studentStatus
            })
        }

        this.setState({
            cartItems: cartItems,
            paypalSurcharge: parseFloat(O.getIfExists(data, 'info.paypalSurcharge', 0)).toFixed(2)
        })
    }

    getTotalPrice() {
        const { cartItems } = this.state
        let totalPrice = parseFloat(0)
        for (let i in cartItems) {
            totalPrice += parseFloat(cartItems[i].priceWithSurcharge)
        }

        return totalPrice.toFixed(2)
    }

    load() {
        console.log('reload')
        const { execute } = this.props
        execute('load', null, this.parseData)
    }

    removeSelected() {
        const { checkedRows } = this.state
        let { cartItems } = this.state
        const { execute } = this.props

        let items = []
        for (let i in checkedRows) {
            const ids = checkedRows[i].split('|')
            const cartId = ids[0]
            const classId = ids[1]
            items.push({ cartId: cartId, classId: classId })
        }

        execute('removeCartItems', { items: items },
            () => {
                Notifier.success('Cart items deleted')
                this.load()
            },
            xhr => { console.error(xhr); Notifier.error('Error deleting cart items') }
        )

        for (let i in checkedRows) {
            for (let j in cartItems) {
                if (cartItems[j].id == checkedRows[i]) {
                    cartItems.splice(j, 1)
                }
            }
        }

        this.setState({ checkedRows: [], cartItems: cartItems })
    }

    onTocConfirm() {
        this.setState({ showTocDialog: false })
        if (this.getTotalPrice() > 0) {
            this.setState({ showPaymentForm: true })
        } else {
            $.ajax({
                url: '/api/cart/checkout',
                type: 'get',
                success: () => this.context.router.push('/payment/success'),
                error: xhr => { Notifier.error('Payment has failed, please check the details and try again'); console.error(xhr)}
            })
        }
    }

    getTotalPrice() {
        const { cartItems } = this.state
        return cartItems.reduce((sum, item) => sum + parseFloat(item.priceWithSurcharge), 0)
    }

    showTocDialog() {
        const { toc } = this.context.website
        if (!toc || toc.length === 0) {
            this.onTocConfirm()
            return
        }

        this.setState({ showTocDialog: true })
    }

    componentDidMount() {
        const { data } = this.props
        this.parseData(data)
    }

    render() {
        const {
            cartItems,
            paypalSurcharge,
            checkedRows,
            showConfirmDialog,
            showTocDialog,
            showPaymentForm
        } = this.state
        const { toc } = this.context.website

        if (showPaymentForm) {
            return (
                <div>
                    <div style={{ width: '580px', marginLeft: 'auto', marginRight: 'auto', padding: '30px' }}>
                        {cartItems.map((item, i) => (
                            <div key={i} style={{ marginBottom: '10px' }}>
                                <span style={{ width: '200px', display: 'inline-block' }}>
                                    {item.courseTitle} :
                                </span>

                                <span>£ {item.priceWithSurcharge}</span>
                            </div>
                        ))}

                        <p>Total : £ {this.getTotalPrice()}</p>
                    </div>
                    <PaymentForm url='/api/cart/checkout' checkAvailableMethods />
                </div>
            )
        }

        if (cartItems.length === 0) {
            return <h2>No classes in registration cart yet</h2>
        }

        return (
            <div>
                <div id="notifications"></div>
                <h2>Registration Cart Items</h2>

                <Table
                    data={cartItems}
                    headers={['Course Title', 'Class Time', 'Fee (+ paypal surcharge)' ]}
                    showingProps={['courseTitle', 'classTime', 'priceWithSurcharge' ]}
                    checkableRows
                    onCheckedRowsChange={checkedRows => this.setState({ checkedRows: checkedRows })}
                />

                <div style={{ marginTop: '50px' }}>
                    <p>Total course price + paypal surcharge: £ {this.getTotalPrice()}</p>

                    <p style={{ marginTop: '30px' }}>
                        Paypal surcharge is £ {paypalSurcharge} per non-free course
                    </p>
                </div>

                <div>
                    <Button
                        onClick={() => {
                            if (checkedRows.length > 0) this.setState({ showConfirmDialog: true })
                        }}
                        style={{ marginRight: '15px' }}
                    >
                        Remove selected items
                    </Button>

                    <Button
                        onClick={this.showTocDialog}
                        bsStyle='primary'
                    >
                        Checkout
                    </Button>
                </div>

                <ConfirmDialog
                    show={showConfirmDialog}
                    headerText='Delete Confirmation'
                    onYes={() => { this.removeSelected(); this.setState({ showConfirmDialog: false }) }}
                    onNo={() => this.setState({ showConfirmDialog: false })}
                />

                <ConfirmDialog
                    show={showTocDialog}
                    headerText='Terms & Conditions'
                    confirmText={toc}
                    onYes={this.onTocConfirm}
                    onNo={() => this.setState({ showTocDialog: false })}
                    yesText='Agree'
                    noText='Not agree'
                    style={{
                        height: '300px',
                        overflowY: 'auto'
                    }}
                    rawHTML
                />
            </div>
        )
    }
}

Cart.contextTypes = {
    router: PropTypes.object.isRequired,
    website: PropTypes.object.isRequired
}

const CartWrapper = DataLoader(Cart)

export default class MainWrapper extends Component {
    render() {
        const { user } = this.context

        if (!user) {
            return <div></div>
        }

        const { id } = user

        return (
            <CartWrapper
                ajaxOperations={{
                    load: {
                        type: 'get',
                        url: `/api/users/${id}/basket`,
                        data: {
                            fields: [
                                'cartId',
                                'classId',
                                'priceWithSurcharge',
                                'studentStatus',
                                'courseClass.course.courseTitle',
                                'courseClass.classTime'
                            ]
                        }
                    },
                    checkout: {
                        type: 'get',
                        url: '/api/cart/checkout'
                    },
                    removeCartItems: {
                        type: 'delete',
                        url: '/api/cart/delete'
                    }
                }}
            />
        )
    }
}

MainWrapper.contextTypes = {
    user: PropTypes.object,
    router: PropTypes.object.isRequired
}