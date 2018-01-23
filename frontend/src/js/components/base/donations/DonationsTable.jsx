import React, { PropTypes, Component } from 'react'
import { Button, Panel } from 'react-bootstrap'
import { Link } from 'react-router'
import Table from '../../common/Table.jsx'
import Bench from '../../../utils/Bench.jsx'
import DonationRecordsTable from './DonationRecordsTable.jsx'
import ArrayHelper from '../../../utils/ArrayHelper.js'
import Notifier from '../../../utils/Notifier.js'
import ConfirmDeleteWnd from '../../common/ConfirmDeleteWnd.jsx'
import { LinkContainer } from 'react-router-bootstrap'

export default class DonationsTable extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            items: this.props.items,
            checkedDonations: [],
            checkedDonationRecords: [],
            expandedRows: [],
            showConfirmDelete: false,
        }
        this.headers = [
            'Title',
            'Type',
            'Payment Method',
            'Show on Front?',
            'Open / Closed',
            'Total Received',
            'Total Pending',
            'Total this month and year',
            ''
        ]
        this.renderDonation = this.renderDonation.bind(this)
        this.renderTotalsRow = this.renderTotalsRow.bind(this)
        this.delete = this.delete.bind(this)
        this.stopPropagation = this.stopPropagation.bind(this)
        this.onCheckAll = this.onCheckAll.bind(this)
        this.isCheckedAll = this.isCheckedAll.bind(this)
        this.onDonationRecordCheck = this.onDonationRecordCheck.bind(this)
        this.onDonationRecordStatusToggle = this.onDonationRecordStatusToggle.bind(this)
    }

    onToggleProp(e, donationId, propName) {
        e.stopPropagation()
        const items = DonationsHelper.toggleProp(this.state.items, donationId, propName)
        this.setState({items: items})
    }

    onDonationCheck(id) {
        var { checkedDonations } = this.state
        ArrayHelper.toggleValue(checkedDonations, id)
        this.setState({checkedDonations: checkedDonations})
    }

    onDonationRecordCheck(id) {
        var { checkedDonationRecords } = this.state
        ArrayHelper.toggleValue(checkedDonationRecords, id)
        this.setState({checkedDonationRecords: checkedDonationRecords})
    }

    onDonationRecordStatusToggle(id) {
        var { items } = this.state
        for (let i = 0; i < items.length; i++) {
            let donationRecords = items[i].donationRecords
            if (!donationRecords) continue

            for (let j = 0; j < donationRecords.length; j++) {
                if (donationRecords[j].id == id) {
                    donationRecords[j].isReceived = !donationRecords[j].isReceived
                    DonationsHelper.updateDonationRecord(
                        donationRecords[j],
                        {isReceived: donationRecords[j].isReceived}
                    )
                    this.setState({items: items})
                    return
                }
            }
        }
    }

    onCheckAll() {
        var { items, checkedDonations, checkedDonationRecords } = this.state

        if (this.isCheckedAll()) {
            checkedDonations = []
            checkedDonationRecords = []
        } else {
            for (let i = 0; i < items.length; i++) {
                let donation = items[i]
                checkedDonations.push(parseInt(donation.id))

                for (let j = 0; j < donation.donationRecords.length; j++) {
                    let donationRecord = donation.donationRecords[j]
                    checkedDonationRecords.push(parseInt(donationRecord.id))
                }
            }
        }

        this.setState({
            checkedDonations: checkedDonations,
            checkedDonationRecords: checkedDonationRecords
        })
    }

    isCheckedAll() {
        const { items, checkedDonations, checkedDonationRecords } = this.state
        for (let i = 0; i < items.length; i++) {
            let donation = items[i]
            if (!checkedDonations.includes(parseInt(donation.id))) {
                return false
            }

            for (let j = 0; j < donation.donationRecords.length; j++) {
                let donationRecord = donation.donationRecords[j]
                if (!checkedDonationRecords.includes(parseInt(donationRecord.id))) {
                    return false
                }
            }
        }

        return true
    }

    stopPropagation(e) {
        e.stopPropagation()
    }

    delete(reason) {
        var { checkedDonations, checkedDonationRecords, items } = this.state
        const { onDelete } = this.props

        onDelete(checkedDonations, checkedDonationRecords, reason)

        for (let i = 0; i < items.length; i++) {
            if (checkedDonations.includes(items[i].id)) {
                items.splice(i, 1);
                i--;
                continue;
            }

            var donationRecords = items[i].donationRecords
            if (!donationRecords)
                continue

            for (let j = 0; j < donationRecords.length; j++) {
                const id = parseInt(donationRecords[j].id)
                if (checkedDonationRecords.includes(id)) {
                    donationRecords.splice(j, 1)
                    j--;
                }
            }
        }

        this.setState({checkedDonations: [], checkedDonationRecords: [], items: items})
    }

    onRowToggle(id) {
        var { expandedRows } = this.state
        const index = expandedRows.indexOf(id)
        if (index !== -1) {
            expandedRows.splice(index, 1)
        } else {
            expandedRows.push(id)
        }

        this.setState({expandedRows: expandedRows})
    }

    renderTotalsRow() {
        const { items } = this.state

        var row = []
        var i = 0
        row.push(<td key={i++}></td>)
        row.push(
            <td key={i++}>
                Total this page
            </td>
        )

        for (let j = 0; j < 4; j++)
            row.push(<td key={i++}></td>)

        row.push(
            <td key={i++}>
                {'£ ' + DonationsHelper.calcTotalReceived(items)}
            </td>
        )
        row.push(
            <td key={i++}>
                {'£ ' + DonationsHelper.calcTotalPending(items)}
            </td>
        )
        row.push(
            <td key={i++}>
                {'£ ' + DonationsHelper.calcTotalThisMonth(items)}
            </td>
        )
        row.push(<td key={i++}></td>)

        return <tr key='totals'>{row}</tr>
    }

    renderDonation(rowObj) {
        const { checkedDonations } = this.state
        const isChecked = checkedDonations.includes(rowObj.id)

        var i = 0;
        var row = []
        row.push(
            <td key={i++}>
                <input
                    type='checkbox'
                    value={rowObj.id}
                    checked={isChecked}
                    onChange={() => this.onDonationCheck(rowObj.id)}
                    onClick={this.stopPropagation}
                />
            </td>
        )
        row.push(
            <td key={i++}>
                <Link to={'/front-donations/' + rowObj.friendlyTitle}>{rowObj.title}</Link>
            </td>
        )
        row.push(
            <td key={i++}>
                {rowObj.donationType.type}
            </td>
        )
        row.push(
            <td key={i++}>
                {rowObj.paymentMethod}
            </td>
        )
        row.push(
            <td key={i++}>
                <Button
                    onClick={(e) => this.onToggleProp(e, rowObj.id, 'isShown')}
                    bsStyle={rowObj.isShown ? 'success' : 'danger'}
                    style={{width: '50px'}}
                >
                    {rowObj.isShown ? 'Yes' : 'No'}
                </Button>
            </td>
        )
        row.push(
            <td key={i++}>
                <Button
                    onClick={(e) => this.onToggleProp(e, rowObj.id, 'isClosed')}
                    bsStyle={rowObj.isClosed ? 'danger' : 'success'}
                    style={{width: '70px'}}
                >
                    {rowObj.isClosed ? 'Closed' : 'Open'}
                </Button>
            </td>
        )
        row.push(
            <td key={i++}>
                {'£ ' + DonationsHelper.calcTotalReceived([rowObj])}
            </td>
        )
        row.push(
            <td key={i++}>
                {'£ ' + DonationsHelper.calcTotalPending([rowObj])}
            </td>
        )
        row.push(
            <td key={i++}>
                {'£ ' + DonationsHelper.calcTotalThisMonth([rowObj])}
            </td>
        )
        row.push(
            <td key={i++} width='11%'>
                <Link to={'/donations/' + rowObj.id}>Edit</Link>
            </td>
        )
        return row
    }

    renderHead() {
        return (
            <thead>
                <tr>
                    <td><input type='checkbox' checked={this.isCheckedAll()} onChange={this.onCheckAll}/></td>
                    {this.headers.map((item, i) => <td key={i}>{item}</td>)}
                </tr>
            </thead>
        )
    }

    renderBody() {
        const { items: donations, expandedRows, checkedDonationRecords } = this.state
        var rows = []

        donations.forEach((donation, i) => {
            const donationRow = this.renderDonation(donation)
            const donationId = parseInt(donation.id)

            rows.push(
                <tr
                    key={i}
                    onClick={() => this.onRowToggle(donationId)}
                    style={{cursor: 'pointer'}}>{donationRow}
                </tr>
            )

            rows.push(
                <tr key={i + '-subrow'}>
                    <td colSpan={donationRow.length} style={{padding: '0'}}>
                        <Panel collapsible expanded={expandedRows.includes(donationId)} style={{margin: '0'}}>
                            <DonationRecordsTable
                                items={donation.donationRecords}
                                checkedDonationRecords={checkedDonationRecords}
                                onRecordCheck={(id) => this.onDonationRecordCheck(id)}
                                onRecordStatusToggle={(id) => this.onDonationRecordStatusToggle(id)}
                            />
                        </Panel>
                    </td>
                </tr>
            )
        })

        return (
            <tbody>
                {rows}
                {this.renderTotalsRow()}
            </tbody>
        )
    }

    renderTable() {
        const { items } = this.state

        if (!items || items.length === 0) {
            return <p>No donations yet.</p>
        }

        return (
            <div className='table-responsive'>
                <table className='table table-striped results-table table-hover'>
                    {this.renderHead()}
                    {this.renderBody()}
                </table>
            </div>
        )
    }

    render() {
        const { showConfirmDelete } = this.state

        return (
            <div>
                {this.renderTable()}

                <LinkContainer to={{pathname: '/donations/add'}}>
                    <Button className='custom btn-success' style={{ marginRight: '15px' }}>Add</Button>
                </LinkContainer>

                <Button className='custom btn-danger' onClick={() => this.setState({ showConfirmDelete: true })}
                >
                    Delete selected
                </Button>

                <ConfirmDeleteWnd
                    show={showConfirmDelete}
                    onConfirm={this.delete}
                    onClose={() => this.setState({ showConfirmDelete: false })}
                />
            </div>
        )
    }
}

DonationsTable.PropTypes = {
    items: PropTypes.array,
    onDelete: PropTypes.func.isRequired
}

class DonationsHelper {
    static calcDonationAmount(donations, isReceived) {
        var sum = 0

        for (let i = 0; i < donations.length; i++) {
            const donationRecords = donations[i].donationRecords
            if (!donationRecords) continue

            for (let j = 0; j < donationRecords.length; j++) {
                if (donationRecords[j].isReceived === isReceived) {
                    sum += parseFloat(donationRecords[j].donationAmount)
                }
            }
        }

        return sum.toFixed(2)
    }

    static calcTotalReceived(donations) {
        return DonationsHelper.calcDonationAmount(donations, true)
    }

    static calcTotalPending(donations) {
        return DonationsHelper.calcDonationAmount(donations, false)
    }

    static calcTargetAmount(donations) {
        var sum = 0
        donations.forEach(donation => sum += parseFloat(donation.targetAmount))
        return sum.toFixed(2)
    }

    static calcTotalThisMonth(donations) {
        var sum = 0
        const currDate = new Date()

        for (let i = 0; i < donations.length; i++) {
            const donationRecords = donations[i].donationRecords
            if (donationRecords) {
                for (let j = 0; j < donationRecords.length; j++) {
                    let recordDate = new Date(donationRecords[j].createdAt)
                    if (
                        recordDate.getMonth() === currDate.getMonth() &&
                        recordDate.getYear() === currDate.getYear()
                    ) {
                        sum += parseFloat(donationRecords[j].donationAmount)
                    }
                }
            }
        }

        return sum.toFixed(2)
    }

    static toggleProp(items, id, propName) {
        for (let i = 0; i < items.length; i++) {
            if (items[i].id == id) {
                items[i][propName] = !items[i][propName]
                DonationsHelper.updateDonation(items[i], {[propName]: items[i][propName]})
            }
        }
        return items
    }

    static updateDonation(donation, fields) {
        $.ajax({
            type: 'put',
            url: '/api/donations/' + donation.id,
            data: fields,
            success: xhr => {
                Notifier.success('Updated', 250)
                console.log(xhr)
            },
            error: xhr => {
                Notifier.error('Update failed', 500)
                console.log(xhr)
            }
        })
    }

    static updateDonationRecord(donationRecord, fields) {
        $.ajax({
            type: 'put',
            url: '/api/donation-records/' + donationRecord.id,
            data: fields,
            success: xhr => {
                Notifier.success('Updated', 250)
                console.log(xhr)
            },
            error: xhr => {
                Notifier.error('Update failed', 500)
                console.log(xhr)
            }
        })
    }
}