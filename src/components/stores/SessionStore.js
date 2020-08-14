import { decorate, observable, computed, action } from 'mobx';
import moment from 'moment';

import { isBlank } from './Util';

import { apiHost } from './APIEndpoints';
import { createSessionQuery, alterSessionStateQuery, sessionUsersQuery } from './Queries';

const INIT = "init";
const PENDING = 'pending';
const DONE = 'done';
const INVALID = "invalid";
const ERROR = 'error';

const EMPTY_MESSAGE = { status: "", help: "" };
const ERROR_MESSAGE = { status: ERROR, help: "We are very sorry, the service is unavailable at this moment. Please try again after some time." };
const LOADING_ERROR = { status: "error", help: "Unable to load the people." };
const COACH_LAUNCH_HELP = "You may activate this session, as Ready, 5 minutes ahead of the starting time.";
const ACTOR_LAUNCH_HELP = "Waiting for the coach to activate this session as Ready.";

const READY = "READY";
const OVERDUE = "OVERDUE";
const PLANNED = "PLANNED";
const PROGRESS = "PROGRESS";
const START = "START";

const COACH = "coach";

export default class SessionStore {

    state = INIT;
    message = EMPTY_MESSAGE;

    showDrawer = false;

    startTimeMsg = {};
    programMsg = {};
    memberMsg = {};

    event = {};
    people = {};
    change = null;

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
     * Remember to convert the given time to utc format.
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
                programId: sessionRequest.programId,
                memberId: sessionRequest.memberId,
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

        if (isBlank(sessionRequest.programId)) {
            this.programMsg = { status: ERROR, help: "Please Select a Program" };
        }

        if (isBlank(sessionRequest.memberId)) {
            this.memberMsg = { status: ERROR, help: "Please Select an enrolled member" };
        }

        this.validateDate(sessionRequest.startTime);

        return this.programMsg.status !== ERROR && this.memberMsg.status !== ERROR && this.startTimeMsg !== ERROR;
    }

    validateDate = (value) => {

        this.startTimeMsg = EMPTY_MESSAGE;

        const boundary = moment().add(1, 'hour');
        const flag = value && value > boundary;

        if (!flag) {
            this.startTimeMsg = { status: ERROR, help: "Provide a time at least one hour after from now." };
        }
    }

    loadPeople = async () => {

        const sessionId = this.event.session.id;

        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const variables = {
            criteria: {
                id: sessionId,
            }
        }

        try {
            const response = await this.apiProxy.query(apiHost, sessionUsersQuery, variables);
            const data = await response.json();

            const users = data.data.getSessionUsers.users;

            if (users[0].sessionUser.userType===COACH) {
                this.people = {coach:users[0],member:users[1]}
            }
            else {
                this.people = {coach:users[1],member:users[0]}
            }
 
            this.state = DONE;
        }

        catch (e) {
            this.state = ERROR;
            this.message = LOADING_ERROR;
            console.log(e);
        }
    }

    get isCoach() {
        return this.event && this.event.sessionUser && this.event.sessionUser.userType === COACH;
    }

    get canMakeReady() {
        return this.isCoach
            && this.event.session
            && !this.event.session.isClosed
            && (this.event.session.status === PLANNED || this.event.session.status === OVERDUE)

    }

    get canCancelEvent() {
        return this.isCoach
            && this.event.session
            && !this.event.session.isClosed

    }

    get canCompleteEvent() {
        return this.isCoach
            && this.event.session
            && this.event.session.status === PROGRESS
    }

    get canBroadcast() {
        return this.event.session
            && !this.event.session.isClosed
            && (this.event.session.status === READY || this.event.session.status === PROGRESS)
    }

    get broadcastHelp() {

        if (this.event && this.event.session && (this.event.session.status === PLANNED || this.event.session.status === OVERDUE)) {
            if(this.isCoach) {
                return COACH_LAUNCH_HELP;
            }
            return ACTOR_LAUNCH_HELP;
        }

        return "";
    }

    updateSessionProgress = async() => {
        if(!this.isCoach) {
            return;
        }
        if(this.event.session.status === READY) {
            await this.alterSessionState(START);
        }
    }

    alterSessionState = async (targetState) => {

        const sessionId = this.event.session.id;
        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const variables = {
            input: {
                id: sessionId,
                targetState: targetState
            }
        }

        try {
            const response = await this.apiProxy.mutate(apiHost, alterSessionStateQuery, variables);
            const data = await response.json();
            const result = data.data.alterSessionState;

            if (result.errors != null && result.errors.length > 0) {
                const help = result.errors[0].message;
                this.message = { status: ERROR, help: help }
                this.state = ERROR;
                return;
            }

            this.event.session = result.session;
            this.change = result.session.status;
            this.state = DONE;
        }
        catch (e) {
            this.state = ERROR;
            this.message = ERROR_MESSAGE;
            console.log(e);
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

    event: observable,
    people: observable,
    change: observable,

    isLoading: computed,
    isDone: computed,
    isError: computed,
    isInvalid: computed,
    isCoach: computed,

    canMakeReady: computed,
    canCancelEvent: computed,
    canBroadcast: computed,
    canCompleteEvent:computed,

    broadcastHelp: computed,

    createSchedule: action,
    validateDate: action,
    alterSessionState: action,
    updateSessionProgress: action,
});