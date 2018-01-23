<?php

namespace App\Classes\Helpers;

use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

class QueryHelper
{
    const LARAVEL_PAGINATION = 'laravel';
    const SIMPLE_PAGINATION = 'simple';

    /**
     * @param Builder $query
     * @param $params
     * @param $paginationStrategy
     * @return array
     */
    public static function paginate($query, $params, $paginationStrategy = QueryHelper::LARAVEL_PAGINATION)
    {
        /**
         * @var PaginationInterface $paginator
         */
        $PaginationClass = __NAMESPACE__ . '\\' . ucfirst($paginationStrategy) . 'PaginationStrategy';
        if (class_exists($PaginationClass)) {
            $paginator = new $PaginationClass();
            return $paginator->paginate($query, $params);
        } else {
            return response()->json('Pagination strategy not implemented', '501');
        }
    }
}

interface PaginationInterface
{
    /**
     * @param Builder $query
     * @param array $params
     * @return array
     */
    public function paginate($query, $params);
}

/**
 * Class LaravelPaginationStrategy
 * @package App\Classes\Helpers
 */
class LaravelPaginationStrategy implements PaginationInterface
{
    public function paginate($query, $params)
    {
        $items = null;
        $count = 0;
        if (isset($params['selectFields']))
            $fields = $params['selectFields'];
        if (
            isset($params['page']) &&
            is_numeric($params['page']) &&
            isset($params['rowsPerPage']) &&
            is_numeric($params['rowsPerPage'])
        ) {
            if (isset($fields))
                $paginator = $query->paginate($params['rowsPerPage'], $fields);
            else
                $paginator = $query->paginate($params['rowsPerPage']);
            $items = $paginator->items();
            $count = $paginator->total();
        } else {
            $items = isset($fields) ? $query->get($fields) : $query->get();
            $count = $query->count();
        }

        return [
            'items' => $items,
            'count' => $count
        ];
    }
}

/**
 * you have to supply your select clause with SQL_CALC_FOUND_ROWS option to get this working
 * Class SimplePaginationStrategy
 * @package App\Classes\Helpers
 */
class SimplePaginationStrategy implements PaginationInterface
{
    public function paginate($query, $params)
    {
        if (isset($params['page']) && isset($params['rowsPerPage'])) {
            $page = $params['page'];
            $rowsPerPage = $params['rowsPerPage'];
            $query->skip((intval($page) - 1) * $rowsPerPage)->take($rowsPerPage);
        }

        return ['rows' => $query->get(), 'info' => (array) DB::select(DB::raw('SELECT FOUND_ROWS() as totalCount;'))[0]];
    }

}