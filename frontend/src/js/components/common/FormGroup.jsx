import React from 'react'

export default class FormGroup extends React.Component {
    render() {
        return (
            <div className='form-group' id={this.props.id}>
                {this.props.children}
            </div>
        )
    }
}