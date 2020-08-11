import { decorate, observable, computed, action } from 'mobx';
import { apiHost } from './APIEndpoints';
import { createTaskQuery,tasksQuery } from './Queries';

const INIT = "init";
const PENDING = 'pending';
const INVALID = "invalid";
const DONE = 'done';
const ERROR = 'error';

const EMPTY_MESSAGE = { status: "", help: "" };
const SAVING_ERROR = { status: "error", help: "We are very sorry. Unable to store the Planning Information." };
const ERROR_MESSAGE = { status: ERROR, help: "Unable to fetch Objectives." };

export default class TaskStore {

    state = INIT;
    message = EMPTY_MESSAGE;

    showDrawer = false;
    startTimeMsg = {};
    endTimeMsg = {};
    change = null;

    tasks = [];
    rowCount = 0;


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

    createTask = async (planRequest) => {
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

decorate(TaskStore, {
    state: observable,
    message: observable,
    changed: observable,
    showDrawer: observable,

    startTimeMsg: observable,
    endTimeMsg: observable,

    tasks: observable,

    isLoading: computed,
    isDone: computed,
    isInvalid: computed,
    isError: computed,

    createTask: action,
    fetchTasks: action,
})