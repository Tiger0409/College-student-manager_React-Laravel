import React, { PropTypes, Component } from 'react'
import DataLoader from './DataLoader.jsx'
import { FormField } from './FormWidgets.jsx'
import RoleFilter from './RoleFilter.jsx'
import { ROLES } from '../../config/constants.js'

class BranchSelector extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { checkedRows: props.value ? props.value : [] }
        this.onChange = this.onChange.bind(this)

        if (this.props.onSendClearCallback) {
            this.props.onSendClearCallback(() => this.setState({ checkedRows: [] }))
        }
    }

    onChange(e) {
        var { checkedRows } = this.state
        const { onChange } = this.props

        const value = parseInt(e.target.value)

        var index = checkedRows.indexOf(value)
        if (index === -1)
            checkedRows.push(value)
        else
            checkedRows.splice(index, 1)

        this.setState({ checkedRows: checkedRows })
        if (onChange) {
            e.target.value = checkedRows
            onChange(e)
        }
    }

    render() {
        const { data, name, label, onlySelected, readOnly } = this.props
        const { checkedRows } = this.state
        if (!data || data.length == 0) return <p>No branches.</p>

        var output = []

        for (let i in data) {
            let branch = data[i]

            const checked = checkedRows.includes(branch.value)

            output.push(
                <div key={i}>
                    <input
                        type='checkbox'
                        name={name}
                        value={branch.value}
                        checked={checked}
                        onChange={this.onChange}
                    />
                    <span style={{ verticalAlign: 'top', display: 'inline-block', marginLeft: 8, marginTop: 4 }}>{branch.label}</span>
                </div>
            )
        }

        return (
            <div style={{ margin: '15px 0 15px 0' }}>
                {label ? <p className='detail-field-label'>{label}</p> : ''}
                <div style={{ marginLeft: '10px' }}>
                    {output}
                </div>
            </div>
        )
    }
}

BranchSelector.propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.array,
    label: PropTypes.string,
    onChange: PropTypes.func,
    listedOnly: PropTypes.bool
}

const Composed = DataLoader(BranchSelector)

export default props => (
    <div>
        <Composed
            {...props}
            ajaxOperations={{ load: { type: 'get', url: '/api/branches-associated/list', data: { listedOnly : props.listedOnly} } }}
        />
    </div>
)