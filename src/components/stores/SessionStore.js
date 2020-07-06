import { decorate, observable, flow, action } from 'mobx';

const PENDING = 'pending';
const DONE = 'done';
const ERROR = 'error';

export default class SessionStore {

    state = PENDING;

    showDrawer = false;
    sessionId = 0;

    constructor(props) {
        this.apiProxy = props.apiProxy;
        this.sessionListStore = props.sessionListStore;
    }
}

decorate(SessionStore, {
    showDrawer:observable,
    sessionId:observable
});