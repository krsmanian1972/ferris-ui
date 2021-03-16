import { decorate, observable, computed, action } from 'mobx';
import { apiHost } from './APIEndpoints';
import { getBoardsQuery } from './Queries'

const PENDING = 'pending';
const DONE = 'done';
const ERROR = 'error';

const EMPTY_MESSAGE = { status: "", help: "" };
const ERROR_MESSAGE = { status: "error", help: "Unable to fetch the Boards." };

export default class JournalBoardListStore {

    state = PENDING;
    message = EMPTY_MESSAGE;

    boards = [];
    rowCount = 0;
    people = [];
    boardResults = [];

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

    entryForUrl = (boards) => {

        const entries = [];

        for (var i = 0; i < boards.length; i++) {
            let session = boards[i].session;
            let urls = boards[i].urls;
        
            let artifactId = session.sessionType === "multi" ? session.conferenceId : session.id;
            let sessionName = session.name;
        
            for (var j = 0; j < urls.length; j++) {
                entries.push({
                    sessionId: artifactId,
                    sessionName: sessionName, 
                    url: urls[j],
                });
            }
        }

        this.boardResults = entries;
        this.rowCount = entries.length;
    }

    /**
     * When we fetch the board we should be careful about boards at the conference level
     * @param {*} programId 
     * @param {*} userId 
     */
    fetchBoardList = async (programId, userId) => {
        this.state = PENDING;
        this.message = EMPTY_MESSAGE;

        const variables = {
            criteria: {
                programId: programId,
                userId: userId,
            }
        }
        try {
            const response = await this.apiProxy.query(apiHost, getBoardsQuery, variables);
            const data = await response.json();
            const boards = data.data.getBoards.boards;

            this.entryForUrl(boards);
            
            this.state = DONE;
        }

        catch (e) {
            this.state = ERROR;
            this.message = ERROR_MESSAGE;
        }
    }
}

decorate(JournalBoardListStore, {
    state: observable,
    message: observable,

    boardResults: observable,
    rowCount: observable,
    
    isLoading: computed,
    isError: computed,
    isDone: computed,

    fetchBoardList: action
});
