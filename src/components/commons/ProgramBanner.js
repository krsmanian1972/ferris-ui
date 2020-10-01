
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { Carousel, Button,Card } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

import { assetHost } from '../stores/APIEndpoints';


@inject("appStore")
@observer
class ProgramBanner extends Component {
    constructor(props) {
        super(props);
    }


    getProgramBanner = (program) => {
        const url = `${assetHost}/programs/${program.id}/banner/banner.png`;
        return (
            <div style={{ textAlign: "center", height: 260 }}>
                <div style={{ display: "inline-block", verticalAlign: "middle", height: 260 }}></div>
                <img style={{ maxWidth: "100%", maxHeight: "100%", verticalAlign: "middle", display: "inline-block", borderRadius: "12px", cursor: 'pointer' }} src={url} onClick={() => this.props.showProgramDetail(program.id)} />
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
                                <div key={program.id}>
                                    {this.getProgramBanner(program)}
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
            <Card style={{ marginLeft: 10, marginRight: 10}}>
                {this.renderSlider(programs, store.rowCount)}
            </Card>
        )
    }
}
export default ProgramBanner;
