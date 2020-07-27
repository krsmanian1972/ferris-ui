import { decorate, observable, computed, action } from 'mobx';

import { apiHost } from './APIEndpoints';
import { createProgramQuery, programsQuery, createEnrollmentQuery } from './Queries';

const INIT = "init";
const PENDING = 'pending';
const DONE = 'done';
const ERROR = 'error';

const EMPTY_MESSAGE = { status: "", help: "" };
const CREATION_ERROR = { status: "error", help: "Unable to create the program." };
const LOADING_ERROR = { status: "error", help: "Unable to load the program." };
const NO_MATCHING_RECORD = { status: "error", help: "Unable to find a matching program" };


export default class ProgramStore {

    state = INIT;
    message = EMPTY_MESSAGE;

    showDrawer=false;
    showActivationModal = false;

    programFuzzyId = null;
    programModel = null;

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

    get isOwner() {
        return this.programModel && this.programModel.coach.fuzzyId === this.apiProxy.getUserFuzzyId();
    }

    get isEnrolled() {
        return this.programModel && this.programModel.enrollmentStatus === "YES";
    }

    /**
     * Allow only the coach to activate this program
     */
    get canActivate() {
        if (this.state !== DONE) {
            return false;
        }
        return this.isOwner && !this.programModel.program.active;
    }

    /**
     * Allow anyone other than the coach to enroll
     */
    get canEnroll() {
        if (this.state !== DONE) {
            return false;
        }
        if (this.isOwner) {
            return false;
        }
        return this.programModel.program.active && !this.isEnrolled;
    }


    reload = () => {
        this.load(this.programFuzzyId)
    }

    load = async (programFuzzyId) => {
        this.state = PENDING;
        this.message = EMPTY_MESSAGE;
        this.programModel = null;
        this.programFuzzyId = programFuzzyId;

        const userFuzzyId = this.apiProxy.getUserFuzzyId();

        const variables = {
            criteria: {
                userFuzzyId: userFuzzyId,
                programFuzzyId: programFuzzyId,
                desire: "SINGLE"
            }
        }

        try {
            const response = await this.apiProxy.query(apiHost, programsQuery, variables);
            const data = await response.json();

            if (data.error == true) {
                this.state = ERROR;
                this.message = LOADING_ERROR;
                return;
            }

            const result = data.data.getPrograms.programs;
            if (result.length != 1) {
                this.state = ERROR;
                this.message = NO_MATCHING_RECORD;
                return;
            }

            this.programModel = result[0]
            this.state = DONE;
        }

        catch (e) {
            this.state = ERROR;
            this.message = LOADING_ERROR;
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
                coachFuzzyId: this.apiProxy.getUserFuzzyId()
            }
        }

        try {
            const response = await this.apiProxy.mutate(apiHost, createProgramQuery, variables);
            const data = await response.json();

            if (data.error == true) {
                this.state = ERROR;
                this.message = CREATION_ERROR;
                return;
            }
            this.showDrawer = false;
            this.programModel = data;
            this.state = DONE;
        }
        catch (e) {
            this.state = ERROR;
            this.message = CREATION_ERROR;
            console.log(e);
        }

    }

}

decorate(ProgramStore, {
    state: observable,
    message: observable,

    showDrawer:observable,
    showActivationModal: observable,
    
    programModel: observable,

    isLoading: computed,
    isDone: computed,
    isError: computed,

    isOwner: computed,
    isEnrolled: computed,
    canActivate: computed,
    canEnroll: computed,

    createProgram: action,
    load: action,
    reload: action,
});