import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { Card, Typography, Space } from 'antd';

import ReactPlayer from 'react-player';

import ProgramListStore from './stores/ProgramListStore';

import { assetHost } from './stores/APIEndpoints';

import { cardHeaderStyle } from './util/Style';
import Paragraph from 'antd/lib/typography/Paragraph';

const { Text, Title } = Typography;


@inject("appStore")
@observer
class Premise extends Component {

    constructor(props) {
        super(props);
        this.listStore = new ProgramListStore({ apiProxy: props.appStore.apiProxy });

        this.refreshListStores();
    }

    refreshListStores = () => {
        this.listStore.fetchPlatformPrograms();
    }


    getName = (program) => {
        return (
            <Space>
                <Text style={{ textAlign: "center" }}>{program.name}</Text>
            </Space>
        )
    }

    getCoverUrl = (program) => {
        const url = `${assetHost}/programs/${program.parentProgramId}/cover/cover.png`;
        return url;
    }

    /**
     * An introduction to why we design this platform and what are
     * the key differentiators.
     */
    getPlatformIntro = () => {
        const url = `${assetHost}/platform/intro.mp4`;
        return (
            <Card
                headStyle={cardHeaderStyle}
                style={{ marginTop: "10px", marginBottom: "10px" }}
                title={<Title level={4}>Context is one of the key drivers for better collaboration</Title>}>

                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", textAlign: "center", alignItems: "center" }}>
                    <div style={{ width: "40%", marginRight: 10, textAlign: "left" }}>
                        <Paragraph>
                            As a coach your job involves collaborating with different teams at various points in time.
                        </Paragraph>
                        <Paragraph>
                            We feel that a platform that offers video conferencing and screen sharing capabilities alone
                            may not be adequate.
                        </Paragraph>
                        <Paragraph>
                            You as a coach need to have the context, of your teams and the individuals, when planning and getting prepared for future sessions.
                            Continuity and Context are some of the key drivers for every successful coaching and training engagement.
                        </Paragraph>
                        <Paragraph>
                            We are designing Ferris by considering many such functional drivers.
                        </Paragraph>
                        <Paragraph>
                            Ferris is our, progressive, attempt to assist you in few areas:
                        </Paragraph>
                        <Paragraph>
                            <ul>
                                <li>Scheduling and rendering virtual meetings with your teams along with Shared black-boards and experiential games</li>
                                <li>Scheduling, rendering and monitoring personalized coaching sessions to individuals</li>
                                <li>And most importantly journaling every session so that both the coach and the respective individuals access the notes and boards created during the meetings</li>
                            </ul>
                        </Paragraph>
                    </div>
                    <div style={{ width: "60%", textAlign: "left" }}>
                        <ReactPlayer width='100%' height='100%' controls url={url} />
                    </div>
                </div>
            </Card>
        )
    }

    /**
     * What is a Program from the stand point of a Coach and member
     *
     */
    getProgramIntro = () => {
        const url = `${assetHost}/platform/program.mp4`;
        return (
            <Card
                headStyle={cardHeaderStyle}
                style={{ marginTop: "10px", marginBottom: "10px" }}
                title={<Title level={4}>Program - A Coach View</Title>}>

                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", textAlign: "center", alignItems: "center" }}>
                    <div style={{ width: "60%", textAlign: "left" }}>
                        <ReactPlayer width='100%' height='100%' controls url={url} />
                    </div>

                    <div style={{ width: "40%", marginLeft: 10, textAlign: "left" }}>
                        <Paragraph>
                            Our humble definition of the word coach is "A person endeavors to pull an individual, team or an organization
                            from its current state to a high-potential state".
                        </Paragraph>

                        <Paragraph>
                            Hence the word coach in our dictionary includes; coach, mentor, trainer, doctor, architect, manager, your friend, YOU
                            and finally, anyone who is interested in your progress.
                        </Paragraph>

                        <Paragraph>
                            We call this great service as "Program". 
                        </Paragraph>

                        <Paragraph>
                            Program is a means for a coach to elaborate the offerings to the world.
                        </Paragraph>
                    </div>
                </div>
            </Card>
        )
    }


    render() {

        return (
            <div>
                {this.getPlatformIntro()}
                {this.getProgramIntro()}
            </div>
        )
    }
}
export default Premise;