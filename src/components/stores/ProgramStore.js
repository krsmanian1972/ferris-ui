import { decorate, observable, computed, action } from 'mobx';

import { apiHost,assetHost } from './APIEndpoints';
import { createProgramQuery, programsQuery, alterProgramStateQuery} from './Queries';

const INIT = "init";
const PENDING = 'pending';
const DONE = 'done';
const ERROR = 'error';


const EMPTY_MESSAGE = { status: "", help: "" };
const CREATION_ERROR = { status: "error", help: "Unable to create the program." };
const ACTIVATION_ERROR = { status: "error", help: "Unable to activate the program." };
const LOADING_ERROR = { status: "error", help: "Unable to load the program." };
const NO_MATCHING_RECORD = { status: "error", help: "Unable to find a matching program" };

export const PUBLIC_PROGRAM_INFO = "This program will be open for public enrollment after you activate this program. The program will be in draft till you activate it.";
export const PRIVATE_PROGRAM_INFO = "This program will be visible to you and to the members invited by you. The program will be in draft till you activate it."

export default class ProgramStore {

    state = INIT;
    message = EMPTY_MESSAGE;

    isPrivate = false;
    showDrawer=false;
    showActivationModal = false;
    showActivationResultModal = false;

    change = null;

    programId = null;
    programModel = null;

    editMode = false;

    constructor(props) {
        this.apiProxy = props.apiProxy;
        this.programListStore = props.programListStore;
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

    get isOwner() {
        return this.programModel && this.programModel.coach.id === this.apiProxy.getUserFuzzyId();
    }

    get isEnrolled() {
        return this.programModel && this.programModel.enrollmentStatus === "YES";
    }

    get isReadOnly() {
        if (!this.isOwner) {
            return true;
        }
        return !this.editMode
    }

    /**
     * Allow only the coach to activate this program
     */
    get canActivate() {
        if (this.state !== DONE) {
            return false;
        }
        return this.isOwner && !this.programModel.program.active;
    }

     /**
     * Allow only the coach to edit this program. 
     * Editing the content should be allowed even after the activation.
     */
    get canEdit() {
        if (this.state !== DONE) {
            return false;
        }
        return this.isOwner;
    }

    /**
     * Allow anyone other than the coach to enroll
     */
    get canEnroll() {
        if (this.state !== DONE) {
            return false;
        }
        if (this.isOwner) {
            return false;
        }
        return this.programModel.program.active && !this.isEnrolled;
    }


    reload = () => {
        this.load(this.programId)
    }

    populateDescription = async (programModel) => {

        this.state = PENDING;
        this.message = EMPTY_MESSAGE;
        const ver = new Date().getTime();
        
        const url = `${assetHost}/programs/${this.programId}/about/about.html?nocache=${ver}`;
        const response = await this.apiProxy.getAsync(url);
        const data = await response.text();

        if (response.status == 200) {
            programModel.program.description = data;
        }
    }

    load = async (programId) => {
        this.state = PENDING;
        this.message = EMPTY_MESSAGE;
        this.programModel = null;
        this.programId = programId;

        const userId = this.apiProxy.getUserFuzzyId();

        const variables = {
            criteria: {
                userId: userId,
                programId: programId,
                desire: "SINGLE"
            }
        }

        try {
            const response = await this.apiProxy.query(apiHost, programsQuery, variables);
            const data = await response.json();

            if (data.error == true) {
                this.state = ERROR;
                this.message = LOADING_ERROR;
                return;
            }

            const result = data.data.getPrograms.programs;
            if (result.length != 1) {
                this.state = ERROR;
                this.message = NO_MATCHING_RECORD;
                return;
            }
            
            const programModel = result[0]
            await this.populateDescription(programModel);

            this.programModel = programModel
            this.state = DONE;
        }

        catch (e) {
            this.state = ERROR;
            this.message = LOADING_ERROR;
            console.log(e);
        }
    }

    /**
     * Create New Program using the programRequest
     */
    createProgram = async (programRequest) => {

        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const variables = {
            input: {
                name: programRequest.name,
                description: programRequest.description,
                coachId: this.apiProxy.getUserFuzzyId(),
                isPrivate: this.isPrivate,
            }
        }

        try {
            const response = await this.apiProxy.mutate(apiHost, createProgramQuery, variables);
            const data = await response.json();

            if (data.error == true) {
                this.state = ERROR;
                this.message = CREATION_ERROR;
                return;
            }
            this.showDrawer = false;
            this.programModel = data;
            this.state = DONE;
            this.programListStore.fetchCoachPrograms();
        }
        catch (e) {
            this.state = ERROR;
            this.message = CREATION_ERROR;
            console.log(e);
        }
    }


    /**
     * Activate The Currently Loaded Program
     */
    activate = async () => {

        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const variables = {
            input: {
                id: this.programId,
                targetState: "ACTIVATE",
            }
        }

        try {
            const response = await this.apiProxy.mutate(apiHost, alterProgramStateQuery, variables);
            const data = await response.json();

            if (data.error == true) {
                this.state = ERROR;
                this.message = ACTIVATION_ERROR;
                return;
            }
            this.showActivationModal = false;
            this.showActivationResultModal = true;
            this.state = DONE;
            this.reload();
        }
        catch (e) {
            this.state = ERROR;
            this.message = ACTIVATION_ERROR;
            console.log(e);
        }
    }
}

decorate(ProgramStore, {
    state: observable,
    editMode: observable,
    message: observable,
    change:observable,
    isPrivate:observable,

    showDrawer:observable,
    showActivationModal: observable,
    showActivationResultModal: observable,
    
    programModel: observable,

    isLoading: computed,
    isDone: computed,
    isError: computed,

    isOwner: computed,
    isEnrolled: computed,
    canActivate: computed,
    canEnroll: computed,
    
    isReadOnly: computed,
    canEdit: computed,

    createProgram: action,
    load: action,
    reload: action,
    activate: action,
});