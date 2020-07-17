import { decorate, observable, computed,action } from 'mobx';

import { apiHost } from './APIEndpoints';
import {enrollmentsQuery} from './Queries';

const PENDING = 'pending';
const DONE = 'done';
const ERROR = 'error';

export default class EnrollmentListStore {

    state = PENDING;
    members = [];
    rowCount=0;
 
    constructor(props) {
        this.apiProxy = props.apiProxy;
    }

    get isLoading() {
        this.state !== DONE; 
    }

    /**
     * Obtain the List of members who are enrolled into a Program
     *
     */
    fetchEnrollments = async(programFuzzyId) => {
        
        this.state  = PENDING;

        const variables = {
            criteria: {
                programFuzzyId:programFuzzyId
            }
        }

        try {
            const response = await this.apiProxy.query(apiHost, enrollmentsQuery, variables);
            const data = await response.json();

            if (data.error == true) {
                this.isError = true;
                this.message = data.detailedErrorMessage;
                this.state = DONE;
                return;
            }
            const result = data.data.getEnrollments;
            this.members = result;
            this.rowCount = result.length;
            this.state = DONE;
        }
        catch (e) {
            this.state = ERROR;
            console.log(e);
        }
    }

}

decorate(EnrollmentListStore,{
    state:observable,
    isLoading:computed,
    rowCount:observable,
    members:observable,
    fetchEnrollments:action,
});