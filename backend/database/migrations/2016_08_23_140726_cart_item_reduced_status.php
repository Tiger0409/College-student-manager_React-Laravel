<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use App\Classes\Helpers\MigrationHelper;
use App\Models\CartItem;

class CartItemReducedStatus extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        MigrationHelper::changeEnumValues(
            CartItem::className(), 'student_status', ['employed', 'unemployed', 'reduced']
        );
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        MigrationHelper::changeEnumValues(
            CartItem::className(), 'student_status', ['employed', 'unemployed']
        );
    }
}
