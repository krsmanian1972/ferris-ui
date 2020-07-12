import { decorate, observable, flow, action } from 'mobx';

import { apiHost } from './APIEndpoints';

const PENDING = 'pending';
const DONE = 'done';
const ERROR = 'error';


export default class NotesStore {

    state = DONE;

    showDrawer = false;
    sessionId = 24;
    sessionFuzzyId="abc-34-123";
    notesId = 0;

    isError = false;
    message = '';
    isDirty = false;

    constructor(props) {
        this.apiProxy = props.apiProxy;
        this.notesListStore = props.notesListStore;
        this.sessionId = props.sessionId;
    }

    /**
     *
     * @param {duration: 1; name: "Rust Actix", programId: "1", shortDesc: "A session on rust with actor model",originalStartDate: } sessionRequest 
     */
    createNotes = async (newNotes) => {
        this.state = PENDING;
        this.isError = false;
        this.message = '';
    }

}

decorate(NotesStore, {
    showDrawer: observable,
    sessionId: observable,
    sessionFuzzyId: observable,
    notesId: observable,
    createNotes: action,
});