const { _log } = require('../helper'); 
const EventEmitter = require('events');
const { managersReport } = require('./managers-report');
const { notificationTimer, timeExtend, cancelTimer } = require('./operation/operation-time');
const { checkDBStructure } = require('./db-structure');
const socketServer = require('websocket').server;

const msgEmitter = new EventEmitter();
let wsServer;
let wsConnection;

const initSocketServer = (httpServer) => {
  wsServer = new socketServer({
    httpServer: httpServer,
  });


  wsServer.on('request', (request) => {

    console.log("A client connected to the websocket");
    wsConnection = request.accept(null, request.origin);
    
    // wsConnection.send(JSON.stringify({Greetings: "Hello there young blood"}));

    wsConnection.on('message', async (message) => {

      const parsedObject =  JSON.parse(message.utf8Data)
      
      try {
        
        if(parsedObject.type == "Notification"){
          console.log("Entered the notification");
          console.log(parsedObject);
          
          const {type}= parsedObject.payload;

          switch(type){
            case 'Operation':
              notificationTimer(wsConnection, parsedObject.payload);
            break;
            case 'Extension':
              timeExtend(wsConnection, parsedObject.payload);
            break;
          }
          
        }
        if(parsedObject.type == "ZRead"){
          console.log("Entered the Zread");
          await notificationTimer(wsConnection, parsedObject.payload);
        }

        if(parsedObject.type == "Managers Report"){
          console.log("Entered the managers report");
          managersReport(wsConnection, parsedObject.from, parsedObject.to, parsedObject.reportType, parsedObject.dineTypeList);
        }
        
        if(parsedObject.type == "DB Structure"){
          console.log("Entered the db structure");
          checkDBStructure(wsConnection);
        }
        
      } catch (error) {
        
        wsConnection.send(JSON.stringify({Error: error}))
      }

      // msgEmitter.emit('message', message);
    });

    wsConnection.on('error', (error) => {
      _log(error);
      wsConnection.close(5000, 'Closing connection')

      cancelTimer();
    });
  });
};

module.exports = {
  initSocketServer,
  msgEmitter,
  sendMsg: (msg) => {
    if (wsConnection && wsConnection.readyState === wsConnection.OPEN) {
      wsConnection.sendUTF(msg);
    } else {
      console.log('\n');
      console.error('Cannot send message, WebSocket connection is not open');
      console.log('\n');
    }
  }
}