
    var SongzaApp = angular.module('SongzaApp', []);

    SongzaApp.factory('audio', function ($document, $rootScope) {
        var audioElement = $document[0].getElementById('player'); // <-- Magic trick here

        audioElement.addEventListener('ended', function () {
            $rootScope.$broadcast("trackFinished");
        });

        return {
            audioElement: audioElement,

            play: function (filename) {
                audioElement.src = filename;
                audioElement.play();
            },

            pause: function () {
                audioElement.pause();
            }
        };
    });

    SongzaApp.controller('songzaController', function ($scope, $http, audio) {
        $http.get('@Url.Action("Categories")').success(function (data) {
            $scope.categories = data;
            $scope.selectCategory($scope.categories[0]);
        });

        $scope.selectCategory = function (category) {
            $scope.selectedCategory = category;
            $scope.getFilter();
        };
        
        $scope.isCategory = function (category) {
            if ($scope.selectedCategory == category) {
                return "active";
            }

            return "";
        };

        $scope.getFilter = function () {
            $http.post('@Url.Action("CategoryFilter")', { category: $scope.selectedCategory }).success(function (data) {
                $scope.genres = data;
            });
        };

        $scope.getPlaylists = function (genre) {
            $http.post('@Url.Action("Stations")', genre.station_ids).success(function (data) {
                $scope.genre = genre;
                $scope.stations = data;
            });
        };

        $scope.getStationNext = function (station) {
            $http.post('@Url.Action("StationNext")', { stationID: station.id }).success(function (data) {
                $scope.stationNext = data;
                audio.play($scope.stationNext.listen_url);
            });
        };

        $scope.showStation = function (station) {
            $http.post('@Url.Action("StationDetails")', { stationID: station.id }).success(function (data) {
                $scope.stationDetails = data;
                $scope.showDetails = true;
            });
        };
        
        $scope.playStation = function (station) {
            $scope.getStationNext(station);
        }

        $scope.$on("trackFinished", function () {
            $scope.getStationNext($scope.stationDetails);
        });

        $scope.hideDetails = function () {
            $scope.showDetails = false;
            audio.pause();
        };

        $scope.showDetails = false;
    });


