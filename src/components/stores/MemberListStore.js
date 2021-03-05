import { decorate, observable, computed,action } from 'mobx';

import { apiHost } from './APIEndpoints';
import {coachMembersQuery} from './Queries';

const PENDING = 'pending';
const DONE = 'done';
const ERROR = 'error';

const EMPTY_MESSAGE = { status: "", help: "" };
const ERROR_MESSAGE = { status: "error", help: "Unable to fetch the Members associated with you." };

export default class MemberListStore {

    state = PENDING;
    message = EMPTY_MESSAGE;

    members = new Map();
    rowCount=0;
 
    constructor(props) {
        this.apiProxy = props.apiProxy;
    }

    get isLoading() {
        return this.state === PENDING;
    }

    get isError() {
        return this.state === ERROR;
    }

    get isDone() {
        return this.state === DONE;
    }

    
    /**
     * Obtain the List of members who are associated with the 
     * Coach by enrolling into the Programs offered by the Coach.
     *
     */
    fetchMembers = async() => {
        
        this.state  = PENDING;
        this.message = EMPTY_MESSAGE;

        const variables = {
            criteria: {
                coachId: this.apiProxy.getUserFuzzyId(),
                desire: 'ALL'
            }
        }

        try {
            const response = await this.apiProxy.query(apiHost, coachMembersQuery, variables);
            const data = await response.json();

            if (data.error === true) {
                this.message = ERROR_MESSAGE;
                this.state = DONE;
                return;
            }
            const result = data.data.getCoachMembers.members;
            this.groupByUser(result);
            this.state = DONE;
        }
        catch (e) {
            this.state = ERROR;
            this.message = ERROR_MESSAGE
            console.log(e);
        }
    }

    /**
     * Let us group the result with the members email id
     * @param {*} result 
     */
    groupByUser = (result) => {
        this.members.clear();
        this.rowCount = 0;

        if(!result) {
            return;
        }

        for(let item of result) {
            let email = item.user.email;
            if (!this.members.has(email)) {
                this.members.set(email,[]);
            }
            this.members.get(email).push(item);
        }
        
        this.rowCount = this.members.size;
    }

}

decorate(MemberListStore,{
    state:observable,
    message: observable,
    members:observable,
    rowCount:observable,

    isLoading:computed,
    isError:computed,
    isDone:computed,
    
    fetchMembers:action,
});