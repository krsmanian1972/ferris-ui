import { decorate, observable, action } from 'mobx';

import { apiHost } from './APIEndpoints';
import {createProgramQuery} from './Queries';

const PENDING = 'pending';
const DONE = 'done';
const ERROR = 'error';

export default class ProgramStore {

    state = DONE;

    showDrawer = false;
    programId = 0;

    isError = false;
    message = '';

    constructor(props) {
        this.apiProxy = props.apiProxy;
        this.programListStore = props.programListStore;
    }

    /**
     * Create New Program using the programRequest
     */
    createProgram = async (programRequest) => {

        this.state = PENDING;
        this.isError = false;
        this.message = '';

        const variables = {
            input: {
                name: programRequest.name,
                description: programRequest.description,
                coachFuzzyId:this.apiProxy.getUserFuzzyId()
            }
        }

        try {
            const response = await this.apiProxy.mutate(apiHost, createProgramQuery, variables);
            const data = await response.json();

            if (data.error == true) {
                this.isError = true;
                this.message = data.detailedErrorMessage;
                this.state = DONE;
                return;
            }
            this.program = data;
            this.state = DONE;
            this.showDrawer = false;
            this.programListStore.fetchPrograms();
        }
        catch (e) {
            this.state = ERROR;
            console.log(e);
        }

    }

}

decorate(ProgramStore, {
    showDrawer: observable,
    programId: observable,
    createProgram: action,
});