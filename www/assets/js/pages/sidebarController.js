angular.module('armsApp').controller('sidebar', function($scope, $timeout){

    angular.element(document).ready(function(){

        $timeout(function(){ //necessary to access the DOM after apply() (not dirty)

            let navigation = $('.navigation');

            let active_elements = navigation.find('li.active');
            console.log("controller active elements: " + active_elements.length);
            // Hide all nested lists
            navigation.find('li').not('.active, .category-title').has('ul').children('ul').addClass('hidden-ul');
            // Highlight children links
            console.log(navigation.find('li').size());
            navigation.find('li').has('ul').children('a').addClass('has-ul');
            console.log("apps.js dropdown stuff");
            // Add active state to all dropdown parent levels
            $('.dropdown-menu:not(.dropdown-content), .dropdown-menu:not(.dropdown-content) .dropdown-submenu').has('li.active').addClass('active').parents('.navbar-nav .dropdown:not(.language-switch), .navbar-nav .dropup:not(.language-switch)').addClass('active');

            $('.navigation-main > .navigation-header > i').tooltip({
                placement: 'right',
                container: 'body'
            });


            // Main navigation
            $('.navigation-main').find('li').has('ul').children('a').on('click', function (e) {
                e.preventDefault();

                // Collapsible
                $(this).parent('li').not('.disabled').not($('.sidebar-xs').not('.sidebar-xs-indicator').find('.navigation-main').children('li')).toggleClass('active').children('ul').slideToggle(250);

                // Accordion
                if ($('.navigation-main').hasClass('navigation-accordion')) {
                    $(this).parent('li').not('.disabled').not($('.sidebar-xs').not('.sidebar-xs-indicator').find('.navigation-main').children('li')).siblings(':has(.has-ul)').removeClass('active').children('ul').slideUp(250);
                }
            });


            }, 0);

    });

});