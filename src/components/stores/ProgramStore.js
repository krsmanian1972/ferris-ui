import { decorate, observable, computed, action } from 'mobx';

import { apiHost, assetHost } from './APIEndpoints';
import { createProgramQuery, programsQuery, programCoachesQuery, associateCoachQuery, alterProgramStateQuery } from './Queries';

const INIT = "init";
const PENDING = 'pending';
const DONE = 'done';
const ERROR = 'error';


const EMPTY_MESSAGE = { status: "", help: "" };
const CREATION_ERROR = { status: "error", help: "Unable to create the program." };
const ACTIVATION_ERROR = { status: "error", help: "Unable to activate the program." };
const LOADING_ERROR = { status: "error", help: "Unable to load the program." };
const NO_MATCHING_RECORD = { status: "error", help: "Unable to find a matching program" };
const COACH_ASSOCIATION_ERROR = { status: "error", help: "Unable to associate the coach into this program." };
const NO_COACH_FOUND = {status: "error", help: "Unable to fetch the coaches of this program. Please write to admin."};

export const PUBLIC_PROGRAM_INFO = "This program will be open for public enrollment after you activate this program. The program will be in draft till you activate it.";
export const PRIVATE_PROGRAM_INFO = "This program will be visible to you and to the members invited by you. The program will be in draft till you activate it."

export default class ProgramStore {

    state = INIT;
    message = EMPTY_MESSAGE;

    isPrivate = false;
    showDrawer = false;
    showActivationModal = false;
    showActivationResultModal = false;

    change = null;

    programId = null;
    programModel = null;
    peerCoaches = null;

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

    get isParentProgram() {
        return this.programModel && this.programModel.isParent;
    }

    get isOwner() {
        return this.isParentProgram && this.programModel.coach.id === this.apiProxy.getUserFuzzyId();
    }

    get isPeerCoach() {

        if(!this.peerCoaches) {
            return false;
        }

        const userId = this.apiProxy.getUserFuzzyId();
        
        for(let i=0;i<this.peerCoaches.length;i++) {
            let aCoach = this.peerCoaches[i];
            if(aCoach.id === userId) {
                return true;
            }
        }

        return false;
    }


    get isEnrolled() {
        return this.programModel && this.programModel.enrollmentStatus === "YES";
    }

    get isReadOnly() {
        if (!this.isOwner) {
            return true;
        }
        if (!this.isParentProgram) {
            return true;
        }
        return !this.editMode
    }

    /**
     * Allow only the owner, of the Parent program, to activate this program
     */
    get canActivate() {
        if (this.state !== DONE) {
            return false;
        }
        return this.isOwner && !this.programModel.program.active;
    }

    /**
    * Allow only the coach to edit this program AND the program should be
    * a parent program.
    *  
    * Editing the content should be allowed even after the activation.
    */
    get canEdit() {
        if (this.state !== DONE) {
            return false;
        }
        return this.isOwner && this.isParentProgram;
    }

    /**
     * Allow anyone to enroll, except the coaches of the program.
     */
    get canEnroll() {
        if (this.state !== DONE) {
            return false;
        }
        if(this.isPeerCoach) {
            return false;
        }
        return this.programModel.program.active && !this.isEnrolled;
    }


    reload = () => {
        this.load(this.programId)
    }

    /**
     * Load the list of all the coaches who are common to the 
     * parent program and the spawned programs. 
     * 
     * The common denominator is the parent program id that is guaranteed to be
     * resolved at the service side.
     * 
     * Hence let us just pass the programId.
     */
    fetchPeerCoaches = async () => {

        this.state = PENDING;
        this.message = EMPTY_MESSAGE;
        this.peerCoaches = [];

        const variables = { programId: this.programId };

        try {
            const response = await this.apiProxy.query(apiHost, programCoachesQuery, variables);
            const data = await response.json();

            if (data.error == true) {
                this.state = ERROR;
                this.message = LOADING_ERROR;
                return;
            }

            const result = data.data.getProgramCoaches.coaches;
            if (result.length === 0) {
                this.state = ERROR;
                this.message = NO_COACH_FOUND;
                return;
            }

            this.peerCoaches = result;
            this.state = DONE;
        }
        catch (e) {
            this.state = ERROR;
            this.message = LOADING_ERROR;
            console.log(e);
        }
    }

    populateDescription = async (programModel) => {

        const ver = new Date().getTime();
        const parentProgramId = programModel.program.parentProgramId;

        const url = `${assetHost}/programs/${parentProgramId}/about/about.html?nocache=${ver}`;
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

            const programModel = result[0];

            await this.populateDescription(programModel);

            this.programModel = programModel
            this.state = DONE;

            await this.fetchPeerCoaches();
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
     * Admin of a Program can associate another coach to spawn a child program.
     * 
     * The pre-requisite is that the admin should know the email id 
     * of the registered peer-coach.
     */
    associateCoach = async (coachRequest) => {
        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const variables = {
            input: {
                peerCoachEmail: coachRequest.email,
                programId: this.programId,
                adminCoachId: this.apiProxy.getUserFuzzyId(),
            }
        }

        try {
            const response = await this.apiProxy.mutate(apiHost, associateCoachQuery, variables);
            const data = await response.json();

            if (data.error == true) {
                this.state = ERROR;
                this.message = CREATION_ERROR;
                return;
            }
            this.state = DONE;

            await this.fetchPeerCoaches();
            this.showDrawer = false;
        }
        catch (e) {
            this.state = ERROR;
            this.message = COACH_ASSOCIATION_ERROR;
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
    change: observable,
    isPrivate: observable,

    showDrawer: observable,
    showActivationModal: observable,
    showActivationResultModal: observable,

    programModel: observable,
    peerCoaches: observable,

    isLoading: computed,
    isDone: computed,
    isError: computed,

    isParentProgram: computed,
    isOwner: computed,
    isPeerCoach: computed,
    isEnrolled: computed,

    canActivate: computed,
    canEnroll: computed,
    isReadOnly: computed,
    canEdit: computed,

    createProgram: action,
    associateCoach: action,
    fetchPeerCoaches: action,
    activate: action,
    load: action,
    reload: action,
});