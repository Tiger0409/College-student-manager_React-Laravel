import React, { PropTypes, Component } from 'react'
import { ROLES } from '../../../../config/constants'
import RoleFilter from '../../../common/RoleFilter'
import { Button, Modal } from 'react-bootstrap'
import Notifier from '../../../../utils/Notifier.js'
import ConfirmDialog from '../../../common/ConfirmDialog'
import BranchSelector from '../../../common/BranchSelector'
import Oh from '../../../../utils/ObjHelper'

const get = Oh.getIfExists

class MergeBranch extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { showMergeDlg: false, showConfirmDlg: false, branches: [], isProcessing: false }

        this.mergeConfirm = this.mergeConfirm.bind(this)
        this.finalConfirm = this.finalConfirm.bind(this)
        this.mergeBranch = this.mergeBranch.bind(this)
    }

    mergeBranch() {
        const { branches } = this.state
        const { filters } = this.props

        this.setState({ isProcessing: true })

        $.ajax({
            type: 'post',
            url: '/api/users/merge-branches',
            data: { filters: filters, branches: branches },
            success: () => {
                Notifier.success('Students merged to branches')
                this.setState({ isProcessing: false })
            },
            error: xhr => {
                Notifier.error('Failed to merge students to branches')
                console.error(xhr.responseText)
                this.setState({ isProcessing: false })
            }
        })
    }

    mergeConfirm(branches) {
        this.setState({ branches: branches, showConfirmDlg: true })
    }

    finalConfirm() {
        this.mergeBranch()
        this.setState({ showConfirmDlg: false })
    }

    render() {
        const { showMergeDlg, showConfirmDlg, isProcessing } = this.state

        return (
            <div>
                <Button className="custom" onClick={() => this.setState({ showMergeDlg: true })}>{isProcessing ? 'Merging...' : 'Merge to branch'}</Button>

                <MergeDialog
                    show={showMergeDlg}
                    onConfirm={this.mergeConfirm}
                    onClose={() => this.setState({ showMergeDlg: false })}
                />

                <ConfirmDialog
                    show={showConfirmDlg}
                    onYes={this.finalConfirm}
                    onNo={() => this.setState({ showConfirmDlg: false })}
                    headerText='Confirm merging students to branch'
                    confirmText='This cannot be undone, are you sure?'
                />
            </div>
        )
    }
}

MergeBranch.propTypes = {
    filters: PropTypes.object.isRequired
}

class MergeDialog extends Component {
    constructor(props, context) {
        super(props, context)

        this.state = { branches: [] }
        this.clearListeners = []

        this.close = this.close.bind(this)
        this.submit = this.submit.bind(this)
        this.onChange = this.onChange.bind(this)
        this.onGetClearListener = this.onGetClearListener.bind(this)
    }

    onChange({ target }) {
        this.setState({ [target.name]: target.value.split(',') })
    }

    close() {
        this.clearListeners.forEach(listener => listener())
        this.props.onClose()
    }

    submit() {
        this.props.onConfirm(this.state.branches)
        this.close()
    }

    onGetClearListener(listener) {
        this.clearListeners.push(listener)
    }

    render() {
        const { show } = this.props

        return (
            <Modal show={show} onHide={this.close}>
                <Modal.Dialog>
                    <Modal.Header closeButton>
                        <h3>Merge students to branch</h3>
                    </Modal.Header>

                    <Modal.Body>
                        <BranchSelector name='branches' onChange={this.onChange} onSendClearCallback={this.onGetClearListener} />
                    </Modal.Body>

                    <Modal.Footer>
                        <Button onClick={this.submit} style={{ marginRight: '15px' }}>OK</Button>
                        <Button onClick={this.close}>Cancel</Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal>
        )
    }
}

MergeDialog.propTypes = {
    show: PropTypes.bool.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired
}

export default class Wrapper extends Component {
    render() {
        const Wrapped = RoleFilter(MergeBranch, [ROLES.SUPER_ADMIN])
        return (
            <Wrapped appTypeKey={get(this.context, 'user.role.roleName', '')} {...this.props} />
        )
    }
}

Wrapper.contextTypes = {
    user: PropTypes.object.isRequired
}