import { decorate, observable, action } from 'mobx';


export default class NotesListStore {

    sessionId = null;
    list = null;

    constructor(props) {
        this.apiProxy = props.apiProxy;
        this.sessionId = props.sessionId;
    }

    /**
     * To be replaced with an API call
     * 
     */
    getNotes = () => {
        return require("./test_data/session_notes.test.json");
    }

    buildList = async () => {
       
    }
}

decorate(NotesListStore, {
    list:observable,
    buildList:action,
});
