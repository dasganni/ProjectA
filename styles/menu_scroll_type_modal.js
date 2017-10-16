 
/* Type .js intro */

 $(function() {
  $(".p2").typed({
    strings: ["Reload", "Protect", "Shoot"],
    typeSpeed: 100,
    backSpeed: 50 ,
    backDelay: 3000,
    showCursor: false,
    loop: true
  });
});



/*

remaining code fragment 

$('.hero-down').mousedown(function() {
  TweenMax.fromTo('.btn-react', 0.25, {
    opacity: 0,
    scale: 0
  }, {
    opacity: 0.25,
    scale: 1,
    onComplete: function() {
      TweenMax.to('.btn-react', 0.25, {
        opacity: 0,
        scale: 0
      });
    }
  });
});*/

/* Smotthscroll */
$(document).ready(function () {
    
    // scroll positioning
    $('[data-scroll]').click(function() {
        var a = $($(this).attr('data-scroll')).position();
        a = a.top;
        $('html, body').animate({scrollTop: a}, 500);
    });

  
});


/* Menu trigger */
$(document).ready(menu);

function menu() {
  $('#menu-icon-shape').on('click', function() {
    $('#menu-icon-shape').toggleClass('active');
    $('#top, #middle, #bottom').toggleClass('active');
    $('#overlay-nav').toggleClass('active');
  });
}

/* Modal trigger login/registration */
$(document).ready(function () {
       
  $(".modal-trigger").click(function(e){
    e.preventDefault();
    dataModal = $(this).attr("data-modal");
    $("#" + dataModal).css({"display":"block"});
  });

  $(".close-modal, .modal-sandbox").click(function(){
    $(".modal").css({"display":"none"});
  });

  });



/* Parrallax effect */
$(document).ready(function () {

      var rellax = new Rellax('.rellax', {
        // center: true
        callback: function(position) {
            // callback every position change
            console.log(position);
        }
      });
  });