import React, { PropTypes, Component } from 'react'
import Ph from '../../utils/PromiseHelper.js'

export default class extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { data: null }
    }

    load(props) {
        if (!props) props = this.props
        const { id } = props

        if (!id) return

        if (this.loadP) this.loadP.cancel()

        this.loadP = Ph.ajax({
            type: 'get',
            url: `/api/terms/${id}`
        })
        this.loadP.then(
            data => this.setState({ data: data }),
            xhr => console.error(xhr)
        )
    }

    componentWillMount() {
        this.load()
    }

    componentWillReceiveProps(nextProps) {
        this.load(nextProps)
    }

    render() {
        if (!this.state.data) return <p></p>

        const { name, term, year } = this.state.data

        return (
            <p>Active Term: {name} (term {term} {year})</p>
        )
    }
}