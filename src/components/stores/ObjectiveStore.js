import { decorate, observable, computed, action } from 'mobx';
import { apiHost } from './APIEndpoints';
import { createObjectiveQuery, objectivesQuery, updateObjectiveQuery } from './Queries';
import { isBlank } from './Util';

import moment from 'moment';

const INIT = "init";
const PENDING = 'pending';
const INVALID = "invalid";
const DONE = 'done';
const ERROR = 'error';

const EMPTY_OBJECTIVE = { id: "", description: "", scheduleStart: null, scheduleEnd: null };

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
    startTime = null;

    endTimeMsg = {};
    endTime = null;

    change = null;

    objectives = [];
    rowCount = 0;
    currentObjective = {};
    
    isCoach = false;


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

    get isNewObjective() {
        const id = this.currentObjective.id;
        return isBlank(id);
    }

    setNewObjective = () => {
        this.currentObjective = EMPTY_OBJECTIVE;
        
        this.startTimeMsg = {};
        this.endTimeMsg = {};
        this.startTime = null;
        this.endTime = null;
    }

    asCurrent = (index) => {

        this.startTimeMsg = {};
        this.endTimeMsg = {};
        this.startTime = null;
        this.endTime = null;

        if (index >= 0 && index < this.rowCount) {
            this.currentObjective = this.objectives[index];
            return true;
        }

        return false;
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

    saveObjective = async (planRequest) => {
        if (this.isNewObjective) {
            await this.createObjective(planRequest);
        }
        else {
            await this.updateObjective(planRequest);
        }
    }

    updateObjective = async (planRequest) => {
        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        if (!this.isValid(planRequest)) {
            this.state = INVALID;
            return;
        }

        const variables = {
            input: {
                id: this.currentObjective.id,
                description: planRequest.description,
                startTime: planRequest.startTime.utc().format(),
                endTime: planRequest.endTime.utc().format()
            }
        }

        try {
            const response = await this.apiProxy.mutate(apiHost, updateObjectiveQuery, variables);
            const data = await response.json();

            if (data.error === true) {
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
            this.message = SAVING_ERROR;
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
                description: planRequest.description,
                enrollmentId: this.enrollmentId,
                startTime: planRequest.startTime.utc().format(),
                endTime: planRequest.endTime.utc().format()
            }
        }

        try {
            const response = await this.apiProxy.mutate(apiHost, createObjectiveQuery, variables);
            const data = await response.json();

            if (data.error === true) {
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
            this.message = SAVING_ERROR;
            console.log(e);
        }
    }


    isValid = (request) => {

        this.validateStartDate(request.startTime);
        this.validateEndDate(request.endTime);

        return this.startTimeMsg.status !== ERROR && this.endTimeMsg.status !== ERROR
    }

    validateStartDate = (startDate) => {

        this.startTimeMsg = EMPTY_MESSAGE;
        this.startTime = startDate ? moment(startDate).startOf('day') : null;

        if (!this.startTime) {
            this.startTimeMsg = { status: ERROR, help: "Please provide a Start Date for working towards this objective." };
            return;
        }

        const boundary = moment().startOf('day');
        var flag = this.startTime >= boundary;

        if (!flag) {
            this.startTimeMsg = { status: ERROR, help: "The start date should be a present or a future date." };
            return;
        }

        if(!this.endTime) {
            return;
        }

        flag = this.endTime >= this.startTime;

        if (!flag) {
            this.startTimeMsg = { status: ERROR, help: "The start date should be equal or earlier to the completion date." };
            return;
        }
    }

    validateEndDate = (endDate) => {

        this.endTimeMsg = EMPTY_MESSAGE;
        this.endTime = endDate ? moment(endDate).startOf('day') : null;

        if (!this.endTime) {
            this.endTimeMsg = { status: ERROR, help: "Please provide the date of acheiving this objective." };
            return;
        }
        
        if(!this.startTime) {
            return;
        }

        const flag = this.endTime && this.endTime >= this.startTime;

        if (!flag) {
            this.endTimeMsg = { status: ERROR, help: "The completion date should be later than the start date." };
        }
    }

}
decorate(ObjectiveStore, {
    state: observable,
    message: observable,
    change: observable,
    showDrawer: observable,

    startTimeMsg: observable,
    startTime: observable,

    endTimeMsg: observable,
    endTime: observable,

    objectives: observable,
    currentObjective: observable,
    rowCount: observable,

    isLoading: computed,
    isDone: computed,
    isInvalid: computed,
    isError: computed,
    isNewObjective: computed,

    saveObjective: action,
    fetchObjectives: action,
    setNewObjective: action,
    asCurrent: action,
    validateStartDate: action,
    validateEndDate: action,
})