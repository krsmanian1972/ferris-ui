import { decorate, observable, computed, action } from 'mobx';

import moment from 'moment';

import { apiHost } from './APIEndpoints';
import { createDiscussionQuery, getDiscussionsQuery} from './Queries';

const INIT = "init";
const PENDING = 'pending';
const DONE = 'done';
const ERROR = 'error';

const EMPTY_MESSAGE = { status: "", help: "" };
const ERROR_MESSAGE = { status: ERROR, help: "We are very sorry, the service is unavailable at this moment. Please try again after some time." };
const DATE_PATTERN = 'DD-MMM-YYYY';

export default class DiscussionStore {

    state = INIT;
    message = EMPTY_MESSAGE;

    discussions = [];

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

    classify = (result) => {

        const userId = this.apiProxy.getUserFuzzyId();

        for(var i=0;i<result.length;i++) {
            var item = result[i];
            
            const localeTime = moment(item.createdAt * 1000);
            const date = localeTime.format(DATE_PATTERN);

            item.date = date;
            item.by = item.createdById === userId ? "me" : "other";
        }

        this.discussions = result;
    }

    populate = (newDiscussion) => {

        const userId = this.apiProxy.getUserFuzzyId();
            
        const localeTime = moment(newDiscussion.createdAt * 1000);
        const date = localeTime.format(DATE_PATTERN);

        newDiscussion.date = date;
        newDiscussion.by = newDiscussion.createdById === userId ? "me" : "other";

        this.discussions.push(newDiscussion);
    }

    /**
     * We need to refetch the list of discusssions whenever the
     * user selects the discussion button.
     * 
     * Hence capture the enrollmentId
     * 
     * @param {*} id 
     */
    fetchDiscussions = async(enrollmentId) => {

        this.enrollmentId = enrollmentId;

        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const variables = {
            criteria: {
                enrollmentId: enrollmentId
            }
        }

        try {
            const response = await this.apiProxy.query(apiHost, getDiscussionsQuery, variables);
            const data = await response.json();
            const result = data.data.getDiscussions.discussions;
            this.classify(result);
            this.state = DONE;
        }
        catch (e) {
            this.state = ERROR;
            this.message = ERROR_MESSAGE;
        }
    }
    
    deliverMessage = async (request) => {

        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const variables = {
            input: {
                description: request.description,
                enrollmentId: this.enrollmentId,
                createdById: this.apiProxy.getUserFuzzyId(),
            }
        }

        try {
            const response = await this.apiProxy.mutate(apiHost, createDiscussionQuery, variables);
            const data = await response.json();

            if (data.error == true) {
                this.state = ERROR;
                this.message = ERROR_MESSAGE;
                return;
            }

            const result = data.data.createDiscussion.discussion;

            this.populate(result);
            this.state = DONE;
        }
        catch (e) {
            this.state = ERROR;
            this.message = ERROR_MESSAGE;
            console.log(e);
        }
    }
}

decorate(DiscussionStore, {
    state: observable,
    message: observable,

    discussions: observable,

    isLoading: computed,
    isDone: computed,
    isError: computed,

    fetchDiscussions: action,
    deliverMessage: action,
});