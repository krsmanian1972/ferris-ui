
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { Carousel } from 'antd';

import { assetHost } from '../stores/APIEndpoints';

import ProgramListStore from '../stores/ProgramListStore';
import ProgramStore from '../stores/ProgramStore';


@inject("appStore")
@observer
class ProgramBanner extends Component {
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
            <div style={{ textAlign: "center"}}>
                <div style={{display:"inline-block",verticalAlign:"middle"}}></div>
                <img style={{ maxWidth: "100%",maxHeight: "100%",verticalAlign:"middle", display:"inline-block" }} src={url} onClick={() => this.props.showProgramDetail(program.fuzzyId)} />
            </div>
        )
    }

    render() {

        const store = this.props.programListStore;
        const programs = store.programs;

        return (
                <Carousel dotPosition={"top"}>
                    {programs && programs.map(({program}) => {
                        return (
                            <div key={program.fuzzyId}>
                                {this.getProgramPoster(program)}
                            </div>
                        )
                    })}
                </Carousel>   
        )
    }
}
export default ProgramBanner;
