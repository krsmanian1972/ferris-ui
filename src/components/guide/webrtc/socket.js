/**
 * To create a connection with the Signaling Server.
 * 
 * To be modified to obtain the URL of the Signal Server.
 */
import io from 'socket.io-client';

//const socket = io.connect("https://f8e63f9eb0e3.ngrok.io");
const socket = io.connect("http://localhost:3001");

export default socket;