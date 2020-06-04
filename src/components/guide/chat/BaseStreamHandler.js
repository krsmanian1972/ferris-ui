import _ from 'lodash';

/**
 * Base class for invoking the functions mapped against events.
 * The emit method shall be invoked 
 * 
 */
class BaseStreamHandler {
    constructor() {
        this.events = {};
    }

    /**
     * 
     * @param {*} event 
     * @param  {...any} args 
     */
    emit(event, ...args) {
        if (this.events[event]) {
            this.events[event].forEach((fn) => fn(...args));
        }
        return this;
    }

    on(event, fn) {
        if (this.events[event]) {
            this.events[event].push(fn);
        }
        else {
            this.events[event] = [fn];
        }
        return this;
    }

    off(event, fn) {
        if (event && _.isFunction(fn)) {
            const listeners = this.events[event];
            const index = listeners.findIndex((_fn) => _fn === fn);
            listeners.splice(index, 1);
        } 
        else {
            this.events[event] = [];
        }
        return this;
    }
}

export default BaseStreamHandler;