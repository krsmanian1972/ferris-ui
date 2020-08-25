import MockAPIProxy from './test_data/MockAPIProxy';
import { appStore } from './AppStore';
import SessionListStore from './SessionListStore';
import moment from 'moment';

describe("Creating Hourly Slots", () => {
    it("should create an empty roster of 36 hours", () => {

        const loginCredentials = require('./test_data/loginCredentials.test.json');
        const apiProxy = new MockAPIProxy(loginCredentials);
        appStore.apiProxy = apiProxy;
        const sessionListStore = new SessionListStore({ apiProxy: apiProxy });

        const { start, end, roster } = sessionListStore.buildEmptyRoster();

        const rosterArr = Array.from(roster.keys());
        const size = rosterArr.length;
        const first = rosterArr[0];
        const last = rosterArr[size - 1];

        expect(start).toBe(first);
        expect(end).toBe(last);
        expect(size).toBe(36);
    });

    it("should fix the given event within a given slot", () => {

        const sessionListStore = new SessionListStore({ apiProxy: undefined });

        // Create a Slot of 1 Hour
        const slotStart_1 = moment().startOf('hour');
        const slotEnd_1 = moment(slotStart_1).add(1, 'hours').subtract(1, 'minutes');

        // Create a Slot of 1 Hour
        const slotStart_2 = moment(slotStart_1).add(1, "hours");
        const slotEnd_2 = moment(slotStart_2).add(1, 'hours').subtract(1, 'minutes');

        // Create an Event after 15 minutes from the slot start and ends after 15 minutes
        const eventStart = moment(slotStart_1).add(15, "minutes");
        const eventEnd = moment(eventStart).add(15, "minutes");

        const flag_1 = sessionListStore.canAccomodate(slotStart_1, slotEnd_1, eventStart, eventEnd);
        expect(flag_1).toBe(true);

        const flag_2 = sessionListStore.canAccomodate(slotStart_2, slotEnd_2, eventStart, eventEnd);
        expect(flag_2).toBe(false);

    });

    it("should consider an event overlaps into two slots from between", () => {

        const sessionListStore = new SessionListStore({ apiProxy: undefined });

        // Create a Slot of 1 Hour
        const slotStart_1 = moment().startOf('hour');
        const slotEnd_1 = moment(slotStart_1).add(1, 'hours').subtract(1, 'minutes');

        // Create a Slot of 1 Hour
        const slotStart_2 = moment(slotStart_1).add(1, "hours");
        const slotEnd_2 = moment(slotStart_2).add(1, 'hours').subtract(1, 'minutes');

        // Create a Slot of 1 Hour
        const slotStart_3 = moment(slotStart_2).add(1, 'hours');
        const slotEnd_3 = moment(slotStart_3).add(1, 'hours').subtract(1, 'minutes');

        // Create an Event after 15 minutes from the slot start and ends after 15 minutes
        const overlapStart = moment(slotStart_1).add(45, "minutes");
        const overlapEnd = moment(overlapStart).add(30, "minutes");

        const flag_1 = sessionListStore.canAccomodate(slotStart_1, slotEnd_1, overlapStart, overlapEnd);
        expect(flag_1).toBe(true);


        const flag_2 = sessionListStore.canAccomodate(slotStart_2, slotEnd_2, overlapStart, overlapEnd);
        expect(flag_2).toBe(true);

        const flag_3 = sessionListStore.canAccomodate(slotStart_3, slotEnd_3, overlapStart, overlapEnd);
        expect(flag_3).toBe(false);

    });

    it("should handle perfect 1-hr slot", () => {

        const sessionListStore = new SessionListStore({ apiProxy: undefined });

        // Create a Slot of 1 Hour
        const slotStart_1 = moment().startOf('hour');
        const slotEnd_1 = moment(slotStart_1).add(1, 'hours').subtract(1, 'minutes');

        // Create a Slot of 1 Hour
        const slotStart_2 = moment(slotStart_1).add(1, "hours");
        const slotEnd_2 = moment(slotStart_2).add(1, 'hours').subtract(1, 'minutes');

        const eventStart = moment(slotStart_1);
        const eventEnd = moment(eventStart).add(1, 'hours');

        const flag_1 = sessionListStore.canAccomodate(slotStart_1, slotEnd_1, eventStart, eventEnd);
        expect(flag_1).toBe(true);

        const flag_2 = sessionListStore.canAccomodate(slotStart_2, slotEnd_2, eventStart, eventEnd);
        expect(flag_2).toBe(false);

    });


});