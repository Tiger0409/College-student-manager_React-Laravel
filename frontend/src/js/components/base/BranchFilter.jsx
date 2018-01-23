import React, { PropTypes, Component } from 'react'
import DataLoader from '../common/DataLoader.jsx'
import { FormField } from '../common/FormWidgets.jsx'

class BranchFilter extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { selectedBranch: localStorage.getItem('branchId') }
        if (this.state.selectedBranch) {
            props.onChange(this.state.selectedBranch)
        }
        this.onChange = this.onChange.bind(this)
    }

    onChange(e) {
        const { onChange } = this.props
        const { value } = e.target

        this.setState({ selectedBranch: value })
        localStorage.setItem('branchId', value)
        onChange(value)
    }

    render() {
        const { selectedBranch } = this.state;

        const { data } = this.props

        return (
            <select
                className='form-control'
                value={selectedBranch}
                onChange={this.onChange}
            >
                <option value={""}>-- All branches --</option>
                {
                    data.map(
                        (branch, i) => <option key={i} value={branch.value}>{branch.label}</option>
                    )
                }
            </select>
        )
    }
}

BranchFilter.propTypes = {
    onChange: PropTypes.func.isRequired
}

const Composed = DataLoader(BranchFilter)

export default props => (
    <Composed
        {...props}
        ajaxOperations={{
            load: {
                type: 'get',
                url: '/api/branches-associated/list',
                data: { allowedOnly: true }
            }
        }}
    />
)