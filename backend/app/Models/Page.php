<?php

namespace App\Models;

/**
 * Class Page
 * @package App\Models
 * @property string $title
 * @property string $slug
 * @property string $content
 * @property int $weight
 * @property string $linkPosition
 * @property string $createdAt
 * @property string $updatedAt
 */
class Page extends ExtendedModel
{
    protected $table = 'pages';
}