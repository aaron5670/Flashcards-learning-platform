import React, {useState} from "react";
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Autosuggest from 'react-autosuggest';
import {Link} from "react-router-dom";
import {getSearchSuggestions, setSearchValue} from "../actions/actions";
import Col from "react-bootstrap/Col";
import InputGroup from "react-bootstrap/InputGroup";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSearch} from "@fortawesome/free-solid-svg-icons";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import {useHistory} from "react-router-dom";

const SearchInput = (props) => {
    const [value, setValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    let lastRequestId = null;

    // https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions#Using_Special_Characters
    function escapeRegexCharacters(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function getSuggestionValue(suggestion) {
        return suggestion.name;
    }

    function renderSuggestion(suggestion) {
        if (suggestion.type === "deck") return (
            <Link to={`/decks/${suggestion._id}`} className={'search-deck-suggestions-link'}>
                    <span>
                        <span>{suggestion.name}</span>
                        <span className={'float-right'}><i>{suggestion.flashcards} flashcards</i></span>
                    </span>
            </Link>
        );
        if (suggestion.type === "user") return (
            <Link to={`/${suggestion.name}/decks`} className={'search-deck-suggestions-link w-100'}>
                    <span>
                        {suggestion.name}
                    </span>
            </Link>
        );
        // if (suggestion.type === "tag") return (
        //     <Link to={`/tags/${suggestion.name}`} className={'search-deck-suggestions-link w-100'}>
        //             <span>
        //                 {suggestion.name}
        //             </span>
        //     </Link>
        // );
    }

    function renderSectionTitle(section) {
        return (
            <b style={{fontWeight: 600, marginLeft: 5}}>{section.title}</b>
        );
    }

    function getSectionSuggestions(section) {
        return section.results;
    }

    const onChange = (event, {newValue, method}) => {
        setValue(newValue);
        props.setSearchValue(newValue)
    };

    const onSuggestionsFetchRequested = ({value}) => {
        // console.log('onSuggestionsFetchRequested');
        loadSuggestions(value);
    };

    const loadSuggestions = (value) => {
        // Cancel the previous request
        if (lastRequestId !== null) clearTimeout(lastRequestId);

        props.getSearchSuggestions(value, true)
            .then((data) => {
                return data.filter(section => section.results.length > 0);
            })
            .then((results) => {
                setSuggestions(results)
            })
    };

    const onSuggestionsClearRequested = () => {
        setSuggestions([])
    };

    let history = useHistory()
    const onSubmit = (e) => {
        e.preventDefault();
        history.push(props.linkTo)
    };

    const inputProps = {
        placeholder: "Search for something...",
        value,
        onChange: onChange,
        className: 'form-control',
        style: {width: '100%'}
    };

    const searchButton = () => {
        if (!props.navBar) {
            return (
                <div className={props.navBar ? 'pl-30' : 'col-lg-2 col-md-2 col-2'}>
                    <InputGroup.Append>
                        <Link to={props.linkTo}>
                            <Button className={'bg-blue text-white hover-shadow'}>
                                <FontAwesomeIcon icon={faSearch}
                                                 className={'trash-icon'}
                                                 size={'1x'}
                                                 title={`Search`}
                                />
                                <span className={'ml-1'}>Search</span>
                            </Button>
                        </Link>
                    </InputGroup.Append>
                </div>
            )
        }
    }

    return (
        <>
            <Form onSubmit={(e) => onSubmit(e)} id={'auto-suggest-search-deck'}
                  className={props.navBar ? 'extra-class-navbar' : ''}>
                <div className={props.navBar ? '' : 'row'}>
                    <div className={props.navBar ? '' : 'col-md-10 offset-md-1'}>
                        <Row>
                            <div className={props.navBar ? 'w-70' : 'col-lg-6 col-md-8 col-8 offset-lg-2 offset-md-1'}>
                                {/*<Col xs={{span: 8}} md={{span: 8, offset: 1}} lg={{span: 6, offset: 2}}>*/}
                                <InputGroup className={`mb-3`}>
                                    <Autosuggest
                                        multiSection={true}
                                        suggestions={suggestions}
                                        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                                        onSuggestionsClearRequested={onSuggestionsClearRequested}
                                        getSuggestionValue={getSuggestionValue}
                                        renderSuggestion={renderSuggestion}
                                        renderSectionTitle={renderSectionTitle}
                                        getSectionSuggestions={getSectionSuggestions}
                                        inputProps={inputProps}/>
                                </InputGroup>
                                {/*</Col>*/}
                            </div>
                            {searchButton()}
                        </Row>
                    </div>
                </div>
            </Form>
        </>
    );
};

SearchInput.propTypes = {
    linkTo: PropTypes.string.isRequired,
};

const mapStateToProps = state => {
    return {
        searchValue: state.search.searchValue,
        searchSuggestions: state.search.searchSuggestions
    }
};

const mapDispatchToProps = dispatch => {
    return {
        setSearchValue: (searchValue) => dispatch(setSearchValue(searchValue)),
        getSearchSuggestions: (searchValue, autoSuggest) => dispatch(getSearchSuggestions(searchValue, autoSuggest)),
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchInput);
