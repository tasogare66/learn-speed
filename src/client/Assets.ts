export interface ImgRect {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
};

export class Assets {
  constructor() {
    //背景画像
    this.imageField = new Image();
    this.imageField.src = '../images/grass01.png'
    this.rectFieldInFieldImage = { sx: 0, sy: 0, sw: 512, sh: 512 };
    //cards
    this.imgCards = new Image();
    this.imgCards.src = '../images/playingCards.png';
    this.imgCardBack = new Image();
    this.imgCardBack.src = '../images/playingCardBacks.png';
  }

  imageField: HTMLImageElement;
  rectFieldInFieldImage: ImgRect;
  imgCards: HTMLImageElement;
  imgCardBack: HTMLImageElement;
}