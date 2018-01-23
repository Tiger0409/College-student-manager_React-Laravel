import React, { PropTypes, Component } from 'react'
import AppStudent from './AppStudent.jsx'

export default class MyCourses extends Component {
    render() {
        const { user, router } = this.context

        if (!user) {
            router.push('/login')
            return <div></div>
        }

        return AppStudent.renderTemplatedComponent('MyCourses');
    }
}

MyCourses.contextTypes = {
    user: PropTypes.object,
    router: PropTypes.object.isRequired
}