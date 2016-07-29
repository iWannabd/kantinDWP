<?php

namespace App\Http\Controllers;

use App\item;
use App\sale;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

use App\Http\Requests;

class saleController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $sales = DB::table('sales')
            ->join('items','sales.item_id','=','items.id')
            ->select('sales.*','items.nama','items.kodebarang')
            ->get();
        return response()->json($sales);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //mencari item dengan kode barang
        $kodebarang = $request->input('kodebarang');
        $item = item::where('kodebarang','=',$kodebarang)->first();


        if (is_null($item)) {
            return response()->json('barang tidak ditemukan '.$kodebarang);
        }
        //buat sale baru
        $sale = new sale($request->all());
        //simpan sale ke item
        $item->sales()->save($sale);
        return response()->json($item);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
        return response()->json(sale::find($id));
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //

    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //mencari item dengan kode barang
        $kodebarang = $request->input('kodebarang');
        $item = item::where('kodebarang','=',$kodebarang)->first();


        $sale = sale::find($id);
        $sale->outlet = $request->input('outlet');
        $sale->tanggal = $request->input('tanggal');
        $sale->nsold = $request->input('nsold');

        $item -> sales() -> save($sale);
        return response()->json('updated');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
        $sale = sale::find($id);
        $sale->delete();
        
        response()->json("deleted");
    }
}
