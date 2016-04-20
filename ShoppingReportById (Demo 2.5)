/**
*   ShoppingReportById
*   Version: 1.1.0
*   @author: Alexander Groß / Christopher Gutknecht
*   norisk GmbH
*   agross@noriskshop.de
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


function main() {
/**************** START CONFIGURATION BLOCK ****************/  

  /*** Static BLOCK ***/  
  var SPREADSHEETID = "SPREADSHEETID"; // Paste the spreadsheet ID in here
  var DATASHEET = "adwordsData"; // Name of the sheet to receive data
  var MAINSHOPPINGCAMPAIGN = "'_g-Shopping'"; // Name of your main shopping Campaing. FORMAT:["'XXX'"], @throws InvalidAWQLConditionException
  
  var ALLINONEREPORT = false; // Set to true if you want to report all Campaings in one spreadsheet. This overrides all following configurations.  
  var SHOPPINGCAMPAIGN = false; //Set to true, if you want to report the main shopping Campaign. This overrides all following configurations.   
  var CAMPAIGNSPECIFIER = "Main_New"; //Campaign Specifier of the Campaign to be reported [Generisch | DSA | pricePush | ...]. Is overriden by ALLINONEREPORT & SHOPPINGCAMPAIGN.
  var TIMESPAN = "LAST_30_DAYS"; //Timespan of the report. 
   
/**************** END CONFIGURATION BLOCK ****************/  
  
  
/**************** DO NOT CHANGE CODE BELOW THIS POINT ****************/
  var OPERATOR = 'CONTAINS_IGNORE_CASE'; // Do not Change.
  createReport(SPREADSHEETID,DATASHEET,CAMPAIGNSPECIFIER,OPERATOR, SHOPPINGCAMPAIGN,MAINSHOPPINGCAMPAIGN,ALLINONEREPORT,TIMESPAN);
   
}

function createReport(SPREADSHEETID,DATASHEET,CAMPAIGNSPECIFIER,OPERATOR,SHOPPINGCAMPAIGN,MAINSHOPPINGCAMPAIGN,ALLINONEREPORT,TIMESPAN){
  
  Logger.log("Operator set to: " + OPERATOR);
  Logger.log("CamapignSpecifier set to: " +  CAMPAIGNSPECIFIER);
  Logger.log("Report is set to Main Shopping Campaign: " + SHOPPINGCAMPAIGN);

  // Log all report data into variable
  try{
    var report = AdWordsApp.report(
      "SELECT OfferId , CampaignName , Cost , Conversions , Clicks , AverageCpc , ConversionValue , ConvertedClicks " +
      "FROM   SHOPPING_PERFORMANCE_REPORT " +   //Choose whatever report you want to export.
      "WHERE  CampaignName " + OPERATOR + " " + CAMPAIGNSPECIFIER + " " + //TBD Filter der Kampagne
      "DURING " + TIMESPAN + " ");
  }
  catch(e){
    Logger.log("Please mind the format of your Main Shopping Camapaign. The script was stopped because of this InvalidAWQLConditionException.");
    return;
  }

  // Defining the rows for the spreasheet

  var rows = report.rows();
  while (rows.hasNext()) {
    var row = rows.next();
    var id = row["Id"];                          //A1
    var campaignName = row["CampaignName"];      //B1
    var cost = row["Cost"];                      //C1
    var conversions = row["Conversions"];        //D1
    var clicks = row["Clicks"];                  //E1
    var averageCpc = row["AverageCPC"];          //F1
    var conversionValue = row["ConversionValue"];//G1
    var convertedClicks = row["ConvertedClicks"]; //H1
  }  
  
    // Start NEW spreadsheet accessor
    var spreadsheet = SpreadsheetApp.openById(SPREADSHEETID).getSheetByName(DATASHEET); 
    report.exportToSheet(spreadsheet);
    
    CAMPAIGNSPECIFIER = CAMPAIGNSPECIFIER.replace(/ /g,'_').replace(/'/g,'');
    Logger.log(CAMPAIGNSPECIFIER);
    spreadsheet.getRange("B1").setValue("export[1].statsAdw.CampName_" + CAMPAIGNSPECIFIER);
    spreadsheet.getRange("C1").setValue("export[1].statsAdW.Cost_" + CAMPAIGNSPECIFIER);
    spreadsheet.getRange("D1").setValue("export[1].statsAdW.Conversions_" + CAMPAIGNSPECIFIER);
    spreadsheet.getRange("E1").setValue("export[1].statsAdW.Clicks_" + CAMPAIGNSPECIFIER);
    spreadsheet.getRange("F1").setValue("export[1].statsAdW.AverageCPC_" + CAMPAIGNSPECIFIER);
    spreadsheet.getRange("G1").setValue("export[1].statsAdW.ConvValue_" + CAMPAIGNSPECIFIER);
    spreadsheet.getRange("H1").setValue("export[1].statsAdW.ConvClicks_" + CAMPAIGNSPECIFIER);
  
  var sortRange = spreadsheet.getRange("A:H");
  sortRange.sort({column: 3, ascending: false});
  
}
