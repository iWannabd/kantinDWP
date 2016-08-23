<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class item extends Model
{
    //
    protected $fillable = ['nama','kodebarang','harga','kantin','hargabeli','laba'];
    
    public function sales(){
        return $this->hasMany('App\item');
    }
}
