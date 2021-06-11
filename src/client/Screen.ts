//import io from 'socket.io-client';
import * as socketio_client from "socket.io-client";
import * as socketio from "socket.io";

export class Screen{
  constructor() {
    this.initSocket();
  }

  initSocket(){
  }

  animate(iTimeCurrent: number)
  {
    requestAnimationFrame((iTimeCurrent)=>{
      this.animate(iTimeCurrent);
    });
    this.render(iTimeCurrent);
  }

  render(iTimeCurrent: number)
  {
    //console.log('render:'+iTimeCurrent);
  }
}
