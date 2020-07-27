import { decorate, observable, computed, action } from 'mobx';
import { apiHost } from './APIEndpoints';
import { createEnrollmentQuery } from './Queries';

const INIT = "init";
const PENDING = 'pending';
const DONE = 'done';
const ERROR = 'error';

const EMPTY_MESSAGE = { status: "", help: "" };
const ENROLLMENT_ERROR = { status: "error", help: "We are very sorry. Unable to complete your enrollment in this program. Please contact the coach." };

export default class EnrollmentStore {

    state = INIT;
    message = EMPTY_MESSAGE;

    showEnrollmentModal = false;
    showResultModal = false;

    constructor(props) {
        this.apiProxy = props.apiProxy;
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

    createEnrollment = async (programFuzzyId) => {
        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const variables = {
            input: {
                programFuzzyId: programFuzzyId,
                userFuzzyId: this.apiProxy.getUserFuzzyId(),
            }
        }

        try {
            const response = await this.apiProxy.mutate(apiHost, createEnrollmentQuery, variables);
            const data = await response.json();

            if (data.error == true) {
                this.state = ERROR;
                this.message = ENROLLMENT_ERROR;
                return;
            }
            this.state = DONE
            this.showEnrollmentModal = false;
            this.showResultModal = true;
        }
        catch (e) {
            this.state = ERROR;
            this.message = ENROLLMENT_ERROR;
            console.log(e);
        }

    }
}
decorate(EnrollmentStore, {
    state: observable,
    message: observable,

    showEnrollmentModal: observable,
    showResultModal: observable,

    isLoading: computed,
    isDone: computed,
    isError: computed,

    createEnrollment: action,
})