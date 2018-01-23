<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ClosestBranchesUniqueIndex extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::statement('ALTER TABLE `t_user_closest_branches` ADD UNIQUE `unique_index`(`user_id`, `branch_associated_id`)');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //alter table fuinfo drop index email;
        DB::statement('ALTER TABLE `t_user_closest_branches` DROP INDEX `unique_index`');
    }
}
