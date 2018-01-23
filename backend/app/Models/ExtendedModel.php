<?php

namespace App\Models;

use App\Classes\Helpers\ArrayHelper;
use App\Classes\Helpers\DataFormatter;
use App\Classes\Helpers\StringHelper;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\DB;

/**
 * Class BaseModel
 * @package App\Models
 * @property string $table
 */
class ExtendedModel extends Model
{
    protected $table;
    protected $delegatedFields = [];
    protected $hiddenFields = [];
    protected $primaryKeys = [];

    /**
     * @var string[] $relationNames
     */
    public $relationNames = null;
    public $timestamps = false;

    public static function className()
    {
        return get_called_class();
    }

    /**
     * @return string
     */
    public static function tableName()
    {
        return (new static)->table;
    }

    public function __construct(array $input = [], array $attributes = [])
    {
        $defaultAttributes = $this->attributes;
        $this->initAttributes();

        if (!empty($defaultAttributes)) {
            foreach ($defaultAttributes as $attrKey => $attrValue) {
                if (empty($this->attributes[$attrKey])) {
                    $this->attributes[$attrKey] = $attrValue;
                }
            }
        }

        foreach ($attributes as $key => $value) {
            $trueKey = $this->getTruePropName($key);
            if ($trueKey !== $key) {
                $attributes[$trueKey] = $value;
                unset($attributes[$key]);
            }
        }

        parent::__construct($attributes);
        $this->relationNames = $this->getRelationNames();

        if (!empty($input)) {
            $this->loadInput($input);
        }

        if (empty($this->fillable)) {
            $this->fillable = array_keys($this->getAttributes());
        }
    }

    /**
     * @param string $enumType
     * @return array
     */
    public static function getEnumValues($enumType)
    {
        $enumType = str_replace('-enum', '', $enumType);

        $getterName = ucfirst(preg_replace_callback('/(-[a-z])/', function ($match) {
            return strtoupper(ltrim($match[0], '-'));
        }, $enumType));
        $getterName = 'get' . $getterName . 'Values';

        if (method_exists(static::class, $getterName)) {
            if ($data = static::$getterName())
                return $data;
        }

        return static::getDbEnumValues($enumType);
    }

    /**
     * @param string $column
     * @return array
     */
    public static function getDbEnumValues($column)
    {
        $column = str_replace('-', '_', $column);
        $column = str_replace('_enum', '', $column);

        $rows = DB::select(
            DB::raw("SHOW COLUMNS FROM " . static::tableName() . " WHERE Field = '$column'")
        );

        if (!$rows || count($rows) == 0) return null;
        $type = $rows[0]->Type;
        preg_match('/^enum\((.*)\)$/', $type, $matches);
        if (count($matches) == 0) return false;

        $enum = [];
        foreach (explode(',', $matches[1]) as $value) {
            $v = trim($value, "'");
            $enum[] = $v;
        }
        return $enum;
    }

    /**
     * With this overload we can use underscored attributes like if they were camelCased
     * Also, we can access we can treat keys from delegated fields as if they were normal fields
     *
     * @param string $key
     * @return mixed
     */
    public function __get($key)
    {
        if (empty($this->attributes))
            $this->attributes = $this->getAllColumnsNames();

        $this->useDelegatedValue($key, function ($delegatedValue) use (&$value) {
            $value = $delegatedValue;
        });

        if (isset($value)) return $value;

        $propName = $this->getTruePropName($key);
        if (!is_null($propName))
            return parent::__get($propName);

        return null;
    }

    public function __set($key, $value)
    {
        $this->useDelegatedValue($key, function (&$delegatedValue) use ($value, &$isDelegated) {
            $delegatedValue = $value;
        });

        if (isset($isDelegated)) return true;

        $propName = $this->getTruePropName($key, true);
        if (!is_null($propName)) {
            parent::__set($propName, $value);
            return true;
        }

        return false;
    }

    /**
     * @param string $key
     * @param bool $isSetting
     * @return string|null
     */
    private function getTruePropName($key, $isSetting = false)
    {
        $isValidKey = function ($key) use ($isSetting) {
            if ($isSetting) {
                return array_key_exists($key, $this->attributes) || $this->hasSetMutator($key);
            }

            $notNull = false;

            // try/catch allows ignoring cases where method exists,
            // but it doesn't define relation
            try {
                $notNull = !is_null(parent::__get($key));
            } catch (\Exception $e) {
            }

            return $notNull;
        };

        if ($isValidKey($key))
            return $key;

        $key = StringHelper::camelCaseToUnderscore($key);
        if ($isValidKey($key))
            return $key;

        return null;
    }

    /**
     * @param string $key
     * @return bool
     */
    public function hasKey($key)
    {
        return !is_null($this->getTruePropName($key)) ? true : false;
    }

    public static function insertIgnore($data, $tableName = null) {
        if (is_null($tableName)) {
            $tableName = static::tableName();
        }

        /*$a = new static();
        if($a->timestamps){
            $now = \Carbon\Carbon::now();
            $data['created_at'] = $now;
            $data['updated_at'] = $now;
        }*/

        if (is_array($data[array_keys($data)[0]])) {
            foreach ($data as $item) {
                static::insertIgnore($item, $tableName);
            }
        } else {
            return DB::insert('INSERT IGNORE INTO ' . $tableName . ' (' . implode(',', array_keys($data)) .
                ') values (?' . str_repeat(',?', count($data) - 1) . ')', array_values($data));
        }
    }

    /**
     * TODO: get all relation names once in constructor or on first call
     * @return string[]
     */
    public function getRelationNames()
    {
        if (isset($this->relationNames))
            return $this->relationNames;

        $relationNames = [];
        $relationClassesPattern = '\\Illuminate\\Database\\Eloquent\\Relations\\';
        $reflectionObj = new \ReflectionClass($this);
        $thisClassName = $reflectionObj->getName();
        foreach ($reflectionObj->getMethods() as $method) {
            if ($thisClassName === $method->getDeclaringClass()->getName()) {
                $phpDoc = $method->getDocComment();
                if (strpos($phpDoc, $relationClassesPattern)) {
                    $relationNames[] = $method->getName();
                }
            }
        }

        $this->relationNames = $relationNames;
        return $relationNames;
    }

    /**
     * asArray instead of overriding toArray, because we need another set of arguments
     * @param bool|true $withRelations
     * @param bool|false $recursive
     * @param array $relations
     * @return array
     */
    public function asArray($relations = null, $withRelations = false, $recursive = false)
    {
        $output = [];
        foreach ($this->attributes as $name => $value) {
            $output[StringHelper::underscoreToCamelCase($name)] = $value;
        }

        foreach ($this->delegatedFields as $field => $relation) {
            $relatedModel = $this->$relation;
            if ($relatedModel)
                $output[$field] = $relatedModel->$field;
        }

        foreach ($this->getMutatedAttributes() as $attribute) {
            $output[StringHelper::underscoreToCamelCase($attribute)] = $this->$attribute;
        }

        /**
         * we may want get array representation of model without some specific relations
         */
        $excludingRelations = !$withRelations && isset($relations);

        if ($excludingRelations || $withRelations) {
            foreach ($this->getRelationNames() as $relationName) {
                $relationCheck = null;
                if ($withRelations)
                    $relationCheck = is_null($relations) || in_array($relationName, $relations);
                else
                    $relationCheck = !in_array($relationName, $relations);

                if ($relationCheck) {
                    $property = $this->$relationName;
                    if (is_array($property) || $property instanceof Collection) {
                        foreach ($property as $elem) {
                            if (method_exists($elem, 'asArray'))
                                $output[$relationName][] = $elem->asArray(null, $recursive, $recursive);
                        }
                    } else {
                        if (method_exists($property, 'asArray'))
                            $output[$relationName] = $property->asArray(null, $recursive, $recursive);
                    }
                }
            }
        }

        foreach ($this->hiddenFields as $hiddenField)
            if (array_key_exists($hiddenField, $output))
                unset($output[$hiddenField]);

        return $output;
    }

    /**
     * @param string[] $fields
     * @return string[]
     */
    public function fieldsToArray($fields)
    {
        $result = [];
        foreach ($fields as $field) {
            if (strpos($field, '.') !== false) {
                $nestedField = $this->getFieldByStringPath($field);
                if (!isset($nestedField)) continue;
                $nestedObj = DataFormatter::createObjByPath(
                    explode('.', $field),
                    $nestedField
                );
                $result = array_merge_recursive($result, $nestedObj);
            } elseif (!is_null($this[$field])) {
                $fieldValue = $this[$field];

                if ($fieldValue instanceof Collection) {
                    $fieldValue = DataFormatter::modelsToArrays($fieldValue);
                }

                $result[$field] = $fieldValue;
            }
        }
        return $result;
    }

    // this override adds support for multiple primary keys
    public function delete()
    {
        if (is_null($this->getKeyName()) && empty($this->primaryKeys)) {
            throw new Exception('No primary keys defined on model.');
        }

        if ($this->exists) {
            if ($this->fireModelEvent('deleting') === false) {
                return false;
            }

            // Here, we'll touch the owning models, verifying these timestamps get updated
            // for the models. This will allow any caching to get broken on the parents
            // by the timestamp. Then we will go ahead and delete the model instance.
            $this->touchOwners();

            $this->performDeleteOnModel();

            $this->exists = false;

            // Once the model has been deleted, we will fire off the deleted event so that
            // the developers may hook into post-delete operations. We will then return
            // a boolean true as the delete is presumably successful on the database.
            $this->fireModelEvent('deleted', false);

            return true;
        }
    }


    /**
     * @param string $path
     * @return mixed
     */
    public function getFieldByStringPath($path)
    {
        $obj = $this;
        $parts = explode('.', $path);
        foreach ($parts as $part) {
            if ($obj[$part] == null) return null;
            $obj = $obj[$part];
        }

        return $obj;
    }

    /**
     * Searches delegated values in related models, specified in $delegatedFields array
     * Callback is used for universality in order to remove duplicate code
     * @param $key
     * @param $callback
     */
    private function useDelegatedValue($key, $callback)
    {
        $delegatedFields = $this->delegatedFields;
        if (isset($delegatedFields[$key])) {
            $relationModel = $this[$delegatedFields[$key]];
            if ($relationModel) {
                if ($callback($relationModel->$key) === false)
                    unset($relationModel->$key);
            }
        }
    }

    protected function setKeysForSaveQuery(Builder $query)
    {
        if (empty($this->primaryKeys)) {
            return parent::setKeysForSaveQuery($query);
        }

        foreach ($this->primaryKeys as $primaryKey) {
            $query->where($primaryKey, '=', $this->getAttribute($primaryKey));
        }

        return $query;
    }

    public function beforeSave()
    {
        return true;
    }

    /**
     * TODO: Make atomic
     * @param array $options
     * @return bool
     */
    public function save(array $options = [], $keyBeforeSave=null)
    {
       if ($keyBeforeSave==='updatePayment')
       {
           $result = true;
       }
       else
       {
           $result = $this->beforeSave();
       }
        if ($result === true) {
            $result = parent::save($options);
            if ($result) $this->afterSave($options);
        }

        return $result;
    }

    public function afterSave(array $options = [])
    {
        if (isset($options['saveRelations'])) {
            foreach ($this->relations as $relationName => $relationObj) {
                $relationQuery = $this->{$relationName}();

                if ($relationObj instanceof Model) {
                    if (isset($options['recursive'])) {
                        $relationObj->save(['saveRelations' => true]);
                    } else {
                        $relationObj->save();
                    }
                } elseif ($relationObj instanceof Collection) {
                    foreach ($relationObj as $item) {
                        if (!$item->getKey()) {
                            $relationQuery->save($item);
                        } else {
                            if ($item->isDeleted) {
                                $item->delete();
                            } elseif ($item->isDirty()) {
                                $item->save();
                            }
                        }
                    }
                } elseif (is_array($relationObj)) {
                    if ($relationQuery instanceof BelongsToMany) {
                        $relationQuery->sync($relationObj);
                    }
                }
            }
        }
    }

    public function createWithRelated($input)
    {
        $relationsInput = [];
        $relations = $this->getRelationNames();
        foreach ($input as $key => $value) {
            if (in_array($key, $relations)) {
                $relationsInput[$key] = $value;
            } else {
                $this->$key = $value;
            }
        }

        $result = $this->save();

        foreach ($relationsInput as $key => $value) {
            $relationQuery = $this->{$key}();
            $RelationModelClass = $relationQuery->getRelated();
            if ($relationQuery instanceof BelongsToMany) {
                $this->$key = $value;
            } else {
                $relationModel = new $RelationModelClass;
                $relationModel->loadInput($value);
                $result = $result && $relationQuery->save($relationModel);
            }
        }

        return $result;
    }

    // TODO: refactor mess
    public function loadInput($input)
    {
        $relations = $this->getRelationNames();
        foreach ($input as $key => $value) {

            if (in_array($key, $relations)) {

                $relationValue = $this->$key;
                $relationQuery = $this->{$key}();

                if ($relationValue instanceof Collection) {
                    /**
                     * @var ExtendedModel $RelationModelClass
                     */
                    $relationQuery = $this->{$key}();
                    $RelationModelClass = $relationQuery->getRelated();
                    $primaryKey = $RelationModelClass->getKeyName();

                    if ($relationQuery instanceof BelongsToMany) {
                        if (empty($value)) {
                            $this->relations[$key] = [];
                            continue;
                        }

                        if (!is_array($value)) {
                            continue;
                        }

                        $ids = [];
                        foreach ($value as $item) {
                            if (is_array($item)) {
                                $isDeleted = isset($item['isDeleted']) ?
                                    filter_var($item['isDeleted'], FILTER_VALIDATE_BOOLEAN) : false;

                                if ($isDeleted) {
                                    continue;
                                }

                                $ids[] = $item[$primaryKey];
                            } elseif (is_numeric($item)) {
                                $ids[] = $item;
                            }
                        }

                        $this->relations[$key] = $ids;
                    } else {
                        foreach ($value as $item) {
                            if (isset($item[$primaryKey]) && $relationValue->contains($item[$primaryKey])) {
                                $relationValue->find($item[$primaryKey])->loadInput($item);
                            } else {
                                $relationModel = new $RelationModelClass();
                                $relationModel->loadInput($item);
                                $relationValue->add($relationModel);
                            }
                        }
                    }
                } else if ($relationValue instanceof self) {
                    $relationValue->loadInput($value);
                } else {
                    $this->$key = $value;
                }
            } else {
                $this->$key = $value;
            }
        }
    }

    public function initAttributes()
    {
        switch (DB::connection()->getConfig('driver')) {
            case 'pgsql':
                $query = "SELECT column_name FROM information_schema.columns WHERE table_name = '" . $this->getTable() . "'";
                $column_name = 'column_name';
                $reverse = true;
                break;

            case 'mysql':
                $query = 'SHOW COLUMNS FROM ' . $this->getTable();
                $column_name = 'Field';
                $reverse = false;
                break;

            case 'sqlsrv':
                $parts = explode('.', $this->getTable());
                $num = (count($parts) - 1);
                $table = $parts[$num];
                $query = "SELECT column_name FROM " . DB::connection()->getConfig('database') . ".INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = N'" . $table . "'";
                $column_name = 'column_name';
                $reverse = false;
                break;

            default:
                $error = 'Database driver not supported: ' . DB::connection()->getConfig('driver');
                throw new Exception($error);
                break;
        }

        $newAttributes = [];

        foreach (DB::select($query) as $column) {
            $newAttributes[$column->$column_name] = null;
        }

        if ($reverse) {
            $newAttributes = array_reverse($newAttributes);
        }

        $this->attributes = $newAttributes;

        return true;
    }

    public static function getKeyNameStatic()
    {
        return (new static)->getKeyName();
    }

    public static function updateCollection(array $data, array $options = [])
    {
        $keyBeforeSave='updatePayment';
        $key = static::getKeyNameStatic();
        $formattedKey = StringHelper::underscoreToCamelCase($key);

        $result = true;

        foreach ($data as $item) {
            $model = null;
            if (isset($item[$formattedKey])) {
                $model = static::find($item[$key]);
            }

            if (isset($item['isDeleted']) && $model) {
                $model->delete();
            } else {
                if (!$model) {
                    $model = new static();
                }
                $model->loadInput($item);

                $result &= $model->save($options, $keyBeforeSave);
            }
        }

        return $result;
    }

    public static function findOrCreate($condition)
    {
        $model = static::where($condition)->first();
        if (!$model) {
            $model = new static($condition);
            $model->save();
        }

        return $model;
    }
}
