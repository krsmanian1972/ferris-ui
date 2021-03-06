import { decorate, observable, computed, action } from 'mobx';
import { apiHost } from './APIEndpoints';
import { createConstraintQuery,constraintsQuery, updateOptionQuery } from './Queries';
import {isBlank} from './Util';

const INIT = "init";
const PENDING = 'pending';
const DONE = 'done';
const ERROR = 'error';

const EMPTY_OPTION = {id:"",description:""};

const EMPTY_MESSAGE = { status: "", help: "" };
const SAVING_ERROR = { status: "error", help: "We are very sorry. Unable to store the Planning Information." };
const ERROR_MESSAGE = { status: ERROR, help: "Unable to fetch Constraints." };

/**
 * Every enrollment has a coaching Plan and is a composition of multiple sections. 
 * 
 * This store is responsible of one of the sections.
 * 
 * And every section may have a list of items. 
 * Let this store manages the list, creation, modification and deletion of Objective.
 * 
 */
export default class ConstraintStore {

    state = INIT;
    message = EMPTY_MESSAGE;

    showDrawer = false;
    change = null;

    options = [];
    rowCount = 0;
    currentOption = {};
    
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

    get isError() {
        return this.state === ERROR;
    }

    get isNewOption() {
        const id = this.currentOption.id;
        return isBlank(id);
    }

    setNewOption = () => {
        this.currentOption = EMPTY_OPTION
    }

    asCurrent =(index) => {

        if(index >= 0 && index < this.rowCount) {
            this.currentOption = this.options[index];
            return true;
        }

        return false;
    }

    fetchOptions = async () => {
        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const variables = {
            criteria: {
                enrollmentId: this.enrollmentId,
            }
        }

        try {
            const response = await this.apiProxy.query(apiHost, constraintsQuery, variables);
            const data = await response.json();

            if (data.data.getOptions.error != null) {
                this.state = ERROR;
                this.message = ERROR_MESSAGE;
                return;
            }

            const result = data.data.getOptions.constraints;
            this.options = result;
            this.rowCount = result.length;
            this.state = DONE;
        }
        catch (e) {
            this.state = ERROR;
            this.message = ERROR_MESSAGE;
            console.log(e);
        }
    }

    saveOption = async(planRequest) => {
        if(this.isNewOption) {
            await this.createOption(planRequest);
        }
        else{
            await this.updateOption(planRequest);
        }
    }

    updateOption = async(planRequest) => {
        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const variables = {
            input: {
                description:planRequest.description,
                id: this.currentOption.id
            }
        }

        try {
            const response = await this.apiProxy.mutate(apiHost, updateOptionQuery, variables);
            const data = await response.json();

            if (data.error === true) {
                this.state = ERROR;
                this.message = SAVING_ERROR;
                return;
            }

            this.state = DONE;
            this.showDrawer = false;
            this.fetchOptions();
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

    createOption = async (planRequest) => {
        this.state = PENDING;
        this.message = EMPTY_MESSAGE;
        
        const variables = {
            input: {
                description:planRequest.description,
                enrollmentId: this.enrollmentId,
            }
        }

        try {
            const response = await this.apiProxy.mutate(apiHost, createConstraintQuery, variables);
            const data = await response.json();

            if (data.error === true) {
                this.state = ERROR;
                this.message = SAVING_ERROR;
                return;
            }
            this.state = DONE;
            this.showDrawer = false;
            await this.fetchOptions();
        }
        catch (e) {
            this.state = ERROR;
            this.message = SAVING_ERROR;
            console.log(e);
        }
    }

}
decorate(ConstraintStore, {
    state: observable,
    message: observable,
    change: observable,
    showDrawer: observable,

    options: observable,
    currentOption: observable,
    rowCount:observable,

    isLoading: computed,
    isDone: computed,
    isError: computed,
    isNewOption:computed,

    saveOption:action,
    fetchOptions: action,
    setNewOption:action,
    asCurrent:action,
})