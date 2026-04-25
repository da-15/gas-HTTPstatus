var ROW_START = 2; //データの開始行を指定。
var COL_URL = 2; // HTTPステータスチェックを行いたいURL列
var COL_STATUS = 1; // ステータス結果を出力したい列

/*
 * メニューを追加
 */
function onOpen(){
  var myMenu=[
    {name: "実行", functionName: "main"},
    {name: "ステータスクリア", functionName: "fncClear"}
  ];
  SpreadsheetApp.getActiveSpreadsheet().addMenu("ステータスチェック",myMenu);
}

/*
 * メイン実行
 */
function main(){
  var sheet = SpreadsheetApp.getActiveSheet();
  var lastRow = sheet.getLastRow();

  fncClear();

  if(lastRow < ROW_START) return;

  var numRows = lastRow - ROW_START + 1;

  // URLを一括取得（スプレッドシートAPIコールを1回に削減）
  var urls = sheet.getRange(ROW_START, COL_URL, numRows).getValues().map(function(row){ return row[0]; });

  // 有効なURLのみリクエスト配列を構築（インデックスを保持）
  var validIndices = [];
  var requests = [];
  urls.forEach(function(url, i){
    if(url){
      validIndices.push(i);
      requests.push({ url: url, muteHttpExceptions: true });
    }
  });

  // URLを並列フェッチ
  var responses = requests.length > 0 ? UrlFetchApp.fetchAll(requests) : [];

  // 結果配列を初期化
  var statusValues = urls.map(function(){ return ['']; });
  var backgrounds = urls.map(function(){ return [null]; });
  var fontColors  = urls.map(function(){ return [null]; });

  // レスポンスを処理
  validIndices.forEach(function(rowIdx, i){
    var resCode;
    try{
      resCode = responses[i].getResponseCode();
    }catch(ex){
      resCode = 999;
    }

    statusValues[rowIdx] = [resCode === 999 ? 'Err' : resCode];

    // ステータス200以外は背景赤・文字白
    if(resCode !== 200){
      backgrounds[rowIdx] = ['#FF0000'];
      fontColors[rowIdx]  = ['#FFFFFF'];
    }
  });

  // 結果を一括書き込み（スプレッドシートAPIコールを3回に削減）
  var statusRange = sheet.getRange(ROW_START, COL_STATUS, numRows, 1);
  statusRange.setValues(statusValues);
  statusRange.setBackgrounds(backgrounds);
  statusRange.setFontColors(fontColors);
}


/*
 * ステータスカラムのクリア
 */
function fncClear(){
  var sheet = SpreadsheetApp.getActiveSheet();
  sheet.getRange(ROW_START, COL_STATUS, sheet.getLastRow()).clear();
}
