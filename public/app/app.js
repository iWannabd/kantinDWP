//env
var hostingan = 'http://localhost:8000/';

var app = angular.module("kantindwp",['ui.router','ui.bootstrap','satellizer','ngMessages','chart.js']);

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
            templateUrl:'templates/main.tpl.html',
            controller:'MainPageController'
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
    });
});

app.controller('MainPageController',function ($scope,$http) {
    $scope.labels = [];
    $scope.series = ['Laba Harian','Penjualan Harian'];
    $scope.data = [[],[]];

    $scope.cuurentSlide = 0;
    $scope.slideSize = 7;

    $scope.onClick = function (points, evt) {
        console.log(points, evt);
    };
    $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }];
    $scope.options = {
        scales: {
            yAxes: [
                {
                    id: 'y-axis-1',
                    type: 'linear',
                    display: true,
                    position: 'left'
                }
            ]
        }
    };

    var laba = [];
    var jual = [];
    var label = [];

    function rangeslide(){
        $scope.labels = label.slice($scope.cuurentSlide*$scope.slideSize,$scope.cuurentSlide*$scope.slideSize+$scope.slideSize);
        $scope.data[0] = laba.slice($scope.cuurentSlide*$scope.slideSize,$scope.cuurentSlide*$scope.slideSize+$scope.slideSize);
        $scope.data[1] = jual.slice($scope.cuurentSlide*$scope.slideSize,$scope.cuurentSlide*$scope.slideSize+$scope.slideSize);
        console.log($scope.cuurentSlide*$scope.slideSize,$scope.slideSize);
    }

    $scope.nextslide = function () {
        $scope.cuurentSlide = $scope.cuurentSlide + 1;
        rangeslide();
    };

    $scope.prevslide = function () {
        $scope.cuurentSlide = $scope.cuurentSlide - 1;
        rangeslide();
    };


    $http.get(hostingan+'/saleitem').then(function (response) {
        $scope.itemsales = response.data;
    });
    $http.get(hostingan+'/newestsale').then(function (response) {
        var totalsale = response.data;
        $scope.daily = totalsale[0];
        var bulanterbaru = totalsale[0].tanggal.split("-")[1];
        var monthlysale = 0;

        for (i = 0;i<totalsale.length;i++){
            if(totalsale[i].tanggal.split("-")[1]==bulanterbaru) monthlysale += totalsale[i].totaljual;
            label.push(totalsale[totalsale.length-i-1].tanggal);
            jual.push(totalsale[totalsale.length-i-1].totaljual);
            laba.push(totalsale[totalsale.length-i-1].totallaba);
        }
        rangeslide();

        console.log($scope.data);
        var bulans = ["Januari", "Februari", "Maret", "April", "Mei",
            "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

        $scope.bulan = bulans[bulanterbaru-1];
        $scope.total = monthlysale;
    })
});

function strToDate(str) {
    return Date.parse(str.replace(/-/g,"/"));
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

app.filter('dateFilter',function () {
    return function (items, pilihtanggal) {
        var filtered = [];
        if (items == null) {
            console.log(items);
            return items
        }
        else {
            console.log(items);
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                console.log('tanggal item:  '+item.tanggal);
                console.log('tanggal maksd: '+formatDate(pilihtanggal));
                if (item.tanggal == formatDate(pilihtanggal)) {
                    filtered.push(item);
                }
            }
            return filtered;
        }
    }
});

app.filter('mulaiDari',function () {
    return function (input,start) {
        start = +start;
        return input.slice(start);
    }
});

app.controller('ViewSalesController',function ($scope,$http,$modal) {
    $scope.pilihtanggal = new Date();

    $http.get(hostingan+'/sale').then(
        function (response) {
            $scope.sales = response.data;
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
        console.log(sale);
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

    $http.get(hostingan+'/saleitem').then(function (response) {
        $scope.itemsales = response.data;
    });

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
            $http.post(hostingan+'/sale',JSON.stringify(newsale)).then(
                function () {
                    alert('Data dimasukkan');
                    $http.get(hostingan+'/saleitem').then(function (response) {
                        $scope.itemsales = response.data;
                    });
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
    $scope.currentPage = 0;
    $scope.pageSize = 10;
    $scope.barangs = [];
    $scope.nkantin = 0;
    $scope.nmini = 0;

    var hitunguntung = function (_barang) {

        if (_barang.kantin == 1) {
            _barang.kantin = true;
            _barang.produk = "minimarket";
            $scope.nmini = $scope.nmini + 1;
        } else if (_barang.kantin == 0){
            _barang.kantin = false;
            _barang.produk = "kantin";
            $scope.nkantin = $scope.nkantin +1;
        }

        _barang.laba =0;

        if (_barang.kantin){
            _barang.laba = _barang.harga - _barang.hargabeli;
        } else {
            _barang.laba = _barang.harga * 0.02;
            _barang.hargabeli = 0;
        }
        return _barang;
    };

    $scope.numberOfPages=function(){
        return Math.ceil($scope.barangs.length/$scope.pageSize);
    };
    $http.get(hostingan+'/item').then(function (response) {
        $scope.barangs = [];
        for (i=0;i<response.data.length;i++){
            $scope.barangs.push(hitunguntung(response.data[i]));
        }
        console.log($scope.barangs );
    });
    $scope.modalbarangbaru = function () {
        var modalinstance = $modal.open({
            templateUrl:'templates/barangbaru.modal.tpl.html',
            size:'sm',
            controller:Barangbaru
        });
        modalinstance.result.then( function () {
            $http.get(hostingan+'/item').then(function (response) {
                $scope.barangs = [];
                $scope.nkantin = 0;
                $scope.nmini = 0;
                for (i=0;i<response.data.length;i++){
                    $scope.barangs.push(hitunguntung(response.data[i]));
                }
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
                    $scope.barangs = [];
                    $scope.nkantin = 0;
                    $scope.nmini = 0;
                    for (i=0;i<response.data.length;i++){
                        $scope.barangs.push(hitunguntung(response.data[i]));
                    }
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
                    $scope.barangs = [];
                    $scope.nkantin = 0;
                    $scope.nmini = 0;
                    for (i=0;i<response.data.length;i++){
                        $scope.barangs.push(hitunguntung(response.data[i]));
                    }
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
        $scope.buatbarang = function (form,_barang) {
            if (form.$valid){
                _barang = hitunguntung(_barang);
                console.log(JSON.stringify(_barang));
                $http.post(hostingan+'item',JSON.stringify(_barang)).then(
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
                alert('isian belum valid');
            }
        }
    };

    var Editbarang = function ($scope, $modalInstance, $http, barang) {
        $scope.barang=barang;
        console.log(barang);
        $scope.buatbarang = function (form,_barang) {
            if (form.$valid){
                _barang = hitunguntung(_barang);
                console.log(JSON.stringify(_barang));
                $http.put(hostingan+'item/'+barang.id,JSON.stringify(_barang)).then(
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