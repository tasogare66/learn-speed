import { Suit, CardNo, Card } from '../cmn/SerializeData';
import { ImgRect } from './Assets';

export class ClientCard extends Card {
  constructor(suit: Suit = Suit.None, no: CardNo = CardNo.Max) {
    super(suit, no);
  }
  rect: ImgRect = { sy: 0, sx: 0, sh: 0, sw: 0 };

  update(){
  }
}

export class ClientMatchSpeedPlayer {
  update(){
  }
}

export class ClientMatchSpeed {
  update(){
  }
}

export class ClientRoom {
  match: ClientMatchSpeed = new ClientMatchSpeed();
  update() {
  }
}
