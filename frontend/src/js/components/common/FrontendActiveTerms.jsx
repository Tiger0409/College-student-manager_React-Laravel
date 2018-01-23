import React, { PropTypes, Component } from 'react'
import Ph from '../../utils/PromiseHelper.js'

export default class extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { data: null }
    }

    load() {
        this.loadP = Ph.ajax({
            type: 'get',
            url: '/api/terms/frontend'
        })
        this.loadP.then(
            data => this.setState({ data: data }),
            xhr => console.error(xhr)
        )
    }

    componentWillMount() {
        this.load()
    }

    render() {
        const { data } = this.state
        if (!data) return <div></div>

        return (
            <div>
                {
                    data.map((item, i) => <div key={i}>{item.name} (term {item.term} {item.year})</div>)
                }
            </div>
        )
    }
}