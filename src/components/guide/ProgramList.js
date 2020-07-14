import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { List, Avatar, Spin } from 'antd';

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


    render() {
        const store = this.props.programListStore;
        const programs = store.programs;
        const loading = store.isLoading;

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
                )}
            >
                {loading && (
                    <div>
                        <Spin />
                    </div>
                )}
            </List>
        )
    }
}
export default ProgramList;