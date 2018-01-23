<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use App\Models\DonationRecord;
use App\Models\Term;

class DonationRecordsTermIds extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table(DonationRecord::tableName(), function($table) {
            $table->integer('donation_term_id');
        });

        foreach (DonationRecord::all() as $donationRecord) {
            $termNumber = trim(str_replace('term', '', $donationRecord->donationTerm));
            $term = Term::where([
                'term' => $termNumber,
                'year' => $donationRecord->donationYear
            ])->first();

            if ($term) {
                $donationRecord->donationTermId = $term->id;
                $donationRecord->save();
            }
        }

        Schema::table(DonationRecord::tableName(), function($table) {
            $table->dropColumn(['donation_term', 'donation_year']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table(DonationRecord::tableName(), function($table) {
            $table->string('donation_year', 4);
            $table->enum('donation_term', ['term 1', 'term 2', 'term 3', 'term 4']);
        });

        foreach (DonationRecord::all() as $donationRecord) {
            $term = $donationRecord->term;
            if ($term) {
                $donationRecord->donationTerm = 'term ' . $term->term;
                $donationRecord->donationYear = $term->year;
                $donationRecord->save();
            } else {
                echo 'false';
            }
        }

        Schema::table(DonationRecord::tableName(), function($table) {
            $table->dropColumn('donation_term_id');
        });
    }
}
