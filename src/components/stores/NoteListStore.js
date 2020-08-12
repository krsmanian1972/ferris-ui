import { decorate, observable, computed,action } from 'mobx';

import {notesQuery} from './Queries'

const PENDING = 'pending';
const DONE = 'done';
const ERROR = 'error';

const EMPTY_MESSAGE = { status: "", help: "" };
const ERROR_MESSAGE = { status: "error", help: "Unable to fetch the Notes." };

export default class NoteListStore {

    state = PENDING;
    message = EMPTY_MESSAGE;

    notes = [];
    rowCount=0;
 
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
     * Obtain the List of Boards for the given sessionUserFuzzyId
     *
     */
    load = async(sessionUserId) => {
        
        this.state  = PENDING;
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
            this.state = DONE;
        }
        catch (e) {
            this.state = ERROR;
            this.message = ERROR_MESSAGE;
            console.log(e);
        }
    
    }

}

decorate(NoteListStore,{
    state:observable,
    message: observable,

    notes:observable,
    rowCount:observable,

    isLoading:computed,
    isError:computed,
    isDone:computed,
    
    load:action,
});