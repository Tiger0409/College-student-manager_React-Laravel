import React from 'react'

class SelectSlide extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      value: '',
      isOpen: false,
      dictionary: {}
    }

    this.dropdownCloseHandler = this.dropdownCloseHandler.bind(this)
    this.closeDropdownEvent = this.dropdownCloseHandler
    this.toggleSelect = this.toggleSelect.bind(this)
  }

  componentDidMount () {
    const { autoClose, defaultValue, children } = this.props

    this.initializeDictionary(defaultValue, children)
    // if autoClose active, register events to close dropdown on click everywhere
    if (autoClose) {
      window.addEventListener('click', this.closeDropdownEvent)
    }
  }

  componentWillReceiveProps (nextProps) {
    let value = nextProps.defaultValue
    if (this.props.value !== nextProps.value || nextProps.defaultValue !== nextProps.value) {
      value = nextProps.value
    }
    this.initializeDictionary(value, nextProps.children)
  }

  componentWillUnmount () {
    if (this.props.autoClose) {
      window.removeEventListener('click', this.closeDropdownEvent)
    }
  }

  initializeDictionary (value, children) {
    let dictionary = {}
    React.Children.forEach(children, (child) => (
      dictionary[child.props.value] = child.props.children
    ))
    this.setState({
      dictionary: dictionary,
      value: value
    })
  }

  dropdownCloseHandler () {
    if (this.state.isOpen) {
      console.debug('CLOSE DROPDOWN')
      this.setState({ isOpen: false })
    }
  }

  makeOptionClickHandler (value, props) {
    const { name } = this.props
    return (e) => {
      e.preventDefault()
      e.stopPropagation()
      this.setState({
        value: value,
        isOpen: false
      })
      this.props.onChange({
        target: {
          name: name,
          value, value
        }
      })
    }
  }

  toggleSelect (e) {
    e.preventDefault()
    e.stopPropagation()
    this.setState({
      isOpen: !this.state.isOpen
    })
  }

  manageSelectOptions () {
    return React.Children.map(this.props.children, (child) => {
      if (child.props.value === this.state.value) return null
      return (
        <li onClick={this.makeOptionClickHandler(child.props.value, child.props)} className={child.props.className}>
          {child.props.children}
        </li>
      )
    })
  }

  render () {
    const { label, name, defaultValue, children, className, dropdownStyle, onChange, hideLabelOnOptionChosen } = this.props
    const { isOpen, dictionary, value } = this.state
    let selectOptions = this.manageSelectOptions()
    let selectSlideClasses = 'select-field' + (className ? ' ' + className : '') + (isOpen ? ' open' : '')

    let $label = null
    if (!hideLabelOnOptionChosen || value === defaultValue) {
      $label = <span className='select-label'>{label}</span>
    }

    return (
      <div className={selectSlideClasses}>
        <select name={name} value={value} onChange={onChange}>{children}</select>
        <div className='slide-mask'>
          <div className='active-option js-prevent-close-dropdown' onClick={this.toggleSelect}>{$label} {dictionary[value]}</div>
          <ul className='select-options' style={dropdownStyle}>
            {selectOptions}
          </ul>
        </div>
      </div>
    )
  }
}

SelectSlide.propTypes = {
  children: React.PropTypes.any,
  name: React.PropTypes.string,
  value: React.PropTypes.string,
  onChange: React.PropTypes.func,
  defaultValue: React.PropTypes.string,
  label: React.PropTypes.string,
  className: React.PropTypes.string,
  dropdownStyle: React.PropTypes.object,
  autoClose: React.PropTypes.bool,
  hideLabelOnOptionChosen: React.PropTypes.bool // activating this will make label dissapeared when the value is not defaultValue
}

SelectSlide.defaultProps = {
  autoClose: true,
  hideLabelOnOptionChosen: false
}

export default SelectSlide
