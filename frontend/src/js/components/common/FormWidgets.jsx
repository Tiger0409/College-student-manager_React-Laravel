import React, { Component, PropTypes } from 'react'
import FormGroup from './FormGroup.jsx'
import { Row, Col, Button } from 'react-bootstrap'
import _ from 'lodash'
import Sh from '../../utils/StringHelper.js'
import Oh from '../../utils/ObjHelper.js'
import Ph from '../../utils/PromiseHelper.js'
import Switchable from '../common/Switchable.jsx'
import autosize from '../../libs/autosize.js'
import SourceSelect from '../common/SourceSelect.jsx'

export class FormField extends Component {
    render() {
        const { offset, width, name, label, children, labelRawHTML, style } = this.props

        var labelComponent = false
        if (label && label.length > 0) {
            if (labelRawHTML) {
                labelComponent = (
                    <p
                        className='detail-field-label'
                        dangerouslySetInnerHTML={{__html: label}}>
                    </p>
                )
            } else {
                labelComponent = (<label className='detail-field-label' htmlFor={name}>{label}</label>)
            }
        }

        return (
            <Col mdOffset={offset} md={width} style={style}>
                <FormGroup>
                    {labelComponent}
                    {children}
                </FormGroup>
            </Col>
        )
    }
}

FormField.propTypes = {
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.string,
    children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    labelRawHTML: PropTypes.bool,
    name: PropTypes.string
}

export class LabeledValue extends Component {
    constructor(props, context) {
        super(props, context)
    }

    render() {
        const { label, asRow, width } = this.props
        var { value } = this.props
        if (value == null || value.length === 0) {
            value = '----------------'
        } else if (_.isObject(value)) {
            value = JSON.stringify(value)
        }
        const formGroup = (
            <FormGroup>
                <p className='detail-field-label'>{label}</p>
                <p
                    className='detail-field-value'
                    onClick={e => this.setState({editMode: true})}>
                    {value}
                </p>
            </FormGroup>
        )

        if (!asRow) {
            return formGroup
        }

        return (
            <Row>
                <Col md={width ? width: 6}>
                    {formGroup}
                </Col>
            </Row>
        )
    }
}
LabeledValue.PropTypes = {
    label: PropTypes.string,
    value: PropTypes.any,
    asRow: PropTypes.bool,
    width: PropTypes.number
}
export class EditableValueInlineBlock extends Component {
    constructor(props, context) {
        super(props, context)

        const children = props.children

        this.state = {
            editMode: false,
            value: props.value,
            name: props.name ? props.name : (Array.isArray(children) ? children[0].props.name  : children.props.name)
        }

        this.onClickOutside(() => this.finishEditing())
    }

    handleFieldChange(e) {
        this.setState({ value: e.target.value })
    }

    handleKeyUp(e, type = null) {
        var type = type ? type : e.target.type
        switch (type) {
            case 'radio':
            case 'text':
                if (e.key === 'Enter')
                    this.finishEditing()
                break
        }
    }

    finishEditing() {
        const { onFieldChange } = this.props
        const { name, value, editMode } = this.state

        if (editMode) {
            this.setState({editMode: false})
            if (onFieldChange)
                onFieldChange(name, value)
        }
    }

    onClickOutside(callback) {
        const { name } = this.state

        $('html').click(e => {
            if (e.target.name !== name)
                callback()
        });
    }

    componentWillReceiveProps(newProps, newContext) {
        if (this.props.enableExternalUpdates) {
            this.setState({ value: newProps.value })
        }
    }

    render() {
        var { value, editMode } = this.state
        const { children, rawHTML, label, noValueText, formatValue } = this.props

        let emptyValue = false

        if (editMode === false) {
            if (value == null || value.length === 0) {
                value = noValueText ? noValueText : '----------------'
                emptyValue = true
            }
        }

        var valueContainer
        if (editMode) {
            let injectProps = (children, key) => {
                if (Array.isArray(children)) children = children[0]

                let props = {
                    onChange: e => this.handleFieldChange(e),
                    onKeyUp: e => this.handleKeyUp(e),
                    key: key
                }
                switch (children.props.type) {
                    case 'radio':
                        Object.assign(props, {
                            value: children.props.value,
                            checked: value == children.props.value
                        })
                        break
                    default:
                        Object.assign(props, { value: value })
                }

                return React.cloneElement(children, props)
            }

            if (children.type == 'div') {
                valueContainer = []
                children.props.children.forEach((child, index) => {
                    if (child.type == 'input')
                        valueContainer.push(injectProps(child, index))
                    else
                        valueContainer.push(child)
                })
                valueContainer = (
                    <div>
                        {valueContainer}
                    </div>
                )
            } else {
                valueContainer = injectProps(children)
            }
        }
        else {
            const viewClass = (emptyValue ?
                    'detail-field-empty' : 'detail-field-value') + ' highlighted'

            if (!emptyValue) {
                const { valueView } = this.props
                value = valueView ? valueView(value) : value
            }

            if (rawHTML) {
                valueContainer = (
                    <p
                        className={viewClass}
                        style={{ color: emptyValue ? '#7d8c7e' : 'black',margin:'0'}}
                        onClick={() => {
                            let { value } = this.state
                            if (formatValue) value = formatValue(value)
                            this.setState({ editMode: true, value: value })
                        }}
                        dangerouslySetInnerHTML={{ __html: value }}>
                    </p>
                )
            } else {
                valueContainer = (
                    <p
                        className={viewClass}
                        style={{margin:'0',fontSize:"11pt",fontWeight:'normal'}}
                        onClick={() => {
                            let { value } = this.state
                            if (formatValue) value = formatValue(value)
                            this.setState({ editMode: true, value: value })
                        }}>
                        {value}
                    </p>
                )
            }
        }

        return (
            <div className='form-group'  style={{display:'inline-block',width:'20%'}}>
                <p className='detail-field-label'>{label}</p>
                {valueContainer}
            </div>
        )
    }
}
export class EditableValue extends Component {
    constructor(props, context) {
        super(props, context)

        const children = props.children

        this.state = {
            editMode: false,
            value: props.value,
            name: props.name ? props.name : (Array.isArray(children) ? children[0].props.name  : children.props.name)
        }

        this.onClickOutside(() => this.finishEditing())
    }

    handleFieldChange(e) {
        this.setState({ value: e.target.value })
    }

    handleKeyUp(e, type = null) {
        var type = type ? type : e.target.type
        switch (type) {
            case 'radio':
            case 'text':
                if (e.key === 'Enter')
                    this.finishEditing()
                break
        }
    }

    finishEditing() {
        const { onFieldChange } = this.props
        const { name, value, editMode } = this.state

        if (editMode) {
            this.setState({editMode: false})
            if (onFieldChange)
                onFieldChange(name, value)
        }
    }

    onClickOutside(callback) {
        const { name } = this.state

        $('html').click(e => {
            if (e.target.name !== name)
                callback()
        });
    }

    componentWillReceiveProps(newProps, newContext) {
        if (this.props.enableExternalUpdates) {
            this.setState({ value: newProps.value })
        }
    }

    render() {
        var { value, editMode } = this.state
        const { children, rawHTML, label, noValueText, formatValue } = this.props

        let emptyValue = false

        if (editMode === false) {
            if (value == null || value.length === 0) {
                value = noValueText ? noValueText : '----------------'
                emptyValue = true
            }
        }

        var valueContainer
        if (editMode) {
            let injectProps = (children, key) => {
                if (Array.isArray(children)) children = children[0]

                let props = {
                    onChange: e => this.handleFieldChange(e),
                    onKeyUp: e => this.handleKeyUp(e),
                    key: key
                }
                switch (children.props.type) {
                    case 'radio':
                        Object.assign(props, {
                            value: children.props.value,
                            checked: value == children.props.value
                        })
                        break
                    default:
                        Object.assign(props, { value: value })
                }

                return React.cloneElement(children, props)
            }

            if (children.type == 'div') {
                valueContainer = []
                children.props.children.forEach((child, index) => {
                    if (child.type == 'input')
                        valueContainer.push(injectProps(child, index))
                    else
                        valueContainer.push(child)
                })
                valueContainer = (
                    <div>
                        {valueContainer}
                    </div>
                )
            } else {
                valueContainer = injectProps(children)
            }
        }
        else {
            const viewClass = (emptyValue ?
                    'detail-field-empty' : 'detail-field-value') + ' highlighted'

            if (!emptyValue) {
                const { valueView } = this.props
                value = valueView ? valueView(value) : value
            }

            if (rawHTML) {
                valueContainer = (
                    <p
                        className={viewClass}
                        style={{ color: emptyValue ? '#7d8c7e' : 'black'}}
                        onClick={() => {
                            let { value } = this.state
                            if (formatValue) value = formatValue(value)
                            this.setState({ editMode: true, value: value })
                        }}
                        dangerouslySetInnerHTML={{ __html: value }}>
                    </p>
                )
            } else {
                valueContainer = (
                    <p
                        className={viewClass}
                        onClick={() => {
                            let { value } = this.state
                            if (formatValue) value = formatValue(value)
                            this.setState({ editMode: true, value: value })
                        }}>
                        {value}
                    </p>
                )
            }
        }

        return (
            <FormGroup>
                <p className='detail-field-label'>{label}</p>
                {valueContainer}
            </FormGroup>
        )
    }
}
EditableValue.PropTypes = {
    label: PropTypes.string.isRequired,
    enableExternalUpdates: PropTypes.bool,
    value: PropTypes.string,
    onFieldChange: PropTypes.func,
    rawHTML: PropTypes.bool,
    name: PropTypes.string,
    children: PropTypes.oneOfType(PropTypes.element, PropTypes.arrayOf(PropTypes.element)),
    noValueText: PropTypes.string
}

export class EditableHTML extends Component {
    constructor(props, context) {
        super(props, context)
        this.state={value: this.props.value, editing: false}
        this.onClickOutside(() => this.finishEditing())
    }

    componentDidMount() {
        $(() => autosize($('textarea')))
    }

    render() {
        const { value, editing } = this.state
        const { name, height, onlyEdit } = this.props

        var style = { height: height, marginBottom: '20px', overflowY: 'auto !important' }

        if (editing || onlyEdit) {
            return (
                <div>
                    <textarea className='form-control' name={name} id={name} style={style}
                              value={value} onChange={e => this.change(e)}></textarea>
                </div>
            )
        } else {
            return (
                <div className='form-control' dangerouslySetInnerHTML={{__html: value}}
                     style={style} onClick={() => {this.setState({ editing: true })}}></div>
            )
        }
    }

    change(e) {
        const { onChange } = this.props
        if (onChange) onChange(e)
        this.setState({ value: e.target.value })
    }

    onClickOutside(callback) {
        const { name } = this.props

        $('html').click(e => {
            if (e.target.name !== name)
                callback()
        });
    }

    finishEditing() {
        const { editing, value } = this.state
        if (!editing) return

        this.setState({editing: false})
        const { name, onChange } = this.props
    }
}
EditableHTML.PropTypes = {
    onChange: PropTypes.func,
    value: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    height: PropTypes.string,
    onlyEdit: PropTypes.bool
}
EditableHTML.defaultProps = {height: '500px'}

export const RadioInput = ({ name, value, label, checked, onChange }) => (
    <div style={{ marginTop: 10 }}>
        <input
            key={'input'}
            type='radio'
            name={name}
            value={value}
            checked={checked}
            onChange={onChange}
            style={{ verticalAlign: 'middle' }}
        />
        <span key={'label'} style={{ verticalAlign: 'top' }}>{label ? label : Sh.ucFirst(value)}</span>
        <br key={'br'} />
    </div>
)

// settins onChange

export class SettingsForm extends Component {
    componentDidMount() {
        $(() => autosize($('textarea')))
    }

    render() {
        const { settings, onChange } = this.props

        if (!settings || settings.length === 0) {
            return <p>Loading...</p>
        }

        settings.sort(
            (settingA, settingB) => parseInt(settingA.settingWeight) > parseInt(settingB.settingWeight)
        )

        const formFields = settings.map((setting, i) => {
            let input = null
            switch (setting.settingType) {
                case 'radio':
                    input = setting.settingOptions.map((option, j) =>
                        <RadioInput
                            key={j}
                            name={setting.settingKey}
                            value={option}
                            checked={setting.settingValue == option}
                            onChange={onChange}
                        />
                    )
                    break

                case 'select':
                    input = (
                        <select
                            className='form-control'
                            name={setting.settingKey}
                            value={setting.settingValue}
                            onChange={onChange}>
                            {
                                setting.settingOptions.map((option, j) =>
                                    <option key={j} value={option}>{option}</option>
                                )
                            }
                        </select>
                    )
                    break

                case 'textarea':
                    input = (
                        <textarea
                            className='form-control'
                            name={setting.settingKey}
                            value={setting.settingValue}
                            onChange={onChange}
                        >
                    </textarea>
                    )
                    break

                default:
                    input = (
                        <input
                            type={setting.setingType}
                            name={setting.settingKey}
                            value={setting.settingValue}
                            className='form-control'
                            onChange={onChange}
                        />
                    )
                    break
            }

            return (
                <FormField key={i} width={12} label={setting.settingLabel} labelRawHTML>
                    {input}
                </FormField>
            )
        })

        return (
            <Row>
                {formFields}
            </Row>
        )
    }
}

export class CheckableItemList extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { checkedRows: [] }
        this.onChange = this.onChange.bind(this)
    }

    componentWillMount() {
        this.setAlreadyChecked(this.props)
    }

    setAlreadyChecked(props) {
        var { checkedRows } = this.state
        const { items } = props
        if (items) {
            items.forEach(term => checkedRows.push(parseInt(term.id)))
        }

        this.setState({ checkedRows: checkedRows })
    }

    onChange(e) {
        const value = parseInt(e.target.value)
        var { checkedRows } = this.state

        const index = checkedRows.indexOf(value)
        if (index !== -1) {
            checkedRows.splice(index, 1)
        } else {
            checkedRows.push(value)
        }
        this.setState({ checkedRows: checkedRows })

        const { onChange, options, name } = this.props
        if (onChange) {
            var newItems = options.filter(item => checkedRows.includes(parseInt(item.id)))
            onChange(name, newItems)
        }
    }

    render() {
        const { checkedRows } = this.state
        const { options, labelProp, style } = this.props

        if (!options || options.length === 0) {
            return <p>No items defined</p>
        }

        return (
            <div style={style}>
                {
                    options.map((item, i) => (
                        <div key={i}>
                            <input
                                type='checkbox'
                                onChange={this.onChange}
                                value={item.id}
                                checked={checkedRows.indexOf(parseInt(item.id)) !== -1}
                            />
                            <span> {Oh.accessObjByPath(item, labelProp)}</span>
                        </div>
                    ))
                }
            </div>
        )
    }
}

export const ItemListView = ({ items, showingProp, width }) => {

    if (!items || items.length === 0) {
        return <p className='highlighted'>No items selected</p>
    }

    return (
        <Row>
            <Col md={width ? width : 5} className='highlighted'>
                {
                    items.map(
                        (item, i) => <p key={i}>{Oh.accessObjByPath(item, showingProp)}</p>
                    )
                }
            </Col>
        </Row>
    )
}

export const RadioInputs = ({ options, name, value, onChange }) => {
    let inputs = ''
    if (options && options.length > 0) {
        inputs = options.map((item, i) => {
            return (
                <div key={i} style={{ marginTop: 10 }}>
                    <input
                        type='radio'
                        name={name}
                        value={item.value}
                        checked={item.value == value}
                        onChange={onChange}
                        style={{ verticalAlign: 'middle' }}
                    />
                    <span style={{ verticalAlign: 'top' }}>{item.label}</span>
                </div>
            )
        })
    }

    return (
        <div>
            {inputs}
        </div>
    )
}

export const EditableItemList = Switchable(CheckableItemList, ItemListView)

export const Select = props => {
    const { options, children } = props
    let selectProps = Oh.except(props, ['options'])

    if (!selectProps.className) {
        selectProps.className = 'form-control'
    }

    return (
        <select {...selectProps}>
            {
                options ?
                    options.map(
                        (option, i) => <option key={i} value={option.value}>{option.label}</option>
                    ) :
                    false
            }

            {children}
        </select>
    )
}

export const Html = props => (
    <div dangerouslySetInnerHTML={{ __html: props.children }}></div>
)

export class PostcodeSelect extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { postcodeAddresses: null, postcodeTown: null }
        this.searchAddress = this.searchAddress.bind(this)
    }

    searchAddress() {
        const { postcode } = this.props
        if (!postcode || postcode.length === 0) {
            return
        }

        if (this.getPostcodePromise) {
            this.getPostcodePromise.cancel()
        }

        this.getPostcodePromise = Ph.ajax({
            type: 'get',
            url: '/api/users/get-postcode-data',
            data: { postcode: postcode }
        })

        this.getPostcodePromise.then(
            data => {
                const get = Oh.getIfExists
                const parsed = JSON.parse(data)

                let postcodeAddresses = []
                const line1 = get(parsed, 'line1', [])
                const line2 = get(parsed, 'line2', [])

                for (let i = 0; i < line1.length; i++) {
                    const line1Address = Oh.concatProps(line1[i])
                    const line2Address = i < line2.length ? Oh.concatProps(line2[i]) : ''
                    postcodeAddresses.push({ line1: line1Address, line2: line2Address })
                }

                this.setState({
                    postcodeAddresses: postcodeAddresses,
                    postcodeTown: get(parsed, 'town', null)
                })
            },
            xhr => console.error(xhr)
        )
    }

    renderPostcodeAddressSelect() {
        const { postcodeAddresses, postcodeTown } = this.state
        const { addressPropName, address2PropName, address, cityPropName, onChange } = this.props

        if (!postcodeAddresses || postcodeAddresses.length === 0) {
            return ''
        }

        return (
            <div style={{ marginTop: '10px' }}>
                <select
                    className='form-control'
                    type='text'
                    name={addressPropName}
                    onChange={e => {
                        const address = postcodeAddresses[e.target.value]
                        onChange({ target: { name: addressPropName, value: address.line1 } })
                        onChange({ target: { name: address2PropName, value: address.line2 } })
                        const town = Oh.concatProps(postcodeTown, ' ')
                        if (town && town.length > 0) {
                            onChange({ target: { name: cityPropName, value: town }})
                        }
                    }}
                    value={address}
                >
                    <option value=''>Select address</option>
                    {
                        postcodeAddresses.map(
                            (address, i) => {
                                const addressLine1 = address.line1
                                return (
                                    <option key={i} value={i}>{addressLine1}</option>
                                )
                            }
                        )
                    }
                </select>
            </div>
        )
    }

    render() {
        const { postcodePropName, postcode, onTextChange } = this.props

        return (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <input
                    className='form-control'
                    style={{ display: 'inline-block', width: '160px' }}
                    type='text'
                    name={postcodePropName}
                    onChange={onTextChange}
                    value={postcode}
                />

                <Button
                    style={{
                        marginLeft: '10px',
                        minWidth: '48px',
                        width: '48px',
                        lineHeight: '21px',
                    }}
                    className='custom btn-success'
                    onClick={this.searchAddress}
                >
                    GO
                </Button>

                {this.renderPostcodeAddressSelect()}
            </div>
        )
    }
}

PostcodeSelect.propTypes = {
    postcode: PropTypes.string,
    postcodePropName: PropTypes.string,
    addressPropName: PropTypes.string,
    address2PropName: PropTypes.string,
    address: PropTypes.string,
    cityPropName: PropTypes.string,
    onChange: PropTypes.func,
    onTextChange: PropTypes.func
}

export class DatePicker {
    static init(onChange, config) {
        $(() => {
            let selector = '.datepicker'
            if (config) {
                if (config.selector) selector = config.selector
            }

            $(selector).datepicker({
                format: 'dd-mm-yy',
                dateFormat: 'dd-mm-yy',
                changeMonth: true,
                changeYear: true,
                yearRange: "-100:+0", // last hundred years
                onSelect: function (dateText, inst) {
                    inst.inline = false
                    //const parts = dateText.split('-')
                    //const value = ([parts[2], parts[1], parts[0]]).join('-')
                    onChange($(this).attr('name'), dateText)
                }
            })
        })
    }
}
export class EditableValueInput extends Component {
    constructor(props, context) {
        super(props, context)

        const children = props.children

        this.state = {
            editMode: false,
            value: props.value,
            name: props.name ? props.name : (Array.isArray(children) ? children[0].props.name  : children.props.name),
            id: props.id ? props.id : (Array.isArray(children) ? children[0].props.id  : children.props.id),
            data :props.data ? props.data : (Array.isArray(children) ? children[0].props.data  : children.props.data)
        }

        this.onClickOutside(() => this.finishEditing())
    }

    handleFieldChange(e) {
        this.setState({ value: e.target.value })
    }

    handleKeyUp(e, type = null) {
        var type = type ? type : e.target.type
        switch (type) {
            case 'radio':
            case 'text':
                if (e.key === 'Enter')
                    this.finishEditing()
                break
        }
    }

    finishEditing() {
        const { onFieldChange } = this.props
        const { name, value, editMode , id , data} = this.state

        if (editMode) {
            this.setState({editMode: false})
            if (onFieldChange)
                onFieldChange(name, value,id ,data)
        }
    }

    onClickOutside(callback) {
        const { name } = this.state

        $('html').click(e => {
            if (e.target.name !== name)
                callback()
        });
    }

    componentWillReceiveProps(newProps, newContext) {
        if (this.props.enableExternalUpdates) {
            this.setState({ value: newProps.value })
        }
    }

    render() {
        var { value, editMode } = this.state
        const { children, rawHTML, label, noValueText, formatValue } = this.props

        let emptyValue = false

        if (editMode === false) {
            if (value == null || value.length === 0) {
                value = noValueText ? noValueText : '----------------'
                emptyValue = true
            }
        }

        var valueContainer
        if (editMode) {
            let injectProps = (children, key) => {
                if (Array.isArray(children)) children = children[0]

                let props = {
                    onChange: e => this.handleFieldChange(e),
                    onKeyUp: e => this.handleKeyUp(e),
                    key: key
                }
                switch (children.props.type) {
                    case 'radio':
                        Object.assign(props, {
                            value: children.props.value,
                            checked: value == children.props.value
                        })
                        break
                    default:
                        Object.assign(props, { value: value })
                }

                return React.cloneElement(children, props)
            }

            if (children.type == 'div') {
                valueContainer = []
                children.props.children.forEach((child, index) => {
                    if (child.type == 'input')
                        valueContainer.push(injectProps(child, index))
                    else
                        valueContainer.push(child)
                })
                valueContainer = (
                    <div>
                        {valueContainer}
                    </div>
                )
            } else {
                valueContainer = injectProps(children)
            }
        }
        else {
            const viewClass = (emptyValue ?
                    'detail-field-empty' : 'detail-field-value') + ' highlighted'

            if (!emptyValue) {
                const { valueView } = this.props
                value = valueView ? valueView(value) : value
            }

            if (rawHTML) {
                valueContainer = (
                    <p
                        className={viewClass}
                        style={{ color: emptyValue ? '#7d8c7e' : 'black'}}
                        onClick={() => {
                            let { value } = this.state
                            if (formatValue) value = formatValue(value)
                            this.setState({ editMode: true, value: value })
                        }}
                        dangerouslySetInnerHTML={{ __html: value }}>
                    </p>
                )
            } else {
                valueContainer = (
                    <p
                        className={viewClass}
                        onClick={() => {
                            let { value } = this.state
                            if (formatValue) value = formatValue(value)
                            this.setState({ editMode: true, value: value })
                        }}>
                        {value}
                    </p>
                )
            }
        }

        return (
            <FormGroup>
                <p className='detail-field-label'>{label}</p>
                {valueContainer}
            </FormGroup>
        )
    }
}

EditableValueInput.PropTypes = {
    label: PropTypes.string.isRequired,
    enableExternalUpdates: PropTypes.bool,
    value: PropTypes.string,
    id: PropTypes.string,
    data: PropTypes.string,
    onFieldChange: PropTypes.func,
    rawHTML: PropTypes.bool,
    name: PropTypes.string,
    children: PropTypes.oneOfType(PropTypes.element, PropTypes.arrayOf(PropTypes.element)),
    noValueText: PropTypes.string
}
export const ItemView = ({ value, defaultValue }) => {
    if (!defaultValue) defaultValue = '-------------'

    return value != null ?
        <p className='detail-field-value highlighted'>{value}</p> :
        <p className='detail-field-empty highlighted'>{defaultValue}</p>

}

export const EditableSourceSelected = Switchable(SourceSelect, ItemView)