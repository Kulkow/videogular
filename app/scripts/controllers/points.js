'use strict';
angular.module('myApp').controller('PointsCtrl',
    function ($sce) {
        this.consoleCuePointsMessages = "click play to see cue points bindings!\n";
        this.API = null;
        this.barChartStyle = {};
        this.textStyle = {};
        this.chapterSelected = {};

        this.onPlayerReady = function (API) {
            this.API = API;
        };

        this.media = [
            {
                sources: [
                    {
                        /*src: $sce.trustAsResourceUrl("http://static.videogular.com/assets/videos/videogular.mp4"),*/
                        src: $sce.trustAsResourceUrl("/assets/video/videogular.mp4"),
                        type: "video/mp4"
                    },
                    /*{
                        src: $sce.trustAsResourceUrl("http://static.videogular.com/assets/videos/videogular.ogg"),
                        type: "video/ogg"
                    },
                    {
                        src: $sce.trustAsResourceUrl("http://static.videogular.com/assets/videos/videogular.webm"),
                        type: "video/webm"
                    }*/
                ],
                tracks: [
                    {
                        src: "assets/subs/pale-blue-dot.vtt",
                        kind: "captions",
                        srclang: "en",
                        label: "English",
                        default: "default"
                    }
                ]
            }
        ];

        // Console
        this.onConsoleCuePoint = function onConsoleCuePoint(currentTime, timeLapse, params) {
            var percent = (currentTime - timeLapse.start) * 100 / (timeLapse.end - timeLapse.start);
            this.consoleCuePointsMessages = "time: " + currentTime + " -> (start/end/percent) " + timeLapse.start + "/" + timeLapse.end + "/" + percent + "% = " + params.message + "\n";
        };

        // Animations
        this.onEnterAnimationsCuePoint = function onLeaveAnimationsCuePoint(currentTime, timeLapse, params) {
            console.log("entering in animation!");
            params.prop[params.value] = "0" + params.units;
        };

        this.onLeaveAnimationsCuePoint = function onLeaveAnimationsCuePoint(currentTime, timeLapse, params) {
            params.prop[params.value] = "0" + params.units;
        };

        this.onUpdateAnimationsCuePoint = function onUpdateAnimationsCuePoint(currentTime, timeLapse, params) {
            var percent = (currentTime - timeLapse.start) * 100 / (timeLapse.end - timeLapse.start);
            var value = params.final * percent / 100;

            params.prop[params.value] = value + params.units;
        };

        this.onCompleteAnimationsCuePoint = function onCompleteAnimationsCuePoint(currentTime, timeLapse, params) {
            params.prop[params.value] = params.final + params.units;
        };

        // Chapters
        this.onChaptersCuePoint = function onChaptersCuePoint(currentTime, timeLapse, params) {
            for (var i = 0, l = this.points.length; i < l; i++) {
                if(i != params.index){
                    this.points[i].status = 0;
                }
            }
            var status = 0;
            if(currentTime < timeLapse.end){
                status = 1;
            }
            this.points[params.index].status = status;
            this.chapterSelected = this.config.cuePoints.chapters[params.index];
        };

        this.onChangeChapter = function onChangeChapter() {
            this.API.seekTime(this.chapterSelected.value);
        };

        /*
        this.changeCuePoints = function changeCuePoints() {
            this.config.cuePoints = {
                console: [
                    {
                        timeLapse: {
                            start: 30
                        },
                        onEnter: this.onConsoleCuePoint.bind(this),
                        onLeave: this.onConsoleCuePoint.bind(this),
                        onUpdate: this.onConsoleCuePoint.bind(this),
                        onComplete: this.onConsoleCuePoint.bind(this),
                        params: {
                            message: "hello dude!"
                        }
                    },
                    {
                        timeLapse: {
                            start: 34
                        },
                        onEnter: this.onConsoleCuePoint.bind(this),
                        onLeave: this.onConsoleCuePoint.bind(this),
                        onUpdate: this.onConsoleCuePoint.bind(this),
                        onComplete: this.onConsoleCuePoint.bind(this),
                        params: {
                            message: "cue points are awesome"
                        }
                    },
                    {
                        timeLapse: {
                            start: 40
                        },
                        onEnter: this.onConsoleCuePoint.bind(this),
                        onLeave: this.onConsoleCuePoint.bind(this),
                        onUpdate: this.onConsoleCuePoint.bind(this),
                        onComplete: this.onConsoleCuePoint.bind(this),
                        params: {
                            message: "(ノ・◡・)ノ"
                        }
                    }
                ]
            };
        };
        */

        this.points = [
            {type:'left', x : '0%', y: '0%', content : '<p>Точка 1</p>',label : '1', start : 7, status : 0},
            {type:'right', x : '50%', y: '0%', content : '<p>Точка 2</p>',label : '2', start: 14, status : 0},
            {type:'top', x : '90%', y: '90%', content : '<p>Точка 3</p>', label : '3', start: 30, end: 40, status : 0},
        ];

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
            }
            _chapters.push(chapter);
        }

        this.config = {
            playsInline: false,
            autoHide: false,
            autoHideTime: 3000,
            autoPlay: false,
            sources: this.media[0].sources,
            tracks: this.media[0].tracks,
            loop: false,
            preload: "auto",
            controls: false,
            theme: {
                url: "styles/themes/points/videogular.css"
            },
            cuePoints: {
                chapters: _chapters,
                thumbnails: [
                    {
                        timeLapse: {
                            start: 30
                        },
                        params: {
                            thumbnail: "assets/thumbnails/30.png"
                        }
                    },
                    {
                        timeLapse: {
                            start: 49,
                            end: 60
                        },
                        params: {
                            thumbnail: "assets/thumbnails/50.png"
                        }
                    }
                ]
            },
            plugins: {
                poster: {
                    url: "assets/images/videogular.png"
                }
            },
        };
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
    ]);
;
