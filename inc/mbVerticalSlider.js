/*
 * ******************************************************************************
 *  jquery.mb.components
 *  file: mbVerticalSlider.js
 *
 *  Copyright (c) 2001-2014. Matteo Bicocchi (Pupunzi);
 *  Open lab srl, Firenze - Italy
 *  email: matteo@open-lab.com
 *  site: 	http://pupunzi.com
 *  blog:	http://pupunzi.open-lab.com
 * 	http://open-lab.com
 *
 *  Licences: MIT, GPL
 *  http://www.opensource.org/licenses/mit-license.php
 *  http://www.gnu.org/licenses/gpl.html
 *
 *  last modified: 07/01/14 22.50
 *  *****************************************************************************
 */

/*
 * Name:jquery.mb.verticalSlider
 * Version: 1.1
 */

(function($) {
  $.vSlider= {
    plugin:"mb.verticalSlider",
    author:"Matteo Bicocchi",
    version:"1.5",
    defaults:{
      template:"",
      totalElements:0,
      height:500,
      width:200,
      slideTimer:1000,
      easing:"swing",
      nextEl:"",
      prevEl:"",
      nextCallback:function(){},
      prevCallback:function(){},
      loadNextCallback:function(){}
    },
    data:{
      elementsPerPage:20,
      actualPage:0
    },
    init: function(options,data){
	    return this.each(function(){
		    if(data==undefined)data={};
		    var $vSlider=$(this);
		    var vSlider=$vSlider.get(0);
		    vSlider.opt={};
		    vSlider.data={};
		    $.extend(vSlider.opt,$.vSlider.defaults,options);
		    $.extend(vSlider.data,$.vSlider.data,data);
		    $.vSlider.isSliding=false;
		    $vSlider.css({width:vSlider.opt.width, height:vSlider.opt.height, overflow:"hidden", position:"relative"});
		    var vSliderContainer=$("<div/>").addClass("vSliderContainer").css({position:"absolute"});
		    $vSlider.wrapInner(vSliderContainer);
		    vSlider.opt.container = $vSlider.find(".vSliderContainer");
		    vSlider.opt.isAjax = vSlider.opt.template && vSlider.opt.template!="";
		    vSlider.opt.pageloaded = new Array();
		    if(vSlider.opt.isAjax){
			    $vSlider.vsLoadNext(true);
		    }else{
			    vSlider.opt.totalElements=vSlider.opt.container.children().length;
		    }
		    $vSlider.vsInitElements();
		    $vSlider.bind('mousewheel', function(event, delta) {
			    if(delta<-1 && !$.vSlider.isSliding && (vSlider.opt.container.outerHeight()>(vSlider.opt.height*vSlider.data.actualPage)+vSlider.opt.height)){
				    $vSlider.vsNextPage();
			    }
			    if(delta>1 && !$.vSlider.isSliding && vSlider.data.actualPage>=0){
				    $vSlider.vsPrevPage();
			    }
			    return false;
		    });
		    $vSlider.vsManageControls(vSlider.data.actualPage);
	    })
    },
    loadNext:function(firstLoad){
      var $vSlider= this;
      var vSlider= $(this).get(0);
      $.ajax({
        url:vSlider.opt.template,
        data:vSlider.data,
        success:function(html){
          var c= $(html).addClass("number_"+vSlider.data.actualPage).attr("pageN",vSlider.data.actualPage);
          vSlider.opt.container.append(c);
          $vSlider.vsInitElements();
          vSlider.opt.pageloaded.push(vSlider.data.actualPage);
          if(vSlider.opt.loadNextCallback) vSlider.opt.loadNextCallback();
          if (firstLoad){
            vSlider.data.actualPage++;
            $vSlider.vsLoadNext();
          }
        }
      })
    },
    initElements:function(){
      var $vSlider= this;
      var vSlider= $(this).get(0);
      vSlider.opt.container.find("li").each(function(){
        $(this).attr("top",Math.floor($(this).position().top)).click(function(){
          vSlider.opt.container.find("li").removeClass("selected");
          $(this).addClass("selected");
          $(this).find("a").blur();
        });
      });

    },
    nextPage: function(){
      if($.vSlider.isSliding) return;
      var $vSlider=this;
      var vSlider = this.get(0);
      var vSliderContainer = $vSlider.find('.vSliderContainer');
      var totalPages= vSlider.opt.totalElements/vSlider.data.elementsPerPage;
      $.vSlider.isSliding=true;
      vSlider.data.actualPage++;
      slide();
      function slide(){
        var topP= vSlider.opt.container.find("li").filter(function(){return $(this).attr("top")<=((vSlider.opt.height-20)*vSlider.data.actualPage)});
        topP=topP.eq(topP.length-1);
        if (vSliderContainer.outerHeight() > (vSlider.opt.height * vSlider.data.actualPage) + vSlider.opt.height)
            vSliderContainer.animate({ top: -(topP.attr("top")) },
                  vSlider.opt.slideTimer,
                  vSlider.opt.easing,
                  function(){
                    $.vSlider.isSliding=false;
                    $vSlider.vsManageControls();
                    if(vSlider.opt.nextCallback) vSlider.opt.nextCallback();
                    if ($.inArray(vSlider.data.actualPage,vSlider.opt.pageloaded)==-1 && vSlider.opt.pageloaded.length<totalPages && vSlider.opt.isAjax)
                      $vSlider.vsLoadNext()
                  });
        else{
            vSliderContainer.animate({ top: -vSliderContainer.outerHeight() + vSlider.opt.height },
                  vSlider.opt.slideTimer,
                  vSlider.opt.easing,
                  function(){
                    $.vSlider.isSliding=false;
                    $vSlider.vsManageControls();
                    if(vSlider.opt.nextCallback) vSlider.opt.nextCallback();
                    if ($.inArray(vSlider.data.actualPage,vSlider.opt.pageloaded)==-1 && vSlider.opt.pageloaded.length<totalPages && vSlider.opt.isAjax)
                      $vSlider.vsLoadNext()
                  });
        }
      }
    },
    prevPage: function () {
        
      if($.vSlider.isSliding) return;
      var $vSlider=this;
      var vSlider = this.get(0);
      var vSliderContainer = $vSlider.find('.vSliderContainer');
      if(vSlider.data.actualPage>=1){
        $.vSlider.isSliding=true;
        vSlider.data.actualPage--;
        var topP = vSliderContainer.find("li").filter(function () { return $(this).attr("top") >= ((vSlider.opt.height - 20) * vSlider.data.actualPage) });
        topP=topP.eq(0);
        vSliderContainer.animate({ top: -(topP.attr("top")) }, vSlider.opt.slideTimer, vSlider.opt.easing,
                function(){
                  $.vSlider.isSliding=false;
                  $vSlider.vsManageControls();
                  if(vSlider.opt.prevCallback) vSlider.opt.prevCallback();
                });
      }

    },
    manageControls: function(){
        var $vSlider = this;
        var vSlider = this.get(0);
        var prevBtn = $(vSlider).siblings(vSlider.opt.prevEl);
        var nextBtn = $(vSlider).siblings(vSlider.opt.nextEl);
      if(vSlider.data.actualPage==0){
          $(prevBtn).attr("disabled", true).addClass("disabled");
          $(nextBtn).attr("disabled", false).removeClass("disabled");
      }else if(vSlider.opt.container.outerHeight()<(vSlider.opt.height*vSlider.data.actualPage)+vSlider.opt.height){
          $(prevBtn).attr("disabled", false).removeClass("disabled");
          $(nextBtn).attr("disabled", true).addClass("disabled");
      }else{
          $(prevBtn).attr("disabled", false).removeClass("disabled");
          $(nextBtn).attr("disabled", false).removeClass("disabled");
      }
    }
  };
  $.fn.mb_vSlider=$.vSlider.init;
  $.fn.vsLoadNext=$.vSlider.loadNext;
  $.fn.vsNextPage=$.vSlider.nextPage;
  $.fn.vsPrevPage=$.vSlider.prevPage;
  $.fn.vsManageControls=$.vSlider.manageControls;
  $.fn.vsInitElements=$.vSlider.initElements;

})(jQuery);


/*mousewheel*/
(function(c){var a=["DOMMouseScroll","mousewheel"];c.event.special.mousewheel={setup:function(){if(this.addEventListener){for(var d=a.length;d;){this.addEventListener(a[--d],b,false)}}else{this.onmousewheel=b}},teardown:function(){if(this.removeEventListener){for(var d=a.length;d;){this.removeEventListener(a[--d],b,false)}}else{this.onmousewheel=null}}};c.fn.extend({mousewheel:function(d){return d?this.bind("mousewheel",d):this.trigger("mousewheel")},unmousewheel:function(d){return this.unbind("mousewheel",d)}});function b(i){var g=i||window.event,f=[].slice.call(arguments,1),j=0,h=true,e=0,d=0;i=c.event.fix(g);i.type="mousewheel";if(i.wheelDelta){j=i.wheelDelta/120}if(i.detail){j=-i.detail/3}d=j;if(g.axis!==undefined&&g.axis===g.HORIZONTAL_AXIS){d=0;e=-1*j}if(g.wheelDeltaY!==undefined){d=g.wheelDeltaY/120}if(g.wheelDeltaX!==undefined){e=-1*g.wheelDeltaX/120}f.unshift(i,j,e,d);return c.event.handle.apply(this,f)}})(jQuery);
