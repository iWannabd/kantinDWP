<?php

namespace App\Http\Controllers;

use App\item;
use Illuminate\Http\Request;

use App\Http\Requests;

class itemController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
        $items = item::all();
        return response()->json($items);

//        $items = item::join('sales','sales.item_id','=','items.id')
//            ->groupBy('item_id')
//            ->get(['items.id','items.nama','items.kodebarang','items.harga',DB::raw('count(sales.id) as sales')]);
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
        //
        $item = item::create($request->all());
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
        return response()->json(item::find($id));
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
        //
        $item = item::find($id);
        $item->nama = $request->input('nama');
        $item->kodebarang = $request->input('kodebarang');
        $item->harga = $request->input('harga');
        
        $item->save();
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
        $item = item::find($id);
        $item -> delete();
        return response()->json('deleted');
    }

}
