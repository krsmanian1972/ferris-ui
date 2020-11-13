import { observable, decorate, action, computed } from 'mobx';
import socket from '../stores/socket';

import { backendUrl } from './APIEndpoints';
import { apiHost } from './APIEndpoints';
import { getPendingDiscussionsQuery } from './Queries';

const INIT = "init";
const PENDING = 'pending';
const DONE = 'done';
const ERROR = 'error';

const DEFAULT_POLLING_TIME = 60000;
const EMPTY_MESSAGE = { status: "", help: "" };
const ERROR_MESSAGE = { status: "error", help: "Unable to fetch the Unread Feeds." };

export default class FeedStore {

    state = INIT;
    message = EMPTY_MESSAGE;

    feedCount = 0;

    // The Key is the sender's email and the value is an array of feeds
    feeds = new Map();

    constructor(props) {
        this.apiProxy = props.apiProxy;
        this.createSubscription();
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
    * The key of the map is the sender's email.
    * 
    * The value is an Array;
    *
    * @param {*} result
    */
    groupByUser = (result) => {
        const groupedResult = new Map();

        for (var i = 0; i < result.length; i++) {
            const item = result[i];
            const email = item.user.email;
            if (!groupedResult.has(email)) {
                groupedResult.set(email, []);
            }
            groupedResult.get(email).push(item);
        }

        return groupedResult;
    }

    /**
     * Return if the userId is not yet set and keep the state in INIT.
     * 
     */
    getFeedCount = async () => {

        const userId = this.apiProxy.getUserFuzzyId();

        if (!userId) {
            this.state = INIT;
            return;
        }

        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        try {
            const url = `${backendUrl}/feeds/${userId}`;
            const response = await this.apiProxy.getAsync(url);

            if (response.status === 404) {
                this.state = ERROR;
                this.feedCount = 0;
                return;
            }

            const data = await response.json();

            this.feedCount = data.Ok;
            this.state = DONE;
        }
        catch (e) {
            this.state = ERROR;
        }
    }

    fetchPendingFeeds = async () => {
        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const variables = {
            criteria: {
                id: this.apiProxy.getUserFuzzyId()
            }
        }

        try {
            const response = await this.apiProxy.query(apiHost, getPendingDiscussionsQuery, variables);
            const data = await response.json();
            const result = data.data.getPendingDiscussions.feeds;
            this.feeds = this.groupByUser(result)
            this.state = DONE;
        }
        catch (e) {
            this.state = ERROR;
            this.message = ERROR_MESSAGE;
            console.log(e);
        }
    }

    /**
     * The credentials may not be set or visible the moment immediately after the 
     * login. 
     * 
     * The call to the feed count API fails without the userId. 
     * 
     * So we won't make a call without the user id and will leave the state as INIT.
     * 
     * If the state remains in INIT, we can retry after 3 seconds.
     * 
     */
    startPolling = async () => {
        await this.getFeedCount();

        const pollingTime = this.state === INIT ? 3000 : DEFAULT_POLLING_TIME;

        setTimeout(() => this.startPolling(), pollingTime);
    }

    createSubscription = () => {
        socket.on("feedIn", (data) => this.handleFeed(data.feed));
    }

    handleFeed = (feed) => {
        this.feedCount = this.feedCount + 1;
        this.fetchPendingFeeds();
    }
}

decorate(FeedStore, {
    state: observable,
    message: observable,

    feedCount: observable,
    feeds: observable,

    isInit: computed,
    isLoading: computed,
    isDone: computed,
    isError: computed,

    getFeedCount: action,
    startPolling: action,
    fetchPendingFeeds: action,
});
