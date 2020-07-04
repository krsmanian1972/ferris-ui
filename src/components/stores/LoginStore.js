import { decorate, observable } from 'mobx';
import { loginUrl } from './APIEndpoints';
import { isBlank } from './Util';

const temp_coach_credentials = {
    email: "gopal@pm-powerconsulting.com",
    token: "111",
    role: "guide",
    username: "Gopal",
    fuzzyId: "1-1"
};

const temp_member_credentials = {
    email: "raja@krscode.com",
    token: "999",
    role: "member",
    username: "Raja",
    fuzzyId: "9-9"
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
            return temp_member_credentials;
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