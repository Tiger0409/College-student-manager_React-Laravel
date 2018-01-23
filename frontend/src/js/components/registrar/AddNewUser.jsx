import React, { Component, PropTypes } from 'react'
import Registration from '../base/Registration.jsx'
import RoleFilter from '../common/RoleFilter.jsx'
import { ROLES } from '../../config/constants.js'
import { Row, Col } from 'react-bootstrap'

export default RoleFilter(
    class extends Component {
        render() {
            return (
                <Row>
                    <Col md={8} mdOffset={2}>
                        <div id="notifications"></div>
                        <div className='content-block'>
                            <h2 className='block-heading'>Add New User</h2>
                            <hr/>
                            <Registration redirectTo='created' />
                        </div>
                    </Col>
                </Row>
            )
        }
    },
    [ROLES.REGISTRAR, ROLES.ADMIN, ROLES.SUPER_ADMIN]
)