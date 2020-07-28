
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { Carousel, Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

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
            <div style={{ textAlign: "center" }}>
                <div style={{ display: "inline-block", verticalAlign: "middle" }}></div>
                <img style={{ maxWidth: "100%", maxHeight: "100%", verticalAlign: "middle", display: "inline-block" }} src={url} onClick={() => this.props.showProgramDetail(program.fuzzyId)} />
            </div>
        )
    }
    next = () => {
        this.carousel.next();
    }
    previous = () => {
        this.carousel.prev();
    }

    renderSlider = (programs, rowCount) => {
        if (rowCount == 0) {
            return <></>
        }

        const props = {
            dots: false,
            infinite: true,
            slidesToShow: 1,
            slidesToScroll: 1,
        };

        return (
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", textAlign: "center", alignItems: "center" }}>
                <Button key="back" onClick={this.previous} icon={<LeftOutlined />} shape="square"></Button>
                <div style={{ width: "94%" }}>
                    <Carousel ref={ref => (this.carousel = ref)} {...props}>
                        {programs && programs.map(({ program }) => {
                            return (
                                <div key={program.fuzzyId}>
                                    {this.getProgramPoster(program)}
                                </div>
                            )
                        })}
                    </Carousel>
                </div>
                <Button key="forward" onClick={this.next} icon={<RightOutlined />} shape="square"></Button>
            </div>
        )
    }

    render() {

        const store = this.props.programListStore;
        const programs = store.programs;

        return (
            <>
                {this.renderSlider(programs, store.rowCount)}
            </>
        )
    }
}
export default ProgramBanner;
