import { decorate, observable, computed, action } from 'mobx';
import { apiHost } from './APIEndpoints';
import { notesQuery,enrollmentNotesQuery,sessionUsersQuery } from './Queries'
import { isBlank } from './Util';
import SessionListStore from './SessionListStore'
import SessionStore from './SessionStore'
import { toJS } from 'mobx'
const PENDING = 'pending';
const DONE = 'done';
const ERROR = 'error';
const COACH = "coach";

const EMPTY_MESSAGE = { status: "", help: "" };
const ERROR_MESSAGE = { status: "error", help: "Unable to fetch the Boards." };

export default class JournalBoardListStore {

    state = PENDING;
    message = EMPTY_MESSAGE;

    boards = [];
    rowCount = 0;
    people = [];
    constructor(props) {
        this.apiProxy = props.apiProxy;
        this.sessionListStore = new SessionListStore({ apiProxy: props.apiProxy });
        this.sessionStore = new SessionStore({ apiProxy: props.apiProxy });
        console.log("SessionListStore called");

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

    loadPeople = async (event) => {

        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const variables = {
            criteria: {
                id: event.session.id,
            }
        }

        try {
            const response = await this.apiProxy.query(apiHost, sessionUsersQuery, variables);
            const data = await response.json();

            const users = data.data.getSessionUsers.users;
            var people = {}
            if (users[0].sessionUser.userType === COACH) {
                people = { coach: users[0], member: users[1], event: event }
            }
            else {
                people = { coach: users[1], member: users[0], event: event }
            }
            this.people.push(people);
            this.state = DONE;
        }

        catch (e) {
            //this.state = ERROR;
            //this.message = LOADING_ERROR;
            console.log(e);
        }
    }

    processEvent = async (event, date) => {
         await this.loadPeople(event);

    }
    /**
     * To fetch all the notes of a particular Enrollment
     */
    fetchSessionUserIdList = async (memberId, programId) => {
        this.state = PENDING;
        this.message = EMPTY_MESSAGE;
        await this.sessionListStore.fetchProgramSessions(programId, memberId);
        console.log(this.sessionListStore.rowCount);

        var sessions = (this.sessionListStore.sessions);

        for (let [date, events] of sessions) {
           console.log(toJS(events));
           events.map((event, index) =>
              this.processEvent(event, index)
           );
           // for (let [event, index] of events) {
           //      this.processEvent(event, index);
           // }
        }

    }
}

decorate(JournalBoardListStore, {
    state: observable,
    message: observable,

    boards: observable,
    rowCount: observable,
    people: observable,
    isLoading: computed,
    isError: computed,
    isDone: computed,

    load: action,
    append: action,
    fetchBoards:action
});
