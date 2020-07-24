
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { Carousel } from 'antd';

import { assetHost } from '../stores/APIEndpoints';

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

    getProgramPoster = (program) => {
        const url = `${assetHost}/programs/${program.fuzzyId}/poster/poster.png`;
        return (
            <div style={{ textAlign: "center" }}>
                <img style={{ maxWidth: "100%",background:"black" }} src={url} onClick={() => this.props.showProgramDetail(program.fuzzyId)} />
            </div>
        )
    }

    render() {

        const store = this.props.programListStore;
        const programs = store.programs;

        return (
                <Carousel autoplay>
                    {programs && programs.map(item => {
                        return (
                            <div key={item.fuzzyId}>
                                {this.getProgramPoster(item)}
                            </div>
                        )
                    })}
                </Carousel>   
        )
    }
}
export default ProgramDeck;
