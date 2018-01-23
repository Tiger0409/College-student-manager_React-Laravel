import React from 'react'
import ActiveTerm from '../common/ActiveTerm.jsx'
import FrontendActiveTerms from '../common/FrontendActiveTerms.jsx'

export default class FooterAdmin extends React.Component {
    render() {
        return (
            <div>
                <div
                    className='content-block'
                    style={{ padding: '15px 30px 15px 30px', marginBottom: '20px' }}
                >
                    <span>Backend </span><ActiveTerm style={{ margin: '0', display: 'inline-block' }} />
                    <p style={{ margin: '10px 0 0 0'}}>Frontend Active Terms:</p>
                    <FrontendActiveTerms />
                </div>
            </div>
        )
    }
}