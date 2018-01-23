import React, { PropTypes, Component } from 'react'
import AssetManager from '../../utils/AssetManager.js'

export default class Spinner extends Component {
    constructor(props, context) {
        super(props, context)
        this.assetManager = new AssetManager()
    }

    componentWillMount() {
        this.assetManager.loadCss('/src/style/spinner.css')
    }

    componentWillUnmount() {
        this.assetManager.unloadAll()
    }

    render() {
        const { show } = this.props

        if (typeof show != 'undefined' && !show) return <div></div>

        return (
            <div className="sk-circle">
                <div className="sk-circle1 sk-child"></div>
                <div className="sk-circle2 sk-child"></div>
                <div className="sk-circle3 sk-child"></div>
                <div className="sk-circle4 sk-child"></div>
                <div className="sk-circle5 sk-child"></div>
                <div className="sk-circle6 sk-child"></div>
                <div className="sk-circle7 sk-child"></div>
                <div className="sk-circle8 sk-child"></div>
                <div className="sk-circle9 sk-child"></div>
                <div className="sk-circle10 sk-child"></div>
                <div className="sk-circle11 sk-child"></div>
                <div className="sk-circle12 sk-child"></div>
            </div>
        )
    }
}

Spinner.propTypes = {
    show: PropTypes.bool
}