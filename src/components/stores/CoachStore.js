import { decorate, observable, computed, action } from 'mobx';
import { apiHost, assetHost } from './APIEndpoints';
import socket from './socket';

import { findUserQuery} from './Queries';

const PENDING = 'pending';
const DONE = 'done';
const ERROR = 'error';

const EMPTY_MESSAGE = { status: "", help: "" };
const ERROR_MESSAGE = { status: ERROR, help: "Please check if you have provided a valid link to access the profile of the coach." };

const ABOUT_FILE = "about.html";
const EXPERIENCE_FILE = "experience.html";

export default class CoachStore {

    state = PENDING;
    message = EMPTY_MESSAGE;
    change = null;

    coach = null;
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

    fetchCoachDetails = async (givenCoachId) => {

        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        this.coach = null;
        this.about = null;
        this.experience = null;

        const variables = {
            criteria: {
                id: givenCoachId,
            }
        }

        try {
            const response = await this.apiProxy.query(apiHost, findUserQuery, variables);
            const data = await response.json();

            if (data.data.getUser == undefined) {
                this.state = ERROR;
                this.message = ERROR_MESSAGE;
                return;
            }

            const result = data.data.getUser;

            this.coach = result;

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

        if (!this.coach) {
            return;
        }

        const ver = new Date().getTime();

        const url = `${assetHost}/mentors/${this.coach.id}/${fileName}?nocache=${ver}`;

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
        socket.emit('coachContent', {
            content: this.about,
            fuzzyId: this.coach.id,
            name: ABOUT_FILE
        });
    }

    saveExperience = () => {
        socket.emit('coachContent', {
            content: this.experience,
            fuzzyId: this.coach.id,
            name: EXPERIENCE_FILE
        });
    }
}

decorate(CoachStore, {
    state: observable,
    message: observable,
    change: observable,

    coach: observable,
    about: observable,
    experience: observable,

    isLoading: computed,
    isDone: computed,
    isError: computed,

    fetchCoachDetails: action,
    saveAbout: action,
    saveExperience: action,
});
