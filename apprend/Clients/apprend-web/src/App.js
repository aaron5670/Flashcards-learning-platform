import React from 'react';
import './App.css';
import {Switch, Route} from 'react-router-dom'
// import {Homepage} from "./components/home/Homepage";

function App() {
    return (
        <div>
            <Switch>
                <Route exact path={"/"}>
                    {/*<Homepage/>*/}
                </Route>
            </Switch>
        </div>
    );
}

export default App;
