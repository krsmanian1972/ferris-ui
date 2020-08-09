import { decorate, observable, action, computed } from 'mobx';
import moment from 'moment';

import { isBlank } from './Util';
import { apiHost } from './APIEndpoints';
import { eventsQuery } from './Queries';

const SLOT_SIZE = 36;

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
            events =  data.data.getSessions;
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

        this.fixRoster(roster, events);

        this.start = start;
        this.end = end;
        this.roster = roster;
    }

    /**
     * Based on Local Time of the User
     */
    buildEmptyRoster = () => {
        const roster = new Map();

        const start = moment().subtract(6, 'hours');

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
    fixRoster = (roster, events) => {
        events.map(event => {
            const localeStart = moment(event.session.scheduleStart*1000);
            const localeEnd = moment(event.session.scheduleEnd*1000);
        
            for (let [key, value] of roster) {
                if (key.isBetween(localeStart, localeEnd)) {
                    event.session.band = this.getSlotBand(event);
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
    
    isDone:computed,
    isError:computed,
    isLoading:computed,
    
    buildRoster: action,
});
