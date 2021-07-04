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
  static get CARDNUM_FONT() { return '48px bold monospace'; }
  static get CARDNUM_COLOR() { return 'rgba(17, 17, 77)'; }

  // time
  static get MISCNUM_FONT() { return '120px bold monospace'; }
  static get MISCNUM_S_FONT() { return '64px bold monospace'; }
  static get MISCNUM_COLOR() { return 'rgba(173, 216, 230)'; }

  // result
  static get RESULT_FONT() { return '180px bold monospace'; }
  static get RESULT_WIN_COLOR() { return 'rgba(255, 215, 0)'; }
  static get RESULT_LOSE_COLOR() { return 'rgba(100, 149, 237)'; }
}