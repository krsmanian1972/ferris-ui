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
import MiniBoardJournal from './MiniBoardJournal'
const { Title } = Typography;
const DATE_PATTERN = 'DD-MMM-YYYY';

@observer
class BoardMatrix extends Component {

    constructor(props) {
        super(props);
        this.store = new JournalBoardListStore({ apiProxy: props.apiProxy });
    }

    componentDidMount() {
        //this.store.fetchSessionUserIdList(this.props.memberId, this.props.programId);
        this.store.fetchBoardList( this.props.programId, this.props.memberId);
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
        return this.renderMatrix(this.store.boardResults);
    }


    renderMatrix = (boards) => {
        return (
            <div className="Board-Matrix-container">
                {
                    boards && boards.map((board) => {
                         const key = `board_${board.userSessionId}`;
                         const sessionUserId = `board_${board.userSesionId}`;
                         const urlBoard = board.url.slice(1, -1);
                         const boardId = urlBoard;
                         const cn = board.userType === 'coach' ? "coach-note" : "member-note";

                            return (
                                <div key={key} className="board-matrix-item">
                                    <p className={cn}>{board.sessionName} {board.userType} {boardId}</p>
                                    <MiniBoardJournal key={sessionUserId} apiProxy={this.props.apiProxy} boardId={boardId} sessionUserId={board.userSessionId} height={200}/>
                                </div>
                            )
                      }
                    )
                }
            </div>
        )
    }

    render() {
      const boards = this.store.boardResults;
      return(
             <Card key="boards"
                 headStyle={cardHeaderStyle}
                 style={{ borderRadius: 12}}
                 title={<Title level={4}>Board from sessions</Title>}>
                 {this.displayMatrix(boards)}
             </Card>

      )
    }
}
export default BoardMatrix;
