<?php

namespace App\Providers;

use Laravel\Cashier\Cashier;
use Laravel\Cashier\CashierServiceProvider as BaseProvider;

class CashierServiceProvier extends BaseProvider
{
    public function register()
    {
        parent::register();
        Cashier::useCurrency('gbp', '£');
    }
}