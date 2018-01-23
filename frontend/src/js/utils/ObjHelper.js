import React from 'react'

export default class ObjHelper {
    static checkNestedProps(obj) {
        var args = Array.prototype.slice.call(arguments, 1)

        for (var i in args) {
            if (!obj || !obj.hasOwnProperty(args[i]))
                return false

            obj = obj[args[i]]
        }

        return true
    }

    static assignExisting(target, source) {
        if (!source) return false

        for (var key in source) {
            if (target.hasOwnProperty(key)) {
                if (typeof target[key] === 'object' && target[key] !== null) {
                    ObjHelper.assignExisting(target[key], source[key])
                } else {
                    target[key] = source[key]
                }
            }
        }
    }

    static getIfExists(obj, path, defaultValue) {
        var result = ObjHelper.accessObjByPath(obj, path)
        if (result === null || typeof result === 'undefined')
            result = defaultValue

        return result
    }

    /**
     * return value of callback will replace found property value
     */
    static accessObjByPath(obj, path, callback) {
        if (obj === null || typeof obj !== 'object') {
            if (callback) {
                obj = {}
            } else {
                return null
            }
        }

        var schema = obj
        path = path.replace(/\[(\w+)\]/g, '.$1')
        path = path.replace(/^\./, '')
        var props = path.split('.')
        var length = props.length - 1
        for (let i = 0; i < length; ++i) {
            var prop = props[i]

            if (!schema || !(prop in schema)) {
                if (callback) {
                    schema[prop] = {}
                } else {
                    return null
                }
            }

            schema = schema[prop]
        }

        if (callback) {
            schema[props[length]] = callback(schema[props[length]])
        }

        if (schema === null) {
            return null
        }

        return schema[props[length]]
    }

    static deleteProps(obj, props) {
        props.forEach(prop => delete obj.prop)
    }

    static except(obj, props) {
        var clone = Object.assign({}, obj)
        ObjHelper.deleteProps(clone, props)
        return clone
    }

    static concatProps(obj, glue) {
        if (!obj) {
            return ''
        }

        const keys = Object.keys(obj)
        let result = ''
        for (const key in keys) {
            if (result.length > 0) {
                result += glue + obj[key]
            } else {
                result += obj[key]
            }
        }

        return result
    }
}