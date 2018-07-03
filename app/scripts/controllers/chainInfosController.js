var BigNumber = require('bignumber.js');

angular.module('ethExplorer')
    .controller('chainInfosCtrl', function ($rootScope, $scope, $location, $routeParams, $q) {

        $scope.init=function()
        {
            getChainInfos()
                .then(function(result){

	                $scope.result = result;  // just a dummy value, but following Whit's example.

	                web3call("eth.blockNumber", function(result) { 
                        // now that was easy
	                $scope.blockNum = result; // now that was easy

	                if($scope.blockNum!==undefined){

	                	// TODO: put the 2 web3.eth.getBlock into the async function below
	                	//       easiest to first do with fastInfosCtrl
	                    web3call("eth.getBlock", [$scope.blockNum], function(result) {
	                    var blockNewest = JSON.parse(result);

	                    if(blockNewest!==undefined){

		                    // difficulty
		                    $scope.difficulty = blockNewest.difficulty;
		                    $scope.difficultyToExponential = blockNewest.difficulty.toExponential(3);

		                    $scope.totalDifficulty = blockNewest.totalDifficulty;
		                    $scope.totalDifficultyToExponential = blockNewest.totalDifficulty.toExponential(3);

		                    $scope.totalDifficultyDividedByDifficulty = $scope.totalDifficulty.dividedBy($scope.difficulty);
		                    $scope.totalDifficultyDividedByDifficulty_formatted = $scope.totalDifficultyDividedByDifficulty.toFormat(1);

		                    $scope.AltsheetsCoefficient = $scope.totalDifficultyDividedByDifficulty.dividedBy($scope.blockNum);
		                    $scope.AltsheetsCoefficient_formatted = $scope.AltsheetsCoefficient.toFormat(4);

		                    // large numbers still printed nicely:
		                    $scope.difficulty_formatted = $scope.difficulty.toFormat(0);
		                    $scope.totalDifficulty_formatted = $scope.totalDifficulty.toFormat(0);

		                    // Gas Limit
		                    $scope.gasLimit = new BigNumber(blockNewest.gasLimit).toFormat(0) + " m/s";

		                    // Time
	                        var newDate = new Date();
	                        newDate.setTime(blockNewest.timestamp*1000);
	                        $scope.time = newDate.toUTCString();

	                        $scope.secondsSinceBlock1 = blockNewest.timestamp - 1438226773;
	                        $scope.daysSinceBlock1 = ($scope.secondsSinceBlock1 / 86400).toFixed(2);
                                }
                                });

	                        // Average Block Times:
	                        // TODO: make fully async, put below into 'fastInfosCtrl'

	                        web3call("eth.getBlock", [$scope.blockNum - 1], function(result) {
	                        var blockBefore = JSON.parse(result);
	                        if(blockBefore!==undefined){
			                    $scope.blocktime = blockNewest.timestamp - blockBefore.timestamp;
	                        }
	                        $scope.range1=100;
	                        range = $scope.range1;
                                });

	                        web3call("eth.getBlock", [Math.max($scope.blockNum - range,0)], function(result) {
	                        var blockPast = JSON.parse(result);
	                        if(blockBefore!==undefined){
			                    $scope.blocktimeAverage1 = ((blockNewest.timestamp - blockPast.timestamp)/range).toFixed(2);
	                        }
	                        $scope.range2=1000;
	                        range = $scope.range2;
                                });

	                        web3call("eth.getBlock", [Math.max($scope.blockNum - range,0)], function(result) {
	                        var blockPast = JSON.parse(result);
	                        if(blockBefore!==undefined){
			                    $scope.blocktimeAverage2 = ((blockNewest.timestamp - blockPast.timestamp)/range).toFixed(2);
	                        }
	                        $scope.range3=10000;
	                        range = $scope.range3;
                                });

	                        web3call("eth.getBlock", [Math.max($scope.blockNum - range,0)], function(result) {
	                        var blockPast = JSON.parse(result);
	                        if(blockBefore!==undefined){
			                    $scope.blocktimeAverage3 = ((blockNewest.timestamp - blockPast.timestamp)/range).toFixed(2);
	                        }
	                        $scope.range4=100000;
	                        range = $scope.range4;
                                });

	                        web3call("eth.getBlock", [Math.max($scope.blockNum - range,0)], function(result) {
	                        var blockPast = JSON.parse(result);
	                        if(blockBefore!==undefined){
			                    $scope.blocktimeAverage4 = ((blockNewest.timestamp - blockPast.timestamp)/range).toFixed(2);
	                        }

	                        range = $scope.blockNum;
                                });

	                        web3call("eth.getBlock", [1], function(result) {
	                        var blockPast = JSON.parse(result);
	                        if(blockBefore!==undefined){
			                    $scope.blocktimeAverageAll = ((blockNewest.timestamp - blockPast.timestamp)/range).toFixed(2);
	                        }

                                });
	                        //fastAnswers($scope);
	                        //$scope=BlockExplorerConstants($scope);

	                    }
                        });

	                // Block Explorer Info

	                web3call("isConnected", function(result) {
	                    $scope.isConnected = result;
                        });
	                //$scope.peerCount = web3.net.peerCount;
	                web3call("version.api", function(result) {
	                    $scope.versionApi = result;
                        }); 
	                web3call("version.client", function(result) {
	                    $scope.versionClient = result;
                        });
	                web3call("version.network", function(result) {
	                    $scope.versionNetwork = result;
                        });
	                web3call("version.ethereum", function(result) { 
                        // TODO: change that to currencyname?
	                      $scope.versionCurrency = result;
                        });

	                // ready for the future:
	                try { 
                           web3call("version.whisper", function(result) {
                              $scope.versionWhisper = result; 
                           })
                        }
	                catch(err) {$scope.versionWhisper = err.message; }

                });

            function getChainInfos(){
                var deferred = $q.defer();
                deferred.resolve(0); // dummy value 0, for now. // see blockInfosController.js
                return deferred.promise;
            }
        };
        $scope.init();
        console.log($scope.result);

// function: String - the name of the method of attribute
// args[]: arguments
async function web3call(web3Func, args) {
   const api_path = "https://linkgear.net:8091/auth/local/web3call";
   const res = await fetch(api_path, {
       method: 'POST',
       headers: {
              'Content-Type': 'application/json'
              },
       body: JSON.stringify({
                web3Func,
                args
             }),
            credentials: 'include',
       })

   const body = await res.json()
   console.log(body.result)
   return body.result;
}
});
