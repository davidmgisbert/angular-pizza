angular.module('angularApp')
.controller('CarritoController', function ($scope, $http) {

    var miCarrito = angular.module("MiCarrito", []);

    miCarrito.controller('CarritoController', ['$scope',

        function ($scope) {
            $scope.carrito = [];
    
            $scope.agregar = function (p) {
                var itemActual;

                for (var i = 0; i < $scope.carrito.length; i++) {
            if ($scope.carrito[i].Producto.Id == p.Id) {
                itemActual = $scope.carrito[i];
            }
        }

        if (!itemActual) {
            $scope.carrito.push({
                Producto: p,
                Cantidad: 1
            });
        } else {
            itemActual.Cantidad++;
        }
    }
    
}
]);
});