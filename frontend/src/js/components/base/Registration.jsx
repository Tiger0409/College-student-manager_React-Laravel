import React, { Component, PropTypes } from 'react'
import Oh from '../../utils/ObjHelper.js'
import DataLoader from '../common/DataLoader.jsx'
import ProfileForm from '../students/ProfileForm.jsx'
import { Button } from 'react-bootstrap'
import Notifier from '../../utils/Notifier.js'

class RegistrationInnerComponent extends Component {
    constructor(...args) {
        super(...args)
        this.state = { user: {} }
        this.save = this.save.bind(this)
    }

    validate(user) {
        const get = Oh.getIfExists
        let errors = []

        const requiredFields = {
            //'age': 'Birth date',
            //'profile.profileTelephone': 'Telephone',
            //'profile.profileMobile': 'Mobile'
        }

        // check required fields
        for (const fieldsStr in requiredFields) {
            let isEmpty = true

            const fields = fieldsStr.split('|')
            for (const i in fields) {
                if (get(user, fields[i], null)) {
                    isEmpty = false
                    break
                }
            }

            if (isEmpty) errors.push(`${requiredFields[fieldsStr]} should not be empty`)
        }


        if (user.userPassword && user.userPassword != user.userPasswordConfirm) {
            errors.push('Passwords should match')
        }

        errors.forEach(error => Notifier.error(error))
        //alert(errors.join('\n'))

        return errors.length === 0
    }

    save(e) {
        e.preventDefault()

        const { user } = this.state
        const { save, redirectTo } = this.props
        const { router } = this.context

        if (!this.validate(user)) {
            return
        }

        const get = Oh.getIfExists
        user.userFullname = get(user, 'profile.profileForname', '') + ' ' + get(user, 'profile.profileSurname', '')

        save(user,
            createdUser => {
                this.setState({ user: {} })
                if (redirectTo && redirectTo.length > 0) {
                    if (redirectTo == 'created') {
                        router.push(`/users/${createdUser.id}`)
                    } else {
                        router.push(redirectTo)
                    }
                } else {
                    router.push('/registration-success')
                }
            }
        )
    }

    render() {
        const { user } = this.state

        return (
            <div>
                <form id='userCreateForm' action='none' onSubmit={this.save}>
                    <ProfileForm
                        user={user}
                        onChange={user => this.setState({ user: user })}
                        colWidth={6}
                        colOffset={0}
                        excludePasswords
                    />

                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                        <Button
                            style={{ textTransform: 'uppercase', width: '33%' }}
                            bsStyle='success'
                            type='submit'
                        >
                            Submit
                        </Button>
                    </div>
                </form>
            </div>
        )
    }
}

RegistrationInnerComponent.contextTypes = {
    router: PropTypes.object.isRequired
}

export default DataLoader(
    RegistrationInnerComponent,
    { save: { type: 'post', url: '/api/users' } }
)