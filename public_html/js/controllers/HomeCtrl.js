kazoosh.controller('HomeCtrl', ['CONF', '$scope', '$state', '$stateParams', 'ContentService', '$q', function(CONF, $scope, $state, $stateParams, ContentService, $q) {

	ContentService.getContent('root/home').then(

		function(content){

			$scope.content = content;

			//get featured items
			var requests = [];
			content.featured.forEach(function(path, i){
				requests.push(ContentService.getContent(path));
			});

			
			$q.all(requests)
				.then(
					function(data){
						$scope.featured = data;
					},
					function(error){
						console.error('FAIL');
					}
				);
		},
		function(){
			$state.go('error');
		}
	);

}]);