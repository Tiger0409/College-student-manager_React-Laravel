import React, { Component, PropTypes } from 'react'
import HeaderAdmin from './HeaderAdmin.jsx'
import FooterAdmin from './FooterAdmin.jsx'
import AuthComponent from './../common/AuthComponent.jsx'
import BranchFilter from '../base/BranchFilter.jsx'
import { Row, Col } from 'react-bootstrap'
import SearchBar from '../base/UserSearchBar.jsx'
import AssetManager from '../../utils/AssetManager.js'

let styles = {
    authWrapper: { marginTop: '35px' },
    searchBar: { marginTop: 80, }
}

if (window.innerWidth < 768) {
    styles = {
        authWrapper: { marginTop: 20 },
        searchBar: { marginTop: 15, marginBottom: 10 }
    }
}

export default class AppAdmin extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            contextData: { branchId: null }
        }
        this.assetManager = new AssetManager()
        this.changeContext = this.changeContext.bind(this)
    }

    getChildContext() {
        return this.state.contextData
    }

    componentDidMount() {
        this.assetManager.loadCss('src/style/admin/styles.css')
    }

    componentWillUnmount() {
        this.assetManager.unloadAll()
    }

    changeContext(name, value) {
        console.log(this.state.contextData);
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
                        <Row className='row-sm-10'>
                            <Col md={2} sm={3} xs={5}>
                                <img
                                    src={'src/images/admin/logo.png'}
                                    className='logo img-responsive'
                                />
                            </Col>
                            <Col md={3} mdPush={6} sm={4} smPush={5} xs={7}>
                                <div style={{ marginTop: '10px' }}>
                                    <BranchFilter onChange={id => this.changeContext('branchId', id)} />
                                </div>
                                <div>
                                    <AuthComponent
                                        style={styles.authWrapper}
                                        onUpdate={this.props.onUserUpdate}
                                        isLogged={true}
                                    />
                                </div>
                            </Col>
                            <Col md={6} mdPull={3} sm={5} smPull={4} xs={12} style={styles.searchBar}>
                                <SearchBar
                                    onSelectResult={id => {
                                        router.push(`/users/${id}`)}
                                    }
                                />
                            </Col>
                        </Row>
                    </div>
                </div>

                <HeaderAdmin />
            </div>
        )
    }

    render() {
        return (
            <div className='admin'>
                {this.renderHeader()}
                <div className='container'>
                    {this.props.children}
                    <FooterAdmin />
                </div>
            </div>
        )
    }
}

AppAdmin.childContextTypes = {
    branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
}

AppAdmin.contextTypes = {
    router: PropTypes.object.isRequired
}