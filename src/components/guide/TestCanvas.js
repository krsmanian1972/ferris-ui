import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

@inject("appStore")
@observer
class TestCanvas extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>Harini</div>
        )
    }
}
export default TestCanvas;