import React from 'react'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'

export default props => {

    return (
        <>
        <div className="float-right">
        <FontAwesomeIcon
            icon={faCheck}
            size={`1x`}
            className="text-green mr-3"
            onClick={() => props.onDelete()}
            style={{'curser': 'pointer'}}
            id={'faCheck'}
            />
        <FontAwesomeIcon
            icon={faTimes}
            size={`1x`}
            className="text-red"
            onClick={() => props.onCancel()}
            style={{'curser': 'pointer'}}
            id={'faTimes'}
            />
            </div>
        </>
    )
}