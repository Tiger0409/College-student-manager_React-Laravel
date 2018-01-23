import React, { PropTypes, Component } from 'react'
import DataLoader from './DataLoader.jsx'
import { Button } from 'react-bootstrap'
import FormGroup from './FormGroup.jsx'

let styles = {
    addButton: {},
    saveButton: { marginLeft: 15 }
}

if (window.innerWidth < 768) {
    styles = {
        addButton: { width: '100%', marginBottom: 10 },
        saveButton: { width: '100%' }
    }
}

export default DataLoader(
    class extends Component {
        constructor(props, context) {
            super(props, context)
            this.state = { data: this.props.data }
            this.save = this.save.bind(this)
            this.add = this.add.bind(this)
            this.delete = this.delete.bind(this)
            this.handleGroupChange = this.handleGroupChange.bind(this)
        }

        componentDidMount() {
            this.sort()
        }

        componentWillUnmount() {
            for (let key in this.promises) {
                if (this.promises[key]) {
                    this.promises[key].cancel()
                }
            }
        }

        componentWillReceiveProps(newProps) {
            this.sort(newProps.data)
        }

        sort(data) {
            data = data ? data : this.state.data
            data.sort((groupA, groupB) => parseInt(groupA.weight) < parseInt(groupB.weight))
            this.setState({ data: data })
        }

        save() {
            const { save, load } = this.props
            const { data } = this.state

            save({ data: data }, () => {
                load()
            })
        }

        add() {
            var { data } = this.state
            data.push({ name: '', weight: 0 })
            this.setState({ data: data })
        }

        delete(index) {
            var { data } = this.state

            var item = data[index]
            if (!item) return

            if (item.id) {
                item.isDeleted = true
            } else {
                data.splice(index, 1)
            }
            this.setState({data: data})
        }

        handleGroupChange(e, index) {
            var { data } = this.state
            const { name, value } = e.target
            if (!data[index]) return

            data[index][name] = value
            this.setState({data: data})
        }

        renderGroup(group, key, onDelete, onChange) {
            if (group.isDeleted) return false

            return (
                <tr key={key}>
                    <td>
                        <input
                            className='form-control'
                            type='text'
                            name='name'
                            value={group.name}
                            onChange={e => onChange(e, key)}
                        />
                    </td>
                    <td>
                        <input
                            className='form-control'
                            type='text'
                            name='weight'
                            value={group.weight}
                            onChange={e => onChange(e, key)}
                        />
                    </td>
                    <td>
                        <Button
                            className='custom'
                            style={{ width: '100%' }}
                            onClick={() => onDelete(key)}
                        >
                            Delete
                        </Button>
                    </td>
                </tr>
            )
        }

        renderTable() {
            const { data } = this.state

            if (!data || data.length === 0) {
                return false
            }

            return (
                <div>
                    <table className='table table-striped results-table'>
                        <thead>
                        <tr>
                            <td>Name</td>
                            <td>Weight</td>
                            <td></td>
                        </tr>
                        </thead>

                        <tbody>
                        {
                            data.map(
                                (group, i) => this.renderGroup(group, i, this.delete, this.handleGroupChange)
                            )
                        }
                        </tbody>
                    </table>
                </div>
            )
        }

        render() {
            return (
                <div>
                    {this.renderTable()}

                    <FormGroup>
                        <Button className='custom' bsStyle='success' style={styles.addButton} onClick={this.add}>Add</Button>
                        <Button
                            className='custom'
                            bsStyle='success'
                            style={styles.saveButton}
                            onClick={() => {
                                this.save()
                                this.sort()
                            }}
                        >
                            Save
                        </Button>
                    </FormGroup>
                </div>
            )
        }
    }
)