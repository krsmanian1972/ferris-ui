import { decorate, observable, computed, action } from 'mobx';
import { apiHost } from './APIEndpoints';
import { createEnrollmentQuery,managedEnrollmentQuery } from './Queries';

const INIT = "init";
const PENDING = 'pending';
const DONE = 'done';
const ERROR = 'error';

const EMPTY_MESSAGE = { status: "", help: "" };
const ENROLLMENT_ERROR = { status: "error", help: "We are very sorry. Unable to complete your enrollment in this program. Please contact the coach." };
const MANAGED_ENROLLMENT_ERROR = { status: "error", help: "Error during enrollment by invitation." };

export default class EnrollmentStore {

    state = INIT;
    message = EMPTY_MESSAGE;

    showEnrollmentModal = false;
    showResultModal = false;
    showInvitationDrawer = false;

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

    /**
     * Self enrollment where a member directly enrolls into a program.
     * 
     * @param {*} programId 
     */
    createEnrollment = async (programId) => {
        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const variables = {
            input: {
                programId: programId,
                userId: this.apiProxy.getUserFuzzyId(),
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

    /**
     * This is a managed Enrollment where a coach enrolls another member
     * into her/his program.
     * 
     * @param {*} programId 
     * @param {*} invitationForm 
     * @param {*} subject 
     */
    enrollMember = async (programId,invitationForm,subject) => {
        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const variables = {
            input: {
                programId: programId,
                coachId: this.apiProxy.getUserFuzzyId(),
                memberMail: invitationForm.email,
                subject: subject,
                message:invitationForm.message,
            }
        }

        try {
            const response = await this.apiProxy.mutate(apiHost, managedEnrollmentQuery, variables);
            const data = await response.json();

            if (data.error == true) {
                this.state = ERROR;
                this.message = MANAGED_ENROLLMENT_ERROR;
                return;
            }
            this.state = DONE
            this.showInvitationDrawer = false;
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
    showInvitationDrawer: observable,

    isLoading: computed,
    isDone: computed,
    isError: computed,

    createEnrollment: action,
    enrollMember: action,
})