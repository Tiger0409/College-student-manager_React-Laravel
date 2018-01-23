import React, { Component, PropTypes } from 'react'
import RegistrarEdit from '../base/users/registrars/RegistrarEdit.jsx'

export default class RegistrarProfile extends Component {
    render() {
        const { user, router } = this.context

        if (!user) {
            router.replace('/login')
        }

        return (
            <div>
                <RegistrarEdit id={user.id} />
            </div>
        )
    }
}

RegistrarProfile.contextTypes = {
    user: PropTypes.object,
    router: PropTypes.object.isRequired
}