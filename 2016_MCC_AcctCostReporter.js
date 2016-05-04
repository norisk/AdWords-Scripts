/**
*   Account Cost Reporter
*   Version: 1.2.0
*   @author: Christopher Gutknecht
*   norisk GmbH
*   cgutknecht@noriskshop.de
*
* THIS SOFTWARE IS PROVIDED BY norisk GMBH ''AS IS'' AND ANY
* EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
* WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
* DISCLAIMED. IN NO EVENT SHALL norisk GMBH BE LIABLE FOR ANY
* DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
* (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
* LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
* ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
* (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
* SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/***************** CONFIG_BLOCK START *****************/
 
  // Find the spreadsheet here: https://docs.google.com/spreadsheets/d/15OfBFt3i0U-m-zyTXx2cWu8fu2CW1jiRe7J7H9qb2-0/edit#gid=850842802 
  var SPREADSHEET_ID = '15OfBFt3i0U-m-zyTXx2cWu8fu2CW1jiRe7J7H9qb2-0';

/***************** CONFIG_BLOCK START *****************/

function main() {
  
  
  ///////
  // 1. Setting the DATE variables via helper functions
  ///////
  
  var currentDatewithHyphen = new Date().toJSON().slice(0,10);
  var currentDateNoHyphen = currentDatewithHyphen.replace(/-/g,'');
  var dateYesterdayArray = currentDatewithHyphen.split("-");
  dateYesterdayArray[2] = dateYesterdayArray[2] - 1;
  var dateYesterdayNoHyphen = new Date(new Date().setDate(new Date().getDate()-1)).toJSON().slice(0,10).replace(/-/g,'');
  
  var completedDays = dateYesterdayArray[2];
  var currentMonth = dateYesterdayArray[1];
  var currentYear = dateYesterdayArray[0];
  var currentYearType = isNonLeapYear(currentYear);
  var firstDayOfCurrentMonth = dateYesterdayArray[0] + dateYesterdayArray[1] + '01';
  
  function isNonLeapYear(currentYear) {
    var daysPerMonthNonLeapYear = [0,31,28,31,30,31,30,31,31,30,31,30,31];
    var daysPerMonthLeapYear = [0,31,29,31,30,31,30,31,31,30,31,30,31];
    if(currentYear % 4 === 0) {return false;} 
    else if (currentYear % 400 === 0 && currentYear % 100 === 0)
    {return false;}
    return true;
  }	
  
  var currentMonthAsInt = parseInt(currentMonth);
  
  function getLastDayofMonth(monthAsInt, year) {
    var daysPerMonthNonLeapYear = [0,31,28,31,30,31,30,31,31,30,31,30,31];
    var daysPerMonthLeapYear = [0,31,29,31,30,31,30,31,31,30,31,30,31];
    
    if (isNonLeapYear(year) == true) {
      return daysPerMonthNonLeapYear[monthAsInt];
    }
    return daysPerMonthLeapYear[monthAsInt]; 
  }
  
  var lastDayOfCurrentMonth = getLastDayofMonth(currentMonthAsInt,currentYear);
  var lastDateOfCurrentMonth = dateYesterdayArray[0] + dateYesterdayArray[1] + lastDayOfCurrentMonth;
  var numberOfRemainingDays = lastDayOfCurrentMonth - completedDays;
  
  //////
  // 2. Selecting the accounts
  //////

  
  var accountSelector = MccApp.accounts()  
  .withCondition("LabelNames CONTAINS 'ACTIVE'")
  .forDateRange("THIS_MONTH")
  .orderBy("Cost DESC"); 
  
  // Pushing account data into spreadsheet Content array
  var accountIterator = accountSelector.get(); 
  var spreadsheetContent = [];
  while (accountIterator.hasNext()) {
    var account = accountIterator.next();
    var stats = account.getStatsFor(firstDayOfCurrentMonth, dateYesterdayNoHyphen);
    var accountName = account.getName() ? account.getName() : '--';
    spreadsheetContent.push([account.getCustomerId(), account.getName(), account.getCurrencyCode(), stats.getCost()]);
  }
  
  // Access and clear spreadsheet
  var ss = SpreadsheetApp.openById('15OfBFt3i0U-m-zyTXx2cWu8fu2CW1jiRe7J7H9qb2-0');
  var sheet = ss.getActiveSheet();
  sheet.getRange('a1:d50').clear();
  
  // Set the header
  var sheetHeader = ss.getSheets()[0];
  var spreadsheetHeader = [['CustomerID', 'AccountName', 'Currency', 'CostThisMonth']];
  sheet.getRange('a1:d1').setValues(spreadsheetHeader);
  
  // Set time info table
  var sheetSidebar = ss.getSheets()[0];
  sheet.getRange('k:k').clear();
  var spreadsheetSidebar = [['CurrentDates', 'Values'],['dateYesterday', dateYesterdayNoHyphen],['currentMonth', currentMonth], 
                            ['currentYear', currentYear],['isNonLeapYear', currentYearType],
                            ['lastDateOfCurrentMonth', lastDateOfCurrentMonth],['completedDays', completedDays],['lastDayOfCurrentMonth', lastDayOfCurrentMonth],['numberOfRemainingDays', numberOfRemainingDays]];
  sheet.getRange('l1:m9').setValues(spreadsheetSidebar);
  
  // Write spreadsheetContent to sheet
  var spreadValArray = [];
  var spreadRows = [];
  for (var i=0;i < spreadsheetContent.length-1;i++) {
    spreadRows=[];
    for (var j=0; j< spreadsheetContent[0].length;j++){
      spreadRows.push(spreadsheetContent[i][j]);
    }
    spreadValArray.push(spreadRows);
  }
  
  var destinationRange = sheet.getRange(2, 1, i, j);
  destinationRange.setValues(spreadValArray);
  Logger.log('Report content successfully printed to spreadsheet.');

  var sortRange = sheet.getRange("A:I");
  sortRange.sort({column: 4, ascending: false});
  
  // Specify last report row
   function getLastReportRow(sheet) {
    var column = sheet.getRange('A:A');
    var values = column.getValues(); // get all data in one call
    var ct = 0;
    while ( values[ct] && values[ct][0] != "" ) {
      ct++;
    }
    return (ct+1);
  } 
 var lastReportRow = getLastReportRow(sheet);
 Logger.log('lastReportRow: ' + lastReportRow);
  
  //////
  // 3. Retrieving spend of YESTERDAY to match target against trend
  //////
  
  var accountSelector = MccApp.accounts()  
  .withCondition("LabelNames CONTAINS 'ACTIVE'")
  .forDateRange("YESTERDAY")
  .orderBy("Cost DESC"); 
  
  // Pushing account data into yesterdayCostContent array
  var accountIterator = accountSelector.get(); 
  var yesterdayCostContent = [];
  while (accountIterator.hasNext()) {
    var account = accountIterator.next();
    var stats = account.getStatsFor(dateYesterdayNoHyphen, dateYesterdayNoHyphen);
    var accountName = account.getName() ? account.getName() : '--';
    yesterdayCostContent.push([account.getName(), stats.getCost()]);
  }
 
  // Loop through array to write into spreadsheet
  var yesterdayCostValArray = [];
  var yesterdayCostRows = [];
  
  for (var i=0;i < yesterdayCostContent.length-1;i++) {
    yesterdayCostRows=[];
    for (var j=0; j< yesterdayCostContent[0].length;j++){
      yesterdayCostRows.push(yesterdayCostContent[i][j]);
    }
    yesterdayCostValArray.push(yesterdayCostRows);
  }
  
  var yesterdayCostRange = sheet.getRange(2, 19, i, j);
  yesterdayCostRange.setValues(yesterdayCostValArray);
 
 // Vlookup Yesterday Spend into column I
 for (var i=2;i < lastReportRow;i++) {
   var cell = sheet.getRange(i,9);
   cell.setFormula("=IFERROR(VLOOKUP(R[-0]C[-7],s:t,2,false),0)");
   cell.setNumberFormat("0.00");
 } 

}

