import React from 'react'
import $ from 'jquery'

export default class CheckedListBoxItem extends React.Component {
    render() {
        return (
            <div>
                <label>
                    {this.props.label}
                    <input type="checkbox" name={this.props.name} value={this.props.value}/>
                </label>
            </div>
        )
    }

    componentDidMount() {
        $(() => {
            this.$checkBox = $('[name="' + this.props.name + '"][value="' + this.props.value + '"]')
            this.$checkBox.change((e) => {
                this.switchClass()
                if (this.props.onChange)
                    this.props.onChange(e)
            })
        })
    }

    switchClass() {
        if (this.$checkBox.prop('checked'))
            this.$checkBox.parent().addClass(this.props.selectedItemClass)
        else
            this.$checkBox.parent().removeClass(this.props.selectedItemClass)
    }
}