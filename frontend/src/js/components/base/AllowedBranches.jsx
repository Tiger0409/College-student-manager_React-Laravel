import React, { PropTypes, Component } from 'react'
import DataLoader from '../common/DataLoader.jsx'
import { FormField } from '../common/FormWidgets.jsx'
import RoleFilter from '../common/RoleFilter.jsx'
import { ROLES } from '../../config/constants.js'

class AllowedBranches extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { checkedRows: this.unserialize(props.value) }
        this.onChange = this.onChange.bind(this)
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
            e.target.value = this.serialize(checkedRows)
            onChange(e)
        }
    }

    render() {
        const { data, name } = this.props
        const { checkedRows } = this.state
        if (!data || data.length == 0) return <p>No branches.</p>

        var output = []

        for (let i in data) {
            let branch = data[i]

            output.push(
                <div key={i}>
                    <input
                        type='checkbox'
                        name={name}
                        value={branch.value}
                        checked={checkedRows.includes(branch.value)}
                        onChange={this.onChange}
                    />
                    <span> {branch.label}</span>
                </div>
            )
        }

        return (
            <div style={{ margin: '15px 0 15px 0' }}>
                <p className='detail-field-label'>Select branches</p>
                <div style={{marginLeft: '10px'}}>
                    {output}
                </div>
            </div>
        )
    }

    unserialize(checkedRowsStr) {
        if (!checkedRowsStr || checkedRowsStr.length == 0)
            return []

        var result = checkedRowsStr.split('_')
        for (var i = 0; i < result.length; i++)
            result[i] = parseInt(result[i])
        return result
    }

    serialize(checkedRows) {
        return checkedRows.join('_')
    }
}
AllowedBranches.PropTypes = {
    url: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func
}

export default RoleFilter(DataLoader(AllowedBranches), [ROLES.SUPER_ADMIN, ROLES.ADMIN])