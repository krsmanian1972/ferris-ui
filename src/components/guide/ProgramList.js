import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { Spin, Result, Carousel, Typography, Button,Tag,Space } from 'antd';

import { assetHost } from '../stores/APIEndpoints';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

const { Text } = Typography;

@observer
class ProgramList extends Component {

    constructor(props) {
        super(props);
    }


    getName = (program) => {
        if(program.active) {
            return <Text style={{ textAlign: "center" }}>{program.name}</Text>
        }

        return (
            <Space>
                <Text style={{ textAlign: "center" }}>{program.name}</Text>
                <Tag color="geekblue">Draft</Tag>
            </Space>
        )    
            
    }
    getActive = (flag) => {
        if (flag) {
            return 'Active';
        }
        return 'Inactive';
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
        return `${assetHost}/programs/${program.fuzzyId}/cover/cover.png`;
    }
    
    renderSlider = (programs,rowCount) => {
        if(rowCount == 0){
            return <></>
        }

        const props = {
            dots: false,
            infinite: true,
            slidesToShow: Math.min(3, rowCount),
            slidesToScroll: 1,
        };

        return (
            <div style={{display: "flex", flexDirection: "row", justifyContent:"center", textAlign:"center", alignItems:"center"}}>
                <Button key="back" onClick={this.previous} icon={<LeftOutlined />} shape="square"></Button>
                <div style={{ width: "94%" }}>
                    <Carousel ref={ref => (this.carousel = ref)} {...props}>
                        {programs && programs.map(({ program }) => {
                            return (
                                <div key={program.fuzzyId} style={{ display: "flex", flexDirection: "column" }}>
                                    <div style={{ textAlign: "center", height: 175, marginRight: 10, marginLeft: 10, }} onClick={() => this.props.showProgramDetail(program.fuzzyId)}>
                                        <div style={{ display: "inline-block", verticalAlign: "middle", height: 175 }}></div>
                                        <img style={{ maxHeight: "100%", maxWidth: "100%", verticalAlign: "middle", display: "inline-block" }} src={this.getCoverUrl(program)} />
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

        return (
            <div>
                {this.renderSlider(programs,store.rowCount)}
                {this.displayMessage()}
            </div>
        )
    }
}
export default ProgramList;