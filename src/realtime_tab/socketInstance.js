import SockJS from 'sockjs-client';
import Stomp from 'stompjs';


    let socket = new SockJS("https://abskrt-backend.azurewebsites.net/gs-guide-websocket");
    var stompClient;
    export default stompClient;//= Stomp.over(socket);