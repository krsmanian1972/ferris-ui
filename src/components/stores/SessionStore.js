import { decorate, observable, flow, action } from 'mobx';

import { apiHost } from './APIEndpoints';

const PENDING = 'pending';
const DONE = 'done';
const ERROR = 'error';

const emptySession = { duration: 0, name: null, programId: 0, shortDesc: null, startTime: null };

export default class SessionStore {

    state = DONE;

    showDrawer = false;
    sessionId = 0;

    isError = false;
    message = '';

    constructor(props) {
        this.apiProxy = props.apiProxy;
        this.sessionListStore = props.sessionListStore;
    }



    /**
     *
     * @param {duration: 1; name: "Rust Actix", programId: "1", shortDesc: "A session on rust with actor model",originalStartDate: } sessionRequest 
     */
    createSchedule = async (sessionRequest) => {

        this.state = PENDING;
        this.isError = false;
        this.message = '';

        const queryString = `mutation($input: NewSessionRequest!) {
            createSession(newSessionRequest:$input) {
              fuzzyId
              name
            } 
        }`

        const variables = {
            input: {
                programId: 1,
                name: "Session on TDD",
                description: "This is the third session description",
                duration: 1,
                startTime: "2020-07-09 15:00:00"
            }
        }

        try {
            const response = await this.apiProxy.mutate(apiHost, queryString, variables);
            const data = await response.json();

            if (data.error == true) {
                this.isError = true;
                this.message = data.detailedErrorMessage;
                this.state = DONE;
                return;
            }
            this.session = data;
            this.state = DONE;
        }
        catch (e) {
            this.state = ERROR;
            console.log(e);
        }

    }

}

decorate(SessionStore, {
    showDrawer: observable,
    sessionId: observable,
    createSchedule: action,
});