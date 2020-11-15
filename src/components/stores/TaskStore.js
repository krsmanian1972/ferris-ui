import { decorate, observable, computed, action } from 'mobx';
import { apiHost } from './APIEndpoints';
import { createTaskQuery, tasksQuery, updateTaskQuery,alterMemberTaskStateQuery,updateTaskResponseQuery } from './Queries';
import moment from 'moment';
import { isBlank } from './Util';

const INIT = "init";
const PENDING = 'pending';
const INVALID = "invalid";
const DONE = 'done';
const ERROR = 'error';

const EMPTY_TASK = { id: "", description: "", scheduleStart: null, duration: 0 };

const EMPTY_MESSAGE = { status: "", help: "" };
const SAVING_ERROR = { status: "error", help: "We are very sorry. Unable to store the Planning Information." };
const ERROR_MESSAGE = { status: ERROR, help: "Unable to fetch the onward activities" };

const START_ERROR = { status: "error", help: "Unable to to start the task." };

export default class TaskStore {

    state = INIT;
    message = EMPTY_MESSAGE;

    showDrawer = false;
    showResponseDrawer = false;

    startTime = null;
    startTimeMsg = {};

    duration = 0;
    durationMsg = {};

    change = null;

    tasks = [];
    rowCount = 0;
    currentTask = {};
    currentIndex = -1;

    isCoach = false;

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

    asCurrent = (index) => {

        this.startTimeMsg = {};
        this.durationMsg = {};
        this.startTime = null;
        this.duration = 0;
        this.currentIndex = -1;

        if (index >= 0 && index < this.rowCount) {
            this.currentTask = this.tasks[index];
            this.currentIndex = index;
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

    saveTask = async (planRequest) => {
        if (this.isNewTask) {
            await this.createTask(planRequest);
        }
        else {
            await this.updateTask(planRequest);
        }
    }

    updateTask = async (planRequest) => {
        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        if (!this.isValid(planRequest)) {
            this.state = INVALID;
            return;
        }

        const startTime = planRequest.startTime.startOf('hour');

        const variables = {
            input: {
                id: this.currentTask.id,
                name: planRequest.name,
                description: planRequest.description,
                startTime: startTime.utc().format(),
                duration: planRequest.duration,
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

        const startTime = planRequest.startTime.startOf('hour');

        const variables = {
            input: {
                name: planRequest.name,
                description: planRequest.description,
                enrollmentId: this.enrollmentId,
                actorId: this.memberId,
                startTime: startTime.utc().format(),
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
            this.message = SAVING_ERROR;
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

    startTask = async(index) => {
        this.alterMemberTaskState(index,"START");
    }

    finishTask = async(index) => {
        this.alterMemberTaskState(index,"FINISH");
    }

    alterMemberTaskState = async(index,targetState) => {

        if (!(index >= 0 && index < this.rowCount)) {
            return 
        }

        const task = this.tasks[index];

        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const variables = {
            input: {
                id: task.id,
                targetState: targetState
            }
        };

        try {
            const response = await this.apiProxy.mutate(apiHost, alterMemberTaskStateQuery, variables);
            const data = await response.json();

            if (data.error == true) {
                this.state = ERROR;
                this.message = START_ERROR;
                return;
            }
            this.tasks[index] = data.data.alterMemberTaskState.task;
            this.state = DONE;
        }
        catch (e) {
            this.state = ERROR;
            this.message = START_ERROR;
            console.log(e);
        }
    }

    updateResponse = async (taskResponse) => {
        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const variables = {
            input: {
                id: this.currentTask.id,
                response: taskResponse.response,
           }
        }

        try {
            const response = await this.apiProxy.mutate(apiHost, updateTaskResponseQuery, variables);
            const data = await response.json();

            if (data.error == true) {
                this.state = ERROR;
                this.message = SAVING_ERROR;
                return;
            }

            this.tasks[this.currentIndex] = data.data.updateTaskResponse.task;
            
            this.state = DONE;
            this.showResponseDrawer = false;
        }
        catch (e) {
            this.state = ERROR;
            this.message = SAVING_ERROR;
            console.log(e);
        }
    }


}

decorate(TaskStore, {
    state: observable,
    message: observable,
    change: observable,
    showDrawer: observable,

    startTime: observable,
    startTimeMsg: observable,

    duration: observable,
    durationMsg: observable,

    tasks: observable,
    currentTask: observable,
    rowCount: observable,

    isLoading: computed,
    isDone: computed,
    isInvalid: computed,
    isError: computed,
    isNewTask: computed,

    saveTask: action,
    fetchTasks: action,
    setNewTask: action,
    asCurrent: action,
    validateDate: action,
    validateDuration: action,

    startTask: action,
    showResponseDrawer: observable,
    updateResponse: action,
    finishTask: action,
})