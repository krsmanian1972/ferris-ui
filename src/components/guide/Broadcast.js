import React, { Component  } from 'react';
import { inject } from 'mobx-react';

@inject("appStore")
class Broadcast extends Component {

    render() {
        return (
            <div>
                <p>The Broadcaster goes here!!!</p>
            </div>
        )
    }
}
export default Broadcast