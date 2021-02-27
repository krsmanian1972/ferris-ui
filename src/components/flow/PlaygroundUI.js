import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { Button, Row, Col, Typography, Tooltip, Space } from 'antd';
import { ScissorOutlined, CloseOutlined, AimOutlined, PlusOutlined } from '@ant-design/icons';

import CoinFlipGame from './CoinFlipGame';
import FlowComposer from './FlowComposer';

const { Title } = Typography;

// The Outer Paper
const playgroundStyle = {
    border: "1px solid black",
    borderRadius: "12px",
    maxHeight: window.innerHeight * 0.81,
    overflowY: "auto",
    display: "flex",
    flexDirection: "row"
}

const gameContainerStyle = {
    height: window.innerHeight * 0.81,
    width: window.innerWidth * 0.50,
};

const flowContainerStyle = {
    height: window.innerHeight * 0.81,
    width: window.innerWidth * 0.50,
};


@inject("appStore")
@observer
class PlaygroundUI extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {

        this.game = new CoinFlipGame(this.gameContainer,
            this.onGameMounted,
            this.onGameError,
        );

        this.flowComposer = new FlowComposer(this.flowContainer);

        this.buildTaskGraph()
    }

    buildTaskGraph = () => {

        const task0 = { id: 0, name: 'Start', roleId: "", demand: 0, min: 0, max: 0, coordinates: '{ "x": 0, "y": 3.5, "z": 0 }', taskType: 'START_STOP_BOX' };
        const task1 = { id: 1, name: 'Dough', roleId: "Gopal", demand: 15, min: 1, max: 2, coordinates: '{ "x": 0, "y": 2, "z": 0 }', taskType: '' };
        const task2 = { id: 2, name: 'Sphere', roleId: "Raja", demand: 15, min: 1, max: 2, coordinates: '{ "x": 0, "y": 0.5, "z": 0 }', taskType: '' };
        const task3 = { id: 3, name: 'Dough', roleId: "Guruji", demand: 15, min: 1, max: 2, coordinates: '{ "x": 0, "y": -1.0, "z": 0 }', taskType: '' };
        const task4 = { id: 4, name: 'Sphere', roleId: "ShivK", demand: 15, min: 1, max: 2, coordinates: '{ "x": 0, "y": -2.5, "z": 0 }', taskType: '' };
        const task5 = { id: 5, name: 'End', roleId: "", demand: 0, min: 0, max: 0, coordinates: '{ "x": 0, "y": -4, "z": 0 }', taskType: 'START_STOP_BOX' };

        const tasks = [task0, task1, task2, task3, task4, task5];

        this.flowComposer.populateTasks(tasks);

        this.flowComposer.linkBottomTop(0, 1);
        this.flowComposer.linkBottomTop(1, 2);
        this.flowComposer.linkBottomTop(2, 3);
        this.flowComposer.linkBottomTop(3, 4);
        this.flowComposer.linkBottomTop(4, 5);
    }

    /**
     * The Key of this Process is the combination of Name+"~"+Activity
     */
    onGameMounted = () => {
        this.game.setName("Gopal");
        this.game.setActivity("Dough");
        this.game.setBatchSize(15);  // The Demand of the Next Task
        this.game.setInventorySize(15);
        this.game.setAdvice("READY");
    }

    onGameError = () => {

    }


    render() {
        return (
            <div>
                <div key="playground" style={playgroundStyle}>
                    <div key="flowContainer" style={flowContainerStyle} id="flowContainer" ref={ref => (this.flowContainer = ref)} />
                    <div key="gameContainer" style={gameContainerStyle} id="gameContainer" ref={ref => (this.gameContainer = ref)} />
                </div>
            </div>
        )
    }
}

export default PlaygroundUI;