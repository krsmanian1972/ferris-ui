import { decorate, observable, action, computed } from 'mobx';
import moment from 'moment';

import { isBlank } from './Util';
import { apiHost } from './APIEndpoints';
import { eventsQuery,planEventsQuery } from './Queries';

const SLOT_SIZE = 35;

const INIT = "init";
const PENDING = 'pending';
const DONE = 'done';
const ERROR = 'error';

const EMPTY_MESSAGE = { status: "", help: "" };
const ERROR_MESSAGE = { status: ERROR, help: "We are very sorry, the service is unavailable at this moment. Please try again after some time." };


export default class SessionListStore {

    state = INIT;
    message = EMPTY_MESSAGE;

    start = null;
    end = null;
    roster = null;

    sessions = new Map();
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
     * The key of the map is Date.
     * The value is an Array;
     * 
     * @param {*} result 
     */
    groupByDate = (result) => {
        const groupedResult = new Map();

        for(var i=0;i<result.length;i++) {

            const event = result[i];
            
            const date = moment(event.session.scheduleStart*1000).format('DD-MMM-YYYY');

            if(!groupedResult.has(date)){
                groupedResult.set(date,[]);
            }

            groupedResult.get(date).push(event);
        }

        return groupedResult;
    }

    fetchProgramSessions = async(programId) => {

        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const userFuzzyId = this.apiProxy.getUserFuzzyId();

        const variables = {
            criteria: {
                programId: programId,
                userId: userFuzzyId
            }
        }

        try {
            const response = await this.apiProxy.query(apiHost, eventsQuery, variables);
            const data = await response.json();
            const result =  data.data.getEvents.sessions;
            this.sessions = this.groupByDate(result)
            this.rowCount = result.length;
            this.state = DONE;
        }
        catch (e) {
            this.state = ERROR;
            this.message = ERROR_MESSAGE;
        }
    }

    /**
     * @param {} startDate 
     * @param {*} endDate 
     */
    fetchEvents = async (startDate, endDate) => {

        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const userFuzzyId = this.apiProxy.getUserFuzzyId();

        const variables = {
            criteria: {
                userId: userFuzzyId
            }
        }

        let events = [];

        try {
            const response = await this.apiProxy.query(apiHost, eventsQuery, variables);
            const data = await response.json();
            events =  data.data.getEvents.sessions;
            this.state = DONE;
        }
        catch (e) {
            this.state = ERROR;
            this.message = ERROR_MESSAGE;
        }

        return events;
    }


    fetchPlanEventsQuery = async (startDate, endDate) => {

        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const userFuzzyId = this.apiProxy.getUserFuzzyId();

        const variables = {
            criteria: {
                userId: userFuzzyId
            }
        }

        let events = [];

        try {
            const response = await this.apiProxy.query(apiHost, planEventsQuery, variables);
            const data = await response.json();
            events =  data.data.getPlanEvents.planRows;
            this.state = DONE;
        }
        catch (e) {
            this.state = ERROR;
            this.message = ERROR_MESSAGE;
        }

        return events;
    }

    buildRoster = async () => {
        const { start, end, roster } = this.buildEmptyRoster();

        const events = await this.fetchEvents(start, end);
        this.fixSessionRoster(roster, events);

        const planEvents = await this.fetchPlanEventsQuery(start,end);
        this.fixPlanRoster(roster,planEvents);

        this.start = start;
        this.end = end;
        this.roster = roster;
    }

    /**
     * Based on Local Time of the User
     */
    buildEmptyRoster = () => {
        const roster = new Map();

        const start = moment().startOf('hour').subtract(6, 'hours');

        var aDate = start;
        roster.set(aDate, []);

        for (var i = 0; i < SLOT_SIZE; i++) {
            aDate = moment(aDate).add(1, 'hours');
            roster.set(aDate, []);
        }

        return { start: start, end: aDate, roster: roster };
    }

    getSlotBand = (event) => {
        var status = event.session.status;

        if (!isBlank(status)) {
            return status.toLowerCase();
        }

        const localeStart = moment(event.session.scheduleStart*1000);
        const localeEnd = moment(event.session.scheduleEnd*1000);

        const now = moment();

        if (now.isAfter(localeStart)) {
            status = "overdue"
        }
        else {
            status = now.isBetween(localeStart, localeEnd) ? "progress" : status;
        }

        return status;
    }

    /**
     * The events are marked in utc time. 
     * 
     * We receive the the Number of Leap Seconds from the server.
     *  
     * Hence we need to translate the time in seconds to local time 
     * in order to fix into the respective event slot.
     * 
     * We wrot an inefficient for-loop to find the matching SLOTS 
     * for the event.
     * 
     * @param {*} roster 
     * @param {*} events 
     */
    fixSessionRoster = (roster, events) => {
        events.map(event => {
            const eventStart = moment(event.session.scheduleStart*1000);
            const eventEnd = moment(event.session.scheduleEnd*1000);
            event.session.band = this.getSlotBand(event);

            for (let [key, value] of roster) {
                const slotStart = key;
                const slotEnd = moment(key).add(1,'hours').subtract(1,'minutes');

                if (this.canAccomodate(slotStart,slotEnd,eventStart,eventEnd)) {
                    value.push(event);
                }
            }
        })
    }

    canAccomodate = (slotStart,slotEnd,eventStart,eventEnd) => {
        return (eventStart.isBetween(slotStart, slotEnd) || eventEnd.isBetween(slotStart,slotEnd) || slotStart.isBetween(eventStart,eventEnd,undefined,"[)"));
    }

    fixPlanRoster = (roster, events) => {
        events.map(event => {
            
            if(!event.task) {
                return;
            }

            const item = event.task

            const eventStart = moment(item.scheduleStart*1000);
            const eventEnd = moment(item.scheduleEnd*1000);

            for (let [key, value] of roster) {
                const slotStart = key;
                const slotEnd = moment(key).add(1,'hours').subtract(1,'minutes');

                if (this.canAccomodate(slotStart,slotEnd,eventStart,eventEnd)) {
                    value.push(event);
                }
            }
        })
    }
}

decorate(SessionListStore, {
    state:observable,
    message: observable,

    start: observable,
    end: observable,
    roster: observable,

    sessions:observable,
    rowCount:observable,
    
    isDone:computed,
    isError:computed,
    isLoading:computed,
    
    buildRoster: action,
    fetchProgramSessions: action,
});
