import React, { PropTypes, Component } from 'react'
import DataLoader from '../../common/DataLoader.jsx'
import Table from '../../common/Table.jsx'
import O from '../../../utils/ObjHelper.js'
import { Button } from 'react-bootstrap'
import ConfirmDialog from '../../common/ConfirmDialog.jsx'
import Notifier from '../../../utils/Notifier.js'
import PaymentForm from '../../common/PaymentForm.jsx'
import autosize from '../../../libs/autosize.js'

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
        this.updates = {}
        this.removeSelected = this.removeSelected.bind(this)
        this.showTocDialog = this.showTocDialog.bind(this)
        this.onTocConfirm = this.onTocConfirm.bind(this)
        this.createSubRows = this.createSubRows.bind(this)
        this.removePlaceholder = this.removePlaceholder.bind(this)
        this.setPlaceHolder = this.setPlaceHolder.bind(this)
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
                studentStatus: row.studentStatus,
                notes: row.notes
            })
        }

        this.setState({
            cartItems: cartItems,
            paypalSurcharge: parseFloat(O.getIfExists(data, 'info.paypalSurcharge')).toFixed(2)
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
            () => Notifier.success('Cart items deleted'),
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

    showTocDialog() {
        const { toc } = this.context.website
        if (!toc || toc.length === 0) {
            this.onTocConfirm()
            return
        }

        this.setState({ showTocDialog: true })
    }

    onNotesChange(id, value) {
        let { cartItems } = this.state
        for (let i in cartItems) {
            if (cartItems[i].id == id) {
                cartItems[i].notes = value
                break
            }
        }

        if (this.updates[id]) {
            clearTimeout(this.updates[id])
            this.updates[id] = null
        }

        this.updates[id] = setTimeout(() => {
            const parts = id.split('|')
            $.ajax({
                type: 'put',
                url: `/api/cart/${parts[0]}/${parts[1]}`,
                data: { notes: value },
                error: xhr => console.error(xhr)
            })
        }, 2000)

        this.setState({ cartItems: cartItems })
    }

    removePlaceholder(e) {
        if ($(e.target).attr('placeholder') == e.target.value) {
            e.target.value = ''
        }
    }

    setPlaceHolder(e) {
        if (e.target.value == '') {
            e.target.value = $(e.target).attr('placeholder')
        }
    }

    createSubRows(rowObj, key) {
        return (
            <tr key={key}>
                <td></td>
                <td>
                    <textarea
                        className='form-control'
                        onFocus={this.removePlaceholder}
                        onBlur={this.setPlaceHolder}
                        onChange={e => this.onNotesChange(rowObj.id, e.target.value)}
                        placeholder='Please write down each persons name'
                        value={rowObj.notes}
                        style={{
                            color: rowObj.notes ? 'black' : '#A8A8A8'
                        }}
                    ></textarea>
                </td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
        )
    }

    componentDidMount() {
        const { data } = this.props
        this.parseData(data)

        $(() => autosize($('textarea')))
    }

    componentDidUpdate() {
        $(() => autosize($('textarea')))
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

                        <p>Total : £ {cartItems.reduce((sum, item) => sum + parseFloat(item.priceWithSurcharge), 0)}</p>
                    </div>

                    <PaymentForm url='/api/cart/checkout' checkAvailableMethods />
                </div>
            )
        }

        if (cartItems.length === 0) {
            return <h2>Nothing in cart yet</h2>
        }

        return (
            <div>
                <h2>Cart Items</h2>

                <Table
                    data={cartItems}
                    headers={['Title', 'Item', 'Fee']}
                    showingProps={['courseTitle', 'classTime', 'priceWithSurcharge']}
                    createSubRows={this.createSubRows}
                    onCheckedRowsChange={checkedRows => this.setState({ checkedRows: checkedRows })}
                    checkableRows
                />
              {/*---------------->change<-----------*/}
              <Button bsStyle='warning'>
                            <a href="/classes/available" style={{ fontSize: '15px' }}>Add or Amend shares</a>
              </Button>
                        
                <div style={{ marginTop: '50px' }}>
                    <p>Total course price: £ {this.getTotalPrice()}</p>

                    <p style={{ marginTop: '30px' }}>
                  
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
                        onClick={() => {

                            this.showTocDialog()
                        }}
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
                                'notes',
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