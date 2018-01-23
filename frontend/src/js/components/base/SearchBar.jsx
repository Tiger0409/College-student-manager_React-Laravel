import React, { PropTypes, Component } from 'react'
import DataLoader from '../common/DataLoader.jsx'

class SearchBar extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { searchQuery: null, showResults: false }
        this.onChange = this.onChange.bind(this)
        this.onFocus = this.onFocus.bind(this)
        this.onBlur = this.onBlur.bind(this)
        this.onClick = this.onClick.bind(this)
    }

    onChange(e) {
        const newSearchQuery = e.target.value
        const showResults = (newSearchQuery && newSearchQuery.length > 0) ? true : false
        this.setState({ searchQuery: newSearchQuery, showResults: showResults })
    }

    onFocus() {
        const { searchQuery } = this.state
        if (searchQuery && searchQuery.length > 0) {
            this.setState({ showResults: true })
        }
    }

    onBlur() {
        this.setState({ showResults: false })
    }

    onClick() {
        this.setState({ showResults: false, searchQuery: null })
    }

    render() {
        const { searchQuery, showResults } = this.state
        const { data } = this.props

        return (
            <div>
                <input
                    type='text'
                    className='form-control'
                    onChange={this.onChange}
                    onFocus={this.onFocus}
                    onBlur={this.onBlur}
                    value={searchQuery}
                />

                <SearchResults
                    isShown={showResults}
                    data={data}
                    query={searchQuery}
                    onClick={this.onClick}
                />
            </div>
        )
    }
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
    }
    componentDidMount() {
        $(() => {
            this.$searchResults = $('#searchResults')
        })
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.isShown !== nextProps.isShown) {
            this.$searchResults.slideToggle('500')
        }
    }

    onClick(e) {
        this.context.router.push(`/users/${e.target.value}`)
        this.props.onClick()
    }

    getFoundRecords() {
        const { query, data } = this.props

        var style = {
            wordBreak: 'break-word',
            width: '90%'
        }

        var foundRecords = []
        var totalCount = 0
        for (let i = 0; i < data.length; i++) {
            if (data[i].userData && data[i].userData.indexOf(query) !== -1) {
                if (foundRecords.length < 500) {
                    foundRecords.push(
                        <li
                            key={i}
                            value={data[i].id}
                            onClick={this.onClick}
                            className='highlighted'
                            style={style}
                        >
                            {data[i].userData}
                        </li>
                    )
                }

                totalCount++
            }
        }

        return { rows: foundRecords, count: totalCount }
    }

    renderResults() {
        const { query } = this.props

        if (!query || query.length === 0) {
            return false
        }

        var foundRecords = this.getFoundRecords()
        var recordsCount = foundRecords.count

        return (
            <div>
                <h5 style={this.textStyle}>
                    Search results for "{query}"
                </h5>

                <h4 style={this.textStyle}>
                    Found {recordsCount} records
                    {recordsCount > 500 ? (<p><br/> Showing first 500+</p>) : ''}
                </h4>

                <ul>
                    {foundRecords.rows}
                </ul>
            </div>
        )
    }

    render() {
        return (
            <div
                style={{
                    display: 'none',
                    width: '92%',
                    height: '400px',
                    position: 'absolute',
                    zIndex: '2',
                    border: '1px solid #A9A9A9',
                    borderWidth: '0 1px 1px 1px',
                    WebkitBoxShadow: '5px 5px 5px rgba(0, 0, 0, 0.3)',
                    MozBoxShadow: '5px 5px 5px rgba(0, 0, 0, 0.3)',
                    boxShadow: '5px 5px 5px rgba(0, 0, 0, 0.3)',
                    backgroundColor: '#fff',
                    overflow: 'auto'
                }}
                id='searchResults'
            >
                {this.renderResults()}
            </div>
        )
    }
}

SearchResults.contextTypes = {
    router: PropTypes.object.isRequired
}

export default DataLoader(
    SearchBar,
    { load: { type: 'get', url: '/api/users/quick-search' } }
)