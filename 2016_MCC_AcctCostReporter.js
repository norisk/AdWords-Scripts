/**
*   Account Cost Reporter
*   Version: 1.1.3
*   @author: Christopher Gutknecht
*   norisk GmbH
*   cgutknecht@noriskshop.de
*
* Changes 1.3. 
* - Encapsulated logic into separate functions
* - Fixed monthAsInt bug
*
* TODO: 2.0 REDEFINITION based on objects
* sheet object (writeToSheet, getRange, getLastRow, sortSheet, vlookupIter)
* dateInfo object (getToday, getYesterday, getMonth, getYear, geteofmonth
* dataGetter object
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
  
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
  var firstDayofMonthAndYesterday = setTimeInfoSidebar(sheet);
  
  var acctDataMonth = getAccountsStats("LAST_MONTH", firstDayofMonthAndYesterday[0], firstDayofMonthAndYesterday[1]);
  sheet.getRange('a1:d50').clear();
  sheet.getRange('a1:d1').setValues([['CustomerID', 'AccountName', 'Currency', 'CostThisMonth']]);
  writeToSheet(sheet, acctDataMonth, 2, 1);

  var acctDataYesterday = getAccountsStats("YESTERDAY", firstDayofMonthAndYesterday[1], firstDayofMonthAndYesterday[1]);
  writeToSheet(sheet, acctDataYesterday, 2, 19);

  var lastReportRow = getLastReportRow(sheet);
  vlookupYesterdayCost(sheet, lastReportRow);
  sortSheet(sheet, 4);

  Logger.log('Report content successfully printed to spreadsheet.');

}

/////// Function definitions//////////////

/** Generates all necessary date info, writes a date info sidebar to the sheet
* @param {object} sheet
* @return {array} datesArray, needed for the accountStats Getter
*/
function setTimeInfoSidebar(sheet) {

  var currentDatewithHyphen = new Date().toJSON().slice(0,10);
  var dateYesterdayArray = currentDatewithHyphen.split("-");
  dateYesterdayArray[2] = dateYesterdayArray[2] - 1;
  var dateYesterdayNoHyphen = new Date(new Date().setDate(new Date().getDate()-1)).toJSON().slice(0,10).replace(/-/g,'');
  var firstDayOfCurrentMonth = dateYesterdayArray[0] + dateYesterdayArray[1] + '01';
  var lastDayOfCurrentMonth = getLastDayofMonth(new Date().getMonth()+1,dateYesterdayArray[0]);
  var lastDateOfCurrentMonth = dateYesterdayArray[0] + dateYesterdayArray[1] + lastDayOfCurrentMonth;
  
  var spreadsheetSidebar = [['CurrentDates', 'Values'],['dateYesterday', dateYesterdayNoHyphen],['currentMonth', dateYesterdayArray[1]], 
                            ['currentYear', dateYesterdayArray[0]],['isNonLeapYear', isNonLeapYear(dateYesterdayArray[0])],
                            ['lastDateOfCurrentMonth', lastDateOfCurrentMonth],['completedDays', dateYesterdayArray[2]],
                            ['lastDayOfCurrentMonth', lastDayOfCurrentMonth],['numberOfRemainingDays', lastDayOfCurrentMonth - dateYesterdayArray[2]]];
  sheet.getRange('l1:m9').setValues(spreadsheetSidebar);
  
  var datesArray = [firstDayOfCurrentMonth, dateYesterdayNoHyphen];
  Logger.log("date info printed to sheet, datesArray: " + datesArray);
  return datesArray;
}


/** NOTE: The function is written for two possible values, LAST_MONTH or YESTERDAY
* @param {string} DATE_RANGE, according to AWQL specification
* @param {date} DATES_ARRAY_VAL1, the start date of the stats range
* @param {date} DATES_ARRAY_VAL2, the end date of the stats range
* @return {array} accountStats
*/
function getAccountsStats(DATE_RANGE, DATES_ARRAY_VAL1, DATES_ARRAY_VAL2){
  
  var accountSelector = MccApp.accounts()  
    .withCondition("LabelNames CONTAINS 'ACTIVE'")
    .forDateRange(DATE_RANGE)
    .orderBy("Cost DESC"); 
    
  var accountStats = [];
  var accountIterator = accountSelector.get();
  
  while (accountIterator.hasNext()) {
    var account = accountIterator.next();
    var stats = account.getStatsFor(DATES_ARRAY_VAL1, DATES_ARRAY_VAL2);
    var accountName = account.getName() ? account.getName() : '--';

    var fieldArray = (DATE_RANGE == "LAST_MONTH") ? 
      [account.getCustomerId(), account.getName(), account.getCurrencyCode(), stats.getCost()] : 
      [account.getName(), stats.getCost()];
    accountStats.push(fieldArray);
  }
  return accountStats;
}

/**
@param {object} sheet
@param {array} accountStats
@param {array} START_CELL, a twodimensional array with [startRow, startColumn] as values
@return void
*/
function writeToSheet(sheet, accountStats, START_ROW, START_COLUMN){
  var destinationRange = sheet.getRange(START_ROW, START_COLUMN, accountStats.length, accountStats[0].length);
  destinationRange.setValues(accountStats);
}


/**
* @param {integer} currentYear
* @return {boolean}
*/
function isNonLeapYear(currentYear) { 
  if(currentYear % 4 === 0 || (currentYear % 400 === 0 && currentYear % 100 === 0)) {
    return false;
  } 
  return true;
}


/**
* @param {integer} monthAsInt
* @param {integer} year
* @return {integer} daysPerMonthLeapYear
*/
function getLastDayofMonth(monthAsInt, year) {
  var daysPerMonthNonLeapYear = [0,31,28,31,30,31,30,31,31,30,31,30,31];
  var daysPerMonthLeapYear =    [0,31,29,31,30,31,30,31,31,30,31,30,31];
  
  if (isNonLeapYear(year) == true) {
    return daysPerMonthNonLeapYear[monthAsInt];
  }
  Logger.log("daysPerMonth: " + daysPerMonthLeapYear[monthAsInt]);
  return daysPerMonthLeapYear[monthAsInt]; 
}


/**
* @param {object} sheet
* @return {integer} ct
*/
 function getLastReportRow(sheet) {
  var column = sheet.getRange('A:A');
  var values = column.getValues();
  var ct = 0;
  while ( values[ct] && values[ct][0] != "" ) {
    ct++;
  }
  return (ct+1);
} 


/**
* @param {object} sheet
* @param {integer} lastReportRow
* @return void 
*/
function vlookupYesterdayCost(sheet, lastReportRow) {
  for (var i=2;i < lastReportRow;i++) {
    var cell = sheet.getRange(i,9);
    cell.setFormula("=IFERROR(VLOOKUP(R[-0]C[-7],s:t,2,false),0)");
    cell.setNumberFormat("0.00");
  } 
}

/**
* @param {object} sheet
* @param {integer} column
* @return void
*/
function sortSheet(sheet, sortColumn) {
  var sortRange = sheet.getRange("A:I");
  sortRange.sort({column: sortColumn, ascending: false});
}
