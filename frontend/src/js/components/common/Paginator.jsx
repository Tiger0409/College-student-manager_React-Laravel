import React, { Component, PropTypes } from 'react'
import { Row, Col, Pager, PageItem } from 'react-bootstrap'

export default class Paginator extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {currentPage: 1}
    }

    render() {
        var pagination = this.createPagination()

        return (
            <div id="pagination">
                {pagination}
            </div>
        )
    }

    createPagination() {
        if (!this.props.totalCount) return false

        var totalCount = this.props.totalCount
        var pageCount = Math.ceil(totalCount / parseInt(this.props.rowsPerPage))
        var currentPage = 1
        if (this.state.currentPage)
            currentPage = this.state.currentPage

        if (pageCount === 0) return <div></div>

        return (
            <Pager>
                <PageItem
                    onClick={() => this.turnPage(currentPage - 1)}
                    disabled={currentPage == 1}
                >
                    &larr; Prev
                </PageItem>
                {' '}
                <PageItem
                    onClick={() => this.turnPage(currentPage + 1)}
                    disabled={currentPage == pageCount}
                >
                    Next &rarr;
                </PageItem>

                <p style={{ marginTop: '10px' }}>{currentPage} / {pageCount}</p>
            </Pager>
        )

        /*for (var i = 0; i < pageCount; i++) {
            var pageNumber = i + 1

            if (currentPage === pageNumber) {
                pagination.push(
                    <li className='active' key={i}>

                        <a onClick={(e) => this.turnPage(paneNumber)}>{pageNumber}</a>
                    </li>
                )
            } else {
                pagination.push(
                    <li key={i}>
                        <a onClick={(e) => this.turnPage(e)}>{pageNumber}</a>
                    </li>
                )
            }
        }*/
    }

    turnPage(pageNum) {
        // class manipulations for optimistic update
        /*var $currentActiveLink = this.$paginationContainer.find('li.active')
        $currentActiveLink.removeClass('active')
        $pressedLink.parent().addClass('active')*/
        /*var $pressedLink = $(e.target)*/
        var pageNum = parseInt(pageNum)
        this.setState({ currentPage: pageNum })
        if (this.props.onPageChange) {
            this.props.onPageChange(pageNum)
        }
    }

    componentDidMount() {
        if (this.props.currentPage && this.props.currentPage > 0)
            this.setState({currentPage: this.props.currentPage})

        $(() => {
            this.$paginationContainer = $('#pagination')
        })
    }

    componentWillReceiveProps(newProps) {
        if (newProps && newProps.currentPage)
            this.setState({currentPage: newProps.currentPage})
    }
}
Paginator.PropTypes = {
    totalCount: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
    currentPage: PropTypes.number.isRequired,
    onPageChange: PropTypes.func
}