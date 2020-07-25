import { decorate, observable, computed, action } from 'mobx';

import { apiHost } from './APIEndpoints';
import {createProgramQuery, findProgramQuery} from './Queries';

const INIT = "init";
const PENDING = 'pending';
const DONE = 'done';
const ERROR = 'error';

const EMPTY_MESSAGE = { status: "", help: "" };
const ERROR_MESSAGE = { status: "error", help: "Unable to update Programs." };

export default class ProgramStore {

    state = INIT;
    message = EMPTY_MESSAGE;

    showDrawer = false;
    programFuzzyId = null;

    program = null;

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

    load = async(programFuzzyId) => {
        this.state = PENDING;
        this.message = EMPTY_MESSAGE;
        
        const variables = {
            input: {
                fuzzyId: programFuzzyId
            }
        }

        try {
            const response = await this.apiProxy.query(apiHost, findProgramQuery, variables);
            const data = await response.json();

            if (data.error == true) {
                this.state = ERROR;
                this.message = ERROR_MESSAGE;
                return;
            }

            this.program = data;
            this.state = DONE;
        }

        catch (e) {
            this.state = ERROR;
            this.message = ERROR_MESSAGE;
            console.log(e);
        }
    }

    /**
     * Create New Program using the programRequest
     */
    createProgram = async (programRequest) => {

        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

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
                this.state = ERROR;
                this.message = ERROR_MESSAGE;
                return;
            }
            this.showDrawer = false;
            this.program = data;
            this.state = DONE;
        }
        catch (e) {
            this.state = ERROR;
            this.message = ERROR_MESSAGE;
            console.log(e);
        }

    }

}

decorate(ProgramStore, {
    state: observable,
    showDrawer: observable,
    message: observable,
    programId: observable,

    program: observable,

    isLoading: computed,
    isDone: computed,
    isError: computed,

    createProgram: action,
    load: action,
});