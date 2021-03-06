import { decorate, observable, computed,action } from 'mobx';

import { apiHost } from './APIEndpoints';
import {enrollmentsQuery} from './Queries';

const PENDING = 'pending';
const DONE = 'done';
const ERROR = 'error';

const EMPTY_MESSAGE = { status: "", help: "" };
const ERROR_MESSAGE = { status: "error", help: "Unable to fetch the Members enrolled for this program." };

export default class EnrollmentListStore {

    state = PENDING;
    message = EMPTY_MESSAGE;

    members = [];
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
     * To Help the user to see both name and email together
     * 
     * @param {*} result 
     */
    setSearchable = (result) => {
        let selfIndex = -1;

        for(let index=0;index<result.length;index++) {
            let item = result[index];
            item.searchable = item.name+"::"+item.email;
            if(item.id===this.apiProxy.getUserFuzzyId()) {
                selfIndex = index;
            }
        }

        if(selfIndex !== -1) {
            result.splice(selfIndex, 1);
        }
    }

    /**
     * Obtain the List of members who are enrolled into a Program
     *
     */
    fetchEnrollments = async(programId,given_desire) => {
        
        this.state  = PENDING;
        this.message = EMPTY_MESSAGE;

        const variables = {
            criteria: {
                programId:programId,
                desire:given_desire?given_desire:'ALL',
            }
        }

        try {
            const response = await this.apiProxy.query(apiHost, enrollmentsQuery, variables);
            const data = await response.json();

            if (data.error === true) {
                this.message = ERROR_MESSAGE;
                this.state = DONE;
                return;
            }
            const result = data.data.getEnrollments;
            this.setSearchable(result);

            this.members = result;
            this.rowCount = result.length;
            this.state = DONE;
        }
        catch (e) {
            this.state = ERROR;
            this.message = ERROR_MESSAGE
            console.log(e);
        }
    }

}

decorate(EnrollmentListStore,{
    state:observable,
    message: observable,
    members:observable,
    rowCount:observable,

    isLoading:computed,
    isError:computed,
    isDone:computed,
    
    fetchEnrollments:action,
});