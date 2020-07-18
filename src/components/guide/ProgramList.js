import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { List, Avatar, Spin, Result } from 'antd';

@observer
class ProgramList extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.programListStore.fetchPrograms();
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
                <Result status="warning" title={store.message.help}/>
            )
        }

        return (<></>)
    }

    render() {
        const store = this.props.programListStore;
        const programs = store.programs;

        return (
            <List
                dataSource={programs}
                renderItem={item => (
                    <List.Item key={item.program.fuzzyId}>
                        <List.Item.Meta
                            avatar={<Avatar src={item.program.avatar} />}
                            title={<a href="#">{item.program.name}</a>}
                            description={item.program.description}
                        />
                        <div>{this.getActive(item.program.active)}</div>
                    </List.Item>
                )}>
                {this.displayMessage()}
            </List>
        )
    }
}
export default ProgramList;