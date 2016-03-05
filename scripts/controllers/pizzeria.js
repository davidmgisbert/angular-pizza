'use strict';

/**
 * @ngdoc function
 * @name angularApp.controller:PizzeriaCtrl
 * @description
 * # PizzeriaCtrl
 * Controller of the angularApp
 */

var app = angular.module('angularApp')


.controller('PizzeriaCtrl', function ($scope, $http, $route, Carrito) {

    $scope.productos = [];

    $scope.tipoProductos = [
        {name:"Pizzas", src:"data/pizzasPredef.json"},
        {name:"Bebidas", src:"data/bebidasPredef.json"},
        {name:"Postres", src:"data/postresPredef.json"}
    ]

    $scope.numeroDisposicion = 0;
    $scope.disposiciones = [
        {value:"width:98%; margin:1%; min-height:345px;"},
        {value:"width:48%; margin:1%; min-height:461px;"},
        {value:"width:31%; margin:1%; min-height:461px;"}
    ];

    $scope.tam = [
        {id:'peq', name:'Pequeña', value:0.8},
        {id:'med', name:'Mediana', value:1},
        {id:'fam', name:'Familiar', value:1.2}
    ];

    $scope.initTam = $scope.tam[0];

    $scope.pizza = function(e){
        $scope.productos = [];
        $http.get(e)
        .success(function(data){
            $scope.pizzas = data;
            var init = function(){
                for(var i = 0; i < $scope.pizzas.productos.length; i++)
                {
                    $scope.productos.push({nombre: $scope.pizzas.productos[i].nombre, desc: $scope.pizzas.productos[i].desc, precio: $scope.pizzas.precios[$scope.pizzas.productos[i].precio], factor: $scope.pizzas.factorPrecioTam[$scope.initTam.id] , img: $scope.pizzas.productos[i].img});
                }
            }();
        });
    };
	
	
	
    ////////////////////    
    //Carrito///
    
	$scope.anadirCarrito = function(nombre, precio, tamano, cantidad)
	{
		var product = {};
		product.precio = precio;
		product.nombre = nombre;
		product.tamano = tamano;
		product.cantidad = cantidad;
		Carrito.anadir(product);
	};
	
	$scope.eliminarProducto = function(name, tamano)
	{
		if(Carrito.eliminar(name, tamano))
		{
			alert("Producto eliminado correctamente");
			return;
		}
		else
		{
			alert("Ha ocurrido un error eliminando el producto, seguramente porque no existe");
			return;
		}
	};
	
	$scope.vaciarCarrito = function()
	{
		Carrito.vaciar();
	};
    
    $scope.getTotal = function()
	{
		var total = 0;
        if($scope.carrito.length > 0)
        {
            for(var i in $scope.carrito)
            {
                total += $scope.carrito[i].precio * $scope.carrito[i].cantidad * $scope.carrito[i].tamano.value;
            }
        }
        return total;
	};
  
    $scope.carrito = Carrito.getCarrito();
    
    $scope.jsonCarrito = function()
    {
        var _json = [];
        for(var i in $scope.carrito)
        {
            _json.push({n:$scope.carrito[i].nombre, c:$scope.carrito[i].cantidad, t:$scope.carrito[i].tamano.name});
        }
        _json.push({pTotal:$scope.getTotal().toFixed(2)});
        var _jsonFinal = angular.toJson(_json);
        return _jsonFinal;
    }
    
    $scope.ptotal = $scope.getTotal();
	
});


app.factory('Carrito',['$rootScope', function ($rootScope){
    
    /**
    * @var array con el contenido del carrito
    */
     $rootScope.ContenidoCarrito = [],
    /**
    * @var float con el precio total del carrito
    */
    $rootScope.PrecioTotalCarrito = 0,
    /**
    * @var integer con el número de artículos del carrito
    */
     $rootScope.NumElementrosCarrito = 0;
 
    return{
        /**
        * @desc - proporciona el contenido del carrito
        * @return - contenido del carrito
        */
        getCarrito : function ()
        {
            return $rootScope.ContenidoCarrito;
        },
        /**
        * @desc - proporciona el precio total del carrito
        * @return - precio total del carrito
        */
        getPrecioTotal : function ()
        {
            return $rootScope.PrecioTotalCarrito;
        },
        getNumElementosCarrito : function()
		{
			return $rootScope.NumElementrosCarrito;
		},
       
        /**
        * @desc - añade nuevos productos al carrito
        * @param - array con los datos del producto
        * @return - mixed
        */
        anadir: function(producto)
        {
            try{
                //comprobamos si el producto cumple los requisitos
                this.minimRequeriments(producto);
 
                //si el producto existe le actualizamos la cantidad
                if(this.checkExistsProduct(producto,$rootScope.ContenidoCarrito) === true)
                {
                    $rootScope.PrecioTotalCarrito += parseFloat(producto.precio * producto.cantidad * producto.tamano.value,10);
                    $rootScope.NumElementrosCarrito += producto.cantidad;
                    return {"msg":"Actualizado Producto"};
                }
                //en otro caso, lo añadimos al carrito
                else
                {
                    $rootScope.PrecioTotalCarrito += parseFloat(producto.precio * producto.cantidad * producto.tamano.value,10);
                    $rootScope.NumElementrosCarrito += producto.cantidad;
                    $rootScope.ContenidoCarrito.push(producto);
                    return {"msg":"Insertado en Carrito"};
                }
            }
            catch(error)
            {
                alert("Error " + error);
            }
        },
     
        /**
        * @desc -elimina un producto completo por su id
        * @param - int - id del producto
        * @return - mixed
        */
        eliminar: function(nombre, tamano)
        {
            var i, len;
            for (i = 0, len = $rootScope.ContenidoCarrito.length; i < len; i++)
            {
                if ($rootScope.ContenidoCarrito[i].tamano === tamano && $rootScope.ContenidoCarrito[i].nombre === nombre)
                {
                   $rootScope.PrecioTotalCarrito -= parseFloat($rootScope.ContenidoCarrito[i].precio * $rootScope.ContenidoCarrito[i].cantidad * $rootScope.ContenidoCarrito[i].tamano.value,10);
                   $rootScope.NumElementrosCarrito -= $rootScope.ContenidoCarrito[i].cantidad;
                   $rootScope.ContenidoCarrito.splice(i, 1);
                    if(isNaN($rootScope.PrecioTotalCarrito))
                    {
                       $rootScope.PrecioTotalCarrito = 0;
                    }
                    return true;
                }
               
            } 
            return false;
        },
        /**
        * @desc - vacia  todo el contenido del carrito, precio total y productos
        * @return - bool
        */
        vaciar: function()
        {
            try{
                $rootScope.ContenidoCarrito = [];
                $rootScope.PrecioTotalCarrito = 0;
                $rootScope.NumElementrosCarrito = 0;
            }
            catch(error)
            {
                alert("Error " + error);
            }
        },
     
        /********************************************************************* COMPROBACION DE LOS DATOS*************************************************************/
        
         /**
        * @desc - comprueba los campos que introducimos al añadir productos
        */
        minimRequeriments: function(product)
        {
            if(!product.cantidad || !product.precio)
            {
                throw new Error("Los campos cantidad y  precio  son necesarios");
            }
            if(isNaN(product.cantidad) || isNaN(product.precio))
            {
                throw new Error("Los campos cantidad y  precio  deben ser númericos");
            }
            if(product.cantidad <= 0)
            {
                throw new Error("La cantidad añadida debe ser mayor de 0");
            }
            if(this.isInteger(product.cantidad) === false)
            {
                throw new Error("La cantidad del producto debe ser un número entero");
            }
        },
        
        /**
        * @desc - comprueba si el número pasado es un entero
        * @return - bool
        */
        isInteger: function(n)
        {
            if(n % 1 === 0)
                return true;
            else
                return false;
        },
           /**
        * @desc - comprueba si el producto existe en el carrito
        * @param - product - objecto con los datos del producto a añadir
        * @param - products - array con el contenido del carrito
        * @return - bool
        */
        checkExistsProduct: function(product, products)
        {
            var i, len;
            for (i = 0, len = products.length; i < len; i++)
            {
                if (products[i].nombre === product.nombre && products[i].tamano.value === product.tamano.value)
                {           
                    products[i].cantidad += product.cantidad;  
                    return true;
                }
            }
            return false;
        },
        
        
        
    };
}]);

//////////////////////    
//Generar QR
angular.module('monospaced.qrcode', [])
.directive('qrcode', ['$window', function($window) {

    var canvas2D = !!$window.CanvasRenderingContext2D,
        levels = {
            'L': 'Low',
            'M': 'Medium',
            'Q': 'Quartile',
            'H': 'High'
        },
        draw = function(context, qr, modules, tile) {
            for (var row = 0; row < modules; row++) {
                for (var col = 0; col < modules; col++) {
                    var w = (Math.ceil((col + 1) * tile) - Math.floor(col * tile)),
                        h = (Math.ceil((row + 1) * tile) - Math.floor(row * tile));

                    context.fillStyle = qr.isDark(row, col) ? '#000' : '#fff';
                    context.fillRect(Math.round(col * tile),
                                     Math.round(row * tile), w, h);
                }
            }
        };

    return {
        restrict: 'E',
        template: '<canvas></canvas>',
        link: function(scope, element, attrs) {
            var domElement = element[0],
                canvas = element.find('canvas')[0],
                context = canvas2D ? canvas.getContext('2d') : null,
                trim = /^\s+|\s+$/g,
                error,
                version,
                errorCorrectionLevel,
                data,
                size,
                modules,
                tile,
                qr,
                setVersion = function(value) {
                    version = Math.max(1, Math.min(parseInt(value, 10), 10)) || 4;
                },
                setErrorCorrectionLevel = function(value) {
                    errorCorrectionLevel = value in levels ? value : 'M';
                },
                setData = function(value) {
                    if (!value) {
                        return;
                    }

                    data = value.replace(trim, '');
                    qr = qrcode(version, errorCorrectionLevel);
                    qr.addData(data);

                    try {
                        qr.make();
                    } catch(e) {
                        error = e.message;
                        return;
                    }

                    error = false;
                    modules = qr.getModuleCount();
                },
                setSize = function(value) {
                    size = parseInt(value, 10) || modules * 2;
                    tile = size / modules;
                    canvas.width = canvas.height = size;
                },
                render = function() {
                    if (!qr) {
                        return;
                    }

                    if (error) {
                        if (!canvas2D) {
                            domElement.innerHTML = '<img src width="' + size + '"' +
                                'height="' + size + '">';
                        }
                        scope.$emit('qrcode:error', error);
                        return;
                    }

                    if (canvas2D) {
                        draw(context, qr, modules, tile);
                    } else {
                        domElement.innerHTML = qr.createImgTag(tile, 0);
                    }
                };

            setVersion(attrs.version);
            setErrorCorrectionLevel(attrs.errorCorrectionLevel);
            setSize(attrs.size);

            attrs.$observe('version', function(value) {
                if (!value) {
                    return;
                }

                setVersion(value);
                setData(data);
                setSize(size);
                render();
            });

            attrs.$observe('errorCorrectionLevel', function(value) {
                if (!value) {
                    return;
                }

                setErrorCorrectionLevel(value);
                setData(data);
                setSize(size);
                render();
            });

            attrs.$observe('data', function(value) {
                if (!value) {
                    return;
                }

                setData(value);
                setSize(size);
                render();
            });

            attrs.$observe('size', function(value) {
                if (!value) {
                    return;
                }

                setSize(value);
                render();
            });
        }
    };
}]);