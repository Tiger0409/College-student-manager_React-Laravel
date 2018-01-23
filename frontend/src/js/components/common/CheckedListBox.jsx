import React from 'react'
import $ from 'jquery'
import _ from 'underscore'
import CheckedListBoxItem from './CheckedListBoxItem.jsx'

export default class CheckedListBox extends React.Component {
    constructor(props, context) {
        super(props, context)
        this.state = {items: [], selectedItems: []}
    }

    render() {
        var items = this.state.items.map(item => {
            return (
                <CheckedListBoxItem
                    label={item.label}
                    value={item.value}
                    name={this.props.id + '[]'}
                    selectedItemClass={this.props.selectedItemClass}
                    key={item.value}
                    onChange={e => this.itemSelectionChanged(e)}/>
            )
        })

        return (
            <div className={this.props.className} id={this.props.id}>
                {items}
            </div>
        )
    }

    componentDidMount() {
        $(() => {
            this.$obj = $('#' + this.props.id)
            this.loadData()
        })
    }

    componentWillReceiveProps(newProps) {
        if (JSON.stringify(this.props.params) !== JSON.stringify(newProps.params)) {
            this.clearState()
            this.loadData(newProps)
        }
    }

    clearState() {
        this.state = { items: [], selectedItems: [] }
    }

    loadData(props) {
        const { url, params } = props ? props : this.props

        $.ajax({
            type: 'get',
            data: params,
            url: url,
            dataType: 'json',
            success: (data) => {
                this.setState({ items: data })
            },
            error(xhr, status, err) {
                console.log(xhr, status, err)
            }
        })
    }

    itemSelectionChanged(e) {
        var $checkBox = $(e.target)

        this.setState(currState => {
            var selectedItems = currState.selectedItems
            if ($checkBox.prop('checked'))
                selectedItems.push($checkBox.val())
            else
                selectedItems = _.without(selectedItems, $checkBox.val())
            this.props.onChange(selectedItems, this.props.id)
            return {selectedItems: selectedItems}
        })
    }
}