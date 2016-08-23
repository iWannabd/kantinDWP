<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class sale extends Model
{
    //
    protected $fillable = ['outlet','tanggal','nsold','item_id','hargabeli','kantin'];
    
    public function item(){
        return $this->belongsTo('App\sale');
    }
}
