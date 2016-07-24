<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

Route::get('/', function () {
    return view('welcome');
});

Route::group([
    "prefix" => "api"
],function (){
    Route::resource('auth', 'AuthenticateController', ['only' => ['index']]);
    Route::post('auth', 'AuthenticateController@login');
});

Route::group(['middleware' => 'jwt.auth'], function (){
    Route::resource('item','itemController');
    Route::resource('sale','saleController');
});