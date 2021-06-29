export class RenderingSettings {
  // 背景タイルのサイズ
  static get FIELDTILE_WIDTH() { return 512; }
  static get FIELDTILE_HEIGHT() { return 512; }

  // フィールド
  static get FIELD_LINECOLOR() { return 'blue'; }
  static get FIELD_LINEWIDTH() { return 5; }

  // 処理時間
  static get PROCESSINGTIME_FONT() { return '30px Bold Arial'; }
  static get PROCESSINGTIME_COLOR() { return 'black'; }

  // card
  static get CARD_WIDTH() { return 140; }
  static get CARD_HEIGHT() { return 190; }

  // time
  static get MISCNUM_FONT() { return '120px bold monospace'; }
  static get MISCNUM_S_FONT() { return '64px bold monospace'; }
  static get MISCNUM_COLOR() { return 'rgba(153, 44, 110)'; }
}