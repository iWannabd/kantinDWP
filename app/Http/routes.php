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
    return view('index');
});

Route::group([
    "prefix" => "api"
],function (){
    Route::post('auth', 'AuthenticateController@login');
    Route::resource('auth', 'AuthenticateController', ['only' => ['index']]);
});

Route::group(['middleware' => 'jwt.auth'], function (){
    Route::resource('item','itemController');
    Route::resource('sale','saleController');
    Route::post('auth', 'AuthenticateController@register');
    Route::get('val','AuthenticateController@val');
    Route::get('saleitem','itemController@itemsale');
    Route::delete('auth/{id}','AuthenticateController@destroy');
    Route::put('auth/{id}','AuthenticateController@update');
});

Blade::setContentTags('<%', '%>');        // for variables and all things Blade
Blade::setEscapedContentTags('<%%', '%%>');   // for escaped data