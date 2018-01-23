import React, { PropTypes, Component } from 'react'
import Ph from '../../../utils/PromiseHelper'

export default class extends Component {
    constructor(props, context) {
        super(props, context)
        this.currentPage = 1
        this.rowsPerPage = 40
        this.fields = [

        ]

        this.state = {
            filters: {

            }
        }
    }

    load() {
        const { filters } = this.state

        this.setState({ isLoading: true })

        var requestParams = {
            page: this.currentPage,
            rowsPerPage: this.rowsPerPage,
            fields: this.fields,
            filters: filters
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

    componentDidMount() {
        this.load()
    }

    render() {
        return (
            <div>

            </div>
        )
    }
}