import { decorate, observable} from 'mobx';
import { loginUrl } from './APIEndpoints';
import {isBlank} from './Util';

const temp_credentials = {
    email: "gopal@krscode.com",
    token:"123",
    role:"guide",
    username: "Gopal",
    fuzzyId:"1-1"
};

export default class LoginStore {
    loginCredentials = {
        email: '',
        password: '',
        client_name: 'krscode'
    }

    constructor(props) {
        this.apiProxy = props.apiProxy
        this.appStore = props.appStore
    }

    authenticate = async() => {
        return temp_credentials;
    }

    actual_authenticate = async () => {
        if(this.isEmptyCredentials())
        {
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