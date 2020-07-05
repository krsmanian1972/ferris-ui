import { sessionStore } from './SessionStore';
import moment from 'moment';

describe("Creating Hourly Slots", () => {
    it("should create an empty roster of 37 hours", () => {

        const { start, end, roster } = sessionStore.buildEmptyRoster();

        const rosterArr = Array.from(roster.keys());
        const size = rosterArr.length;
        const first = rosterArr[0];
        const last = rosterArr[size - 1];

        expect(start).toBe(first);
        expect(end).toBe(last);
        expect(size).toBe(37);
    });

    it("should fix the events into the respective slots", () => {

        const { start, end, roster } = sessionStore.buildEmptyRoster();

        const hour1 = start.hour();

        const date1 = moment.utc().set({ "hour": hour1, "minute": 0 });
        const date2 = moment.utc().set({ "hour": hour1 + 1, "minute": 0 });

        const events = [{
            "start": date1.toISOString(),
            "end": date2.toISOString(),
            "coach": "Gopal",
            "actor": "Raja",
            "sessionId": "25",
            "sessionDetail": "Memory Safety vs Memory Leaks",
            "status": "cancelled"
        },
        ];

        console.log(date1.toISOString());
        sessionStore.fixRoster(roster, events);
    })
});