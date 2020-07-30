import { decorate, observable, computed, action } from 'mobx';

import { apiHost } from './APIEndpoints';
import { programsQuery } from './Queries';

const PENDING = 'pending';
const DONE = 'done';
const ERROR = 'error';

const EMPTY_MESSAGE = { status: "", help: "" };
const ERROR_MESSAGE = { status: ERROR, help: "Unable to fetch Programs." };

export default class ProgramListStore {

    state = PENDING;
    message = EMPTY_MESSAGE;
    change = null;

    programs = [];
    members = [];
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
     * To be used only by the Coach User.
     * Let us indicate the inactive programs in the UI
     */
    fetchCoachPrograms = () => {
        const desire = "YOURS";
        this.fetchPrograms(desire);
    }
    /**
     * Obtain the List of programs from the Ferris API
     *
     */
    fetchPrograms = async (desire) => {

        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const userFuzzyId = this.apiProxy.getUserFuzzyId();

        const variables = {
            criteria: {
                userFuzzyId: userFuzzyId,
                programFuzzyId:"",
                desire:desire
            }
        }

        try {
            const response = await this.apiProxy.query(apiHost, programsQuery, variables);
            const data = await response.json();

            if (data.error == true) {
                this.state = ERROR;
                this.message = ERROR_MESSAGE;
                return;
            }

            const result = data.data.getPrograms.programs;
            this.programs = result;
            this.rowCount = result.length;
            this.state = DONE;
        }
        catch (e) {
            this.state = ERROR;
            this.message = ERROR_MESSAGE;
            console.log(e);
        }
    }
}

decorate(ProgramListStore, {
    state: observable,
    message: observable,
    programs: observable,
    rowCount: observable,
    change:observable,

    isLoading: computed,
    isDone: computed,
    isError: computed,

    fetchPrograms: action,
});