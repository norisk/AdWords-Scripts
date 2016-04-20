/**
*   AdWords Shared Negative List Automation
*   Version: 1.0.3
*   @author: Alexander Groß
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
*
* This script retrieves your vendor list and pushes it into your shared negative brand lists.
* In order for the script to work, you need to define all things in the configuration block.
*
*/

function main() {
  
  /************ Configuration Block ************/
  
  var KLICKS_THRESHOLD = 0;        //Minimum of clicks a search query needs to have. [Integer] @throws IOException
  var CPO_MAX = 1000000;           //Maximum CPO [Float] @throws IOException
  var CONVERSIONS_THRESHOLD = 0;   //Minimum Conversions [Integer] @throws IOException
  var TIMESPAN = "LAST_30_DAYS";   //Timespan @throws IOException
  var CAMPAIGN_NAME = "'_google-Shopping'"; //Shopping Campaign Identifier. Format: "'[identifier]'" @throws IOException
  var URL = "URL"; // @throws MalformedUrlException
  
  /************ Configuration Block ************/

  
 /************ DO NOT CHANGE CODE ************/
 /************ BELOW  THIS  POINT ************/ 
  var spreadsheet = SpreadsheetApp.openByUrl(URL);
  var report = AdWordsApp.report(
      "SELECT Query,Clicks,Cost,Ctr,ClickConversionRate,CostPerConvertedClick,ConvertedClicks,CampaignId,AdGroupId " +
      "FROM   SEARCH_QUERY_PERFORMANCE_REPORT " +   //Choose whatever report you want to export.
      "WHERE  Clicks > "+KLICKS_THRESHOLD+" AND Conversions > "+CONVERSIONS_THRESHOLD+" AND CostPerConvertedClick < "+CPO_MAX+" AND CampaignName CONTAINS_IGNORE_CASE " + CAMPAIGN_NAME + " " +
      "DURING " + TIMESPAN + " ");
 
  report.exportToSheet(spreadsheet.getActiveSheet());
  
  var rowIndex = 2;
  var rows = report.rows();
  var columnHeaderJ = spreadsheet.getRange("J1").setValue("hasKeyword");
  var columnHeaderK = spreadsheet.getRange("K1").setValue("CampaignName");
  var columnHeaderL = spreadsheet.getRange("L1").setValue("CampaignIsActive");
  var columnHeaderM = spreadsheet.getRange("M1").setValue("AdGroupName");
  var columnHeaderN = spreadsheet.getRange("N1").setValue("AdGroupIsActive");
  
  while (rows.hasNext()) {
    var row = rows.next();
    var query = row["Query"];
    var adGroupId = row["AdGroupId"];
    var clicks = row["Clicks"];
    var costPerConvertedClick = row["CostPerConvertedClick"];
    var nextColumnIndex = "J";
    spreadsheet.getRange(nextColumnIndex+rowIndex).setValue(hasKeyword(query));
    getParentStats(query,spreadsheet,rowIndex);
    rowIndex++;
    
  }
  
  Logger.log("Report available at " + spreadsheet.getUrl());
}

function hasKeyword(query) {
  var keywordIterator = AdWordsApp.keywords()
      .withCondition("Text = '" + query + "'")
      .get();
  return keywordIterator.hasNext();
}

function getParentStats(query,spreadsheet,rowIndex){
  if(hasKeyword(query)){
    var keywordIterator = AdWordsApp.keywords().withCondition("Text = '" + query + "'").get();
    while(keywordIterator.hasNext()){
      var keyword = keywordIterator.next();
      var campaignName = keyword.getCampaign().getName();
      var campaignStat = keyword.getCampaign().isEnabled();
      var adGroupName = keyword.getAdGroup().getName();
      var adGroupStat = keyword.getAdGroup().isEnabled();
      spreadsheet.getRange("K"+rowIndex).setValue(campaignName);
      spreadsheet.getRange("L"+rowIndex).setValue(campaignStat);
      spreadsheet.getRange("M"+rowIndex).setValue(adGroupName);
      spreadsheet.getRange("N"+rowIndex).setValue(adGroupStat);
    }
  }
}
