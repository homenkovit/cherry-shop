$(document).ready(function () {
  
  $(document).on("click", function (event) {
    if ($(event.target).closest(".nav__dropdown").length) return;
    $(".nav__dropdown").hide();
    $(".nav__link").removeClass("nav__link_active");
    event.stopPropagation();
  });

  $(".nav-toggle").on("click", function (e) {
    $(".nav__dropdown").hide();
    $(".nav__link").removeClass("nav__link_active");
    $(this).next(".nav__dropdown").toggle();
    $(this).addClass("nav__link_active");
    return false;
  });

});