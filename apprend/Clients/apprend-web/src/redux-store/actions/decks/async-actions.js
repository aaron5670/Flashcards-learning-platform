import {API_URL} from '../../urls'
import {setDeckAction, setIsLoading, setUserDecksAction, setUserDecksDecksAction, setDeckEditAction, setSpecificDeckDataAction} from "./actions";

export const getUserDecksAction = (username, skipLoader = false) => {
    return async dispatch => {
        if (!skipLoader) await dispatch(setIsLoading(true))
        const url = `${API_URL}/users/${username}/decks`;
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            mode: 'cors'
        };
        const response = await fetch(url, options);
        const data = await response.json();
        if (data.success) {
            if (skipLoader) setUserDecksAction(data.decks)
            else {
                setTimeout(function () {
                    dispatch(setUserDecksAction(data.decks));
                    dispatch(setIsLoading(false))
                }, 1000);
            }
        }else {
            if (skipLoader) dispatch(setUserDecksAction('no-decks'));
            else {
                setTimeout(function () {
                    dispatch(setUserDecksAction('no-decks'));
                    dispatch(setIsLoading(false))
                }, 1000);
            }
        }
    }
};

export const getDeckAction = (deckId) => {
    return async dispatch => {
        await dispatch(setIsLoading(true));
        const url = `${API_URL}/decks/${deckId}`;
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            mode: 'cors'
        };
        const response = await fetch(url, options);
        const data = await response.json();
        if (response.status === 200) {
            dispatch(setDeckAction(data));

            setTimeout(function () {
                dispatch(setIsLoading(false))
            }, 500);
        } else {
            setTimeout(function () {
                dispatch(setDeckAction('deck-not-found'));
                dispatch(setIsLoading(false))
            }, 500);
        }
    }
};

export const deleteDeckFromUser = (deckId) => {
    return async dispatch => {
        const url = `${API_URL}/decks/${deckId}`
        const response = await fetch(url, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        if (response.status === 200) {
            const data = await response.json()
            dispatch(setUserDecksDecksAction(data))
        }
    }
}
export const getDeckEditAction = (deckId) => {
    return async dispatch => {
        const url = `${API_URL}/decks/${deckId}`;
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            mode: 'cors'
        };
        const response = await fetch(url, options)
        if (response.status === 200) {
            const data = await response.json();
            dispatch(setDeckEditAction(data))
            return data
        }
    }
}

export const setDeckEditedAction = (creatorId, deckId, deckName, deckDescription, oldTags, newTags) => {
    let tags = oldTags
    if (newTags && newTags.length > 0) tags = oldTags.concat(newTags)
    return async dispatch => {
        const url = `${API_URL}/decks/${deckId}`;
        let body = {
            name: deckName,
            description: deckDescription,
            creatorId: creatorId,
            tags: tags
        };
        const options = {
            method: 'PUT',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            mode: 'cors'
        };
        const response = await fetch(url, options);
        const data = await response.json();
        if (response.status === 201) {
            dispatch(setSpecificDeckDataAction(data))
            dispatch(setDeckAction(data))
        }
    }
}

export const toggleDeckStatus = (deckId, userId) => {
    return async dispatch => {
        const url = `${API_URL}/users/${userId}/decks/${deckId}`
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            mode: 'cors'
        })

        if (response.status === 201){
            const data = await response.json()
            dispatch(setSpecificDeckDataAction(data))
            dispatch(setDeckAction(data))
        }
    }
}

export const importDeckAction = deckId => {
    return async dispatch => {
        const url = `${API_URL}/decks/${deckId}`;
        const options = {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'cors'
        }
        const response = await fetch(url, options);
        const data = await response.json();
        if (response.status === 201) {
            return data
        }
    }
}