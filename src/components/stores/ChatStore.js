import { action, decorate, observable } from 'mobx';

export default class ChatStore {

    mode="camera";
    
    setMode = (mode) => {
        this.mode = mode;
    }
}

decorate(ChatStore, {
    mode: observable,
    setMode: action,
})