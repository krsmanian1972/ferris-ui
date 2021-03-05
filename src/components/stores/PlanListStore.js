import { decorate, observable, computed, action } from 'mobx';

import { apiHost } from './APIEndpoints';
import { masterPlansQuery } from './Queries';

const PENDING = 'pending';
const DONE = 'done';
const ERROR = 'error';

const EMPTY_MESSAGE = { status: "", help: "" };
const ERROR_MESSAGE = { status: ERROR, help: "Unable to fetch your master plans." };

export default class PlanListStore {

    state = PENDING;
    message = EMPTY_MESSAGE;
    change = null;

    plans = [];
    rowCount = 0;

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

    /**
     * Obtain the List of Master Plans of the Log-in Coach from the Ferris API
     */
    fetchPlans= async () => {

        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const userFuzzyId = this.apiProxy.getUserFuzzyId();

        const variables = {
            criteria: {
                coachId: userFuzzyId,
          }
        }

        try {
            const response = await this.apiProxy.query(apiHost, masterPlansQuery, variables);
            const data = await response.json();

            if (data.data.getMasterPlans === undefined) {
                this.state = ERROR;
                this.message = ERROR_MESSAGE;
                return;
            }

            const result = data.data.getMasterPlans.masterPlans;
            this.plans = result;
            this.rowCount = result.length;
            this.state = DONE;
        }
        catch (e) {
            this.state = ERROR;
            this.message = ERROR_MESSAGE;
        }
    }
}

decorate(PlanListStore, {
    state: observable,
    message: observable,
    plans: observable,
    rowCount: observable,
    change:observable,

    isLoading: computed,
    isDone: computed,
    isError: computed,

    fetchPlans: action,
});