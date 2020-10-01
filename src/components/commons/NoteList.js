import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { Spin, Result, Carousel, Button, Typography, Tag,Card } from 'antd';
import { LeftOutlined, RightOutlined, SmileOutlined } from '@ant-design/icons';

import NoteListStore from "../stores/NoteListStore";
import Reader from "../commons/Reader";
import { cardHeaderStyle } from '../util/Style';

const { Title } = Typography;

@inject("appStore")
@observer
class NoteList extends Component {

    constructor(props) {
        super(props);
        this.store = new NoteListStore({ apiProxy: props.appStore.apiProxy });
        this.store.load(props.sessionUserId, props.closingNotes);
    }

    next = () => {
        this.carousel.next();
    }

    previous = () => {
        this.carousel.prev();
    }

    displayMessage = () => {
        const store = this.store;

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

    countTag = () => {
        if (this.store.isDone) {
            return <Tag color="#108ee9">{this.store.rowCount} Total</Tag>
        }

        if (this.store.isError) {
            return <Tag color="red">...</Tag>
        }
    }

    renderNote = (note, index) => {
        const key = `note_reader_${index}`;
        return (
            <div key={key} className="notes">
                <Reader value={note.description} height={200} />
            </div>
        )
    }

    renderSlider = (notes, rowCount) => {

        if (this.store.isError) {
            return <></>
        }

        if (rowCount == 0) {
            return <Result icon={<SmileOutlined />}  />
        }

        const props = {
            dots: false,
            infinite: true,
            slidesToShow: Math.min(2, rowCount),
            slidesToScroll: 1,
            swipeToSlide: true,
        };

        return (
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", textAlign: "center", alignItems: "center" }}>
                <Button key="back" onClick={this.previous} icon={<LeftOutlined />} shape="square"></Button>
                <div style={{ width: "94%" }}>
                    <Carousel ref={ref => (this.carousel = ref)} {...props}>
                        {notes && notes.map((note, index) => {
                            return (
                                this.renderNote(note, index)
                            )
                        })}
                    </Carousel>
                </div>
                <Button key="forward" onClick={this.next} icon={<RightOutlined />} shape="square"></Button>
            </div>
        )
    }

    render() {
        const notes = this.store.notes;
        const rowCount = this.store.rowCount;

        return (
            <Card key="notes" 
                headStyle = {cardHeaderStyle}
                style={{ borderRadius: 12,marginTop:10 }} 
                title={<Title level={4}>{this.props.title} {this.countTag()}</Title>}>
                {this.renderSlider(notes, rowCount)}
                {this.displayMessage()}
            </Card>
        )
    }

}

export default NoteList;