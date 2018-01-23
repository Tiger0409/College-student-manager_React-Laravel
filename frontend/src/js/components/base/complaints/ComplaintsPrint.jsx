import React, { Component } from 'react'
import Spinner from '../../common/Spinner'
import Oh from '../../../utils/ObjHelper'
import { Html } from '../../common/FormWidgets'

const get = Oh.getIfExists

export default class ComplaintsPrint extends Component {
    constructor(props, context) {
        super(props, context)

        this.requestFields = [
            'id',
            'createdAt',
            'types',
            'text',
            'handlerFullname',
            'actionTaken',
            'actionDeadline',
            'completionDate',
            'users',
            'branchAssociated'
        ]

        this.state = {
            isLoading: false,
            data: [],
            styles: {
                table: {
                    border: '1px solid black',
                    padding: '5px 0px 0px 5px'
                }
            }
        }
    }

    load() {
        this.setState({ isLoading: true })

        const { filters } = this.props.params

        $.ajax({
            type: 'get',
            url: '/api/complaints',
            data: {
                fields: this.requestFields,
                filters: JSON.parse(filters),
                page: 1,
                rowsPerPage: 999999999
            },
            success: data => this.setState({ data: data.rows, isLoading: false }),
            error: xhr => { this.setState({ isLoading: false }); console.error(xhr.responseText) }
        })
    }

    componentWillMount() {
        this.load()
    }

    render() {
        const { isLoading, data, styles } = this.state

        if (isLoading) return <Spinner />

        if (!data || data.length === 0) {
            return <p>No data</p>
        }

        return (
            <table style={styles.table} width="100%">
                <thead>
                    <tr>
                        <th style={styles.table}>Created at</th>
                        <th style={styles.table}>Type</th>
                        <th style={styles.table}>Handler name</th>
                        <th style={styles.table}>Text</th>
                        <th style={styles.table}>Action taken</th>
                        <th style={styles.table}>Action deadline</th>
                        <th style={styles.table}>Completion date</th>
                        <th style={styles.table}>Branch</th>
                        <th style={styles.table}>Students</th>
                    </tr>
                </thead>

                <tbody>
                {data.map(row => (
                    <tr>
                        <td style={styles.table}>{row.createdAt}</td>
                        <td style={styles.table}>{row.types.map(type => <p>{type.name}</p>)}</td>
                        <td style={styles.table}>{row.handlerFullname}</td>
                        <td style={styles.table}><Html style={{ width: '400px', wordBreak: 'break-all'}}>{row.text}</Html></td>
                        <td style={styles.table}><Html style={{ width: '400px', wordBreak: 'break-all'}}>{row.actionTaken}</Html></td>
                        <td style={styles.table}>{row.actionDeadline}</td>
                        <td style={styles.table}>{row.completionDate}</td>
                        <td style={styles.table}>{get(row, 'branchAssociated.branch_name', 'None')}</td>
                        <td style={styles.table}>
                        {row.users.length > 0 ?
                            <ul style={{ paddingLeft: '15px' }}>
                                {row.users.map(user => <li>{user.userFullname}</li>)}
                            </ul> : 'None'
                        }
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        )
    }
}