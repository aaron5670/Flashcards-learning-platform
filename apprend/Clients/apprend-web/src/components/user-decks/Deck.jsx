import React, {useEffect, useState} from "react";
import * as ReactRedux from "react-redux"
import {NavigatieBar} from "../shared/navbar/NavigatieBar";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import {Link, useParams} from "react-router-dom";
import {Footer} from "../shared/footer/Footer"
import {getDeckAction} from "../../redux-store/actions/decks/async-actions";
import Card from "react-bootstrap/Card";
import 'loaders.css/src/animations/square-spin.scss'
import Loader from "react-loaders";
import { useHistory } from 'react-router'
import {withRouter} from 'react-router-dom'

import {isLoggedIn} from "../../redux-store/actions/login/async-actions";
import {importDeckAction} from "../../redux-store/actions/decks/async-actions";
import PlayButton from "./sub-components/PlayButton";
import EditButton from "./sub-components/EditButton";
import ToggleStatusButton from "./sub-components/ToggleStatusButton";
import DeleteButton from "./sub-components/DeleteButton";
import ImportButton from "./sub-components/ImportButton";
import {deleteDeckFromUser, toggleDeckStatus, setDeckEditedAction} from '../../redux-store/actions/decks/async-actions'
import ConfirmationBox from "./sub-components/ConfirmationBox";

const UserDecks = (props) => {
    const {deckId} = useParams();
    const isCreator = (props.username === props.deck.creatorId);

    const [editName, setEditName] = useState()
    const [editDescription, seteditDescription] = useState()
    const [editState, seteditState] = useState()
    const [deleteStatus, setdeleteStatus] = useState(false)

    const history = useHistory()

    //Check if user is logged in
    useEffect(() => {
        props.isLoggedIn()
        props.getDeck(deckId)

    }, []);

    const playDeckHandler = () => {
        history.push(`/decks/${props.deck._id}/play`)
    }

    const handleImportButton = async () => {
        const result = await props.importDeck(props.deck._id)
        if (!result) return
        let deck
        if (!props.username) deck = result.decks[0]._id
        else deck = result._id
        await props.isLoggedIn()

        history.push(`/decks/${deck}`)
        props.getDeck(deck)
    }

    // Toggles public/private status of a deck
    const toggleDeckStatusHandler = () => {
        props.toggleStatus(props.deck._id, props.deck.creatorId)
    }

    const deleteDeckHandler = () => {
        props.deleteDeckFromUser(props.deck._id)
        history.push(`/${props.username}/decks`)
    }

    const editDeckHandler = () => {
        props.editDeck(props.deck.creatorId, props.deck._id, editName ? editName : props.deck.name, editDescription ? editDescription : props.deck.description )
        toggleEditStateHandler()
    }

    const toggleDeleteStatusHandler = () => {
        setdeleteStatus(!deleteStatus)
    }

    const toggleEditStateHandler = () => {
        setEditName('')
        seteditState(!editState)
    }

    const setStateHandler = (e, func) => {
        let value
        if (e){
            value = e.currentTarget.value
        }
        func(value)
    }

    const findAllOptions = (isCreator) => {
        let icons = []
        if (isCreator){
            icons.push(<PlayButton func={playDeckHandler}/>)
            icons.push(<EditButton func={toggleEditStateHandler} />)
            icons.push(<ToggleStatusButton func={toggleDeckStatusHandler}  isPrivate={props.deck.private}/>)
            icons.push(<DeleteButton func={toggleDeleteStatusHandler} />)
        } else {
            icons.push(<ImportButton func={handleImportButton} />)
        }
        return icons
    }

    const showOptions = (icons) => {
        return icons.map(icon => (
            <Col xs={6} md={3}>
                {icon}
            </Col>
        ))
    }

    const showDeleteConfirmationBox = () => {
        const boxes = []
        if (deleteStatus){
            boxes.push(<ConfirmationBox 
                            message="Confirm delete?" 
                            boxClass="py-2" 
                            colClass="my-3"
                            func={deleteDeckHandler}
                            cancelFunc={toggleDeleteStatusHandler} />)
        }
        return boxes
    }

    const showEditConfirmationBox = () => {
        const boxes = []
        if (editState){
            boxes.push(<ConfirmationBox 
                            message="Confirm edit?" 
                            boxClass="py-2" 
                            colClass="my-3"
                            func={editDeckHandler}
                            cancelFunc={toggleEditStateHandler} />)
        }
        return boxes
    }

    let loader, deck, error;
    if (props.isLoading) {
        loader = (
            <Row className="mx-auto align-items-center flex-column py-5">
                <Loader type="square-spin" active={true} color={'#758BFE'}/>
                <h2>Loading decks...</h2>
            </Row>
        )
    } else if (props.deck) {
        if (props.deck.toString() === 'deck-not-found') {
            error = (
                <Row className="mx-auto align-items-center flex-column py-5">
                    <h2>Deck not found... ☹️</h2>
                </Row>
            )
        }

        let totalFlashcards = 0;
        if (props.deck.flashcards) {
            totalFlashcards = props.deck.flashcards.length
        }
        if (props.deck.toString() !== 'deck-not-found'){
            const datum = new Date(props.deck.creationDate).toLocaleDateString()
            deck = (
                <>
                <Card style={{width: '100%'}} bg={'light'} className={'my-5 text-center'}>
                    <Card.Body>
                        <Card.Subtitle>
                            <Row>
                                <Col xs={12} md={4}>
                                    <b>Created on: </b>{datum ? datum : '' }
                                </Col>
                                <Col xs={12} md={4}>
                                    <b>Created by: </b>{props.deck.creatorId ? props.deck.creatorId.length === 32 ? 'Anon' : props.deck.creatorId : ''}
                                </Col>
                                <Col xs={12} md={4}>
                                    <b>Total flashcards: </b>{totalFlashcards}
                                </Col>
                            </Row>
                        </Card.Subtitle>

                    </Card.Body>
                </Card>
                {showOptions(findAllOptions(isCreator))}
                </>
            )
        }
    }

    const Deckname = () => {
        if (editState)
        return (
            <>
                <Form.Group controlId="formBasicEmail" className={"text-center"}>
                    <Form.Label column={true}>
                            <strong>Edit {props.deck.name}</strong>
                    </Form.Label>
                    <Form.Control type="text"
                                  name={props.deck._id}
                                  placeholder={props.deck.name}
                                  defaultValue={props.deck.name}
                                  id={`input-name`}
                                  onChange={(e) => {
                                    setStateHandler(e, setEditName)
                                  }}
                    />
                </Form.Group>
            </>
        )

        else return (
            <h1 className="display-5 text-green ">
                {props.deck.name}
            </h1>
        )
    }

    const Deckdescription = () => {
        if (editState)
        return (
            <>
                <Form.Group controlId="formBasicEmail" className={"text-center"}>
                    <Form.Label column={true}>
                            <strong>Edit description</strong>
                    </Form.Label>
                    <Form.Control type="text"
                                  name={props.deck._id}
                                  placeholder={props.deck.description}
                                  defaultValue={props.deck.description}
                                  id={`input-description`}
                                  onChange={(e) => {
                                    setStateHandler(e, seteditDescription)
                                  }}
                    />
                </Form.Group>
            </>
        )

        else return (
            <h4 className="display-5 text-black ">
                {props.deck.description}
            </h4>
        )
    }

    return (
        <>
            <NavigatieBar/>
            <Container>
                <Row>
                    <Col lg={{span: 8, offset: 2}}>
                        <div className="mx-auto text-center pt-5">
                            {Deckname()}
                            {Deckdescription()}
                        </div>
                    </Col>
                </Row>
                {loader}
                {error}
                {showEditConfirmationBox()}
                <Row>
                    {deck}
                </Row>
                {showDeleteConfirmationBox()}
            </Container>
            <Footer/>
        </>
    )
};

function mapStateToProps(state) {
    return {
        username: state.login.username,
        deck: state.decks.deck,
        isLoading: state.decks.isLoading,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        isLoggedIn: () => dispatch(isLoggedIn()),
        getDeck: (deckId) => dispatch(getDeckAction(deckId)),
        importDeck: (deck) => dispatch(importDeckAction(deck)),
        toggleStatus: (deckId, userId) => dispatch(toggleDeckStatus(deckId, userId)),
        deleteDeckFromUser: (deckId) => dispatch(deleteDeckFromUser(deckId)),
        editDeck: (creatorId, _id, deckName, deckDescription) => dispatch(setDeckEditedAction(creatorId, _id, deckName, deckDescription)),

    }
}

export default withRouter(ReactRedux.connect(mapStateToProps, mapDispatchToProps)(UserDecks));
