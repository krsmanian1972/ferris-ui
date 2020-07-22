import React, { Component } from 'react';
import { inject,observer } from 'mobx-react';

import {PageHeader, Tooltip, Card, Button,Statistic} from 'antd';
import { PlusCircleOutlined,RocketOutlined,MailOutlined,PhoneOutlined} from '@ant-design/icons';
import { Typography} from 'antd';
import CurrentSessionPlan from './CurrentSessionPlan';

const { Title, Paragraph, Text } = Typography;

import ProgramStore from '../stores/ProgramStore';

import EnrollmentDrawer from './EnrollmentDrawer';

import {assetHost} from '../stores/APIEndpoints';

@inject("appStore")
@observer
class ProgramDetailUI extends Component {

    constructor(props) {
        super(props);
        this.store = new ProgramStore({
            apiProxy: props.appStore.apiProxy,
        })

        this.store.load(props.params.programFuzzyId);
    }

    getCoverUrl = (programFuzzyId) => {
        return `${assetHost}/programs/${programFuzzyId}/poster/poster.png`;
    }

    getProgramPoster = () => {
        const programFuzzyId = this.props.params.programFuzzyId;
        const posterUrl = `url(${this.getCoverUrl(programFuzzyId)})`
        const style= {
            backgroundImage: posterUrl,
            backgroundRepeat:"no-repeat",
            backgroundSize: "contain",
            backgroundPosition: "center",
            height:450,
        }
        return style;
    }

    newEnrollment = () => {
       this.store.showDrawer=true; 
    }

    activate = () => {

    }
    
    getTrailerUrl = () => {
        const programFuzzyId = this.props.params.programFuzzyId;
        return `${assetHost}/programs/${programFuzzyId}/cover/cover.png`;
    }

    render() {
        return (
            <>
                <PageHeader title={<Title level={3}>Be Happy</Title>}
                    extra={[
                        <Tooltip key="new_enrollment_tip" title="To enroll a member into this program.">
                            <Button key="newEnrollment" onClick={this.newEnrollment} type="primary" icon={<PlusCircleOutlined/>}>Enroll</Button>
                        </Tooltip>,

                        <Tooltip key="new_activation_tip" title="To activate this program, if you are the Coach.">
                            <Button key="activateProgram" onClick={this.activate} type="primary" icon={<RocketOutlined/>}>Activate</Button>
                        </Tooltip>,

                    ]}>
                </PageHeader>

                <Card>
                    <Card.Meta description="About" style={{ marginBottom: 10 }} />
                    <Paragraph>
                        Rust is proving to be a productive tool for collaborating among large teams of developers with varying levels of systems programming knowledge. Low-level code is prone to a variety of subtle bugs, which in most other languages can be caught only through extensive testing and careful code review by experienced developers. 
                    </Paragraph>    
                </Card>

                <div key="programPoster" style={this.getProgramPoster()}></div> 

                <Card>
                    <Statistic title="Coach" value="Gopal Sankaran" valueStyle={{ color: '#3f8600' }} />
                    <Paragraph><MailOutlined /> gopals@pmpowerxx.com</Paragraph>
                    <Paragraph><PhoneOutlined /> (91)99999 99999</Paragraph>
                </Card>
 
                <Card>
                    <Card.Meta description="Outcome" style={{ marginBottom: 10 }} />
                    <Paragraph>
                        Rust is for people who crave speed and stability in a language. By speed, we mean the speed of the programs that you can create with Rust and the speed at which Rust lets you write them. The Rust compiler’s checks ensure stability through feature additions and refactoring. This is in contrast to the brittle legacy code in languages without these checks, which developers are often afraid to modify. By striving for zero-cost abstractions, higher-level features that compile to lower-level code as fast as code written manually, Rust endeavors to make safe code be fast code as well.
                    </Paragraph>
                    <Paragraph>    
                        The Rust language hopes to support many other users as well; those mentioned here are merely some of the biggest stakeholders. Overall, Rust’s greatest ambition is to eliminate the trade-offs that programmers have accepted for decades by providing safety and productivity, speed and ergonomics. Give Rust a try and see if its choices work for you.
                    </Paragraph>    
                </Card>

                <Card>
                    <Card.Meta description="Milestones" style={{ marginBottom: 10, paddingBottom: 10 }} />
                    <CurrentSessionPlan/>   
                </Card>
               
                <Card>
                    <Card.Meta description="Trailers from coach" style={{ marginBottom: 10 }} />
                    <Card 
                            style={{height:180,width:326,border:'1px solid lightgray'}}
                            cover={<img alt="cover" style={{border:"1px solid lightgray", height:180,width:326}} src={this.getTrailerUrl()}/>}>
                    </Card>
                </Card>

                <EnrollmentDrawer programStore = {this.store}/>    
            </>    
        )
    }
}
export default ProgramDetailUI;
