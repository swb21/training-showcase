$.ajax({
    method: "POST",
    url: "http://krapipl.imumk.ru:8082/api/mobilev1/update",
    data: { data: "" }
})
.done(function(response) {
    if (response.result && response.result.toLocaleLowerCase() === 'ok') {
        let courses = response.items,
            coursesBlock = $('.courses');

        // Добавляет курсы на страницу
        courses.forEach(function (course) {
            let courseBlock = $.parseHTML(
                `<div class="card courses__card" data-subject="${course.subject}" data-genre="${course.genre}" data-grade="${course.grade}" data-search="${course.title}">
                    <img class="card__image" src="https://www.imumk.ru/svc/coursecover/${course.courseId}" alt="course image">
                    <div class="card__content">
                        <span class="card__name">${course.title}</span>
                        <p class="card__description">${course.description}</p>
                        <button class="card__button form-control card__button_price-type_rur" data-price="${course.priceBonus}" data-bonuses="${course.priceBonus}">${course.price}</button>
                    </div>
                </div>`);

            coursesBlock.append(courseBlock);
        });

        setTimeout(function () {
            let subjects = [],
                genres = [],
                grades = [];

            courses.forEach(course => {
                subjects.push(course.subject);
                genres.push(course.genre);
                grades = grades.concat(course.grade.split(';'));
            });

            // Добавляет все предметы в select
            subjects = subjects.filter(uniqueValuesFilter);

            let subjectsSelect = $('.filter-form__item[name="subject"]');
            createOptionsAndAppendTo(subjects, subjectsSelect);

            // Добавляет все жанры в select
            genres = genres.filter(uniqueValuesFilter);

            let genresSelect = $('.filter-form__item[name="genre"]');
            createOptionsAndAppendTo(genres, genresSelect);

            // Добавляет все классы в select
            grades = grades.filter(uniqueValuesFilter);
            grades.sort(compareNumeric);

            let gradesSelect = $('.filter-form__item[name="grade"]');
            createOptionsAndAppendTo(grades, gradesSelect);
        }, 0);
    } else {
        console.error('Error: ', response.error);
    }
});

// Вызывает событие submit при изменении значений любых элементов, кроме input
$('.filter-form__form-control').change(function() {
    if ($(this).prop('tagName').toLowerCase() !== 'input') {
        $(this).parent('.filter-form').trigger('submit');
    }
});

// Прячет все курсы, которые не подходят критериям поиска
$('.filter-form').submit(function (event) {
    let formFilters = $(this).serializeArray().filter(filter => {
        return filter['name'] === 'search' || filter['value'] !== 'all';
    });

    let everyCardIsHidden = true;
    $('.courses__card').each(function () {
        let mustHide = false;

        formFilters.forEach(element => {
            if (element['name'] === 'search') {
                console.log(element['value']);
                console.log($(this).data(element['name']));
                let cardSearch = $(this).data(element['name']).toLowerCase();
                if (!cardSearch.includes(element['value'].toLowerCase())) {
                    mustHide = true;
                }
            } else if (element['name'] === 'grade') {
                let grades = $(this).data(element['name']).toString().split(';');
                let result = grades.some(grade => {
                    return grade === element['value'];
                });

                if (!result) {
                    mustHide = true;
                }
            } else {
                if ($(this).data(element['name']) !== element['value']) {
                    mustHide = true;
                }
            }
        });

        if (mustHide && !$(this).hasClass('hidden')) {
            $(this).addClass('hidden');
        }

        if (!mustHide && $(this).hasClass('hidden')) {
            $(this).removeClass('hidden');
        }

        if (!mustHide) {
            everyCardIsHidden = false;
        }
    });

    let coursesMessage = $('.courses__message');
    if (everyCardIsHidden && $(coursesMessage).hasClass('hidden')) {
        $(coursesMessage).removeClass('hidden');
    }
    if (!everyCardIsHidden && !$(coursesMessage).hasClass('hidden')) {
        $(coursesMessage).addClass('hidden');
    }

    event.preventDefault();
});

function uniqueValuesFilter(element, index, array) {
    return array.indexOf(element) === index;
}

function createOptionsAndAppendTo(options, parent) {
    options.forEach(option => {
        parent.append($("<option></option>").attr("value", option).text(option));
    });
}

function compareNumeric(a, b) {
    a = parseInt(a);
    b = parseInt(b);
    if (a > b) return 1;
    if (a < b) return -1;
}