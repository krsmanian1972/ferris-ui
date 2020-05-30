import React, { Component } from 'react';
import { inject } from 'mobx-react';
import { Carousel } from 'antd';


@inject("appStore")
class HomeUI extends Component {
    constructor(props) {
        super(props);
    }
    

    members = () => {
        return (
            <Carousel autoplay>
                <div>
                    <h3>1</h3>
                </div>
                <div>
                    <h3>2</h3>
                </div>
                <div>
                    <h3>3</h3>
                </div>
                <div>
                    <h3>4</h3>
                </div>
          </Carousel>
        )
    }

    render() {
        return (
            <div>
                {this.members()}
            </div>    
        )
    }
}

export default HomeUI
