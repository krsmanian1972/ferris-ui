import { action, decorate, observable, computed } from 'mobx';
import APIProxy from './APIProxy';

import LoginStore from './LoginStore';
import FeedStore from './FeedStore';

import { isBlank } from './Util';
import socket from './socket';

const blankCredentials = {
    email: '',
    token: '',
    role: '',
    username: '',
    id: '',
}

const INIT = 'init';
const PENDING = 'pending';
const INVALID = 'invalid';
const DONE = 'done';
const ERROR = 'error';

class AppStore {

    state = INIT;

    credentials = blankCredentials;

    currentComponent = null;

    apiProxy = new APIProxy();
    loginStore = new LoginStore({ apiProxy: this.apiProxy });
    feedStore = new FeedStore({apiProxy: this.apiProxy});

    menus = [];

    sessionInfo = null;
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

        this.state = PENDING;

        this.credentials = blankCredentials;

        const result = await this.loginStore.authenticate(values);

        this.state = result.state;

        if (result.state !== DONE) {
            return;
        }
        
        const data = result.data;

        this.credentials.email = data.email;
        this.credentials.token = data.id;
        this.credentials.role = data.userType;
        this.credentials.username = data.name;
        this.credentials.id = data.id;

        this.apiProxy.updateCredentialHeaders(this.credentials);

        this.updateContext();
        this.persistCredentials();
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
            case 'coach':
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
            .emit('init', ({ fuzzyId: this.credentials.id, name: this.credentials.username }));
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

    get hasSessionUserId() {
        return this.sessionInfo && !isBlank(this.sessionInfo.sessionUserId)
    }

    updatePreferredRoute = (featureKey, sessionInfo) => {
        if (featureKey && sessionInfo && this.isLoggedIn()) {
            this.sessionInfo = sessionInfo;
            this.currentComponent = {label:"window", key: featureKey, params:sessionInfo };
        }
    }

    get isCoach() {
        return this.credentials.role==="coach";
    }

    get isMember() {
        return this.credentials.role==="member";
    }

}

decorate(AppStore, {
    state: observable,
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
    isCoach: computed,
    isMember: computed,

    sessionInfo: observable,
    socketToken: observable,
    hasSessionUserId: computed,
    updatePreferredRoute: action,
});

export const appStore = new AppStore();