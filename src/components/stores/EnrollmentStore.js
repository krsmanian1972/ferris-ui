import { decorate, observable, computed, action } from 'mobx';
import { apiHost } from './APIEndpoints';
import { createEnrollmentQuery, managedEnrollmentQuery } from './Queries';

const INIT = "init";
const PENDING = 'pending';
const DONE = 'done';
const ERROR = 'error';

const EMPTY_MESSAGE = { status: "", help: "" };
const ENROLLMENT_ERROR = { status: "error", help: "It seems you have already enrolled in this program or in a similar program offered by a different coach." };
const MANAGED_ENROLLMENT_ERROR = { status: "error", help: "It seems the member have already enrolled in this program offered either by you or by a peer coach." };

export default class EnrollmentStore {

    state = INIT;
    message = EMPTY_MESSAGE;

    selectedCoach = null
    selectedProgram = null;
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
     * Let us be specific about the choice of the member.
     * Specific -> The Coach and the Program
     * 
     * @param {*} parentProgramId 
     */
    createEnrollment = async () => {
        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const variables = {
            input: {
                coachId: this.selectedCoach.id,
                programId: this.selectedProgram.id,
                userId: this.apiProxy.getUserFuzzyId(),
            }
        }

        try {
            const response = await this.apiProxy.mutate(apiHost, createEnrollmentQuery, variables);
            const data = await response.json();
            const result = data.data.createEnrollment;

            if (result.errors && result.errors.length > 0) {
                this.state = ERROR;
                this.message = ENROLLMENT_ERROR;
                this.showEnrollmentModal = false;
                this.showResultModal = false;
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
    enrollMember = async (programId, invitationForm, subject) => {
        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const variables = {
            input: {
                programId: programId,
                coachId: this.apiProxy.getUserFuzzyId(),
                memberMail: invitationForm.email,
                subject: subject,
                message: invitationForm.message,
            }
        }

        try {
            const response = await this.apiProxy.mutate(apiHost, managedEnrollmentQuery, variables);
            const data = await response.json();
            const result = data.data.managedEnrollment;
            if (result.errors && result.errors.length > 0) {
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