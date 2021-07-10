import { DragInfo, EmoteType, EmoteUtil, PlayACard } from "../cmn/SerializeData";

export class Player {
  constructor(strSocketID: string, nickName: string) {
    this.strSocketID = strSocketID;
    this.nickName = nickName;
  }
  strSocketID: string;
  nickName: string;

  isDuringTheGame: boolean = false;
  isBot = false;
  playACards: PlayACard[] = [];
  dragInfo: DragInfo | null = null;
  emoteType: EmoteType = EmoteType.Invalid;
  winNum: number = 0;
  loseNum: number = 0;
  drawNum : number = 0;

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

  setEmoteType(et: EmoteType) {
    if (EmoteUtil.isDefinedEmoteType(et)){
      this.emoteType = et;
    }
  }
  clearEmoteType() {
    this.emoteType = EmoteType.Invalid;
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

export class BotPlayer extends Player {
  constructor() {
    super('', '');
    this.isBot = true;
  }
}