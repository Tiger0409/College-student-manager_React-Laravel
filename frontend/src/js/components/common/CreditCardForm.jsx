import React, { PropTypes, Component } from 'react'
import { Row, Col } from 'react-bootstrap'

function width(val) {
    return { md: val, sm: val, xs: val }
}

function offset(val) {
    return { mdOffset: val, smOffset: val, xsOffset: val }
}

export default class CreditCardForm extends Component {
    static validate(value) {
        let errors = []
        const rules = [
            { prop: 'cardNumber', label: 'Card Number', length: 16, isNumber: true },
            { prop: 'expireMonth', label: 'Expire Month', maxLength: 2, isNumber: true, range: [0, 12] },
            { prop: 'expireYear', label: 'Expire Year', length: 4, isNumber: true },
            { prop: 'cvc', label: 'CVC', length: 3, isNumber: true }
        ]

        for (let i in rules) {
            const rule = rules[i]
            if (!value[rule.prop]) {
                errors.push(`${rule.label} should not be empty`)
                continue
            }

            if (rule.length && value[rule.prop].length != rule.length) {
                errors.push(`${rule.label} should consist of ${rule.length} characters`)
                continue
            }

            if (rule.maxLength && value[rule.prop].length > rule.maxLength) {
                errors.push(`${rule.label} cannot be bigger then ${rule.maxLength} characters`)
                continue
            }

            if (rule.isNumber && isNaN(value[rule.prop])) {
                errors.push(`${rule.label} should be a number`)
                continue
            }

            if (rule.range && (value[rule.prop] < rule.range[0] || value[rule.prop] > rule.range[1])) {
                errors.push(`${rule.label} should be in range ${rule.range[0]}..${rule.range[1]}`)
            }
        }

        return { errors: errors, isValid: errors.length == 0 }
    }

    constructor(props, context) {
        super(props, context)
        this.onChange = this.onChange.bind(this)
        this.removePlaceholder = this.removePlaceholder.bind(this)
        this.setPlaceHolder = this.setPlaceHolder.bind(this)
    }

    onChange(e) {
        let { name, value, onChange } = this.props
        value[e.target.name] = e.target.value
        onChange(name, value)
    }

    removePlaceholder(e) {
        if ($(e.target).attr('placeholder') == e.target.value) {
            e.target.value = ''
        }
    }

    setPlaceHolder(e) {
        if (e.target.value == '') {
            e.target.value = $(e.target).attr('placeholder')
        }
    }

    render() {
        const { value } = this.props
        const colStyles = { paddingLeft: 10, paddingRight: 10, marginBottom: 10 }

        return (
            <div>
                <Row style={{ marginBottom: '10px' }}>
                    <Col {...width(12)}>
                        <input
                            name='cardNumber'
                            type='text'
                            className='form-control'
                            placeholder='Card Number (16 digits)'
                            maxLength="16"
                            style={{ color: value.cardNumber ? 'black' : '#A8A8A8' }}
                            onFocus={this.removePlaceholder}
                            onBlur={this.setPlaceHolder}
                            onChange={this.onChange}
                        />
                    </Col>
                </Row>

                <Row style={{ marginLeft: -10, marginRight: -10 }}>
                    <Col xs={4} sm={2} style={colStyles}>
                        <input
                            name='expireMonth'
                            type='text'
                            className='form-control'
                            placeholder='MM'
                            maxLength="2"
                            style={{
                                color: value.expireMonth ? 'black' : '#A8A8A8',
                                width: '100%',
                                display: 'inline-block'
                            }}
                            onFocus={this.removePlaceholder}
                            onBlur={this.setPlaceHolder}
                            onChange={this.onChange}
                        />
                    </Col>

                    <Col xs={4} sm={2} style={colStyles}>
                        <input
                            name='expireYear'
                            type='text'
                            className='form-control'
                            placeholder='YYYY'
                            maxLength="4"
                            style={{
                                color: value.expireYear ? 'black' : '#A8A8A8',
                                width: '100%',
                                display: 'inline-block'
                            }}
                            onFocus={this.removePlaceholder}
                            onBlur={this.setPlaceHolder}
                            onChange={this.onChange}
                        />
                    </Col>

                    <Col xs={4} sm={2} style={colStyles}>
                        <input
                            name='cvc'
                            type='text'
                            className='form-control'
                            placeholder='CVC'
                            maxLength="3"
                            style={{
                                color: value.cvc ? 'black' : '#A8A8A8',
                                width: '100%',
                                display: 'inline-block'
                            }}
                            onFocus={this.removePlaceholder}
                            onBlur={this.setPlaceHolder}
                            onChange={this.onChange}
                        />
                    </Col>

                    <Col sm={6} style={colStyles}>
                        <input
                            name='zipOrPostcode'
                            type='text'
                            className='form-control'
                            placeholder='Zip / Postal Code'
                            style={{
                                color: value.zipOrPostcode ? 'black' : '#A8A8A8',
                                width: '100%',
                                display: 'inline-block'
                            }}
                            onFocus={this.removePlaceholder}
                            onBlur={this.setPlaceHolder}
                            onChange={this.onChange}
                        />
                    </Col>
                </Row>

                <Row>
                    <Col {...width(12)}>
                        <input
                            name='cardHolderName'
                            type='text'
                            className='form-control'
                            placeholder='Card holder name'
                            maxLength="16"
                            style={{ color: value.cardHolderName ? 'black' : '#A8A8A8' }}
                            onFocus={this.removePlaceholder}
                            onBlur={this.setPlaceHolder}
                            onChange={this.onChange}
                        />
                    </Col>
                </Row>
            </div>
        )
    }
}

CreditCardForm.propTypes = {
    onChange: PropTypes.func.isRequired,
    value: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired
}