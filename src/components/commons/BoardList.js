import React, { Component } from 'react';
import { inject,observer } from 'mobx-react';

import { Spin, Result, Carousel, Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

import BoardListStore from "../stores/BoardListStore";
import MiniBoard from "./MiniBoard";

@inject("appStore")
@observer
class BoardList extends Component {

    constructor(props) {
        super(props);
        this.store = new BoardListStore({ apiProxy: props.appStore.apiProxy });
        this.store.load(props.sessionUserFuzzyId);
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
        if (boardCount == 0) {
            return <></>
        }

        const settings = {
            dots: false,
            infinite: true,
            slidesToShow: Math.min(2, boardCount),
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
                                <MiniBoard key={item.Ok} apiProxy={this.props.appStore.apiProxy} boardId={item.Ok} sessionUserFuzzyId={this.props.sessionUserFuzzyId} />
                            )
                        })}
                    </Carousel>
                </div>
                <Button key="forward" onClick={this.next} icon={<RightOutlined />} shape="square"></Button>
            </div>
        )
    }

    render() {
        const boards = this.store.boards;
        const boardCount = this.store.boardCount;

        return (
            <div>
                {this.renderSlider(boards, boardCount)}
                {this.displayMessage()}
            </div>
        )
    }
}
export default BoardList;