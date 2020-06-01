import React, { Component } from 'react';
import { inject,observer } from 'mobx-react';

@inject("appStore")
@observer
export default class Owner extends Component {
    render() {
        return (
            <div></div>
        )
    }
}