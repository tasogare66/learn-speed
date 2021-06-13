export class Player {
  constructor(strSocketID: string, nickName: string) {
    this.strSocketID = strSocketID;
    this.nickName = nickName;
  }
  strSocketID: string;
  nickName: string;

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