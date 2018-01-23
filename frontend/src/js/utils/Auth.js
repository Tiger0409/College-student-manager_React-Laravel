import User from './../classes/User.js'
import ObjHelper from './ObjHelper.js'
import Ph from '../utils/PromiseHelper.js'

let requestPromise = null

export default class Auth {
    static login(userName, password) {
        return Promise.resolve(
            $.ajax({
                type: 'post',
                url: '/api/auth/login',
                dataType: 'json',
                data: { userName: userName, password: password }
            })
        )
    }

    static logout() {
        return Promise.resolve(
            $.ajax({
                type: 'post',
                url: '/api/auth/logout',
                dataType: 'json'
            })
        )
    }

    static requestUser(onGet, onError) {
        if (requestPromise) {
            requestPromise.cancel()
        }

        requestPromise = Ph.ajax({
            type: 'get',
            url: '/api/auth/user',
            data: {
                fields: [
                    'id',
                    'userName',
                    'userFullname',
                    'userEmailAddress',
                    'userPassword',
                    'userStatus',
                    'userUniqueId',
                    'role',
                    'profile',
                    'attendance'
                ]
            },
            dataType: 'json',
            success(data) {
                if (onGet) {
                    var user = new User()
                    ObjHelper.assignExisting(user, data)
                    onGet(user)
                }
            },
            error(xhr, status, err) {
                console.error(xhr)

                if (onError)
                    onError(xhr, status, err.toString())
            }
        })
    }
}