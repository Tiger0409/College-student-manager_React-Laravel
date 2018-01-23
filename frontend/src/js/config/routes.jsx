import { Route, IndexRoute, Redirect } from 'react-router'
import React from 'react'
import App from '../components/base/App.jsx'
import Home from '../components/base/Home.jsx'
import Dashboard from '../components/base/Dashboard.jsx'
import Transactions from '../components/base/transactions/Transactions.jsx'
import PaypalTransactions from '../components/base/transactions/PaypalTransactions.jsx'
import StripeTransactions from '../components/base/transactions/StripeTransactions.jsx'
import PaypalTransactionDetail from '../components/base/transactions/PaypalTransactionDetail.jsx'
import StripeTransactionDetail from '../components/base/transactions/StripeTransactionDetail.jsx'
import ClassRegisters from '../components/base/transactions/ClassRegisters'
import AllTransactions from '../components/base/transactions/AllTransactions.jsx'
import Courses from '../components/base/Courses.jsx'
import CoursesEdit from '../components/base/CoursesEdit.jsx'
import Classes from '../components/base/Classes.jsx'
import ClassesDetail from '../components/base/courseClasses/ClassesDetail.jsx'
import ClassesEdit from '../components/base/courseClasses/ClassesEdit.jsx'
import PaymentStudent from'../components/students/Events/PaymentStudent.jsx'
import ClassStudents from '../components/base/courseClasses/ClassStudents.jsx'
import ClassRegisterAttendance from '../components/base/courseClasses/ClassRegisterAttendance.jsx'
import ClassesAvailable from '../components/students/ClassesAvailable.jsx'
import PrintClass from '../components/base/courseClasses/PrintClass.jsx'
import PrintClasses from '../components/base/courseClasses/PrintClasses.jsx'
import Depts from '../components/base/Depts.jsx'
import DeptsEdit from '../components/base/DeptsEdit.jsx'
import Classrooms from '../components/base/Classrooms.jsx'
import ClassroomsEdit from '../components/base/ClassroomsEdit.jsx'
import Attendance from '../components/base/Attendance.jsx'
import Debtors from '../components/base/Debtors.jsx'
import Users from '../components/base/users/Users.jsx'
import UserList from '../components/base/users/UserList.jsx'
import UserEdit from '../components/base/users/UserEdit.jsx'
import TeacherPayName from '../components/base/users/teachers/TeacherPayName.jsx'
import TeacherSubmitHours from '../components/base/users/teachers/TeacherSubmitHours.jsx'
import UserDetail from '../components/base/users/UserDetail.jsx'
import UserReconcile from '../components/base/users/UserReconcile.jsx'
import UserWaiting from '../components/base/users/UserWaiting.jsx'
import Donations from '../components/base/donations/Donations.jsx'
import DonationsDetail from '../components/base/donations/DonationsDetail.jsx'
import DonationsEdit from '../components/base/donations/DonationsEdit.jsx'
import DonationRecordsDetail from '../components/base/donations/DonationRecordsDetail.jsx'
import Settings from '../components/base/settings/Settings.jsx'
import SettingsEmail from '../components/base/settings/SettingsEmail.jsx'
import SettingsGeneral from '../components/base/settings/SettingsGeneral.jsx'
import SettingsPaypal from '../components/base/settings/SettingsPaypal.jsx'
import SettingsWebsite from '../components/base/settings/SettingsWebsite.jsx'
import SettingsMultiBranches from '../components/base/settings/SettingsMultiBranches.jsx'
import SettingsPages from '../components/base/settings/SettingsPages.jsx'
import SettingsBranches from '../components/base/settings/SettingsBranches.jsx'
import SettingsTerms from '../components/base/settings/SettingsTerms.jsx'
import SettingsBank from '../components/base/settings/SettingsBank.jsx'
import WebsitesDetail from '../components/base/websites/WebsitesDetail.jsx'
import WebsitesEdit from '../components/base/websites/WebsitesEdit.jsx'
import BranchDetail from '../components/base/branches/BranchDetail.jsx'
import TermEdit from '../components/base/terms/TermEdit.jsx'
import Logs from '../components/superAdmin/Logs.jsx'
import LogDetail from '../components/base/LogDetail.jsx'
import CourseRegEdit from '../components/base/users/students/CourseRegEdit.jsx'
import CourseRegResults from '../components/base/users/students/CourseRegResults.jsx'
import Test from '../components/base/Test.jsx'
import Auth from './../utils/Auth.js'
import PrintReceipt from '../components/base/users/students/PrintReceipt.jsx'
import PrintReceiptRows from '../components/base/users/students/PrintReceiptRows.jsx'
import PrintReport from '../components/base/users/students/PrintReport.jsx'
import PrintCert from '../components/base/users/students/PrintCert.jsx'
import PrintUsers from '../components/base/users/PrintUsers.jsx'
import PrintTeacherPayname from '../components/base/users/teachers/PrintTeacherPayname.jsx'
import Login from '../components/base/Login.jsx'
import ForgotPassword from '../components/base/ForgotPassword.jsx'
import ResetPassword from '../components/base/ResetPassword.jsx'
import Cart from '../components/students/Cart.jsx'
import Profile from '../components/base/Profile.jsx'
import RegistrationSuccess from '../components/base/RegistrationSuccess.jsx'
import AddNewUser from '../components/registrar/AddNewUser.jsx'
import TeachersRegister from '../components/registrar/TeachersRegister.jsx'
import PrintTransactions from '../components/base/transactions/PrintTransactions.jsx'
import PrintDebtors from '../components/base/users/PrintDebtors.jsx'
import RegistrationForm from '../components/base/RegistrationForm.jsx'
import PaymentSuccess from '../components/base/PaymentSuccess.jsx'
import PaymentCancel from '../components/base/PaymentCancel.jsx'
import Complaints from '../components/base/complaints/Complaints.jsx'
import ComplaintsList from '../components/base/complaints/ComplaintsList.jsx'
import ComplaintsEdit from '../components/base/complaints/ComplaintsEdit.jsx'
import ComplaintsPrint from '../components/base/complaints/ComplaintsPrint'
import ComplaintPrint from '../components/base/complaints/ComplaintPrint'

export const routes = (
    <Route path=''>
        <Route path='/' component={App}>
            <IndexRoute component={Home} />
            <Route path='/dashboard' component={Dashboard} />

            <Route path='/transactions' component={Transactions}>
                <Route path='/transactions/paypal'>
                    <IndexRoute component={PaypalTransactions} />
                    <Route path='/transactions/paypal/:id' component={PaypalTransactionDetail} />
                    <Route path='/transactions/stripe/:id' component={StripeTransactionDetail} />
                </Route>

                <Route path='/transactions/stripe' component={StripeTransactions} />

                <Route path='/transactions/all' component={AllTransactions} />

                <Route path='/transactions/class-registers' component={ClassRegisters} />
            </Route>

            <Route path='/courses' component={Courses} />
            <Route path='/courses/dept/:deptId' component={Courses} />
            <Route path='/courses/dept/:deptId/add' component={CoursesEdit} />
            <Route path='/courses/add' component={CoursesEdit} />
            <Route path='/courses/:id' component={CoursesEdit} />
            <Route path='/courses/:courseId/classes' component={Classes} />
            <Route path='/classes' component={Classes} />
            <Route path='/classes/add' component={ClassesEdit} />
            <Route path='/classes/available' component={ClassesAvailable} />
            <Route path='/classes/:id' component={ClassesDetail} />
            <Route path='/classes/:id/edit' component={ClassesEdit} />

            <Route path='/cart' component={Cart} />
            <Route path='/pay-student/:amount/:id' component={PaymentStudent}/>
            <Route path='/depts' component={Depts} />
            <Route path='/depts/add' component={DeptsEdit} />
            <Route path='/depts/:id/edit' component={DeptsEdit} />

            <Route path='/classrooms' component={Classrooms} />
            <Route path='/classrooms/add' component={ClassroomsEdit} />
            <Route path='/classrooms/:id/edit' component={ClassroomsEdit} />

            <Route path='/attendance' component={Attendance} />

            <Route path='/debtors' component={Debtors} />

            <Route path='/users' component={Users}>
                <Route path='/users/role/:role' component={UserList} />
                <Route path='/users/role/:role/add' component={UserEdit} />
                <Route path='/users/reconcile' component={UserReconcile} />
                <Route path='/users/waiting' component={UserWaiting} />
                <Route path='/users/:id' component={UserDetail} />
                <Route path='/users/:id/edit' component={UserEdit} />
                {/*<Route path='/users/role/teachers/submit-hours' component={TeacherSubmitHours} />*/}
                <Route path='/addpay/:PayNameId/:id' component={TeacherPayName} />
                <Route path='/teachers-register' component={TeachersRegister} />
            </Route>

            <Route path='/new-user' component={AddNewUser}>
            </Route>

            <Route path='/profile' component={Profile} />

            <Route path='/students/:id' component={CourseRegEdit} />
            <Route path='/students/:id/grades' component={CourseRegResults} />

            <Route path='/donations' component={Donations} />
            <Route path='/donations/add' component={DonationsEdit} />
            <Route path='/donations/:id' component={DonationsEdit} />

            <Route path='/donation-records/:id' component={DonationRecordsDetail} />

            <Route path='/complaints' component={Complaints}>
                <IndexRoute component={ComplaintsList} />
                <Route path="/complaints/list" component={ComplaintsList} />
                <Route path="/complaints/add"  component={ComplaintsEdit} />
                <Route path="/complaints/:id"  component={ComplaintsEdit} />
            </Route>

            <Route path='/settings' component={Settings}>
                <Route path='/settings/general' component={SettingsGeneral} />
                <Route path='/settings/multi-branches' component={SettingsMultiBranches} />
                <Route path='/settings/pages' component={SettingsPages} />
                <Route path='/settings/terms' component={SettingsTerms} />
                <Route path='/settings/bank' component={SettingsBank} />

                <Route path='/websites/add' component={WebsitesEdit} />
                <Route path='/websites/:id' component={WebsitesDetail} />

                <Route path='/branches/add' component={BranchDetail} />
                <Route path='/branches/:id' component={BranchDetail} />

                <Route path='/terms/add' component={TermEdit} />
                <Route path='/terms/:id' component={TermEdit} />
            </Route>

            <Route path='/logs' component={Logs} />
            <Route path='/logs/:id' component={LogDetail} />

            <Route path='/test' component={Test} />
            <Route path='/login' component={Login} />
            <Route path='/forgot-password' component={ForgotPassword} />
            <Route path='/reset-password/:resetCode/:userId' component={ResetPassword} />
            <Route path='/registration' component={RegistrationForm} />
            <Route path='/registration-success' component={RegistrationSuccess} />
            <Route path='/payment/success(/:method/:invoice)' component={PaymentSuccess} />
            <Route path='/payment/cancel' component={PaymentCancel} />
        </Route>

        <Route path='/classes/:id/students' component={ClassStudents} />
        <Route path='/classes/:id/register-attendance' component={ClassRegisterAttendance} />
        <Route path='/students/:id/print-receipt/:branchId' component={PrintReceipt} />
        <Route path='/students/print-receipt-rows/:students' component={PrintReceiptRows} />
        <Route path='/students/:id/print-report' component={PrintReport} />
        <Route path='/students/:id/print-cert' component={PrintCert} />
        <Route path='/students/print-debtors/:type/:filters' component={PrintDebtors} />
        <Route path='/classes/:id/print/:type' component={PrintClass} />
        <Route path='/classes/print/:type' component={PrintClasses} />
        <Route path='/classes/print/:term/:type' component={PrintClasses} />
        <Route path='/users/:role/print/:type' component={PrintUsers} />
        <Route path='/payname/:payNameId/:branchId' component={PrintTeacherPayname} />
        <Route path='/users/:role/print/:type/filters/:filters' component={PrintUsers} />
        <Route path='/transactions/print/:type/filters/:filters' component={PrintTransactions} />
        <Route path='/transactions/print/:type/filters' component={PrintTransactions} />
        <Route path='/transactions/print/:type/filters/' component={PrintTransactions} />
        <Route path="/complaints/print/:filters" component={ComplaintsPrint} />
        <Route path="/complaints/:id/print" component={ComplaintPrint} />
    </Route>
)