// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic','ngCordova','chart.js'])

.run(function($ionicPlatform, $cordovaHealthKit) {
  $ionicPlatform.ready(function() {

    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    

    $cordovaHealthKit.isAvailable().then(function(yes) {
        // HK is available
        var permissions = ['HKQuantityTypeIdentifierHeartRate'];
     
        $cordovaHealthKit.requestAuthorization(
            permissions, // Read permission
            permissions // Write permission
        ).then(function(success) {
            // store that you have permissions
            console.log('good shit')
        }, function(err) {
            // handle error
            console.log(err);
        });
     
    }, function(no) {
        // No HK available
    });

  });

})

.controller('mainCtrl', function($scope, $ionicPlatform, $state, $cordovaHealthKit, $rootScope) {

  $scope.body = {};
  $scope.hpMode = false;
  $scope.data = [[]]; 
  $scope.labels = [];
  $scope.timestamps = {};
  $scope.score = 0;

  $scope.onGlanceRequestsUpdate = function() {
    applewatch.loadGlance({
      'label2': {'value': ($scope.body.hasOwnProperty('heartrate'))?$scope.body.heartrate:'Receiving no heartrate data.', 'color' : '#FFFFFF'}
    })
  }

  /*window.highPrecisionMode = function(){
    console.log('sup bruh'); 
    $scope.hpMode = true;
    window.plugins.healthkit.querySampleType({
      startDate: new Date(new Date().getTime() - 1000), 
      endDate: new Date(), 
      sampleType: 'HKQuantityTypeIdentifierHeartRate',
      unit: 'count/min'
    },
    function(v) {
      angular.forEach(v, function(value, key){
         $scope.data[0].push(value.quantity);
         $scope.labels.push(value.startDate);
      });

      $scope.score = Math.pow(10,  1 - (1 /(Math.max.apply(null, $scope.data) - Math.min.apply(null, $scope.data))));

      $scope.$digest();
    },
    function(err) {
        console.log(err);
    });
  }*/

  $scope.onAppRequestsUpdate = function() {
     var payload = {
      'label2': { // optional, max 2 lines
        'value': 'UI built @ ' + new Date(),
        'color': '#FFFFFF',
        'font': {
          'size': 8 // default 12
        }
      },
      'actionButton': { 
        'title': { 'value': 'Activate Sex Mode' },
        'backgroundColor': '#FFA500',
        'width': 80,
        'height': 80,
        'callback': 'window.onSexButton'
      }
    };
    applewatch.loadAppMain(payload);
  }

  window.onSexButton = function(){
    var payload = {
      'table': {
        'callback': 'onSexModeDisabled',
        'rows': [
          {
            'type': 'OneColumnRowType',
            'group': {
              'backgroundColor': '#1884C4',
              'cornerRadius': 8
            },
            'label': {
              'value': '  Sex Mode!'
            },
            'imageLeft': {
              'src': 'www/img/ionic.png',
              'width': 25,
              'height': 30
            },
            'imageRight': {
              'src' : 'www/img/ionic.png',
              'width': 25,
              'height': 30
            }
          },
          {
            'type': 'OneColumnSelectableRowType',
            'group': {
              'backgroundColor': '#7884C4',
              'cornerRadius': 8
            },
            'label': {
              'value': 'Disactivate Sex Mode'
            }
          },
          {
            'type': 'OneColumnRowType',
            'group': {
              'backgroundColor': '#FFA500',
              'cornerRadius': 8
            },
            'label': {
              'value': 'RYSE Demo'
            }
          }

        ]
      }
    }
    applewatch.loadAppMain(payload);

    
    window.plugins.healthkit.monitorSampleType({
      sampleType: 'HKQuantityTypeIdentifierHeartRate',
      unit: 'count/min'
    }, function(v){
      $scope.hpMode = true;
      console.log('got that little wimp');
      window.plugins.healthkit.querySampleType({
        startDate: new Date(new Date().getTime() - 1000 * 60),
        endDate: new Date(), 
        sampleType: 'HKQuantityTypeIdentifierHeartRate',
        unit: 'count/min',
        limit: '1',
        descending: 'T'
      },
      function(v2) {
        console.log('v2',v2);
        angular.forEach(v2, function(value, key){
          if(typeof $scope.timestamps[value.startDate] == 'undefined'){
            $scope.data[0].push(value.quantity);
            $scope.labels.push(value.startDate);
            $scope.timestamps[value.startDate] = true;
          }
        
        });
        $scope.score = Math.pow(10,  1 - (3 /(Math.max.apply(null, $scope.data[0]) - Math.min.apply(null, $scope.data[0]))));
        $scope.$digest();
      },
      function(err) {
          console.log(err);
      });
    });

   // window.hpmId = setInterval(window.highPrecisionMode, 1000);
  }

  window.onSexModeDisabled = function(){
    //clearInterval(window.hpmId);
    $scope.onAppRequestsUpdate();
    $scope.hpMode = false;
    $scope.$digest();
  }

  document.addEventListener('deviceready', function(){

    console.log('device ready');
    applewatch.init(function(appGroupID){
      //applewatch.callback.onLoadAppMainRequest = $scope.onAppRequestsUpdate;
      //applewatch.callback.onLoadGlanceRequest = $scope.onGlanceRequestsUpdate;
      applewatch.sendMessage('sup', 'coolQueue', function(success){ console.log('yeah');}, function(err){ console.log('nah')});
      applewatch.addListener("coolQueue", function (message) {
        // handle your message here
        console.log('got the thing: '+message);
      });

      console.log('bound our friends');
    }, function(e){ console.error(e); }, 'group.com.isodevelopers.ryseDemo');
    console.log('end device ready');
  }, false);

  $scope.heartRate = function() {
      window.plugins.healthkit.querySampleType({
        startDate: new Date(new Date().getTime() - 1000 * 60), 
        endDate: new Date(), 
        sampleType: 'HKQuantityTypeIdentifierHeartRate',
        unit: 'count/min'
      },
      function(v) {
        $scope.readings = v;
        $scope.$digest();
      },
      function(err) {
          console.log(err);
      });
  };

  $scope.fakeHeartRate = function() {
    window.plugins.healthkit.saveQuantitySample({
      startDate: new Date(),
      endDate: new Date(), 
      sampleType: 'HKQuantityTypeIdentifierHeartRate',
      unit: 'count/min',
      amount: $scope.body.heartrate
    }, function(v){
      $scope.heartRate();
    });
  }

});
