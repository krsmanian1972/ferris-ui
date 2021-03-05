import { decorate, observable, computed, action } from 'mobx';
import moment from 'moment';

import { apiHost } from './APIEndpoints';
import { createNotesQuery } from './Queries';

const INIT = 'init';
const PENDING = 'pending';
const DONE = 'done';
const INVALID = "invalid";
const ERROR = 'error';

const EMPTY_MESSAGE = { status: "", help: "" };
const ERROR_MESSAGE = { status: ERROR, help: "Unable to create session" };

export default class NotesStore {

    state = INIT;
    showDrawer = false;

    message = EMPTY_MESSAGE;

    constructor(props) {
        this.apiProxy = props.apiProxy;
        this.noteListStore = props.noteListStore;
        this.sessionUserId = props.sessionUserId;
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

    asUTC = (value) => {
        if (value === undefined) {
            return null;
        }
        return value.utc().format();
    }

    /**
     * Careful about situations where file that was not loaded was ignored by the
     * user to delete
     * @param {*} upload 
     */
    asFiles = (upload) => {
        const files = [];
        if(!upload) {
            return files;
        }

        for(let item of upload) {

            if (item.response === undefined) {
                continue;
            }

            const filepath = item.response.length > 0 ? item.response[0] : 'untraceable';

            const metadata = {
                path: filepath,
                name: item.name,
                type: item.type,
                size: item.size
            };

            files.push(metadata);
        }
        return files;
    }

    validDate = (newNotes) => {
        const remindAt = newNotes.remindAt;
        if (remindAt === undefined) {
            return true;
        }

        const boundary = moment();
        return remindAt && remindAt >= boundary;
    }

    validFiles = (newNotes) => {
        const upload = newNotes.upload;

        if (upload === undefined) {
            return true;
        }

        for (var i = 0; i < upload.length; i++) {
            if (upload[i].response === undefined) {
                return false;
            }
        }

        return true;
    }

    validate = (newNotes) => {

        var help = "";

        if (!this.validDate(newNotes)) {
            help = "Please provide a future date for the reminder. ";
            this.state = INVALID;
        }

        if (!this.validFiles(newNotes)) {
            help = help.concat("Please remove the file(s) that are not successfully uploaded.");
            this.state = INVALID;
        }

        this.message = { status: INVALID, help: help };
    }

    createNotes = async (newNotes) => {

        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        this.validate(newNotes);

        if (this.state === INVALID) {
            return;
        }

        const remindAt = this.asUTC(newNotes.remindAt);
        const files = this.asFiles(newNotes.upload);

        const variables = {
            input: {
                sessionUserId: this.sessionUserId,
                description: newNotes.description,
                remindAt: remindAt,
                files: files,
            }
        }

        try {
            const response = await this.apiProxy.mutate(apiHost, createNotesQuery, variables);
            const data = await response.json();

            if (data.error === true) {
                this.state = ERROR;
                this.message = ERROR_MESSAGE;
                return;
            }

            this.noteListStore.load(this.sessionUserId,null);
            
            this.showDrawer = false;
            this.state = DONE;
        }
        catch (e) {
            this.state = ERROR;
            this.message = ERROR_MESSAGE;
            console.log(e);
        }
    }

}

decorate(NotesStore, {
    state: observable,
    showDrawer: observable,
    sessionUserId: observable,
    message: observable,

    isLoading: computed,
    isDone: computed,
    isError: computed,
    isInvalid: computed,

    createNotes: action,
});