'use strict';
angular.module('myApp').controller('PointsCtrl',
    function ($sce,$http) {
        this.consoleCuePointsMessages = "click play to see cue points bindings!\n";
        this.API = null;
        this.chapterSelected = {};
        this.availablePlaybacks = [
            {value: '0.5', name: 'x0.5'},
            {value: '1', name: 'x1'},
            {value: '1.5', name: 'x1.5'},
            {value: '2', name: 'x2'},
        ];
        this.playbackSelected = this.availablePlaybacks[1];

        this.pointsUrl = '/ajax/points.php';
        this.points = [];
        this.sync = 0;
        this.videosAPI = [];
        this.diff = 0;

        this.onUpdateState = function (state, type) {
            this.state = state;
            if(this.sync) {
                this.setSync(state, type);
            }
        };

        /**
         * Sync left -> right
         * */
        this.setSync = function(state, type){
            if (!!this.videosAPI.left && !!this.videosAPI.right) {
                var sync_type = 'left' == type ? 'right' : 'left';
                var VAPI = this.videosAPI[sync_type];
                var VAPI_SYNC = this.videosAPI[type];
                var _diff = Math.abs(VAPI_SYNC.currentTime - VAPI.currentTime);
                if (VAPI.currentState != state) {
                    VAPI.currentState = state;
                    this.diff = _diff;
                    console.log('setState:');
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
        }

        var ctrl = this;
        this.onPlayerReady = function (API, type) {
            this.API = API;
            this.videosAPI[type] = API;

            var data = {'id' : 11, 'user' : 10};
            var config = {};
            if('left' == type) {
                $http.post(this.pointsUrl, data, config).then(function (response) {
                    ctrl.setPoints(response.data.points);
                    //set points
                }, function () {
                    //error ajax
                });
            }
        };

        this.changeSync = function(){
            if(this.sync) {
                if (!!this.videosAPI.left){
                    this.setSync(this.videosAPI.left.currentState, 'left');
                }
            }
        }
        this.TimeSync = function(){
            var VAPI = this.videosAPI['left'];
            var VAPI_SYNC = this.videosAPI['right'];
            var _diff = Math.abs(VAPI_SYNC.currentTime - VAPI.currentTime);
            var _change =Math.abs(this.diff - _diff);
            if(Math.abs(this.diff - _diff) > 1000){ //разница более сек
                console.log('current_:'+VAPI_SYNC.currentTime);
                console.log('DIFF2:'+(VAPI_SYNC.currentTime + this.diff));
                VAPI_SYNC.seekTime((VAPI_SYNC.currentTime + this.diff)/1000, true);
            }
        }

        this.media = {
            left: [
                    {
                        src: $sce.trustAsResourceUrl("/assets/video/videogular.mp4"),
                        type: "video/mp4"
                    }
                ],
            right :  [
                    {
                        src: $sce.trustAsResourceUrl("/assets/video/videogular2.mp4"),
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
            if(this.sync){
                this.TimeSync(currentTime);
            }
        };


        this.onChangeChapter = function onChangeChapter() {
            this.API.seekTime(this.chapterSelected.value);
        };

        this.onChangePlayback = function onChangePlayback() {
            if(this.sync){
                for(var i in this.videosAPI){
                    var VAPI = this.videosAPI[i];
                    VAPI.setPlayback(this.playbackSelected.value);
                }
            }else{
                this.API.setPlayback(this.playbackSelected.value);
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
        config.sources = this.media.right;
        this.videoConfigsRight = config;
        console.log(this.videoConfigsRight);
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

