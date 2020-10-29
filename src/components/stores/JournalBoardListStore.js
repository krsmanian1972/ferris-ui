import { decorate, observable, computed, action } from 'mobx';
import { apiHost } from './APIEndpoints';
import { notesQuery, enrollmentNotesQuery, sessionUsersQuery, getBoardsQuery } from './Queries'
import { isBlank } from './Util';
import SessionListStore from './SessionListStore'
import SessionStore from './SessionStore'
import { toJS } from 'mobx'
const PENDING = 'pending';
const DONE = 'done';
const ERROR = 'error';
const COACH = "coach";

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

    fetchBoardList = async(programId, userId) => {
        this.state = PENDING;
        this.message = EMPTY_MESSAGE;
        console.log("ProgramID", programId)
        const variables = {
            criteria: {
                programId: programId,
                userId: userId,
            }
        }
        try {
            const response = await this.apiProxy.query(apiHost, getBoardsQuery, variables);
            const data = await response.json();
            console.log(data)
            this.boards = data.data.getBoards.boards;
            this.boardResults = [];
            console.log("Board Length", this.boards.length)
            for (var i = 0; i < this.boards.length; i++){
                 console.log(i)
                  for(var j = 0; j < this.boards[i].urls.length; j++){
                    console.log(j)
                    this.boardResults.push({userSessionId: this.boards[i].sessionUser.id,
                      sessionName: this.boards[i].session.name, url:this.boards[i].urls[j],
                      userType: this.boards[i].sessionUser.userType,
                    });
                  }
            }

            console.log("This.boards on store", toJS(this.boards));
            this.state = DONE;

        }

        catch (e) {
            //this.state = ERROR;
            //this.message = LOADING_ERROR;
            console.log(e);
        }


    }
}

decorate(JournalBoardListStore, {
    state: observable,
    message: observable,

    boards: observable,
    boardResults:observable,
    rowCount: observable,
    isLoading: computed,
    isError: computed,
    isDone: computed,

    fetchBoardList:action
});
