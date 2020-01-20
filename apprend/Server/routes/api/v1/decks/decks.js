const express = require('express');
const decks = express.Router();
const mongoose = require('mongoose');
require('../../../../database/models/deck');
const Decks = mongoose.model('Deck');
const UserSchema = require('../../../../database/models/user');
require('../../../../database/models/user');
const User = mongoose.model('User');

decks.get('/tags', async (req, res) => {
    try {
        const searchQuery = req.query.tag;
        let foundDecks;
        let decks = [];

        if (searchQuery) {
            foundDecks = await User.aggregate([{
                $facet: {
                    foundTags: [
                        {$unwind: "$decks"},
                        {
                            $match: {
                                $or: [{"decks.private": false}, {"decks.creatorId": req.session.username}],
                                'decks.tags': searchQuery
                            }
                        },
                        {$project: {"decks": "$decks"}}
                    ],
                }
            }]);
        } else {
            return res.status(400).json({message: 'No query'})
        }

        foundDecks[0].foundTags.forEach(deck => {
            decks.push(deck);
        })
        if (decks.length > 0) {
            return res.status(200).json({
                message: 'All decks',
                data: decks
            })
        } else {
            return res.status(400).json({
                message: 'No decks found'
            })
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: 'Something went horribly wrong'})
    }
});

/*====================================
| SEARCH FOR SOME DECKS & USERS
*/
decks.get('/', async (req, res) => {
    const searchQuery = req.query.deck;
    const autoSuggest = req.query.autosuggest;
    if (!searchQuery) return res.status(400);

    let searchResult = await User.aggregate([
        {
            $facet: {
                foundUsers: [
                    {$match: {'_id': {'$regex': searchQuery, '$options': 'i'}}},
                    {
                        $project: {
                            "_id": "$_id",
                            "type": "user",
                            "email": "$email",
                            "signupDate": "$signupDate",
                            "decks": "$decks",
                        }
                    }
                ],
                foundDecks: [
                    {$unwind: "$decks"},
                    {$match: {'decks.name': {'$regex': searchQuery, '$options': 'i'}, "decks.private": false}},
                    {
                        $project: {
                            "type": "deck",
                            "deck._id": "$decks._id",
                            "deck.name": "$decks.name",
                            "deck.description": "$decks.description",
                            "deck.tags": "$decks.tags",
                            "deck.creatorId": "$decks.creatorId",
                            "deck.flashcards": "$decks.flashcards",
                        }
                    }
                ]
            }
        }
    ]);

    let finalResults = [
        {
            title: 'Users',
            results: []
        },
        {
            title: 'Decks',
            results: []
        }
    ];

    for (let key in searchResult[0]) {
        if (searchResult[0].hasOwnProperty(key)) {
            searchResult[0][key].forEach(result => {
                if (result.type === 'user' && result.email) finalResults[0].results.push({
                    name: result._id,
                    type: result.type,
                    signupDate: result.signupDate,
                    decks: result.decks.length
                });
                if (result.type === 'deck') finalResults[1].results.push({
                    ...result.deck,
                    type: result.type
                });
            })
        }
    }

    // Change flashcards to total flashcards number
    finalResults[1].results.map((decks, key) => {
        finalResults[1].results[key].flashcards = finalResults[1].results[key].flashcards.length;
        return finalResults;
    });

    // Sort decks on total flashcards
    finalResults[1].results.sort((a, b) => parseFloat(b.flashcards) - parseFloat(a.flashcards));

    // Filter results for AutoSuggest
    if (autoSuggest === 'true') {
        if (finalResults[0].results.length > 3) finalResults[0].results.splice(3, finalResults[0].results.length - 3);
        if (finalResults[1].results.length > 3) finalResults[1].results.splice(3, finalResults[1].results.length - 3);
    }

    await res.json({
        message: 'Search results',
        results: finalResults,
    })
});

/*====================================
| GET ALL DECKS FOR HOMEPAGE FROM USERS
*/
decks.get('/home', async (req, res) => {
    try {

        let allDecks
        if (req.session.username) {
            allDecks = await User.aggregate([
                {$unwind: "$decks"},
                {$match: {$and: [{'email': {$ne: ''}}, {'decks.private': false}, {'decks.creatorId': {$ne: req.session.username}}]}},
                {
                    $group: {
                        _id: null,
                        decks: {
                            $push: "$decks"
                        }
                    }
                }
            ])
        } else {
            allDecks = await User.aggregate([
                {$unwind: "$decks"},
                {$match: {$and: [{'email': {$ne: ''}}, {'decks.private': false}]}},
                {
                    $group: {
                        _id: null,
                        decks: {
                            $push: "$decks"
                        }
                    }
                }
            ])
        }

        if (!allDecks[0]) return res.status(404).json('cant find any public deck')
        let decks = []
        if (allDecks[0].decks.length < 3) {
            decks = allDecks[0].decks.map(deck => {
                return deck
            })
        } else {
            const amountOfDecks = 3
            const indexPicked = []
            let infCounter = 0
            for (let i = 0; i < amountOfDecks; i++) {
                const randomIndex = Math.floor(Math.random() * allDecks[0].decks.length)
                if (indexPicked.includes(randomIndex)) {
                    i--
                    infCounter++
                    if (infCounter > 500) break;
                } else {
                    indexPicked.push(randomIndex)
                    decks.push(allDecks[0].decks[randomIndex])
                }
            }
        }
        res.status(200).json(decks)
    } catch (e) {
        console.log(e)
        res.status(500).json('Er gaat iets goed fout')
    }

});

decks.post('/', async (req, res) => {
    try {
        if (!req.body.deckName || req.body.deckName.trim().length === 0) return res.status(400).json({message: 'Failed to provide a deck name'})
        if (req.body.deckName.length > 50) return res.status(400).json({message: 'Deckname is too long, max 50 chars.'})
        let response;
        if (!req.session.username && !req.cookies.username) {
            req.session.username = req.session.id
            const deck = {
                name: req.body.deckName ? req.body.deckName : 'My awesome deck',
                description: req.body.description ? req.body.description : 'Awesome description',
                creatorId: req.session.id,
                status: 'original',
                tags: req.body.tags,
                flashcards: [],
                private: req.body.private,
                columns: req.body.columns ? req.body.columns : [{type: 'Text', name: ''}]
            }
            const user = {
                _id: req.session.id,
                email: '',
                password: '',
                decks: [deck]
            }
            const cookie = req.cookies.username
            if (cookie === undefined) {
                res.cookie('username', req.session.id, {maxAge: (10 * 365 * 24 * 60 * 60 * 1000)})
            }
            response = await User.create(user)
        } else {
            const player = await User.findById(req.session.username ? req.session.username : req.cookies.username)
            const deck = {
                name: req.body.deckName ? req.body.deckName : 'My awesome deck',
                description: req.body.description ? req.body.description : 'Awesome description',
                private: req.body.private,
                creatorId: req.session.username ? req.session.username : req.cookies.username,
                status: 'original',
                tags: req.body.tags,
                flashcards: [],
                columns: req.body.columns
            }
            if (player) response = await player.addDeck(deck)
            else {
                res.status(401).json({message: 'Not a user'})
                return
            }
        }
        res.status(201).json({message: 'You succesfully created a deck', data: response})

    } catch (e) {
        console.log(e)
        res.status(500).json({message: 'Something went horribly wrong...Try again?'})
    }
});

/*====================================
| GET A SPECIFIC DECK
*/
decks.get('/:deckId', async (req, res) => {
    try {
        const deckId = req.params.deckId;

        if (!deckId) {
            return res.status(404).json({message: 'Cant work without a deck id'})
        }
        const userAndDeck = await User.findOne({
            'decks': {
                $elemMatch: {
                    '_id': deckId
                }
            }
        }, {
            'decks': {
                $elemMatch: {
                    '_id': deckId
                }
            }
        })
        if (!userAndDeck) return res.status(404).json({message: 'Does not exist'})
        if (!userAndDeck.decks) return res.status(404).json({message: 'Does not exist'})

        if (userAndDeck.decks[0].private) {
            if (req.session.username !== userAndDeck._id) return res.status(401).json({message: 'User has made this deck private'})
        }

        return res.status(200).json({message: 'Found a deck', data: userAndDeck.decks[0]})
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: 'oopsie'})
    }

});

/*====================================
| GET ALL FLASHCARDS FROM A DECK
*/
decks.get('/:deckId/flashcards', async (req, res) => {
    const users = await User.find({});
    const deckId = req.params.deckId;

    let currentDeck;
    users.forEach((user, userKey) => {
        users[userKey].decks.forEach((deck, deckKey) => {
            if (deck._id == deckId) {
                currentDeck = deck;
            }
        });
    });

    if (currentDeck) {
        await res.json({
            success: true,
            deckId: currentDeck._id,
            name: currentDeck.name,
            creatorId: currentDeck.creatorId,
            flashcards: currentDeck.flashcards,
            session: currentDeck.session
        })
    } else {
        await res.json({
            success: false,
        })
    }
});

/*====================================
| EDIT FLASHCARDS OF A DECK
*/
decks.post('/:deckId/flashcards', async (req, res) => {
    const {flashcards} = req.body;
    const {deckId} = req.params;
    let username;

    if (req.body.test === true) {
        username = "Joris";
    } else {
        username = req.session.username ? req.session.username : req.cookies.username;
        if (!username) return res.status(401).json('Not a user');
    }

    let user = await User.findOne({_id: username});

    if (!user) {
        console.log('User bestaat niet')
    }

    let newFlashcards = [];
    flashcards.forEach(function (flashcard, key) {
        newFlashcards.push({
            _id: flashcard.id,
            type: "Text only",
            question: flashcard.term,
            answer: flashcard.definition,
            sessionPlayed: flashcard.sessionPlayed,
            box: flashcard.box
        })
    });

    let currentDeck, deckFound;
    user.decks.forEach(function (deck, key) {
        if (deck._id == deckId) {
            currentDeck = key;
            deckFound = true;
        }
    });

    if (deckFound) {
        user.decks[currentDeck].flashcards = newFlashcards;

        return user.save(async function (err) {
            if (err) return console.error(err);
            return await res.json({
                success: true,
                deck: user.decks[currentDeck]
            })
        })
    } else {
        return await res.json({
            success: false,
            error: 'Deck doesn\'t exist'
        })
    }
});

module.exports = decks
