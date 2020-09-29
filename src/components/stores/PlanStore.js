import { decorate, observable, computed, action } from 'mobx';
import { apiHost } from './APIEndpoints';
import { createMasterPlanQuery, updatePlanInfoQuery,saveMasterPlanQuery } from './Queries';
import { isBlank } from './Util';

const INIT = "init";
const PENDING = 'pending';
const DONE = 'done';
const ERROR = 'error';

const EMPTY_PLAN = { id: "", name: "", description: "" };

const EMPTY_MESSAGE = { status: "", help: "" };
const SAVING_ERROR = { status: "error", help: "We are very sorry. Unable to store the Master Plan Information" };

export default class PlanStore {

    state = INIT;
    message = EMPTY_MESSAGE;

    showDrawer = false;
    change = null;

    currentPlan = {};

    constructor(props) {
        this.apiProxy = props.apiProxy;
        this.planListStore = props.planListStore;
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

    get isNewPlan() {
        const id = this.currentPlan.id;
        return isBlank(id);
    }

    setNewPlan = () => {
        this.currentPlan = EMPTY_PLAN;
        this.state = DONE;
    }

    asCurrent = (plan) => {

        this.currentPlan = EMPTY_PLAN;

        if (plan) {
            this.currentPlan.description = plan.description;
            this.currentPlan.name = plan.name;
            this.currentPlan.id = plan.id;
            this.state = DONE;
        }
    }


    savePlan = async (planRequest) => {
        if (this.isNewPlan) {
            await this.createPlan(planRequest);
        }
        else {
            await this.updatePlan(planRequest);
        }
    }

    updatePlan = async (planRequest) => {
        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const variables = {
            input: {
                name: planRequest.name,
                description: planRequest.description,
                id: this.currentPlan.id
            }
        }

        try {
            const response = await this.apiProxy.mutate(apiHost, updatePlanInfoQuery, variables);
            const data = await response.json();

            if (data.error == true) {
                this.state = ERROR;
                this.message = SAVING_ERROR;
                return;
            }

            this.state = DONE;
            this.showDrawer = false;
            this.planListStore.fetchPlans();
        }
        catch (e) {
            this.state = ERROR;
            this.message = SAVING_ERROR;
            console.log(e);
        }
    }
    /**
     *  
     * @param {*} planRequest 
     */

    createPlan = async (planRequest) => {
        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const variables = {
            input: {
                name: planRequest.name,
                description: planRequest.description,
                coachId: this.apiProxy.getUserFuzzyId(),
            }
        }

        try {
            const response = await this.apiProxy.mutate(apiHost, createMasterPlanQuery, variables);
            const data = await response.json();

            if (data.error == true) {
                this.state = ERROR;
                this.message = SAVING_ERROR;
                return;
            }
            this.state = DONE;
            this.showDrawer = false;
            this.planListStore.fetchPlans();
        }
        catch (e) {
            this.state = ERROR;
            this.message = SAVING_ERROR;
            console.log(e);
        }
    }

    saveMasterPlan = async (master_plan_id,taskPositions) => {
        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const variables = {
            input: {
                master_plan_id: master_plan_id,
                tasks: taskPositions,
                links: [],
            }
        }

        try {
            const response = await this.apiProxy.mutate(apiHost, saveMasterPlanQuery, variables);
            const data = await response.json();

            if (data.error == true) {
                this.state = ERROR;
                this.message = SAVING_ERROR;
                return;
            }
            this.state = DONE;
        }
        catch (e) {
            this.state = ERROR;
            this.message = SAVING_ERROR;
            console.log(e);
        }
    }

}
decorate(PlanStore, {
    state: observable,
    message: observable,
    change: observable,
    showDrawer: observable,

    currentPlan: observable,

    isLoading: computed,
    isDone: computed,
    isError: computed,
    isNewPlan: computed,

    savePlan: action,
    setNewPlan: action,
    asCurrent: action,

    saveMasterPlan: action,
})