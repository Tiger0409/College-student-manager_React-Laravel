export const ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN:       'Admin',
    REGISTRAR:   'Registrar',
    GUEST:       'Guest',
    STUDENT:     'Student',
    TEACHER:     'Teacher'
}

export const ROLE_IDS = {
    [ROLES.SUPER_ADMIN]: 1,
    [ROLES.REGISTRAR]:   2,
    [ROLES.STUDENT]:     3,
    [ROLES.TEACHER]:     4,
    [ROLES.ADMIN]:       5,
}

export const DRAG_ITEM_TYPES = {
    COURSE: 'Course',
    GROUP:  'Group',
    CLASS:  'Class'
}

export const STRIPE_PUBLIC_KEY_TEST = 'pk_test_hBwrF4bmq7Aw41s5aMWRQEwr'
export const STRIPE_PUBLIC_KEY_LIVE = 'pk_live_8oQT74wZDh4wMT0ByXJCLCcA'
export const STRIPE_PUBLIC_KEY = STRIPE_PUBLIC_KEY_LIVE

export const TEMPLATE_FOLDERS = [
    { value: 'madrasah', label: 'madrasah' },
    { value: 'Institute', label: 'Institute' },
    { value: 'qurbani', label: 'qurbani' },
    { value: 'Events', label: 'Events' },
    { value: 'uktour', label: 'uktour' }
]
