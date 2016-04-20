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
 
var BRAND_COLUMN = 2; //column of the brand in the product feed. Start counting at 0.
var SEPERATOR = '|'; //feed seperator
function main() {
   
  /************ Configuration Block ************/
   
  var negativeKeywordListName = "Liste aller aktiven Marken";              //Name of your shared negative list.
  var feedurl = "https://www.shop.com/export/nr_productsup_vendor.csv"; //URL of your vendor database.
  var ownBrand = ["brand1","brand2"]; // See line below.
  /* List of "own Brands" which you want to exclude from the Shared List. Example: ['"Daily`s Shirt"','"Don…t label me"',"lodenfrey","Loden-Frey"]
     Please mind the quotation marks. Format: vendorName = "[compound vendor Name]" or '[compound vendor Name]' => ownBrand = '"[compound vendor Name]"' or "'[compound vendor Name]'".*/
   
  /************ Configuration Block ************/
     
   
 /************ DO NOT CHANGE CODE ************/
 /************ BELOW  THIS  POINT ************/
  var spreadsheet = UrlFetchApp.fetch(feedurl);
  spreadsheet = Utilities.parseCsv(spreadsheet);
  var vendorNames = getVendorNames(spreadsheet,ownBrand);
  var sharedNegativeKeywords = getSharedList(negativeKeywordListName);
  var newSharedNegativeKeywords = compareLists(sharedNegativeKeywords,vendorNames);
   
  var negativeKeywordListIterator = AdWordsApp.negativeKeywordLists().withCondition("Name = '" +  negativeKeywordListName + "'").get();
   
  if(negativeKeywordListIterator.totalNumEntities()==1){
     
    var negativeKeywordList = negativeKeywordListIterator.next();
     
    for(i=0;i<newSharedNegativeKeywords.length;i++){
      var negativeKeyword = newSharedNegativeKeywords[i];
      if(negativeKeyword)
        negativeKeywordList.addNegativeKeyword(negativeKeyword);
    }
  }
  else
    Logger.log("You have not defined a list of this name.")
}
 
function getVendorNames(spreadsheet,ownBrand){
  var vendorNames = [];
  for(i=1;i<spreadsheet.length;i++){
    
    var vendorName = spreadsheet[i].toString();
    vendorName = vendorName.split(SEPERATOR)[BRAND_COLUMN];
    vendorName = vendorName.replace(/@/g,'a').replace(/!/g,'').replace(/%/g,'').replace(/\./g,'').replace(/\(/g,'').replace(/\)/g,'').replace(/,/g,' ').replace(/`/g,' ').replace(/\´/g,' ').replace(/\…/g,' ').replace(/\+/g,' ').replace(/\&/g,' ').replace(/\;/g,' ');
    vendorName = vendorName.replace(/\"/g,'').replace(/\'/,'').replace(/(^[\s]+|[\s]+$)/g, '');
     
    if(checkIfOwnBrand(ownBrand,vendorName))
      continue;
    else{
      vendorNames.push(vendorName);
      }
  }
  return vendorNames;
}
 
function getSharedList(negativeKeywordListName){
   
  var sharedNegativeKeywords = [];
  var negativeKeywordListIterator = AdWordsApp.negativeKeywordLists().withCondition("Name = '" +  negativeKeywordListName + "'").get();
   
  if (negativeKeywordListIterator.totalNumEntities() == 1) {
    var negativeKeywordList = negativeKeywordListIterator.next();
    var sharedNegativeKeywordIterator = negativeKeywordList.negativeKeywords().get();
         
    while (sharedNegativeKeywordIterator.hasNext()) {
      sharedNegativeKeywords.push(sharedNegativeKeywordIterator.next().getText().replace(/(^[\s]+|[\s]+$)/g, ''));
    }   
  }
  return sharedNegativeKeywords;
}
 
function compareLists(sharedNegativeKeywords,vendorNames){
  var newSharedNegativeKeywords = [];
   
  for(i=0;i<vendorNames.length;i++){
    var vendor = vendorNames[i].toString();   
    if(sharedNegativeKeywords.indexOf(vendor)==-1)
      newSharedNegativeKeywords.push(vendor.replace(/(^[\s]+|[\s]+$)/g, ''));
    else
      continue;
  }
  Logger.log("New Negative Keywords: " + newSharedNegativeKeywords);
  return newSharedNegativeKeywords;
}
 
function checkIfOwnBrand(ownBrand,vendorName){
  
  if(ownBrand.indexOf(vendorName)==-1)
    return false;
   
  Logger.log(vendorName + " is own Brand.")
  return true;
   
}
