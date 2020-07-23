import { action, decorate, observable, computed } from 'mobx';
import APIProxy from './APIProxy';
import LoginStore from './LoginStore';
import { isBlank } from './Util';
import socket from './socket';

const blankCredentials = {
    email: '',
    token: '',
    role: '',
    username: '',
    userFuzzyId: '',
}

const INIT = 'init';
const PENDING = 'pending';
const INVALID = 'invalid';
const DONE = 'done';
const ERROR = 'error';

const IN_PROGRESS_MESSAGE = 'Authenticating...';
const SUCCESS = 'Authentication is successful.';
const INVALID_CREDENTIAL = 'Invalid Login Information';

class AppStore {

    state = INIT;
    validationMessage = '';

    credentials = blankCredentials;

    currentComponent = null;

    apiProxy = new APIProxy();
    loginStore = new LoginStore({ apiProxy: this.apiProxy });
    menus = [];

    isEditable = true;

    sessionId = null;
    socketToken = null;

    constructor() {
        this.setSessionFromStorage();
    }

    get isLoading() {
        return this.state === PENDING;
    }

    get isError() {
        return this.state === ERROR;
    }

    get isInvalid() {
        return this.state === INVALID;
    }

    setSessionFromStorage = () => {
        const storedCredentials = localStorage.getItem('credentials');

        if (storedCredentials !== null) {
            this.credentials = JSON.parse(storedCredentials);
            this.updateContext();
        }
        else {
            this.credentials = blankCredentials;
            this.updateContext();
        }
    }


    authenticate = async (values) => {

        this.notifyProgress();

        this.credentials = blankCredentials;

        const data = await this.loginStore.authenticate(values);

        if (data == null || data.token == null) {
            this.notifyError(INVALID_CREDENTIAL);
            return;
        }

        this.credentials.email = data.email;
        this.credentials.token = data.token;
        this.credentials.role = data.role;
        this.credentials.username = data.username;
        this.credentials.userFuzzyId = data.fuzzyId;

        this.apiProxy.updateCredentialHeaders(this.credentials);

        this.updateContext();
        this.persistCredentials();
        this.notifySuccess();
    }

    notifyError = (errorMessage) => {
        this.state = ERROR;
        this.isEditable = true;
        this.validationMessage = errorMessage;
    }

    notifyProgress = () => {
        this.state = PENDING;
        this.isEditable = false;
        this.validationMessage = IN_PROGRESS_MESSAGE;
    }

    notifySuccess = () => {
        this.state = DONE;
        this.isEditable = false;
        this.validationMessage = SUCCESS;
    }


    persistCredentials = () => {
        localStorage.setItem('credentials', JSON.stringify(this.credentials));
    }

    updateContext = () => {
        this.apiProxy.updateCredentialHeaders(this.credentials);
        this.registerSocket();
        this.resolveMenu();
        this.resolveLandingPage();
    }

    resolveMenu() {
        if (!this.isLoggedIn()) {
            this.menus = require('./menus/GuestMenu.json');
            return;
        }

        switch (this.credentials.role) {
            case 'guide':
                {
                    this.menus = require('./menus/GuideMenu.json');
                    break;
                }
            default:
                {
                    this.menus = require('./menus/DefaultRoleMenu.json');
                }
        }
    }

    resolveLandingPage() {
        this.menus.map((menu, key) => {
            if (menu.isLandingPage) {
                this.transitionTo(menu.key);
                return;
            }
        })
    }

    registerSocket = () => {
        if (!this.isLoggedIn()) {
            return;
        }

        socket
            .on('token', ({ id }) => {
                this.socketToken = id;
            })
            .emit('init', ({ fuzzyId: this.credentials.userFuzzyId, name:this.credentials.username}));
    }

    navigateTo(index) {
        const menu = this.menus[index];
        this.currentComponent = menu;
    }

    transitionTo(componentkeyName) {
        this.menus.map((menu) => { (menu.key === componentkeyName) && (this.currentComponent = menu) });
    }

    isLoggedIn = () => {
        return !(isBlank(this.credentials.email) || isBlank(this.credentials.token))
    }

    logout = () => {
        localStorage.setItem('credentials', JSON.stringify(blankCredentials));
        window.location.reload();
    }

    setProxy = (apiProxy) => {
        this.apiProxy = apiProxy;
    }

    get hasSessionId() {
        return !isBlank(this.sessionId)
    }

    updatePreferredRoute = (featureKey, sessionId) => {
        if (featureKey && sessionId && this.isLoggedIn()) {
            this.sessionId = sessionId;
            this.currentComponent = { "label": "window", "key": featureKey };
        }
    }

}

decorate(AppStore, {
    state: observable,
    validationMessage: observable,
    isEditable: observable,
    menus: observable,

    currentComponent: observable,

    credentials: observable,
    setCredentials: action,
    logout: action,

    authenticate: action,
    transitionTo: action,
    navigateTo: action,

    isLoading: computed,
    isError: computed,
    isInvalid: computed,

    sessionId: observable,
    socketToken: observable,
    hasSessionId: computed,
    updatePreferredRoute: action,
});

export const appStore = new AppStore();