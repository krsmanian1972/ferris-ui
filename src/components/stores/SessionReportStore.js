import { decorate, observable, computed, action } from 'mobx';
import moment from 'moment';

import { apiHost } from './APIEndpoints';
import { eventsQuery } from './Queries';

const PENDING = 'pending';
const DONE = 'done';
const ERROR = 'error';
const INVALID = 'invalid';

const EMPTY_MESSAGE = { status: "", help: "" };
const ERROR_MESSAGE = { status: ERROR, help: "Unable to fetch sessions" };
const DATE_PATTERN = 'DD-MMM-YYYY';
const TIME_PATTERN = 'HH:mm';

export default class SessionReportStore {

    state = PENDING;
    message = EMPTY_MESSAGE;
    change = null;

    events = [];
    tableData = [];
    rowCount = 0;
    totalActualDuration = 0;
    totalPlannedDuration = 0;


    startTimeMsg = {};
    startTime = null;

    endTimeMsg = {};
    endTime = null;

    // Update these after the report is created.
    reportStartTime = null;
    reportEndTime = null;

    showDrawer = false;

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

    get isInvalid() {
        return this.state === INVALID;
    }

    /**
     * Being a computed method on two variables, we need to
     * trigger this when both the values are set.
     */
    get reportPeriod() {
        if (this.reportStartTime && this.reportEndTime) {
            const stDate = this.reportStartTime.format('DD-MMM-YYYY');
            const enDate = this.reportEndTime.format('DD-MMM-YYYY');

            return `${stDate}-${enDate}`;
        }
        return '';
    }

    /**
     * First show the user the historial report with a default range
     */
    generateDefaultReport = async (programId, userId) => {
        this.setDefaultPeriod();
        await this.fetchEvents(programId, userId);
    }

    generateReport = async (programId, userId, request) => {
        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        if (!this.isValid(request)) {
            this.state = INVALID;
            return;
        }

        await this.fetchEvents(programId, userId);
    }

    /**
     * Return the date and hour minutes 
     * @param {*} utcDate 
     */
    formatDate = (utcDate) => {
        const localeDate = moment(utcDate * 1000);
        const dt = localeDate.format(DATE_PATTERN);
        const hm = localeDate.format(TIME_PATTERN);
        return { dt: dt, hm: hm }
    }

    preferredDate = (planned_utc, actual_utc) => {
        if (actual_utc) {
            return this.formatDate(actual_utc);
        }
        return this.formatDate(planned_utc)
    }

    /**
     * Let us return zero when the session is not completed.
     * @param {*} session 
     */
    calcActualDuration = (session) => {
        if (session.actualEnd && session.actualStart) {
            const startDate = moment(session.actualStart * 1000);
            const endDate = moment(session.actualEnd * 1000);
            return startDate.diff(endDate, 'minutes');
        }
        return 0
    }

    /**
     * Transform the event we received from ferris into table data 
     */
    formatReport = () => {
        const table = []

        var totalActual = 0;
        var totalPlanned = 0;

        for (var i = 0; i < this.events.length; i++) {

            const event = this.events[i];

            var session = event.session;
            var program = event.program;

            var result = this.preferredDate(session.scheduleStart, session.actualStart);
            var duration = this.calcActualDuration(session);

            var rowData = {};
            rowData.key = i;
            rowData.id = session.id;
            rowData.date = result.dt;
            rowData.time = result.hm;
            rowData.programName = program.name;
            rowData.people = session.people;
            rowData.sessionName = session.name;
            rowData.status = session.status;
            rowData.plannedDuration = session.duration;
            rowData.actualDuration = duration;

            table.push(rowData);
            totalActual = totalActual+duration;
            totalPlanned = totalPlanned+session.duration;
        }

        this.tableData = table;
        this.rowCount = table.length;
        this.reportStartTime = this.startTime;
        this.reportEndTime = this.endTime;
        this.totalActualDuration = totalActual;
        this.totalPlannedDuration = totalPlanned;
        this.showDrawer = false;
    }

    /**
     * If ProgramId does not present let us request all the events
     * for the user.
     */
    getFilterCriteria = (programId,userId) => {

        const startDt = moment(this.startTime).format('YYYY-MM-DD');
        const endDt = moment(this.endTime).format('YYYY-MM-DD');
        
        let userFuzzyId = userId;

        if (!userFuzzyId) {
            userFuzzyId = this.apiProxy.getUserFuzzyId();
        }
  
        if (programId && programId.length > 1) {
            const variables = {
                criteria: {
                    userId: userFuzzyId,
                    programId: programId,
                    startDate: startDt,
                    endDate: endDt,
                }
            }
            return variables;
        }

        const variables = {
            criteria: {
                userId: userFuzzyId,
                startDate: startDt,
                endDate: endDt,
            }
        }
        return variables;
    }
    
    /**
    * Talk to ferris to fetch events matching the given criteria.
    * If we know the programId and the UserId together.
    */
    fetchEvents = async (programId, userId) => {

        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const variables = this.getFilterCriteria(programId,userId)
    
        try {
            const response = await this.apiProxy.query(apiHost, eventsQuery, variables);
            const data = await response.json();
            this.events = data.data.getEvents.sessions;
            this.formatReport();
            this.state = DONE;
        }
        catch (e) {
            this.state = ERROR;
            this.message = ERROR_MESSAGE;
        }
    }

    /**
     * 30 days before today
     */
    setDefaultPeriod = () => {

        const start = moment().subtract(15, 'days');
        const end = moment().add(15, 'days');

        this.startTimeMsg = EMPTY_MESSAGE;
        this.startTime = moment(start).startOf('day')

        this.endTimeMsg = EMPTY_MESSAGE;
        this.endTime = moment(end).startOf('day')
    }

    isValid = (request) => {

        this.validateStartDate(request.startTime);
        this.validateEndDate(request.endTime);

        return this.startTimeMsg.status !== ERROR && this.endTimeMsg.status !== ERROR
    }

    validateStartDate = (startDate) => {

        this.startTimeMsg = EMPTY_MESSAGE;
        this.startTime = startDate ? moment(startDate).startOf('day') : null;

        if (!this.startTime) {
            this.startTimeMsg = { status: ERROR, help: "Please provide a start date for the reporting period." };
            return;
        }

        if (!this.endTime) {
            return;
        }

        const flag = this.endTime >= this.startTime;

        if (!flag) {
            this.startTimeMsg = { status: ERROR, help: "The start date should be equal or earlier to the end date of the report." };
            return;
        }
    }

    validateEndDate = (endDate) => {

        this.endTimeMsg = EMPTY_MESSAGE;
        this.endTime = endDate ? moment(endDate).startOf('day') : null;

        if (!this.endTime) {
            this.endTimeMsg = { status: ERROR, help: "Please provide an end date for the reporting period." };
            return;
        }

        if (!this.startTime) {
            return;
        }

        const flag = this.endTime && this.endTime >= this.startTime;

        if (!flag) {
            this.endTimeMsg = { status: ERROR, help: "The end date should be later or equal to the start date of the report." };
        }
    }

    /**
     * As we are exposing a decorated, tableData, we need to
     * offer the actual event at the row index. 
     * @param {*} index 
     */
    eventAt = (index) => {
        return this.events[index];
    }

}

decorate(SessionReportStore, {
    state: observable,
    tableData: observable,
    rowCount: observable,
    change: observable,
    reportStartTime: observable,
    reportEndTime: observable,
    totalActualDuration: observable,
    totalPlannedDuration: observable,
    showDrawer: observable,

    isLoading: computed,
    isDone: computed,
    isError: computed,
    isInvalid: computed,
    reportPeriod: computed,

    fetchEvents: action,
    generateDefaultReport: action,
    generateReport: action,
    validateStartDate: action,
    validateEndDate: action,
    eventAt: action,
});
