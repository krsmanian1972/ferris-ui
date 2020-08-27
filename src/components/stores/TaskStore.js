import { decorate, observable, computed, action } from 'mobx';
import { apiHost } from './APIEndpoints';
import { createTaskQuery,tasksQuery,updateTaskQuery } from './Queries';
import moment from 'moment';
import {isBlank} from './Util';

const INIT = "init";
const PENDING = 'pending';
const INVALID = "invalid";
const DONE = 'done';
const ERROR = 'error';

const EMPTY_TASK = {id:"",description:"",scheduleStart:null,duration:0};

const EMPTY_MESSAGE = { status: "", help: "" };
const SAVING_ERROR = { status: "error", help: "We are very sorry. Unable to store the Planning Information." };
const ERROR_MESSAGE = { status: ERROR, help: "Unable to fetch the onward activities" };

export default class TaskStore {

    state = INIT;
    message = EMPTY_MESSAGE;

    showDrawer = false;

    startTime = null;
    startTimeMsg = {};
    
    duration = 0;
    durationMsg = {};

    change = null;

    tasks = [];
    rowCount = 0;
    currentTask = {};

    constructor(props) {
        this.apiProxy = props.apiProxy;
        this.enrollmentId = props.enrollmentId;
        this.memberId = props.memberId;
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

    get isNewTask() {
        const id = this.currentTask.id;
        return isBlank(id);
    }

    setNewTask = () => {
        this.currentTask = EMPTY_TASK;

        this.startTimeMsg = {};
        this.durationMsg = {};
        this.startTime = null;
        this.duration = 0;
    }

    asCurrent =(index) => {

        this.startTimeMsg = {};
        this.durationMsg = {};
        this.startTime = null;
        this.duration = 0;

        if(index >= 0 && index < this.rowCount) {
            this.currentTask = this.tasks[index];
            return true;
        }

        return false;
    }

    fetchTasks = async () => {
        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const variables = {
            criteria: {
                enrollmentId: this.enrollmentId,
            }
        }

        try {
            const response = await this.apiProxy.query(apiHost, tasksQuery, variables);
            const data = await response.json();

            if (data.data.getTasks.error != null) {
                this.state = ERROR;
                this.message = ERROR_MESSAGE;
                return;
            }

            const result = data.data.getTasks.tasks;
            this.tasks = result;
            this.rowCount = result.length;
            this.state = DONE;
        }
        catch (e) {
            this.state = ERROR;
            this.message = ERROR_MESSAGE;
            console.log(e);
        }
    }

    saveTask = async(planRequest) => {
        if(this.isNewTask) {
            await this.createTask(planRequest);
        }
        else {
            await this.updateTask(planRequest);
        }
    }

    updateTask = async(planRequest) => {
        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        if (!this.isValid(planRequest)) {
            this.state = INVALID;
            return;
        }
        
        const variables = {
            input: {
                id: this.currentTask.id,
                name:planRequest.name,
                description:planRequest.description,
                startTime: planRequest.startTime.utc().format(),
                duration:planRequest.duration,
            }
        }

        try {
            const response = await this.apiProxy.mutate(apiHost, updateTaskQuery, variables);
            const data = await response.json();

            if (data.error == true) {
                this.state = ERROR;
                this.message = SAVING_ERROR;
                return;
            }

            this.state = DONE;
            this.showDrawer = false;
            this.fetchTasks();
        }
        catch (e) {
            this.state = ERROR;
            this.message = SAVING_ERROR;
            console.log(e);
        }
    }

    createTask = async (planRequest) => {
        this.state = PENDING;
        this.message = EMPTY_MESSAGE;
        
        if (!this.isValid(planRequest)) {
            this.state = INVALID;
            return;
        }

        const variables = {
            input: {
                name:planRequest.name,
                description:planRequest.description,
                enrollmentId: this.enrollmentId,
                actorId:this.memberId,
                startTime: planRequest.startTime.utc().format(),
                duration: planRequest.duration
            }
        }

        try {
            const response = await this.apiProxy.mutate(apiHost, createTaskQuery, variables);
            const data = await response.json();

            if (data.error == true) {
                this.state = ERROR;
                this.message = SAVING_ERROR;
                return;
            }
            this.state = DONE;
            this.showDrawer = false;
            this.fetchTasks();
        }
        catch (e) {
            this.state = ERROR;
            this.message = ENROLLMENT_ERROR;
            console.log(e);
        }
    }

    isValid = (request) => {

        this.validateDate(request.startTime);
        this.validateDuration(request.duration);
   
        return this.startTimeMsg.status !== ERROR
            && this.startTimeMsg.status !== ERROR
            && this.durationMsg.status !== ERROR;
    }

    validateDate = (startDate) => {

        this.startTime = startDate;
        this.startTimeMsg = EMPTY_MESSAGE;

        if (!startDate) {
            this.startTimeMsg = { status: ERROR, help: "Please provide a start time for the Task." };
            return;
        }

        const boundary = moment().add(1, 'hour');
        const flag = startDate && startDate > boundary;

        if (!flag) {
            this.startTimeMsg = { status: ERROR, help: "Provide a time at least one hour after from now." };
            return;
        }

    }

    validateDuration = (value) => {

        this.duration = 0;
        this.durationMsg = EMPTY_MESSAGE;

        if (!value) {
            this.durationMsg = { status: ERROR, help: "Select the duration for this Task." };
            return;
        }

    }

}

decorate(TaskStore, {
    state: observable,
    message: observable,
    change: observable,
    showDrawer: observable,

    startTime:observable,
    startTimeMsg: observable,

    duration:observable,
    durationMsg:observable,

    tasks: observable,
    currentTask: observable,
    rowCount: observable,

    isLoading: computed,
    isDone: computed,
    isInvalid: computed,
    isError: computed,
    isNewTask: computed,

    saveTask:action,
    fetchTasks: action,
    setNewTask:action,
    asCurrent:action,
    validateDate: action,
    validateDuration:action,
})