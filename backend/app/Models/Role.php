<?php

namespace App\Models;

/**
 * Class Role
 * @package App\Models
 * @property int $id
 * @property string $roleName
 * @property string $roleDescription
 * @property string $roleStatus
 * relations
 * @property User[] $users
 */
class Role extends ExtendedModel
{
    // roles
    const SUPER_ADMIN = "1";
    const REGISTRAR = "2";
    const STUDENT = "3";
    const TEACHER = "4";
    const ADMIN = "5";
    //const SUPERVISOR = "6"; Supervisor is deprecated role

    protected $table = 'r_role';

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function users()
    {
        return $this->hasMany('App\\Models\\User');
    }

    public static function roleNameToId($role)
    {
        switch ($role) {
            case 'teachers':
                return static::TEACHER;
            case 'super-admins':
                return static::SUPER_ADMIN;
            case 'registrars':
                return static::REGISTRAR;
            case 'students':
                return static::STUDENT;
            case 'admins':
                return static::ADMIN;
        }

        return null;
    }
}
