import { decorate, observable, flow, action } from 'mobx';

import {backendHost} from './APIEndpoints';

const PENDING = 'pending';
const DONE = 'done';
const ERROR = 'error';

emptySession = { duration: 0, name: null, programId: 0, shortDesc: null, startTime: null };

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
     * @param {duration: 1; name: "Rust Actix", programId: "1", shortDesc: "A session on rust with actor model",startTime:} sessionRequest 
     */
    createSchedule = async (sessionRequest) => {
        this.state = PENDING;
        this.isError = false;
        this.message = '';

        {"query":"mutation {
              createUser(registration:{fullName:\"Raja\",email:\"raja@krscode.com\"})
                {fuzzyId    name }
            }",
        }

        try {
            const response = await this.apiProxy.asyncPost(backendHost, { userId: this.copyeditor.userId, ...values });
            const data = await response.json();

            if (data.error == true) {
                this.isError = true;
                this.message = data.detailedErrorMessage;
                this.state = DONE;
                return;
            }

            this.copyeditor = data;

            this.informPeerStores();

            this.isPrimaryDirty = false;
            this.activeTab = '1';
            this.state = DONE;
        }
        catch (e) {
            this.state = ERROR;
        }

    }

}

decorate(SessionStore, {
    showDrawer: observable,
    sessionId: observable,
    createSchedule: action,
});