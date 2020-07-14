import { decorate, observable } from 'mobx';
import { loginUrl } from './APIEndpoints';
import { isBlank } from './Util';

const temp_coach_credentials = {
    email: "gopal@pm-powerconsulting.com",
    token: "111",
    role: "guide",
    username: "Gopal",
    fuzzyId: "54c6a93e-0253-4d08-9125-eec9488a8f1e"
};

const temp_raja_credentials = {
    email: "raja@krscode.com",
    token: "242",
    role: "member",
    username: "Raja",
    fuzzyId: "7d5dbe5e-edfc-4d92-8dc7-3df44f4be6be"
};

const temp_harini_credentials = {
    email: "harini@krscode.com",
    token: "249",
    role: "member",
    username: "Harini",
    fuzzyId: "e7bf3a72-a1b6-4ade-9cd7-65ac9da587dd"
};

const temp_skandha_credentials = {
    email: "skandha@krscode.com",
    token: "999",
    role: "member",
    username: "Skandha",
    fuzzyId: "cdcfebf1-92b9-4fdf-b4bf-1d5aa68aa953"
};

export default class LoginStore {
    loginCredentials = {
        email: '',
        password: '',
        client_name: 'ferris_ui'
    }

    constructor(props) {
        this.apiProxy = props.apiProxy
        this.appStore = props.appStore
    }

    authenticate = async () => {
        if (this.isEmptyCredentials()) {
            return null;
        }

        if (this.loginCredentials.email.toLowerCase() === 'gopal@pm-powerconsulting.com') {
            return temp_coach_credentials;
        }

        if (this.loginCredentials.email.toLowerCase() === 'raja@krscode.com') {
            return temp_raja_credentials;
        }
        if (this.loginCredentials.email.toLowerCase() === 'harini@krscode.com') {
            return temp_harini_credentials;
        }
        if (this.loginCredentials.email.toLowerCase() === 'skandha@krscode.com') {
            return temp_skandha_credentials;
        }
        return null;
    }

    actual_authenticate = async () => {
        if (this.isEmptyCredentials()) {
            return null;
        }

        try {
            const response = await this.apiProxy.asyncPost(loginUrl, this.loginCredentials);
            const data = await response.json();
            return data;
        }
        catch (e) {
            console.log(e);
            return null;
        }
    }

    isEmptyCredentials = () => {
        return isBlank(this.loginCredentials.email) || isBlank(this.loginCredentials.password)
    }
}

decorate(LoginStore, {
    loginCredentials: observable,
})