import React, { PropTypes, Component } from 'react'
import PromiseHelper from '../../../../utils/PromiseHelper.js'
import TeacherPayments from './TeacherPayments.jsx'
import { Button } from 'react-bootstrap'
import Notifier from '../../../../utils/Notifier.js'

export default class TeacherSubmitHours extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {firstLoading: true, data: []}
        this.save = this.save.bind(this)
        this.loadPromise = null
    }

    componentDidMount() {
        this.load()
    }

    componentWillUnmount() {
        if (this.loadPromise) {
            this.loadPromise.cancel()
        }
    }

    change(i, payments) {
        var { data } = this.state
        data[i].teacherPayments = payments
        this.setState({data: data})
    }

    load() {
        if (this.state.firstLoading)
            this.setState({firstLoading: false, isLoading: true})

        if (this.loadPromise) {
            this.loadPromise.cancel()
        }

        this.loadPromise = PromiseHelper.ajax({
            type: 'get',
            url: '/api/users/teachers',
            data: {fields: ['id', 'teacherPayments', 'userFullname']}
        })
        this.loadPromise.then(
            data => this.setState({isLoading: false, data: data.rows}),
            xhr => console.log(xhr)
        )
    }

    save() {
        const { data } = this.state

        $.ajax({
            type: 'put',
            url: '/api/users',
            data: { data },
            success: xhr => {
                Notifier.success('Updated')
                console.log(xhr)
                this.load()
            },
            error: xhr => {
                Notifier.error('Update failed')
                console.log(xhr)
            }
        })
    }

    renderPayments() {
        const { data } = this.state

        return data.map((teacher, i) => {
            if (!teacher.teacherPayments || teacher.teacherPayments.length == 0)
                return false

            return (
                <TeacherPayments
                    key={i}
                    payments={teacher.teacherPayments}
                    label={teacher.userFullname}
                    onChange={payments => this.change(i, payments)}
                />
            )
        })
    }

    render() {
        const { isLoading } = this.state

        if (isLoading) return <p>Loading...</p>

        return (
            <div>
                <div className='content-block'>
                    <h2 className='block-heading'>Submit Hours</h2>
                    <hr />

                    <div style={{ margin: '30px' }}>
                        {this.renderPayments()}
                    </div>

                    <Button className='custom btn-success' onClick={this.save}>Save</Button>
                </div>
            </div>
        )
    }
}