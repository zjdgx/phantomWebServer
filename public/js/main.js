$(function(){
  $('input.url').on('keydown', function () {
    $('p.hint').addClass('hide');
  });

  $('.menu').on('click', 'label', function () {
    $(this).next().removeClass('hide');
  });

  $('.menu').on('click', '.options li', function () {
    var $t = $(this),
        menu = $t.parents('.menu');

    $t.parent().prev().html($t.html() + '<i></i>');
    $t.parent().addClass('hide');

    if (menu.hasClass('pcOrwap')) {
      $('.menu.phone').toggleClass('hide', $t.html() == 'PC端');
    }
  });

  $('button').click(function () {
    if ($(this).hasClass('sure')) {
      if ($.trim($('input.url').val()).length > 0) {
        var params = {
              url: $('input').val(),
              selector: $('input.selector').val()
            };

        if (!$('.menu.phone').hasClass('hide')) {
          params['phone'] = $('.menu.phone label').html().replace(/\<\i\>\<\/\i\>/, '');
        }

        $.ajax({
          type: 'POST',
          url: '/img',
          data: params,
          dataType: 'JSON',
          success: function (res) {
            setTimeout(function () {
              var img = document.createElement('img');
              img.src = res.url;
              img.onload = function () {
                $('.result').html(img);
              }
            }, 2000);
          }
        });
      } else {
        $('p.hint').removeClass('hide');
      }
    } else {
      $('input').val('');
    }
  });
});