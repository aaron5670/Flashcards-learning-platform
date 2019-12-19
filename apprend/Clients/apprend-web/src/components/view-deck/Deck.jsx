import React, {useEffect, useState} from "react";
import * as ReactRedux from "react-redux"
import {NavigatieBar} from "../shared/components/NavigatieBar";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import {Link, useParams} from "react-router-dom";
import {Footer} from "../shared/components/Footer"
import {getDeckAction, getDeckEditAction} from "../shared/actions/actions";
import Card from "react-bootstrap/Card";
import 'loaders.css/src/animations/square-spin.scss'
import Loader from "react-loaders";
import { useHistory } from 'react-router'
import {withRouter} from 'react-router-dom'
import { InputGroup, Button } from 'react-bootstrap'
import {isLoggedIn} from "../shared/actions/actions";
import {importDeckAction} from "../shared/actions/actions";
import PlayButton from "./subcomponents/PlayButton";
import EditButton from "./subcomponents/EditButton";
import ToggleStatusButton from "./subcomponents/ToggleStatusButton";
import DeleteButton from "./subcomponents/DeleteButton";
import ImportButton from "./subcomponents/ImportButton";
import {deleteDeckFromUser, toggleDeckStatus, setDeckEditedAction} from '../shared/actions/actions'
import ConfirmationBox from "./subcomponents/ConfirmationBox";
import { Notification } from '../shared/components/Notification';
import { addTag, clearTags } from '../create-deck/actions';
import { deleteTag } from "../shared/actions/actions";

import FlashcardsOverview from "./subcomponents/OverviewFlashcards";
import { FlashcardTable } from './subcomponents/FlashcardTable'
import DeckDescription from "./subcomponents/DeckDescription";
import DeckName from './subcomponents/DeckName'
import DeckTags from "./subcomponents/DeckTags";
import { LoadingComponent } from "../shared/components/LoadingComponent";

const UserDecks = (props) => {
    const {deckId} = useParams();
    const isCreator = (props.username === props.deck.creatorId);

    const [editName, setEditName] = useState()
    const [editDescription, seteditDescription] = useState()
    const [editState, seteditState] = useState()
    const [deleteStatus, setdeleteStatus] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const history = useHistory()

    //Check if user is logged in
    useEffect(() => {
        props.isLoggedIn()
        props.getDeck(deckId).then(result => setTimeout(() => setIsLoading(false), 1000))
        props.clearTags()
    }, []);

    const checkAdded = (tagValue) => {
        let tags = deckData.oldDeckTags.concat(props.tags)
        return tags.some(tag => {
            return tag === tagValue.trim().toLowerCase();
        });
    }

    const deckData = {
        // deckName: (!deckNameEdited && props.deckEdit.name) ? props.deck.name : deckName,
        // deckDescription: (!deckDescriptionEdited && props.deck.description) ? props.deck.description : deckDescription,
        oldDeckTags: props.deckEdit.tags
    }

    const getTagValue = () => {
        let tagValue = input;
        setInput('');
        let match = false;
        if (props.tags.length !== 0 || deckData.oldDeckTags.length !== 0) {
            if (checkAdded(tagValue)){
                Notification("You already have that tag", "danger");
            } else {
                match = true;
            }
            if (match === true) {
                if (tagValue.trim() !== "") {
                    props.addTag(tagValue);
                    match = false;
                } else {
                    Notification("You can't add an empty tag", "danger");
                }
            }
        } else {
            if (tagValue.trim() !== "") {
                props.addTag(tagValue);
            } else {
                Notification("You can't add an empty tag", "danger");
            }
        }
    }

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

    const showNotification = () => {
        Notification("A deck needs atleast 1 card to play!", "info");
    }

    const deleteDeckHandler = () => {
        props.deleteDeckFromUser(props.deck._id)
        history.push(`/${props.username}/decks`)
    }

    const editDeckHandler = async () => {
        const result = await props.editDeck(props.deck.creatorId, props.deck._id, editName ? editName : props.deck.name, editDescription ? editDescription : props.deck.description, deckData.oldDeckTags, props.tags )
        toggleEditStateHandler()
        props.clearTags()
        Notification(result.message, result.success ? 'success' : 'danger')
    }

    const toggleDeleteStatusHandler = () => {
        setdeleteStatus(!deleteStatus)
    }

    const toggleEditStateHandler = () => {
        if (editState !== true) {
            props.getDecksEdit(deckId)
        }
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
            if (props.deck.flashcards.length > 0) {
                icons.push(<PlayButton func={playDeckHandler}/>)
            } else {
                icons.push(<PlayButton func={showNotification}/>)
            }
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


    const showFlashcards = () => {
        return (
        <Row className="my-5">
            <FlashcardsOverview />
        </Row>
        )
    }

    let loader, deck, error, flashcardsComp;
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

            flashcardsComp = (
                <>
                    {showFlashcards()}
                </>
            )
        }
    }

    const Deckname = () => {
        return <DeckName 
            state={editState}
            deck={props.deck}
            handler={setStateHandler}
            func={setEditName}
                />
    }

    const Deckdescription = () => {
        return <DeckDescription
                    state={editState}
                    deck={props.deck}
                    handler={setStateHandler}
                    func={seteditDescription}
                     />
    }

    const Decktags = () => {
        return <DeckTags 
                    state={editState}
                    deck={props.deck}
                    getTagValue={getTagValue}
                    deleteTag={props.deleteTag}
                    tags={props.tags}
                    />
    }

    const showContent = () => {
        if (isLoading) return <LoadingComponent loadingText="Loading deck for you" />
        return (
            <>
                <Row>
                    <Col lg={{span: 8, offset: 2}}>
                        <div className="mx-auto text-center pt-5">
                            {Deckname()}
                            {Deckdescription()}
                            {Decktags()}
                        </div>
                    </Col>
                </Row>
                {loader}
                {error}
                {showEditConfirmationBox()}
                <Row>
                    {deck}
                </Row>
                {/* <Row> */}
                    <FlashcardTable />
                {/* </Row> */}
                {showDeleteConfirmationBox()}
                {/* {showFlashcards()} */}
                {/* {flashcardsComp} */}
            </>
        )
    }
    return (
        <>
            <NavigatieBar/>
            <Container>
                {showContent()}
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
        tags: state.createDeck.tags,
        deckEdit: state.decks.deckEdit
    }
}

function mapDispatchToProps(dispatch) {
    return {
        isLoggedIn: () => dispatch(isLoggedIn()),
        getDeck: (deckId) => dispatch(getDeckAction(deckId)),
        importDeck: (deck) => dispatch(importDeckAction(deck)),
        toggleStatus: (deckId, userId) => dispatch(toggleDeckStatus(deckId, userId)),
        deleteDeckFromUser: (deckId) => dispatch(deleteDeckFromUser(deckId)),
        editDeck: (creatorId, _id, deckName, deckDescription, oldTags, newTags) => dispatch(setDeckEditedAction(creatorId, _id, deckName, deckDescription, oldTags, newTags)),
        addTag: (tag) => dispatch(addTag(tag)),
        deleteTag: (tag) => dispatch(deleteTag(tag)),
        clearTags: () => dispatch(clearTags()),
        getDecksEdit: (deckId) => dispatch(getDeckEditAction(deckId)),
    }
}

export default withRouter(ReactRedux.connect(mapStateToProps, mapDispatchToProps)(UserDecks));
