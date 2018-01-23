<form role="form" action="" method="post" name="filterForm" id="filterForm">
    <input type="hidden" name="_token" value="{{ csrf_token() }}">
    <div class="row">
        <div class="col-md-5">
            <div class="form-group">
                <label for="genderSelect">Gender</label>
                <select class="form-control" name="genderSelect" id="genderSelect">
                    <option value selected="selected">All</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
            </div>

            <div class="form-group">
                <label for="coursesCount">Users with x number of courses</label>
                <input class="form-control" type="text" name="coursesCount" id="coursesCount">
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-md-5">
            <div class="form-group">
                <label for="postcodeBeginning">Users with postcode beginning XXX</label>
                <input class="form-control" type="text" name="postcodeBeginning" id="postcodeBeginning">
            </div>
        </div>

        <div class="col-md-offset-2 col-md-5">
            <div class="form-group">
                <label for="city">Users with town/city</label>
                <input class="form-control" type="text" name="city" id="city">
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-md-5">
            <div class="form-group">
                <label for="advancedSearch">Show Grade/Courses</label>
                <input type="checkbox" id="advancedSearch" name="advancedSearch">
            </div>
        </div>
    </div>

    <div id="onAdvancedSearch" style="display: none">
        <div class="row">
            <div class="col-md-5">
                <div class="form-group">
                    <label for="fromYear">From year</label>
                    <input class="form-control" type="text" name="fromYear" id="fromYear">
                </div>
            </div>

            <div class="col-md-offset-2 col-md-5">
                <div class="form-group">
                    <label for="fromTerm">From term</label>
                    <input class="form-control" type="text" name="fromTerm" id="fromTerm">
                </div>
            </div>
        </div>

        <div class="form-group">
            <label for="includeDepartments">Include these departments</label>
            <input type="radio" name="departmentsMode" id="includeDepartments" value="include" checked="checked">
            <label for="excludeDepartments">Exclude these departments</label>
            <input type="radio" name="departmentsMode" id="excludeDepartments" value="exclude">
        </div>

        <div class="form-group">
            <div class="list-box" id="departmentsSelect">
            </div>
        </div>

        <div class="row">
            <div class="col-md-5">
                <div class="form-group">
                    <label for="courseSelect">Course</label>
                    <select class="form-control" name="courseSelect" id="courseSelect">
                        <option value selected="selected">All Courses</option>
                    </select>
                </div>
            </div>

            <div class="col-md-offset-2 col-md-5">
                <div class="form-group">
                    <label for="courseClassSelect">Class</label>
                    <select class="form-control" name="courseClassSelect" id="courseClassSelect">
                        <option value selected="selected">All Classes</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-5">
                <div class="form-group">
                    <label for="invoiceId">Transaction No Like</label>
                    <input class="form-control" type="text" id="invoiceId" name="invoiceId">
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-12">
                <label>Transaction between</label>
            </div>
        </div>

        <div class="row">
            <div class="col-md-5">
                <div class="form-group">
                    <input class="form-control" type="text"
                           id="transactionBetweenStart" name="transactionBetweenStart">
                </div>
            </div>
            <div class="col-md-2">
                <div class="form-group">
                    <p class="filter-form-centered-text">Until</p>
                </div>
            </div>
            <div class="col-md-5">
                <div class="form-group">
                    <input class="form-control" type="text"
                           id="transactionBetweenEnd" name="transactionBetweenEnd">
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-12">
                <label>Grade between</label>
            </div>
        </div>

        <div class="row">
            <div class="col-md-5">
                <div class="form-group">
                    <input class="form-control" type="text"
                           id="gradeBetweenStart" name="gradeBetweenStart">
                </div>
            </div>
            <div class="col-md-2">
                <div class="form-group">
                    <p class="filter-form-centered-text">Until</p>
                </div>
            </div>
            <div class="col-md-5">
                <div class="form-group">
                    <input class="form-control" type="text"
                           id="gradeBetweenEnd" name="gradeBetweenEnd">
                </div>
            </div>
        </div>

        <div class="form-group">
            <label for="currentTermActivePaid">Who have courses in this term (active/paid)</label>
            <input type="checkBox" name="currentTermActivePaid"
                   id="currentTermActivePaid" value="1">
            <label for="notCurrentTermActivePaid">Who did not attend this term</label>
            <input type="checkBox" name="currentTermActivePaid"
                   id="notCurrentTermActivePaid" value="0">
        </div>

        <div id="regPaymentStatuses">
            <div class="row">
                <div class="col-md-5">
                    <div class="form-group">
                        <label for="paymentStatusSelect">Payment Status</label>
                        <select class="form-control" name="paymentStatusSelect" id="paymentStatusSelect">
                            <option value selected="selected">All Statuses</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-5">
                    <div class="form-group">
                        <label for="regStatusSelect">Registration Status</label>
                        <select class="form-control" name="regStatusSelect" id="regStatusSelect">
                            <option value selected="selected">All Statuses</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-5">
                <div class="form-group">
                    <label for="paymentMethodSelect">Payment method</label>
                    <select class="form-control" name="paymentMethodSelect" id="paymentMethodSelect">
                        <option value selected="selected">All Methods</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-5">
                <div class="form-group">
                    <label for="employmentTypeSelect">Employment Type</label>
                    <select class="form-control" name="employmentTypeSelect" id="employmentTypeSelect">
                        <option value selected="selected">All Types</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-12">
                <label>Amount Between</label>
            </div>
        </div>

        <div class="row">
            <div class="col-md-5">
                <div class="form-group">
                    <input class="form-control" type="text"
                           id="amountBetweenStart" name="amountBetweenStart">
                </div>
            </div>
            <div class="col-md-2">
                <div class="form-group">
                    <p class="filter-form-centered-text">Until</p>
                </div>
            </div>
            <div class="col-md-5">
                <div class="form-group">
                    <input class="form-control" type="text"
                           id="amountBetweenEnd" name="amountBetweenEnd">
                </div>
            </div>
        </div>
    </div>

    <div class="form-group">
        <input class="btn btn-warning" type="submit" value="Filter">
    </div>

    <div>
        <table class="table table-striped results-table" id="foundResults" style="display: none;">
            <thead id="tableHead">
                <th style="width: 40%">Full name</th>
                <th>Email Address</th>
                <th></th>
            </thead>

            <thead id="tableAdvancedHead">
                <th style="width: 130px;">Full name</th>
                <th>Email Address</th>
                <th>Course Title</th>
                <th>Class Term</th>
                <th>Grade Register Date</th>
                <th></th>
            </thead>

            <tbody>
            </tbody>
        </table>
    </div>

    <ul class="pagination" id="pagination">
    </ul>
</form>