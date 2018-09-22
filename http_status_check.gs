var ROW_START = 2;
var COL_URL = 2;
var COL_STATUS = 1;


function onOpen(){
  //メニュー配列
  var myMenu=[
    {name: "実行", functionName: "main"},
    {name: "ステータスクリア", functionName: "fncClear"}
  ];
  //メニューを追加
  SpreadsheetApp.getActiveSpreadsheet().addMenu("ステータスチェック",myMenu);

}

function main(){
  var i; 
  var strURL;
  var resCode
  var sheet = SpreadsheetApp.getActiveSheet();

  
  //ステータスカラムをクリア
  fncClear();
  
  for(i=ROW_START; i<=sheet.getLastRow(); i++){
    // HTTPステータスを取得
    strURL = sheet.getRange(i, COL_URL).getValue();
    resCode = getHTTPStatusCode(strURL);
    
    //結果を書き込み
    sheet.getRange(i, COL_STATUS).setValue(resCode);
    // エラー時の色変更
    if(resCode != 200){
      sheet.getRange(i, COL_STATUS).setBackground('#FF0000');
      sheet.getRange(i, COL_STATUS).setFontColor('#FFFFFF'); 
    }
  }
}

function getHTTPStatusCode(strURL){
  var options = {
    "muteHttpExceptions": true,　    // 404エラーでも処理を継続する
  };
  try{
    return resCode = UrlFetchApp.fetch(strURL, options).getResponseCode();
  }
  catch(ex){
    return 999;
  }
}


// ステータスカラムのクリア
function fncClear(){
  var sheet = SpreadsheetApp.getActiveSheet();
  sheet.getRange(ROW_START, COL_STATUS, sheet.getLastRow()).clear();

}