import { decorate, observable, computed, action } from 'mobx';
import moment from 'moment';

import {isBlank} from './Util';

import { apiHost } from './APIEndpoints';
import {createSessionQuery} from './Queries';

const INIT = "init";
const PENDING = 'pending';
const DONE = 'done';
const INVALID = "invalid";
const ERROR = 'error';

const EMPTY_MESSAGE = { status: "", help: "" };
const ERROR_MESSAGE = { status: ERROR, help: "Unable to create session" };

export default class SessionStore {

    state = INIT;
    message = EMPTY_MESSAGE;

    showDrawer = false;
    sessionId = 0;

    startTimeMsg = {};
    programMsg = {};
    memberMsg = {};

    constructor(props) {
        this.apiProxy = props.apiProxy;
        this.sessionListStore = props.sessionListStore;
        this.programListStore = props.programListStore;
        this.enrollmentListStore = props.enrollmentListStore;
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

    get isInvalid() {
        return this.state === INVALID;
    }

    /**
     * Creating a New Session. 
     * Carefull to convert the given time to utc format.
     */
    createSchedule = async (sessionRequest) => {

        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        if (!this.isValid(sessionRequest)) {
            this.state = INVALID;
            return;
        }

        const variables = {
            input: {
                programFuzzyId: sessionRequest.programFuzzyId,
                memberFuzzyId: sessionRequest.memberFuzzyId,
                name: sessionRequest.name,
                description: sessionRequest.description,
                duration: sessionRequest.duration,
                startTime: sessionRequest.startTime.utc().format(),
            }
        }

        try {
            const response = await this.apiProxy.mutate(apiHost, createSessionQuery, variables);
            const data = await response.json();

            if (data.error == true) {
                this.state = ERROR;
                this.message = ERROR_MESSAGE;
                return;
            }
            
            this.showDrawer = false;
            this.session = data;
            this.state = DONE;
            this.sessionListStore.buildRoster();
        }
        catch (e) {
            this.state = ERROR;
            this.message = ERROR_MESSAGE;
            console.log(e);
        }

    }

    isValid = (sessionRequest) => {

        this.programMsg = EMPTY_MESSAGE;
        this.memberMsg = EMPTY_MESSAGE;
    
        if(isBlank(sessionRequest.programFuzzyId)) {
            this.programMsg = {status:ERROR,help:"Please Select a Program"};
        }

        if(isBlank(sessionRequest.memberFuzzyId)) {
            this.memberMsg = {status:ERROR,help:"Please Select an enrolled member"};
        }

        this.validateDate(sessionRequest.startTime);

        return this.programMsg.status !== ERROR && this.memberMsg.status !== ERROR && this.startTimeMsg !== ERROR;
    }

    validateDate = (value) => {

        this.startTimeMsg = EMPTY_MESSAGE;

        const boundary = moment().add(1,'hour');
        const flag = value && value > boundary;

        if(!flag) {
            this.startTimeMsg = {status:ERROR,help:"Provide a time at least one hour after from now."};
        }
    }

}

decorate(SessionStore, {
    state: observable,
    showDrawer: observable,

    startTimeMsg: observable,
    programMsg: observable,
    memberMsg: observable,
    message: observable,

    sessionId: observable,

    isLoading: computed,
    isDone: computed,
    isError: computed,
    isInvalid: computed,

    createSchedule: action,
    validateDate:action,
});