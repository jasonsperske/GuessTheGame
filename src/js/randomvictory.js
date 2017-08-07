/* globals ejs, RandomVictory */
!function(window) {
  "use strict";
  window.RandomVictory = {
    ui: {
      template: function(id, data) {
        var output = $('#'+id),
            template = ejs.compile($('#'+output.data('template')).html());
        output.append(template(data));
      },
      compileTemplate: function(id) {
        return ejs.compile($('#'+id).html());
      }
    }
  };
}(window);
$(function() {
  $('a[role=action_SignOut]').on('click', function(e) {
    e.preventDefault();
    RandomVictory.ui.signout();
  });
});
