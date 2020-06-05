/**
 * To create a connection with the Signaling Server.
 * 
 * To be modified to obtain the URL of the Signal Server.
 */
import io from 'socket.io-client';

const socket = io.connect("https://140265f24eac.ngrok.io");

export default socket;