import React, { PropTypes, Component } from 'react'
import Oh from './../../utils/ObjHelper.js'
import Ph from './../../utils/PromiseHelper.js'
import Notifier from '../../utils/Notifier.js'
import Spinner from '../common/Spinner.jsx'

// used if prop logEnabled was not set
const logEnabled = false
const notificationsEnabled = true

export default (InnerComponent, operations) => class extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { isLoading: true, data: null, errorText: null }
        this.promises = {}
        this.save = this.save.bind(this)
        this.load = this.load.bind(this)
        this.execute = this.execute.bind(this)
        this.logEnabled = typeof props.logEnabled !== 'undefined' ?
            props.logEnabled : logEnabled
        this.notificationsEnabled = typeof props.notificationsEnabled !== 'undefined' ?
            props.notificationsEnabled : notificationsEnabled
    }

    load(data) {
        this.execute('load', data,
            resultData => {
                this.setState({ isLoading: false, data: resultData })
            },
            xhr => {
                this.setState({ isLoading: false, errorText: xhr.responseText })
            }
        )

        if (!this.search('load')) {
            this.setState({ isLoading: false })
        }
    }

    save(data, onSuccess, onError) {
        this.execute(
            'save',
            data,
            successXhr => {
                if (this.notificationsEnabled) {
                    Notifier.success('Saved successfully')
                }
                if (onSuccess) {
                    onSuccess(successXhr)
                }
            },
            errorXhr => {
                if (this.notificationsEnabled) {
                    Notifier.error('Save failed')
                }
                if (onError) {
                    onError(errorXhr)
                }
            }
        )
    }

    search(key) {
        const { ajaxOperations } = this.props

        const lookup = (items) => {
            for (let itemKey in items) {
                if (itemKey === key) {
                    return items[itemKey]
                }
            }

            return false
        }

        var operation = lookup(ajaxOperations)
        return operation ? operation : lookup(operations)
    }

    execute(operationName, data, onSuccess, onError) {
        var operation = this.search(operationName)
        if (!operation) {
            return false
        }

        if (this.promises[operationName]) {
            this.promises[operationName].cancel()
        }

        if (data) {
            operation.data = data
        }

        this.promises[operationName] = Ph.ajax(operation)
        this.promises[operationName].then(
            successXhr => {
                if (this.logEnabled) {
                    console.log(successXhr)
                }
                if (onSuccess) {
                    onSuccess(successXhr)
                }
            },
            errorXhr => {
                console.log(errorXhr)

                if (onError) {
                    onError(errorXhr)
                }
            }
        )
    }

    componentDidMount() {
        this.load()
    }

    componentWillUnmount() {
        for (let key in this.promises) {
            if (this.promises[key]) {
                this.promises[key].cancel()
            }
        }
    }

    render() {
        const { isLoading, data, errorText } = this.state

        if (isLoading) {
            return (
                <div>
                    <Spinner />
                </div>
            )
        }

        if (errorText) {
            return <p>{errorText}</p>
        }

        if (data === null && this.search('load')) return (<p>No data.</p>)

        var withoutWrapperProps = Oh.except(this.props, ['ajaxOperations'])

        return (
            <InnerComponent
                {...withoutWrapperProps}
                data={data}
                save={this.save}
                load={this.load}
                execute={this.execute}
            />
        )
    }
}