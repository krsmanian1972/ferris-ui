import { decorate, observable, action } from 'mobx';
import moment from 'moment';
import { isBlank } from './Util';

const SLOT_SIZE = 36;

class SessionStore {

    start = null;
    end = null;
    roster = null;

    constructor() {
 
    }

    /**
     * To be replaced with an API call
     * @param {} startDate 
     * @param {*} endDate 
     */
    getEvents = (startDate, endDate) => {
        return require("../stores/test_data/sessions.test.json");
    }

    buildRoster = async () => {
        const { start, end, roster } = this.buildEmptyRoster();
        const events = this.getEvents();

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
        var status = event.status;

        if (!isBlank(status)) {
            return status;
        }

        const localeStart = moment(event.start);
        const localeEnd = moment(event.end);
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
     * The events are marked in utc time, hence it should be translated to
     * local to fix into the event.
     * 
     * @param {*} roster 
     * @param {*} events 
     */
    fixRoster = (roster, events) => {
        events.map(event => {
            for (let [key, value] of roster) {

                const localeStart = moment(event.start);
                const localeEnd = moment(event.end);

                if (key.isBetween(localeStart, localeEnd)) {
                    event.band = this.getSlotBand(event);
                    value.push(event);
                }
            }
        })
    }
}

decorate(SessionStore, {
    start:observable,
    end:observable,
    roster:observable,
    buildRoster:action,
});

export const sessionStore = new SessionStore();