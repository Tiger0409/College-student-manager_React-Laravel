import React, { PropTypes, Component } from 'react'
import { Button } from 'react-bootstrap'
import { Link } from 'react-router'
import DataLoader from '../common/DataLoader.jsx'
import ReactDOM from 'react-dom'

class UserSearchBar extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            searchQuery: props.searchQuery ? props.searchQuery : null,
            showResults: false,
            focused: false,
            data: null
        }
        this.onChange = this.onChange.bind(this)
        this.onFocus = this.onFocus.bind(this)
        this.onClick = this.onClick.bind(this)
        this.onSelectResult = this.onSelectResult.bind(this)
        this.delayedSearch = null
    }

    onChange(e) {
        const { execute } = this.props
        let newSearchQuery = e.target.value

        this.setState({ searchQuery: newSearchQuery, data: null })

        if (this.delayedSearch) {
            clearTimeout(this.delayedSearch)
        }

        newSearchQuery = newSearchQuery.trim()
        if (newSearchQuery.length > 0) {
            this.delayedSearch = setTimeout(() => {
                execute('search', { query: newSearchQuery }, data => {
                    const { focused } = this.state
                    if (focused && data && data.length > 0) {
                        this.setState({ showResults: true, data: data })
                    }
                })
            }, 1000)
        }
    }

    onFocus() {
        this.setState({ focused: true, showResults: true })
    }

    onSelectResult(row) {
        const userData = row.userData.split(' ')
        const name = userData.length > 2 ? userData[0] + ' ' + userData[1] : userData[0]
        this.props.onSelectResult(row.id, name)
        this.setState({ showResults: false, searchQuery: row.userData.split(' ').slice(0, 2).join(' ') })
    }

    onClick(e) {
        const isOutsideClick = !ReactDOM.findDOMNode(this).contains(e.target)
        this.setState({ showResults: !isOutsideClick && this.state.showResults })
    }

    componentWillReceiveProps(newProps) {
        if (this.props.receiveUpdates && this.state.searchQuery != newProps.searchQuery && newProps.searchQuery) {
            this.setState({ searchQuery: newProps.searchQuery })
        }
    }

    componentWillMount() {
        document.addEventListener('click', this.onClick, false)
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.onClick, false)
    }

    render() {
        const { searchQuery, showResults, data } = this.state
        const { elemId } = this.props

        return (
            <div>
                <input
                    type='text'
                    placeholder='Zip Code, Student Name, Telephone or Email'
                    fontStyle='italic'
                    className='form-control'
                    onChange={this.onChange}
                    onFocus={this.onFocus}
                    value={searchQuery}
                />

                <SearchResults
                    elemId={elemId}
                    isShown={showResults}
                    data={data}
                    query={searchQuery}
                    onClick={this.onSelectResult}
                    onClose={() => this.setState({ showResults: false })}
                />
            </div>
        )
    }
}

UserSearchBar.propTypes = {
    onSelectResult: PropTypes.func.isRequired,
    elemId: PropTypes.string
}

class SearchResults extends Component {
    constructor(props, context) {
        super(props, context)
        this.textStyle = {
            width: '90%',
            paddingLeft: '10%',
            textAlign: 'center',
            wordBreak: 'break-word'
        }
        this.onClick = this.onClick.bind(this)
        this.onRightClick = this.onRightClick.bind(this)
        this.elemId = props.elemId ? props.elemId : 'searchResults'
    }

    componentDidMount() {
        $(() => {
            this.$searchResults = $('#' + this.elemId)
        })
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.isShown !== nextProps.isShown) {
            this.$searchResults.slideToggle('500')
        }
    }

    onClick(e, row) {
        if (this.defaultClick) return true

        this.props.onClick(row)
        e.preventDefault()
    }

    onRightClick(e, id) {
        e.preventDefault()

        this.defaultClick = true
        $(e.target)[0].click()
        this.defaultClick = false
    }

    renderRows() {
        const { data } = this.props

        if (!data || data.length === 0) return

        var style = {
            wordBreak: 'break-word',
            width: '90%',
            marginBottom: '10px'
        }

        let listItems = []
        for (let i = 0; i < data.length; i++) {
            const row = data[i]
            if (!row.userData) { continue }

            if (listItems.length > 500) {
                break
            }

            listItems.push(
                <li
                    key={i}
                    value={row.id}
                    className='highlighted'
                    style={style}
                >
                    <Link
                        to={`/users/${row.id}`}
                        onClick={e => this.onClick(e, row)}
                        onContextMenu={e => this.onRightClick(e, row.id)}
                        target='_blank'
                        style={{ color: 'inherit' }}
                    >
                        {row.userData}
                    </Link>
                </li>
            )
        }

        return listItems
    }

    renderResults() {
        const { query, data } = this.props

        const recordsCount = data ? data.length : 0

        return (
            <div>
                {query && query.length > 0 ?
                    (<h5 style={this.textStyle}>
                        Search results for "{query}"
                    </h5>)
                    : ''
                }

                <h4 style={this.textStyle}>
                    Found {recordsCount} records
                    {recordsCount > 500 ? (<p><br/> Showing first 500+</p>) : ''}
                </h4>

                <hr />
                <ul className='search-bar'>
                    {this.renderRows()}
                </ul>
            </div>
        )
    }

    render() {
        return (
            <div
                style={{
                    display: 'none',
                    position: 'absolute',
                    zIndex: '2',
                    border: '1px solid #A9A9A9',
                    borderWidth: '0 1px 1px 1px',
                    WebkitBoxShadow: '5px 5px 5px rgba(0, 0, 0, 0.3)',
                    MozBoxShadow: '5px 5px 5px rgba(0, 0, 0, 0.3)',
                    boxShadow: '5px 5px 5px rgba(0, 0, 0, 0.3)',
                    backgroundColor: '#fff',
                    width: '92%'
                }}
                id={this.elemId}
            >
                <div
                    style={{
                        height: '400px',
                        overflow: 'auto'
                    }}
                >
                    {this.renderResults()}
                </div>

                <div>
                    <Button
                        style={{ margin: '10px', width: 'calc(100% - 20px)' }}
                        className='custom btn-success'
                        onClick={() => {
                            this.context.router.push('/new-user')
                            this.props.onClose()
                        }}
                    >
                        Add new students
                    </Button>
                </div>
            </div>
        )
    }
}

SearchResults.contextTypes = {
    router: PropTypes.object.isRequired
}

export default DataLoader(
    UserSearchBar,
    { search: { type: 'get', url: '/api/users/quick-search' } }
)