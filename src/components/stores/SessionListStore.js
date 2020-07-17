import { decorate, observable, action } from 'mobx';
import moment from 'moment';
import { isBlank } from './Util';

import { apiHost } from './APIEndpoints';
import { eventsQuery } from './Queries';

const SLOT_SIZE = 36;

export default class SessionListStore {

    start = null;
    end = null;
    roster = null;

    constructor(props) {
        this.apiProxy = props.apiProxy;
    }

    /**
     * To be replaced with an API call
     * @param {} startDate 
     * @param {*} endDate 
     */
    fetchEvents = async (startDate, endDate) => {
        const userFuzzyId = this.apiProxy.getUserFuzzyId();

        const variables = {
            criteria: {
                userFuzzyId: userFuzzyId
            }
        }

        let events = [];

        try {
            const response = await this.apiProxy.query(apiHost, eventsQuery, variables);
            const data = await response.json();
            events =  data.data.getSessions;
        }
        catch (e) {
            console.log(e);
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
            return status;
        }

        const localeStart = moment(event.session.scheduledStart);
        const localeEnd = moment(event.session.scheduledEnd);
        const now = moment();

        if (now.isAfter(localeStart)) {
            status = "overdue"
        }
        else {
            status = now.isBetween(localeStart, localeEnd) ? "current" : status;
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
    start: observable,
    end: observable,
    roster: observable,
    buildRoster: action,
});
