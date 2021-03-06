import React, { Component } from 'react';
import { inject,observer } from 'mobx-react';

import { Spin, Result, Carousel, Button,Typography,Tag,Card } from 'antd';
import { LeftOutlined, RightOutlined,SmileOutlined } from '@ant-design/icons';

import BoardListStore from "../stores/BoardListStore";
import MiniBoard from "./MiniBoard";
import { cardHeaderStyle } from '../util/Style';

const { Title } = Typography;

@inject("appStore")
@observer
class BoardList extends Component {

    constructor(props) {
        super(props);
        this.store = new BoardListStore({ apiProxy: props.appStore.apiProxy });
        this.store.load(props.sessionId);
    }

    displayMessage = () => {

        if (this.store.isLoading) {
            return (
                <div className="loading-container">
                    <Spin />
                </div>
            )
        }

        if (this.store.isError) {
            return (
                <Result status="warning" title={this.store.message.help} />
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

    renderSlider = (boards, boardCount) => {
        if(this.store.isError) {
            return <></>
        }

        if (boardCount === 0) {
            return <Result icon={<SmileOutlined />}/>
        }

        const settings = {
            dots: false,
            infinite: true,
            slidesToShow: Math.min(1, boardCount),
            slidesToScroll: 1,
            swipeToSlide: true,
        };

        return (
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", textAlign: "center", alignItems: "center" }}>
                <Button key="back" onClick={this.previous} icon={<LeftOutlined />} shape="square"></Button>
                <div style={{ width: "94%" }}>
                    <Carousel ref={ref => (this.carousel = ref)} {...settings}>
                        {boards && boards.map(item => {
                            return (
                                <MiniBoard key={item.Ok} apiProxy={this.props.appStore.apiProxy} boardId={item.Ok} sessionId={this.props.sessionId} listType="session" />
                            )
                        })}
                    </Carousel>
                </div>
                <Button key="forward" onClick={this.next} icon={<RightOutlined />} shape="square"></Button>
            </div>
        )
    }
    /**
     * Provide the count Tag only if the store is in Done State
     */
    countTag = () => {
        if (this.store.isDone) {
            return <Tag color="#108ee9">{this.store.boardCount} Total</Tag>
        }

        if (this.store.isError) {
            return <Tag color="red">...</Tag>
        }
    }

    render() {
        const boards = this.store.boards;
        const boardCount = this.store.boardCount;

        return (
            <Card key="board"
                headStyle={cardHeaderStyle}
                style={{ borderRadius: 12,marginTop:10 }} title={<Title level={4}>{this.props.title} {this.countTag()}</Title>}>
                {this.renderSlider(boards, boardCount)}
                {this.displayMessage()}
            </Card>
        )
    }
}
export default BoardList;
