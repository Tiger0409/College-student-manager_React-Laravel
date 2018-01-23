<?php
    $inUser = true;
?>

@extends('admin.layout.template')

@section('main')
    @include('admin.user.menu')

    @if ($role == 'students')
        @include('admin.user.studentsSearchForm')
    @endif
@endsection
