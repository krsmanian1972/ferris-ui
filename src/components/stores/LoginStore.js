import { decorate, observable, computed, action } from 'mobx';
import { apiHost } from './APIEndpoints';
import { authenticationQuery,registrationQuery,resetPasswordQuery } from './Queries';

const INIT = "init";
const PENDING = 'pending';
const INVALID = 'invalid';
const DONE = 'done';
const ERROR = 'error';

const EMPTY_MESSAGE = { status: "", help: "" };
const REGISTRATION_ERROR = { status: "error", help: "We are unable to register you at this moment. Please write to us." };
const PASSWORD_RESET_ERROR = { status: "error", help: "We are unable to reset your password. Please write to us." };

export default class LoginStore {

    state = INIT;
    message = EMPTY_MESSAGE;

    constructor(props) {
        this.apiProxy = props.apiProxy
    }

    get isLoading() {
        return this.state === PENDING;
    }

    get isDone() {
        return this.state === DONE;
    }

    get isError() {
        return this.state === ERROR;
    }


    authenticate = async (values) => {

        const variables = {
            request: {
                email: values.email,
                password: values.password
            }
        };

        try {
            const response = await this.apiProxy.query(apiHost, authenticationQuery, variables);
            const result = await response.json();

            if (result.data == null) {
                return { state: INVALID, data: null };
            }
            return { state: DONE, data: result.data.authenticate };
        }
        catch (e) {
            return { state: ERROR, data: null };
        }
    }

    registerUser = async (request) => {
        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const variables = {
            input: {
                fullName: request.fullName,
                email: request.email,
                password: request.password
            }
        };

        try {
            const response = await this.apiProxy.mutate(apiHost, registrationQuery, variables);
            const data = await response.json();

            const result = data.data.createUser;

            if (result.errors && result.errors.length > 0) {
                const reason = result.errors[0].message;

                this.state = ERROR;
                this.message = {status: "error", help:reason};

                return;
            }
            this.state = DONE;
        }
        catch (e) {
            this.state = ERROR;
            this.message = REGISTRATION_ERROR;
        }
    }

    resetPassword = async (request) => {
        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const variables = {
            input: {
                email: request.email,
                password: request.currentPassword,
                newPassword: request.newPassword
            }
        };

        try {
            const response = await this.apiProxy.mutate(apiHost, resetPasswordQuery, variables);
            const data = await response.json();

            const result = data.data.resetPassword;

            if (result.errors && result.errors.length > 0) {
                const reason = result.errors[0].message;

                this.state = ERROR;
                this.message = {status: "error", help:reason};

                return;
            }

            this.state = DONE;
        }
        catch (e) {
            this.state = ERROR;
            this.message = PASSWORD_RESET_ERROR;
        }
    }
}
decorate(LoginStore, {
    state: observable,
    message: observable,
 
    isLoading: computed,
    isDone: computed,
    isError: computed,
 
    authenticate: action,
    registerUser: action,
    resetPassword: action,
})