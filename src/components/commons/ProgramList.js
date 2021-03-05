import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { Spin, Result, Carousel, Typography, Button,Space,Tooltip } from 'antd';
import { LeftOutlined, RightOutlined, LockOutlined } from '@ant-design/icons';

import { assetHost } from '../stores/APIEndpoints';

const { Text } = Typography;

@observer
class ProgramList extends Component {

    constructor(props) {
        super(props);
        this.state = { imageBorder: "none" }
    }

    getIcon = (program) => {
        if (program.isPrivate === true) {
            return (
                <Tooltip title="This is a Private Program.">
                    <LockOutlined />
                </Tooltip>
            )
        }
        return <></>
    }

    getName = (program) => {
        return (
            <Space>
                {this.getIcon(program)}
                <Text style={{ textAlign: "center" }}>{program.name}</Text>
            </Space>
        )
    }

    displayMessage = () => {
        const store = this.props.programListStore;

        if (store.isLoading) {
            return (
                <div className="loading-container">
                    <Spin />
                </div>
            )
        }

        if (store.isError) {
            return (
                <Result status="warning" title={store.message.help} />
            )
        }

        return (<></>)
    }

    next = () => {
        this.carousel.next();
    }

    previous = () => {
        this.carousel.prev();
    }

    getCoverUrl = (program) => {
        const url = `${assetHost}/programs/${program.parentProgramId}/cover/cover.png`;
        return url;
    }


    renderSlider = (programs, rowCount) => {
        if (rowCount === 0) {
            return <></>
        }

        const props = {
            dots: false,
            infinite: true,
            slidesToShow: Math.min(3, rowCount),
            slidesToScroll: 1,
            swipeToSlide: true,
        };

        return (
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", textAlign: "center", alignItems: "center" }}>
                <Button key="back" onClick={this.previous} icon={<LeftOutlined />} shape="square"></Button>
                <div style={{ width: "94%" }}>
                    <Carousel ref={ref => (this.carousel = ref)} {...props}>
                        {programs && programs.map(({ program }) => {
                            return (
                                <div key={program.id} style={{ display: "flex", flexDirection: "column" }}>
                                    <div style={{ textAlign: "center", height: 175, marginRight: 10, marginLeft: 10, cursor: 'pointer', border: this.state.imageBorder }} onClick={() => this.props.showProgramDetail(program.id)}>
                                        <div style={{ display: "inline-block", verticalAlign: "middle", height: 175 }}></div>
                                        <img alt={program.name} style={{ maxHeight: "100%", maxWidth: "100%", verticalAlign: "middle", display: "inline-block", border: this.state.imageBorder, borderRadius: "12px" }} src={this.getCoverUrl(program)} />
                                    </div>
                                    {this.getName(program)}
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

        // eslint-disable-next-line
        const change = store.change;

        return (
            <div>
                {this.renderSlider(programs, store.rowCount)}
                {this.displayMessage()}
            </div>
        )
    }
}
export default ProgramList;