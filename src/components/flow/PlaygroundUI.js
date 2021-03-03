import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { Typography } from 'antd';
import { AimOutlined } from '@ant-design/icons';

import ModhakamMakingGame from './ModhakamMakingGame';
import FlowComposer from './FlowComposer';

const { Title } = Typography;

// The Outer Paper
var playgroundStyle = {
    border: "1px groove white",
    width: "100%",
    overflowY: "auto",
    display: "flex",
    flexDirection: "row"
}

var gameContainerStyle = {
    height: 0,
    marginRight: 1
};

var flowContainerStyle = {
    maxHeight: 0,
    overflowY: "auto",
};

@inject("appStore")
@observer
class PlaygroundUI extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isShowFlow:true
        }
    }

    componentDidMount() {

        this.game = new ModhakamMakingGame(this.gameContainer,
            this.onGameMounted,
            this.onGameEvent,
        );

        this.flowComposer = new FlowComposer(this.flowContainer);
        this.buildTaskGraph()
    }

    buildTaskGraph = () => {

        const task0 = { id: 0, name: 'Start', roleId: "", demand: 0, min: 0, max: 0, coordinates: '{ "x": 0, "y": 3.5, "z": 0 }', taskType: 'START_STOP_BOX' };
        const task1 = { id: 1, name: 'Dough', roleId: "Gopal", demand: 15, min: 1, max: 2, coordinates: '{ "x": 0, "y": 2, "z": 0 }', taskType: '' };
        const task2 = { id: 2, name: 'Pooranam', roleId: "Raja", demand: 15, min: 1, max: 2, coordinates: '{ "x": 0, "y": 0.5, "z": 0 }', taskType: '' };
        const task3 = { id: 3, name: 'Modhakam', roleId: "Guruji", demand: 15, min: 1, max: 2, coordinates: '{ "x": 0, "y": -1.0, "z": 0 }', taskType: '' };
        const task4 = { id: 4, name: 'Dispatch', roleId: "Harini", demand: 15, min: 1, max: 2, coordinates: '{ "x": 0, "y": -2.5, "z": 0 }', taskType: '' };
        const task5 = { id: 5, name: 'End', roleId: "", demand: 0, min: 0, max: 0, coordinates: '{ "x": 0, "y": -4, "z": 0 }', taskType: 'START_STOP_BOX' };

        const tasks = [task0, task1, task2, task3, task4, task5];

        this.flowComposer.populateTasks(tasks);

        this.flowComposer.linkBottomTop(0, 1);
        this.flowComposer.linkBottomTop(1, 2);
        this.flowComposer.linkBottomTop(2, 3);
        this.flowComposer.linkBottomTop(3, 4);
        this.flowComposer.linkBottomTop(4, 5);
    }


    onGameEvent = (gameEvent) => {
        if (gameEvent.type === "lever" && gameEvent.id === "flow") {
            this.toggleFlow();
        }
    }


    /**
     * The Key of this Process is the combination of Name+"~"+Activity
     */
    onGameMounted = () => {
        this.game.setName(this.props.username);
        this.game.setActivity("Dough");
        this.game.setBatchSize(15);  // The Demand of the Next Task
        this.game.setInventorySize(15);
        this.game.setAdvice("READY");

        const gameStream = this.game.getGameCanvas().captureStream();
        this.props.onGameStream(gameStream);
    }


    toggleFlow = () => {
        const flag = this.state.isShowFlow;
        this.setState({ isShowFlow: !flag });
    }

    componentDidUpdate() {
        this.game.handleWindowResize();
        this.flowComposer.handleWindowResize();
    }

    render() {

        const fcWidth = this.state.isShowFlow?"40%":"0%";
        const gcWidth = this.state.isShowFlow?"60%":"100%";

        const pgStyle = { ...playgroundStyle, maxHeight: this.props.height };
        const gcStyle = { ...gameContainerStyle, height: this.props.height,width:gcWidth };
        const fcStyle = { ...flowContainerStyle, maxHeight: this.props.height,width:fcWidth };

        return (
            <div style={pgStyle} key="playground">
                <div style={fcStyle} key="flowContainer" id="flowContainer" ref={ref => (this.flowContainer = ref)} />
                <div style={gcStyle} key="gameContainer" id="gameContainer" ref={ref => (this.gameContainer = ref)} />
            </div>
        )   
    }
}

export default PlaygroundUI;