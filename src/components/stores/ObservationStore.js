import { decorate, observable, computed, action } from 'mobx';
import { apiHost } from './APIEndpoints';
import { createObservationQuery,updateObservationQuery, observationsQuery } from './Queries';
import {isBlank} from './Util';

const INIT = "init";
const PENDING = 'pending';
const DONE = 'done';
const ERROR = 'error';

const EMPTY_OBSERVATION = {id:"",description:""};

const EMPTY_MESSAGE = { status: "", help: "" };
const SAVING_ERROR = { status: "error", help: "We are very sorry. Unable to store the Planning Information." };
const ERROR_MESSAGE = { status: ERROR, help: "Unable to fetch Observations." };

/**
 * Every enrollment has a coaching Plan and is a composition of multiple sections. 
 * 
 * This store is responsible of one of the sections.
 * 
 * And every section may have a list of items. 
 * Let this store manages the list, creation, modification and deletion of Objective.
 * 
 */
export default class ObservationStore {

    state = INIT;
    message = EMPTY_MESSAGE;

    showDrawer = false;
    change = null;

    observations = [];
    rowCount = 0;
    currentObservation = {};

    /**
     * The section id can be any one of
     * 
     * objective, onward, observations and opportunities 
     * 
     * @param {*} props 
     */
    constructor(props) {
        this.apiProxy = props.apiProxy;
        this.enrollmentId = props.enrollmentId;
    }

    get isLoading() {
        return this.state === PENDING || this.state === INIT;
    }

    get isDone() {
        return this.state === DONE;
    }

    get isError() {
        return this.state === ERROR;
    }

    get isNewObservation() {
        const id = this.currentObservation.id;
        return isBlank(id);
    }

    setNewObservation = () => {
        this.currentObservation = EMPTY_OBSERVATION;
    }

    setCurrentObservation = (observation) => {
        this.currentObservation = observation;
    }

    fetchObservations = async () => {
        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const variables = {
            criteria: {
                enrollmentId: this.enrollmentId,
            }
        }

        try {
            const response = await this.apiProxy.query(apiHost, observationsQuery, variables);
            const data = await response.json();

            if (data.data.getObservations.error != null) {
                this.state = ERROR;
                this.message = ERROR_MESSAGE;
                return;
            }

            const result = data.data.getObservations.observations;
            this.observations = result;
            this.rowCount = result.length;
            this.state = DONE;
        }
        catch (e) {
            this.state = ERROR;
            this.message = ERROR_MESSAGE;
            console.log(e);
        }
    }

    saveObservation = async(planRequest) => {
        if(this.isNewObservation) {
            await this.createObservation(planRequest);
        }
        else {
            await this.updateObservation(planRequest);
        }
    }

    updateObservation = async(planRequest) => {
        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const variables = {
            input: {
                description:planRequest.description,
                id: this.currentObservation.id
            }
        }

        try {
            const response = await this.apiProxy.mutate(apiHost, updateObservationQuery, variables);
            const data = await response.json();

            if (data.error == true) {
                this.state = ERROR;
                this.message = SAVING_ERROR;
                return;
            }

            this.state = DONE;
            this.showDrawer = false;
            this.fetchObservations();
        }
        catch (e) {
            this.state = ERROR;
            this.message = SAVING_ERROR;
            console.log(e);
        }
    }
    /**
     * content,duration and startTime.
     *  
     * @param {*} planRequest 
     */

    createObservation = async (planRequest) => {
        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const variables = {
            input: {
                description:planRequest.description,
                enrollmentId: this.enrollmentId,
            }
        }

        try {
            const response = await this.apiProxy.mutate(apiHost, createObservationQuery, variables);
            const data = await response.json();

            if (data.error == true) {
                this.state = ERROR;
                this.message = SAVING_ERROR;
                return;
            }
            this.state = DONE;
            this.showDrawer = false;
            this.fetchObservations();
        }
        catch (e) {
            this.state = ERROR;
            this.message = SAVING_ERROR;
            console.log(e);
        }
    }

}
decorate(ObservationStore, {
    state: observable,
    message: observable,
    changed: observable,
    showDrawer: observable,

    observations: observable,
    currentObservation: observable,
    rowCount:observable,
    
    isLoading: computed,
    isDone: computed,
    isError: computed,
    isNewObservation: computed,

    saveObservation: action,
    fetchObservations: action,
    setNewObservation: action,
    setCurrentObservation: action,
})