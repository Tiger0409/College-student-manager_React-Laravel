import React, { Component, PropTypes } from 'react'
import FormGroup from './../../common/FormGroup.jsx'
import { Button } from 'react-bootstrap'
import PromiseHelper from './../../../utils/PromiseHelper.js'
import Convert from './../../../utils/Convert.js'
import Notifier from '../../../utils/Notifier.js'
import ConfirmDeleteWnd from '../../common/ConfirmDeleteWnd.jsx'

let styles = {
    input: { width: '250px', display: 'inline-block', marginLeft: '10px' },
    buttonAdd: { marginLeft: '10px', verticalAlign: 'top' }
}

if (window.innerWidth < 768) {
    styles = {
        input: { width: '100%', display: 'inline-block', marginBottom: 10 },
        buttonAdd: { width: '100%', marginTop: 10 }
    }   
} else if (window.innerWidth < 1025) {
    styles = Object.assign({}, styles, {
        input: { width: '50%', display: 'inline-block', marginLeft: '10px' },
        buttonAdd: { width: 'calc(50% - 86px)', marginLeft: '10px', verticalAlign: 'top' }
    })
}

export default class ClassExams extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = {examName: '', isLoading: true, exams: [], classObj: null, examToDelete: null, showConfirmDelete: false }
        this.promises = {load: null}
        this.deleteExam = this.deleteExam.bind(this)
        this.add = this.add.bind(this)
    }

    componentWillMount() {
        this.loadData()
        this.setState({classObj: this.props.classObj})
    }

    componentWillUnmount() {
        for (let key in this.promises)
            if (this.promises[key]) this.promises[key].cancel()
    }

    render() {
        const { examName, classObj } = this.state

        // if class is new
        if (classObj && classObj.id === null)
            return false

        const { label } = this.props

        return (
            <div style={{marginTop: '40px', marginBottom: '40px'}}>
                {label ? <h4>{label}</h4> : ''}

                {this.renderExams()}

                <label htmlFor='examName'>New exam</label>
                <input
                    className='form-control' style={styles.input}
                    type='text' name='examName' value={examName} onChange={e => this.onTextChange(e)}/>
                <Button
                    bsStyle='success'
                    className='custom'
                    style={styles.buttonAdd}
                    onClick={this.add}
                >
                    Add
                </Button>
            </div>
        )
    }

    loadData() {
        const { classObj } = this.props
        if (!classObj || !classObj.id) return

        this.setState({isLoading: true})

        this.promises.load = PromiseHelper.ajax({
            type: 'get',
            url: '/api/classes/' + classObj.id + '/exams'
        })
        this.promises.load.then(
            data => this.setState({isLoading: false, exams: data}),
            xhr => console.log(xhr)
        )
    }

    renderExams() {
        const { classObj, exams, showConfirmDelete, examToDelete } = this.state
        if (!classObj || !classObj.id) return false
        const isClassSubmitted = Convert.toBool(classObj.submitted)

        var additionalExams = exams.map(exam => {
            return (
                <Exam
                    key={exam.id}
                    title={exam.title}
                    isSubmitted={Convert.toBool(exam.submitted)}
                    onToggle={() => this.toggleExamSubmitted(exam)}
                    onSave={title => this.renameExam(exam, title)}
                    onDelete={() => this.setState({ examToDelete: exam, showConfirmDelete: true })}
                />
            )
        })

        return (
            <div>
                <Exam
                    title='Final Grade' isSubmitted={isClassSubmitted}
                    toggleOnly={true} onToggle={() => this.toggleClassSubmitted()}/>
                {additionalExams}

                <ConfirmDeleteWnd
                    show={showConfirmDelete}
                    onConfirm={this.deleteExam}
                    onClose={() => this.setState({ showConfirmDelete: false })}
                />
            </div>
        )
    }

    add() {
        const { examName } = this.state
        var { classesIds, classObj } = this.props
        var requestIds = []
        if (classObj) {
            requestIds = [classObj.id]
        }
        else if (classesIds)
            requestIds = classesIds.slice()

        if (examName.length > 0 && requestIds.length > 0) {
            $.ajax({
                type: 'post',
                url: '/api/exams',
                data: {
                    title: examName,
                    courseClassIds: requestIds
                },
                success: newExams => {
                    Notifier.success('Saved successfully')

                    if (classObj && classObj.id) {
                        var { exams } = this.state
                        exams = exams.concat(newExams)
                        this.setState({exams: exams})
                    }
                },
                error: xhr => {
                    Notifier.error('Save failed')
                    console.log(xhr)
                }
            })
        }
    }

    toggleClassSubmitted() {
        var { classObj } = this.props
        if (classObj && classObj.id) {
            classObj.submitted = classObj.submitted == '1' ? '0' : '1'
            console.log(classObj.submitted)
            this.updateClass(classObj)
        }
    }

    toggleExamSubmitted(exam) {
        exam.submitted = exam.submitted == '1' ? '0' : '1'
        this.updateExam(exam)
    }

    renameExam(exam, newTitle) {
        exam.title = newTitle
        this.updateExam(exam)
    }

    deleteExam(reason) {
        var { exams, examToDelete: exam } = this.state
        for (let i = 0; i < exams.length; i++)
            if (exam.id == exams[i].id) {
                exams.splice(i, 1)
                break
            }
        this.setState({exams: exams})

        $.ajax({
            type: 'delete',
            url: '/api/exams/' + exam.id,
            data: { reason: reason },
            success: () => Notifier.success('Deleted successfully'),
            error: () => Notifier.error('Deletion failed')
        })
    }

    updateExam(exam) {
        var { exams } = this.state
        for (let i = 0; i < exams.length; i++)
            if (exam.id == exams[i].id) {
                exams[i] = exam
                break
            }
        this.setState({exams: exams})

        $.ajax({
            type: 'put',
            url: '/api/exams/' + exam.id,
            data: exam,
            success: () => Notifier.success('Updated'),
            error: () => Notifier.error('Update failed')
        })
    }

    updateClass(classObj) {
        this.setState({classObj: classObj})

        $.ajax({
            type: 'put',
            url: '/api/classes/' + classObj.id,
            data: {submitted: classObj.submitted},
            success: () => Notifier.success('Updated'),
            error: () => Notifier.error('Update failed')
        })
    }

    onTextChange(e) {
        this.setState({examName: e.target.value})
    }
}
ClassExams.propTypes = {
    classesIds: PropTypes.array,
    classObj: PropTypes.object,
    label: PropTypes.string
}

let examStyles = {
    input: { width: '75%', display: 'inline-block', marginRight: '10px' },
    button: { marginRight: '10px' }
}

if (window.innerWidth < 768) {
    examStyles = {
        input: { width: '100%', marginBottom: 10 },
        button: { width: '100%', marginBottom: 10 }
    }
} else if (window.innerWidth < 1025) {
    examStyles = {
        input: { width: '100%', marginBottom: 10 },
        button: { width: 'calc(33% - 10px)', marginBottom: 10, marginRight: 5, marginLeft: 5 },
        buttonWrap: { marginLeft: -5, marginRight: -5 }
    }
}

class Exam extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { title: '' }
    }

    componentWillMount() {
        this.setState({title: this.props.title})
    }

    render() {
        var { title } = this.state
        const { toggleOnly, onSave, onDelete, onToggle, isSubmitted } = this.props

        return (
            <div style={{marginBottom: '10px'}}>
                <div style={examStyles.input}>
                    <input
                        type='text' value={title} className='form-control'
                        readOnly={toggleOnly} onChange={e => { this.setState({title: e.target.value}) }}/>
                </div>
                <div style={examStyles.buttonWrap}>
                    <Button style={examStyles.button} disabled={toggleOnly} onClick={() => { if (onSave) onSave(title) }}>Save</Button>
                    <Button style={examStyles.button} disabled={toggleOnly} onClick={() => { if (onDelete) onDelete() }}>Delete</Button>
                    <Button style={examStyles.button} bsStyle='primary' onClick={() => onToggle() }>
                        {isSubmitted ? 'Open' : 'Close'}
                    </Button>
                </div>
            </div>
        )
    }
}
Exam.PropTypes = {
    title: PropTypes.string.isRequired,
    toggleOnly: PropTypes.bool.isRequired,
    isSubmitted: PropTypes.bool.isRequired,
    onSave: PropTypes.func,
    onDelete: PropTypes.func,
    onToggle: PropTypes.func.isRequired
}