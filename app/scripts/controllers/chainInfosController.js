var BigNumber = require('bignumber.js');

angular.module('ethExplorer')
    .controller('chainInfosCtrl', function ($rootScope, $scope, $location, $routeParams, $q) {

        $scope.init=function()
        {
            web3call("updateStats", [], function(st) {
                 $scope.blockNumber = st.blockNum;
                 $scope.blockNum = st.blockNum;

                 // difficulty
                 $scope.difficulty = st.difficulty;
                 $scope.difficultyToExponential = st.difficultyToExponential;

                 $scope.totalDifficulty = st.totalDifficulty;
                 $scope.totalDifficultyToExponential = st.totalDifficultyToExponential;
                 $scope.totalDifficultyDividedByDifficulty = st.totalDifficultyDividedByDifficulty;
                 $scope.totalDifficultyDividedByDifficulty_formatted = $scope.totalDifficultyDividedByDifficulty; //.toFormat(1);

                 $scope.AltsheetsCoefficient = st.AltsheetsCoefficient;
                 $scope.AltsheetsCoefficient_formatted = $scope.AltsheetsCoefficient; //.toFormat(4);
                // large numbers still printed nicely:
                 $scope.difficulty_formatted = $scope.difficulty; //.toFormat(0);
                 $scope.totalDifficulty_formatted = $scope.totalDifficulty; //.toFormat(0);

                 // Gas Limit
                 $scope.gasLimit = new BigNumber(st.gasLimit); //.toFormat(0) + " m/s";

                 // Time
                 $scope.time = st.time;

                 $scope.secondsSinceBlock1 = st.secondsSinceBlock1;
                 $scope.daysSinceBlock1 = st.daysSinceBlock1;


                 // Average Block Times:
                 // TODO: make fully async, put below into 'fastInfosCtrl'
                $scope.blocktime = st.blocktime;

                 $scope.range1 = st.range1;
                 $scope.blocktimeAverage1 = st.blocktimeAverage1;
                 $scope.range2 = st.range2;
                 $scope.blocktimeAverage2 = st.blocktimeAverage2;
                 $scope.range3 = st.range3;
                 $scope.blocktimeAverage3 = st.blocktimeAverage3;
                 $scope.range4 = st.range4;
                 $scope.blocktimeAverage4 = st.blocktimeAverage4;

                 $scope.blocktimeAverageAll = st.blocktimeAverageAll;

                 // Block Explorer Info
                 $scope.isConnected = st.isconnected;
                 $scope.versionApi = st.versionApi;
                 $scope.versionClient = st.versionClient;
                 $scope.versionCurrency = st.versionCurrency;

                 $scope.versionWhisper = st.versionWhisper;
            })  
        };
        $scope.init();
        console.log($scope.result);

// function: String - the name of the method of attribute
// args[]: arguments
async function web3call(web3Func, args, callBack) {
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
   callBack(body.result);
}
});
