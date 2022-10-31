angular.module('app', ['fcsa-number']).controller('MainCtrl', function() {

  this.model = {

    numberNoOptions: 0,

    numberMax: 9,

    numberMin: 1,

    numberMaxDecimals: 9.87,

    numberMaxDigits: 393,

    numberPrepend: 5.97,

    numberAppend: 100,

    numberMultipleOptions: 1.25

  };

});