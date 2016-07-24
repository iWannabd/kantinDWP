<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;


use App\User;
use App\Http\Requests;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\JWTAuth;

class AuthenticateController extends Controller
{
    //
    private $user;
    private $jwtauth;

    /**
     * AuthenticateController constructor.
     * @param $user
     * @param $jwtauth
     */
    public function __construct(User $user, JWTAuth $jwtauth)
    {
        $this->user = $user;
        $this->jwtauth = $jwtauth;
    }
    public function register(Request $request){
        $newUser = $this->user->create([
            "name" => $request->get("name"),
            "email" => $request->get("email"),
            "password" => bcrypt($request->get("password")),
        ]);

        if (!$newUser){
            return response()->json(["failed to create new user"],500);
        }

        return response()->json([
            "token" => $this->jwtauth->fromUser($newUser)
        ]);
    }
    public function login(Request $request){
        $credential = $request->only('email','password');
        $token = null;

        try {
            $token = $this->jwtauth->attempt($credential);
            if(!$token){
                return response()->json(['invalid email or password'],422);
            }
        } catch (JWTException $e) {
            return response()->json(['failed to create token'],500);
        }
        return response()->json(compact('token'));
    }


}