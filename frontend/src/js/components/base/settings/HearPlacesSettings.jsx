import React, { PropTypes, Component } from 'react'
import DataLoader from '../../common/DataLoader.jsx'
import { Button } from 'react-bootstrap'

class HearPlacesSettings extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { data: props.data }
        this.save = this.save.bind(this)
        this.add = this.add.bind(this)

        if (props.onSendListeners) {
            props.onSendListeners({ submit: this.save })
        }
    }

    save() {
        let data = this.state.data
        data = data.map(item => { item.isVisible = 1; return item; })

        this.props.save({ data: data })
    }

    remove(index) {
        let { data } = this.state
        if (data[index].id) {
            data[index].isDeleted = true
        } else {
            data.splice(index, 1)
        }

        this.setState({ data: data })
    }

    add() {
        let { data } = this.state
        data.push({ placeName: '' })
        this.setState({ data: data })
    }

    change(index, e) {
        const { name, value } = e.target
        let { data } = this.state
        data[index][name] = value
        this.setState({ data: data })
    }

    renderList() {
        const { data } = this.state
        let rows = []

        for (let i in data) {
            const item = data[i]

            if (item.isDeleted) continue

            rows.push(
                <li key={i} style={{ marginBottom: '10px', display: 'flex' }}>
                    <input
                        type='text'
                        className='form-control'
                        name='placeName'
                        value={item.placeName}
                        onChange={e => this.change(i, e)}
                    />

                    <Button bsStyle='danger' onClick={() => this.remove(i)}>
                        <span className='glyphicon glyphicon-remove'></span>
                    </Button>
                </li>
            )
        }

        return <ul style={{ padding: '0', marginBottom: '10px' }}>{rows}</ul>
    }

    render() {
        return (
            <div>
                <p className='detail-field-label'>Options</p>
                {this.renderList()}

                <div>
                    <Button bsStyle='success' onClick={this.add} style={{ marginBottom: 10 }}>
                        <span className='glyphicon glyphicon-plus'></span>
                    </Button>
                </div>
            </div>
        )
    }
}

const Composed = DataLoader(HearPlacesSettings)

export default props => (
    <Composed
        {...props}
        ajaxOperations={{
            load: { type: 'get', url: '/api/hear-places' },
            save: { type: 'put', url: '/api/hear-places/update'}
        }}
        notificationsEnabled={false}
    />
)