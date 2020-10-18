import { decorate, observable, action, computed } from 'mobx';
import moment from 'moment';

import { isBlank } from './Util';
import { apiHost } from './APIEndpoints';
import { eventsQuery, planEventsQuery } from './Queries';

const SLOT_SIZE = 35;

const INIT = "init";
const PENDING = 'pending';
const DONE = 'done';
const ERROR = 'error';

const EMPTY_MESSAGE = { status: "", help: "" };
const ERROR_MESSAGE = { status: ERROR, help: "We are very sorry, the service is unavailable at this moment. Please try again after some time." };

const DATE_PATTERN = 'YYYY-MM-DD';

export default class SessionListStore {

    state = INIT;
    message = EMPTY_MESSAGE;

    start = null;
    end = null;
    roster = null;

    sessions = new Map();
    rowCount = 0;
    selection = {};

    constructor(props) {
        this.apiProxy = props.apiProxy;
    }

    get isInit() {
        return this.state === INIT;
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

        for (var i = 0; i < result.length; i++) {

            const event = result[i];

            const date = moment(event.session.scheduleStart * 1000).format('DD-MMM-YYYY');

            if (!groupedResult.has(date)) {
                groupedResult.set(date, []);
            }

            groupedResult.get(date).push(event);
        }

        return groupedResult;
    }

    fetchProgramSessions = async (programId, userId, selection) => {

        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const variables = {
            criteria: {
                programId: programId,
                userId: userId,
            }
        }

        try {
            const response = await this.apiProxy.query(apiHost, eventsQuery, variables);
            const data = await response.json();
            const result = data.data.getEvents.sessions;
            this.sessions = this.groupByDate(result)
            this.rowCount = result.length;
            this.selection = selection;
            this.state = DONE;
        }
        catch (e) {
            this.state = ERROR;
            this.message = ERROR_MESSAGE;
            this.selection = selection;
            console.log(e);
        }
    }

    /**
     * @param {} startDate
     * @param {*} endDate
     */
    fetchEvents = async (startTime, endTime) => {

        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const userFuzzyId = this.apiProxy.getUserFuzzyId();
        const startDate = moment(startTime).format('YYYY-MM-DD');
        const endDate = moment(endTime).format('YYYY-MM-DD');

        const variables = {
            criteria: {
                userId: userFuzzyId,
                startDate: startDate,
                endDate: endDate,
            }
        }

        let events = [];

        try {
            const response = await this.apiProxy.query(apiHost, eventsQuery, variables);
            const data = await response.json();
            events = data.data.getEvents.sessions;
            this.state = DONE;
        }
        catch (e) {
            this.state = ERROR;
            this.message = ERROR_MESSAGE;
        }

        return events;
    }


    fetchPlanEventsQuery = async (startTime, endTime) => {

        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const userFuzzyId = this.apiProxy.getUserFuzzyId();
        const startDate = moment(startTime).format('YYYY-MM-DD');
        const endDate = moment(endTime).format('YYYY-MM-DD');

        const variables = {
            criteria: {
                userId: userFuzzyId,
                startDate: startDate,
                endDate: endDate,
            }
        }

        let events = [];

        try {
            const response = await this.apiProxy.query(apiHost, planEventsQuery, variables);
            const data = await response.json();
            events = data.data.getPlanEvents.planRows;
            this.state = DONE;
        }
        catch (e) {
            this.state = ERROR;
            this.message = ERROR_MESSAGE;
        }

        return events;
    }

    /**
     * From Yesterday and Five Days after.
     *
     */
    getWeekRange = (refDate) => {

        const dayBefore = moment(refDate).subtract(1, "days")

        const range = [];
        range.push(dayBefore.format(DATE_PATTERN));
        range.push(refDate.format(DATE_PATTERN));

        for (var i = 1; i < 6; i++) {
            var date = moment(refDate).add(i, "days");
            range.push(date.format(DATE_PATTERN));
        }

        return range
    }

    /**
     * The seven days of the Grid Period.
     *
     * Hours are in Row
     * The Days are column
     *
     *
     * @param {*} dates
     */
    buildEmptyWeekGrid = (dateRange) => {

        const hourMap = new Map();

        for (var row = 0; row < 24; row++) {

            var dayMap = new Map();
            for (var day = 0; day < 7; day++) {

                // Every Cell is made up of 4 Quarter
                var cell = new Map();
                cell.set(0, new Map());
                cell.set(15, new Map());
                cell.set(30, new Map());
                cell.set(45, new Map());

                dayMap.set(dateRange[day], cell)
            }

            var hourKey = row + 1;
            hourMap.set(hourKey, dayMap);
        }

        return hourMap;
    }

    fixWeeklyRoster = (weeklyRoster, events) => {

        for (var i = 0; i < events.length; i++) {

            const event = events[i].session;

            const localeStart = moment(event.scheduleStart * 1000);
            const localeEnd = moment(event.scheduleEnd * 1000);

            while (localeStart < localeEnd) {

                const hour = parseInt(localeStart.format('HH'));
                const min = parseInt(localeStart.format('mm'));
                const date = localeStart.format(DATE_PATTERN);

                const row = weeklyRoster.get(hour);
                var hourCell = row.get(date);
                var minCell = hourCell.get(min);
                minCell.set(event.id, event);

                localeStart.add(15, 'minutes');
            }
        }
    }

     /**
     * The 7 days are relative to the date before the given date.
     *
     * Pass a moment object to the refDate.
     */
    buildWeeklyRoster = async (refDate) => {
        console.log("Build Weekly");
        const range = this.getWeekRange(refDate);

        const weeklyRoster = this.buildEmptyWeekGrid(range);
        console.log("Range");
        console.log(range);
        const events = await this.fetchEvents(range[0], range[6]);
        console.log("Events");
        console.log(events);
        this.fixWeeklyRoster(weeklyRoster, events);
        //console.log(weeklyRoster);
        return { range: range, roster: weeklyRoster };
    }

    buildRoster = async () => {
        const { start, end, roster } = this.buildEmptyRoster();

        const events = await this.fetchEvents(start, end);
        this.fixSessionRoster(roster, events);

        const planEvents = await this.fetchPlanEventsQuery(start, end);
        this.fixPlanRoster(roster, planEvents);

        this.start = start;
        this.end = end;
        this.roster = roster;
    }


    /**
     * Based on Local Time of the User
     */
    buildEmptyRoster = () => {
        const roster = new Map();

        const start = moment().startOf('hour').subtract(3, 'hours');

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

        const localeStart = moment(event.session.scheduleStart * 1000);
        const localeEnd = moment(event.session.scheduleEnd * 1000);

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
            const eventStart = moment(event.session.scheduleStart * 1000);
            const eventEnd = moment(event.session.scheduleEnd * 1000);
            event.session.band = this.getSlotBand(event);

            for (let [key, value] of roster) {
                const slotStart = key;
                const slotEnd = moment(key).add(1, 'hours').subtract(1, 'minutes');

                if (this.canAccomodate(slotStart, slotEnd, eventStart, eventEnd)) {
                    value.push(event);
                }
            }
        })
    }

    canAccomodate = (slotStart, slotEnd, eventStart, eventEnd) => {
        return (eventStart.isBetween(slotStart, slotEnd) || eventEnd.isBetween(slotStart, slotEnd) || slotStart.isBetween(eventStart, eventEnd, undefined, "[)"));
    }

    fixPlanRoster = (roster, events) => {
        events.map(event => {

            if (!event.task) {
                return;
            }

            const item = event.task

            const eventStart = moment(item.scheduleStart * 1000);
            const eventEnd = moment(item.scheduleEnd * 1000);

            for (let [key, value] of roster) {
                const slotStart = key;
                const slotEnd = moment(key).add(1, 'hours').subtract(1, 'minutes');

                if (this.canAccomodate(slotStart, slotEnd, eventStart, eventEnd)) {
                    value.push(event);
                }
            }
        })
    }
}

decorate(SessionListStore, {
    state: observable,
    message: observable,

    start: observable,
    end: observable,
    roster: observable,

    sessions: observable,
    rowCount: observable,
    selection: observable,

    isInit: computed,
    isDone: computed,
    isError: computed,
    isLoading: computed,

    buildRoster: action,
    fetchProgramSessions: action,
    buildWeeklyRoster: action,
});
