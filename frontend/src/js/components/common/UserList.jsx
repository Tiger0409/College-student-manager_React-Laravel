import React, { PropTypes, Component } from 'react'
import { Button, Row, Col } from 'react-bootstrap'
import UserSearchBar from '../base/UserSearchBar'

const generateId = (() => { let i = 0; return () => i++ })()

class ListItem {
    constructor(value, text) {
        this.id = generateId()
        this.value = value ? value : null
        this.text = text ? text : null
    }
}

class ListItemView extends Component {
    constructor(props, context) {
        super(props, context)
        this.updateListItem = this.updateListItem.bind(this)
        this.onChange = this.onChange.bind(this)
    }

    updateListItem(name, value) {
        let { data } = this.props
        data[name] = value
        return data
    }

    onChange({ target }) {
        this.props.onUpdate(this.updateListItem(target.name, target.value))
    }

    render() {
        const { data } = this.props

        return (
            <Row>
                <Col md={6} style={{ marginBottom: '10px' }}>
                    <UserSearchBar
                        searchQuery={data.text}
                        receiveUpdates
                        elemId={'user-' + data.id}
                        onSelectResult={(id, text) => {
                            let { data } = this.props
                            data.value = id
                            data.text = text
                            this.props.onUpdate(data)
                        }}
                    />
                </Col>

                <Col md={4} style={{ marginBottom: '10px' }}>
                    <Button className="custom" onClick={() => this.props.onDelete(data)}>Delete</Button>
                </Col>
            </Row>
        )
    }
}

ListItemView.propTypes = {
    data: PropTypes.object.isRequired,
    onDelete: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired
}

export default class UserList extends Component {
    constructor(props, context) {
        super(props, context)

        this.state = {
            list: []
        }

        this.addItem = this.addItem.bind(this)
        this.deleteItem = this.deleteItem.bind(this)
        this.updateItem = this.updateItem.bind(this)
        this.onUpdate = this.onUpdate.bind(this)
    }

    onUpdate() {

        this.props.onUpdate(this.state.list.map(item => item.value))
    }

    addItem() {
        let { list } = this.state
        list.push(new ListItem())
        this.setState({ list: list })
    }

    deleteItem(targetItem) {
        console.log(targetItem)
        this.setState({ list: this.state.list.filter(item => item.id != targetItem.id) }, this.onUpdate)
    }

    updateItem(targetItem) {
        let { list } = this.state
        for (let i = 0; i < list.length; i++) {
            if (list[i].id == targetItem.id) {
                list[i] = targetItem;
                break
            }
        }
        this.setState({ list: list }, this.onUpdate)
    }

    componentDidMount() {
        let { list } = this.state

        if (this.props.initialData && Array.isArray(this.props.initialData)) {
            this.props.initialData.forEach(user => {
                list.push(new ListItem(user.id, user.userFullname))
            })
        }

        this.setState({ list: list })

        this.props.onSendClearFunc(() => this.setState({ list: [] }))
    }

    render() {
        // console.log(this.state.list)

        return (
            <div>
                {this.state.list.map(
                    listItem => (
                        <ListItemView
                            data={listItem}
                            onDelete={this.deleteItem}
                            onUpdate={this.updateItem}
                        />
                    )
                )}

                <Button onClick={this.addItem}>Add</Button>
            </div>
        )
    }
}

UserList.propTypes = {
    initialData: PropTypes.array.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onSendClearFunc: PropTypes.func.isRequired
}
