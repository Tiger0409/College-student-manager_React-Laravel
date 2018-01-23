import React, { Component, PropTypes } from 'react'
import HeaderRegistrar from './HeaderRegistrar.jsx'
import AuthComponent from './../common/AuthComponent.jsx'
import BranchFilter from '../base/BranchFilter.jsx'
import { Row, Col } from 'react-bootstrap'
import SearchBar from '../base/UserSearchBar.jsx'
import AssetManager from '../../utils/AssetManager.js'

export default class AppRegistrar extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            contextData: { branchId: null }
        }
        this.assetManager = new AssetManager()
        this.changeContext = this.changeContext.bind(this)
    }

    componentDidMount() {
        this.assetManager.loadCss('src/style/admin/styles.css')
    }

    componentWillUnmount() {
        this.assetManager.unloadAll()
    }

    getChildContext() {
        return this.state.contextData
    }

    changeContext(name, value) {
        var { contextData } = this.state
        contextData[name] = value
        this.setState({ contextData: contextData })
    }

    renderHeader() {
        const { router } = this.context

        return (
            <div>
                <div className='admin-header'>
                    <div className="container">
                        <Row>
                            <Col md={2} sm={3} xs={3}>
                                <img
                                    src={'src/images/admin/logo.png'}
                                    className='logo'
                                    style={{ marginBottom: '-158px' }}
                                />
                            </Col>

                            <Col md={6} sm={5} xs={5} style={{ marginTop: '80px' }}>
                                <SearchBar onSelectResult={id => router.push(`/users/${id}`)} />
                            </Col>

                            <Col md={3} sm={4} xs={4} style={{ marginTop: '10px' }}>
                                <BranchFilter onChange={id => this.changeContext('branchId', id)} />

                                <AuthComponent
                                    style={{ marginTop: '35px' }}
                                    onUpdate={this.props.onUserUpdate}
                                    isLogged={true}
                                />
                            </Col>
                        </Row>
                    </div>
                </div>

                <HeaderRegistrar />
            </div>
        )
    }

    render() {
        return (
            <div className='admin'>
                {this.renderHeader()}
                <div className='container'>
                    {this.props.children}
                </div>
            </div>
        )
    }
}

AppRegistrar.childContextTypes = {
    branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
}

AppRegistrar.contextTypes = {
    router: PropTypes.object.isRequired
}