import { decorate, observable, action } from 'mobx';
import moment from 'moment';
import { apiHost } from './APIEndpoints';
import {createSessionQuery} from './Queries';

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
    startTimeMsg = {};

    constructor(props) {
        this.apiProxy = props.apiProxy;
        this.sessionListStore = props.sessionListStore;
        this.programListStore = props.programListStore;
        this.enrollmentListStore = props.enrollmentListStore;
    }

    /**
     * Creating a New Session.
     */
    createSchedule = async (sessionRequest) => {

        this.state = PENDING;
        this.isError = false;
        this.message = '';

        const variables = {
            input: {
                programFuzzyId: sessionRequest.programFuzzyId,
                memberFuzzyId: sessionRequest.memberFuzzyId,
                name: sessionRequest.name,
                description: sessionRequest.description,
                duration: sessionRequest.duration,
                startTime: sessionRequest.startTime.utc().format(),
            }
        }

        try {
            const response = await this.apiProxy.mutate(apiHost, createSessionQuery, variables);
            const data = await response.json();

            if (data.error == true) {
                this.isError = true;
                this.message = data.detailedErrorMessage;
                this.state = DONE;
                return;
            }
            
            this.session = data;
            this.state = DONE;
            this.showDrawer = false;
            this.sessionListStore.buildRoster();
        }
        catch (e) {
            this.state = ERROR;
            console.log(e);
        }

    }

    validateDate = (value) => {
        this.startTimeMsg = {status:"",help:""};

        const boundary = moment().add(1,'hour');
        const flag = value && value > boundary;

        if(!flag) {
            this.startTimeMsg = {status:"error",help:"Provide a time at least one hour after from now."};
        }
    }

}

decorate(SessionStore, {
    showDrawer: observable,
    startTimeMsg: observable,
    sessionId: observable,
    createSchedule: action,
    validateDate:action,
});