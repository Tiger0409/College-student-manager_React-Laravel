import React, { PropTypes, Component } from 'react'
import { Modal, Button, Panel } from 'react-bootstrap'
import Notifier from '../../utils/Notifier.js'

export default class RelativeAddWnd extends Component {
    constructor(props, context) {
        super(props, context)
        this.defaultValues = { age: '0', gender: 'male' }
        this.state = { relative: this.defaultValues }
        this.styles = {
            field: {
                width: '80%',
                margin: '10px 0 10px 0'
            }
        }
        this.onChange = this.onChange.bind(this)
        this.close = this.close.bind(this)
        this.add = this.add.bind(this)
    }

    add() {
        const { cartItemId, onAdded } = this.props
        let { relative } = this.state

        relative.fullname = `${relative.forename} ${relative.surname}`

        $.ajax({
            type: 'post',
            url: '/api/cart/add-relative',
            data: { relative: relative, cartItemId: cartItemId },
            success: data => {
                Notifier.success('Relative added')
                onAdded(data)
                this.close()
            },
            error: xhr => {
                Notifier.error(xhr.responseText)
                this.close(false)
                console.error(xhr)
            }
        })
    }

    close(clearInputs) {
        if (typeof clearInputs == 'undefined') clearInputs = true

        if (clearInputs) {
            this.setState({ relative: this.defaultValues })
        }

        this.props.onClose()
    }

    updateRelative(prop, val) {
        let { relative } = this.state
        relative[prop] = val
        this.setState({ relative: relative })
    }

    onChange(e) {
        this.updateRelative(e.target.name, e.target.value)
    }

    componentDidMount() {
        let self = this

        $(() => {
            $('.datepicker').datepicker({
                dateFormat: 'dd-mm-yy',
                onSelect: function (dateText, inst) {
                    inst.inline = false
                    const parts = dateText.split('-')
                    const value = ([parts[2], parts[1], parts[0]]).join('-')
                    self.updateRelative($(this).attr('name'), value)
                }
            })
        })
    }

    render() {
        const { show } = this.props
        const { relative } = this.state

        return (
            <Modal show={show} onHide={this.close}>
                <Modal.Dialog>
                    <Modal.Header closeButton>
                        <p>Add relative</p>
                    </Modal.Header>

                    <Modal.Body>
                        <Centered style={this.styles.field}>
                            <Label>Forname</Label>
                            <input
                                className='form-control'
                                type="text"
                                name="forename"
                                value={relative.forename}
                                onChange={this.onChange}
                            />
                        </Centered>

                        <Centered style={this.styles.field}>
                            <Label>Surname</Label>
                            <input
                                className='form-control'
                                type="text"
                                name="surname"
                                value={relative.surname}
                                onChange={this.onChange}
                            />
                        </Centered>

                        <Centered style={this.styles.field}>
                            <Label>Email</Label>
                            <input
                                className='form-control'
                                type="text"
                                name="email"
                                value={relative.email}
                                onChange={this.onChange}
                            />
                        </Centered>

                        <Centered style={this.styles.field}>
                            <Label>Telephone</Label>
                            <input
                                className='form-control'
                                type="text"
                                name="phone"
                                value={relative.phone}
                                onChange={this.onChange}
                            />
                        </Centered>

                        <Centered style={this.styles.field}>
                            <Label>Gender</Label>
                            <select
                                className='form-control'
                                name="gender"
                                value={relative.gender}
                                onChange={this.onChange}
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </Centered>

                        <Centered style={this.styles.field}>
                            <Label>Birth Date</Label>
                            <input
                                className='form-control datepicker'
                                name="age"
                                value={relative.age}
                                onChange={this.onChange}
                            />
                        </Centered>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button style={{ marginRight: '15px' }} onClick={this.close}>Cancel</Button>
                        <Button onClick={this.add}>Add</Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal>
        )
    }
}

const Label = ({ children, style }) => (<p>{children}</p>)

const Centered = ({ children, style }) => {
    let childStyle = { alignSelf: 'center' }
    Object.assign(childStyle, style ? style : {})

    return (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={childStyle}>
                {children}
            </div>
        </div>
    )
}