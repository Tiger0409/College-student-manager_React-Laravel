import React, { PropTypes, Component } from 'react'
import PromiseHelper from '../../utils/PromiseHelper.js'
import { Button } from 'react-bootstrap'
import FormGroup from '../common/FormGroup.jsx'
import DonationsTable from '../base/donations/DonationsTable.jsx'
import Notifier from '../../utils/Notifier.js'
import Spinner from '../common/Spinner.jsx'

export default class DonationsAdmin extends Component {
    render() {
        return (
            <div>
                <div id="notifications"></div>

                <div className='content-block'>
                    <h2 className='block-heading'>Donations Management</h2>
                    <hr/>

                    <DonationsList />
                </div>
            </div>
        )
    }
}

class DonationsList extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { isLoading: false, donations: null }
        this.requestFields = [
            'id',
            'isClosed',
            'title',
            'friendlyTitle',
            'user.userFullname',
            'donationType.type',
            'paymentMethod',
            'isShown',
            'donationRecords'
        ]
        this.loadPromise = null
        this.delete = this.delete.bind(this)
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
            url: '/api/donations',
            data: {fields: this.requestFields}
        })
        this.loadPromise.then(
            data => {
                this.setState({isLoading: false, donations: data.rows})
            },
            xhr => console.log(xhr)
        )
    }

    delete(donationIds, donationRecordIds, reason) {
        var onDeleteSuccess = xhr => {
            console.log(xhr)
            Notifier.success('Donations deleted successfully')
        }
        var onDeleteError = xhr => {
            console.log(xhr)
            Notifier.success('Donation records deleted successfully')
        }


        if (donationIds && donationIds.length > 0) {
            $.ajax({
                type: 'delete',
                url: '/api/donations',
                data: {ids: donationIds, reason: reason },
                success: onDeleteSuccess,
                error: onDeleteError
            })
        }

        if (donationRecordIds && donationRecordIds.length > 0) {
            $.ajax({
                type: 'delete',
                url: '/api/donation-records',
                data: { ids: donationRecordIds, reason: reason },
                success: onDeleteSuccess,
                error: onDeleteError
            })
        }
    }

    renderData() {
        const { isLoading, donations } = this.state

        if (isLoading) return <div><Spinner /></div>

        return (
            <div>
                <DonationsTable items={donations} onDelete={this.delete} />
            </div>
        )
    }

    render() {
        return (
            <div>
                {this.renderData()}
            </div>
        )
    }
}