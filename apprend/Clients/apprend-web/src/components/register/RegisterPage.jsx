import React, {useState} from 'react';
import {connect} from 'react-redux';
import {Button, Col, Container, Form, FormControl, FormGroup, FormLabel, FormText, Row} from 'react-bootstrap';
import {checkEmailExists, registerNewUser} from '../../redux-store/actions/register/async-actions';
import {PageTitle} from '../shared/PageTitle';
import {NavigatieBar} from '../shared/navbar/NavigatieBar';
import {Footer} from '../shared/footer/Footer';
import {checkUsernameExists} from '../../redux-store/actions/register/async-actions';

export const RegisterPageComponent = props => {
    const [username, setUsername] = useState();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [repeatPassword, setRepeatPassword] = useState();

    const formMaySubmit = () => {
        return usernameValid(username) &&
            emailValid(email) &&
            passwordValid(password) &&
            repeatPasswordValid(password, repeatPassword);
    };

    const handleSubmit = event => {
        event.preventDefault();
        props.doRegisterNewUser(username, email, password);
    };

    return (
        <>
            <NavigatieBar/>
            <Container>
                <Row>
                    <Col xs={{'span': 6, 'offset': 3}}>
                        <PageTitle title={'Register a new user'}/>
                        {(props.error !== null) ?
                            <p className={'bg-danger text-white text-center rounded p-2'}>{props.error}</p> : ''}
                        <Form>
                            <FormGroup>
                                <FormLabel column={false}>Username</FormLabel>
                                <FormControl placeholder={'e.g. johndoe'}
                                             type={'text'}
                                             id={'registerUsernameInput'}
                                             onChange={(event) => setUsername(event.target.value)}
                                             onBlur={() => props.doCheckUsernameExists(username)}
                                             isValid={usernameValid(username)}
                                             isInvalid={props.usernameExists}
                                             required/>
                                {(props.usernameExists) ? <FormText className="text-muted">
                                    '{username}' is already in use!
                                </FormText> : ''}
                            </FormGroup>
                            <FormGroup>
                                <FormLabel column={false}>E-mail</FormLabel>
                                <FormControl placeholder={'e.g. johndoe@foo.com'}
                                             type={'email'}
                                             id={'registerEmailInput'}
                                             onChange={(event) => setEmail(event.target.value)}
                                             onBlur={() => props.doCheckEmailExists(email)}
                                             isValid={emailValid(email)}
                                             isInvalid={props.emailExists}
                                             required/>
                                {(props.emailExists) ? <FormText className="text-muted">
                                    '{email}' is already in use!
                                </FormText> : ''}
                            </FormGroup>
                            <FormGroup>
                                <FormLabel column={false}>Password</FormLabel>
                                <FormControl placeholder={'...'}
                                             type={'password'}
                                             id={'registerPasswordInput'}
                                             onChange={(event) => setPassword(event.target.value)}
                                             isValid={passwordValid(password)}
                                             required/>
                            </FormGroup>
                            <FormGroup>
                                <FormLabel column={false}>Repeat password</FormLabel>
                                <FormControl placeholder={'...'}
                                             type={'password'}
                                             id={'registerRepeatPasswordInput'}
                                             onChange={(event) => setRepeatPassword(event.target.value)}
                                             isValid={repeatPasswordValid(password, repeatPassword)}
                                             required/>
                            </FormGroup>
                            {(formMaySubmit()) ?
                                <Button className={'mx-auto'}
                                        variant={'primary'}
                                        type={'submit'}
                                        id={'registerSubmitButton'}
                                        onClick={(event) => handleSubmit(event)}>Register</Button> :
                                <Button className={'mx-auto'}
                                        variant={'primary'}
                                        type={'submit'}
                                        id={'registerSubmitButton'}
                                        disabled
                                        onClick={(event) => handleSubmit(event)}>Register</Button>}
                        </Form>
                    </Col>
                </Row>
            </Container>
            <Footer/>
        </>
    )
};

export const usernameValid = username => {
    const REGEX_USERNAME = /[^A-Za-z0-9]+/g;
    return username && !username.match(REGEX_USERNAME);
};

export const emailValid = email => {
    return email && email.includes('@') && email.includes('.');
};

export const passwordValid = password => {
    return !!password;
};

export const repeatPasswordValid = (password, repeatPassword) => {
    return repeatPassword && password && password === repeatPassword;
};

const mapStateToProps = state => {
    return {
        'newUserRegistered': state.register.newUserRegistered,
        'usernameExists': state.register.usernameExists,
        'emailExists': state.register.emailExists,
        'isLoading': state.register.isLoading,
        'error': state.register.error
    }
};

const mapDispatchToProps = dispatch => {
    return {
        'doRegisterNewUser': (username, email, password) => dispatch(registerNewUser(username, email, password)),
        'doCheckUsernameExists': username => dispatch(checkUsernameExists(username)),
        'doCheckEmailExists': email => dispatch(checkEmailExists(email))
    }
};

export const RegisterPage = connect(mapStateToProps, mapDispatchToProps)(RegisterPageComponent);