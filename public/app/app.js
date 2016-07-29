//env
var hostingan = 'http://localhost:8000/';

var app = angular.module("kantindwp",['ui.router','ui.bootstrap','satellizer','ngMessages']);

app.config(function ($stateProvider,$urlRouterProvider,$authProvider) {
    $urlRouterProvider.otherwise('/login');
    $stateProvider
        .state("login",{
            url:'/login',
            templateUrl:'templates/login.tpl.html',
            controller:function ($state, $auth,$scope) {
                $scope.login = function () {
                    $auth.login({
                        email:$scope.email,
                        password:$scope.password
                    }).then(function (response) {
                        console.log(response);
                        $state.go('dashboard.main');
                    }).catch(function (response) {
                        console.log(response);
                        window.alert('login gagal');
                    });
                }
            }
        })
        .state("dashboard",{
            url:'/dashboard',
            templateUrl:'templates/dashboard.tpl.html',
            controller:'DashboardController'
        })
        .state('dashboard.main',{
            url:'/main',
            templateUrl:'templates/main.tpl.html'
        })
        .state('dashboard.inputsales',{
            url:'/inputsales',
            templateUrl:'templates/inputsales.tpl.html',
            controller:'NewSalesController'
        })
        .state('dashboard.datasales',{
            url:'/datasales',
            templateUrl:'templates/datasales.tpl.html',
            controller:'ViewSalesController'
        })
        .state('dashboard.akun',{
            url:'/akun',
            templateUrl:'templates/dataakun.tpl.html',
            controller:'AccountController'
        })
        .state('dashboard.barang',{
            url:'/barang',
            templateUrl:'templates/databarang.tpl.html',
            controller:'ItemController'
        });
    $authProvider.loginUrl = hostingan+'api/auth';
});

app.controller('DashboardController',function ($auth, $state, $scope,$http) {
    $scope.keluar = function () {
        $auth.logout();
        $state.go('login');
    };
    $http.get(hostingan+'val').then(function (response) {
        $scope.user = response.data.name;
    },function () {
        $auth.logout();
        $state.go('login');
    })
});

app.filter('dateFilter',function () {
    return function (items, pilihtanggal) {
        var filtered = [];
        var date = new Date(pilihtanggal);
        for (var i = 0; i < items.length ; i++){
            var item = items[i];
            if (new Date(item.tanggal) == date) {
                filtered.push(item);
            }
        }
        return filtered;
    }
});

app.controller('ViewSalesController',function ($scope,$http,$modal) {
    $http.get(hostingan+'/sale').then(
        function (response) {
            $scope.sales = response.data;
            console.log($scope.sales)
        }
    );

    $scope.deletesale = function (_sale) {
        var modalinstance = $modal.open({
            templateUrl: 'templates/andayakin.modal.tpl.html',
            size:'sm',
            controller:controllerhapusale,
            resolve:{ sale:function () {
                return _sale
            }}
        });
        modalinstance.result.then( function () {
                $http.get(hostingan+'/sale').then(
                    function (response) {
                        $scope.sales = response.data;
                        console.log($scope.sales)
                    }
                );
            }
        );
    };
    var controllerhapusale = function ($scope,$http,$modalInstance,sale) {
        $scope.yes = function () {
            $http.delete(hostingan+'/sale/'+sale.id).then(
                function (response) {
                    alert('Terhapus');
                    $modalInstance.close();
                },
                function (response) {
                    console.log(response);
                    alert('gagal terhapus');
                    $modalInstance.close();
                }
            )
        };
        $scope.no = function () {
            $modalInstance.close();
        }
    };
    $scope.editsale = function (_sale) {
        var modalinstance = $modal.open({
            templateUrl:'templates/editsale.tpl.html',
            size:'sm',
            controller:UpdateSale,
            resolve:{ sale: function () {
                return _sale;
            }}
        });
        modalinstance.result.then(
            function () {
                $http.get(hostingan+'/sale').then(
                    function (response) {
                        $scope.sales = response.data;
                        console.log($scope.sales)
                    }
                );
            }
        );
    };
    var UpdateSale = function ($scope,$http,$modalInstance,sale) {
        $http.get(hostingan+'/item').then(function (response) {
            $scope.barangs = response.data;
        });
        console.log(sale)
        $scope.tanggal = new Date(sale.tanggal.replace(/-/g,"/"));
        $scope.outlet = sale.outlet;
        $scope.Selectedbarang = sale;
        $scope.nsold = sale.nsold;

        $scope.buatSale = function (form) {
            if (form.$valid){
                console.log(form);
                var newsale = {
                    outlet:form.outlet.$modelValue,
                    kodebarang:form.Selectedbarang.$modelValue.kodebarang,
                    tanggal:form.tanggal.$viewValue,
                    nsold:form.nsold.$modelValue
                };
                console.log(JSON.stringify(newsale));
                $http.put(hostingan+'/sale/'+sale.id,JSON.stringify(newsale)).then(
                    function () {
                        alert('Data dimasukkan');
                        $modalInstance.close();
                    },
                    function (response) {
                        console.log(response);
                        alert('Data gagal dimasukkan');
                    }
                )
            }
        }
    }
});

app.controller('NewSalesController',function ($auth, $http, $scope) {
    $http.get(hostingan+'/item').then(function (response) {
        $scope.barangs = response.data;
    });

    $scope.buatSale = function (form) {
        if (form.$valid){
            console.log(form);
            var newsale = {
                outlet:form.outlet.$modelValue,
                kodebarang:form.Selectedbarang.$modelValue.kodebarang,
                tanggal:form.tanggal.$viewValue,
                nsold:form.nsold.$modelValue
            }
            console.log(JSON.stringify(newsale));
            $http.post(hostingan+'/sale',JSON.stringify(newsale)).then(
                function () {
                    alert('Data dimasukkan');
                },
                function (response) {
                    console.log(response);
                    alert('Data gagal dimasukkan');
                }
            )
        }
    };
});

app.controller('ItemController',function ($auth, $http, $modal, $scope) {
    $http.get(hostingan+'/item').then(function (response) {
        $scope.barangs = response.data;
    });
    $scope.modalbarangbaru = function () {
        var modalinstance = $modal.open({
            templateUrl:'templates/barangbaru.modal.tpl.html',
            size:'sm',
            controller:Barangbaru
        });
        modalinstance.result.then( function () {
            $http.get(hostingan+'/item').then(function (response) {
                $scope.barangs = response.data;
            });
            }
        );
    };

    $scope.editbarang = function (_barang) {
        var modalinstance = $modal.open({
            templateUrl:'templates/barangbaru.modal.tpl.html',
            size:'sm',
            controller:Editbarang,
            resolve: {
                barang: function () {
                    return _barang
                }
            }
        });
        modalinstance.result.then(
            function () {
                $http.get(hostingan+'/item').then(function (response) {
                    $scope.barangs = response.data;
                });
            }
        )
    };

    $scope.deletebarang = function (_barang) {
        var modalinstance = $modal.open({
            templateUrl:'templates/andayakin.modal.tpl.html',
            size:'sm',
            controller:DeleteBarang,
            resolve: {
                barang: function () {
                    return _barang
                }
            }
        });
        modalinstance.result.then(
            function () {
                $http.get(hostingan+'/item').then(function (response) {
                    $scope.barangs = response.data;
                });
            }
        )
    };

    var DeleteBarang = function ($scope, $modalInstance, $http, barang) {
        $scope.yes = function () {
            $http.delete(hostingan+'/item/'+barang.id).then(
                function (response) {
                    console.log(response);
                    $modalInstance.close();
                },
                function (response) {
                    console.log(response);
                    alert('kesalahan server');
                }
            );
        };
        $scope.no = function () {
            $modalInstance.close();
        }
    };

    var Barangbaru = function ($scope, $modalInstance, $http) {
        $scope.buatbarang = function (form) {
            if (form.$valid){
                var barang = {
                    nama:form.nama.$modelValue,
                    kodebarang:form.kode.$modelValue,
                    harga:form.harga.$modelValue
                };
                $http.post(hostingan+'/item',JSON.stringify(barang)).then(
                    function (response) {
                        console.log(response);
                        $modalInstance.close();
                    },
                    function (response) {
                        console.log(response);
                        alert('kesalahan server');
                    }
                )
            } else {
                alert('isian belum valid')
            }
        }
    };

    var Editbarang = function ($scope, $modalInstance, $http, barang) {
        $scope.nama=barang.nama;
        $scope.kode=barang.kodebarang;
        $scope.harga=barang.harga;

        $scope.buatbarang = function (form) {
            if (form.$valid){
                var barangbaru = {
                    nama:form.nama.$modelValue,
                    kodebarang:form.kode.$modelValue,
                    harga:form.harga.$modelValue
                };
                $http.put(hostingan+'/item/'+barang.id,JSON.stringify(barangbaru)).then(
                    function (response) {
                        console.log(response);
                        $modalInstance.close();
                    },
                    function (response) {
                        console.log(response);
                        alert('kesalahan server');
                    }
                )
            } else {
                alert('isian belum valid')
            }
        }
    }
});

app.controller('AccountController',function ($auth, $http, $modal, $scope) {
    $scope.akuns = {};
    $http.get(hostingan+'/api/auth').then(function (response) {
        $scope.akuns = response.data;
    });
    $scope.modaakunbaru = function () {
        var modalinstance = $modal.open({
            templateUrl:'templates/akunbaru.modal.tpl.html',
            size:'sm',
            controller:'Akunbaru'
        });
        modalinstance.result.then(function () {
            $http.get(hostingan+'/api/auth').then(function (response) {
                $scope.akuns = response.data;
            });
        })
    };

    $scope.deleteakun = function (_akun) {
        var modalinstance = $modal.open({
            templateUrl:'templates/andayakin.modal.tpl.html',
            size:'sm',
            controller:kontrollerdeleteakun,
            resolve: {
                akun: function () {
                    return _akun;
                }
            }
        });
        modalinstance.result.then(function () {
            $http.get(hostingan+'/api/auth').then(function (response) {
                $scope.akuns = response.data;
            });
        })
    };

    var kontrollerdeleteakun = function (akun, $scope, $http,$modalInstance) {
        $scope.yes = function () {
            $http.delete(hostingan+'auth/'+akun.id).then(function (response) {
                console.log(response);
                $modalInstance.close()
            }, function () {
                alert('Gagal dihapus');
            })
        };
        $scope.no = function () {
            $modalInstance.close();
        }
    };

    $scope.editakun = function (_akun) {
        var modalinstance = $modal.open({
            templateUrl:'templates/akunbaru.modal.tpl.html',
            size:'sm',
            controller:kontrollerdeditakun,
            resolve: {
                akun: function () {
                    return _akun;
                }
            }
        });
        modalinstance.result.then(function () {
            $http.get(hostingan+'/api/auth').then(function (response) {
                $scope.akuns = response.data;
            });
        })
    };

    var kontrollerdeditakun = function ($scope,$http,$modalInstance,akun) {
        $scope.name = akun.name;
        $scope.password = akun.password;
        $scope.email = akun.email;
        $scope.role = akun.role;

        $scope.buatakun = function (form) {
            if (form.$valid){
                var userbaru = {
                    name:form.name.$modelValue,
                    password:form.passwd.$modelValue,
                    email:form.email.$modelValue,
                    role:form.role.$modelValue
                };
                $http.put(hostingan+'/auth/'+akun.id,JSON.stringify(userbaru)).then(
                    function (response) {
                        $modalInstance.close();
                        console.log(response);
                    },
                    function (response) {
                        alert('server bermasalah');
                        console.log(response);
                    }
                )
            } else {
                alert('isian belum valid')
            }
        }
    }
});

app.controller('Akunbaru',function ($scope, $http,$modalInstance) {
    $scope.buatakun = function (form) {
        if (form.$valid){
            var userbaru = {
                name:form.name.$modelValue,
                password:form.passwd.$modelValue,
                email:form.email.$modelValue,
                role:form.role.$modelValue
            };
            $http.post(hostingan+'/auth',JSON.stringify(userbaru)).then(
                function (response) {
                    $modalInstance.close();
                    console.log(response);
                },
                function (response) {
                    alert('server bermasalah');
                    console.log(response);
                }
            )
        } else {
            alert('isian belum valid')
        }
    }
});