import React, { PropTypes, Component } from 'react'
import { Button } from 'react-bootstrap'
import DateHelper from '../../../utils/DateHelper.js'

export default class DonationRecordsTable extends Component {
    constructor(props, context) {
        super(props, context)
        this.onCheck = this.onCheck.bind(this)
        this.onStatusToggle = this.onStatusToggle.bind(this)
    }

    onCheck(id) {
        const { onRecordCheck } = this.props
        onRecordCheck(id)
    }

    onStatusToggle(id) {
        const { onRecordStatusToggle } = this.props
        onRecordStatusToggle(id)
    }

    renderRows() {
        const { items, checkedDonationRecords } = this.props
        var rows = []
        for (let i = 0; i < items.length; i++) {
            rows.push(
                <DonationRecordRow
                    key={i}
                    item={items[i]}
                    onCheck={this.onCheck}
                    onStatusToggle={this.onStatusToggle}
                    checked={checkedDonationRecords.includes(parseInt(items[i].id))}
                />
            )
        }
        return rows
    }

    render() {
        const { items } = this.props

        if (!items || items.length === 0)
            return <p>No records yet.</p>

        return (
            <div>
                {this.renderRows()}
            </div>
        )
    }
}

DonationRecordsTable.PropTypes = {
    items: PropTypes.array,
    onRecordCheck: PropTypes.func.isRequired,
    onRecordStatusToggle: PropTypes.func.isRequired,
    checkedDonationRecords: PropTypes.array.isRequired
}

class DonationRecordRow extends Component {
    constructor(props, context) {
        super(props, context)
        this.show = this.show.bind(this)
    }

    show() {
        const { item: donationRecord } = this.props
        this.context.router.push('/donation-records/' + donationRecord.id)
    }

    render() {
        const { item: donationRecord, onCheck, onStatusToggle, checked } = this.props
        const formattedDate = DateHelper.parse(donationRecord.createdAt).toString()
        const userEmailAddress = donationRecord.userEmailAddress && donationRecord.userEmailAddress.length > 0 ?
            donationRecord.userEmailAddress : '-'
        const id = parseInt(donationRecord.id)

        return (
            <div style={{marginBottom: '-1px', border: '1px solid #ECECEC', padding: '10px'}}>
                <div style={{display: 'inline-block', width: '3%', textAlign: 'center'}}>
                    <input
                        type='checkbox'
                        onChange={() => onCheck(id)}
                        checked={checked}
                    />
                </div>

                <div style={{display: 'inline-block', width: '15%', textAlign: 'center'}}>
                    {'£ ' + donationRecord.donationAmount}
                </div>

                <div style={{display: 'inline-block', width: '45%', textAlign: 'center'}}>
                    {userEmailAddress}
                </div>

                <div style={{display: 'inline-block', width: '15%', textAlign: 'center'}}>
                    {formattedDate}
                </div>

                <div style={{display: 'inline-block', width: '10%', textAlign: 'center'}}>
                    <Button
                        onClick={() => onStatusToggle(id)}
                        bsStyle={donationRecord.isReceived ? 'success' : 'warning'}
                        style={{width: '90px'}}
                    >
                        {donationRecord.isReceived ? 'Received' : 'Pending'}
                    </Button>
                </div>

                <div style={{display: 'inline-block', width: '10%', textAlign: 'center'}}>
                    <Button style={{width: '90px'}} onClick={this.show}>Show</Button>
                </div>
            </div>
        )
    }
}

DonationRecordRow.PropTypes = {
    item: PropTypes.object.isRequired,
    onCheck: PropTypes.func.isRequired,
    onStatusToggle: PropTypes.func.isRequired,
    checkedDonationRecords: PropTypes.array.isRequired
}

DonationRecordRow.contextTypes = {
    router: PropTypes.object.isRequired,
}