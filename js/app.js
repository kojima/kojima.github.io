$(function() {
    $('#button').on('click', function(e) {
        e.preventDefault();
        $('#caption').text('Button clicked!');
    });
});