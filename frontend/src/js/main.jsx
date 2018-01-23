import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import Redbox from 'redbox-react'
import App from './App'

// error reporter
const CustomErrorReporter = ({ error }) => <Redbox error={ error } />
CustomErrorReporter.propTypes = {
  error: React.PropTypes.instanceOf(Error).isRequired
}

const render = (Component) => (
  ReactDOM.render(
    <AppContainer errorReporter={ CustomErrorReporter }>
      <Component />
    </AppContainer>,
    document.getElementById('react'),
  )
)

render(App)

// Webpack Hot Module Replacement API
if (module.hot) {
    module.hot.accept()
}
