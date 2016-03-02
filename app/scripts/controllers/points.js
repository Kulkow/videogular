'use strict';
angular.module('myApp').controller('PointsCtrl',
    function ($sce,$http) {
        this.consoleCuePointsMessages = "click play to see cue points bindings!\n";
        this.API = null;
        this.chapterSelected = {};
        this.playbackSelected = {value :1};
        this.pointsUrl = '/ajax/points.php';
        this.points = [];
        this.sync = 0;
        this.videosAPI = [];

        this.onUpdateState = function (state, type) {
            this.state = state;
            var sync_type = ('left' == type ? 'right' : 'left')
            var VAPI = this.videosAPI[sync_type];
            if(this.sync){
                if(VAPI.currentState != state){
                    VAPI.currentState = state;
                    switch (state) {
                        case 'play':
                            VAPI.play()
                            break;

                        case 'pause':
                            VAPI.pause();
                            break;

                        case 'stop':
                            VAPI.stop();
                            break;
                    }
                }
            }
        };

        var ctrl = this;
        this.onPlayerReady = function (API, type) {
            this.API = API;
            this.videosAPI[type] = API;

            var data = {'id' : 11, 'user' : 10};
            var config = {};
            if('left' == type) {
                $http.post(this.pointsUrl, data, config).then(function (response) {
                    ctrl.setPoints(response.data.points);
                }, function () {
                });
            }
        };

        this.media = {
            left: [
                    {
                        src: $sce.trustAsResourceUrl("/assets/video/videogular.mp4"),
                        type: "video/mp4"
                    }
                ],
            right :  [
                    {
                        src: $sce.trustAsResourceUrl("/assets/video/videogular.mp4"),
                        type: "video/mp4"
                    }
                ]
            };

        /**
         * actions left menu
         * */
        var actions = [
            'comment',
            'left',
            'left_up',
            'up',
            'right_up',
            'right',
            'right_down',
            'down',
            'left_down',
        ];
        this.menu = [];
        for (var i = 0, l = actions.length; i < l; i++) {
            var action = actions[i];
            this.menu.push({'icon' : action, 'url' : '/points/'+action,});
        }


        this.defaulPointInterval = 5;
        //status points
        this.statusPoints = function(currentTime) {
            var status = 0;
            for (var i = 0, l = this.points.length; i < l; i++) {
                if (!this.points[i].end) {
                    this.points[i].end = this.points[i].start + this.defaulPointInterval;
                }
                if(currentTime >= this.points[i].start) {
                    if (!!this.points[i].end) {
                        if (currentTime > this.points[i].end) {
                            status = 0;
                        }else{
                            status = 1;
                        }
                    } else {
                        status = 0;
                    }
                }else{
                    status = 0;
                }
                this.points[i].status = status;
            }
        }
        // Chapters
        this.onChaptersCuePoint = function onChaptersCuePoint(currentTime, timeLapse, params) {
            this.chapterSelected = this.commonConfig.cuePoints.chapters[params.index];
        };

        this.onUpdateTime = function (currentTime, totalTime) {
            this.statusPoints(currentTime);
        };


        this.onChangeChapter = function onChangeChapter() {
            this.API.seekTime(this.chapterSelected.value);
        };

        this.onChangePlayback = function onChangePlayback() {
            if(this.sync){
                for(var i in this.videosAPI){
                    var VAPI = this.videosAPI[i];
                    VAPI.setPlayback(this.playbackSelected);
                }
            }else{
                this.API.setPlayback(this.playbackSelected);
            }
        };

        this.setPoints = function(points){
            this.points = points;
            this.setcuePoints();
        }
        this.setcuePoints = function(){
            var _chapters = [];
            for (var i = 0, l = this.points.length; i < l; i++) {
                var point = this.points[i];
                var chapter = {
                    timeLapse: {
                        start: point.start
                    },
                    onEnter: this.onChaptersCuePoint.bind(this),
                    onLeave: this.onChaptersCuePoint.bind(this),
                    onUpdate: this.onChaptersCuePoint.bind(this),
                    onComplete: this.onChaptersCuePoint.bind(this),
                };
                chapter.params = point;
                chapter.params.index = i;
                if(!!point.end){
                    chapter.timeLapse.end = point.end;
                }else{
                    chapter.timeLapse.end = point.start + this.defaulPointInterval
                }
                _chapters.push(chapter);
            }
            this.commonConfig.cuePoints  = {chapters : _chapters};
        }

        this.thumbnails = "assets/thumbnails/thumbnail.jpg";
        this.commonConfig = {
            crossorigin: "anonymous",
            playsInline: false,
            autoHide: false,
            autoHideTime: 3000,
            autoPlay: false,
            sources: this.media.left,
            loop: false,
            preload: "auto",
            controls: false,
            theme: {
                url: "styles/themes/points/videogular.css"
            },
            plugins: {
                poster: {
                    url: "assets/images/videogular.png"
                }
            },
        };
        this.setcuePoints();
        this.videoConfigs = [this.commonConfig];

        var config = angular.copy(this.commonConfig);
        config.sources = this.media.right
        this.videoConfigsRight = config;
    }
).directive("pointsMapPlugin",
    ["VG_STATES", function(VG_STATES) {
        return {
            restrict: "E",
            require: "^videogular",
            templateUrl: 'views/plugins/points-map.html',
            link: function(scope, elem, attrs, API) {
                scope.API = API;
            }
        }
    }
    ]
).directive('pointsMenu',
    ["$location", function ($location) {
        return {
            restrict: "E",
            templateUrl: "views/directives/points-menu.html",
            link: function (scope, elem, attr) {
                scope.$location = $location;
            }
        }
    }
    ]
);

