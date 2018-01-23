<?php
$inDashboard = true;
?>

@extends('admin.layout.template')

@section('main')

    <div>

        @foreach ($info as $message => $value)
            <p>{{ $value }} | {{ $message }}</p>
        @endforeach

        <form action="/api/dashboard" method="post" id="filterForm">
            <input type="hidden" name="_token" value="{{ csrf_token() }}">
            <div class="row">
                <div class="col-md-2">
                    <input class="form-control" type="text" name="termNumber" id="termNumber" placeholder="Term">
                </div>
                <div class="col-md-2">
                    <input class="form-control" type="text" name="year" id="year" placeholder="Year">
                </div>
                <div class="col-md-2">
                    <input class="form-control" type="submit" value="Filter">
                </div>
            </div>
        </form>
    </div>
@endsection