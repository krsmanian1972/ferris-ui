import { decorate, observable, computed, action } from 'mobx';
import { apiHost, assetHost } from './APIEndpoints';
import socket from './socket';

import { findUserQuery} from './Queries';

const PENDING = 'pending';
const DONE = 'done';
const ERROR = 'error';

const EMPTY_MESSAGE = { status: "", help: "" };
const ERROR_MESSAGE = { status: ERROR, help: "Please check if you have provided a valid link to access the profile." };

const ABOUT_FILE = "about.html";
const EXPERIENCE_FILE = "experience.html";

export default class ProfileStore {

    state = PENDING;
    message = EMPTY_MESSAGE;
    change = null;

    user = null;
    about = null;
    experience = null;

    constructor(props) {
        this.apiProxy = props.apiProxy;
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

    fetchUserDetails = async (givenUserId) => {

        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        this.user = null;
        this.about = null;
        this.experience = null;

        const variables = {
            criteria: {
                id: givenUserId,
            }
        }

        try {
            const response = await this.apiProxy.query(apiHost, findUserQuery, variables);
            const data = await response.json();

            if (data.data.getUser === undefined) {
                this.state = ERROR;
                this.message = ERROR_MESSAGE;
                return;
            }

            const result = data.data.getUser;

            this.user = result;

            await this.loadContent(ABOUT_FILE);
            await this.loadContent(EXPERIENCE_FILE);

            this.state = DONE;
        }
        catch (e) {
            this.state = ERROR;
            this.message = ERROR_MESSAGE;
            console.log(e);
        }
    }

    loadContent = async (fileName) => {

        if (!this.user) {
            return;
        }

        const ver = new Date().getTime();

        const url = `${assetHost}/users/${this.user.id}/${fileName}?nocache=${ver}`;

        const response = await this.apiProxy.getAsync(url);
        if (response.status === 404) {
            return;
        }

        if (fileName === ABOUT_FILE) {
            this.about = await response.text();
        }

        if (fileName === EXPERIENCE_FILE) {
            this.experience = await response.text();
        }
    }

    saveAbout = () => {
        socket.emit('userContent', {
            content: this.about,
            fuzzyId: this.user.id,
            name: ABOUT_FILE
        });
    }

    saveExperience = () => {
        socket.emit('userContent', {
            content: this.experience,
            fuzzyId: this.user.id,
            name: EXPERIENCE_FILE
        });
    }
}

decorate(ProfileStore, {
    state: observable,
    message: observable,
    change: observable,

    user: observable,
    about: observable,
    experience: observable,

    isLoading: computed,
    isDone: computed,
    isError: computed,

    fetchUserDetails: action,
    saveAbout: action,
    saveExperience: action,
});
