import React, { Component } from "react";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import jwt_decode from "jwt-decode";
import setAuthToken from "./utils/setAuthToken";
import './App.css';

import "bootstrap/dist/css/bootstrap.min.css";
import { setCurrentUser, logoutUser } from "./actions/authActions";
import { Provider } from "react-redux";
import store from "./store";

import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import PrivateRoute from "./components/private-route/PrivateRoute";
import MyBoards from "./components/boards/MyBoards";
import MyTeams from "./components/teams/MyTeams";
import Profile from "./components/profile/Profile"
import CreateTeam from "./components/teams/CreateTeam";
import CreateBoard from "./components/boards/CreateBoard";
import AddTeamMember from "./components/teams/AddTeamMember";
import AddBoardMember from "./components/boards/AddBoardMember";

import { Menu, Dropdown } from 'semantic-ui-react'

// Check for token to keep user logged in
if (localStorage.jwtToken) {
    // Set auth token header auth
    const token = localStorage.jwtToken;
    setAuthToken(token);
    // Decode token and get user info and exp
    const decoded = jwt_decode(token);
    // Set user and isAuthenticated
    store.dispatch(setCurrentUser(decoded));
    // Check for expired token
    const currentTime = Date.now() / 1000; // to get in milliseconds
    if (decoded.exp < currentTime) {
        // Logout user
        store.dispatch(logoutUser());

        // Redirect to login
        window.location.href = "./login";
    }
}

class App extends Component {
    state = {
        isLoggedIn: false
    }

    componentDidMount() {
        if (localStorage.jwtToken) {
            this.setState({ isLoggedIn: true })
        }
    }

    handleItemClick = (e, { name }) => this.setState({ activeItem: name })

    onLogoutClick = e => {
        e.preventDefault();
        this.setState({ isLoggedIn: false })
        store.dispatch(logoutUser());
    };

    render() {
        const { activeItem, isLoggedIn } = this.state
        return (
            <Provider store={store}>
                <Router>
                    <div className="container">
                        {isLoggedIn ? (
                            <Menu inverted>
                                <Menu.Item>
                                    <img src={require('./prello_icon.png')} alt="Prello logo" />
                                </Menu.Item>

                                <Menu.Item
                                    name='boards'
                                    active={activeItem === 'boards'}
                                    onClick={this.handleItemClick}
                                >
                                    <Link to="/:userName/boards" className="nav-link">Boards</Link>
                                </Menu.Item>

                                <Menu.Item
                                    name='teams'
                                    active={activeItem === 'teams'}
                                    onClick={this.handleItemClick}
                                >
                                    <Link to="/:userName/teams" className="nav-link">Teams</Link>
                                </Menu.Item>
                                <Menu.Menu position='right'>
                                    <Dropdown item text='+'>
                                        <Dropdown.Menu className="dropDownMenu">
                                            <Dropdown.Item>
                                                <Link to="/board/create" className="nav-link">Create a board</Link>
                                            </Dropdown.Item>
                                            <Dropdown.Item>
                                                <Link to="/team/create" className="nav-link">Create a team</Link>
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                    <Dropdown item text='Profile'>
                                        <Dropdown.Menu className="dropDownMenu">
                                            <Dropdown.Item>
                                                <Link to="/:userName" className="nav-link">My profile</Link>
                                            </Dropdown.Item>
                                            <Dropdown.Item>
                                                <Link to="/login" className="nav-link" onClick={this.onLogoutClick}>Logout</Link>
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </Menu.Menu>
                            </Menu>
                        ) : (
                                <p></p>
                            )}
                        <br />
                        <Route path="/login" component={Login} />
                        <Route exact path="/register" component={Register} />
                        <Switch>
                            <PrivateRoute exact path="/:userName/boards" component={MyBoards} />
                            <PrivateRoute exact path="/board/create" component={CreateBoard} />
                            <PrivateRoute exact path='/board/:boardId/add' component={AddBoardMember} />
                            <PrivateRoute exact path="/:userName" component={Profile} />
                            <PrivateRoute exact path="/team/create" component={CreateTeam} />
                            <PrivateRoute exact path="/:userName/teams" component={MyTeams} />
                            <PrivateRoute exact path='/team/:teamId/add' component={AddTeamMember} />
                        </Switch>
                    </div>
                </Router>
            </Provider>
        );
    }
}


export default App;