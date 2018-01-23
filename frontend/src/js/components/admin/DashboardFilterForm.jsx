import React from 'react'
import { Row, Col, Button } from 'react-bootstrap'
import SourceSelect from './../common/SourceSelect.jsx'
import Term from '../../classes/Term.js'
import Spinner from '../common/Spinner.jsx'

let styles = {
    sourceSelect: { width: '300px', display: 'inline-block', marginBottom: 15 },
    button: { marginLeft: '15px' }
}

// mobile device
if (window.innerWidth < 768) {
    styles = {
        sourceSelect: { marginBottom: 10 },
        button: { display: 'block', marginBottom: 10 }
    }    
}

export default class DashboardFilterForm extends React.Component {
    constructor(props, context) {
        super(props, context)
        this.state = props.initialFilters ? props.initialFilters : { term: 'All' }
        this.promises = {}
        this.promises['activeTerm'] = Term.getActive(term => this.setState({ term: term.id }))

        this.submitFilters = this.submitFilters.bind(this)
        this.handleFieldChange = this.handleFieldChange.bind(this)
    }

    componentWillUnmount() {
        for (const key in this.promises) {
            if (this.promises[key]) this.promises[key].cancel()
        }
    }

    render() {
        if (this.props.visible === false)
            return <div><Spinner /></div>

        return (
            <form method='post' id='filterForm' onSubmit={this.submitFilters} style={{ marginBottom: '10px' }}>
                <SourceSelect
                    url='/api/terms/list'
                    className='form-control'
                    name='term'
                    id='term'
                    value={this.state.term}
                    onChange={this.handleFieldChange}
                    style={styles.sourceSelect}
                >
                </SourceSelect>

                <Button style={styles.button} className='custom btn-success' type='submit'>Filter</Button>
            </form>
        )
    }

    handleFieldChange(e) {
        this.setState({[e.target.name]: e.target.value})
    }

    submitFilters(e) {
        e.preventDefault()
        var term = this.state.term
        if (!term)
            return

        this.props.onFiltersSubmit({ term: term })
    }
}