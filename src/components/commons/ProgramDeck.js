
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { Carousel } from 'antd';

import ProgramListStore from '../stores/ProgramListStore';
import ProgramStore from '../stores/ProgramStore';


@inject("appStore")
@observer
class ProgramDeck extends Component {
    constructor(props) {
        super(props);
        this.listStore = new ProgramListStore({ apiProxy: props.appStore.apiProxy });
        this.store = new ProgramStore({
            apiProxy: props.appStore.apiProxy,
            programListStore: this.listStore
        })
    }

    showProgramDetail = (programFuzzyId) => {
        const params = { programFuzzyId: programFuzzyId, parentKey: "programs" };
        this.props.appStore.currentComponent = { label: "Program Detail", key: "programDetail", params: params };
    }

   
    render() {
        return (

            <Carousel effect="fade">
                <div>
                    <h3>1</h3>
                </div>
                <div>
                    <h3>2</h3>
                </div>
                <div>
                    <h3>3</h3>
                </div>
                <div>
                    <h3>4</h3>
                </div>
            </Carousel>
        )
    }
}
export default ProgramDeck;
