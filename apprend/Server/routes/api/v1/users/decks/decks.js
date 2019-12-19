const express = require('express');
const path = require('path')
const fs = require('fs')
const session = require('express-session');
const mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
require('../../../../../database/models/deck');
require('../../../../../database/models/user');
const User = mongoose.model('User');
const Deck = mongoose.model('Deck');
const Users = require('../../../../../database/models/user');
const decks = express.Router();
// const imagesFolder = 'sep2019-project-kiwi/apprends/Server/files/images'
const imagesFolder = './files/images'
const flashcardsRoute = require('./flashcards/flashcards')
const columnsRoute = require('./columns/columns')

decks.use('/:deckId/', async (req, res, next) => {
    req.deck = await req.user.decks.id(req.params.deckId)
    if (!req.deck) return res.status(404).json({message: 'Deck does not exist'})
    if (req.session.username === req.user._id || req.deck.private === false) return next()
    return res.status(401).json({message: 'This deck is private'})
})

decks.get('/:deckId', async (req, res) => {
    res.status(200).json({data: req.deck})
})

decks.post('/:deckId', async (req, res) => {
    try {
        const username = req.session.username;
        const importToUser = await User.findById(username);
        const newDeck = {...req.deck._doc};
        delete newDeck.games;
        delete newDeck._id;

        if (username) {
            if (importToUser._id === req.user._id) {
                res.status(400).json({message: 'Cant import own deck'})
            } else {
                newDeck.creatorId = importToUser._id
                const result = await importToUser.addDeck(newDeck);
                res.status(201).json({
                    message: 'Deck successfully imported',
                    data: result
                })
            }
        } else {
            req.session.username = req.session.id
            newDeck.creatorId = req.session.id

            const user = {
                _id: req.session.id,
                email: '',
                password: '',
                decks: [newDeck]
            }
            const cookie = req.cookies.username
            if (cookie === undefined) {
                res.cookie('username', req.session.id, {maxAge: (10 * 365 * 24 * 60 * 60 * 1000)})
            }
            const madeUser = await User.create(user)

            res.status(201).json({
                message: 'Deck successfully imported',
                data: madeUser
            })
        }
    } catch (e) {
        console.log(e)
        res.status(500).json('Something went wrong on our end')
    }
})

decks.use('/:deckId/flashcards/', flashcardsRoute)
decks.use('/:deckId/columns/', columnsRoute)

module.exports = decks