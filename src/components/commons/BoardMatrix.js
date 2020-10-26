import React, { Component } from 'react';
import { observer } from 'mobx-react';

import moment from 'moment';
import { toJS } from 'mobx'

import { Spin, Result, Typography, Tag, Card } from 'antd';

import NoteListStore from "../stores/NoteListStore";
import Reader from "../commons/Reader";
import JournalBoardListStore from "../stores/JournalBoardListStore"
import BoardList from "../commons/BoardList";
import { cardHeaderStyle } from '../util/Style';

const { Title } = Typography;
const DATE_PATTERN = 'DD-MMM-YYYY';

@observer
class BoardMatrix extends Component {

    constructor(props) {
        super(props);
        this.store = new JournalBoardListStore({ apiProxy: props.apiProxy });
    }

    componentDidMount() {
        this.store.fetchSessionUserIdList(this.props.memberId, this.props.programId);
    }

    countTag = (rowCount) => {
        if (this.store.isDone) {
            return <Tag color="#108ee9">{rowCount} Total</Tag>
        }

        if (this.store.isError) {
            return <Tag color="red">...</Tag>
        }
    }

    displayMatrix = (notes) => {
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
        console.log(toJS(this.store.people));
        return this.renderMatrix(notes);
    }


    renderMatrix = (peoples) => {
        return (
            <div className="Board-Matrix-container">
                {
                    peoples && peoples.map((people) => {
                        const key = `board_${people.event.session.id}`;
                        const key_cb = `board_${people.coach.sessionUser.id}`;
                        const key_ab = `board_${people.member.sessionUser.id}`;
                        return (
                            <div key={key} className="boards-matrix-item">
                                <p className="board-session">{people.event.session.name}</p>
                                <BoardList key={key_cb} title="Coach Boards" sessionUserId={people.coach.sessionUser.id} />
                                <BoardList key={key_ab} title="Actor Boards" sessionUserId={people.member.sessionUser.id} />
                            </div>
                        )
                    })
                }
            </div>
        )
    }

    render() {
      const people = this.store.people;
      return(
             <Card key="boards"
                 headStyle={cardHeaderStyle}
                 style={{ borderRadius: 12}}
                 title={<Title level={4}>Board from {people.length} sessions</Title>}>
                 {this.displayMatrix(people)}
             </Card>

      )
    }
}
export default BoardMatrix;
