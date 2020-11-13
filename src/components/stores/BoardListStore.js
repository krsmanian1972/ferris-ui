import { decorate, observable, computed,action } from 'mobx';

import { assetHost } from '../stores/APIEndpoints';

const PENDING = 'pending';
const DONE = 'done';
const ERROR = 'error';

const EMPTY_MESSAGE = { status: "", help: "" };
const ERROR_MESSAGE = { status: "error", help: "Unable to fetch the Boards." };

export default class BoardListStore {

    state = PENDING;
    message = EMPTY_MESSAGE;

    boards = [];
    boardCount=0;

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
     * Obtain the List of Boards for the given sessionUserFuzzyId
     *
     */
    load = async(sessionUserId) => {

        this.state  = PENDING;
        this.message = EMPTY_MESSAGE;

        try {

            const url = `${assetHost}/boards/${sessionUserId}`;
            const response = await this.apiProxy.getAsync(url);
            if(response.status === 404) {
                this.state = DONE;
                this.boards = [];
                this.boardCount = 0;
                return;
            }
            const data = await response.json();
            this.boards = data;
            this.boardCount = data.length;
            this.state = DONE;
        }
        catch (e) {
            this.state = ERROR;
        }
    }

}

decorate(BoardListStore,{
    state:observable,
    message: observable,

    boards:observable,
    boardCount:observable,

    isLoading:computed,
    isError:computed,
    isDone:computed,

    load:action,
});
