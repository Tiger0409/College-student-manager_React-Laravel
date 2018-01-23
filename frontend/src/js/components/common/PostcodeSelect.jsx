import React, { PropTypes, Component } from 'react'
import { Panel } from 'react-bootstrap'
import Ph from '../../utils/PromiseHelper.js'
import ReactDOM from 'react-dom'

export default class PostcodeSelect extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            postcode: props.value ? props.value : '',
            showResults: false,
            results: [],
            inputFocused: false
        }
        this.id = 'postcode-query-input'
        this.onChange = this.onChange.bind(this)
        this.onClick = this.onClick.bind(this)
        this.search = this.search.bind(this)
        this.onFocus = this.onFocus.bind(this)
        this.removePlaceholder = this.removePlaceholder.bind(this)
        this.setPlaceholder = this.setPlaceholder.bind(this)
    }

    parseData(data) {
        if (typeof data === 'string') {
            data = JSON.parse(data)
        }

        const arrayGet = (array, index) => (array && index >= 0 && index < array.length ? array[index] : null)

        let parsed = []

        const count = data.line1 ? data.line1.length : 0

        if (data.line1) {
            for (let i = 0; i < count; i++) {
                let item = {
                    line1: data.line1[i][0],
                    postcode: data.postcode[0],
                    town: data.town[0],
                }

                const line2 = arrayGet(data.line2, i)[0]
                if (line2) item.line2 = line2

                parsed.push(item)
            }
        }

        return parsed
    }

    search() {
        const { postcode } = this.state

        if (this.searchP) this.searchP.cancel()

        this.searchP = Ph.ajax({
            type: 'get',
            url: '/api/users/get-postcode-data',
            data: { postcode: postcode }
        })

        this.searchP.then(
            data => {
                this.setState({ results: this.parseData(data) })
                this.setState({ showResults: true })
            },
            xhr => console.error(xhr)
        )
    }
    
    onFocus() {
        if (this.state.results && this.state.results.length > 0) {
            this.setState({ showResults: true })
        }
    }

    onChange(e) {
        this.setState({ postcode: e.target.value })

        if (this.searchDelay) {
            clearInterval(this.searchDelay)
            this.searchDelay = null
        }

        this.searchDelay = setTimeout(this.search, 1000)
    }

    onSelect(item) {
        this.props.onSelect(item)
        this.setState({ showResults: false })
    }

    setPlaceholder() {
        if (this.$input.val() == '') {
            this.$input.val(this.$input.attr('placeholder'))
        }
    }

    removePlaceholder() {
        if (this.$input.attr('placeholder') == this.$input.val()) {
            this.$input.val('')
        }
    }

    onClick(e) {
        const isOutsideClick = !ReactDOM.findDOMNode(this).contains(e.target)

        this.setState({ showResults: !isOutsideClick && this.state.showResults })
    }

    componentDidMount() {
        $(() => this.$input = $('#' + this.id))
    }

    componentWillMount() {
        document.addEventListener('click', this.onClick, false)
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.onClick, false)
    }

    render() {
        const { showResults, results, postcode, inputFocused } = this.state

        const removeEmpty = array => {
            if (!array) return

            for (let i = 0; i < array.length; i++) {
                if (array[i] === null || !array[i]) {
                    array.splice(i, 1)
                    i--
                }
            }

            return array
        }

        const showPlaceholder = !postcode && !inputFocused

        return (
            <div
                onFocus={this.onFocus}
                style={{ position: 'relative' }}
            >
                <input
                    type="text"
                    id={this.id}
                    className='form-control'
                    name='postcode'
                    onChange={this.onChange}
                    onFocus={() => this.setState({ inputFocused: true }, this.removePlaceholder)}
                    onBlur={() => this.setState({ inputFocused: false }, this.setPlaceholder)}
                    placeholder='Postcode'
                    value={showPlaceholder ? 'Postcode' : postcode}
                    style={{ color: showPlaceholder ? '#A8A8A8' : 'black' }}
                />
                
                <Panel
                    collapsible expanded={showResults}
                    style={{
                        border: '0',
                        maxHeight: '220px',
                        overflowY: 'auto',
                        position: 'absolute',
                        left: '0',
                        top: '35px',
                        width: '100%',
                        zIndex: '2'
                    }}
                >
                    <ul className='postcode-select'>
                        {results.map(
                            (item, i) => (
                                <li
                                    key={i}
                                    style={{
                                        cursor: 'pointer',
                                        minHeight: '20px',
                                        lineHeight: '20px',
                                        zIndex: '3'
                                    }}
                                    onClick={() => this.onSelect(item)}
                                    className='highlighted'
                                >
                                    {removeEmpty([item.postcode, item.line1, item.line2, item.town]).join(', ')}
                                </li>
                            )
                        )}
                    </ul>
                </Panel>
            </div>
        )
    }

}

PostcodeSelect.propTypes = {
    onSelect: PropTypes.func.isRequired,
    value: PropTypes.string,
    limit: PropTypes.number
}