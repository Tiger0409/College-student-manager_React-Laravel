import React, { Component, PropTypes } from 'react'
import ObjHelper from './../../utils/ObjHelper.js'
import { Html } from './FormWidgets.jsx'

export default class Table extends Component {
    constructor(props, context) {
        super(props, context)
        if (props.checkableRows) {
            this.state = {
                checkedAll: false,
                checkedRows: []
            }
            this.rowIds = []
        }
    }

    createSubRows(rowObj) {
        if (this.props.createSubRows) {
            return this.props.createSubRows(rowObj)
        }

        return null
    }

    createRow(rowObj) {
        var row = []

        if (this.props.checkableRows && rowObj.hasOwnProperty('id')) {
            if (!this.props.checkableRowCondition || this.props.checkableRowCondition(rowObj)) {
                let rowId = rowObj.id.toString()
                this.rowIds.push(rowId)

                row.push(<td key='checkbox'>
                    <input
                        type='checkbox'
                        value={rowObj.id}
                        onChange={e => this.handleSelect(e)}
                        onClick={e => e.stopPropagation()}
                        checked={this.state.checkedRows.includes(rowId)}
                    />
                </td>)
            } else {
                row.push((<td key='checkbox'><input name='' type='checkbox' disabled='disabled'/></td>))
            }
        }

        if (this.props.createRow)
            row = row.concat(this.props.createRow(rowObj, this.props.showingProps))
        else
            row = row.concat(Table.createRowBase(rowObj, this.props.showingProps))

        return row
    }

    createHead() {
        const { headers, createHead, checkableRows } = this.props
        if (!headers && !createHead) return false

        var headData = []

        if (checkableRows) {
            headData.push(<td key='checkbox'>
                <input
                    type='checkbox'
                    onChange={e => this.handleSelectAll(e.target.checked)}
                    checked={this.state.checkedAll}/>
            </td>)
        }

        if (this.props.createHead)
            headData = headData.concat(createHead(headers))
        else
            headData = headData.concat(Table.createHeadBase(headers))

        return (
            <thead>
            <tr>
                {headData}
            </tr>
            </thead>
        )
    }

    createBody() {
        const { data, additionalRows, onRowClick, rowStyle } = this.props
        if (!data) return false

        var rows = []
        for (let i = 0; i < data.length; i++) {
            var row = (
                <tr
                    key={i}
                    style={rowStyle ? rowStyle : {}}
                    onClick={e => { if (onRowClick) onRowClick(e, data[i]) }}
                    className={i % 2 === 0 ? 'odd' : 'even'}
                >
                    {this.createRow(data[i])}
                </tr>
            )
            rows.push(row)
            let subRows = this.createSubRows(data[i], i)
            if (subRows) {
                if (Array.isArray(subRows)) {
                    rows = rows.concat(subRows)
                } else {
                    rows.push(subRows)
                }
            }
        }

        return (
            <tbody>
                {rows}
            </tbody>
        )
    }

    render() {
        const { checkableRows, className, style } = this.props

        if (checkableRows)
            this.rowIds = []

        var head = this.createHead()
        var body = this.createBody()
        var tableClass = className ? className : 'table'

        return (
            <div className='table-responsive'>
                <table className={tableClass} style={style}>
                    {head}
                    {body}
                </table>
            </div>
        )
    }


    handleSelectAll(checked) {
        var newState = {}
        if (checked) {
            newState = { checkedAll: true, checkedRows: this.rowIds }
        }
        else {
            newState = { checkedAll: false, checkedRows: [] }
        }

        if (this.props.onCheckedRowsChange)
            this.props.onCheckedRowsChange(newState.checkedRows)
        this.setState(newState)
    }

    handleSelect(e) {
        var value = $(e.target).val()
        var checkedRows = this.state.checkedRows
        var valueIndex = checkedRows.indexOf(value)

        var newState = {}

        if (e.target.checked && valueIndex === -1) {
            checkedRows.push(value)
            if (checkedRows.length === this.rowIds.length)
                newState.checkedAll = true
        }
        else if (!e.target.checked && valueIndex !== -1) {
            checkedRows.splice(valueIndex, 1)
            newState.checkedAll = false
        }

        newState.checkedRows = checkedRows
        if (this.props.onCheckedRowsChange)
            this.props.onCheckedRowsChange(newState.checkedRows)

        this.setState(newState)
    }

    static createHeadBase(headers) {
        let head = []
        for (let i = 0; i < headers.length; i++)
            head.push(<td key={i}>{headers[i]}</td>)

        return head
    }

    static createRowBase(rowObj, showingProps, rawHtml) {
        var rowContent = []
        if (showingProps) {
            showingProps.forEach(prop => {
                let propValue = null
                if (prop.indexOf('.') != -1)
                    propValue = ObjHelper.accessObjByPath(rowObj, prop)
                else
                    propValue = rowObj[prop]

                if (rawHtml) {
                    propValue = (<Html>{propValue}</Html>)
                }

                rowContent.push(<td key={prop}>{propValue}</td>)
            })
        } else {
            for (var prop in rowObj) {
                let value = rowObj[prop]
                if (rawHtml) {
                    value = (<Html>{value}</Html>)
                }
                rowContent.push(<td key={prop}>{value}</td>)
            }
        }

        return rowContent
    }

    componentWillReceiveProps(newProps) {
        if (newProps.hasOwnProperty('selectAllEventValue') && newProps.selectAllEventValue !== null) {
            this.handleSelectAll(newProps.selectAllEventValue)
        }
    }
}
Table.PropTypes = {
    style: PropTypes.object,
    data: PropTypes.array,
    className: PropTypes.string,
    showingProps: PropTypes.arrayOf(PropTypes.string),
    headers: PropTypes.arrayOf(PropTypes.string),
    createHead: PropTypes.func,
    createRow: PropTypes.func,
    onRowClick: PropTypes.func,
    rowStyle: PropTypes.object,
    checkableRows: PropTypes.bool,
    checkableRowCondition: PropTypes.func,
    onCheckedRowsChange: PropTypes.func,
    additionalRows: PropTypes.oneOf([
        PropTypes.element,
        PropTypes.arrayOf(PropTypes.element)]
    )
}