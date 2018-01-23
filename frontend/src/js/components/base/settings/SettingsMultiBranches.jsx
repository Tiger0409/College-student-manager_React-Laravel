import React, { PropTypes, Component } from 'react'
import { Tabs, Tab } from 'react-bootstrap'
import Websites from './Websites.jsx'
import Branches from './Branches.jsx'

export default class extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { selectedTab: 0 }
    }

    render() {
        const { selectedTab } = this.state

        return (
            <div className='content-block'>
                <h2 className='block-heading'>Multi Branches Management</h2>
                <hr />

                <Tabs
                    className='content-tabs'
                    activeKey={selectedTab}
                    onSelect={key => this.setState({ selectedTab: key })}
                    style={{ paddingTop: '35px' }}
                >
                    <Tab eventKey={0} title='Websites' style={{ paddingTop: '20px' }}>
                        <Websites {...this.props} />
                    </Tab>

                    <Tab eventKey={1} title='Branches' style={{ paddingTop: '20px' }}>
                       <Branches {...this.props} />
                    </Tab>
                </Tabs>
            </div>
        )
    }
}