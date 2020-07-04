import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import Moment from 'react-moment';
import moment from 'moment';
import 'moment-timezone';

const SLOT_SIZE = 36;

@inject("appStore")
@observer
class TodaySessions extends Component {
    constructor(props) {
        super(props);
    }

    /**
     * To be replaced with an API call
     * @param {} startDate 
     * @param {*} endDate 
     */
    getEvents = (startDate,endDate) => {
        return require("../stores/test_data/sessions.test.json");
    }

    format = (date) => {
        return date.format("DD") + "->" + moment(date).format("hh A");
    }

    eventAt = (aDate, events) => {
        return (
            <div>
                <p>Gopal Vs Raja</p>
            </div>
        )
    }

    buildSlots = (dates, events) => {
        return (
            dates.map(aDate => {
                return (
                    <p>{this.format(aDate)}</p>
                )
            })
        )
    }


    getHourlySlots = () => {
        const hours = [];
        const start = moment(new Date()).subtract(6, 'hours');

        var aDate = start;
        hours.push(aDate);

        for (var i = 0; i < SLOT_SIZE; i++) {
            aDate = moment(aDate).add(1, 'hours');
            hours.push(aDate);
        }

        return hours;
    }

    render() {

        const dates = this.getHourlySlots();
        const startDate = dates[0];
        const endDate = dates[dates.length - 1];
        const events = this.getEvents(startDate, endDate);
        console.log(events);

        return (
            <>
                {this.testSpan()}
            </>
        )
    }

    testSpan = () => {
        return (
            <div className="container">

                <div className="slot">
                    <div className="slot-hour">
                        <div style={{fontWeight:"bold",height:"70%",display:"flex", alignItems:"center", justifyContent:"center"}}>99:99 pm</div>
                        <div style={{fontWeight:"normal",height:"30%",display:"flex", alignItems:"center", justifyContent:"center"}}>31-Jul</div>
                    </div>
                    <div className="slot-detail">
                        <div className="slot-item">
                            <p style={{fontWeight:"bold",marginBottom:'3px'}}>Gopal and Raja</p>
                            <p style={{margin:'2px'}}>Session on Traits. This is the second session on this subject.</p>
                        </div>
                        <div className="slot-item">
                            <p style={{fontWeight:"bold",marginBottom:'3px'}}>Gopal and Raja</p>
                            <p style={{margin:'2px'}}>Session on Traits. This is the second session on this subject.</p>
                        </div>
                    </div>
                </div>

                <div className="slot">
                    <div className="slot-hour">
                        <div style={{fontWeight:"bold",height:"70%",display:"flex", alignItems:"center", justifyContent:"center"}}>99:99 pm</div>
                        <div style={{fontWeight:"normal",height:"30%",display:"flex", alignItems:"center", justifyContent:"center"}}>31-Jul</div>
                    </div>
                    <div className="slot-detail">
                    </div>
                </div>

                <div className="slot">
                    <div className="slot-hour">
                        <div style={{fontWeight:"bold",height:"70%",display:"flex", alignItems:"center", justifyContent:"center"}}>99:99 pm</div>
                        <div style={{fontWeight:"normal",height:"30%",display:"flex", alignItems:"center", justifyContent:"center"}}>31-Jul</div>
                    </div>
                    <div className="slot-detail">
                        <div className="slot-item">
                            <p style={{fontWeight:"bold",marginBottom:'3px'}}>Gopal and Raja</p>
                            <p style={{margin:'2px'}}>Session on Traits. This is the second session on this subject.</p>
                        </div>
                    </div>
                </div>
               
            </div>
        );
    }
}

export default TodaySessions