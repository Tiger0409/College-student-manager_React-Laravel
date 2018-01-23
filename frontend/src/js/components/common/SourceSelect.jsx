import React from 'react'
import $ from 'jquery'
import StringHelper from './../../utils/StringHelper.js'
import Ph from './../../utils/PromiseHelper.js'

export default class SourceSelect extends React.Component {
    constructor(props, context) {
        super(props, context)
        this.$obj = null
        this.state = {data: null}
        this.dataLoadPromise = null
        this.isLoaded = false
    }

    componentDidMount() {
        $(() => {
            this.updateOptions(this.props)
        })
    }

    componentWillReceiveProps(newProps) {
        if (JSON.stringify(this.props.params) !== JSON.stringify(newProps.params)) {
            this.updateOptions(newProps)
        }
    }

    componentWillUnmount() {
        if (this.dataLoadPromise)
            this.dataLoadPromise.cancel()
    }

    render() {
        var selectedValue = false
        if (this.props.optimisticLoad && this.props.value) {
            selectedValue = (
                <option>{StringHelper.ucFirst(this.props.value)}</option>
            )
        }

        if (!this.props.id) {
            console.log('SourceSelect: id not set')
            return false
        }
        if (this.props.id.indexOf('.') !== -1) {
            console.log('Wrong id')
            return false
        }

        const { data } = this.state
        const {
            optionPredicate,
            defaultOption,
            className,
            name,
            id,
            value,
            onChange,
            children,
            style
        } = this.props

        return (
            <select
                className={className}
                name={name}
                id={id}
                value={value}
                onChange={onChange}
                style={style}
            >
                {defaultOption ?
                    <option value=''>{defaultOption}</option>
                    : children
                }
                {data ?
                    data.map((item, i) => {
                        if (!optionPredicate || optionPredicate(item)) {
                            return (
                                <option
                                    key={i}
                                    value={item.value}
                                >
                                    {item.label}
                                </option>
                            )
                        }

                        return false
                    })
                    : false
                }
                {selectedValue}
            </select>
        )
    }

    updateOptions(props) {
        /*this.$obj = $('#' + props.id)
        this.$obj.children().each((i, child) => {
            if (i != 0) $(child).remove()
        })*/

        this.dataLoadPromise = Ph.ajax({ type: 'get', url: props.url, data: props.params })

        this.dataLoadPromise.then(
            data => {
                if (props.onLoad) {
                    props.onLoad(data)
                }
               /* data.forEach(elem => {
                    let exists = false
                    this.$obj.children().each((i, child) => {
                        var $child = $(child)
                        if ($child.text() === elem.label) {
                            exists = true
                            $child.attr('value', elem.value)
                        }
                    })

                    if (!exists) {
                        this.$obj.append(
                            $('<option></option>')
                                .attr('value', elem.value)
                                .text(StringHelper.ucWords(elem.label))
                        )
                    }
                })*/

                this.setState({ data: data })
            },
            xhr => console.log(xhr)
        )
    }
}