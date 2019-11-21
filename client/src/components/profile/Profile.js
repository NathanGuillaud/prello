import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import classnames from "classnames";
import { updateUser, fetchUser } from "../../actions/userActions";

class Profile extends Component {
  constructor() {
    super();
    this.state = {
      firstName: "",
      lastName: "",
      userName: "",
      email: "",
      errors: {}
    };
  }


  componentDidMount() {

    this.props.fetchUser(this.props.auth.user._id);

  }


  static getDerivedStateFromProps(nextProps, prevState){
    if(nextProps.user !==prevState.user){
      return { someState: nextProps.user};
    }
    if(nextProps.errors !==prevState.errors){
      return { someState: nextProps.errors};
    }
    else return null;
  }

  componentDidUpdate(prevProps, prevState) {
    if(prevProps.user!==this.props.user){
      //Perform some operation here
      this.setState({
        firstName: this.props.user.firstName,
        lastName: this.props.user.lastName,
        userName: this.props.user.userName,
        email: this.props.user.email,
      });
    }

    if (prevProps.errors !== prevState.errors) {
      this.setState({
        errors: this.props.errors
      });
    }
  }

  onChange = e => {
    this.setState({ [e.target.id]: e.target.value });
  };

  onSubmit = e => {
    e.preventDefault();

    const updatedUser = {
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      userName: this.state.userName,
      email: this.state.email
    };

    this.props.updateUser(this.props.user.userName, updatedUser, this.props.history);
  };

  render() {
    const { errors } = this.state;

    return (
      <div className="container">
        <div className="row">
          <div className="col s8 offset-s2">
            <Link to="/" className="btn-flat waves-effect">
              <i className="material-icons left">keyboard_backspace</i> Back to
              home
            </Link>
            <div className="col s12" style={{ paddingLeft: "11.250px" }}>
              <h4>
                <b>Manage your profile</b>
              </h4>
            </div>
            <form noValidate onSubmit={this.onSubmit}>

            <div className="input-field col s12">
                <input
                  onChange={this.onChange}
                  value={this.state.firstName}
                  error={errors.firstName}
                  id="firstName"
                  type="text"
                  className={classnames("", {
                    invalid: errors.firstName
                  })}
                />
                <label htmlFor="firstName">First Name</label>
                <span className="red-text">{errors.firstName}</span>
              </div>
              
              <div className="input-field col s12">
                <input
                  onChange={this.onChange}
                  value={this.state.lastName}
                  error={errors.lastName}
                  id="lastName"
                  type="text"
                  className={classnames("", {
                    invalid: errors.lastName
                  })}
                />
                <label htmlFor="lastName">Last Name</label>
                <span className="red-text">{errors.lastName}</span>
              </div>
              
              <div className="input-field col s12">
                <input
                  onChange={this.onChange}
                  value={this.state.userName}
                  error={errors.userName}
                  id="userName"
                  type="text"
                  className={classnames("", {
                    invalid: errors.userName
                  })}
                />
                <label htmlFor="userName">User Name</label>
                <span className="red-text">{errors.userName}</span>
              </div>

              <div className="input-field col s12">
                <input
                  onChange={this.onChange}
                  value={this.state.email}
                  error={errors.email}
                  id="email"
                  type="email"
                  className={classnames("", {
                    invalid: errors.email
                  })}
                />
                <label htmlFor="email">Email</label>
                <span className="red-text">{errors.email}</span>
              </div>
              
              <div className="col s12" style={{ paddingLeft: "11.250px" }}>
                <button
                  style={{
                    width: "150px",
                    borderRadius: "3px",
                    letterSpacing: "1.5px",
                    marginTop: "1rem"
                  }}
                  type="submit"
                  className="btn btn-large waves-effect waves-light hoverable blue accent-3"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

Profile.propTypes = {
  updateUser: PropTypes.func.isRequired,
  fetchUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors,
  user: state.user
});

export default connect(
  mapStateToProps,
  { updateUser, fetchUser }
)(withRouter(Profile));