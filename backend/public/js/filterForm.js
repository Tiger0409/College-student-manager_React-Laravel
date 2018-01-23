var $courseSelect = $('#courseSelect');
var $courseClassSelect = $('#courseClassSelect');
var $departmentsSelect = $('#departmentsSelect');
var $advancedSearchCheckBox = $('#advancedSearch');
var $advancedSearchObj = $('#onAdvancedSearch');
var $activePaidCheckBoxes = $('input[name="currentTermActivePaid"]');
var $regPaymentStatusesObj = $('#regPaymentStatuses');
var $paymentStatusSelect = $('#paymentStatusSelect');
var $paymentMethodSelect = $('#paymentMethodSelect');
var $regStatusSelect = $('#regStatusSelect');
var $employmentTypeSelect = $('#employmentTypeSelect');
var $pagination = $('#pagination');
var $form = $('#filterForm');
var resultsTable = {
    $advancedHead: $('#tableAdvancedHead'),
    $head: $('#tableHead'),
    $body: $('#foundResults tbody'),
    $table: $('#foundResults')
};
var rowsPerPage = 150;

$(function() {
    $form.submit(function(event) {
        $.post($form.attr('action'), $form.serialize())
            .done(function(data) {
                fillTable(data.rows);
                createPagination(data.info.totalCount, rowsPerPage);
            });

        event.preventDefault();
    });

    initSelects();
    initDepartmentsListBox();

    $advancedSearchCheckBox.click(function(event) {
        $advancedSearchObj.slideToggle('slow');
    });

    $activePaidCheckBoxes.each(function(i, checkBox) {
        var $checkBox = $(checkBox);
        $checkBox.click(function(event) {
            if ($checkBox.prop('checked')) {
                $activePaidCheckBoxes.each(function (j, checkBox) {
                    var $anotherCheckBox = $(checkBox);
                    if (j != i)
                        $anotherCheckBox.prop('checked', false);
                });
                if ($regPaymentStatusesObj.css('display') != 'none')
                    $regPaymentStatusesObj.slideToggle('slow');
            } else
                $regPaymentStatusesObj.slideToggle('slow');
        });
    });
});

function fillSelectFromSrc($selectObj, resourceUrl, params) {
    $selectObj.children().each(function(i, child) {
        if (i != 0) $(child).remove();
    });

    $.ajax({
        type: 'get',
        url: resourceUrl,
        data: params,
        success: function(data) {
            data.forEach(function (elem) {
                $selectObj.append(
                    $('<option></option>')
                        .attr('value', elem.value)
                        .text(elem.label)
                );
            });
        }
    });
}

function initSelects() {
    fillSelectFromSrc($courseSelect, '/courses');
    fillSelectFromSrc($courseClassSelect, '/course-classes');
    fillSelectFromSrc($paymentStatusSelect, '/course-students/get-payment-statuses-enum');
    fillSelectFromSrc($paymentMethodSelect, '/course-students/get-payment-methods-enum');
    fillSelectFromSrc($regStatusSelect, '/course-students/get-reg-statuses-enum');
    fillSelectFromSrc($employmentTypeSelect, '/course-students/get-employment-types-enum');

    $courseSelect.click(function(event) {
        fillSelectFromSrc($courseClassSelect, '/course-classes/', {'courseId' : $courseSelect.val()});
    })
}

function initDepartmentsListBox() {
    $.ajax({
        type: 'get',
        url: '/depts/',
        success: function(data) {
            data.forEach(function(elem) {
                addNameToList(elem);
            });
        }
    });

    var addNameToList = function (elem) {
        var listBoxItemHeader = '<label>';
        var listBoxItemFooter = '<input type="checkbox" name="departmentsSelect[]" value=""></label>';
        var $listBoxItem = $(listBoxItemHeader + elem.label + listBoxItemFooter);
        var $checkBox = $listBoxItem.find('input:checkbox');
        $checkBox.click(function (event) {
            if ($checkBox.prop('checked'))
                $checkBox.parent().addClass('list-box-item-selected');
            else
                $checkBox.parent().removeClass('list-box-item-selected');
        });

        $checkBox.val(elem.id);
        $departmentsSelect.append($listBoxItem);
    };
}

function fillTable(rows)
{
    resultsTable.$body.empty();
    resultsTable.$table.css('display', 'table');

    var properties = ['fullName', 'emailAddress'];
    if ($advancedSearchCheckBox.prop('checked')) {
        resultsTable.$advancedHead.css('display', 'table-header-group');
        resultsTable.$head.css('display', 'none');

        properties = properties.concat(['courseTitle', 'term', 'registerDate']);
    } else {
        resultsTable.$head.css('display', 'table-header-group');
        resultsTable.$advancedHead.css('display', 'none');
    }

    rows.forEach(function(elem) {
        for (var prop in elem)
            if (typeof elem[prop] === 'string' || elem[prop] instanceof String)
                elem[prop] = encodeHtmlEntities(elem[prop]);

        var row = '<tr>';

        properties.forEach(function(property) {
            if (elem.hasOwnProperty(property))
                row += '<td>' + elem[property] + '</td>';
        });

        row += '<td></td>';
        row += '</tr>';

        resultsTable.$body.append(row);
    });
}

function createPagination(totalCount, perPage, currentPage)
{
    $pagination.empty();
    currentPage = currentPage ? currentPage : 1;
    var pagesCount = Math.ceil(totalCount / perPage);
    var $pageBtnTemplate = $('<li><a></a></li>')
    for (var i = 0; i < pagesCount; i++) {
        var $pageBtn = $pageBtnTemplate.clone();
        if (i + 1 == currentPage)
            $pageBtn.addClass('active');
        $pageBtn.find('a').text(i + 1);
        $pageBtn.click(function(event) {
            loadPage($(this).text());
        });
        $pagination.append($pageBtn);
    }
}

function loadPage(num)
{
    $.post($form.attr('action'), $form.serialize() + '&page=' + num)
        .done(function(data) {
            fillTable(data.rows);
            createPagination(data.info.totalCount, rowsPerPage, num);
        });
}

function encodeHtmlEntities(text) {
    var toReplace = {
        '<': '&lt;',
        '>': '&gt;'
    };

    return text.replace(/[<>]/g, function(entity) {
        return toReplace[entity] || entity;
    });
}
