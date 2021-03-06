import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { Spin, Result, Typography, Tag, Card } from 'antd';

import { cardHeaderStyle } from '../util/Style';

import JournalBoardListStore from "../stores/JournalBoardListStore"

import MiniBoard from './MiniBoard';

const { Title } = Typography;

@observer
class BoardMatrix extends Component {

    constructor(props) {
        super(props);
        this.store = new JournalBoardListStore({ apiProxy: props.apiProxy });
    }

    componentDidMount() {
        this.store.fetchBoardList(this.props.programId, this.props.memberId);
    }

    countTag = (rowCount) => {
        if (this.store.isDone) {
            return <Tag color="#108ee9">{rowCount} Total</Tag>
        }

        if (this.store.isError) {
            return <Tag color="red">...</Tag>
        }
    }

    displayMatrix = (boards) => {
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
        return this.renderMatrix(boards);
    }


    renderMatrix = (boards) => {
        return (
            <div>
                {
                    boards && boards.map((board,index) => {
                        const key = `div_board_${index}`;
                        const boardKey = `board_${index}`;
                        const boardId = board.url.slice(1, -1);
    
                        return (
                            <div key={key} className="board-matrix-item">
                                <div className="journal-boards">
                                    <p className="journal-board-title">{board.sessionName}</p>
                                    <p>{boardId}</p>
                                </div>
                                <MiniBoard key={boardKey} apiProxy={this.props.apiProxy} boardId={boardId} sessionId={board.sessionId} listType="matrix" />
                            </div>
                        )
                    })
                }
            </div>
        )
    }

    render() {
        const boards = this.store.boardResults;
        return (
            <Card key="boards"
                headStyle={cardHeaderStyle}
                style={{ borderRadius: 12 }}
                title={<Title level={4}>Boards</Title>}>
                {this.displayMatrix(boards)}
            </Card>

        )
    }
}
export default BoardMatrix;
