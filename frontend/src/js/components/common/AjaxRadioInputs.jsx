import React, { PropTypes, Component } from 'react'
import DataLoader from './DataLoader.jsx'

class AjaxRadioInputs extends Component {
    render() {
        const { data, name, value, onChange } = this.props

        var options = data.map((item, i) => {
            return (
                <div key={i}>
                    <input
                        type='radio'
                        name={name}
                        value={item.value}
                        checked={item.value == value}
                        onChange={onChange}
                    />
                    <span> {item.label}</span>
                </div>
            )
        })

        return (
            <div>
                {options}
            </div>
        )
    }
}
AjaxRadioInputs.PropTypes = {
    name: PropTypes.string.isRequired,
    data: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
}

export default DataLoader(AjaxRadioInputs)