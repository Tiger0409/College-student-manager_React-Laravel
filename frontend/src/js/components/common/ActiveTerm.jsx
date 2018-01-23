import React, { PropTypes, Component } from 'react'
import DataLoader from './DataLoader.jsx'

const ActiveTerm = ({ data: { name, term, year }, style }) => (
    <p style={style}>Active Term: {name} (term {term} {year})</p>
)

export default DataLoader(ActiveTerm, { load: { type: 'get', url: '/api/terms/active' } })

