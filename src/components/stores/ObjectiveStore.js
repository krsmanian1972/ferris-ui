import { decorate, observable, computed, action } from 'mobx';
import { apiHost } from './APIEndpoints';
import { createObjectiveQuery,objectivesQuery } from './Queries';

import moment from 'moment';

const INIT = "init";
const PENDING = 'pending';
const INVALID = "invalid";
const DONE = 'done';
const ERROR = 'error';


const EMPTY_MESSAGE = { status: "", help: "" };
const SAVING_ERROR = { status: "error", help: "We are very sorry. Unable to store the Planning Information." };
const ERROR_MESSAGE = { status: ERROR, help: "Unable to fetch Objectives." };

/**
 * Every enrollment has a coaching Plan and is a composition of multiple sections. 
 * 
 * This store is responsible of one of the sections.
 * 
 * And every section may have a list of items. 
 * Let this store manages the list, creation, modification and deletion of Objective.
 * 
 */
export default class ObjectiveStore {

    state = INIT;
    message = EMPTY_MESSAGE;

    showDrawer = false;
    startTimeMsg = {};
    endTimeMsg = {};
    change = null;

    objectives = [];
    rowCount = 0;
    

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

    get isInvalid() {
        return this.state === INVALID;
    }

    get isError() {
        return this.state === ERROR;
    }

    fetchObjectives = async () => {
        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const variables = {
            criteria: {
                enrollmentId: this.enrollmentId,
            }
        }

        try {
            const response = await this.apiProxy.query(apiHost, objectivesQuery, variables);
            const data = await response.json();

            if (data.data.getObjectives.error != null) {
                this.state = ERROR;
                this.message = ERROR_MESSAGE;
                return;
            }

            const result = data.data.getObjectives.objectives;
            this.objectives = result;
            this.rowCount = result.length;
            this.state = DONE;
        }
        catch (e) {
            this.state = ERROR;
            this.message = ERROR_MESSAGE;
            console.log(e);
        }
    }

    /**
     * content,duration and startTime.
     *  
     * @param {*} planRequest 
     */

    createObjective = async (planRequest) => {
        this.state = PENDING;
        this.message = EMPTY_MESSAGE;
        
        if (!this.isValid(planRequest)) {
            this.state = INVALID;
            return;
        }

        const variables = {
            input: {
                description:planRequest.description,
                enrollmentId: this.enrollmentId,
                startTime: planRequest.startTime.utc().format(),
                endTime: planRequest.startTime.utc().format()
            }
        }

        try {
            const response = await this.apiProxy.mutate(apiHost, createObjectiveQuery, variables);
            const data = await response.json();

            if (data.error == true) {
                this.state = ERROR;
                this.message = SAVING_ERROR;
                return;
            }
            this.state = DONE;
            this.showDrawer = false;
            this.fetchObjectives();
        }
        catch (e) {
            this.state = ERROR;
            this.message = ENROLLMENT_ERROR;
            console.log(e);
        }
    }


    isValid = (request) => {

        this.validateStartDate(request.startTime);
        this.validateEndDate(request.endTime,request.startTime);

        return this.startTimeMsg.status !== ERROR && this.endTimeMsg.status !== ERROR
    }

    validateStartDate = (startDate) => {

        this.startTimeMsg = EMPTY_MESSAGE;

        const boundary = moment().startOf('day');
        const flag = startDate && startDate > boundary;

        if (!flag) {
            this.startTimeMsg = { status: ERROR, help: "The start date should be a future date." };
        }
    }

    validateEndDate = (endDate,startDate) => {

        this.endTimeMsg = EMPTY_MESSAGE;

        const flag = endDate && startDate && endDate >= startDate;

        if (!flag) {
            this.endTimeMsg = { status: ERROR, help: "The completion date should be later than the start date." };
        }
    }

}
decorate(ObjectiveStore, {
    state: observable,
    message: observable,
    changed: observable,
    showDrawer: observable,

    startTimeMsg: observable,
    endTimeMsg: observable,

    objectives: observable,

    isLoading: computed,
    isDone: computed,
    isInvalid: computed,
    isError: computed,

    createObjective: action,
    fetchObjectives: action,
})