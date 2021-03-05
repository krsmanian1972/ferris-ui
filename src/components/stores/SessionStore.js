import { decorate, observable, computed, action } from 'mobx';
import moment from 'moment';

import { isBlank } from './Util';

import { apiHost } from './APIEndpoints';
import { createSessionQuery, alterSessionStateQuery, sessionUsersQuery, findSessionQuery, createConferenceQuery, manageConferencePeopleQuery } from './Queries';

import Janus from '../conference/Janus.js';

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

const MONO = "mono";

// eslint-disable-next-line
const MULTI = "multi";

const ALLOWED_MINUTES = new Set([0, 15, 30, 45]);

export default class SessionStore {

    state = INIT;
    message = EMPTY_MESSAGE;

    showDrawer = false;
    showClosureDrawer = false;
    showInvitationDrawer = false;

    sessionType = MONO;

    startTimeMsg = {};
    startTime = null;

    durationMsg = {};
    duration = 0;

    programMsg = {};
    memberMsg = {};

    event = {};
    people = {};
    change = null;
    pollStatus = null;


    targetState = "";

    constructor(props) {
        this.apiProxy = props.apiProxy;
        this.sessionListStore = props.sessionListStore;
        this.programListStore = props.programListStore;
        this.enrollmentListStore = props.enrollmentListStore;

        Janus.init({ debug: "all", callback: this.gatewayCallback });
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
     * Creating a Conference Session with a single member 
     * who is nothing but the coach using the
     * self enrollment id. 
     * Remember to convert the given time to utc format.
     */
    createConference = async (sessionRequest) => {

        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        if (!this.isValidConference(sessionRequest)) {
            this.state = INVALID;
            return;
        }

        const variables = {
            input: {
                programId: sessionRequest.programId,
                name: sessionRequest.name,
                description: sessionRequest.description,
                duration: this.duration,
                startTime: sessionRequest.startTime.utc().format(),
            }
        }

        try {
            const response = await this.apiProxy.mutate(apiHost, createConferenceQuery, variables);
            const data = await response.json();

            if (data.error === true) {
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
                duration: this.duration,
                startTime: sessionRequest.startTime.utc().format(),
            }
        }

        try {
            const response = await this.apiProxy.mutate(apiHost, createSessionQuery, variables);
            const data = await response.json();

            if (data.error === true) {
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

    isValidConference = (sessionRequest) => {

        this.programMsg = EMPTY_MESSAGE;

        if (isBlank(sessionRequest.programId)) {
            this.programMsg = { status: ERROR, help: "Please Select a Program" };
        }

        this.validateDate(sessionRequest.startTime);
        this.validateDuration(sessionRequest.duration);

        return this.programMsg.status !== ERROR
            && this.startTimeMsg.status !== ERROR
            && this.durationMsg.status !== ERROR;
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
        this.validateDuration(sessionRequest.duration);

        return this.programMsg.status !== ERROR
            && this.memberMsg.status !== ERROR
            && this.startTimeMsg.status !== ERROR
            && this.durationMsg.status !== ERROR;
    }

    validateDate = (start) => {

        this.startTime = start;
        this.startTimeMsg = EMPTY_MESSAGE;

        if (!start) {
            this.startTimeMsg = { status: ERROR, help: "Please provide a start time for the session." };
            return;
        }

        const minutes = start.minutes();
        if (!ALLOWED_MINUTES.has(minutes)) {
            this.startTimeMsg = { status: ERROR, help: "Please select the minutes as one of 00,15,30 or 45." };
            return;
        }

        const boundary = moment().add(15, 'minute');
        const flag = start && start > boundary;
        if (!flag) {
            this.startTimeMsg = { status: ERROR, help: "Select a start time that is at least 15 minutes from now." };
            return;
        }
    }

    validateDuration = (value) => {
        this.duration = 0;
        this.durationMsg = EMPTY_MESSAGE;

        if (!value) {
            this.durationMsg = { status: ERROR, help: "Select the duration for this session." };
            return;
        }

        const hours = value.hours();
        const minutes = value.minutes();

        if (hours + minutes === 0) {
            this.durationMsg = { status: ERROR, help: "The minimum duration of a session is 15 minutes." };
            return;
        }

        this.duration = (hours * 60) + minutes;
    }

    setSelectedEvent = (selectedEvent) => {
        if (selectedEvent && selectedEvent.session) {
            this.event = selectedEvent;
            this.sessionType = selectedEvent.session.sessionType;
        }
    }

    /**
     * Since Conference is likely to have more than one member other than the coach
     * let classify the pople into two buckets. The Coach, The Members.
     * 
     */
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

            if (this.event.session.sessionType === MONO) {
                this.setSessionPeople(users);
            }
            else {
                this.setConferencePeople(users);
            }

            this.state = DONE;
        }

        catch (e) {
            this.state = ERROR;
            this.message = LOADING_ERROR;
            console.log(e);
        }
    }

    setSessionPeople = (users) => {

        if (users && users.length === 2) {
            if (users[0].sessionUser.userType === COACH) {
                this.people = { coach: users[0], member: users[1] }
            }
            else {
                this.people = { coach: users[1], member: users[0] }
            }
        }
    }

    setConferencePeople = (users) => {

        if (!users) {
            return;
        }

        this.people = { coach: null, members: [] };

        for (var i = 0; i < users.length; i++) {
            if (users[i].sessionUser.userType === COACH) {
                this.people.coach = users[i];
            }
            else {
                this.people.members.push(users[i]);
            }
        }
    }

    get endTime() {
        if (this.duration && this.duration > 0 && this.startTime) {
            return moment(this.startTime).add(this.duration, 'minutes');
        }
        return null;
    }

    /**
     * It is possible for us to get an event through the 
     * enrolled members of a coach. We expect the event object to have
     * the coachId during such usecases.
     * Refer EnrollmentUI.
     */
    get isCoach() {
        if (this.event && this.event.coachId && this.event.coachId === this.apiProxy.getUserFuzzyId()) {
            return true;
        }
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

    get canAlterPeople() {
        return this.isCoach 
            && this.event.session 
            && !this.event.session.isClosed;
    }

    get broadcastHelp() {

        if (this.event && this.event.session && (this.event.session.status === PLANNED || this.event.session.status === OVERDUE)) {
            if (this.isCoach) {
                return COACH_LAUNCH_HELP;
            }
            return ACTOR_LAUNCH_HELP;
        }

        return "";
    }


    updateSessionProgress = async () => {
        if (!this.isCoach) {
            return;
        }
        if (this.event.session.status === READY) {
            await this.alterSessionState(START);
        }
    }

    alterSessionState = async (givenState) => {

        const variables = {
            input: {
                id: this.event.session.id,
                targetState: givenState
            }
        };

        await this.doAlterSessionState(variables);
    }

    performClosure = async (request) => {

        const variables = {
            input: {
                id: this.event.session.id,
                targetState: this.targetState,
                closingNotes: request.closingNotes
            }
        };

        await this.doAlterSessionState(variables);
    }

    doAlterSessionState = async (variables) => {

        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

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
            this.showClosureDrawer = false;
            this.state = DONE;
        }
        catch (e) {
            this.state = ERROR;
            this.message = ERROR_MESSAGE;
            console.log(e);
        }
    }

    addConferenceMember = async (request) => {

        const variables = {
            input: {
                conferenceId: this.event.session.conferenceId,
                memberIds: [request.memberId],
                intention: 'ADD'
            }
        }

        await this.manageConferencePeople(variables);
    }

    removeConferenceMember = async (memberId) => {

        const variables = {
            input: {
                conferenceId: this.event.session.conferenceId,
                memberIds: [memberId],
                intention: 'REMOVE'
            }
        }

        await this.manageConferencePeople(variables);
    }

    manageConferencePeople = async (variables) => {
        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        try {
            const response = await this.apiProxy.mutate(apiHost, manageConferencePeopleQuery, variables);
            const data = await response.json();
            const result = data.data.manageConference;

            if (result.errors != null && result.errors.length > 0) {
                const help = result.errors[0].message;
                this.message = { status: ERROR, help: help }
                this.state = ERROR;
                return;
            }

            await this.loadPeople();
            this.change = result.rows.length;
            this.showInvitationDrawer = false;
            this.state = DONE;
        }
        catch (e) {
            this.state = ERROR;
            this.message = ERROR_MESSAGE;
            console.log(e);
        }
    }

    getSessionStatus = async () => {

        const sessionId = this.event.session.id;

        const variables = {
            criteria: {
                id: sessionId,
            }
        };

        try {
            const response = await this.apiProxy.query(apiHost, findSessionQuery, variables);
            const result = await response.json();

            if (result.data === null) {
                return { status: null };

            }
            return { status: result.data.getSession.status };
        }
        catch (e) {
            return { status: null };
        }
    }

    startPolling = async () => {

        if (!this.shouldRefresh()) {
            return;
        }

        const result = await this.getSessionStatus();
        if (!result.status) {
            return;
        }

        if (this.event.session.status !== result.status) {
            this.event.session.status = result.status;
            this.pollStatus = result.status;
        }

        setTimeout(() => this.startPolling(), 5000);
    }

    shouldRefresh = () => {
        return this.event.session
            && !this.isCoach
            && !this.event.session.isClosed
            && (this.event.session.status === PLANNED || this.event.session.status === OVERDUE)
    }

}

decorate(SessionStore, {
    state: observable,
    sessionType: observable,

    showDrawer: observable,
    showClosureDrawer: observable,
    showInvitationDrawer: observable,

    startTime: observable,
    startTimeMsg: observable,

    duration: observable,
    durationMsg: observable,

    programMsg: observable,
    memberMsg: observable,
    message: observable,

    event: observable,
    people: observable,
    change: observable,

    targetState: observable,

    isLoading: computed,
    isDone: computed,
    isError: computed,
    isInvalid: computed,
    isCoach: computed,

    endTime: computed,

    canMakeReady: computed,
    canCancelEvent: computed,
    canBroadcast: computed,
    canCompleteEvent: computed,
    canAlterPeople: computed,

    broadcastHelp: computed,

    setSelectedEvent: action,
    loadPeople: action,
    createSchedule: action,
    validateDate: action,
    validateDuration: action,
    alterSessionState: action,
    updateSessionProgress: action,
    performClosure: action,
    doAlterSessionState: action,

    pollStatus: observable,
    startPolling: action,
    shouldRefresh: action,
    getSessionStatus: action,
    addConferenceMember: action,
    removeConferenceMember: action,
    createConference: action,
});