import { DragInfo, PlayACard } from "../cmn/SerializeData";

export class Player {
  constructor(strSocketID: string, nickName: string) {
    this.strSocketID = strSocketID;
    this.nickName = nickName;
  }
  strSocketID: string;
  nickName: string;

  isDuringTheGame: boolean = false;
  playACards: PlayACard[] = [];
  dragInfo: DragInfo | null = null;

  matchStart() {
    this.isDuringTheGame = true;
  }
  matchEnd() {
    this.isDuringTheGame = false;
  }

  pushPlayACard(pac:PlayACard){
    this.playACards.push(pac);
  }
  clearPlayACard() {
    this.playACards.length = 0;
  }

  setDragInfo(di: DragInfo) {
    this.dragInfo = di;
  }
  clearDragInfo() {
    this.dragInfo = null;
  }

  toJSON() {
    return Object.assign(
      {
        strSocketID: this.strSocketID,
        nickName: this.nickName,
      }
    );
  }
}