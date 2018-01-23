import React from 'react'
import { Router, browserHistory } from 'react-router'
import { routes } from './config/routes.jsx'
import '../style/style.css'
import '../style/animate.css'
import '../style/RichEditor.css'

const App = () => (
  <Router history={browserHistory}>
    {routes}
  </Router>
)

export default App
