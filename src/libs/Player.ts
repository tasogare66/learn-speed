import { PlayACard } from "../cmn/SerializeData";

export class Player {
  constructor(strSocketID: string, nickName: string) {
    this.strSocketID = strSocketID;
    this.nickName = nickName;
  }
  strSocketID: string;
  nickName: string;

  isDuringTheGame: boolean = false;
  playACard: PlayACard = new PlayACard();

  matchStart() {
    this.isDuringTheGame = true;
  }
  matchEnd() {
    this.isDuringTheGame = false;
  }

  update(fDeltaTime: number) {
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