import { decorate, observable, computed, action } from 'mobx';

import { apiHost } from './APIEndpoints';
import {createNotesQuery} from './Queries';

const INIT = 'init';
const PENDING = 'pending';
const DONE = 'done';
const ERROR = 'error';

const EMPTY_MESSAGE = { status: "", help: "" };
const ERROR_MESSAGE = { status: ERROR, help: "Unable to create session" };

export default class NotesStore {

    state = INIT;

    showDrawer = false;
    fuzzyId='';

    message = '';

    constructor(props) {
        this.apiProxy = props.apiProxy;
        this.notesListStore = props.notesListStore;
        this.sessionUserFuzzyId = props.sessionUserFuzzyId;
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

    asUTC = (value) => {
        if(value == undefined) {
            return null;
        }
        return value.utc().format();
    }

    asFiles = (upload) => {
        const files = [];
        upload && upload.map(item=> {
            const metadata = {path:'asset',name:item.name,type:item.type,size:item.size};
            files.push(metadata);
        })
        return files;
    }

    createNotes = async (newNotes) => {

        console.log(newNotes);

        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const remindAt = this.asUTC(newNotes.remindAt);
        const files = this.asFiles(newNotes.upload);
        
        const variables = {
            input: {
                sessionUserFuzzyId: this.sessionUserFuzzyId,
                description: newNotes.description,
                remindAt: remindAt,
                files:files,
            }
        }

        try {
            const response = await this.apiProxy.mutate(apiHost, createNotesQuery, variables);
            const data = await response.json();

            if (data.error == true) {
                this.state = ERROR;
                this.message = ERROR_MESSAGE;
                return;
            }
            
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
    sessionUserFuzzyId: observable,
    message: observable,

    isLoading: computed,
    isDone: computed,
    isError: computed,

    createNotes: action,
});