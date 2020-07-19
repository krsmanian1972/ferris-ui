import { decorate, observable, action } from 'mobx';

import { apiHost } from './APIEndpoints';
import { createNotesQuery } from './Queries';

export default class NotesListStore {

    sessionId = null;
    list = null;

    constructor(props) {
        this.apiProxy = props.apiProxy;
        
    }

    /**
     * To be replaced with an API call
     * 
     */
    fetchNotes = () => {
        

        return require("./test_data/session_notes.test.json");
    }

    buildList = async () => {
       
    }
}

decorate(NotesListStore, {
    list:observable,
    buildList:action,
});
