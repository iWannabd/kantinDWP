<?php

namespace App\Http\Controllers;

use App\item;
use App\sale;
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
        //
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
        $items = item::where('kodebarang','=',$kodebarang)->take(1)->get();
        $selecteditem = null;
        foreach ($items as $item) {
            $selecteditem = $item;
        }
        //kalo item dengan kode barang yang dimaksud tidak ada
        if (is_null($selecteditem)) {
            return response()->json('barang tidak ditemukan '.$kodebarang);
        }
//        buat sale baru
        $sale = sale::create($request->all());
        //simpan sale ke item
        $selecteditem -> sale() -> save($sale);
        return response()->json($selecteditem);
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
        $items = item::where('kodebarang','=',$kodebarang)->take(1)->get();
        $selecteditem = null;
        foreach ($items as $item) {
            $selecteditem = $item;
        }
        //kalo item dengan kode barang yang dimaksud tidak ada
        if (is_null($selecteditem)) {
            return response()->json('barang tidak ditemukan '.$kodebarang);
        }

        $sale = sale::find($id);
        $sale->outlet = $request->input('outlet');
        $sale->tanggal = $request->input('tanggal');
        $sale->nsold = $request->input('nsold');

        $selecteditem -> sale() -> save($sale);
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
