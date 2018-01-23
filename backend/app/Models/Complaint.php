<?php

namespace App\Models;
use DB;

/**
 * Class Complaint
 * @package App\Models
 * @property int    $id
 * @property string $createdAt
 * @property string $text
 * @property string $handlerFullname
 * @property string $actionTaken
 * @property string $actionDeadline
 * @property string $completionDate
 * @property string $suggestions
 * @property string $otherComments
 * relations
 * @property User[]                $users
 * @property BranchAssociated|null $branchAssociated
 * @property Term|null             $term
 * @property ComplaintType[]       $types
 */
class Complaint extends ExtendedModel
{
    protected $table = 'complaints';

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function users()
    {
        return $this->belongsToMany('App\\Models\\User', 'users_complaints', 'complaint_id', 'user_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function types()
    {
        return $this->belongsToMany('App\\Models\\ComplaintType', 'complaints_types', 'complaint_id', 'type_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function branchAssociated()
    {
        return $this->belongsTo('App\\Models\\BranchAssociated', 'branch_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function term()
    {
        return $this->belongsTo('App\\Models\\Term', 'term_id');
    }

    public function setBranchIdAttribute($value)
    {
        $this->attributes['branch_id'] = $value != 'null' ? $value : null;
    }

    public function setTermIdAttribute($value)
    {
        $this->attributes['term_id'] = $value != 'null' ? $value : null;
    }

    public static function branchesStat($query)
    {
        $query->leftJoin(BranchAssociated::tableName(), BranchAssociated::tableName().'.id', '=', Complaint::tableName().'.branch_id');
        $query->groupBy(Complaint::tableName().'.branch_id');
        $query->select(DB::raw('COUNT(*) AS branches_count, '.BranchAssociated::tableName().'.branch_name'));
        $results = $query->get()->reduce(function ($carry, $item) {
            $branch_name = $item->branch_name ?: '-';
            if (!isset($carry[$branch_name])) {
                $carry[$branch_name] = 0;
            }
            $carry[$branch_name] += $item->branches_count;
            return $carry;
        }, collect([]))->map(function($item, $key) {
            return [
                'label' => $key,
                'value' => $item,
            ];
        })->values()->all();
        return $results;
    }

    public static function complaintTypesStat($query)
    {
        $query->leftJoin('complaints_types', 'complaints_types.complaint_id', '=', Complaint::tableName().'.id');
        $query->leftJoin(ComplaintType::tableName(), ComplaintType::tableName().'.id', '=', 'complaints_types.type_id');
        $query->groupBy('complaints_types.type_id');
        $query->select(DB::raw('COUNT(*) AS types_count, '.ComplaintType::tableName().'.name'));
        $results = $query->get()->reduce(function ($carry, $item) {
            $name = $item->name ?: '-';
            if (!isset($carry[$name])) {
                $carry[$name] = 0;
            }
            $carry[$name] += $item->types_count;
            return $carry;
        }, collect([]))->map(function($item, $key) {
            return [
                'label' => $key,
                'value' => $item,
            ];
        })->values()->all();
        return $results;
    }

    public static function teachersStat($query)
    {
        $query->groupBy('handler_fullname');
        $query->select(DB::raw('COUNT(*) AS teacher_count, handler_fullname'));
        $results = $query->get()->reduce(function ($carry, $item) {
            $handler_fullname = $item->handler_fullname ?: '-';
            if (!isset($carry[$handler_fullname])) {
                $carry[$handler_fullname] = 0;
            }
            $carry[$handler_fullname] += $item->teacher_count;
            return $carry;
        }, collect([]))->map(function($item, $key) {
            return [
                'label' => $key,
                'value' => $item,
            ];
        })->values()->all();
        return $results;
    }

    public static function monthsStat($query)
    {
        $query->select(DB::raw("DATE_FORMAT(`created_at`, '%b %Y') month_name, COUNT(*) months_count"));
        $query->groupBy('month_name');
        $results = $query->get()->reduce(function ($carry, $item) {
            $month_name = $item->month_name ?: '-';
            if (!isset($carry[$month_name])) {
                $carry[$month_name] = 0;
            }
            $carry[$month_name] += $item->months_count;
            return $carry;
        }, collect([]))->map(function($item, $key) {
            return [
                'label' => $key,
                'value' => $item,
            ];
        })->values()->all();
        return $results;
    }
}
