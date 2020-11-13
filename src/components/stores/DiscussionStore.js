import { decorate, observable, computed, action } from 'mobx';
import socket from '../stores/socket';

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
    ids = new Set();

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

    createSubscription = () => {
        socket.on("feedIn",(data) => this.handleFeed(data.feed));
    }

    classify = (result) => {

        this.ids.clear();

        const userId = this.apiProxy.getUserFuzzyId();

        for(var i=0;i<result.length;i++) {
            var item = result[i];
            
            const localeTime = moment(item.createdAt * 1000);
            const date = localeTime.format(DATE_PATTERN);

            this.ids.add(item.id);

            item.date = date;
            item.by = item.createdById === userId ? "me" : "other";
        }

        this.discussions = result;
    }

    /**
     * Ignore those feeds meant for a different enrollment
     * 
     * Dedupe, by ignoring the message with the same message id.
     * 
     * @param {*} feed 
     */
    handleFeed = (feed) => {
   
        if(feed.enrollmentId !== this.enrollmentId) {
            return;
        }

        this.populate(feed);
    }

    /**
     * Dedupe, by ignoring the message with the same message id.
     * 
     * @param {*} newDiscussion 
     */

    populate = (newDiscussion) => {

        if(this.ids.has(newDiscussion.id)) {
            return;
        }

        this.ids.add(newDiscussion.id);

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
    fetchDiscussions = async(journalContext) => {

        const {enrollmentId,memberId,coachId} = journalContext;

        this.journalContext = journalContext;

        this.enrollmentId = enrollmentId;
        this.memberId = memberId;
        this.coachId = coachId;

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
            this.createSubscription();

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

        const toId = this.apiProxy.getUserFuzzyId()===this.coachId ? this.memberId : this.coachId;

        const variables = {
            input: {
                description: request.description,
                createdById: this.apiProxy.getUserFuzzyId(),
                toId: toId,
                enrollmentId: this.journalContext.enrollmentId,
                programId: this.journalContext.programId,
                programName: this.journalContext.programName,
                coachId: this.journalContext.coachId,
                coachName: this.journalContext.coachName,
                memberId: this.journalContext.memberId,
                memberName: this.journalContext.memberName,
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

            const feedOut = {to:toId,feed:result};
            socket.emit("sendTo",feedOut);
            
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