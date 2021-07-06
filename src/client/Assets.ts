import { ImgRect, Suit, CardNo, Card, EmoteType } from "../cmn/SerializeData";
import { assert, Rng } from "../cmn/Util";

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
    this.emoteUV();
    //emotes
    this.imgEmotes = new Image();
    this.imgEmotes.src = '../images/vector_style2.png';
    //audios
    this.sePlace = [
       new Audio('../audios/cardPlace1.mp3'),
       new Audio('../audios/cardPlace2.mp3'),
       new Audio('../audios/cardPlace3.mp3'),
    ];
    this.seSlide = [
      new Audio('../audios/cardSlide1.mp3'),
      new Audio('../audios/cardSlide2.mp3'),
      new Audio('../audios/cardSlide3.mp3'),
   ];
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
    this.rectCardsTbl[Suit.Joker] = [
      { sh: 190, sw: 140, sy: 570, sx: 140 },
    ];
  }
  emoteUV(){
    this.rectEmotesTbl = [
      { sh: 38, sw: 32, sy: 152, sx: 64 },
      { sh: 38, sw: 32, sy: 114, sx: 160 },
      { sh: 38, sw: 32, sy: 76, sx: 160 },
      { sh: 38, sw: 32, sy: 38, sx: 160 },
      { sh: 38, sw: 32, sy: 0, sx: 160 },
      { sh: 38, sw: 32, sy: 152, sx: 128 },
      { sh: 38, sw: 32, sy: 114, sx: 128 },
      { sh: 38, sw: 32, sy: 76, sx: 128 },
      { sh: 38, sw: 32, sy: 38, sx: 128 },
      { sh: 38, sw: 32, sy: 0, sx: 128 },
      { sh: 38, sw: 32, sy: 152, sx: 96 },
      { sh: 38, sw: 32, sy: 114, sx: 96 },
      { sh: 38, sw: 32, sy: 76, sx: 96 },
      { sh: 38, sw: 32, sy: 38, sx: 96 },
      { sh: 38, sw: 32, sy: 0, sx: 96 },
      { sh: 38, sw: 32, sy: 152, sx: 160 },
      { sh: 38, sw: 32, sy: 114, sx: 64 },
      { sh: 38, sw: 32, sy: 76, sx: 64 },
      { sh: 38, sw: 32, sy: 38, sx: 64 },
      { sh: 38, sw: 32, sy: 0, sx: 64 },
      { sh: 38, sw: 32, sy: 152, sx: 32 },
      { sh: 38, sw: 32, sy: 114, sx: 32 },
      { sh: 38, sw: 32, sy: 76, sx: 32 },
      { sh: 38, sw: 32, sy: 38, sx: 32 },
      { sh: 38, sw: 32, sy: 0, sx: 32 },
      { sh: 38, sw: 32, sy: 152, sx: 0 },
      { sh: 38, sw: 32, sy: 114, sx: 0 },
      { sh: 38, sw: 32, sy: 76, sx: 0 },
      { sh: 38, sw: 32, sy: 38, sx: 0 },
      { sh: 38, sw: 32, sy: 0, sx: 0 },
    ];
  }
  getCardImgRect(card: Card): ImgRect {
    if (card.suit===Suit.Joker) return this.rectCardsTbl[card.suit][0];
    return this.rectCardsTbl[card.suit][card.no];
  }
  getCardBackImgRect(): ImgRect{
    return { sh: 190, sw: 140, sy: 570, sx: 280 };
  }

  getEmoteImgRect(et: EmoteType): ImgRect {
    assert(et>=EmoteType.Start && et < this.rectEmotesTbl.length);
    return this.rectEmotesTbl[et];
  }

  private static playeSEInternal(se: HTMLAudioElement) {
    if (!se) return;
    se.currentTime = 0;
    se.play();
  }
  playPlaceSE(){
    const n = Rng.randiMax(this.sePlace.length-1);
    Assets.playeSEInternal(this.sePlace[n]);
  }
  playSlideSE(){
    const n = Rng.randiMax(this.seSlide.length-1);
    Assets.playeSEInternal(this.seSlide[n]);
  }

  imageField: HTMLImageElement;
  rectFieldInFieldImage: ImgRect;
  imgCards: HTMLImageElement;
  imgCardBack: HTMLImageElement;
  rectCardsTbl: ICardRectHash = {};
  imgEmotes: HTMLImageElement;
  rectEmotesTbl: ImgRect[] = [];
  sePlace: HTMLAudioElement[] = [];
  seSlide: HTMLAudioElement[] = [];
}