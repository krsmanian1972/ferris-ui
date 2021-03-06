import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Tag } from 'antd';
import socket from '../stores/socket';

function PeerStatus({ fuzzyId }) {

    const PING_INTERVAL = 6000;
    const [status, setStatus] = useState('wait...');

    useEffect(() => {
        socket.on('answer', (data) => {
                if (data && data.fuzzyId === fuzzyId) {
                    setStatus(data.ans);
                }
            });
        
        return function cleanup() {} 
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            socket.emit('ding', { fuzzyId: fuzzyId });
        }, PING_INTERVAL);

        return () => clearInterval(interval);

    }, []);

    return (
        <Tag color={status==='ok' ? "#87d068" : ''}>
            {status==='ok'? 'Available': status==='no' ? 'Yet to join' : status}
        </Tag>
    )
}

PeerStatus.propTypes = {
    fuzzyId: PropTypes.string.isRequired,
};

export default PeerStatus;