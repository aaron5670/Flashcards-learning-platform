import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Card, Button, Form } from 'react-bootstrap'

import './FlashcardTable.css'

import { addColumn, deleteColumn, editColumnName, addFlashcard, editFlashcard, deleteFlashcard, setQuickDeleteAction, uploadFile, setExpandTable } from './actions'
import AddColumnButton from './sub-components/AddColumnButton'
import { Notification } from '../../../shared/components/Notification'
import DeleteButton from './sub-components/DeleteButton'
import StateSwitch from '../../../shared/components/StateSwitch';
import ConfirmationButtons from './sub-components/ConfirmationButtons'
import ColumImage from './sub-components/ColumnImage'

const FlashcardTableComponent = (props) => {

    const [upForDelete, setUpForDelete] = useState()

    const buttons = [
        {
            type: 'Text',
        }, 
        {
            type: 'Image'
        },
        {
            type: 'Audio'
        }
    ]

    const handleDeleteSwitch = () => {
        props.setQuickDelete(!props.quickDelete)
        setUpForDelete(undefined)
    }

    const handleExpandTable = () => {
        props.setExpandTable(!props.expandTable)
    }

    const handleAddColumn = async (e) => {
        const type = e.currentTarget.getAttribute('name')
        const name = e.target.value
        const result = await props.addColumn(type, name, props.deck.creatorId, props.deck._id)
        Notification(result.message, result.success ? 'success' : 'danger', 600)
    }

    const handleDeleteColumn = async (index) => {
        const result = await props.deleteColumn(index, props.deck.creatorId, props.deck._id)
        setUpForDelete(undefined)
        Notification(result.message, result.success ? 'success' : 'danger', 600)
    }

    let timers = []
    let values = []
    if (props.deck && props.deck.flashcards){
        if (props.deck.flashcards.length > 0) {
            props.deck.flashcards.forEach((fc) => {
                fc.columns.forEach(col => {
                    timers[col._id] = ''
                    values[col._id] = ''
                })
        })
        if (props.deck.columns && props.deck.columns > 0) {
            props.deck.columns.forEach(col => {
                timers[col._id] = ''
                values[col._id] = ''
            })
        }
    } 
    }

    const handleEditColumnName = (e, index, columnId) => {
        e.preventDefault()
        values[columnId] = e.target.value
        clearTimeout(timers[columnId])
        timers[columnId] = setTimeout( async () => {
           const result = await props.editColumnName(index, props.deck.creatorId, props.deck._id, values[columnId])
           Notification(result.message, result.success ? 'success' : 'danger', 500)
        } , 1000)
    }

    const handleEditFlashcardColumn = (e, flashcardId, indexColumn, columnId) => {
        e.preventDefault()
        values[columnId] = e.target.value
        clearTimeout(timers[columnId])
        timers[columnId] = setTimeout( async () => {
            const result = await props.editFlashcard(values[columnId],'value', props.deck.creatorId, props.deck._id, flashcardId, columnId)
            Notification(result.message, result.success ? 'success' : 'danger', 500)
        }, 1000)
        
    }

    const handleDeleteFlashcard = async (flashcardId) => {
        const result = await props.deleteFlashcard(flashcardId, props.deck.creatorId, props.deck._id )
        setUpForDelete(undefined)
        Notification(result.message, result.success ? 'success' : 'danger', 1000)
    }

    const handleAddFlashcard = async () => {
        const result = await props.addFlashcard(props.deck.creatorId, props.deck._id)
        Notification(result.message, result.success ? 'success' : 'danger', 1000)
    }

    const handleAllDeleteActions = (func, id) => {
        if (props.quickDelete){
            func()
        } else {
            setUpForDelete(id)
        }
    }

    const AddColumnButtons = () => {
        return (
            <>
                <Row className="justifty-content-center justify-content-md-end mt-5">

                {buttons.map((button, index) => (
                    <Col xs={12} md={4} key={button.type + index + 'col'}>
                        <AddColumnButton 
                            key={button.type + index} 
                            name={button.type} value={''} 
                            buttonType={button.type} 
                            onClick={handleAddColumn}/>
                    </Col>
                ))}
                </Row>
            </>
        )
    }
    const showAllColumnNames = (columns) => {

        return columns.map((column, index) => (
            <td key={column.type + column.name + index + '-type'}>
                <input 
                    name={column.name + '!' + index}
                    defaultValue={column.name} 
                    placeholder={column.name} 
                    className="form-control" 
                    onInput={(e) => handleEditColumnName(e, index, column._id)}
                    />
            </td>
        ))
    }

    const showAllColumnTypes = (columns) => {
        return columns.map((column, index) => (
            <td key={column.type + column.name + index + '-name'}>
                <strong>{column.type}</strong>
                {upForDelete !== index ? 
                <DeleteButton
                    onClick={() => handleAllDeleteActions(() => handleDeleteColumn(index), index)}
                    columnId={column._id}
                    />
                : <ConfirmationButtons onDelete={() => handleDeleteColumn(index)} onCancel={() => setUpForDelete(undefined)} />}
            </td>
        ))
    }

    const handleImageUpload = async (e, creator, deck, flashcard, column) => {
        e.preventDefault()
        let x = new FormData()
        x.append('image', e.target.files[0])   
        const upload = await props.uploadFile(x)
        if (upload.success){
            const result = await props.editFlashcard(upload.data,'path', creator, deck, flashcard, column)
            Notification(result.message, result.success ? 'success' : 'danger', 1000)
        } else {
            Notification('Upload failed', 'danger', 1000)
        }
    }

    const handleAudioUpload = async (e, creator, deck, flashcard, column) => {
        e.preventDefault()
        let audio = new FormData()
        audio.append('audio', e.target.files[0])
        const upload = await props.uploadFile(audio, '/audio')
        if (upload.success){
            const result = await props.editFlashcard(upload.data,'path', creator, deck, flashcard, column)
            Notification(result.message, result.success ? 'success' : 'danger', 1000)    
        } else {
            Notification('Upload failed', 'danger', 1000)
        }
    }

    const ShowFlashCards = (flashcards) => {
        return flashcards.map((flashcard, indexFlashcard) => (
            <tr key={flashcard._id} className="tr">
                <td>
                    <strong># {indexFlashcard + 1}</strong>
                    {upForDelete !== flashcard._id ? 
                    <DeleteButton
                        columnId={flashcard._id}
                        onClick={() => handleAllDeleteActions(() => handleDeleteFlashcard(flashcard._id), flashcard._id)}
                        />

                    : <ConfirmationButtons onDelete={() => handleDeleteFlashcard(flashcard._id)} onCancel={() => setUpForDelete(undefined)} /> }
                </td>
                {flashcard.columns.map((column, indexColumn) => {

                    if (column.type === 'Image'){
                        return (
                            <td>
                                <Row className="align-content-center">
                                    <Col>
                                        {column.path ? 
                                        <ColumImage image={`http://localhost:3001/api/v1/images/${column.path}`} />
                                        : '' }
                                    </Col>
                                    <Col className="align-self-center">
                                        <label style={{'cursor': 'pointer'}} className={`btn ${column.path ? 'btn-warning':'btn-success'}`}>
                                            {column.path ? 'Change' : 'Upload'} 
                                            <input
                                                onChange={(e) => handleImageUpload(e, props.deck.creatorId, props.deck._id, flashcard._id, column._id)}
                                                style={{'display': 'none'}}
                                                type="file"
                                                label="image"
                                                id={'123'}
                                                name="image"
                                            />  
                                        </label>
                                    </Col>
                                </Row>
                            </td>
                        )
                    } 

                    if (column.type === 'Audio'){
                        return (
                            <td>
                                <Row className="align-content-center">
                                    <Col>
                                        {column.path ? 
                                        <audio controls src={`http://localhost:3001/api/v1/audio/${column.path}`} alt="Audio" />
                                        : '' }
                                    </Col>
                                    <Col className="align-self-center">
                                        <label style={{'cursor': 'pointer'}} className={`btn ${column.path ? 'btn-warning':'btn-success'}`}>
                                            {column.path ? 'Change' : 'Upload'} 
                                            <input
                                                onChange={(e) => handleAudioUpload(e, props.deck.creatorId, props.deck._id, flashcard._id, column._id)}
                                                style={{'display': 'none'}}
                                                type="file"
                                                label="audio"
                                                id={'123'}
                                                name="audio"
                                            />  
                                        </label>
                                    </Col>
                                </Row>
                            </td>
                        )
                    } 
                    return (
                        <td key={column._id}>
                            <input 
                                className="form-control"
                                defaultValue={column.value}
                                placeholder={column.value}
                                onChange={(e) => handleEditFlashcardColumn(e, flashcard._id, indexColumn, column._id )}
                                />
                        </td>
                    )
                })}
            </tr>
        ))
    }

    return (
        <>
            <div className="container">
            <AddColumnButtons />
            <Button className="w-100 my-3" variant="outline-danger" onClick={handleAddFlashcard}>NIEUWE KAART</Button>
            <Row>
                <Col>
                    <StateSwitch 
                    giveId='expandTable'
                    state={props.expandTable}
                    label="Make table wider??"
                    handleSwitch={handleExpandTable}
                    text={props.expandTable ? 'man of culture': 'I prefer scrolling'}
                    />
                </Col>
                <Col>
                    <StateSwitch 
                    giveId='quickDelete'
                    state={props.quickDelete}
                    label="Enable quick delete?"
                    handleSwitch={handleDeleteSwitch}
                    text={props.quickDelete ? 'YOLO': 'im a pussy'}
                    />
                </Col>
            </Row>
            </div>
            <div className={props.expandTable ? 'container-fluid' : 'container' }>
            <div className="w-100 mb-5" style={{'overflowX': 'auto'}}>
            <table className="my-5">
                <tbody style={{'position': 'sticky'}}>
                <tr>
                    <td>
                        Type
                    </td>
                    {showAllColumnTypes(props.deck.columns)}
                </tr>
                <tr>
                    <td>
                        Name
                    </td>
                    {showAllColumnNames(props.deck.columns)}
                </tr>
                </tbody>                    
                <tbody>
                        {ShowFlashCards(props.deck.flashcards)}
                    </tbody>
                </table>
            </div>
            </div>

        </>
    )
}

const mapStateToProps = state => {
    return {
        deck: state.decks.deck,
        quickDelete: state.client.quickDelete,
        expandTable: state.client.expandTable,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        addColumn: (type, name, creator, deck) => dispatch(addColumn(type, name, creator, deck)),
        deleteColumn: (index, creator, deck) => dispatch(deleteColumn(index, creator, deck)),
        editColumnName: (index, creator, deck, value) => dispatch(editColumnName(index, creator, deck, value)),
        addFlashcard: (creator, deck) => dispatch(addFlashcard(creator, deck)),
        editFlashcard: (value, creator, deck, flashcard, indexFlashcard, indexColumn) => dispatch(editFlashcard(value, creator, deck, flashcard, indexFlashcard, indexColumn)),
        deleteFlashcard: (flashcardId, creator, deck) => dispatch(deleteFlashcard(flashcardId, creator, deck)),
        setQuickDelete: (bool) => dispatch(setQuickDeleteAction(bool)),
        uploadFile: (form, audio) => dispatch(uploadFile(form, audio)),
        setExpandTable: (bool) => dispatch(setExpandTable(bool)),
    }
}

export const FlashcardTable = connect(mapStateToProps, mapDispatchToProps)(FlashcardTableComponent);