import React from 'react'
import $ from 'jquery'
import ObjHelper from './../utils/ObjHelper.js'

export default class User {
    constructor() {
        this.id = -1
        this.userEmailAddress = ''
        this.userPassword = ''
        this.userStatus = ''
        this.userUniqueId = ''
        this.userName = ''
        this.userFullname = ''
        this.role = {
            roleName: ''
        }
        this.profile = {
            profileForname: '',
            profileSurname: '',
            profileAddress: '',
            profileAddress2: '',
            profilePostcode: '',
            profileTelephone: '',
            profileMobile: '',
            profileGender: '',
            age: '',
            studentNotes: '',
            emergencyContact1Name: '',
            emergencyContact1Address: '',
            emergencyContact1Contact: '',
            emergencyContact2Name: '',
            emergencyContact2Address: '',
            emergencyContact2Contact: ''
        }
        this.attendance = {
            attended: null,
            absentDays: null,
            absentDaysInTwoWeeks: null
        }
    }

    static findById(id, fields, onGet, onError) {
        return Promise.resolve($.ajax({
            type: 'get',
            url: '/api/users/' + id,
            data: { fields: fields },
            dataType: 'json',
            success: data => {
                var user = new User()
                ObjHelper.assignExisting(user, data)
                if (onGet)
                    onGet(user)
            },
            error: () => {
                if (onError)
                    onError()
            }
        }))
    }

    validate() {
        return true
    }

    save() {
        $.ajax({
            type: 'put',
            url: '/api/users/' + this.id,
            data: this.getDbAttributes(),
            success: result => console.log(result),
            error: (xhr, status, error) => console.log(xhr, status, error)
        })
    }

    getDbAttributes() {
        return {
            userEmailAddress: this.userEmailAddress,
            userPassword: this.userPassword,
            userStatus: this.userStatus,
            userUniqueId: this.userUniqueId,
            profile: this.profile
        }
    }

    getSourceUrl() {
        if (this.id)
            return '/api/users/' + this.id;
        return ''
    }

    loadAttendance(onLoad, forceLoad) {
        forceLoad = forceLoad ? forceLoad : false

        var attendanceLoaded = true
        for (var property in this.attendance)
            if (this.attendance[property] === null) {
                attendanceLoaded = false
                break
            }

        if (forceLoad || !attendanceLoaded) {
            $.ajax({
                type: 'get',
                url: '/api/users/' + this.id + '/attendance',
                dataType: 'json',
                success: data => {
                    ObjHelper.assignExisting(this.attendance, data)
                    if (onLoad)
                        onLoad(this.attendance)
                }
            })
        } else {
            onLoad(this.attendance)
        }
    }
}

