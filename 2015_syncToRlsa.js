/**	
*	AdWords Campaign Sync 1.1 (Beta)
*	norisk GmbH
*	agross@noriskshop.de
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
  
/***************** CONFIG_BLOCK START *****************/
  	
  	var CAMPAIGN_SUFFIX = "_RLSA";		// ["_AT"|"_RLSA"|...] SELECT CLONE CAMPAIGN SUFFIX
  	var STATUS_SYNC = "OFF";			// ["ON"|"OFF"] SYNCS ALL CLONED ENTITIES' STATUS TO THEIR MATCHING MASTER'S STATUS
  	var CLONED_LABEL = "ON";			// ["ON"|"OFF"] CREATES NEW ENTITIES HOLDING THE LABEL "CLONED" ("ON" RECOMMENDED, OTHERWISE THE PROGRAMM COULD BE WORKING INACCURATELY)
  	var LOG_DATA = "ON";				// ["ON"|"OFF"] LOGS DATA TO ADWORDS-LOGGER (FOR DEBUGGING PURPOSES)
  	var REMOVE_CLONED_ENTITIES = "ON";	// ["ON"|"OFF"] PAUSES ADGROUPS IF THEY HAVE BEEN DELETED FROM OR PAUSED IN THE MASTER, DELETES OTHER ENTITIES IF THEY HAVE BEEN DELETED IN THE MASTER
  	var STATUS = "ENABLED";				// ["ENABLED"|"PAUSED"] CREATES ADGROUPS WITH SELECTED INITIAL STAUTS
  	var AD_SYNC = "ON";					// ["ON"|"OFF"] SYNCS ADS
    var LABEL = "CLONED" + CAMPAIGN_SUFFIX;
  	
/***************** CONFIG_BLOCK END *****************/
	
    
/***************** FUNCTION_BLOCK START *****************/
/***************** DO NOT CHANGE CODE *****************/
    
 	updateAdGroups(CAMPAIGN_SUFFIX, CLONED_LABEL, LOG_DATA, STATUS, LABEL);
  	updateKeywords(CAMPAIGN_SUFFIX, CLONED_LABEL, LABEL);
  	updateAds(CAMPAIGN_SUFFIX, CLONED_LABEL, AD_SYNC, LABEL);
  	updateNegativeKeywords(CAMPAIGN_SUFFIX);
  	removeNegativeKeywords(CAMPAIGN_SUFFIX, REMOVE_CLONED_ENTITIES);
  	pauseAdGroups(CAMPAIGN_SUFFIX, REMOVE_CLONED_ENTITIES, LABEL);
  	removeAds(CAMPAIGN_SUFFIX, REMOVE_CLONED_ENTITIES, AD_SYNC, LABEL);
  	removeKeywords(CAMPAIGN_SUFFIX, REMOVE_CLONED_ENTITIES, LABEL);
  	statusSync(CAMPAIGN_SUFFIX, STATUS_SYNC);
}
function updateAdGroups(CAMPAIGN_SUFFIX, CLONED_LABEL, LOG_DATA, STATUS, LABEL) {

/**
* This function selects all AdGroups in Master_Campaigns and checks if there are 
* matching AdGroups in the the corresponding Clone_Campaign.
* If not it creates the missing AdGroups as Clone_AdGroup including all Ads and Keywords, found
* in the Master_AdGroup
*/
  
	var labelIterator = AdWordsApp.labels().withCondition('Name = Master').get();
  
	if (labelIterator.hasNext()) { 
		var label = labelIterator.next();
		var masterCampaigns = label.campaigns().get();
      
    	if(LOG_DATA == "ON"){ 
			Logger.log("Count Master Campaigns: " + masterCampaigns.totalNumEntities());
      		Logger.log("Label Name: " + label.getName());
      	}
      
      	while(masterCampaigns.hasNext()){
        	var masterCampaign = masterCampaigns.next();		
        	var masterCampaignName = masterCampaign.getName();  	
			var campaignIterator = AdWordsApp.campaigns().withCondition('Name = "' + masterCampaignName + CAMPAIGN_SUFFIX + '"').get();
			
			if(LOG_DATA == "ON"){             
				Logger.log("Master Campaign Name: " + masterCampaignName);
                Logger.log("Count Clone Campaigns: " + campaignIterator.totalNumEntities());
			}
		
			if (campaignIterator.hasNext()) {          
				var cloneCampaign = campaignIterator.next();
				var masterAdGroupIterator = masterCampaign.adGroups().get();
				
				if(LOG_DATA == "ON"){
					Logger.log("Clone Campaign Name: " + cloneCampaign.getName());
				}
				      
				while (masterAdGroupIterator.hasNext()) {                 
					var masterAdGroup = masterAdGroupIterator.next();        
					var cloneAdGroup = cloneCampaign.adGroups().withCondition('Name = "' + masterAdGroup.getName() + CAMPAIGN_SUFFIX + '"').get();
                    var cloneAdGroupBroad = cloneCampaign.adGroups().withCondition('Name = "' + masterAdGroup.getName() + '"').get();
					
					if(LOG_DATA == "ON"){						
						Logger.log("Master AdGroup Name: " + masterAdGroup.getName());
					}

					if(cloneAdGroup.totalNumEntities()==0 && cloneAdGroupBroad.totalNumEntities()==0){					
						var adGroupBuilder = cloneCampaign.newAdGroupBuilder();
						var adGroupOperation = adGroupBuilder.withName(masterAdGroup.getName() + CAMPAIGN_SUFFIX).withStatus(STATUS).build();
						var newCloneAdGroup = adGroupOperation.getResult();
						
						if(LOG_DATA == "ON"){
							Logger.log("Cloned AdGroup Name: " + newCloneAdGroup.getName());
						}
					
						if(CLONED_LABEL=="ON"){
							adGroupOperation.getResult().applyLabel(LABEL);
						}
						
						var masterKeywordIterator = masterAdGroup.keywords().get();
            	   	 	var masterAdIterator = masterAdGroup.ads().get();
            	   	 	var masterNegativeKeywordIterator = masterAdGroup.negativeKeywords().get();
                  
						while(masterKeywordIterator.hasNext()){					
							var masterKeyword = masterKeywordIterator.next();
							var keywordOperation = newCloneAdGroup.newKeywordBuilder().withText(masterKeyword.getText()).build();
							var keyword = keywordOperation.getResult();
							
							if(LOG_DATA=="ON"){
								Logger.log("Master Keyword: " + masterKeyword.getText());
								Logger.log("Cloned Keyword: " + keyword.getText());
                                Logger.log("Cloned AdGroup: " + keyword.getAdGroup().getName());
							}
						
							if(CLONED_LABEL=="ON"){
								keyword.applyLabel(LABEL);
							}
						}
                  			
                    	while(masterAdIterator.hasNext()){
                    	    var masterAd = masterAdIterator.next();
						  	var newAdOperation = newCloneAdGroup.newTextAdBuilder().withHeadline(masterAd.getHeadline()).withDestinationUrl(masterAd.getDestinationUrl()).withDescription1(masterAd.getDescription1()).withDescription2(masterAd.getDescription2()).withDisplayUrl(masterAd.getDisplayUrl()).build();
                    	    var newAd = newAdOperation.getResult();
                        	
                        	if(LOG_DATA=="ON"){
								Logger.log("Master Ad: " + masterAd.getHeadline());
								Logger.log("Cloned Ad: " + newAd.getHeadline());
							}
                        	
                    	    if(CLONED_LABEL=="ON"){
                    		    newAd.applyLabel(LABEL);
                    	    }
						}
                  
                		while(masterNegativeKeywordIterator.hasNext()){
							newCloneAdGroup.createNegativeKeyword(masterNegativeKeywordIterator.next().getText());
							
							if(LOG_DATA=="ON"){
								Logger.log("Cloned Negative Keyword: " + masterNegativeKeywordIterator.next().getText());
							}
						}
            		}
				}
			}
		}
	}
}
function updateKeywords(CAMPAIGN_SUFFIX, CLONED_LABEL, LABEL){
  
/**
* This function iterates through all Master_Campaigns and Master_AdGroups and looks for Keywords.
* Then it checks the corresponding Clone_AdGroups if there are any Keywords missing.
* If so, it creates them as Clone_Keywords based on the properties of the Master_Keywords.
*/
  
	var labelIterator = AdWordsApp.labels().withCondition('Name = Master').get();
  
	while (labelIterator.hasNext()){   
		var label = labelIterator.next();
		var masterCampaigns = label.campaigns().get();
      
      	while(masterCampaigns.hasNext()){
        	var masterCampaign = masterCampaigns.next();    	
        	var campaignIterator = AdWordsApp.campaigns().withCondition('Name = "' + masterCampaign.getName() + CAMPAIGN_SUFFIX + '"').get();
    
    		if(campaignIterator.hasNext()){      
				var cloneCampaign = campaignIterator.next();
      			var masterAdGroupIterator = masterCampaign.adGroups().get();
      
      			while(masterAdGroupIterator.hasNext()){           		
        			var masterAdGroup = masterAdGroupIterator.next();
        			var cloneAdGroups = cloneCampaign.adGroups().withCondition('Name = "' + masterAdGroup.getName() + '"').get();
       				var masterKeywordIterator = masterAdGroup.keywords().get();
        
        	        if(cloneAdGroups.hasNext()){                   
        	        	var cloneAdGroup = cloneAdGroups.next();
        	            	
         				while(masterKeywordIterator.hasNext()){           
            				var masterKeyword = masterKeywordIterator.next();
            				var cloneKeywords = cloneAdGroup.keywords().withCondition("Text = '" + masterKeyword.getText() + "'").get();       
             
        					if(cloneKeywords.totalNumEntities()==0){              
          						var newKeyword = cloneAdGroup.newKeywordBuilder().withText(masterKeyword.getText()).build();
          						var keyword = newKeyword.getResult();
          					
          						if(CLONED_LABEL=="ON"){
         							keyword.applyLabel(LABEL);
         						}
                    	    }
          				}
        			}     		
      			}
    		}
  		}
	}
}
function updateNegativeKeywords(CAMPAIGN_SUFFIX){
  
/**
* This function iterates through all Master_Campaigns and Master_AdGroups and looks for negativeKeywords.
* Then it checks the corresponding Clone_AdGroups if there are any negativeKeywords missing.
* If so, it creates them as Clone_negativeKeywords based on the properties of the Master_negativeKeywords.
*/
  
	var labelIterator = AdWordsApp.labels().withCondition('Name = Master').get();
  
	while (labelIterator.hasNext()){    
    	var label = labelIterator.next();
		var masterCampaigns = label.campaigns().get();
      
      	while(masterCampaigns.hasNext()){
        	var masterCampaign = masterCampaigns.next();
        	var campaignIterator = AdWordsApp.campaigns().withCondition('Name = "' + masterCampaign.getName() + CAMPAIGN_SUFFIX + '"').get();
    
    		if(campaignIterator.hasNext()){      
    			var cloneCampaign = campaignIterator.next();
    			var masterAdGroupIterator = masterCampaign.adGroups().get();
      
      			while(masterAdGroupIterator.hasNext()){
        			var masterAdGroup = masterAdGroupIterator.next();
        			var cloneAdGroups = cloneCampaign.adGroups().withCondition("Name = '" + masterAdGroup.getName() + "'").get();
        			var masterNegativeKeywordIterator = masterAdGroup.negativeKeywords().get();
        
        	        if(cloneAdGroups.hasNext()){                
        	        	var cloneAdGroup = cloneAdGroups.next();
                	
        	  			while(masterNegativeKeywordIterator.hasNext()){            
        	    			var masterKeyword = masterNegativeKeywordIterator.next();
        	    			var cloneKeywords = cloneAdGroup.negativeKeywords().withCondition("Text = '" + masterKeyword.getText() + "'").get();       
             
        	    			if(cloneKeywords.totalNumEntities()==0){             
        	      				cloneAdGroup.createNegativeKeyword(masterKeyword.getText());
            	            }
         				}
        			}
      			}
    		}
  		}
	}
}
function updateAds(CAMPAIGN_SUFFIX, CLONED_LABEL, AD_SYNC, LABEL){
  
/**
* This function iterates through all Master_Campaigns and Master_AdGroups and looks for Ads.
* Then it checks the corresponding Clone_AdGroups if there are any Ads missing.
* If so, it creates them as Clone_Ads based on the properties of the Master_Ads.
*/
  	if(AD_SYNC == "ON"){
		var labelIterator = AdWordsApp.labels().withCondition('Name = Master').get();
  
		while (labelIterator.hasNext()){   
    		var label = labelIterator.next();
			var masterCampaigns = label.campaigns().get();
    
    	  	while(masterCampaigns.hasNext()){
    	    	var masterCampaign = masterCampaigns.next();
    	    	var campaignIterator = AdWordsApp.campaigns().withCondition('Name = "' + masterCampaign.getName() + CAMPAIGN_SUFFIX + '"').get();
    	
    			if(campaignIterator.hasNext()){      
      				var cloneCampaign = campaignIterator.next();
      				var masterAdGroupIterator = masterCampaign.adGroups().get();
      
      				while(masterAdGroupIterator.hasNext()){      		
						var masterAdGroup = masterAdGroupIterator.next();
        				var cloneAdGroups = cloneCampaign.adGroups().withCondition("Name = '" + masterAdGroup.getName() + "'").get();
        				var masterAdsIterator = masterAdGroup.ads().get();
        
            		    if(cloneAdGroups.hasNext()){                
            	    		var cloneAdGroup = cloneAdGroups.next();
                	
          					while(masterAdsIterator.hasNext()){            
            					var masterAd = masterAdsIterator.next();
            					var cloneAds = cloneAdGroup.ads().withCondition("Headline = '" + masterAd.getHeadline() + "'").get();       
             
            					if(cloneAds.totalNumEntities()==0){              
			  						var newAdOperation = cloneAdGroup.newTextAdBuilder().withHeadline(masterAd.getHeadline()).withDestinationUrl(masterAd.getDestinationUrl()).withDescription1(masterAd.getDescription1()).withDescription2(masterAd.getDescription2()).withDisplayUrl(masterAd.getDisplayUrl()).build(); 
			  						var newAd = newAdOperation.getResult();
			  					
			  						if(CLONED_LABEL=="ON"){
			  							newAd.applyLabel(LABEL);
			  						}
			  					}
                    	    }
          				}
        			}      		
      			}
    		}
  		}
	}
}
function removeAds(CAMPAIGN_SUFFIX, REMOVE_CLONED_ENTITIES, AD_SYNC, LABEL){
  
/**
* This function iterates through all Master_Campaigns and Master_AdGroups and looks for Ads.
* Then it checks the corresponding Clone_AdGroups if there are any Ads which are not existent in the Master_AdGroup.
* If so, it deletes the Clone_Ads.
*/
  	if(REMOVE_CLONED_ENTITIES=="ON"){
  		if(AD_SYNC=="ON"){
			var labelIterator = AdWordsApp.labels().withCondition('Name = Master').get();
  
  			while (labelIterator.hasNext()){    
    			var label = labelIterator.next();
				var masterCampaigns = label.campaigns().get();
      
    		  	while(masterCampaigns.hasNext()){
    	    		var masterCampaign = masterCampaigns.next();
    	    		var campaignIterator = AdWordsApp.campaigns().withCondition('Name = "' + masterCampaign.getName() + CAMPAIGN_SUFFIX + '"').get();
	
		   			if(campaignIterator.hasNext()){      
    		  			var cloneCampaign = campaignIterator.next();
    					var masterAdGroupIterator = masterCampaign.adGroups().get();
      
    		  			while(masterAdGroupIterator.hasNext()){   
    	  			  		var masterAdGroup = masterAdGroupIterator.next();
    	    				var cloneAdGroups = cloneCampaign.adGroups().withCondition("Name CONTAINS_IGNORE_CASE '" + masterAdGroup.getName() + "'").get();
                  
    	        	 		if(cloneAdGroups.hasNext()){                  	
       		        		 	var cloneAdGroup = cloneAdGroups.next();                    
        						var cloneAdsIterator = cloneAdGroup.ads().get();
        						var masterAdsIterator = masterAdGroup.ads().get();      
    							var masterAds = {};
    	
    	 						while(masterAdsIterator.hasNext()){         
    	  							var masterAd = masterAdsIterator.next();
          							masterAds[masterAd.getHeadline()] = masterAd.getHeadline();
    							}
        	
        						while(cloneAdsIterator.hasNext()){              
          							var cloneAd = cloneAdsIterator.next();
             	
        							if(!(cloneAd.getHeadline() in masterAds)){         					
            	       		 			var cloneLabelIterator = cloneAd.labels().get();
                        	
            	       		 			if(cloneLabelIterator.hasNext()){                           
        	    	    	    			var cloneLabel = cloneLabelIterator.next();
                            	
                    	    				if(cloneLabel.getName()==LABEL){                          		
                        						cloneAd.remove();
                        					}
                        	    		}
                        	  		}
                        		}		
          					}	
        				}
      				}
    			}
			}
		}
		else{
		}
	}
	else{
	}
}
function removeKeywords(CAMPAIGN_SUFFIX, REMOVE_CLONED_ENTITIES, LABEL){
  
/**
* This function iterates through all Master_Campaigns and Master_AdGroups and looks for Keywords.
* Then it checks the corresponding Clone_AdGroups if there are any Keywords which are not existent in the Master_AdGroup.
* If so, it deletes the Clone_Keywords.
*/
  	if(REMOVE_CLONED_ENTITIES=="ON"){
		var labelIterator = AdWordsApp.labels().withCondition('Name = Master').get();
  
		while (labelIterator.hasNext()){    
    		var label = labelIterator.next();
			var masterCampaigns = label.campaigns().get();
      
    	  	while(masterCampaigns.hasNext()){
     	   		var masterCampaign = masterCampaigns.next();
      		  	var campaignIterator = AdWordsApp.campaigns().withCondition('Name = "' + masterCampaign.getName() + CAMPAIGN_SUFFIX + '"').get();

    			if(campaignIterator.hasNext()){      
    			  	var cloneCampaign = campaignIterator.next();
    			  	var masterAdGroupIterator = masterCampaign.adGroups().get();
      
    				while(masterAdGroupIterator.hasNext()){  
        				var masterAdGroup = masterAdGroupIterator.next();
      					var cloneAdGroups = cloneCampaign.adGroups().withCondition("Name CONTAINS_IGNORE_CASE '" + masterAdGroup.getName() + "'").get();
                  
        	    	  	if(cloneAdGroups.hasNext()){
        	    	   		var cloneAdGroup = cloneAdGroups.next();
        					var cloneKeywordsIterator = cloneAdGroup.keywords().get();
        					var masterKeywordsIterator = masterAdGroup.keywords().get();
        	    	        var cloneLabelIterator = AdWordsApp.labels().withCondition('Name = "' + LABEL + '"').get();
    						var masterKeywords = {};
        	    	        var cloneLabels = {};
    
       		 		 		while(masterKeywordsIterator.hasNext()){
     			 				var masterKeyword = masterKeywordsIterator.next();     					
    						 	masterKeywords[masterKeyword.getText()] = masterKeyword.getText();      					  
    						}
                  
            	        	if(cloneLabelIterator.hasNext()){
            	        	    var cloneLabel = cloneLabelIterator.next(); 
                	    	    var cloneLabelKeywords = cloneLabel.keywords().get();
                      
                    		    while(cloneLabelKeywords.hasNext()){
                        		  var cloneLabelKeyword =  cloneLabelKeywords.next(); 
                        		  cloneLabels[cloneLabelKeyword.getText()] = LABEL;
                        		}
                    		}
                         
                  			while(cloneKeywordsIterator.hasNext()){
                    			var cloneKeyword = cloneKeywordsIterator.next();
                    
                     			if(!(cloneKeyword.getText() in masterKeywords)&&(cloneKeyword.getText() in cloneLabels)){
                        	       cloneKeyword.remove();
                        		}
                        	}  
                    	}
      				}
    			}
			}
		}
	}
	else{
	}
}
function pauseAdGroups(CAMPAIGN_SUFFIX, REMOVE_CLONED_ENTITIES, LABEL){
  
/**
* This function iterates through all Master_Campaigns and looks for AdGroups.
* Then it checks the corresponding Clone_Campaigns if there are any AdGroups which are not existent in the Master_Campaign.
* If so, it pauses the Clone_AdGroups including all of its Ads and Keywords.
*/
  	if(REMOVE_CLONED_ENTITIES=="ON"){
		var labelIterator = AdWordsApp.labels().withCondition('Name = Master').get();
  
	  	while (labelIterator.hasNext()){
	    	var label = labelIterator.next();
			var masterCampaigns = label.campaigns().get();
      
	      	while(masterCampaigns.hasNext()){
   		     	var masterCampaign = masterCampaigns.next();
        		var campaignIterator = AdWordsApp.campaigns().withCondition('Name = "' + masterCampaign.getName() + CAMPAIGN_SUFFIX + '"').get();
	
    			if(campaignIterator.hasNext()){
    	 			var cloneCampaign = campaignIterator.next();
     				var masterAdGroupsIterator = masterCampaign.adGroups().get();
     				var cloneAdGroupsIterator = cloneCampaign.adGroups().get();
      				var masterAdGroups = {};
      
     	 			while(masterAdGroupsIterator.hasNext()){
        				var masterAdGroup = masterAdGroupsIterator.next();
        				masterAdGroups[masterAdGroup.getName()] = masterAdGroup.getName();
      				}
      
      				var keywords = {};
      				var ads = {};
      
      				while(cloneAdGroupsIterator.hasNext()){
        				var cloneAdGroup = cloneAdGroupsIterator.next();
             
        				if(!(cloneAdGroup.getName().replace(CAMPAIGN_SUFFIX, "") in masterAdGroups)){
            		   		cloneAdGroup.pause();
            		   		var cloneAds = cloneAdGroup.ads().get();  
            		   		var cloneKeywords = cloneAdGroup.keywords().get();
            	
            				while(cloneAds.hasNext()){
             					var cloneAd = cloneAds.next();
              					cloneAd.remove();
            				}
            
            				while(cloneKeywords.hasNext()){
             					var cloneKeyword = cloneKeywords.next();
              					cloneKeyword.remove();
              				}
            			}
         			}	
      			}
    		}
		}
	}
	else{
	}
}
function removeNegativeKeywords(CAMPAIGN_SUFFIX, REMOVE_CLONED_ENTITIES){
  
/**
* This function iterates through all Master_Campaigns and Master_AdGroups and looks for NegativeKeywords.
* Then it checks the corresponding Clone_AdGroups if there are any NegativeKeywords which are not existent in the Master_AdGroup.
* If so, it deletes the Clone_NegativeKeywords.
*/
  	if(REMOVE_CLONED_ENTITIES=="ON"){
		var labelIterator = AdWordsApp.labels().withCondition('Name = Master').get();
  
		while (labelIterator.hasNext()){    
    		var label = labelIterator.next();
			var masterCampaigns = label.campaigns().get();
    	  
    	  	while(masterCampaigns.hasNext()){
    	    	var masterCampaign = masterCampaigns.next();
    	    	var campaignIterator = AdWordsApp.campaigns().withCondition('Name = "' + masterCampaign.getName() + CAMPAIGN_SUFFIX + '"').get();

		    	if(campaignIterator.hasNext()){      
    			  	var cloneCampaign = campaignIterator.next();
    			  	var masterAdGroupIterator = masterCampaign.adGroups().get();
      
    				while(masterAdGroupIterator.hasNext()){
    	    	   		var masterAdGroup = masterAdGroupIterator.next();
    	  				var cloneAdGroups = cloneCampaign.adGroups().withCondition("Name = '" + masterAdGroup.getName() + "'").get();
                  
    	    	        if(cloneAdGroups.hasNext()){                
        		            var cloneAdGroup = cloneAdGroups.next();                   
        					var cloneKeywordsIterator = cloneAdGroup.negativeKeywords().get();
        					var masterKeywordsIterator = masterAdGroup.negativeKeywords().get();       
        					var masterKeywords = {};
    	
        			 		while(masterKeywordsIterator.hasNext()){         
        			 			var masterKeyword = masterKeywordsIterator.next();
        		  				var i = 0;
        		  				masterKeywords[masterKeyword.getText()] = masterKeyword.getText();
        		  				i++;    
        					}
        	
        					while(cloneKeywordsIterator.hasNext()){              	
          						var cloneKeyword = cloneKeywordsIterator.next();
             
        						if(!(cloneKeyword.getText() in masterKeywords)){
            						cloneKeyword.remove();
            		            }
          					}
        				}
        			}
				}
			}
		}
	}
	else{
	}
}
function statusSync(CAMPAIGN_SUFFIX, STATUS_SYNC){
	
	if(STATUS_SYNC == "ON"){
	
		var labelIterator = AdWordsApp.labels().withCondition('Name = Master').get();
		
		while (labelIterator.hasNext()) { 
			var label = labelIterator.next();
			var masterCampaigns = label.campaigns().get();
      
      		while(masterCampaigns.hasNext()){
        		var masterCampaign = masterCampaigns.next();
        		var masterCampaignName = label.campaigns().get().next().getName();  	
				var campaignIterator = AdWordsApp.campaigns().withCondition('Name = "' + masterCampaignName + CAMPAIGN_SUFFIX + '"').get();
		
				if(campaignIterator.hasNext()) {          
					var cloneCampaign = campaignIterator.next();
            	  	if(masterCampaign.isEnabled()){
						cloneCampaign.enable();
            	  	}
            	  	if(masterCampaign.isPaused()){
            	    	cloneCampaign.pause();
            	  	}
            	  	if(masterCampaign.isRemoved()){
            	    	cloneCampaign.pause();
            	  	}
              
			 		var masterAdGroupIterator = masterCampaign.adGroups().get();
          
					while (masterAdGroupIterator.hasNext()) {                 
						var masterAdGroup = masterAdGroupIterator.next();        
						var cloneAdGroups = cloneCampaign.adGroups().withCondition('Name = "' + masterAdGroup.getName() + '"').get();
					
                	  	while(cloneAdGroups.hasNext()){                    
                	  		var cloneAdGroup = cloneAdGroups.next();
                    
                	    	if(masterAdGroup.isEnabled()){
                	     		cloneAdGroup.enable(); 
                	    	}
                	    	if(masterAdGroup.isPaused()){
                	      		cloneAdGroup.pause();
                	    	}
                	    	if(masterAdGroup.isRemoved()){
                	      		cloneAdGroup.pause(); 
                	    	}
                    	                    
                    		var masterKeywordIterator = masterAdGroup.keywords().get();
                    
                    		while(masterKeywordIterator.hasNext()){
                    	    
                      			var masterKeyword = masterKeywordIterator.next();
                      			var cloneKeywords = cloneAdGroup.keywords().withCondition("Text='" + masterKeyword.getText() + "'").get();
                      
                      			while(cloneKeywords.hasNext()){
                        			var cloneKeyword = cloneKeywords.next();
                        
                       		 		if(masterKeyword.isEnabled()){
                        	  			cloneKeyword.enable();
                        			}
                        			if(masterKeyword.isPaused()){
                         				cloneKeyword.pause(); 
                        			}
                      			}                      
                    		}	
                    
                  		  	var masterAdIterator = masterAdGroup.ads().get();
                    
                    		while(masterAdIterator.hasNext()){                     
                      			var masterAd = masterAdIterator.next();
                      			var cloneAds = cloneAdGroup.ads().withCondition("Headline='" + masterAd.getHeadline() + "'").get();
                      
                      			while(cloneAds.hasNext()){                       
                        			var cloneAd = cloneAds.next();
                        
                        			if(masterAd.isEnabled()){
                        				cloneAd.enable(); 
                        			}
                        			if(masterAd.isPaused()){
                        	  			cloneAd.pause();
                        			}
                        		}                        
                      		}                      
                    	}
					}
				}
			}
		}
	}	
	else{    
  	}
}

/***************** FUNCTION_BLOCK END *****************/
