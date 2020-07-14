import { decorate, observable, computed,action } from 'mobx';

import { apiHost } from './APIEndpoints';
import {programsQuery} from './Queries';

const PENDING = 'pending';
const DONE = 'done';
const ERROR = 'error';

export default class ProgramListStore {

    state = PENDING;
    programs = [];
    rowCount=0;

    constructor(props) {
        this.apiProxy = props.apiProxy;
    }

    get isLoading() {
        this.state !== DONE; 
    }

    /**
     * Obtain the List of programs from the Ferris API
     *
     */
    fetchPrograms = async() => {
        
        this.state  = PENDING;

        const userFuzzyId = this.apiProxy.getUserFuzzyId();

        const variables = {
            criteria: {
                userFuzzyId:userFuzzyId
            }
        }

        try {
            const response = await this.apiProxy.query(apiHost, programsQuery, variables);
            const data = await response.json();

            if (data.error == true) {
                this.isError = true;
                this.message = data.detailedErrorMessage;
                this.state = DONE;
                return;
            }
            const result = data.data.getPrograms;
            this.programs = result;
            this.rowCount = result.length;
            this.state = DONE;
        }
        catch (e) {
            this.state = ERROR;
            console.log(e);
        }
    }
}

decorate(ProgramListStore,{
    state:observable,
    rowCount:observable,
    isLoading:computed,
    programs:observable,
    fetchPrograms:action,
});