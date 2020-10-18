import React, { Component } from 'react';
import { observer } from 'mobx-react';

import moment from 'moment';

import { Spin, Result, Typography, Tag, Card } from 'antd';

import NoteListStore from "../stores/NoteListStore";
import Reader from "../commons/Reader";

import { cardHeaderStyle } from '../util/Style';

const { Title } = Typography;
const DATE_PATTERN = 'DD-MMM-YYYY';

@observer
class NoteMatrix extends Component {

    constructor(props) {
        super(props);
        this.store = new NoteListStore({ apiProxy: props.apiProxy });
    }

    componentDidMount() {
        this.store.fetchEnrollmentNotes(this.props.enrollmentId);
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

        return this.renderMatrix(notes);
    }


    renderMatrix = (notes) => {
        return (
            <div className="notes-matrix-container">
                {
                    notes && notes.map((note_item, index) => {
                        const key = `note_reader_${index}`;
                        const localeTime = moment(note_item.note.updatedAt * 1000);
                        const date = localeTime.format(DATE_PATTERN);
                        const cn = note_item.by === 'coach' ? "coach-note" : "member-note";
                        return (
                            <div key={key} className="notes-matrix-item">
                                <p className="notes-session">{note_item.session.name}</p>
                                <Reader value={note_item.note.description} height={200} />
                                <p className={cn}>{note_item.by} {date}</p>
                            </div>
                        )
                    })
                }
            </div>
        )
    }

    render() {
        const notes = this.store.notes;
        const rowCount = this.store.rowCount;

        return (
            <Card key="notes"
                headStyle={cardHeaderStyle}
                style={{ borderRadius: 12}}
                title={<Title level={4}>Notes {this.countTag(rowCount)}</Title>}>
                {this.displayMatrix(notes)}
            </Card>
        )
    }
}
export default NoteMatrix;