angular.module('Odometer', [ 'ui.odometer' ]);

angular
    .module('Odometer')
    .component(
      'scriptrOdometer',
      {

        bindings : {

         "onLoad" : "&onLoad",

          "api" : "@",

          "theme" : "@",

          "duration" : "@",

          "animation" : "@",

          "transport" : "@",
          
          "odometerValue" : "<?",

          "msgTag" : "@",

          "apiParams" : "<?",
          
          "size": "<?",
          
          "onFormatData" : "&"

        },
        templateUrl: '/UIComponents/dashboard/frontend/components/odometer/odometer.html',
        controller: function(httpClient, wsClient, $element, $window, $timeout) {

           var self = this;

           this.$onInit = function() {
             this.config = {
               duration: (this.duration) ? this.duration : 1000,
               animation: (this.animation) ? this.animation : "count",
               theme: (this.theme) ? this.theme : "car",
             }
             this.odometerOptions = this.config;
             this.odometerValue = (this.odometerValue) ? this.odometerValue : 0;
             this.size = (this.size) ? this.size : 1;
             
             this.style = {};
             this.style["font-size"] = this.size+"em";
             angular.element($window).on('resize', resize);
               
             

             this.transport = (this.transport) ? this.transport : "wss";
             this.msgTag = (this.msgTag) ? this.msgTag : null;

             initDataService(this.transport);
           }
           
           var resize = function(){
           		self.style["margin-top"] = ($element.parent().height()/2) - ($element.parent().position().top/2) - ($element.height()/2);
          }
           
           this.$postLink = function() {
                $timeout(resize,100);
             	//this.speedoConfig.gaugeRadius = (w >= h) ? ((h / 2) - 20) : ((w / 2) - 20)

           }

            var initDataService = function(transport) {
              if (transport == "wss") {
                  wsClient.onReady.then(function() {
                    // Subscribe to socket messages with id chart
                    wsClient.subscribe(self.msgTag, self.consumeData.bind(self));
                    if(self.api) {
                        wsClient.call(self.api, self.apiParams, self.msgTag)
                          .then(function(data, response) {
                          self.consumeData(data)
                        },
                        function(err) {
                          console.log( "reject published promise", err);
                          self.consumeData();
                        });
                    }

                  });
              } else {
                if (transport == "https" && self.api) {
                    httpClient
                      .get(self.api, self.apiParams)
                      .then(
                      function(data, response) {
                        self.consumeData(data)
                      },
                      function(err) {
                        console
                          .log(
                          "reject published promise",
                          err);
                      });
                }
              }
            }

            this.consumeData = function(data, response) {
               if(typeof self.onFormatData() == "function"){
                 data = self.onFormatData()(data);
               }
              this.odometerValue = data;
            }
        }
      });
