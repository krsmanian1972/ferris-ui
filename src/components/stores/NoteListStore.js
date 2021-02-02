import { decorate, observable, computed, action } from 'mobx';
import { apiHost } from './APIEndpoints';
import { notesQuery,enrollmentNotesQuery } from './Queries'
import { isBlank } from './Util';

const PENDING = 'pending';
const DONE = 'done';
const ERROR = 'error';

const EMPTY_MESSAGE = { status: "", help: "" };
const ERROR_MESSAGE = { status: "error", help: "Unable to fetch the Notes." };

export default class NoteListStore {

    state = PENDING;
    message = EMPTY_MESSAGE;

    notes = [];
    rowCount = 0;

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

    /**
     * Obtain the List of Notes for the given sessionUserFuzzyId
     *
     */
    load = async (sessionUserId, closingNotes) => {

        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const variables = {
            criteria: {
                sessionUserId: sessionUserId,
            }
        }

        try {
            const response = await this.apiProxy.query(apiHost, notesQuery, variables);
            const data = await response.json();

            if (data.data.getNotes.error != null) {
                this.state = ERROR;
                this.message = ERROR_MESSAGE;
                return;
            }

            const result = data.data.getNotes.notes;
            this.notes = result;
            this.rowCount = result.length;
            this.append(closingNotes);
            this.state = DONE;
        }
        catch (e) {
            this.state = ERROR;
            this.message = ERROR_MESSAGE;
            console.log(e);
        }
    }

    /**
     * When we have a closure notes, esp from the coach, let us treat
     * it as one of her notes.
     */
    append = (closingNotes) => {
        if (closingNotes && !isBlank(closingNotes)) {
            this.rowCount = this.rowCount + 1;
            this.notes.push({ id: "closing", description: closingNotes, remindAt: "" });
        }
    }

    /**
     * To fetch all the notes of a particular Enrollment
     */
    fetchEnrollmentNotes = async (enrollmentId) => {
        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const variables = {
            criteria: {
                enrollmentId:enrollmentId,
            }
        }

        try {
            const response = await this.apiProxy.query(apiHost, enrollmentNotesQuery, variables);
            const data = await response.json();

            if (data.data.getEnrollmentNotes.error != null) {
                this.state = ERROR;
                this.message = ERROR_MESSAGE;
                return;
            }

            const result = data.data.getEnrollmentNotes.notes;
            this.notes = result;
            this.rowCount = result.length;
            this.state = DONE;
        }
        catch (e) {
            this.state = ERROR;
            this.message = ERROR_MESSAGE;
            console.log(e);
        }
    }
}

decorate(NoteListStore, {
    state: observable,
    message: observable,

    notes: observable,
    rowCount: observable,

    isLoading: computed,
    isError: computed,
    isDone: computed,

    load: action,
    append: action,
    fetchEnrollmentNotes:action
});