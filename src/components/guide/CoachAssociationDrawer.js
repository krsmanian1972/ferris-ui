import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Drawer, Typography } from 'antd';

import CoachAssociationForm from './CoachAssociationForm';

const { Text,Paragraph } = Typography;

@observer
class CoachAssociationDrawer extends Component {

    close = () => {
        this.props.programStore.showCoachAssociationDrawer = false;
    }

    getInfo = () => {
        return (
            <>
                <Text strong>Please Note:</Text>

                <Paragraph>
                    You are about to map another coach, as your peer coach, to render this program.
                </Paragraph>

                <Paragraph>
                    To preserve the identity of the people involved in the platform, 
                    we refrain from offering the typical "search the coach" capability.

                    Hence, you should provide the registered email of the coach.
                </Paragraph>

                <Paragraph>
                    We impose certain restrictions for the coach association:
                    <ul>
                        <li>
                            The email should correspond to a coach in the system.
                        </li>
                        <li>
                            The given coach should not be a member of this same program in the past.

                            Since it may lead to conflict in program-level privilege, we suggest to 
                            create a new user account and request us to tag the new user as a coach.

                            Then the email of the new user account can be used for this coach association.  
                        </li>
                        <li>
                            Obviously, to avoid duplicates, the given email should not already be mapped as 
                            a coach of this program.
                        </li>
                    </ul>
                </Paragraph>    
            </>
        )
    }

    render() {
        const store = this.props.programStore

        const title = "Associate a new coach to this program";

        return (
            <Drawer title={title} width={"55%"} closable={true} onClose={this.close} visible={store.showCoachAssociationDrawer} destroyOnClose>
                <CoachAssociationForm programStore={this.props.programStore}/>
                {this.getInfo()}
            </Drawer>
        );
    }
}
export default CoachAssociationDrawer