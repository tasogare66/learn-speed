import { Suit, CardNo, Card } from "../cmn/SerializeData";

export interface ImgRect {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
};

export interface ICardRectHash {
  [details: string]: ImgRect[];
}

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
    this.cardUV();
  }
  cardUV(){
    this.rectCardsTbl[Suit.Spade] = [
      { sh: 190, sw: 140, sy: 570, sx: 0 },
      { sh: 190, sw: 140, sy: 380, sx: 140 },
      { sh: 190, sw: 140, sy: 190, sx: 140 },
      { sh: 190, sw: 140, sy: 0, sx: 140 },
      { sh: 190, sw: 140, sy: 1710, sx: 0 },
      { sh: 190, sw: 140, sy: 1520, sx: 0 },
      { sh: 190, sw: 140, sy: 1330, sx: 0 },
      { sh: 190, sw: 140, sy: 1140, sx: 0 },
      { sh: 190, sw: 140, sy: 950, sx: 0 },
      { sh: 190, sw: 140, sy: 760, sx: 0 },
      { sh: 190, sw: 140, sy: 380, sx: 0 },
      { sh: 190, sw: 140, sy: 0, sx: 0 },
      { sh: 190, sw: 140, sy: 190, sx: 0 },
    ];
    this.rectCardsTbl[Suit.Club] = [
      { sh: 190, sw: 140, sy: 570, sx: 560 },
      { sh: 190, sw: 140, sy: 1140, sx: 280 },
      { sh: 190, sw: 140, sy: 190, sx: 700 },
      { sh: 190, sw: 140, sy: 0, sx: 700 },
      { sh: 190, sw: 140, sy: 1710, sx: 560 },
      { sh: 190, sw: 140, sy: 1520, sx: 560 },
      { sh: 190, sw: 140, sy: 1330, sx: 560 },
      { sh: 190, sw: 140, sy: 1140, sx: 560 },
      { sh: 190, sw: 140, sy: 950, sx: 560 },
      { sh: 190, sw: 140, sy: 760, sx: 560 },
      { sh: 190, sw: 140, sy: 380, sx: 560 },
      { sh: 190, sw: 140, sy: 0, sx: 560 },
      { sh: 190, sw: 140, sy: 190, sx: 560 },
    ];
    this.rectCardsTbl[Suit.Diamond] = [
      { sh: 190, sw: 140, sy: 0, sx: 420 },
      { sh: 190, sw: 140, sy: 1710, sx: 420 },
      { sh: 190, sw: 140, sy: 1520, sx: 420 },
      { sh: 190, sw: 140, sy: 1330, sx: 420 },
      { sh: 190, sw: 140, sy: 1140, sx: 420 },
      { sh: 190, sw: 140, sy: 950, sx: 420 },
      { sh: 190, sw: 140, sy: 760, sx: 420 },
      { sh: 190, sw: 140, sy: 570, sx: 420 },
      { sh: 190, sw: 140, sy: 380, sx: 420 },
      { sh: 190, sw: 140, sy: 190, sx: 420 },
      { sh: 190, sw: 140, sy: 1710, sx: 280 },
      { sh: 190, sw: 140, sy: 1330, sx: 280 },
      { sh: 190, sw: 140, sy: 1520, sx: 280 },
    ];
    this.rectCardsTbl[Suit.Heart] = [
      { sh: 190, sw: 140, sy: 1330, sx: 140 },
      { sh: 190, sw: 140, sy: 380, sx: 700 },
      { sh: 190, sw: 140, sy: 950, sx: 280 },
      { sh: 190, sw: 140, sy: 760, sx: 280 },
      { sh: 190, sw: 140, sy: 570, sx: 280 },
      { sh: 190, sw: 140, sy: 380, sx: 280 },
      { sh: 190, sw: 140, sy: 190, sx: 280 },
      { sh: 190, sw: 140, sy: 0, sx: 280 },
      { sh: 190, sw: 140, sy: 1710, sx: 140 },
      { sh: 190, sw: 140, sy: 1520, sx: 140 },
      { sh: 190, sw: 140, sy: 1140, sx: 140 },
      { sh: 190, sw: 140, sy: 760, sx: 140 },
      { sh: 190, sw: 140, sy: 950, sx: 140 },
    ];
    // <SubTexture height="190" width="140" y="570" x="140" name="cardJoker.png"/>
  }
  getCardImgRect(card: Card): ImgRect {
    return this.rectCardsTbl[card.suit][card.no];
  }
  getCardBackImgRect(): ImgRect{
    return { sh: 190, sw: 140, sy: 570, sx: 280 };
  }

  imageField: HTMLImageElement;
  rectFieldInFieldImage: ImgRect;
  imgCards: HTMLImageElement;
  imgCardBack: HTMLImageElement;
  rectCardsTbl: ICardRectHash = {};
}