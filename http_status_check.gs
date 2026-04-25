var ROW_START = 2; //データの開始行を指定。
var COL_URL = 2; // HTTPステータスチェックを行いたいURL列
var COL_STATUS = 1; // ステータス結果を出力したい列
var BATCH_SIZE = 20; // 1回のfetchAllで処理するURL件数

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

  // 有効なURLをインデックス付きで収集
  var validItems = [];
  urls.forEach(function(url, i){
    if(url){
      validItems.push({ index: i, url: url });
    }
  });

  // 結果配列を初期化
  var statusValues = urls.map(function(){ return ['']; });
  var backgrounds  = urls.map(function(){ return [null]; });
  var fontColors   = urls.map(function(){ return [null]; });

  // 20件ずつバッチに分割してfetchAll、バッチごとにシートへ反映
  for(var b = 0; b < validItems.length; b += BATCH_SIZE){
    var batch = validItems.slice(b, b + BATCH_SIZE);
    var requests = batch.map(function(item){
      return { url: item.url, muteHttpExceptions: true };
    });
    var responses = UrlFetchApp.fetchAll(requests);

    batch.forEach(function(item, i){
      var resCode;
      try{
        resCode = responses[i].getResponseCode();
      }catch(ex){
        resCode = 999;
      }

      statusValues[item.index] = [resCode === 999 ? 'Err' : resCode];

      // ステータス200以外は背景赤・文字白
      if(resCode !== 200){
        backgrounds[item.index] = ['#FF0000'];
        fontColors[item.index]  = ['#FFFFFF'];
      }
    });

    // このバッチ分をシートに反映（進捗を随時表示）
    var statusRange = sheet.getRange(ROW_START, COL_STATUS, numRows, 1);
    statusRange.setValues(statusValues);
    statusRange.setBackgrounds(backgrounds);
    statusRange.setFontColors(fontColors);
  }
}


/*
 * ステータスカラムのクリア
 */
function fncClear(){
  var sheet = SpreadsheetApp.getActiveSheet();
  sheet.getRange(ROW_START, COL_STATUS, sheet.getLastRow()).clear();
}
